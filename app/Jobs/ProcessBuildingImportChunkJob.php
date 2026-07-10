<?php

namespace App\Jobs;

use App\Services\BuildingCsvImportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Processes one chunk of a buildings CSV import, then re-dispatches itself
 * (with a small delay) for the next chunk until the file is exhausted.
 * Progress lives in the cache under the upload token so the import wizard
 * can poll it, and the parked CSV is deleted once the run finishes.
 */
class ProcessBuildingImportChunkJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public const CHUNK_SIZE = 25;
    public const CHUNK_DELAY_SECONDS = 10;
    public const PROGRESS_TTL_HOURS = 12;

    public int $tries = 3;

    public int $timeout = 300;

    public function __construct(
        public string $token,
        public array $mapping,
        public string $duplicateAction,
        public int $offset = 0,
    ) {
    }

    public static function progressKey(string $token): string
    {
        return "building-import:{$token}";
    }

    public function handle(BuildingCsvImportService $importer): void
    {
        $relativePath = 'building-imports/' . $this->token . '.csv';
        $progress = Cache::get(self::progressKey($this->token));

        if (!$progress || !Storage::exists($relativePath)) {
            $this->storeProgress(array_merge($progress ?? [], [
                'status' => 'failed',
                'message' => 'Upload expired before the import finished.',
            ]));
            return;
        }

        $result = $importer->importChunk(
            Storage::path($relativePath),
            $this->mapping,
            $this->duplicateAction,
            $this->offset,
            self::CHUNK_SIZE
        );

        $progress['processed'] = $this->offset + $result['processed'];
        $progress['created'] += $result['created'];
        $progress['updated'] += $result['updated'];
        $progress['skipped'] += $result['skipped'];
        $progress['errors'] = ($progress['errors'] ?? []) + $result['errors'];

        if ($result['done']) {
            $progress['status'] = 'finished';
            Storage::delete($relativePath);
            Log::info('Building CSV import finished', [
                'token' => $this->token,
                'created' => $progress['created'],
                'updated' => $progress['updated'],
                'skipped' => $progress['skipped'],
                'error_count' => count($progress['errors']),
            ]);
        } else {
            $progress['status'] = 'processing';
        }

        $this->storeProgress($progress);

        if (!$result['done']) {
            self::dispatch($this->token, $this->mapping, $this->duplicateAction, $progress['processed'])
                ->delay(now()->addSeconds(self::CHUNK_DELAY_SECONDS));
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('Building CSV import chunk failed', [
            'token' => $this->token,
            'offset' => $this->offset,
            'error' => $e->getMessage(),
        ]);

        $progress = Cache::get(self::progressKey($this->token), []);
        $this->storeProgress(array_merge($progress, ['status' => 'failed', 'message' => $e->getMessage()]));
        Storage::delete('building-imports/' . $this->token . '.csv');
    }

    private function storeProgress(array $progress): void
    {
        Cache::put(self::progressKey($this->token), $progress, now()->addHours(self::PROGRESS_TTL_HOURS));
    }
}
