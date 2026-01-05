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
    public function redirectToGoogle()
    {
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
    public function handleGoogleCallback()
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
            }

            Auth::login($user, true);

            return redirect()->intended('/dashboard');

        } catch (Exception $e) {
            Log::error('Google OAuth Callback Error: ' . $e->getMessage());
            return redirect('/login')->withErrors(['google' => 'Unable to authenticate with Google: ' . $e->getMessage()]);
        }
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
            }

            Auth::login($user, true);

            return redirect()->intended('/dashboard');

        } catch (Exception $e) {
            Log::error('Google OAuth Callback Error: ' . $e->getMessage());
            return redirect('/login')->withErrors(['google' => 'Unable to authenticate with Google: ' . $e->getMessage()]);
        }
    }
}
