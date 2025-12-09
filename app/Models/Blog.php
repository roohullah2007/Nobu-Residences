<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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

    protected $appends = ['validated_image'];

    /**
     * Get the validated image URL (returns null if image doesn't exist)
     */
    public function getValidatedImageAttribute()
    {
        if (empty($this->attributes['image'])) {
            return null;
        }

        $image = $this->attributes['image'];

        // If it's a public assets path, check public folder
        if (str_starts_with($image, '/assets/') || str_starts_with($image, '/images/')) {
            $publicPath = public_path(ltrim($image, '/'));
            if (file_exists($publicPath)) {
                return $image;
            }
            return null;
        }

        // Check if it's a storage path
        $imagePath = str_replace('/storage/', '', $image);

        if (Storage::disk('public')->exists($imagePath)) {
            return $image;
        }

        return null;
    }

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
