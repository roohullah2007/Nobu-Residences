<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    /**
     * Store a newsletter subscriber (from the blog "Stay Updated" form, etc.).
     * Idempotent — re-subscribing an existing email just confirms / reactivates.
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = strtolower(trim($validated['email']));

        $subscriber = NewsletterSubscriber::firstOrCreate(
            ['email' => $email],
            ['source' => $request->input('source', 'blog'), 'is_active' => true]
        );

        // Re-activate someone who had previously unsubscribed.
        if (! $subscriber->wasRecentlyCreated && ! $subscriber->is_active) {
            $subscriber->update(['is_active' => true]);
        }

        return response()->json([
            'success' => true,
            'already' => ! $subscriber->wasRecentlyCreated,
            'message' => $subscriber->wasRecentlyCreated
                ? 'Thanks for subscribing!'
                : "You're already on the list — thanks!",
        ]);
    }
}
