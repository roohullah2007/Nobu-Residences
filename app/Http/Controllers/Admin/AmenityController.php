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
     * Note: The Index page handles creation via modal, so redirect there
     */
    public function create()
    {
        return redirect()->route('admin.amenities.index');
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
            // Relative /storage/ URL on purpose — Storage::url() bakes
            // APP_URL into the DB and breaks the icon across hosts.
            $iconPath = $iconFile->storeAs('amenity-icons', $iconFileName, 'public');
            $data['icon'] = '/storage/' . $iconPath;
        }

        Amenity::create($data);

        return redirect()->route('admin.amenities.index')
            ->with('success', 'Amenity created successfully.');
    }

    /**
     * JSON quick-create for the inline "+ New" on the building create/edit
     * pages. Name-only (no icon upload); idempotent on the name so a
     * duplicate submit returns the existing amenity instead of erroring.
     */
    public function quickStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $amenity = Amenity::firstOrCreate(['name' => trim($validated['name'])]);

        return response()->json([
            'id' => $amenity->id,
            'name' => $amenity->name,
            'icon' => $amenity->icon,
        ], $amenity->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Display the specified resource.
     * Note: The Index page handles viewing via modal, so redirect there
     */
    public function show(Amenity $amenity)
    {
        return redirect()->route('admin.amenities.index');
    }

    /**
     * Show the form for editing the specified resource.
     * Note: The Index page handles editing via modal, so redirect there
     */
    public function edit(Amenity $amenity)
    {
        return redirect()->route('admin.amenities.index');
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
            $data['icon'] = '/storage/' . $iconPath;
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