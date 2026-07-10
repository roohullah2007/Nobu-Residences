<?php

namespace App\Jobs;

use App\Models\Website;
use App\Models\WebsitePage;
use App\Services\GeminiAIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Auto-provisions a freshly created building website's content with AI:
 * SEO meta, a building description (when the building has none), and the
 * homepage copy (hero, About overview, building-specific FAQs).
 *
 * Dispatched from WebsiteManagementController::store() with
 * dispatchAfterResponse() — production runs no queue worker, so this runs
 * right after the redirect is sent (same pattern as
 * GeneratePropertyAiContentJob). Creation never blocks on Gemini: the site
 * goes live instantly with the personalized template from
 * WebsitePage::getDefaultHomeContentForBuilding() and the AI copy lands
 * within a minute. Any failure leaves the template content intact and is
 * surfaced on the Created status page via ai_content_status; a run that
 * dies mid-flight leaves "pending", which the status page resolves with
 * its "Run AI generation now" button.
 */
class GenerateWebsiteAiContentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 120;

    public function __construct(
        public int $websiteId,
        public bool $force = false,
    ) {
    }

    public function handle(): void
    {
        $website = Website::with([
            'homepageBuilding.amenities',
            'homepageBuilding.maintenanceFeeAmenities',
        ])->find($this->websiteId);

        $building = $website?->homepageBuilding;
        if (!$website || !$building) {
            return;
        }

        // Idempotency: a completed website is only regenerated when the
        // admin explicitly asks for it (Regenerate button → force=true).
        if ($website->ai_content_status === 'completed' && !$this->force) {
            return;
        }

        $ai = new GeminiAIService();
        $homeSuccess = false;
        $lastError = null;

        // (a) Building description — only when the building has none. Note:
        // generateBuildingDescription() falls back to deterministic template
        // text on API failure (same behavior as the CSV import path), so
        // this section only "fails" on an unexpected exception.
        if (trim((string) $building->description) === '') {
            try {
                $description = $ai->generateBuildingDescription(
                    $ai->buildBuildingDescriptionPromptFromModel($building),
                    ['name' => $building->name, 'address' => $building->address, 'city' => $building->city]
                );
                if (trim($description) !== '') {
                    $building->description = $description;
                    $building->save();
                }
            } catch (\Exception $e) {
                $lastError = 'Building description: ' . $e->getMessage();
                Log::error('GenerateWebsiteAiContentJob: building description failed', [
                    'website_id' => $website->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // (b) SEO meta — generateSeoMeta() never throws (internal fallback),
        // so this always yields usable meta values. Deliberately NOT counted
        // toward the completed/failed verdict: a fallback is written even
        // when the API is down, and that must not mask the failure.
        try {
            $seo = $ai->generateSeoMeta([
                'name' => $website->name,
                'building_name' => $building->name,
                'address' => $building->address,
                'city' => $building->city,
                'description' => $building->description,
            ]);
            $website->meta_title = $seo['title'];
            $website->meta_description = $seo['description'];
            $website->meta_keywords = $seo['keywords'];
            if (trim((string) $website->description) === '' && trim((string) $building->description) !== '') {
                $website->description = $building->description;
            }
            $website->save();
        } catch (\Exception $e) {
            $lastError = 'SEO meta: ' . $e->getMessage();
            Log::error('GenerateWebsiteAiContentJob: SEO meta failed', [
                'website_id' => $website->id,
                'error' => $e->getMessage(),
            ]);
        }

        // (c) Homepage copy — null means the AI call failed or returned
        // nothing usable; the personalized template stays in place.
        try {
            $home = $ai->generateWebsiteHomeContent([
                'name' => $building->name,
                'address' => $building->address,
                'city' => $building->city,
                'neighbourhood' => $building->neighbourhood,
                'building_type' => $building->building_type,
                'floors' => $building->floors,
                'total_units' => $building->total_units,
                'year_built' => $building->year_built,
                'sqft_range' => $building->sqft_range,
                'amenities' => $building->amenities->pluck('name')->all(),
                'nearby_transit' => $building->nearby_transit,
                'description' => $building->description,
            ]);

            if ($home !== null) {
                $this->patchHomePage($website, $home);
                $homeSuccess = true;
            } elseif ($lastError === null) {
                $lastError = 'Homepage copy: AI returned no usable content (check GEMINI_API_KEY and the Laravel log).';
            }
        } catch (\Exception $e) {
            $lastError = 'Homepage copy: ' . $e->getMessage();
            Log::error('GenerateWebsiteAiContentJob: homepage copy failed', [
                'website_id' => $website->id,
                'error' => $e->getMessage(),
            ]);
        }

        // The homepage copy is the deliverable that proves the AI actually
        // ran — SEO meta and the building description both degrade to
        // template fallbacks internally, so they can't be the signal.
        $website->update([
            'ai_content_status' => $homeSuccess ? 'completed' : 'failed',
            'ai_content_error' => $homeSuccess ? null : ($lastError ?: 'AI content generation failed.'),
            'ai_content_generated_at' => now(),
        ]);
    }

    /**
     * Patch ONLY the keys the AI produced into the home page's content JSON,
     * re-read fresh right before writing so concurrent admin edits to other
     * sections (carousel, footer, key facts, amenities) survive. Respects
     * the (website_id, page_type) unique index and self-heals when the page
     * was deleted before the job ran.
     */
    protected function patchHomePage(Website $website, array $home): void
    {
        $page = WebsitePage::where('website_id', $website->id)
            ->where('page_type', 'home')
            ->first();

        $content = $page?->content ?: WebsitePage::getDefaultHomeContentForBuilding($website->homepageBuilding);

        foreach (['welcome_text', 'main_heading', 'subheading'] as $key) {
            if (isset($home[$key])) {
                data_set($content, "hero.{$key}", $home[$key]);
            }
        }
        if (isset($home['overview'])) {
            data_set($content, 'about.tabs.overview.content', $home['overview']);
        }
        if (!empty($home['faqs'])) {
            data_set($content, 'faq.items', $home['faqs']);
        }

        WebsitePage::updateOrCreate(
            ['website_id' => $website->id, 'page_type' => 'home'],
            [
                'content' => $content,
                'title' => $page->title ?? "Home - {$website->name}",
                'is_active' => $page->is_active ?? true,
                'sort_order' => $page->sort_order ?? 0,
            ]
        );
    }

    /**
     * A hard job failure (timeout, lost DB connection) must not leave the
     * website stuck on "pending" forever — the Created page polls this.
     */
    public function failed(\Throwable $e): void
    {
        Website::where('id', $this->websiteId)->update([
            'ai_content_status' => 'failed',
            'ai_content_error' => $e->getMessage(),
            'ai_content_generated_at' => now(),
        ]);

        Log::error('GenerateWebsiteAiContentJob failed', [
            'website_id' => $this->websiteId,
            'error' => $e->getMessage(),
        ]);
    }
}
