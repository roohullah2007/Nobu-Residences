<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class ContactForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'message',
        'inquiry_categories',
        'ip_address',
        'user_agent',
        'is_read',
        'submitted_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    /**
     * Get the user that made the contact inquiry
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get inquiry categories as array
     */
    public function getInquiryCategoriesArrayAttribute()
    {
        return explode(',', $this->inquiry_categories);
    }

    /**
     * Get formatted inquiry categories
     */
    public function getFormattedCategoriesAttribute()
    {
        $categories = $this->inquiry_categories_array;
        $formatted = [];
        
        foreach ($categories as $category) {
            $formatted[] = ucfirst($category);
        }
        
        return implode(', ', $formatted);
    }

    /**
     * Scope for unread contacts
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for recent contacts
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', Carbon::now()->subDays($days));
    }

    /**
     * Mark as read
     */
    public function markAsRead()
    {
        $this->update(['is_read' => true]);
    }

    /**
     * Get time ago format
     */
    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}
