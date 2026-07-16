<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Website;
use App\Services\Tenancy\TenantResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
use Exception;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth.
     *
     * The Google callback URI is registered for ONE host (services.google
     * .redirect). Tenant landing domains relay the sign-in through it:
     * tenant /auth/google -> callback-host /auth/google?origin={tenant} ->
     * Google -> callback-host callback -> tenant /auth/google/complete with
     * a one-time token that logs the user in on the tenant's own session.
     */
    public function redirectToGoogle(Request $request)
    {
        $callbackHost = TenantResolver::normalizeHost((string) config('services.google.redirect'));
        $currentHost = TenantResolver::normalizeHost($request->getHost());
        $redirectTo = $this->safeRelativeRedirect($request->query('redirect_to'));

        // Not on the callback host: hop there, carrying where to come back.
        if ($callbackHost !== '' && $currentHost !== $callbackHost) {
            $params = http_build_query(array_filter([
                'origin' => $currentHost,
                'redirect_to' => $redirectTo,
            ]));

            return redirect()->away($request->getScheme() . '://' . $callbackHost . '/auth/google?' . $params);
        }

        // Relayed start: remember which tenant domain to hand the session
        // back to. Only real active website domains are accepted.
        $origin = TenantResolver::normalizeHost((string) $request->query('origin', ''));
        if ($origin !== '' && $origin !== $currentHost) {
            $isKnownTenant = Website::where('is_active', true)
                ->where(function ($query) use ($origin) {
                    $query->where('domain', $origin)->orWhere('domain', 'www.' . $origin);
                })
                ->exists();
            abort_unless($isKnownTenant, 404);
            $request->session()->put('google_login_origin', $origin);
        } elseif (app(TenantResolver::class)->isAdminHost($request->getHost())) {
            // Plain visits on the main/admin domain keep the bare login
            // screen — Google auth only runs here as a tenant relay.
            abort(404);
        }

        // Stash the page the user was on (modal forwards this as ?redirect_to=)
        // so the callback can return them to it after a successful sign-in.
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
        // Relayed sign-ins carry the tenant domain the user started on.
        $origin = $request->session()->pull('google_login_origin');
        $origin = is_string($origin) ? TenantResolver::normalizeHost($origin) : '';

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

                // Relayed flows report the tenant site, not the callback host.
                $website = $origin !== ''
                    ? Website::where('domain', $origin)->orWhere('domain', 'www.' . $origin)->first()
                    : app(TenantResolver::class)->resolve(request());
                $websiteName = $website?->name;
                $signupHost = $origin !== '' ? $origin : request()->getHost();

                // Tell the admins — guarded inside notifyAdmins(); never breaks login.
                \App\Notifications\NewUserRegistered::notifyAdmins(
                    $user,
                    $signupHost,
                    $websiteName,
                    'Google sign-in'
                );

                // Registration confirmation to the registrant — guarded inside send().
                \App\Notifications\WelcomeNewUser::send($user, $signupHost, $websiteName);
            }

            $redirectTo = $request->session()->pull('post_login_redirect');
            $redirectTo = is_string($redirectTo) ? $this->safeRelativeRedirect($redirectTo) : null;

            // Relayed sign-in: hand the session off to the tenant domain via
            // a single-use short-lived token instead of logging in here.
            if ($origin !== '') {
                $token = Str::random(64);
                Cache::put('google_login:' . $token, [
                    'user_id' => $user->id,
                    'redirect_to' => $redirectTo,
                ], now()->addMinutes(5));

                return redirect()->away($request->getScheme() . '://' . $origin . '/auth/google/complete?token=' . $token);
            }

            Auth::login($user, true);

            // If we stashed a page-level redirect when the user clicked the
            // modal's "Sign in with Google", honor it now.
            if ($redirectTo !== null) {
                return redirect($redirectTo);
            }

            return redirect()->intended('/dashboard');

        } catch (Exception $e) {
            Log::error('Google OAuth Callback Error: ' . $e->getMessage());
            return redirect('/login')->withErrors(['google' => 'Unable to authenticate with Google: ' . $e->getMessage()]);
        }
    }

    /**
     * Complete a relayed Google sign-in on the tenant domain: exchange the
     * one-time token minted by the callback host for a local session.
     */
    public function completeFromToken(Request $request)
    {
        $token = (string) $request->query('token', '');
        $payload = $token !== '' ? Cache::pull('google_login:' . $token) : null;

        if (!is_array($payload) || empty($payload['user_id'])) {
            return redirect('/login')->withErrors(['google' => 'This sign-in link has expired. Please try again.']);
        }

        $user = User::find($payload['user_id']);
        if (!$user) {
            return redirect('/login')->withErrors(['google' => 'Unable to complete sign-in. Please try again.']);
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        $redirectTo = $this->safeRelativeRedirect($payload['redirect_to'] ?? null);

        return redirect($redirectTo ?? '/');
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

                $websiteName = app(\App\Services\Tenancy\TenantResolver::class)->resolve(request())?->name;

                // Tell the admins — guarded inside notifyAdmins(); never breaks login.
                \App\Notifications\NewUserRegistered::notifyAdmins(
                    $user,
                    request()->getHost(),
                    $websiteName,
                    'Google sign-in'
                );

                // Registration confirmation to the registrant — guarded inside send().
                \App\Notifications\WelcomeNewUser::send($user, request()->getHost(), $websiteName);
            }

            Auth::login($user, true);

            return redirect()->intended('/dashboard');

        } catch (Exception $e) {
            Log::error('Google OAuth Callback Error: ' . $e->getMessage());
            return redirect('/login')->withErrors(['google' => 'Unable to authenticate with Google: ' . $e->getMessage()]);
        }
    }
}
