<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Pushes leads into Follow Up Boss via their Events API
 * (https://docs.followupboss.com — POST /v1/events). The FUB pixel only
 * tracks activity for EXISTING contacts; it cannot create leads from our
 * custom forms, so registrations/enquiries must be reported server-side.
 *
 * Using /events (not /people) is FUB's recommended path: it deduplicates
 * people by email/phone, stamps the lead source, and triggers the
 * account's Lead Flow rules and action plans automatically.
 *
 * Enabled by FUB_API_KEY in .env (services.followupboss.key). Every call
 * is best-effort: failures are logged and never break the user-facing
 * flow (registration, enquiry, tour request...).
 */
class FollowUpBossService
{
    private const EVENTS_URL = 'https://api.followupboss.com/v1/events';
    private const TIMEOUT_SECONDS = 10;

    public function isEnabled(): bool
    {
        return !empty(config('services.followupboss.key'));
    }

    /**
     * Send one lead event. $person: name/email/phone (flat), plus optional
     * 'tags' array and FUB custom fields ('customLocation',
     * 'customNumberOfBedrooms', ...) passed through verbatim. $extra keys:
     * message, property, propertySearch, pageUrl, source.
     *
     * Returns the FUB response (the created/updated person, with 'id') or
     * null on failure — callers needing the personId (appointments) read it
     * from here.
     */
    public function sendEvent(string $type, array $person, array $extra = []): ?array
    {
        if (!$this->isEnabled()) {
            return null;
        }

        try {
            $source = $extra['source'] ?? $this->defaultSource();

            $formattedPerson = $this->formatPerson($person);
            // Tag every lead with its site name so FUB can filter/automate
            // per landing page ("The Well").
            $formattedPerson['tags'] = array_values(array_unique(array_merge(
                $formattedPerson['tags'] ?? [],
                [$source]
            )));

            $payload = array_merge(
                [
                    'source' => $source,
                    'system' => (string) (config('services.followupboss.system') ?: config('app.name')),
                    'type' => $type,
                    'person' => $formattedPerson,
                ],
                array_filter([
                    'message' => $extra['message'] ?? null,
                    'property' => $extra['property'] ?? null,
                    'propertySearch' => $extra['propertySearch'] ?? null,
                    'pageUrl' => $extra['pageUrl'] ?? null,
                ])
            );

            $response = Http::withBasicAuth((string) config('services.followupboss.key'), '')
                ->acceptJson()
                ->timeout(self::TIMEOUT_SECONDS)
                ->post(self::EVENTS_URL, $payload);

            if (!$response->successful()) {
                Log::warning('Follow Up Boss rejected event', [
                    'type' => $type,
                    'status' => $response->status(),
                    'body' => substr($response->body(), 0, 500),
                ]);

                return null;
            }

            Log::info('Follow Up Boss event sent', [
                'type' => $type,
                'source' => $payload['source'],
                'fub_id' => $response->json('id'),
            ]);

            return $response->json() ?: [];
        } catch (\Throwable $e) {
            Log::warning('Follow Up Boss event failed', ['type' => $type, 'error' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * Create a FUB appointment (shows on the person's Appointments panel and
     * the account calendar). Guarded: failures log and return false.
     *
     * @param array $invitees e.g. [['personId' => 123, 'name' => '...', 'email' => '...']]
     */
    public function createAppointment(
        string $title,
        \DateTimeInterface $start,
        \DateTimeInterface $end,
        array $invitees = [],
        ?string $description = null,
        ?string $location = null
    ): bool {
        if (!$this->isEnabled()) {
            return false;
        }

        try {
            $response = Http::withBasicAuth((string) config('services.followupboss.key'), '')
                ->acceptJson()
                ->timeout(self::TIMEOUT_SECONDS)
                ->post('https://api.followupboss.com/v1/appointments', array_filter([
                    'title' => $title,
                    'start' => $start->format('c'),
                    'end' => $end->format('c'),
                    'invitees' => $invitees ?: null,
                    'description' => $description,
                    'location' => $location,
                ]));

            if (!$response->successful()) {
                Log::warning('Follow Up Boss rejected appointment', [
                    'title' => $title,
                    'status' => $response->status(),
                    'body' => substr($response->body(), 0, 500),
                ]);

                return false;
            }

            Log::info('Follow Up Boss appointment created', [
                'title' => $title,
                'appointment_id' => $response->json('id'),
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::warning('Follow Up Boss appointment failed', ['title' => $title, 'error' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Update an existing FUB person located BY EMAIL (e.g. add the phone a
     * Google-sign-up user supplied after the fact). Guarded; returns false
     * when disabled, the person isn't found, or the API rejects the update.
     */
    public function updatePersonPhoneByEmail(string $email, string $phone): bool
    {
        if (!$this->isEnabled() || $email === '' || $phone === '') {
            return false;
        }

        try {
            $auth = Http::withBasicAuth((string) config('services.followupboss.key'), '')
                ->acceptJson()
                ->timeout(self::TIMEOUT_SECONDS);

            $personId = $auth->get('https://api.followupboss.com/v1/people', ['email' => $email])
                ->json('people.0.id');

            if (!$personId) {
                Log::info('Follow Up Boss person not found for phone update', ['email' => $email]);

                return false;
            }

            $response = $auth->put('https://api.followupboss.com/v1/people/' . $personId, [
                'phones' => [['value' => $phone]],
            ]);

            if (!$response->successful()) {
                Log::warning('Follow Up Boss rejected phone update', [
                    'person_id' => $personId,
                    'status' => $response->status(),
                ]);

                return false;
            }

            Log::info('Follow Up Boss phone updated', ['person_id' => $personId]);

            return true;
        } catch (\Throwable $e) {
            Log::warning('Follow Up Boss phone update failed', ['email' => $email, 'error' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Guarded static dispatcher for controller hooks — same contract as
     * WelcomeNewUser::send(): lead capture must never break the flow.
     */
    public static function report(string $type, array $person, array $extra = []): void
    {
        try {
            app(self::class)->sendEvent($type, $person, $extra);
        } catch (\Throwable $e) {
            Log::warning('Follow Up Boss report failed', ['type' => $type, 'error' => $e->getMessage()]);
        }
    }

    /**
     * FUB person shape: split name, emails/phones as value objects; tags and
     * custom fields (customLocation, customNumberOfBedrooms, ...) pass
     * through so the account's Custom Fields populate.
     */
    private function formatPerson(array $person): array
    {
        $nameParts = explode(' ', trim((string) ($person['name'] ?? '')), 2);

        $formatted = array_filter([
            'firstName' => $person['first_name'] ?? ($nameParts[0] ?? null),
            'lastName' => $person['last_name'] ?? ($nameParts[1] ?? null),
            'emails' => !empty($person['email']) ? [['value' => $person['email']]] : null,
            'phones' => !empty($person['phone']) ? [['value' => $person['phone']]] : null,
        ]);

        if (!empty($person['tags']) && is_array($person['tags'])) {
            $formatted['tags'] = array_values($person['tags']);
        }

        foreach ($person as $key => $value) {
            if (str_starts_with($key, 'custom') && $value !== null && $value !== '') {
                $formatted[$key] = $value;
            }
        }

        return $formatted;
    }

    /**
     * Lead source = the landing SITE's name ("The Well"), falling back to
     * the request host, so FUB routes/reports per site by name.
     */
    private function defaultSource(): string
    {
        try {
            if (!app()->runningInConsole()) {
                $website = app(\App\Services\Tenancy\TenantResolver::class)->resolve(request());

                return $website?->name ?: request()->getHost();
            }
        } catch (\Throwable $e) {
            // Fall through to the config-based fallback.
        }

        return parse_url((string) config('app.url'), PHP_URL_HOST) ?: 'website';
    }
}
