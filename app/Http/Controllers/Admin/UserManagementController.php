<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * List users with optional search + pagination.
     */
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));

        $query = User::query();

        if ($q !== '') {
            $like = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $q) . '%';
            $query->where(function ($w) use ($like) {
                $w->where('name', 'like', $like)
                  ->orWhere('email', 'like', $like)
                  ->orWhere('phone', 'like', $like);
            });
        }

        $users = $query
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(function (User $u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone,
                    'role' => $u->role,
                    'is_active' => (bool) $u->is_active,
                    'created_at' => optional($u->created_at)->toDateString(),
                ];
            });

        return Inertia::render('Admin/Users/Index', [
            'title' => 'Users',
            'users' => $users,
            'filters' => ['q' => $q],
        ]);
    }

    /**
     * Show edit form for a user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'title' => 'Edit User: ' . $user->name,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'is_active' => (bool) $user->is_active,
                'created_at' => optional($user->created_at)->toDateTimeString(),
            ],
            'roles' => [
                ['value' => 'user', 'label' => 'User'],
                ['value' => 'admin', 'label' => 'Admin'],
            ],
        ]);
    }

    /**
     * Persist edits.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:50',
            'role' => ['required', Rule::in(['user', 'admin'])],
            'is_active' => 'boolean',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Prevent an admin from demoting themselves out of admin
        if (Auth::id() === $user->id && $validated['role'] !== 'admin') {
            return back()->withErrors(['role' => 'You cannot remove your own admin role.']);
        }

        $update = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ];
        if (!empty($validated['password'])) {
            $update['password'] = Hash::make($validated['password']);
        }

        $user->update($update);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User updated.');
    }

    /**
     * Soft-delete a user.
     */
    public function destroy(User $user): RedirectResponse
    {
        if (Auth::id() === $user->id) {
            return back()->withErrors(['user' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deleted.');
    }
}
