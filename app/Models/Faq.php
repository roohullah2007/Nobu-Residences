<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    public const PAGE_TYPES = [
        'global',
        'home',
        'search',
        'buildings',
        'building_detail',
        'developers',
        'developer_detail',
        'blog',
        'contact',
        'compare',
        'schools',
    ];

    protected $fillable = [
        'question',
        'answer',
        'page_type',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Active, ordered FAQs for a public page: page-specific ones first,
     * then the site-wide 'global' ones.
     */
    public static function forPage(string $pageType)
    {
        return static::active()
            ->whereIn('page_type', $pageType === 'global' ? ['global'] : [$pageType, 'global'])
            ->orderByRaw("CASE WHEN page_type = 'global' THEN 1 ELSE 0 END")
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'question', 'answer', 'page_type']);
    }
}
