<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BuildingImport;
use App\Services\BuildingCsvImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CSV import for buildings: upload → column-to-field mapping → run.
 *
 * The CSV is uploaded in small parts (~1.5 MB each) so the request body
 * always fits within php.ini's post_max_size / upload_max_filesize, then
 * parked in storage/app/building-imports under a random token; the mapping
 * step references it by token so nothing sensitive rides in the client
 * payload.
 *
 * Rows are imported by the wizard calling process() repeatedly — each call
 * synchronously imports one chunk of rows — so the import needs no queue
 * worker to make progress. Progress lives in the cache under the token.
 */
class BuildingImportController extends Controller
{
    private const STORAGE_DIR = 'building-imports';
    private const MAX_CSV_BYTES = 25 * 1024 * 1024;
    private const ROWS_PER_CHUNK = 200;
    private const PROGRESS_TTL_HOURS = 12;
    private const MAX_STORED_ERRORS = 200;

    public function __construct(private readonly BuildingCsvImportService $importer)
    {
    }

    public static function progressKey(string $token): string
    {
        return "building-import:{$token}";
    }

    /**
     * The import wizard page.
     */
    public function show(): Response
    {
        return Inertia::render('Admin/Buildings/Import', [
            'importableFields' => BuildingCsvImportService::IMPORTABLE_FIELDS,
            'history' => $this->historyRows(),
        ]);
    }

