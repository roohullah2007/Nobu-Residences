<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateApiKeysRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Admin dashboard
     */
    public function dashboard(): Response
    {
        // Get actual websites data - currently just the default website
        $websites = [
            [
                'id' => 1,
                'name' => 'Nobu Residences',
                'domain' => 'Default Website',
                'status' => 'active',
                'lastUpdated' => 'Today',
                'properties' => 0 // Will be populated from MLS API when connected
            ]
        ];

        // Get contact form stats
        $contactStats = [
            'total_contacts' => \App\Models\ContactForm::count(),
            'unread_contacts' => \App\Models\ContactForm::unread()->count(),
            'recent_contacts' => \App\Models\ContactForm::recent(7)->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'title' => 'Dashboard',
            'stats' => [
                'total_properties' => 0, // Will be populated from MLS API
                'active_listings' => 0,
                'pending_listings' => 0,
                'total_users' => \App\Models\User::count(),
                'total_contacts' => $contactStats['total_contacts'],
                'unread_contacts' => $contactStats['unread_contacts'],
                'recent_contacts' => $contactStats['recent_contacts'],
            ],
            'websites' => $websites,
            'contactStats' => $contactStats
        ]);
    }

    /**
     * Websites management
     */
    public function websites(): Response
    {
        return Inertia::render('Admin/Websites/Index', [
            'title' => 'Website Management',
            'websites' => [
                [
                    'id' => 1,
                    'name' => 'Nobu Residences',
                    'slug' => 'nobu-residences',
                    'domain' => null,
                    'is_default' => true,
                    'is_active' => true,
                    'logo_url' => '/assets/logo.png',
                    'pages' => [
                        ['id' => 1, 'page_type' => 'home', 'title' => 'Home', 'is_active' => true]
                    ]
                ]
            ]
        ]);
    }



    /**
     * API Keys management
     */
    public function apiKeys(): Response
    {
        $apiSettings = Setting::apiSettings()->get()->keyBy('key');
        
        // Get API keys from database or config
        $vowToken = $apiSettings->get('ampre_vow_token')?->value ?? config('ampre.vow_token');
        $idxToken = $apiSettings->get('ampre_idx_token')?->value ?? config('ampre.idx_token');
        $googleMapsKey = $apiSettings->get('google_maps_api_key')?->value ?? config('services.google_maps.key');
        $walkscoreKey = $apiSettings->get('walkscore_api_key')?->value ?? config('services.walkscore.key');
        
        return Inertia::render('Admin/ApiKeys', [
            'title' => 'MLS API Configuration',
            'api_keys' => [
                'ampre_api_url' => $apiSettings->get('ampre_api_url')?->value ?? config('ampre.api_url'),
                'ampre_vow_token' => $this->maskApiKey($vowToken),
                'ampre_idx_token' => $this->maskApiKey($idxToken),
                'google_maps_api_key' => $this->maskApiKey($googleMapsKey),
                'walkscore_api_key' => $this->maskApiKey($walkscoreKey),
            ],
            'mls_settings' => [
                'auto_sync' => $apiSettings->get('mls_auto_sync')?->value ?? true,
                'sync_interval' => $apiSettings->get('mls_sync_interval')?->value ?? 60,
                'max_properties' => $apiSettings->get('mls_max_properties')?->value ?? 1000,
                'default_city' => $apiSettings->get('mls_default_city')?->value ?? 'Toronto',
                'default_building_address' => $apiSettings->get('default_building_address')?->value ?? '55 Mercer Street',
                'cache_ttl' => $apiSettings->get('cache_ttl')?->value ?? 300,
            ],
            'connection_status' => $this->getConnectionStatus(),
            'status' => session('status')
        ]);
    }

    /**
     * Mask API key for display
     */
    private function maskApiKey(?string $key): string
    {
        if (empty($key)) {
            return '';
        }
        
        if (strlen($key) <= 8) {
            return str_repeat('•', strlen($key));
        }
        
        return str_repeat('•', strlen($key) - 4) . substr($key, -4);
    }

    /**
     * Get API connection status
     */
    private function getConnectionStatus(): array
    {
        // Check from database first, then fallback to config
        $vowToken = Setting::get('ampre_vow_token') ?: config('ampre.vow_token');
        $idxToken = Setting::get('ampre_idx_token') ?: config('ampre.idx_token');
        $googleMapsKey = Setting::get('google_maps_api_key') ?: config('services.google_maps.key');
        
        return [
            'ampre_vow' => !empty($vowToken) ? 'configured' : 'not_configured',
            'ampre_idx' => !empty($idxToken) ? 'configured' : 'not_configured', 
            'google_maps' => !empty($googleMapsKey) ? 'configured' : 'not_configured',
            'last_test' => Setting::get('api_last_test_date'),
        ];
    }

    /**
     * Update API Keys
     */
    public function updateApiKeys(UpdateApiKeysRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        // Update API settings in database
        $apiSettings = [
            'ampre_api_url' => $validated['ampre_api_url'] ?? config('ampre.api_url'),
            'ampre_vow_token' => $validated['ampre_vow_token'] ?? '',
            'ampre_idx_token' => $validated['ampre_idx_token'] ?? '',
            'google_maps_api_key' => $validated['google_maps_api_key'] ?? '',
            'walkscore_api_key' => $validated['walkscore_api_key'] ?? '',
        ];

        foreach ($apiSettings as $key => $value) {
            if (!empty($value)) {
                Setting::set($key, $value, [
                    'group' => 'api',
                    'is_encrypted' => in_array($key, ['ampre_vow_token', 'ampre_idx_token', 'google_maps_api_key', 'walkscore_api_key'])
                ]);
            }
        }

        // Update MLS settings if provided
        $mlsSettings = [
            'mls_auto_sync' => $validated['mls_auto_sync'] ?? null,
            'mls_sync_interval' => $validated['mls_sync_interval'] ?? null,
            'mls_max_properties' => $validated['mls_max_properties'] ?? null,
            'mls_default_city' => $validated['mls_default_city'] ?? null,
            'default_building_address' => $validated['default_building_address'] ?? null,
            'cache_ttl' => $validated['cache_ttl'] ?? null,
        ];

        foreach ($mlsSettings as $key => $value) {
            if ($value !== null) {
                Setting::set($key, $value, [
                    'group' => $key === 'cache_ttl' ? 'api' : 'mls'
                ]);
            }
        }

        // Also update .env for immediate config access
        $this->updateEnvFile([
            'AMPRE_API_URL' => $apiSettings['ampre_api_url'],
            'AMPRE_VOW_TOKEN' => $apiSettings['ampre_vow_token'],
            'AMPRE_IDX_TOKEN' => $apiSettings['ampre_idx_token'],
            'GOOGLE_MAPS_API_KEY' => $apiSettings['google_maps_api_key'],
            'WALKSCORE_API_KEY' => $apiSettings['walkscore_api_key'],
        ]);

        return redirect()->route('admin.api-keys')->with('status', 'MLS API configuration updated successfully!');
    }

    /**
     * Test API connection
     */
    public function testApiConnection(Request $request)
    {
        $request->validate([
            'api_type' => 'required|in:ampre,google_maps,walkscore'
        ]);

        $apiType = $request->api_type;
        $result = ['success' => false, 'message' => '', 'data' => null];

        try {
            switch ($apiType) {
                case 'ampre':
                    // Test AMPRE API connection
                    $vowToken = Setting::get('ampre_vow_token') ?: config('ampre.vow_token');
                    if (empty($vowToken)) {
                        $result['message'] = 'AMPRE VOW token is not configured.';
                        break;
                    }
                    
                    $ampreService = app(\App\Services\AmpreApiService::class);
                    $properties = $ampreService->setTop(1)->setSelect(['ListingKey'])->fetchProperties();
                    
                    $result['success'] = true;
                    $result['message'] = 'AMPRE API connection successful!';
                    $result['data'] = ['property_count' => count($properties)];
                    
                    // Store last test date
                    Setting::set('api_last_test_date', now()->toDateTimeString(), [
                        'group' => 'api',
                        'description' => 'Last successful API test timestamp'
                    ]);
                    break;

                case 'google_maps':
                    // Test Google Maps API (simple geocoding test)
                    $googleKey = Setting::get('google_maps_api_key') ?: config('ampre.google_maps_api_key');
                    if (empty($googleKey)) {
                        $result['message'] = 'Google Maps API key is not configured.';
                        break;
                    }
                    
                    $response = \Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
                        'address' => 'Toronto, ON, Canada',
                        'key' => $googleKey
                    ]);
                    
                    if ($response->successful() && $response->json('status') === 'OK') {
                        $result['success'] = true;
                        $result['message'] = 'Google Maps API connection successful!';
                    } else {
                        $result['message'] = 'Google Maps API connection failed: ' . $response->json('error_message', 'Unknown error');
                    }
                    break;

                case 'walkscore':
                    // Test WalkScore API
                    $walkscoreKey = Setting::get('walkscore_api_key') ?: config('ampre.walkscore_api_key');
                    if (empty($walkscoreKey)) {
                        $result['message'] = 'WalkScore API key is not configured.';
                        break;
                    }
                    
                    $response = \Http::get('http://api.walkscore.com/score', [
                        'format' => 'json',
                        'address' => 'Toronto ON Canada',
                        'lat' => 43.6532,
                        'lon' => -79.3832,
                        'wsapikey' => $walkscoreKey
                    ]);
                    
                    if ($response->successful()) {
                        $data = $response->json();
                        if (isset($data['status']) && $data['status'] == 1) {
                            $result['success'] = true;
                            $result['message'] = 'WalkScore API connection successful!';
                            $result['data'] = ['walkscore' => $data['walkscore'] ?? 'N/A'];
                        } else {
                            $result['message'] = 'WalkScore API error: ' . ($data['status'] ?? 'Unknown error');
                        }
                    } else {
                        $result['message'] = 'WalkScore API connection failed.';
                    }
                    break;
            }
        } catch (\Exception $e) {
            $result['message'] = 'Connection test failed: ' . $e->getMessage();
        }

        return response()->json($result);
    }

    /**
     * Update environment file with new values
     */
    private function updateEnvFile(array $data): void
    {
        $envPath = base_path('.env');
        
        if (!file_exists($envPath)) {
            return;
        }

        $envContent = file_get_contents($envPath);

        foreach ($data as $key => $value) {
            $pattern = "/^{$key}=.*$/m";
            $replacement = "{$key}=" . (empty($value) ? '' : $value);
            
            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, $replacement, $envContent);
            } else {
                $envContent .= "\n{$replacement}";
            }
        }

        file_put_contents($envPath, $envContent);
        
        // Clear config cache to load new values
        if (function_exists('opcache_reset')) {
            opcache_reset();
        }
    }

    /**
     * Icon Management
     */
    public function icons(): Response
    {
        $icons = \App\Models\Icon::orderBy('category')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Icons/Index', [
            'title' => 'Icon Management',
            'icons' => $icons
        ]);
    }
}