<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyAiDescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'mls_id',
        'overview_description',
        'detailed_description',
        'property_data',
        'ai_model'
    ];

    protected $casts = [
        'property_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get description by MLS ID
     */
    public static function getByMlsId($mlsId)
    {
        return self::where('mls_id', $mlsId)->first();
    }

    /**
     * Check if description exists for MLS ID
     */
    public static function existsForMlsId($mlsId)
    {
        return self::where('mls_id', $mlsId)->exists();
    }

    /**
     * Delete description by MLS ID
     */
    public static function deleteByMlsId($mlsId)
    {
        return self::where('mls_id', $mlsId)->delete();
    }
}