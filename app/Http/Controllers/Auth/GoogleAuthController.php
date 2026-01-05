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
            Log::info('=== GOOGLE AUTH DEBUG ===');
            Log::info('Step 1: redirectToGoogle() called');
            Log::info('Google Client ID: ' . (config('services.google.client_id') ? 'SET (' . substr(config('services.google.client_id'), 0, 20) . '...)' : 'NOT SET'));
            Log::info('Google Client Secret: ' . (config('services.google.client_secret') ? 'SET' : 'NOT SET'));
            Log::info('Google Redirect URI: ' . config('services.google.redirect'));

            $redirectUrl = Socialite::driver('google')->redirect()->getTargetUrl();
            Log::info('Step 2: Redirect URL generated: ' . $redirectUrl);

            return Socialite::driver('google')->redirect();
        } catch (Exception $e) {
            Log::error('Google Redirect Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return redirect('/login')->withErrors(['google' => 'Google login failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback()
    {
        Log::info('=== GOOGLE CALLBACK DEBUG ===');
        Log::info('Step 3: handleGoogleCallback() called');
        Log::info('Request URL: ' . request()->fullUrl());
        Log::info('Has code param: ' . (request()->has('code') ? 'YES' : 'NO'));
        Log::info('Has error param: ' . (request()->has('error') ? 'YES - ' . request()->get('error') : 'NO'));

        try {
            Log::info('Step 4: Getting Google user...');
            $googleUser = Socialite::driver('google')->user();
            Log::info('Step 5: Google user retrieved: ' . $googleUser->email);
            
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
                    'password' => Hash::make(Str::random(16)), // Random password since they'll use Google
                    'role' => 'user',
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);
            }
            
            Auth::login($user, true); // true for remember me
            Log::info('Step 6: User logged in successfully: ' . $user->email);
            Log::info('Step 7: Redirecting to dashboard...');

            return redirect()->intended('/dashboard');

        } catch (Exception $e) {
            Log::error('Google OAuth Callback Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
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
                    'password' => Hash::make(Str::random(16)), // Random password since they'll use Google
                    'role' => 'user',
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);
            }
            
            Auth::login($user, true);
            
            return redirect()->intended('/dashboard');
            
        } catch (Exception $e) {
            Log::error('Google OAuth Callback Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return redirect('/login')->withErrors(['google' => 'Unable to authenticate with Google: ' . $e->getMessage()]);
        }
    }
}