    /**
     * Recent imports for the wizard's Import History section. A running
     * import is resumable only while its progress cache and parked CSV are
     * both still around (12h) — otherwise it surfaces as interrupted.
     */
    private function historyRows(): array
    {
        return BuildingImport::query()
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (BuildingImport $import) => [
                'id' => $import->id,
                'token' => $import->token,
                'filename' => $import->filename,
                'status' => $import->status,
                'duplicate_action' => $import->duplicate_action,
                'total_rows' => $import->total_rows,
                'processed' => $import->processed,
                'created_count' => $import->created_count,
                'updated_count' => $import->updated_count,
                'skipped_count' => $import->skipped_count,
                'error_count' => $import->error_count,
                'errors' => $import->errors ?? [],
                'message' => $import->message,
                'started_at' => $import->started_at?->toIso8601String(),
                'finished_at' => $import->finished_at?->toIso8601String(),
                'resumable' => $import->isRunning()
                    && Cache::has(self::progressKey($import->token))
                    && Storage::exists(self::STORAGE_DIR . '/' . $import->token . '.csv'),
            ])
            ->all();
    }

    /**
     * Step 1: receive one part of the CSV and append it to the parked file.
     * The final part ("last") triggers parsing and returns headers + preview
     * + token for the mapping step; earlier parts just return the token.
     */
    public function upload(Request $request): JsonResponse
    {
        // When a request body exceeds post_max_size PHP silently discards
        // the ENTIRE body ($_POST and $_FILES come up empty) and Laravel
        // surfaces a misleading "CSRF token mismatch". Catch that case and
        // say what actually happened. (The wizard now uploads in ~1.5 MB
        // parts, so this only fires for clients bypassing the wizard.)
        if (empty($_POST) && empty($_FILES) && (int) $request->server('CONTENT_LENGTH') > 0) {
            return response()->json([
                'message' => sprintf(
                    'The upload was larger than this server accepts in one request (post_max_size = %s). Please refresh the page and try again.',
                    ini_get('post_max_size') ?: 'unknown'
                ),
            ], 413);
        }

        // Extension-based check instead of mimes: — Excel-exported CSVs are
        // often sniffed as application/vnd.ms-excel and would fail mimes:csv.
        $request->validate([
            'chunk' => 'required|file|max:4096',
            'token' => 'nullable|uuid',
            'offset' => 'required|integer|min:0',
            'last' => 'required|boolean',
        ]);

        $chunk = $request->file('chunk');
        $extension = strtolower($chunk->getClientOriginalExtension());
        if (!in_array($extension, ['csv', 'txt'], true)) {
            return response()->json(['message' => 'Please upload a .csv file.'], 422);
        }

        $token = $request->input('token') ?: Str::uuid()->toString();
        $partRelative = self::STORAGE_DIR . '/' . $token . '.csv.part';

        Storage::makeDirectory(self::STORAGE_DIR);
        $partPath = Storage::path($partRelative);

        // Parts are sent sequentially; the offset must line up with what has
        // been written so far, otherwise the assembled file would be corrupt.
        $currentSize = is_file($partPath) ? filesize($partPath) : 0;
        $offset = (int) $request->input('offset');
        if ($offset !== $currentSize) {
            Storage::delete($partRelative);
            return response()->json(['message' => 'The upload got out of sync — please try again.'], 409);
        }

        file_put_contents($partPath, file_get_contents($chunk->getRealPath()), $offset > 0 ? FILE_APPEND : 0);

        if (filesize($partPath) > self::MAX_CSV_BYTES) {
            Storage::delete($partRelative);
            return response()->json(['message' => 'The CSV is larger than the 25MB import limit.'], 422);
        }

        if (!$request->boolean('last')) {
            return response()->json(['token' => $token, 'received' => filesize($partPath)]);
        }

        $path = self::STORAGE_DIR . '/' . $token . '.csv';
        Storage::move($partRelative, $path);

        try {
            $parsed = $this->importer->parse(Storage::path($path));
        } catch (\Throwable $e) {
            Storage::delete($path);
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'token' => $token,
            'headers' => $parsed['headers'],
            'preview' => $parsed['preview'],
            'total_rows' => $parsed['total_rows'],
        ]);
    }

    /**
     * Step 2: validate the admin's column mapping and seed the progress
     * state. Rows are then imported chunk by chunk via process(), driven by
     * the wizard — no queue worker required.
     */
    public function run(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|uuid',
            'filename' => 'nullable|string|max:255',
            'mapping' => 'required|array|min:1',
            'mapping.*' => 'string',
            'duplicate_action' => 'required|in:skip,update',
        ]);

        $path = self::STORAGE_DIR . '/' . $validated['token'] . '.csv';
        if (!Storage::exists($path)) {
            return response()->json(['message' => 'Upload expired — please upload the CSV again.'], 404);
        }

        try {
            $mapping = $this->importer->validateMapping($validated['mapping']);
            $parsed = $this->importer->parse(Storage::path($path));
        } catch (\Throwable $e) {
            Storage::delete($path);
            Log::error('Building CSV import failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $this->storeProgress($validated['token'], [
            'status' => 'queued',
            'total' => $parsed['total_rows'],
            'processed' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => [],
            // Internal state for process(); stripped from responses.
            'mapping' => $mapping,
            'duplicate_action' => $validated['duplicate_action'],
        ]);

        // Permanent history record — outlives the 12h progress cache.
        BuildingImport::updateOrCreate(
            ['token' => $validated['token']],
            [
                'filename' => $validated['filename'] ?? null,
                'status' => BuildingImport::STATUS_QUEUED,
                'duplicate_action' => $validated['duplicate_action'],
                'total_rows' => $parsed['total_rows'],
                'processed' => 0,
                'created_count' => 0,
                'updated_count' => 0,
                'skipped_count' => 0,
                'error_count' => 0,
                'errors' => [],
                'message' => null,
                'started_at' => now(),
                'finished_at' => null,
            ]
        );

        return response()->json([
            'queued' => true,
            'token' => $validated['token'],
            'total' => $parsed['total_rows'],
        ]);
    }

    /**
     * Step 3: import the next chunk of rows. The wizard calls this endpoint
     * repeatedly until the returned status is finished/failed, so a 13k-row
     * file is worked through in ~200-row synchronous slices without relying
     * on a queue worker.
     */
    public function process(string $token): JsonResponse
    {
        if (!preg_match('/^[0-9a-f-]{36}$/i', $token)) {
            return response()->json(['message' => 'Invalid import token.'], 422);
        }

        $progress = Cache::get(self::progressKey($token));
        if (!$progress) {
            return response()->json(['message' => 'Import not found or expired.'], 404);
        }
        if (in_array($progress['status'], ['finished', 'failed'], true)) {
            return response()->json($this->publicProgress($progress));
        }

        // One chunk at a time per import — a second concurrent call (double
        // click, second tab) just gets the current progress back.
        $lock = Cache::lock('building-import-lock:' . $token, 120);
        if (!$lock->get()) {
            return response()->json($this->publicProgress($progress));
        }

        try {
            // Re-read inside the lock so we continue from the real offset.
            $progress = Cache::get(self::progressKey($token)) ?? $progress;
            $relativePath = self::STORAGE_DIR . '/' . $token . '.csv';

            if (!Storage::exists($relativePath)) {
                $progress['status'] = 'failed';
                $progress['message'] = 'Upload expired before the import finished.';
                $this->storeProgress($token, $progress);
                $this->syncHistory($token, $progress);
                return response()->json($this->publicProgress($progress));
            }

            $result = $this->importer->importChunk(
                Storage::path($relativePath),
                $progress['mapping'],
                $progress['duplicate_action'],
                $progress['processed'],
                self::ROWS_PER_CHUNK
            );

            $progress['processed'] += $result['processed'];
            $progress['created'] += $result['created'];
            $progress['updated'] += $result['updated'];
            $progress['skipped'] += $result['skipped'];
            $progress['errors'] = array_slice(
                ($progress['errors'] ?? []) + $result['errors'],
                0,
                self::MAX_STORED_ERRORS,
                true
            );
            $progress['status'] = $result['done'] ? 'finished' : 'processing';

            if ($result['done']) {
                Storage::delete($relativePath);
                Log::info('Building CSV import finished', [
                    'token' => $token,
                    'created' => $progress['created'],
                    'updated' => $progress['updated'],
                    'skipped' => $progress['skipped'],
                    'error_count' => count($progress['errors']),
                ]);
            }

            $this->storeProgress($token, $progress);
            $this->syncHistory($token, $progress);
        } catch (\Throwable $e) {
            Log::error('Building CSV import chunk failed', [
                'token' => $token,
                'offset' => $progress['processed'] ?? 0,
                'error' => $e->getMessage(),
            ]);
            $progress['status'] = 'failed';
            $progress['message'] = $e->getMessage();
            $this->storeProgress($token, $progress);
            $this->syncHistory($token, $progress);
            Storage::delete(self::STORAGE_DIR . '/' . $token . '.csv');
        } finally {
            $lock->release();
        }

        return response()->json($this->publicProgress($progress));
    }

    /**
     * Progress of a running import, polled by the wizard.
     */
    public function progress(string $token): JsonResponse
    {
        if (!preg_match('/^[0-9a-f-]{36}$/i', $token)) {
            return response()->json(['message' => 'Invalid import token.'], 422);
        }

        $progress = Cache::get(self::progressKey($token));
        if (!$progress) {
            return response()->json(['message' => 'Import not found or expired.'], 404);
        }

        return response()->json($this->publicProgress($progress));
    }

    private function storeProgress(string $token, array $progress): void
    {
        Cache::put(self::progressKey($token), $progress, now()->addHours(self::PROGRESS_TTL_HOURS));
    }

    /** Mirror cache progress onto the permanent history row (one write per chunk). */
    private function syncHistory(string $token, array $progress): void
    {
        $isDone = in_array($progress['status'], ['finished', 'failed'], true);

        BuildingImport::where('token', $token)->update([
            'status' => $progress['status'] === 'queued' ? BuildingImport::STATUS_PROCESSING : $progress['status'],
            'total_rows' => $progress['total'] ?? 0,
            'processed' => $progress['processed'] ?? 0,
            'created_count' => $progress['created'] ?? 0,
            'updated_count' => $progress['updated'] ?? 0,
            'skipped_count' => $progress['skipped'] ?? 0,
            'error_count' => count($progress['errors'] ?? []),
            'errors' => $progress['errors'] ?? [],
            'message' => $progress['message'] ?? null,
            'finished_at' => $isDone ? now() : null,
        ]);
    }

    /** Progress payload without the internal mapping/duplicate-action state. */
    private function publicProgress(array $progress): array
    {
        return Arr::except($progress, ['mapping', 'duplicate_action']);
    }
}
