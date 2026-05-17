<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Settings each section manages. The structure declares which keys live
     * in which group and how each should be persisted (encrypted, type).
     */
    private function schema(): array
    {
        return [
            'general' => [
                ['key' => 'site_name',      'type' => 'string',  'is_public' => true],
                ['key' => 'site_tagline',   'type' => 'string',  'is_public' => true],
                ['key' => 'contact_email',  'type' => 'string',  'is_public' => true],
                ['key' => 'contact_phone',  'type' => 'string',  'is_public' => true],
                ['key' => 'contact_address','type' => 'string',  'is_public' => true],
                ['key' => 'default_timezone','type' => 'string', 'is_public' => true],
                ['key' => 'facebook_url',   'type' => 'string',  'is_public' => true],
                ['key' => 'instagram_url',  'type' => 'string',  'is_public' => true],
                ['key' => 'twitter_url',    'type' => 'string',  'is_public' => true],
                ['key' => 'linkedin_url',   'type' => 'string',  'is_public' => true],
            ],
            'api' => [
                ['key' => 'repliers_api_key',  'type' => 'string', 'is_encrypted' => true, 'sensitive' => true],
                ['key' => 'gemini_api_key',    'type' => 'string', 'is_encrypted' => true, 'sensitive' => true],
                ['key' => 'google_maps_api_key','type' => 'string','is_encrypted' => true, 'sensitive' => true],
                ['key' => 'ploi_api_token',    'type' => 'string', 'is_encrypted' => true, 'sensitive' => true],
                ['key' => 'ploi_server_id',    'type' => 'string'],
                ['key' => 'ploi_site_id',      'type' => 'string'],
            ],
            'email' => [
                ['key' => 'mail_from_address',     'type' => 'string'],
                ['key' => 'mail_from_name',        'type' => 'string'],
                ['key' => 'mail_driver',           'type' => 'string'],
                ['key' => 'notify_on_contact',     'type' => 'boolean'],
                ['key' => 'notify_on_tour_request','type' => 'boolean'],
                ['key' => 'notify_on_new_user',    'type' => 'boolean'],
            ],
        ];
    }

    public function index(): Response
    {
        $schema = $this->schema();

        // Pull current values and mask sensitive ones for display
        $values = [];
        foreach ($schema as $group => $fields) {
            $values[$group] = [];
            foreach ($fields as $f) {
                $raw = Setting::get($f['key']);
                $isSensitive = !empty($f['sensitive']);
                if ($isSensitive) {
                    $values[$group][$f['key']] = [
                        'has_value' => !empty($raw),
                        'masked' => $this->mask($raw),
                    ];
                } else {
                    $values[$group][$f['key']] = $raw;
                }
            }
        }

        return Inertia::render('Admin/Settings/Index', [
            'title' => 'Settings',
            'schema' => $schema,
            'values' => $values,
            'timezones' => [
                'America/Toronto', 'America/New_York', 'America/Vancouver',
                'America/Los_Angeles', 'America/Chicago', 'UTC',
            ],
            'mail_drivers' => ['smtp', 'sendmail', 'mailgun', 'ses', 'postmark', 'log'],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $group = $request->input('group');
        $schema = $this->schema();

        if (!$group || !isset($schema[$group])) {
            return back()->withErrors(['group' => 'Unknown settings group.']);
        }

        $rules = [];
        foreach ($schema[$group] as $f) {
            $key = $f['key'];
            $type = $f['type'] ?? 'string';
            $rules[$key] = match ($type) {
                'boolean' => 'nullable|boolean',
                'integer' => 'nullable|integer',
                'float'   => 'nullable|numeric',
                default   => 'nullable|string|max:5000',
            };
        }

        $validated = $request->validate($rules);

        foreach ($schema[$group] as $f) {
            $key = $f['key'];
            if (!array_key_exists($key, $validated)) {
                continue;
            }
            $value = $validated[$key];

            // For sensitive keys: don't overwrite when input is left blank
            if (!empty($f['sensitive']) && ($value === null || $value === '')) {
                continue;
            }

            Setting::set($key, $value, [
                'group' => $group,
                'type' => $f['type'] ?? 'string',
                'is_public' => $f['is_public'] ?? false,
                'is_encrypted' => $f['is_encrypted'] ?? false,
            ]);
        }

        return back()->with('success', ucfirst($group) . ' settings saved.');
    }

    private function mask($value): string
    {
        if (empty($value) || !is_string($value)) {
            return '';
        }
        $tail = substr($value, -4);
        return str_repeat('•', max(0, min(20, strlen($value) - 4))) . $tail;
    }
}
