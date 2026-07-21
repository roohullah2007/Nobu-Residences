<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * One CSV building import run — the permanent counterpart of the 12h
 * progress cache, shown in the Import History section of the wizard.
 */
class BuildingImport extends Model
{
    public const STATUS_QUEUED = 'queued';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_FINISHED = 'finished';
    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'token',
        'filename',
        'status',
        'duplicate_action',
        'total_rows',
        'processed',
        'created_count',
        'updated_count',
        'skipped_count',
        'error_count',
        'errors',
        'message',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'errors' => 'array',
        'total_rows' => 'integer',
        'processed' => 'integer',
        'created_count' => 'integer',
        'updated_count' => 'integer',
        'skipped_count' => 'integer',
        'error_count' => 'integer',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function isRunning(): bool
    {
        return in_array($this->status, [self::STATUS_QUEUED, self::STATUS_PROCESSING], true);
    }
}
