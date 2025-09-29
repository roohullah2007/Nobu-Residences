<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $query = Blog::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('content', 'LIKE', "%{$search}%")
                  ->orWhere('category', 'LIKE', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $query->where('category', $request->get('category'));
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $blogs = $query->orderBy('created_at', 'desc')->paginate(15);

        // Get unique categories for filter dropdown
        $categories = Blog::distinct()->pluck('category')->filter()->values();

        return Inertia::render('Admin/Blog/Index', [
            'blogs' => $blogs,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status'])
        ]);
    }

    public function create()
    {
        $categories = BlogCategory::active()->ordered()->get();

        return Inertia::render('Admin/Blog/Create', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:100',
            'category_id' => 'nullable|exists:blog_categories,id',
            'status' => 'required|in:draft,published',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:300',
        ]);

        // Generate slug
        $validated['slug'] = Str::slug($validated['title']);

        // Ensure unique slug
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Blog::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('blog-images', 'public');
            $validated['image'] = '/storage/' . $imagePath;
        }

        // Set author
        $validated['author'] = auth()->user()->name ?? 'Admin';

        // Set published_at if status is published
        if ($validated['status'] === 'published') {
            $validated['published_at'] = now();
        }

        Blog::create($validated);

        return redirect()->route('admin.blog.index')
                        ->with('success', 'Blog post created successfully.');
    }

    public function show(Blog $blog)
    {
        return Inertia::render('Admin/Blog/Show', [
            'blog' => $blog
        ]);
    }

    public function edit(Blog $blog)
    {
        $categories = BlogCategory::active()->ordered()->get();

        return Inertia::render('Admin/Blog/Edit', [
            'blog' => $blog->load('blogCategory'),
            'categories' => $categories
        ]);
    }

    public function update(Request $request, Blog $blog)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:100',
            'category_id' => 'nullable|exists:blog_categories,id',
            'status' => 'required|in:draft,published',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:20480',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:300',
            'remove_image' => 'nullable|boolean',
        ]);

        // Update slug if title changed
        if ($blog->title !== $validated['title']) {
            $validated['slug'] = Str::slug($validated['title']);

            // Ensure unique slug
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Blog::where('slug', $validated['slug'])->where('id', '!=', $blog->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Handle image removal
        if ($request->has('remove_image') && $request->boolean('remove_image')) {
            // Delete old image if exists
            if ($blog->image && Storage::disk('public')->exists(str_replace('/storage/', '', $blog->image))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $blog->image));
            }
            $validated['image'] = null;
        }
        // Handle image upload
        elseif ($request->hasFile('image')) {
            // Delete old image if exists
            if ($blog->image && Storage::disk('public')->exists(str_replace('/storage/', '', $blog->image))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $blog->image));
            }

            $imagePath = $request->file('image')->store('blog-images', 'public');
            $validated['image'] = '/storage/' . $imagePath;
        }
        // If no new image and not removing, keep existing image
        else {
            unset($validated['image']);
        }

        // Remove the remove_image flag from validated data
        unset($validated['remove_image']);

        // Set published_at if status changed to published and wasn't published before
        if ($validated['status'] === 'published' && $blog->status !== 'published') {
            $validated['published_at'] = now();
        }

        $blog->update($validated);

        return redirect()->route('admin.blog.index')
                        ->with('success', 'Blog post updated successfully.');
    }

    public function destroy(Blog $blog)
    {
        // Delete image if exists
        if ($blog->image && Storage::disk('public')->exists(str_replace('/storage/', '', $blog->image))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $blog->image));
        }

        $blog->delete();

        return redirect()->route('admin.blog.index')
                        ->with('success', 'Blog post deleted successfully.');
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:blogs,id'
        ]);

        $blogs = Blog::whereIn('id', $validated['ids'])->get();

        // Delete images
        foreach ($blogs as $blog) {
            if ($blog->image && Storage::disk('public')->exists(str_replace('/storage/', '', $blog->image))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $blog->image));
            }
        }

        Blog::whereIn('id', $validated['ids'])->delete();

        return redirect()->route('admin.blog.index')
                        ->with('success', 'Selected blog posts deleted successfully.');
    }
}