<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateApiKeysRequest;
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

        return Inertia::render('Admin/Dashboard', [
            'title' => 'Dashboard',
            'stats' => [
                'total_properties' => 0, // Will be populated from MLS API
                'active_listings' => 0,
                'pending_listings' => 0,
                'total_users' => \App\Models\User::count(),
            ],
            'websites' => $websites
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
        return Inertia::render('Admin/ApiKeys', [
            'title' => 'API Keys',
            'api_keys' => [
                'ampre_api_url' => config('ampre.api_url'),
                'ampre_vow_token' => config('ampre.vow_token') ? '••••••••••••' . substr(config('ampre.vow_token'), -4) : '',
                'ampre_idx_token' => config('ampre.idx_token') ? '••••••••••••' . substr(config('ampre.idx_token'), -4) : '',
                'google_maps_api_key' => config('ampre.google_maps_api_key') ? '••••••••••••' . substr(config('ampre.google_maps_api_key'), -4) : '',
                'walkscore_api_key' => config('ampre.walkscore_api_key') ? '••••••••••••' . substr(config('ampre.walkscore_api_key'), -4) : '',
            ],
            'status' => session('status')
        ]);
    }

    /**
     * Update API Keys
     */
    public function updateApiKeys(UpdateApiKeysRequest $request): RedirectResponse
    {

        // In a real application, you would save these to a database or update .env file
        // For now, we'll just show a success message
        
        // You could save to database like this:
        // \App\Models\Setting::updateOrCreate(['key' => 'ampre_vow_token'], ['value' => $request->ampre_vow_token]);
        
        // Or update .env file programmatically (be careful with this approach)
        $this->updateEnvFile([
            'AMPRE_API_URL' => $request->ampre_api_url ?? config('ampre.api_url'),
            'AMPRE_VOW_TOKEN' => $request->ampre_vow_token ?? '',
            'AMPRE_IDX_TOKEN' => $request->ampre_idx_token ?? '',
            'GOOGLE_MAPS_API_KEY' => $request->google_maps_api_key ?? '',
            'WALKSCORE_API_KEY' => $request->walkscore_api_key ?? '',
        ]);

        return redirect()->route('admin.api-keys')->with('status', 'API keys updated successfully!');
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
                    if (empty(config('ampre.vow_token'))) {
                        $result['message'] = 'AMPRE VOW token is not configured.';
                        break;
                    }
                    
                    $ampreService = app(\App\Services\AmpreApiService::class);
                    $properties = $ampreService->setTop(1)->setSelect(['ListingKey'])->fetchProperties();
                    
                    $result['success'] = true;
                    $result['message'] = 'AMPRE API connection successful!';
                    $result['data'] = ['property_count' => count($properties)];
                    break;

                case 'google_maps':
                    // Test Google Maps API (simple geocoding test)
                    if (empty(config('ampre.google_maps_api_key'))) {
                        $result['message'] = 'Google Maps API key is not configured.';
                        break;
                    }
                    
                    $response = \Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
                        'address' => 'Toronto, ON, Canada',
                        'key' => config('ampre.google_maps_api_key')
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
                    if (empty(config('ampre.walkscore_api_key'))) {
                        $result['message'] = 'WalkScore API key is not configured.';
                        break;
                    }
                    
                    $response = \Http::get('http://api.walkscore.com/score', [
                        'format' => 'json',
                        'address' => 'Toronto ON Canada',
                        'lat' => 43.6532,
                        'lon' => -79.3832,
                        'wsapikey' => config('ampre.walkscore_api_key')
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
}