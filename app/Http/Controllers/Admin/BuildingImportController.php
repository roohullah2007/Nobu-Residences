<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessBuildingImportChunkJob;
use App\Services\BuildingCsvImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CSV import for buildings: upload → column-to-field mapping → run.
 *
 * The uploaded file is parked in storage/app/building-imports under a random
 * token; the mapping step references it by token so nothing sensitive rides
 * in the client payload.
 */
class BuildingImportController extends Controller
{
    private const STORAGE_DIR = 'building-imports';

    public function __construct(private readonly BuildingCsvImportService $importer)
    {
    }

    /**
     * The import wizard page.
     */
    public function show(): Response
    {
        return Inertia::render('Admin/Buildings/Import', [
            'importableFields' => BuildingCsvImportService::IMPORTABLE_FIELDS,
        ]);
    }

    /**
     * Step 1: receive the CSV, park it, return headers + preview + token.
     */
    public function upload(Request $request): JsonResponse
    {
        // Extension-based check instead of mimes: — Excel-exported CSVs are
        // often sniffed as application/vnd.ms-excel and would fail mimes:csv.
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $extension = strtolower($request->file('file')->getClientOriginalExtension());
        if (!in_array($extension, ['csv', 'txt'], true)) {
            return response()->json(['message' => 'Please upload a .csv file.'], 422);
        }

        $token = Str::uuid()->toString();
        $path = $request->file('file')->storeAs(self::STORAGE_DIR, $token . '.csv');

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
     * Step 2: queue the import with the admin's column mapping. Rows are
     * processed gradually in background chunks (see
     * ProcessBuildingImportChunkJob); the wizard polls progress().
     */
    public function run(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|uuid',
            'mapping' => 'required|array|min:1',
            'mapping.*' => 'string',
            'duplicate_action' => 'required|in:skip,update',
        ]);

        $path = self::STORAGE_DIR . '/' . $validated['token'] . '.csv';
        if (!Storage::exists($path)) {
            return response()->json(['message' => 'Upload expired — please upload the CSV again.'], 404);
        }

        try {
            $this->importer->validateMapping($validated['mapping']);
            $parsed = $this->importer->parse(Storage::path($path));
        } catch (\Throwable $e) {
            Storage::delete($path);
            Log::error('Building CSV import failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 422);
        }

        Cache::put(
            ProcessBuildingImportChunkJob::progressKey($validated['token']),
            [
                'status' => 'queued',
                'total' => $parsed['total_rows'],
                'processed' => 0,
                'created' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => [],
            ],
            now()->addHours(ProcessBuildingImportChunkJob::PROGRESS_TTL_HOURS)
        );

        ProcessBuildingImportChunkJob::dispatch(
            $validated['token'],
            $validated['mapping'],
            $validated['duplicate_action']
        );

        return response()->json([
            'queued' => true,
            'token' => $validated['token'],
            'total' => $parsed['total_rows'],
        ]);
    }

    /**
     * Progress of a queued import, polled by the wizard.
     */
    public function progress(string $token): JsonResponse
    {
        if (!preg_match('/^[0-9a-f-]{36}$/i', $token)) {
            return response()->json(['message' => 'Invalid import token.'], 422);
        }

        $progress = Cache::get(ProcessBuildingImportChunkJob::progressKey($token));
        if (!$progress) {
            return response()->json(['message' => 'Import not found or expired.'], 404);
        }

        return response()->json($progress);
    }
}
