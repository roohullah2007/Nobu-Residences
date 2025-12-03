<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * MLS Sync State Model
 *
 * Tracks the state of MLS synchronization including:
 * - Current batch offset for initial load
 * - Sync mode (initial vs incremental)
 * - Sync completion status
 * - Sync statistics
 */
class MLSSyncState extends Model
{
    protected $table = 'mls_sync_state';

    protected $fillable = [
        'sync_mode',
        'current_batch_offset',
        'batch_size',
        'total_properties_synced',
        'initial_sync_complete',
        'initial_sync_completed_at',
        'last_sync_started_at',
        'last_sync_completed_at',
        'current_run_synced',
        'current_run_updated',
        'current_run_failed',
        'current_run_status_changed',
        'sync_status',
        'last_error',
        'sync_metadata',
    ];

    protected $casts = [
        'current_batch_offset' => 'integer',
        'batch_size' => 'integer',
        'total_properties_synced' => 'integer',
        'initial_sync_complete' => 'boolean',
        'initial_sync_completed_at' => 'datetime',
        'last_sync_started_at' => 'datetime',
        'last_sync_completed_at' => 'datetime',
        'current_run_synced' => 'integer',
        'current_run_updated' => 'integer',
        'current_run_failed' => 'integer',
        'current_run_status_changed' => 'integer',
        'sync_metadata' => 'array',
    ];

    /**
     * Get the singleton sync state instance
     */
    public static function getInstance(): self
    {
        $state = self::first();

        if (!$state) {
            $state = self::create([
                'sync_mode' => 'initial_load',
                'current_batch_offset' => 0,
                'batch_size' => 100,
                'sync_status' => 'idle',
            ]);
        }

        return $state;
    }

    /**
     * Check if currently syncing
     */
    public function isSyncing(): bool
    {
        return $this->sync_status === 'running';
    }

    /**
     * Check if initial sync is needed
     */
    public function needsInitialSync(): bool
    {
        return !$this->initial_sync_complete;
    }

    /**
     * Check if should use incremental sync
     */
    public function shouldUseIncrementalSync(): bool
    {
        return $this->initial_sync_complete && $this->sync_mode === 'incremental';
    }

    /**
     * Start a new sync run
     */
    public function startSync(string $mode = null): void
    {
        $this->update([
            'sync_status' => 'running',
            'last_sync_started_at' => now(),
            'sync_mode' => $mode ?? $this->sync_mode,
            'current_run_synced' => 0,
            'current_run_updated' => 0,
            'current_run_failed' => 0,
            'current_run_status_changed' => 0,
            'last_error' => null,
        ]);
    }

    /**
     * Complete sync run successfully
     * Note: Does NOT automatically mark initial sync as complete
     * Call markInitialSyncComplete() explicitly when reaching end of listings
     */
    public function completeSync(): void
    {
        $this->update([
            'sync_status' => 'idle',
            'last_sync_completed_at' => now(),
            'last_error' => null,
        ]);
    }

    /**
     * Mark sync as failed
     */
    public function failSync(string $error): void
    {
        $this->update([
            'sync_status' => 'failed',
            'last_error' => $error,
        ]);
    }

    /**
     * Increment batch offset
     */
    public function incrementOffset(int $amount): void
    {
        $this->increment('current_batch_offset', $amount);
    }

    /**
     * Reset offset (when reaching API limit or starting fresh)
     */
    public function resetOffset(): void
    {
        $this->update(['current_batch_offset' => 0]);
    }

    /**
     * Update sync statistics for current run
     */
    public function updateRunStats(array $stats): void
    {
        $updates = [];

        if (isset($stats['synced'])) {
            $updates['current_run_synced'] = $this->current_run_synced + $stats['synced'];
            $updates['total_properties_synced'] = $this->total_properties_synced + $stats['synced'];
        }

        if (isset($stats['updated'])) {
            $updates['current_run_updated'] = $this->current_run_updated + $stats['updated'];
        }

        if (isset($stats['failed'])) {
            $updates['current_run_failed'] = $this->current_run_failed + $stats['failed'];
        }

        if (isset($stats['status_changed'])) {
            $updates['current_run_status_changed'] = $this->current_run_status_changed + $stats['status_changed'];
        }

        if (!empty($updates)) {
            $this->update($updates);
        }
    }

    /**
     * Mark initial sync as complete
     */
    public function markInitialSyncComplete(): void
    {
        $this->update([
            'initial_sync_complete' => true,
            'initial_sync_completed_at' => now(),
            'sync_mode' => 'incremental',
            'current_batch_offset' => 0,
        ]);
    }

    /**
     * Reset to initial load mode (use carefully!)
     */
    public function resetToInitialLoad(): void
    {
        $this->update([
            'sync_mode' => 'initial_load',
            'current_batch_offset' => 0,
            'initial_sync_complete' => false,
            'initial_sync_completed_at' => null,
            'sync_status' => 'idle',
        ]);
    }

    /**
     * Get sync progress percentage (for initial load)
     */
    public function getProgressPercentage(int $totalExpected = 15000): float
    {
        if ($this->initial_sync_complete) {
            return 100.0;
        }

        return min(100, ($this->current_batch_offset / $totalExpected) * 100);
    }

    /**
     * Get human-readable sync status
     */
    public function getStatusMessage(): string
    {
        if ($this->isSyncing()) {
            return "Syncing in progress - {$this->sync_mode} mode";
        }

        if ($this->sync_status === 'failed') {
            return "Last sync failed: " . $this->last_error;
        }

        if ($this->initial_sync_complete) {
            return "Initial sync complete - Using incremental mode";
        }

        return "Awaiting initial sync - {$this->current_batch_offset} properties processed";
    }
}
