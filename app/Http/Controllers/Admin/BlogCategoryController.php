<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BlogCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = BlogCategory::ordered()
            ->withCount('blogs')
            ->paginate(10);

        return Inertia::render('Admin/BlogCategories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/BlogCategories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_categories,name',
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug',
            'description' => 'nullable|string',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer'
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $imagePath = $request->file('featured_image')->store('category-images', 'public');
            $validated['featured_image'] = '/storage/' . $imagePath;
        }

        BlogCategory::create($validated);

        return redirect()->route('admin.blog-categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(BlogCategory $blogCategory)
    {
        $blogCategory->load('blogs');

        return Inertia::render('Admin/BlogCategories/Show', [
            'category' => $blogCategory
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BlogCategory $blogCategory)
    {
        $blogCategory->loadCount('blogs');

        return Inertia::render('Admin/BlogCategories/Edit', [
            'category' => $blogCategory
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BlogCategory $blogCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_categories,name,' . $blogCategory->id,
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug,' . $blogCategory->id,
            'description' => 'nullable|string',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
            'remove_image' => 'nullable|boolean'
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle image removal
        if ($request->has('remove_image') && $request->boolean('remove_image')) {
            // Delete old image if exists and it's a local file (not URL)
            if ($blogCategory->featured_image && !filter_var($blogCategory->featured_image, FILTER_VALIDATE_URL)) {
                if (Storage::disk('public')->exists(str_replace('/storage/', '', $blogCategory->featured_image))) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $blogCategory->featured_image));
                }
            }
            $validated['featured_image'] = null;
        }
        // Handle featured image upload
        elseif ($request->hasFile('featured_image')) {
            // Delete old image if exists and it's a local file (not URL)
            if ($blogCategory->featured_image && !filter_var($blogCategory->featured_image, FILTER_VALIDATE_URL)) {
                if (Storage::disk('public')->exists(str_replace('/storage/', '', $blogCategory->featured_image))) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $blogCategory->featured_image));
                }
            }

            $imagePath = $request->file('featured_image')->store('category-images', 'public');
            $validated['featured_image'] = '/storage/' . $imagePath;
        }
        // If no new image and not removing, keep existing image
        else {
            unset($validated['featured_image']);
        }

        // Remove the remove_image flag from validated data
        unset($validated['remove_image']);

        $blogCategory->update($validated);

        return redirect()->route('admin.blog-categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BlogCategory $blogCategory)
    {
        // Check if category has blogs
        if ($blogCategory->blogs()->count() > 0) {
            return back()->with('error', 'Cannot delete category with associated blogs. Please reassign or delete the blogs first.');
        }

        // Delete image if exists
        if ($blogCategory->featured_image && Storage::disk('public')->exists(str_replace('/storage/', '', $blogCategory->featured_image))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $blogCategory->featured_image));
        }

        $blogCategory->delete();

        return redirect()->route('admin.blog-categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}