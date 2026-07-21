<?php

namespace Tests\Feature;

use App\Services\CloudflareService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CloudflareZoneProvisioningTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.cloudflare.token' => 'test-token',
            'services.cloudflare.zone_id' => 'saas-zone',
            'services.cloudflare.account_id' => 'acct-1',
            'services.cloudflare.cname_target' => 'pcdadmin.com',
        ]);
    }

    public function test_zone_provisioning_disabled_without_account_id(): void
    {
        config(['services.cloudflare.account_id' => null]);

        $service = new CloudflareService();

        $this->assertFalse($service->zoneProvisioningEnabled());
        [$ok, $message] = $service->provisionZone('xo2-condos.ca');
        $this->assertFalse($ok);
        $this->assertStringContainsString('not enabled', $message);
    }

    public function test_creates_zone_and_cname_record_for_new_domain(): void
    {
        Http::fake([
            // No existing zone in the account.
            'api.cloudflare.com/client/v4/zones?*' => Http::response([
                'success' => true, 'result' => [],
            ]),
            'api.cloudflare.com/client/v4/zones' => Http::response([
                'success' => true,
                'result' => [
                    'id' => 'zone-123',
                    'name' => 'xo2-condos.ca',
                    'status' => 'pending',
                    'name_servers' => ['pat.ns.cloudflare.com', 'james.ns.cloudflare.com'],
                ],
            ]),
            // No existing DNS records on the apex name.
            'api.cloudflare.com/client/v4/zones/zone-123/dns_records?*' => Http::response([
                'success' => true, 'result' => [],
            ]),
            'api.cloudflare.com/client/v4/zones/zone-123/dns_records' => Http::response([
                'success' => true,
                'result' => ['id' => 'rec-1', 'type' => 'CNAME', 'name' => 'xo2-condos.ca', 'content' => 'pcdadmin.com'],
            ]),
        ]);

        [$ok, $message, $zone] = (new CloudflareService())->provisionZone('xo2-condos.ca');

        $this->assertTrue($ok);
        $this->assertSame('zone-123', $zone['id']);
        $this->assertSame('pending', $zone['status']);
        $this->assertSame(['pat.ns.cloudflare.com', 'james.ns.cloudflare.com'], $zone['name_servers']);
        $this->assertStringContainsString('created automatically', $message);

        Http::assertSent(function ($request) {
            if ($request->method() !== 'POST' || !str_ends_with($request->url(), '/zones')) {
                return false;
            }
            $body = $request->data();

            return $body['name'] === 'xo2-condos.ca' && $body['account']['id'] === 'acct-1';
        });
        Http::assertSent(function ($request) {
            if ($request->method() !== 'POST' || !str_contains($request->url(), '/zones/zone-123/dns_records')) {
                return false;
            }
            $body = $request->data();

            return $body['type'] === 'CNAME'
                && $body['name'] === 'xo2-condos.ca'
                && $body['content'] === 'pcdadmin.com'
                && $body['proxied'] === false;
        });
    }

    public function test_reuses_existing_zone_and_keeps_correct_record(): void
    {
        Http::fake([
            'api.cloudflare.com/client/v4/zones?*' => Http::response([
                'success' => true,
                'result' => [[
                    'id' => 'zone-9',
                    'name' => 'xo2-condos.ca',
                    'status' => 'active',
                    'name_servers' => ['pat.ns.cloudflare.com', 'james.ns.cloudflare.com'],
                ]],
            ]),
            'api.cloudflare.com/client/v4/zones/zone-9/dns_records?*' => Http::response([
                'success' => true,
                'result' => [[
                    'id' => 'rec-1', 'type' => 'CNAME', 'name' => 'xo2-condos.ca', 'content' => 'pcdadmin.com',
                ]],
            ]),
        ]);

        [$ok, $message, $zone] = (new CloudflareService())->provisionZone('xo2-condos.ca');

        $this->assertTrue($ok);
        $this->assertSame('zone-9', $zone['id']);
        $this->assertSame('active', $zone['status']);
        $this->assertStringContainsString('already exists', $message);

        // Nothing was created: no zone POST, no dns_records POST.
        Http::assertNotSent(fn ($request) => $request->method() === 'POST');
    }

    public function test_replaces_conflicting_imported_a_record(): void
    {
        Http::fake([
            'api.cloudflare.com/client/v4/zones?*' => Http::response([
                'success' => true,
                'result' => [[
                    'id' => 'zone-9',
                    'name' => 'xo2-condos.ca',
                    'status' => 'pending',
                    'name_servers' => ['pat.ns.cloudflare.com', 'james.ns.cloudflare.com'],
                ]],
            ]),
            // Auto-imported stale A record from the old DNS host.
            'api.cloudflare.com/client/v4/zones/zone-9/dns_records?*' => Http::response([
                'success' => true,
                'result' => [[
                    'id' => 'rec-old', 'type' => 'A', 'name' => 'xo2-condos.ca', 'content' => '203.0.113.10',
                ]],
            ]),
            'api.cloudflare.com/client/v4/zones/zone-9/dns_records/rec-old' => Http::response(['success' => true]),
            'api.cloudflare.com/client/v4/zones/zone-9/dns_records' => Http::response([
                'success' => true,
                'result' => ['id' => 'rec-new', 'type' => 'CNAME', 'name' => 'xo2-condos.ca', 'content' => 'pcdadmin.com'],
            ]),
        ]);

        [$ok] = (new CloudflareService())->provisionZone('xo2-condos.ca');

        $this->assertTrue($ok);
        Http::assertSent(fn ($request) => $request->method() === 'DELETE'
            && str_ends_with($request->url(), '/zones/zone-9/dns_records/rec-old'));
        Http::assertSent(fn ($request) => $request->method() === 'POST'
            && str_contains($request->url(), '/zones/zone-9/dns_records')
            && $request->data()['type'] === 'CNAME');
    }

    /**
     * The app normalizes domains app-wide (TenantResolver::normalizeHost
     * strips "www."), so a www input provisions the bare apex — zone and
     * record both — matching how the custom hostname is registered.
     */
    public function test_www_domain_normalizes_to_bare_apex(): void
    {
        Http::fake([
            'api.cloudflare.com/client/v4/zones?*' => Http::response(['success' => true, 'result' => []]),
            'api.cloudflare.com/client/v4/zones' => Http::response([
                'success' => true,
                'result' => ['id' => 'zone-w', 'name' => 'xo2-condos.ca', 'status' => 'pending', 'name_servers' => ['a.ns', 'b.ns']],
            ]),
            'api.cloudflare.com/client/v4/zones/zone-w/dns_records?*' => Http::response(['success' => true, 'result' => []]),
            'api.cloudflare.com/client/v4/zones/zone-w/dns_records' => Http::response([
                'success' => true,
                'result' => ['id' => 'rec-1'],
            ]),
        ]);

        [$ok, , $zone] = (new CloudflareService())->provisionZone('www.xo2-condos.ca');

        $this->assertTrue($ok);
        Http::assertSent(fn ($request) => $request->method() === 'POST'
            && str_ends_with($request->url(), '/zones')
            && $request->data()['name'] === 'xo2-condos.ca');
        Http::assertSent(fn ($request) => $request->method() === 'POST'
            && str_contains($request->url(), '/dns_records')
            && $request->data()['name'] === 'xo2-condos.ca');
    }

    public function test_zone_create_failure_reports_error(): void
    {
        Http::fake([
            'api.cloudflare.com/client/v4/zones?*' => Http::response(['success' => true, 'result' => []]),
            'api.cloudflare.com/client/v4/zones' => Http::response([
                'success' => false,
                'errors' => [['code' => 9109, 'message' => 'Invalid or missing zone name.']],
            ], 400),
        ]);

        [$ok, $message, $zone] = (new CloudflareService())->provisionZone('xo2-condos.ca');

        $this->assertFalse($ok);
        $this->assertNull($zone);
        $this->assertStringContainsString('Invalid or missing zone name', $message);
    }

    public function test_record_failure_still_returns_zone_for_scheduler_healing(): void
    {
        Http::fake([
            'api.cloudflare.com/client/v4/zones?*' => Http::response([
                'success' => true,
                'result' => [[
                    'id' => 'zone-9', 'name' => 'xo2-condos.ca', 'status' => 'pending', 'name_servers' => ['a.ns', 'b.ns'],
                ]],
            ]),
            'api.cloudflare.com/client/v4/zones/zone-9/dns_records?*' => Http::response(['success' => false, 'errors' => []], 500),
        ]);

        [$ok, , $zone] = (new CloudflareService())->provisionZone('xo2-condos.ca');

        $this->assertFalse($ok);
        $this->assertNotNull($zone);
        $this->assertSame('zone-9', $zone['id']);
    }
}
