<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyEnquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'message',
        'property_listing_key',
        'property_address',
        'property_price',
        'property_type',
        'property_mls',
        'ip_address',
        'user_agent',
        'is_read',
        'responded_at',
        'response_notes'
    ];

    protected $casts = [
        'property_price' => 'decimal:2',
        'is_read' => 'boolean',
        'responded_at' => 'datetime'
    ];

    /**
     * Get the user who made the enquiry
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for unread enquiries
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for read enquiries
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Scope for pending response
     */
    public function scopePending($query)
    {
        return $query->whereNull('responded_at');
    }

    /**
     * Scope for responded
     */
    public function scopeResponded($query)
    {
        return $query->whereNotNull('responded_at');
    }

    /**
     * Mark as read
     */
    public function markAsRead()
    {
        $this->update(['is_read' => true]);
    }

    /**
     * Mark as responded
     */
    public function markAsResponded($notes = null)
    {
        $this->update([
            'responded_at' => now(),
            'response_notes' => $notes
        ]);
    }
}