<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
use Exception;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth
     */
    public function redirectToGoogle(Request $request)
    {
        // Stash the page the user was on (modal forwards this as ?redirect_to=)
        // so the callback can return them to it after a successful sign-in.
        $redirectTo = $this->safeRelativeRedirect($request->query('redirect_to'));
        if ($redirectTo !== null) {
            $request->session()->put('post_login_redirect', $redirectTo);
        }

        try {
            return Socialite::driver('google')->redirect();
        } catch (Exception $e) {
            Log::error('Google Redirect Error: ' . $e->getMessage());
            return redirect('/login')->withErrors(['google' => 'Google login failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Check if user exists with this email
            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                // Update user with Google information if not already set
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->id,
                        'avatar' => $user->avatar ?: $googleUser->avatar,
                        'provider' => 'google',
                        'provider_id' => $googleUser->id,
                    ]);
                }
            } else {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'provider' => 'google',
                    'provider_id' => $googleUser->id,
                    'password' => Hash::make(Str::random(16)),
                    'role' => 'user',
                    'email_verified_at' => now(),
                ]);

                // Create client in Repliers API
                try {
                    $repliersApi = app(\App\Services\RepliersApiService::class);
                    $nameParts = explode(' ', $googleUser->name, 2);
                    $clientData = $repliersApi->createClient([
                        'email' => $googleUser->email,
                        'first_name' => $nameParts[0] ?? $googleUser->name,
                        'last_name' => $nameParts[1] ?? '',
                    ]);
                    if ($clientData && !empty($clientData['clientId'])) {
                        $user->update(['repliers_client_id' => (string) $clientData['clientId']]);
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to create Repliers client for Google user', ['error' => $e->getMessage()]);
                }
            }

            Auth::login($user, true);

            // If we stashed a page-level redirect when the user clicked the
            // modal's "Sign in with Google", honor it now.
            $redirectTo = $request->session()->pull('post_login_redirect');
            if (is_string($redirectTo) && $this->safeRelativeRedirect($redirectTo) !== null) {
                return redirect($redirectTo);
            }

            return redirect()->intended('/dashboard');

        } catch (Exception $e) {
            Log::error('Google OAuth Callback Error: ' . $e->getMessage());
            return redirect('/login')->withErrors(['google' => 'Unable to authenticate with Google: ' . $e->getMessage()]);
        }
    }

    /**
     * Validate a caller-supplied redirect target. Only same-site relative
     * paths are allowed, and we never bounce back to the auth pages
     * themselves.
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
     * Redirect to Google OAuth (for Inertia/React)
     */
    public function redirect()
    {
        return response()->json([
            'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl()
        ]);
    }

    /**
     * Handle Google OAuth callback (for Inertia/React)
     */
    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Check if user exists with this email
            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                // Update user with Google information if not already set
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->id,
                        'avatar' => $user->avatar ?: $googleUser->avatar,
                        'provider' => 'google',
                        'provider_id' => $googleUser->id,
                    ]);
                }
            } else {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'provider' => 'google',
                    'provider_id' => $googleUser->id,
                    'password' => Hash::make(Str::random(16)),
                    'role' => 'user',
                    'email_verified_at' => now(),
                ]);

                // Create client in Repliers API
                try {
                    $repliersApi = app(\App\Services\RepliersApiService::class);
                    $nameParts = explode(' ', $googleUser->name, 2);
                    $clientData = $repliersApi->createClient([
                        'email' => $googleUser->email,
                        'first_name' => $nameParts[0] ?? $googleUser->name,
                        'last_name' => $nameParts[1] ?? '',
                    ]);
                    if ($clientData && !empty($clientData['clientId'])) {
                        $user->update(['repliers_client_id' => (string) $clientData['clientId']]);
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to create Repliers client for Google user', ['error' => $e->getMessage()]);
                }
            }

            Auth::login($user, true);

            return redirect()->intended('/dashboard');

        } catch (Exception $e) {
            Log::error('Google OAuth Callback Error: ' . $e->getMessage());
            return redirect('/login')->withErrors(['google' => 'Unable to authenticate with Google: ' . $e->getMessage()]);
        }
    }
}
