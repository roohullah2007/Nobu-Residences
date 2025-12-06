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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:builder,developer,builder_developer',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'logo' => 'nullable|image|max:2048'
        ]);

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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:builder,developer,builder_developer',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'logo' => 'nullable|image|max:2048'
        ]);

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