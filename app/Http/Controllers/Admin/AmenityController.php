<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Rules\SvgOrImage;

class AmenityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $amenities = Amenity::orderBy('name')->paginate(20);
        
        return Inertia::render('Admin/Amenities/Index', [
            'amenities' => $amenities
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Amenities/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:amenities,name',
            'icon_file' => ['nullable', new SvgOrImage(), 'max:2048']
        ]);

        $data = ['name' => $validated['name']];

        if ($request->hasFile('icon_file')) {
            $iconFile = $request->file('icon_file');
            $iconFileName = strtolower(str_replace(' ', '-', $validated['name'])) . '.' . $iconFile->getClientOriginalExtension();
            $iconPath = $iconFile->storeAs('amenity-icons', $iconFileName, 'public');
            $data['icon'] = Storage::url($iconPath);
        }

        Amenity::create($data);

        return redirect()->route('admin.amenities.index')
            ->with('success', 'Amenity created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Amenity $amenity)
    {
        $amenity->load('buildings');
        
        return Inertia::render('Admin/Amenities/Show', [
            'amenity' => $amenity
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Amenity $amenity)
    {
        return Inertia::render('Admin/Amenities/Edit', [
            'amenity' => $amenity
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Amenity $amenity)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:amenities,name,' . $amenity->id,
            'icon_file' => ['nullable', new SvgOrImage(), 'max:2048']
        ]);

        $data = ['name' => $validated['name']];

        if ($request->hasFile('icon_file')) {
            // Delete old icon if exists
            if ($amenity->icon && Storage::disk('public')->exists(str_replace('/storage/', '', $amenity->icon))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $amenity->icon));
            }

            $iconFile = $request->file('icon_file');
            $iconFileName = strtolower(str_replace(' ', '-', $validated['name'])) . '.' . $iconFile->getClientOriginalExtension();
            $iconPath = $iconFile->storeAs('amenity-icons', $iconFileName, 'public');
            $data['icon'] = Storage::url($iconPath);
        }

        $amenity->update($data);

        return redirect()->route('admin.amenities.index')
            ->with('success', 'Amenity updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Amenity $amenity)
    {
        $amenity->delete();

        return redirect()->route('admin.amenities.index')
            ->with('success', 'Amenity deleted successfully.');
    }
}