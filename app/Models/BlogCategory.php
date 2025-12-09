<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BlogCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'featured_image',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];

    protected $appends = ['validated_featured_image'];

    /**
     * Get the validated featured image URL (returns null if image doesn't exist)
     */
    public function getValidatedFeaturedImageAttribute()
    {
        if (empty($this->attributes['featured_image'])) {
            return null;
        }

        $image = $this->attributes['featured_image'];

        // If it's an external URL, return as-is
        if (filter_var($image, FILTER_VALIDATE_URL)) {
            return $image;
        }

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
     * Get the blogs for the category.
     */
    public function blogs()
    {
        return $this->hasMany(Blog::class, 'category_id');
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && !$category->isDirty('slug')) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Scope for active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordered categories.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc');
    }
}
