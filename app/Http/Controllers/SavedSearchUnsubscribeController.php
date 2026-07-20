<?php

namespace App\Http\Controllers;

use App\Models\SavedSearch;
use App\Support\EmailBranding;
use Illuminate\Http\Request;
use Illuminate\View\View;

/**
 * One-click unsubscribe from a saved-search alert email. The link is a
 * signed URL (no login required — the recipient may not have a session on
 * this device), validated by the 'signed' middleware; it only ever turns
 * email_alerts off for that one saved search.
 */
class SavedSearchUnsubscribeController extends Controller
{
    public function __invoke(Request $request, SavedSearch $savedSearch): View
    {
        $savedSearch->update(['email_alerts' => false]);

        $branding = EmailBranding::forWebsite($savedSearch->website);

        return view('alerts.unsubscribed', [
            'siteName' => $branding['siteName'],
            'homeUrl' => $branding['homeUrl'],
            'searchName' => $savedSearch->name,
        ]);
    }
}
