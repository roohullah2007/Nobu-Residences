<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Developer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class DeveloperController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $developers = Developer::orderBy('name')->paginate(10);
        
        return Inertia::render('Admin/Developers/Index', [
            'developers' => $developers
        ]);
    }

    /**
     * Show the form for creating a new resource.
     * Note: The Index page handles creation via modal, so redirect there
     */
    public function create()
    {
        return redirect()->route('admin.developers.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('developers', 'public');
        }

        Developer::create($validated);

        return redirect()->route('admin.developers.index')
            ->with('success', 'Developer created successfully.');
    }

    /**
     * Display the specified resource.
     * Note: The Index page handles viewing via modal, so redirect there
     */
    public function show(Developer $developer)
    {
        return redirect()->route('admin.developers.index');
    }

    /**
     * Show the form for editing the specified resource.
     * Note: The Index page handles editing via modal, so redirect there
     */
    public function edit(Developer $developer)
    {
        return redirect()->route('admin.developers.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Developer $developer)
    {
        $validated = $request->validate($this->rules());

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($developer->logo) {
                Storage::disk('public')->delete($developer->logo);
            }
            $validated['logo'] = $request->file('logo')->store('developers', 'public');
        }

        $developer->update($validated);

        return redirect()->route('admin.developers.index')
            ->with('success', 'Developer updated successfully.');
    }

    /**
     * Shared validation rules for store/update. SEO meta, project counts and
     * highlights/awards were removed from the modal — meta tags are
     * auto-generated on the public page, and existing DB values are left
     * untouched because they are simply never submitted.
     */
    private function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'required|in:builder,developer,builder_developer',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'logo' => 'nullable|image|max:2048',
            'website' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:65000',
            'established_year' => 'nullable|integer|min:1800|max:' . date('Y'),
        ];
    }

    /**
     * Quick-create a developer from inside another form (e.g. the Building
     * create/edit page). Accepts the same profile fields as the Developers
     * tab modal — including the logo upload — and returns JSON so the caller
     * can append the new option to its dropdown without a page reload.
     */
    public function quickStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|in:builder,developer,builder_developer',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'logo' => 'nullable|image|max:2048',
            'website' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:65000',
            'established_year' => 'nullable|integer|min:1800|max:' . date('Y'),
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('developers', 'public');
        }

        $validated['name'] = trim($validated['name']);
        $validated['type'] = $validated['type'] ?? 'developer';

        $developer = Developer::firstOrCreate(
            ['name' => $validated['name']],
            $validated
        );

        return response()->json([
            'id' => $developer->id,
            'name' => $developer->name,
            'type' => $developer->type,
        ], $developer->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Developer $developer)
    {
        // Delete logo if exists
        if ($developer->logo) {
            Storage::disk('public')->delete($developer->logo);
        }
        
        $developer->delete();

        return redirect()->route('admin.developers.index')
            ->with('success', 'Developer deleted successfully.');
    }
}