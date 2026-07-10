<?php

namespace App\Services;

use App\Models\Developer;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Condos.ca Developers API client (see DEVELOPERS-API-DOCS.md). Powers the
 * developer auto-match/search on the building and developer admin forms and
 * imports API developers into the local developers table. All calls run
 * server-side so the API key never reaches the browser.
 */
class DevelopersApiService
{
    // Remote data is a static scrape — cache generously to stay far away
    // from the 200 req/min rate limit.
    private const CACHE_TTL = 600;

    private const TIMEOUT = 10;

    protected string $baseUrl;
    protected string $key;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.developers_api.base_url', ''), '/');
        $this->key = (string) config('services.developers_api.key', '');
    }

    public function isConfigured(): bool
    {
        return $this->baseUrl !== '' && $this->key !== '';
    }

    /**
     * Search developers and buildings by name (min 2 characters).
     * Returns ['developers' => [...], 'buildings' => [...]].
     */
    public function search(string $query): array
    {
        $query = trim($query);
        if (!$this->isConfigured() || mb_strlen($query) < 2) {
            return ['developers' => [], 'buildings' => []];
        }

        return Cache::remember(
            'developers_api.search.' . md5(mb_strtolower($query)),
            self::CACHE_TTL,
            function () use ($query) {
                $json = $this->get('/api/search', ['q' => $query]);

                return [
                    'developers' => $json['developers'] ?? [],
                    'buildings' => $json['buildings'] ?? [],
                ];
            }
        );
    }

    /**
     * Full developer profile (including its buildings) by API slug.
     */
    public function getDeveloper(string $slug): ?array
    {
        $slug = trim($slug);
        if (!$this->isConfigured() || $slug === '') {
            return null;
        }

        return Cache::remember(
            'developers_api.developer.' . $slug,
            self::CACHE_TTL,
            fn () => $this->get('/api/developers/' . rawurlencode($slug))['data'] ?? null
        );
    }

    /**
     * Find the API developer behind a building name ("The Brighton" ->
     * Bosa Development). An exact case-insensitive building-name match wins;
     * otherwise a single search hit is trusted. Returns the developer
     * summary (slug, name, logo_url, website) or null when nothing matches.
     */
    public function matchDeveloperByBuildingName(string $buildingName): ?array
    {
        $needle = $this->normalizeName($buildingName);
        if ($needle === '') {
            return null;
        }

        $results = $this->search($buildingName);
        $buildings = $results['buildings'];

        $match = collect($buildings)->first(
            fn ($building) => $this->normalizeName($building['building_name'] ?? '') === $needle
        ) ?? (count($buildings) === 1 ? $buildings[0] : null);

        $developerName = trim((string) ($match['developer_name'] ?? ''));
        if ($developerName === '') {
            return null;
        }

        // The buildings payload carries no developer slug — resolve it from
        // the developers half of the same search, else a search on the name.
        return $this->findDeveloperByName($developerName, $results['developers'])
            ?? $this->findDeveloperByName($developerName, $this->search($developerName)['developers']);
    }

    /**
     * Import an API developer into the local developers table. An existing
     * developer (matched by slug, then by name) is reused and ONLY its empty
     * fields are filled — local data always wins. Returns the local model.
     */
    public function importDeveloper(string $slug): ?Developer
    {
        $remote = $this->getDeveloper($slug);
        if (!$remote || empty($remote['name'])) {
            return null;
        }

        $name = trim($remote['name']);
        $remoteSlug = trim((string) ($remote['slug'] ?? $slug));

        // withTrashed: a soft-deleted developer still holds its unique slug,
        // so re-importing must revive that row instead of colliding on it.
        $developer = Developer::withTrashed()
            ->where('slug', $remoteSlug)
            ->orWhereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        if ($developer && $developer->trashed()) {
            $developer->restore();
        }

        if (!$developer) {
            $developer = new Developer([
                'name' => $name,
                'slug' => $remoteSlug,
                'type' => 'developer',
            ]);
        }

        if (empty($developer->website) && !empty($remote['website'])) {
            $developer->website = $remote['website'];
        }
        if (empty($developer->logo) && !empty($remote['logo_url'])) {
            $developer->logo = $this->downloadLogo($remote['logo_url'], $remoteSlug ?: Str::slug($name));
        }

        $developer->save();

        return $developer;
    }

    protected function findDeveloperByName(string $name, array $developers): ?array
    {
        $needle = $this->normalizeName($name);

        return collect($developers)->first(
            fn ($developer) => $this->normalizeName($developer['name'] ?? '') === $needle
        );
    }

    /**
     * Copy the API-hosted logo into local public storage so it renders the
     * same way as uploaded logos (/storage/{path}). Null on any failure —
     * a missing logo must never block the import.
     */
    protected function downloadLogo(string $url, string $slug): ?string
    {
        try {
            $response = Http::timeout(self::TIMEOUT)->get($url);
            if (!$response->successful() || $response->body() === '') {
                return null;
            }

            $extension = strtolower(pathinfo((string) parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION)) ?: 'jpg';
            $path = 'developers/' . $slug . '.' . $extension;
            Storage::disk('public')->put($path, $response->body());

            return $path;
        } catch (\Throwable $e) {
            Log::warning('Developers API logo download failed', ['url' => $url, 'error' => $e->getMessage()]);

            return null;
        }
    }

    protected function normalizeName(string $name): string
    {
        return trim(mb_strtolower((string) preg_replace('/\s+/', ' ', $name)));
    }

    protected function get(string $path, array $query = []): array
    {
        try {
            $response = Http::withHeaders(['X-API-Key' => $this->key])
                ->acceptJson()
                ->timeout(self::TIMEOUT)
                ->get($this->baseUrl . $path, $query);

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            Log::warning('Developers API request failed', ['path' => $path, 'status' => $response->status()]);
        } catch (\Throwable $e) {
            Log::error('Developers API request exception', ['path' => $path, 'error' => $e->getMessage()]);
        }

        return [];
    }
}
