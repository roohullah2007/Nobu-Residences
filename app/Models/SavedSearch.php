<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedSearch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'search_params',
        'email_alerts',
        'frequency',
        'last_alert_sent',
        'results_count'
    ];

    protected $casts = [
        'search_params' => 'array',
        'email_alerts' => 'boolean',
        'last_alert_sent' => 'datetime',
        'frequency' => 'integer',
        'results_count' => 'integer'
    ];

    /**
     * Get the user that owns the saved search
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for searches with email alerts enabled
     */
    public function scopeWithEmailAlerts($query)
    {
        return $query->where('email_alerts', true);
    }

    /**
     * Get the formatted search criteria for display
     */
    public function getFormattedCriteriaAttribute()
    {
        $criteria = [];
        $params = $this->search_params;

        if (!empty($params['query'])) {
            $criteria[] = "Search: {$params['query']}";
        }

        if (!empty($params['status']) && $params['status'] !== 'For Sale') {
            $criteria[] = "Status: {$params['status']}";
        }

        if (!empty($params['property_type']) && count($params['property_type']) > 0) {
            $criteria[] = "Type: " . implode(', ', $params['property_type']);
        }

        if (!empty($params['price_min']) && $params['price_min'] > 0) {
            $criteria[] = "Min Price: $" . number_format($params['price_min']);
        }

        if (!empty($params['price_max']) && $params['price_max'] > 0 && $params['price_max'] < 10000000) {
            $criteria[] = "Max Price: $" . number_format($params['price_max']);
        }

        if (!empty($params['bedrooms']) && $params['bedrooms'] > 0) {
            $criteria[] = "Beds: {$params['bedrooms']}+";
        }

        if (!empty($params['bathrooms']) && $params['bathrooms'] > 0) {
            $criteria[] = "Baths: {$params['bathrooms']}+";
        }

        return implode(' • ', $criteria) ?: 'All Properties';
    }

    /**
     * Update the last alert sent timestamp
     */
    public function updateLastAlertSent()
    {
        $this->update(['last_alert_sent' => now()]);
    }
}
