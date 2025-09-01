<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class SchoolController extends Controller
{
    /**
     * Display a listing of schools
     */
    public function index(Request $request): Response
    {
        $query = School::query();
        
        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('school_board', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('school_type')) {
            $query->where('school_type', $request->input('school_type'));
        }
        
        if ($request->has('grade_level')) {
            $query->where('grade_level', $request->input('grade_level'));
        }
        
        if ($request->has('city')) {
            $query->where('city', 'like', '%' . $request->input('city') . '%');
        }
        
        $schools = $query->orderBy('name')
                        ->paginate(20)
                        ->withQueryString();
        
        // Add computed fields
        $schools->getCollection()->transform(function ($school) {
            $school->school_type_label = $school->getSchoolTypeLabel();
            $school->grade_level_label = $school->getGradeLevelLabel();
            return $school;
        });
        
        return Inertia::render('Admin/RealEstate/Schools', [
            'title' => 'School Management',
            'schools' => $schools->items(),
            'pagination' => [
                'total' => $schools->total(),
                'per_page' => $schools->perPage(),
                'current_page' => $schools->currentPage(),
                'last_page' => $schools->lastPage(),
                'from' => $schools->firstItem(),
                'to' => $schools->lastItem(),
            ],
            'filters' => $request->only(['search', 'school_type', 'grade_level', 'city'])
        ]);
    }
    
    /**
     * Show the form for creating a new school
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Schools/Create', [
            'title' => 'Add New School'
        ]);
    }
    
    /**
     * Store a newly created school
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:10',
            'postal_code' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website_url' => 'nullable|url|max:255',
            'school_type' => 'required|in:public,catholic,private,charter,french,other',
            'grade_level' => 'required|in:elementary,secondary,k-12,preschool,special',
            'school_board' => 'nullable|string|max:255',
            'principal_name' => 'nullable|string|max:255',
            'student_capacity' => 'nullable|integer|min:1',
            'established_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'rating' => 'nullable|numeric|min:0|max:10',
            'description' => 'nullable|string',
            'programs' => 'nullable|array',
            'languages' => 'nullable|array',
            'facilities' => 'nullable|array',
            'is_featured' => 'boolean'
        ]);
        
        // Generate slug
        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_active'] = true;
        
        $school = School::create($validated);
        
        return redirect()->route('admin.schools.index')
                        ->with('success', 'School created successfully!');
    }
    
    /**
     * Display the specified school
     */
    public function show(School $school): Response
    {
        return Inertia::render('Admin/Schools/Show', [
            'title' => 'School Details',
            'school' => array_merge($school->getDisplayData(), [
                'school_type_label' => $school->getSchoolTypeLabel(),
                'grade_level_label' => $school->getGradeLevelLabel()
            ])
        ]);
    }
    
    /**
     * Show the form for editing the specified school
     */
    public function edit(School $school): Response
    {
        return Inertia::render('Admin/Schools/Edit', [
            'title' => 'Edit School',
            'school' => $school->getDisplayData()
        ]);
    }
    
    /**
     * Update the specified school
     */
    public function update(Request $request, School $school)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:10',
            'postal_code' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website_url' => 'nullable|url|max:255',
            'school_type' => 'required|in:public,catholic,private,charter,french,other',
            'grade_level' => 'required|in:elementary,secondary,k-12,preschool,special',
            'school_board' => 'nullable|string|max:255',
            'principal_name' => 'nullable|string|max:255',
            'student_capacity' => 'nullable|integer|min:1',
            'established_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'rating' => 'nullable|numeric|min:0|max:10',
            'description' => 'nullable|string',
            'programs' => 'nullable|array',
            'languages' => 'nullable|array',
            'facilities' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean'
        ]);
        
        // Update slug if name changed
        if ($school->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        $school->update($validated);
        
        return redirect()->route('admin.schools.index')
                        ->with('success', 'School updated successfully!');
    }
    
    /**
     * Remove the specified school
     */
    public function destroy(School $school)
    {
        $school->delete();
        
        return redirect()->route('admin.schools.index')
                        ->with('success', 'School deleted successfully!');
    }
}
