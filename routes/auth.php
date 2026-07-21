<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Auth\GoogleAuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    // Everything below is tenant-site-only: the main/admin domain
    // (pcdadmin.com) exposes nothing but the bare login screen, so these
    // URLs 404 there (see NotOnMainDomain).
    Route::middleware('not.main-domain')->group(function () {
        Route::get('register', [RegisteredUserController::class, 'create'])
            ->name('register');

        Route::post('register', [RegisteredUserController::class, 'store']);

        Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
            ->name('password.request');

        Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
            ->name('password.email');

        Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
            ->name('password.reset');

        Route::post('reset-password', [NewPasswordController::class, 'store'])
            ->name('password.store');
    });

});

// Google OAuth redirect. Deliberately OUTSIDE not.main-domain (the OAuth
// callback URI is registered for ONE host, so tenant domains relay the
// sign-in through that host via ?origin={tenant}) AND outside guest: a
// session already signed in on the callback host — e.g. the site owner
// logged into the admin on pcdadmin.com — used to make the guest
// middleware bounce the relay hop to the callback host's own /dashboard
// instead of continuing to Google. The controller 404s plain visits on
// the main/admin domain and sends already-authenticated visitors back.
Route::get('auth/google', [GoogleAuthController::class, 'redirectToGoogle'])
    ->name('auth.google');

// Google OAuth callback - outside guest middleware to avoid session issues
Route::get('auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback'])
    ->name('auth.google.callback');

// Completes a relayed Google sign-in on the tenant domain: exchanges the
// one-time token minted by the callback host for a local session.
Route::get('auth/google/complete', [GoogleAuthController::class, 'completeFromToken'])
    ->name('auth.google.complete');

Route::middleware('auth')->group(function () {
    // "Add your phone number" step after Google sign-ins (Google provides
    // no phone); saving also completes the FUB lead profile.
    Route::get('complete-phone', [\App\Http\Controllers\Auth\CompletePhoneController::class, 'create'])
        ->name('profile.complete-phone');
    Route::post('complete-phone', [\App\Http\Controllers\Auth\CompletePhoneController::class, 'store'])
        ->name('profile.complete-phone.store');

    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
