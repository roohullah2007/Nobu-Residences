<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedSearchAlertHistory extends Model
{
    use HasFactory;

    protected $table = 'saved_search_alert_history';

    protected $fillable = [
        'saved_search_id',
        'user_id',
        'listings_count',
        'listing_keys',
        'status',
        'error_message',
        'sent_at',
    ];

    protected $casts = [
        'listing_keys' => 'array',
        'listings_count' => 'integer',
        'sent_at' => 'datetime',
    ];

    /**
     * Get the saved search that owns this alert history
     */
    public function savedSearch()
    {
        return $this->belongsTo(SavedSearch::class);
    }

    /**
     * Get the user that received this alert
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for successful alerts
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Scope for failed alerts
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope for alerts within a date range
     */
    public function scopeWithinDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('sent_at', [$startDate, $endDate]);
    }

    /**
     * Create a new alert history record
     */
    public static function recordAlert(
        SavedSearch $savedSearch,
        array $listingKeys,
        string $status = 'sent',
        ?string $errorMessage = null
    ): self {
        return self::create([
            'saved_search_id' => $savedSearch->id,
            'user_id' => $savedSearch->user_id,
            'listings_count' => count($listingKeys),
            'listing_keys' => $listingKeys,
            'status' => $status,
            'error_message' => $errorMessage,
            'sent_at' => now(),
        ]);
    }
}
