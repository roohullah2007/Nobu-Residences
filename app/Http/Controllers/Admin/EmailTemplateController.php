<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\Website;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmailTemplateController extends Controller
{
    /**
     * Editor for the personalizable email templates (subject / headline /
     * intro with %merge_tags%), globally or per landing site.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/EmailTemplates/Index', [
            'types' => collect(EmailTemplate::TYPES)->map(fn ($config, $type) => [
                'type' => $type,
                'label' => $config['label'],
                'defaults' => $config['defaults'],
                'tags' => $config['tags'],
            ])->values(),
            'templates' => EmailTemplate::all(['id', 'type', 'website_id', 'subject', 'headline', 'intro']),
            'websites' => Website::orderByDesc('is_default')->orderBy('name')->get(['id', 'name', 'domain']),
        ]);
    }

    /**
     * Save one type's template (global when website_id is null). Empty
     * fields mean "fall back to the global template / built-in default".
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(array_keys(EmailTemplate::TYPES))],
            'website_id' => ['nullable', 'integer', 'exists:websites,id'],
            'subject' => ['nullable', 'string', 'max:255'],
            'headline' => ['nullable', 'string', 'max:255'],
            'intro' => ['nullable', 'string', 'max:2000'],
        ]);

        EmailTemplate::updateOrCreate(
            ['type' => $validated['type'], 'website_id' => $validated['website_id'] ?? null],
            [
                'subject' => $validated['subject'] ?? null,
                'headline' => $validated['headline'] ?? null,
                'intro' => $validated['intro'] ?? null,
            ]
        );

        return back()->with('success', 'Email template saved.');
    }
}
