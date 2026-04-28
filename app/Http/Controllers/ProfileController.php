<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        // MainLayout expects the same structured `website` shape that
        // WebsiteController::getWebsiteSettings() produces. Passing the raw
        // model instead skips the brand_colors/contact_info/agent_info
        // accessors and the page falls back to default styling — which is
        // why /profile previously rendered with a different look than the
        // rest of the site.
        $website = \App\Models\Website::with('agentInfo')
            ->where('is_default', true)
            ->where('is_active', true)
            ->first()
            ?? \App\Models\Website::with('agentInfo')->first();

        $websiteData = null;
        $headerLinks = null;
        if ($website) {
            $homePage = $website->homePage();
            $homePageContent = $homePage?->content ?? null;
            if ($homePageContent) {
                $contentData = is_string($homePageContent) ? json_decode($homePageContent, true) : $homePageContent;
                $headerLinks = $contentData['header_links'] ?? null;
            }

            $websiteData = [
                'id' => $website->id,
                'name' => $website->name,
                'slug' => $website->slug,
                'logo_url' => $website->logo_url,
                'logo_width' => $website->logo_width,
                'logo_height' => $website->logo_height,
                'brand_colors' => $website->getBrandColors(),
                'fonts' => $website->fonts,
                'meta_title' => $website->meta_title,
                'meta_description' => $website->meta_description,
                'favicon_url' => $website->favicon_url,
                'contact_info' => $website->getContactInfo(),
                'social_media' => $website->getSocialMedia(),
                'agent_info' => $website->agentInfo,
                'header_links' => $headerLinks,
            ];
        }

        return Inertia::render('Profile/UserProfile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'website' => $websiteData,
            'siteName' => $website?->name ?? 'Nobu Residences',
            'siteUrl' => $website?->domain ?? request()->getHost(),
            'year' => date('Y'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        // Log the incoming request data for debugging
        \Log::info('Profile update request:', [
            'all_data' => $request->all(),
            'has_file' => $request->hasFile('photo'),
            'method' => $request->method()
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $request->user()->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:500'],
            'photo' => ['nullable', 'image', 'max:2048'], // 2MB Max
        ]);

        $user = $request->user();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new photo
            $path = $request->file('photo')->store('avatars', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        // Update user data
        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'bio' => $validated['bio'] ?? null,
        ]);

        if (isset($validated['avatar'])) {
            $user->avatar = $validated['avatar'];
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Log the saved data
        \Log::info('Profile updated successfully:', [
            'user_id' => $user->id,
            'updated_data' => $user->only(['name', 'email', 'phone', 'bio', 'avatar'])
        ]);

        return back()->with('status', 'Profile updated successfully!');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $request->user()->update([
            'password' => bcrypt($validated['password']),
        ]);

        return back()->with('status', 'Password updated successfully!');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        // Delete user's avatar if exists
        if ($user->avatar && Storage::disk('public')->exists(str_replace('/storage/', '', $user->avatar))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
        }

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}