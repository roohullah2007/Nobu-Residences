<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Website;
use App\Models\WebsitePage;
use App\Models\Icon;
use App\Models\AgentInfo;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class WebsiteManagementController extends Controller
{
    /**
     * Display websites listing
     */
    public function index(): Response
    {
        $websites = Website::with('pages')->orderBy('is_default', 'desc')->orderBy('name')->get();

        return Inertia::render('Admin/Websites/Index', [
            'title' => 'Website Management',
            'websites' => $websites
        ]);
    }

    /**
     * Show website details
     */
    public function show(Website $website): Response
    {
        $website->load(['pages', 'agentInfo']);

        return Inertia::render('Admin/Websites/Show', [
            'title' => "Website: {$website->name}",
            'website' => $website
        ]);
    }

    /**
     * Show create website form
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Websites/Create', [
            'title' => 'Create New Website'
        ]);
    }

    /**
     * Store new website
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:websites',
            'domain' => 'nullable|string|max:255',
            'is_default' => 'boolean',
            'logo_url' => 'nullable|string|max:255',
            'brand_colors' => 'nullable|array',
            'fonts' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'favicon_url' => 'nullable|string|max:255',
            'contact_info' => 'nullable|array',
            'agent_name' => 'nullable|string|max:255',
            'agent_title' => 'nullable|string|max:255',
            'agent_phone' => 'nullable|string|max:255',
            'brokerage' => 'nullable|string|max:255',
            'agent_profile_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'social_media' => 'nullable|array',
            'description' => 'nullable|string',
            'business_hours' => 'nullable|array',
            'timezone' => 'nullable|string|max:255',
        ]);

        // If this is set as default, remove default from other websites
        if ($validated['is_default'] ?? false) {
            Website::where('is_default', true)->update(['is_default' => false]);
        }

        // Remove agent fields from validated array as they're handled separately
        $agentData = [
            'agent_name' => $validated['agent_name'] ?? null,
            'agent_title' => $validated['agent_title'] ?? null,
            'agent_phone' => $validated['agent_phone'] ?? null,
            'brokerage' => $validated['brokerage'] ?? null,
        ];
        unset($validated['agent_name'], $validated['agent_title'], $validated['agent_phone'],
              $validated['brokerage'], $validated['agent_profile_image']);

        $website = Website::create($validated);

        // Create agent info if provided
        if ($agentData['agent_name'] || $agentData['agent_title'] || $agentData['agent_phone'] || $agentData['brokerage']) {
            AgentInfo::create([
                'website_id' => $website->id,
                ...$agentData
            ]);
        }

        // Create default home page
        WebsitePage::create([
            'website_id' => $website->id,
            'page_type' => 'home',
            'title' => "Home - {$website->name}",
            'content' => WebsitePage::getDefaultHomeContent(),
            'is_active' => true,
            'sort_order' => 0,
        ]);

        return redirect()->route('admin.websites.show', $website)
            ->with('success', 'Website created successfully!');
    }

    /**
     * Show edit website form
     */
    public function edit(Website $website): Response
    {
        $website->load('agentInfo', 'homepageBuilding');

        // Get all buildings for the dropdown
        $buildings = \App\Models\Building::select('id', 'name', 'address')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Websites/Edit', [
            'title' => "Edit Website: {$website->name}",
            'website' => $website,
            'buildings' => $buildings
        ]);
    }

    /**
     * Update website
     */
    public function update(Request $request, Website $website)
    {
        // Log all incoming requests
        \Log::info('Update method called at ' . date('Y-m-d H:i:s'), [
            'website_id' => $website->id,
            'has_logo_file' => $request->hasFile('logo_file'),
            'all_files' => array_keys($request->allFiles()),
            'request_method' => $request->method(),
            'is_multipart' => strpos($request->header('Content-Type'), 'multipart/form-data') !== false,
        ]);

        // Test if file is being received
        if ($request->hasFile('logo_file')) {
            \Log::info('Logo file received!', [
                'name' => $request->file('logo_file')->getClientOriginalName(),
                'size' => $request->file('logo_file')->getSize()
            ]);
        } else {
            \Log::warning('No logo file in request', [
                'all_files' => array_keys($request->allFiles()),
                'has_logo_file' => $request->hasFile('logo_file'),
                'request_keys' => array_keys($request->all())
            ]);
        }
        // Parse JSON strings for nested objects if they come from FormData
        $data = $request->all();

        // Convert string booleans to actual booleans
        foreach (['is_default', 'is_active'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN);
            }
        }

        // Parse nested JSON objects if they are strings
        foreach (['brand_colors', 'contact_info', 'social_media', 'fonts', 'business_hours'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = json_decode($data[$field], true);
            }
        }

        // Handle nested keys from FormData (e.g., 'brand_colors.primary')
        $nestedData = [];
        foreach ($data as $key => $value) {
            if (strpos($key, '.') !== false) {
                $keys = explode('.', $key);
                $current = &$nestedData;
                foreach ($keys as $index => $k) {
                    if ($index === count($keys) - 1) {
                        $current[$k] = $value;
                    } else {
                        if (!isset($current[$k])) {
                            $current[$k] = [];
                        }
                        $current = &$current[$k];
                    }
                }
                unset($data[$key]);
            }
        }

        // Merge nested data back
        foreach ($nestedData as $key => $value) {
            if (!isset($data[$key])) {
                $data[$key] = [];
            }
            $data[$key] = array_merge(is_array($data[$key]) ? $data[$key] : [], $value);
        }

        // Merge the parsed data back into the request
        $request->merge($data);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('websites')->ignore($website->id)],
            'domain' => 'nullable|string|max:255',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'homepage_building_id' => 'nullable|exists:buildings,id',
            'use_building_as_homepage' => 'boolean',
            'logo_file' => 'nullable|file|mimes:jpg,jpeg,png,svg,webp|max:2048',
            'logo' => 'nullable|string|max:255',
            'logo_url' => 'nullable|string|max:255',
            'brand_colors' => 'nullable|array',
            'fonts' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'favicon_url' => 'nullable|string|max:255',
            'contact_info' => 'nullable|array',
            'agent_name' => 'nullable|string|max:255',
            'agent_title' => 'nullable|string|max:255',
            'agent_phone' => 'nullable|string|max:255',
            'brokerage' => 'nullable|string|max:255',
            'agent_profile_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'social_media' => 'nullable|array',
            'description' => 'nullable|string',
            'business_hours' => 'nullable|array',
            'timezone' => 'nullable|string|max:255',
        ]);

        // Handle logo file upload
        if ($request->hasFile('logo_file')) {
            $logoFile = $request->file('logo_file');

            // Delete old logo if it exists
            $oldLogoPath = $website->logo ?? $website->logo_url;
            if ($oldLogoPath) {
                // Handle logos in storage directory
                if (strpos($oldLogoPath, '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $oldLogoPath);
                    Storage::disk('public')->delete($oldPath);
                }
                // Handle logos in public/assets directory
                elseif (strpos($oldLogoPath, '/assets/') === 0) {
                    $publicPath = public_path(ltrim($oldLogoPath, '/'));
                    if (file_exists($publicPath) && is_file($publicPath)) {
                        // Don't delete the default Logo.png - keep it as backup
                        if (basename($publicPath) !== 'Logo.png') {
                            unlink($publicPath);
                        }
                    }
                }
            }

            // Generate unique filename
            $logoFileName = 'logo_' . uniqid() . '_' . time() . '.' . $logoFile->getClientOriginalExtension();

            // Store in public/assets directory for consistency
            $assetsPath = public_path('assets');
            if (!file_exists($assetsPath)) {
                mkdir($assetsPath, 0755, true);
            }

            // Move the uploaded file to assets directory
            $logoFile->move($assetsPath, $logoFileName);

            // Update both logo and logo_url with the assets path
            $validated['logo'] = '/assets/' . $logoFileName;
            $validated['logo_url'] = '/assets/' . $logoFileName;

            // Remove logo_file from validated array as it's not a database field
            unset($validated['logo_file']);
        }

        // Handle agent information separately
        $agentData = [
            'website_id' => $website->id,
            'agent_name' => $validated['agent_name'] ?? null,
            'agent_title' => $validated['agent_title'] ?? null,
            'agent_phone' => $validated['agent_phone'] ?? null,
            'brokerage' => $validated['brokerage'] ?? null,
        ];

        // Handle agent profile image upload
        if ($request->hasFile('agent_profile_image')) {
            $agentImageFile = $request->file('agent_profile_image');

            // Ensure storage directory exists
            if (!Storage::disk('public')->exists('agents')) {
                Storage::disk('public')->makeDirectory('agents');
            }

            // Delete old image if exists
            $agentInfo = $website->agentInfo;
            if ($agentInfo && $agentInfo->profile_image &&
                strpos($agentInfo->profile_image, '/storage/') === 0) {
                $oldPath = str_replace('/storage/', '', $agentInfo->profile_image);
                Storage::disk('public')->delete($oldPath);
            }

            // Generate unique filename for agent image
            $agentImageFileName = uniqid() . '_' . time() . '.' . $agentImageFile->getClientOriginalExtension();

            // Store the file with specific filename
            $agentImagePath = $agentImageFile->storeAs('agents', $agentImageFileName, 'public');

            // Update agent data with new image path
            $agentData['profile_image'] = Storage::url($agentImagePath);
        }

        // Update or create agent info
        AgentInfo::updateOrCreate(
            ['website_id' => $website->id],
            $agentData
        );

        // Remove agent fields from validated array as they're handled separately
        unset($validated['agent_name'], $validated['agent_title'], $validated['agent_phone'],
              $validated['brokerage'], $validated['agent_profile_image']);

        // If this is set as default, remove default from other websites
        if ($validated['is_default'] ?? false) {
            Website::where('id', '!=', $website->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        // Update the website
        $website->update($validated);

        // Reload the website to get fresh data with all relationships
        $website->refresh();

        // Return Inertia redirect to edit page to stay on same page
        return redirect()->route('admin.websites.edit', $website->id)
            ->with('success', 'Website updated successfully!');
    }

    /**
     * Delete website
     */
    public function destroy(Website $website): RedirectResponse
    {
        if ($website->is_default) {
            return redirect()->back()
                ->withErrors(['error' => 'Cannot delete the default website.']);
        }

        $website->delete();

        return redirect()->route('admin.websites.index')
            ->with('success', 'Website deleted successfully!');
    }

    /**
     * Edit home page content
     */
    public function editHomePage($websiteId): Response
    {
        try {
            $website = Website::findOrFail($websiteId);
            $homePage = $website->pages()->where('page_type', 'home')->first();
            
            if (!$homePage) {
                // Create default home page if it doesn't exist
                $homePage = WebsitePage::create([
                    'website_id' => $website->id,
                    'page_type' => 'home',
                    'title' => "Home - {$website->name}",
                    'content' => WebsitePage::getDefaultHomeContent(),
                    'is_active' => true,
                    'sort_order' => 0,
                ]);
            }

            // Get all icons grouped by category
            $icons = Icon::active()
                ->select('id', 'name', 'category', 'svg_content', 'icon_url')
                ->orderBy('category')
                ->orderBy('name')
                ->get()
                ->groupBy('category');

            return Inertia::render('Admin/Websites/EditHomePage', [
                'title' => "Edit Home Page: {$website->name}",
                'website' => $website,
                'homePage' => $homePage,
                'availableIcons' => $icons
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Edit home page failed: ' . $e->getMessage());
            return redirect()->route('admin.websites.index')
                ->withErrors(['error' => 'Failed to load home page editor.']);
        }
    }

    /**
     * Update home page content
     */
    public function updateHomePage(Request $request, $websiteId): RedirectResponse
    {
        try {
            // Debug: Log all request data
            \Log::info('UpdateHomePage Request Data:', [
                'all' => $request->all(),
                'files' => $request->allFiles(),
                'method' => $request->method()
            ]);
            
            $website = Website::findOrFail($websiteId);
            $homePage = $website->pages()->where('page_type', 'home')->first();
            
            if (!$homePage) {
                // Create home page if it doesn't exist
                $homePage = WebsitePage::create([
                    'website_id' => $website->id,
                    'page_type' => 'home',
                    'title' => 'Home - ' . $website->name,
                    'content' => WebsitePage::getDefaultHomeContent(),
                    'is_active' => true,
                    'sort_order' => 0,
                ]);
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'nullable', // Remove type restriction since it can be string or array
                'hero_background_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
                'about_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
                'footer_logo' => 'nullable|file|mimes:jpg,jpeg,png,webp,svg|max:5120', // 5MB max
                'footer_background_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
            ]);

            // Handle content field (can be JSON string or array)
            $content = $homePage->content; // Start with existing content
            if (isset($validated['content'])) {
                if (is_string($validated['content'])) {
                    // If it's a string, decode it
                    $decodedContent = json_decode($validated['content'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $content = $decodedContent;
                        \Log::info('FAQ content decoded successfully:', [
                            'faq_enabled' => $content['faq']['enabled'] ?? 'not set',
                            'faq_title' => $content['faq']['title'] ?? 'not set',
                            'faq_items_count' => count($content['faq']['items'] ?? [])
                        ]);
                    } else {
                        \Log::error('JSON decode error for content:', [
                            'content' => $validated['content'],
                            'error' => json_last_error_msg()
                        ]);
                    }
                } elseif (is_array($validated['content'])) {
                    // If it's already an array, use it directly
                    $content = $validated['content'];
                    \Log::info('FAQ content updated from array:', [
                        'faq_enabled' => $content['faq']['enabled'] ?? 'not set',
                        'faq_title' => $content['faq']['title'] ?? 'not set',
                        'faq_items_count' => count($content['faq']['items'] ?? [])
                    ]);
                }
            }

            // Handle hero background image upload
            if ($request->hasFile('hero_background_image')) {
                $heroImageFile = $request->file('hero_background_image');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old image if exists
                if (isset($content['hero']['background_image']) && 
                    strpos($content['hero']['background_image'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['hero']['background_image']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $heroImagePath = $heroImageFile->store('home-page', 'public');
                $content['hero']['background_image'] = '/storage/' . $heroImagePath;
            }

            // Handle about image upload
            if ($request->hasFile('about_image')) {
                $aboutImageFile = $request->file('about_image');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old image if exists
                if (isset($content['about']['image']) && 
                    strpos($content['about']['image'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['about']['image']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $aboutImagePath = $aboutImageFile->store('home-page', 'public');
                $content['about']['image'] = '/storage/' . $aboutImagePath;
            }

            // Handle footer logo upload
            if ($request->hasFile('footer_logo')) {
                $footerLogoFile = $request->file('footer_logo');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old logo if exists
                if (isset($content['footer']['logo_url']) && 
                    strpos($content['footer']['logo_url'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['footer']['logo_url']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $footerLogoPath = $footerLogoFile->store('home-page', 'public');
                if (!isset($content['footer'])) {
                    $content['footer'] = [];
                }
                $content['footer']['logo_url'] = '/storage/' . $footerLogoPath;
            }

            // Handle footer background image upload
            if ($request->hasFile('footer_background_image')) {
                $footerBgFile = $request->file('footer_background_image');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old background image if exists
                if (isset($content['footer']['background_image']) && 
                    strpos($content['footer']['background_image'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['footer']['background_image']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $footerBgPath = $footerBgFile->store('home-page', 'public');
                if (!isset($content['footer'])) {
                    $content['footer'] = [];
                }
                $content['footer']['background_image'] = '/storage/' . $footerBgPath;
            }

            $homePage->update([
                'title' => $validated['title'],
                'content' => $content
            ]);

            return redirect()->route('admin.websites.edit-home-page', $website->id)
                ->with('success', 'Home page updated successfully!');

        } catch (\Exception $e) {
            \Log::error('Home page update failed: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Failed to update home page: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display website pages management
     */
    public function pages(Website $website): Response
    {
        $website->load('pages');

        return Inertia::render('Admin/Websites/Pages', [
            'title' => "Pages: {$website->name}",
            'website' => $website
        ]);
    }

    /**
     * Manage icons
     */
    public function icons(): Response
    {
        $icons = Icon::orderBy('category')->orderBy('name')->get();

        return Inertia::render('Admin/Icons/Index', [
            'title' => 'Icon Management',
            'icons' => $icons
        ]);
    }

    /**
     * Create new icon
     */
    public function storeIcon(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'svg_content' => 'required_without:icon_url|string',
            'icon_url' => 'required_without:svg_content|string|max:255',
            'description' => 'nullable|string',
        ]);

        Icon::create($validated);

        return redirect()->back()
            ->with('success', 'Icon created successfully!');
    }

    /**
     * Delete icon
     */
    public function destroyIcon(Icon $icon): RedirectResponse
    {
        $icon->delete();

        return redirect()->back()
            ->with('success', 'Icon deleted successfully!');
    }

    /**
     * Update website
     */
    public function updateWebsite(Request $request, $websiteId): RedirectResponse
    {
        $website = Website::findOrFail($websiteId);

        // Use the logic from the update method
        return $this->update($request, $website);
    }

    /**
     * Get icons for API
     */
    public function getIcons()
    {
        $icons = Icon::orderBy('category')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'icons' => $icons
        ]);
    }

    /**
     * Store a new icon via AJAX with file upload support
     */
    public function storeIconAjax(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:key_facts,amenities,highlights,contact,general',
            'svg_content' => 'nullable|string',
            'icon_url' => 'nullable|url|max:500',
            'icon_file' => 'nullable|file|mimes:svg,png,jpg,jpeg|max:2048', // 2MB max
            'description' => 'nullable|string|max:500',
        ]);

        $iconContent = $validated['svg_content'] ?? null;
        $iconUrl = $validated['icon_url'] ?? null;

        // Handle file upload
        if ($request->hasFile('icon_file')) {
            $file = $request->file('icon_file');
            $extension = strtolower($file->getClientOriginalExtension());
            
            // Ensure icons directory exists
            if (!Storage::disk('public')->exists('icons')) {
                Storage::disk('public')->makeDirectory('icons');
            }
            
            if ($extension === 'svg') {
                // For SVG files, store the content directly and also save file
                $iconContent = file_get_contents($file->getRealPath());
                $filename = time() . '_' . \Illuminate\Support\Str::slug($validated['name']) . '.svg';
                $path = $file->storeAs('icons', $filename, 'public');
                $iconUrl = '/storage/' . $path;
            } else {
                // For PNG/JPG files, store the file and save URL
                $filename = time() . '_' . \Illuminate\Support\Str::slug($validated['name']) . '.' . $extension;
                $path = $file->storeAs('icons', $filename, 'public');
                $iconUrl = '/storage/' . $path;
                $iconContent = null; // Clear SVG content for non-SVG files
            }
        }

        $icon = Icon::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'svg_content' => $iconContent,
            'icon_url' => $iconUrl,
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        // For Inertia requests, return a redirect
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Icon created successfully!');
        }
        
        // For regular AJAX requests, return JSON
        return response()->json([
            'success' => true,
            'message' => 'Icon created successfully!',
            'icon' => [
                'id' => $icon->id,
                'name' => $icon->name,
                'category' => $icon->category,
                'svg_content' => $icon->svg_content,
                'icon_url' => $icon->icon_url,
                'description' => $icon->description,
                'is_active' => $icon->is_active,
                'display_name' => ucwords(str_replace('_', ' ', $icon->name))
            ]
        ]);
    }

    /**
     * Update an existing icon with file upload support
     */
    public function updateIcon(Request $request, $iconId)
    {
        $icon = Icon::findOrFail($iconId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:key_facts,amenities,highlights,contact,general',
            'svg_content' => 'nullable|string',
            'icon_url' => 'nullable|url|max:500',
            'icon_file' => 'nullable|file|mimes:svg,png,jpg,jpeg|max:2048',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $iconContent = $validated['svg_content'] ?? $icon->svg_content;
        $iconUrl = $validated['icon_url'] ?? $icon->icon_url;

        // Handle file upload
        if ($request->hasFile('icon_file')) {
            $file = $request->file('icon_file');
            $extension = strtolower($file->getClientOriginalExtension());
            
            // Delete old file if it exists
            if ($icon->icon_url && Storage::disk('public')->exists(str_replace('/storage/', '', $icon->icon_url))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $icon->icon_url));
            }
            
            // Ensure icons directory exists
            if (!Storage::disk('public')->exists('icons')) {
                Storage::disk('public')->makeDirectory('icons');
            }
            
            if ($extension === 'svg') {
                // For SVG files, store the content directly and also save file
                $iconContent = file_get_contents($file->getRealPath());
                $filename = time() . '_' . \Illuminate\Support\Str::slug($validated['name']) . '.svg';
                $path = $file->storeAs('icons', $filename, 'public');
                $iconUrl = '/storage/' . $path;
            } else {
                // For PNG/JPG files, store the file and save URL
                $filename = time() . '_' . \Illuminate\Support\Str::slug($validated['name']) . '.' . $extension;
                $path = $file->storeAs('icons', $filename, 'public');
                $iconUrl = '/storage/' . $path;
                $iconContent = null; // Clear SVG content for non-SVG files
            }
        }

        $icon->update([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'svg_content' => $iconContent,
            'icon_url' => $iconUrl,
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Icon updated successfully!');
    }
}
