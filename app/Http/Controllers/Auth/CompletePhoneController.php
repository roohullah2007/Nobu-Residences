<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\FollowUpBossService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Add your phone number" step for Google sign-ins — Google gives us no
 * phone, so users are routed here right after OAuth login. Saving pushes
 * the number to Follow Up Boss too (person located by email), so the lead
 * profile completes automatically.
 */
class CompletePhoneController extends Controller
{
    public function __construct(protected FollowUpBossService $followUpBoss)
    {
    }

    public function create(Request $request): Response|RedirectResponse
    {
        if (!empty($request->user()->phone)) {
            return redirect($this->safeRedirect($request->query('redirect')) ?? '/');
        }

        return Inertia::render('Auth/CompletePhone', [
            'redirect' => $this->safeRedirect($request->query('redirect')),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'min:10', 'max:20'],
            'redirect' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $user->update(['phone' => $validated['phone']]);

        // Complete the FUB lead profile — guarded, never blocks the user.
        try {
            $this->followUpBoss->updatePersonPhoneByEmail($user->email, $validated['phone']);
        } catch (\Throwable $e) {
            \Log::warning('FUB phone sync failed after profile completion', ['error' => $e->getMessage()]);
        }

        return redirect($this->safeRedirect($validated['redirect'] ?? null) ?? '/');
    }

    /**
     * Same-site relative paths only — never back to auth pages.
     */
    private function safeRedirect(?string $url): ?string
    {
        if (!is_string($url) || $url === '' || strlen($url) > 2000) {
            return null;
        }
        if ($url[0] !== '/' || str_starts_with($url, '//') || str_starts_with($url, '/\\')) {
            return null;
        }
        if (preg_match('#^/(login|register|auth/|forgot-password|reset-password|complete-phone)#i', $url)) {
            return null;
        }

        return $url;
    }
}
