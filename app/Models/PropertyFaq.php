<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyFaq extends Model
{
    use HasFactory;

    protected $fillable = [
        'mls_id',
        'question',
        'answer',
        'order',
        'is_active',
        'ai_model'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get FAQs by MLS ID
     */
    public static function getByMlsId($mlsId)
    {
        return self::where('mls_id', $mlsId)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }

    /**
     * Get active FAQs for MLS ID
     */
    public static function getActiveByMlsId($mlsId)
    {
        return self::where('mls_id', $mlsId)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }

    /**
     * Check if FAQs exist for MLS ID
     */
    public static function existsForMlsId($mlsId)
    {
        return self::where('mls_id', $mlsId)->exists();
    }

    /**
     * Delete FAQs by MLS ID
     */
    public static function deleteByMlsId($mlsId)
    {
        return self::where('mls_id', $mlsId)->delete();
    }

    /**
     * Scope for active FAQs
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordered FAQs
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}