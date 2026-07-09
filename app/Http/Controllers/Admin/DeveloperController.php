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

        Developer::create($this->normalizeContentFields($validated));

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

        $developer->update($this->normalizeContentFields($validated));

        return redirect()->route('admin.developers.index')
            ->with('success', 'Developer updated successfully.');
    }

    /**
     * Shared validation rules for store/update.
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
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'projects_completed' => 'nullable|integer|min:0',
            'projects_under_construction' => 'nullable|integer|min:0',
            'upcoming_projects' => 'nullable|integer|min:0',
            // Sent as JSON strings from the FormData form; normalized below
            'highlights' => 'nullable',
            'awards' => 'nullable',
        ];
    }

    /**
     * highlights/awards arrive as JSON strings via FormData — decode and keep
     * only well-formed {title, text} rows with at least some text.
     */
    private function normalizeContentFields(array $validated): array
    {
        foreach (['highlights', 'awards'] as $field) {
            if (!array_key_exists($field, $validated)) {
                continue;
            }
            $value = $validated[$field];
            if (is_string($value)) {
                $value = json_decode($value, true);
            }
            if (!is_array($value)) {
                $validated[$field] = null;
                continue;
            }
            $validated[$field] = array_values(array_filter(array_map(function ($row) {
                if (!is_array($row)) {
                    return null;
                }
                $title = trim((string) ($row['title'] ?? ''));
                $text = trim((string) ($row['text'] ?? ''));
                return ($title !== '' || $text !== '') ? ['title' => $title, 'text' => $text] : null;
            }, $value))) ?: null;
        }

        return $validated;
    }

    /**
     * Quick-create a developer from inside another form (e.g. the Building
     * create/edit page). Returns JSON so the caller can append the new
     * option to its dropdown without a page reload.
     */
    public function quickStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|in:builder,developer,builder_developer',
        ]);

        $developer = Developer::firstOrCreate(
            ['name' => trim($validated['name'])],
            ['type' => $validated['type'] ?? 'developer']
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