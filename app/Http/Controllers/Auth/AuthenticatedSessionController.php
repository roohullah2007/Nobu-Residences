<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // If the user signed in via the modal on a public page, the modal
        // forwards the page they were on as `redirect_to`. Honor it (after
        // validating it's a same-site relative URL) so they land back on the
        // page they were viewing instead of the dashboard.
        $redirectTo = $this->safeRelativeRedirect($request->input('redirect_to'));

        // Admins always go to the admin dashboard, regardless of the page
        // they came from — the modal isn't normally shown to admins.
        if (Auth::user()->isAdmin()) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        if ($redirectTo !== null) {
            return redirect($redirectTo);
        }

        return redirect()->intended(route('user.dashboard', absolute: false));
    }

    /**
     * Validate a caller-supplied redirect target. Only same-site relative
     * paths are allowed, and we never bounce back to the auth pages
     * themselves (would re-trigger the modal in a loop).
     */
    private function safeRelativeRedirect(?string $url): ?string
    {
        if (!is_string($url) || $url === '' || strlen($url) > 2000) {
            return null;
        }
        if ($url[0] !== '/' || str_starts_with($url, '//') || str_starts_with($url, '/\\')) {
            return null;
        }
        if (preg_match('#^/(login|register|auth/|forgot-password|reset-password)#i', $url)) {
            return null;
        }
        return $url;
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
