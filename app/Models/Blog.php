<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'image',
        'category',
        'category_id',
        'author',
        'is_published',
        'published_at',
        'views'
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'views' => 'integer'
    ];

    /**
     * Get the category that owns the blog.
     */
    public function blogCategory()
    {
        return $this->belongsTo(BlogCategory::class, 'category_id');
    }

    // Scope to get only published blogs
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    // Get reading time estimate
    public function getReadingTimeAttribute()
    {
        $words = str_word_count(strip_tags($this->content));
        $minutes = ceil($words / 200); // Average reading speed
        return $minutes . ' min read';
    }
}
