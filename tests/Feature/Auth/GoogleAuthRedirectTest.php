<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Website;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The Google sign-in relay: tenant domains hop through the single registered
 * OAuth callback host. Regression coverage for the bug where a session
 * already signed in on the callback host (site owner logged into the admin)
 * made the guest middleware bounce the relay hop to the callback host's own
 * /dashboard instead of continuing to Google.
 */
class GoogleAuthRedirectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.google.client_id' => 'test-client-id',
            'services.google.client_secret' => 'test-client-secret',
            'services.google.redirect' => 'https://callback.test/auth/google/callback',
        ]);
    }

    private function makeTenantSite(string $domain): Website
    {
        return Website::create([
            'name' => 'XO2 Condos',
            'slug' => 'xo2-condos',
            'domain' => $domain,
            'is_active' => true,
        ]);
    }

    public function test_relay_hop_continues_to_google_when_already_signed_in_on_callback_host(): void
    {
        $this->makeTenantSite('xo2.test');
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get('https://callback.test/auth/google?origin=xo2.test');

        $response->assertRedirect();
        $location = $response->headers->get('Location');
        $this->assertStringContainsString('accounts.google.com', $location);
        $this->assertStringNotContainsString('dashboard', $location);
    }

    public function test_guest_relay_hop_continues_to_google(): void
    {
        $this->makeTenantSite('xo2.test');

        $response = $this->get('https://callback.test/auth/google?origin=xo2.test');

        $response->assertRedirect();
        $this->assertStringContainsString('accounts.google.com', $response->headers->get('Location'));
    }

    public function test_signed_in_visitor_starting_google_login_stays_on_their_site(): void
    {
        $this->makeTenantSite('xo2.test');
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get('https://xo2.test/auth/google?redirect_to=/search');

        $response->assertRedirect();
        $location = $response->headers->get('Location');
        $this->assertStringContainsString('xo2.test', $location);
        $this->assertStringNotContainsString('callback.test', $location);
    }

    public function test_tenant_start_hops_to_the_callback_host_with_origin(): void
    {
        $this->makeTenantSite('xo2.test');

        $response = $this->get('https://xo2.test/auth/google?redirect_to=/search');

        $response->assertRedirect();
        $location = $response->headers->get('Location');
        $this->assertStringContainsString('callback.test/auth/google', $location);
        $this->assertStringContainsString('origin=xo2.test', $location);
    }
}
