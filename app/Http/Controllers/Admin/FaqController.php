<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Faq::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                    ->orWhere('answer', 'like', "%{$search}%");
            });
        }

        if ($request->filled('page_type')) {
            $query->where('page_type', $request->page_type);
        }

        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', (bool) $request->is_active);
        }

        $faqs = $query->ordered()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Faqs/Index', [
            'faqs' => $faqs,
            'pageTypes' => Faq::PAGE_TYPES,
            'filters' => $request->only(['search', 'page_type', 'is_active']),
        ]);
    }

    /**
     * The Index page handles creation via modal, so redirect there.
     */
    public function create()
    {
        return redirect()->route('admin.faqs.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        Faq::create($validated);

        return redirect()->route('admin.faqs.index')
            ->with('success', 'FAQ created successfully.');
    }

    /**
     * The Index page handles viewing via modal, so redirect there.
     */
    public function show(Faq $faq)
    {
        return redirect()->route('admin.faqs.index');
    }

    /**
     * The Index page handles editing via modal, so redirect there.
     */
    public function edit(Faq $faq)
    {
        return redirect()->route('admin.faqs.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Faq $faq)
    {
        $validated = $request->validate($this->rules());

        $faq->update($validated);

        return redirect()->route('admin.faqs.index')
            ->with('success', 'FAQ updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Faq $faq)
    {
        $faq->delete();

        return redirect()->route('admin.faqs.index')
            ->with('success', 'FAQ deleted successfully.');
    }

    private function rules(): array
    {
        return [
            'question' => 'required|string|max:500',
            'answer' => 'required|string',
            'page_type' => 'required|in:' . implode(',', Faq::PAGE_TYPES),
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ];
    }
}
