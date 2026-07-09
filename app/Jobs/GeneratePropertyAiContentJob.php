<?php

namespace App\Jobs;

use App\Models\PropertyAiDescription;
use App\Models\PropertyFaq;
use App\Services\GeminiAIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Generates the AI-reprocessed description and FAQs for a listing.
 *
 * Dispatched with dispatchAfterResponse() from propertyDetail() so the first
 * page view responds immediately (falling back to the raw MLS remarks) instead
 * of blocking on two Gemini round-trips. The content appears on the next view.
 */
class GeneratePropertyAiContentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 120;

    public function __construct(
        public string $listingKey,
        public array $propertyData,
        public bool $needDescription,
        public bool $needFaqs,
    ) {
    }

    public function handle(): void
    {
        $geminiService = new GeminiAIService();

        if ($this->needDescription && !PropertyAiDescription::where('mls_id', $this->listingKey)->exists()) {
            try {
                $geminiService->generatePropertyDescriptions($this->propertyData, $this->listingKey);
            } catch (\Exception $e) {
                Log::error('Failed to generate AI description:', [
                    'listingKey' => $this->listingKey,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if ($this->needFaqs && PropertyFaq::where('mls_id', $this->listingKey)->count() === 0) {
            try {
                $geminiService->generatePropertyFaqs($this->propertyData, $this->listingKey);
            } catch (\Exception $e) {
                Log::error('Failed to generate AI FAQs:', [
                    'listingKey' => $this->listingKey,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
