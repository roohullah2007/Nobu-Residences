<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use App\Services\RepliersApiService;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Create client in Repliers API
        try {
            $repliersApi = app(RepliersApiService::class);
            $nameParts = explode(' ', $request->name, 2);
            $clientData = $repliersApi->createClient([
                'email' => $request->email,
                'first_name' => $nameParts[0] ?? $request->name,
                'last_name' => $nameParts[1] ?? '',
                'phone' => $request->phone ?? null,
            ]);

            if ($clientData && !empty($clientData['clientId'])) {
                $user->update(['repliers_client_id' => (string) $clientData['clientId']]);
                Log::info('Repliers client created for user', ['user_id' => $user->id, 'clientId' => $clientData['clientId']]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to create Repliers client on registration', ['error' => $e->getMessage()]);
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('user.dashboard', absolute: false));
    }
}
