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
     * Send one lead event. $person: name/email/phone (flat). $extra keys:
     * message, property, propertySearch, pageUrl, source.
     */
    public function sendEvent(string $type, array $person, array $extra = []): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        try {
            $payload = array_merge(
                [
                    'source' => $extra['source'] ?? $this->defaultSource(),
                    'system' => (string) (config('services.followupboss.system') ?: config('app.name')),
                    'type' => $type,
                    'person' => $this->formatPerson($person),
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

                return false;
            }

            Log::info('Follow Up Boss event sent', [
                'type' => $type,
                'source' => $payload['source'],
                'fub_id' => $response->json('id'),
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::warning('Follow Up Boss event failed', ['type' => $type, 'error' => $e->getMessage()]);

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
     * FUB person shape: split name, emails/phones as value objects.
     */
    private function formatPerson(array $person): array
    {
        $nameParts = explode(' ', trim((string) ($person['name'] ?? '')), 2);

        return array_filter([
            'firstName' => $person['first_name'] ?? ($nameParts[0] ?? null),
            'lastName' => $person['last_name'] ?? ($nameParts[1] ?? null),
            'emails' => !empty($person['email']) ? [['value' => $person['email']]] : null,
            'phones' => !empty($person['phone']) ? [['value' => $person['phone']]] : null,
        ]);
    }

    /**
     * Lead source = the landing domain the request came in on, so FUB can
     * route/report per site.
     */
    private function defaultSource(): string
    {
        if (!app()->runningInConsole()) {
            return request()->getHost();
        }

        return parse_url((string) config('app.url'), PHP_URL_HOST) ?: 'website';
    }
}
