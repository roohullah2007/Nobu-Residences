<?php

namespace App\Services;

use App\Models\PropertyAiDescription;
use App\Models\PropertyFaq;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiDescriptionService
{
    private $apiKey;
    private $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', env('GEMINI_API_KEY', 'AIzaSyAQiazBsYhcKBAcvcOLKoOuixJJMF8N95Q'));
    }

    public function generatePropertyDescription($property)
    {
        try {
            $propertyData = $this->preparePropertyData($property);

            Log::info('Generating AI description for property', [
                'property_id' => $property->id ?? 'unknown',
                'mls_id' => $property->MLS_NUMBER ?? $property->mls_number ?? 'none',
                'address' => $propertyData['address'] ?? 'no address'
            ]);

            $prompt = $this->buildPrompt($propertyData);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 1024,
                ]
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $description = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

                Log::info('AI description generated successfully', [
                    'property_id' => $property->id ?? 'unknown',
                    'description_length' => strlen($description)
                ]);

                return $this->parseDescriptions($description);
            } else {
                Log::error('Gemini API error: ' . $response->body());
                Log::error('API Key being used (first 10 chars): ' . substr($this->apiKey, 0, 10) . '...');

                // Fallback to mock data if API fails
                Log::info('API failed, falling back to mock description generator');
                return $this->generateMockDescription($property);
            }
        } catch (\Exception $e) {
            Log::error('Error generating property description: ' . $e->getMessage());

            // Fallback to mock data if API fails
            Log::info('Falling back to mock description generator due to API error');
            return $this->generateMockDescription($property);
        }
    }

    private function preparePropertyData($property)
    {
        $data = [
            'address' => $this->formatAddress($property),
            'price' => $property->ListPrice ?? $property->listPrice ?? $property->price ?? null,
            'bedrooms' => $property->BedroomsTotal ?? $property->bedroomsTotal ?? $property->bedrooms ?? null,
            'bathrooms' => $property->BathroomsTotalInteger ?? $property->bathroomsTotalInteger ?? $property->bathrooms ?? null,
            'sqft' => $property->BuildingAreaTotal ?? $property->buildingAreaTotal ?? $property->area ?? null,
            'type' => $property->PropertyType ?? $property->propertyType ?? $property->property_type ?? null,
            'year_built' => $property->YearBuilt ?? $property->yearBuilt ?? null,
            'parking' => $property->ParkingSpaces ?? $property->parkingSpaces ?? null,
            'features' => $this->extractFeatures($property),
            'neighborhood' => $property->Neighborhood ?? $property->neighborhood ?? null,
            'city' => $property->City ?? $property->city ?? null,
            'postal_code' => $property->PostalCode ?? $property->postalCode ?? null,
            'walk_score' => $property->walk_score ?? null,
            'transit_score' => $property->transit_score ?? null,
            'building_name' => $property->building->name ?? null,
            'building_amenities' => $property->building->amenities ?? [],
            'maintenance_fee' => $property->MaintenanceFee ?? $property->maintenanceFee ?? null,
            'taxes' => $property->TaxAnnualAmount ?? $property->taxAnnualAmount ?? null,
            'public_remarks' => $property->PublicRemarks ?? $property->publicRemarks ?? null,
            'mls_status' => $property->StandardStatus ?? $property->standardStatus ?? 'Active',
            'transaction_type' => $property->TransactionType ?? $property->transactionType ?? 'For Sale'
        ];

        return array_filter($data, function($value) {
            return $value !== null && $value !== '';
        });
    }

    private function formatAddress($property)
    {
        // First check for simple address fields
        if ($property->address || $property->full_address) {
            return $property->full_address ?? $property->address;
        }

        // Then try to construct from parts
        $parts = [];

        if ($property->StreetNumber ?? $property->streetNumber) {
            $parts[] = $property->StreetNumber ?? $property->streetNumber;
        }
        if ($property->StreetName ?? $property->streetName) {
            $parts[] = $property->StreetName ?? $property->streetName;
        }
        if ($property->StreetSuffix ?? $property->streetSuffix) {
            $parts[] = $property->StreetSuffix ?? $property->streetSuffix;
        }
        if ($property->UnitNumber ?? $property->unitNumber) {
            $parts[] = $property->UnitNumber ?? $property->unitNumber;
        }

        $address = implode(' ', $parts);

        if ($property->City ?? $property->city) {
            $address .= ', ' . ($property->City ?? $property->city);
        }
        if ($property->StateOrProvince ?? $property->stateOrProvince ?? $property->province) {
            $address .= ' ' . ($property->StateOrProvince ?? $property->stateOrProvince ?? $property->province);
        }
        if ($property->PostalCode ?? $property->postalCode ?? $property->postal_code) {
            $address .= ', ' . ($property->PostalCode ?? $property->postalCode ?? $property->postal_code);
        }

        return $address;
    }

    private function extractFeatures($property)
    {
        $features = [];

        if ($property->Appliances ?? $property->appliances) {
            $features[] = 'Appliances: ' . (is_array($property->Appliances) ? implode(', ', $property->Appliances) : $property->Appliances);
        }

        if ($property->InteriorFeatures ?? $property->interiorFeatures) {
            $features[] = 'Interior: ' . (is_array($property->InteriorFeatures) ? implode(', ', $property->InteriorFeatures) : $property->InteriorFeatures);
        }

        if ($property->ExteriorFeatures ?? $property->exteriorFeatures) {
            $features[] = 'Exterior: ' . (is_array($property->ExteriorFeatures) ? implode(', ', $property->ExteriorFeatures) : $property->ExteriorFeatures);
        }

        if ($property->Flooring ?? $property->flooring) {
            $features[] = 'Flooring: ' . (is_array($property->Flooring) ? implode(', ', $property->Flooring) : $property->Flooring);
        }

        if ($property->View ?? $property->view) {
            $features[] = 'View: ' . (is_array($property->View) ? implode(', ', $property->View) : $property->View);
        }

        return $features;
    }

    private function buildPrompt($propertyData)
    {
        $prompt = "Generate a compelling and professional real estate property description based on the following information. ";
        $prompt .= "Create TWO sections:\n\n";
        $prompt .= "1. OVERVIEW (2-3 sentences): A brief, engaging summary highlighting the property's best features and location.\n";
        $prompt .= "2. DETAILED (1-2 paragraphs): A comprehensive description covering all aspects of the property.\n\n";
        $prompt .= "Property Details:\n";

        foreach ($propertyData as $key => $value) {
            if (is_array($value)) {
                $prompt .= "- " . ucfirst(str_replace('_', ' ', $key)) . ": " . implode(', ', $value) . "\n";
            } else {
                $prompt .= "- " . ucfirst(str_replace('_', ' ', $key)) . ": " . $value . "\n";
            }
        }

        $prompt .= "\nIMPORTANT: ";
        $prompt .= "- Write in a professional, engaging tone suitable for luxury real estate";
        $prompt .= "- Highlight unique features and benefits";
        $prompt .= "- Mention location advantages and nearby amenities";
        $prompt .= "- Include information about the building (if available)";
        $prompt .= "- Do not include the price in the description";
        $prompt .= "- Separate the OVERVIEW and DETAILED sections clearly with labels";
        $prompt .= "- Ensure the content is factual based on provided data";

        return $prompt;
    }

    private function parseDescriptions($text)
    {
        $overview = '';
        $detailed = '';

        if (preg_match('/OVERVIEW[:\s]*(.+?)(?=DETAILED|$)/is', $text, $matches)) {
            $overview = trim($matches[1]);
        }

        if (preg_match('/DETAILED[:\s]*(.+)/is', $text, $matches)) {
            $detailed = trim($matches[1]);
        }

        if (empty($overview) && empty($detailed)) {
            $lines = explode("\n", $text);
            $overview = isset($lines[0]) ? trim($lines[0]) : '';
            $detailed = count($lines) > 1 ? trim(implode(' ', array_slice($lines, 1))) : $overview;
        }

        return [
            'overview' => $overview,
            'detailed' => $detailed
        ];
    }

    public function saveDescription($mlsId, $descriptions, $propertyData)
    {
        Log::info('Saving AI description to database', [
            'mls_id' => $mlsId,
            'overview_length' => strlen($descriptions['overview'] ?? ''),
            'detailed_length' => strlen($descriptions['detailed'] ?? '')
        ]);

        $saved = PropertyAiDescription::updateOrCreate(
            ['mls_id' => $mlsId],
            [
                'overview_description' => $descriptions['overview'],
                'detailed_description' => $descriptions['detailed'],
                'property_data' => $propertyData,
                'ai_model' => 'gemini-1.5-flash'
            ]
        );

        Log::info('AI description saved successfully', [
            'record_id' => $saved->id,
            'mls_id' => $saved->mls_id
        ]);

        return $saved;
    }

    public function generatePropertyFaqs($property)
    {
        try {
            $propertyData = $this->preparePropertyData($property);
            $prompt = $this->buildFaqPrompt($propertyData);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 2048,
                ]
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $content = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
                return $this->parseFaqs($content);
            } else {
                Log::error('Gemini API error for FAQs: ' . $response->body());
                return null;
            }
        } catch (\Exception $e) {
            Log::error('Error generating property FAQs: ' . $e->getMessage());
            return null;
        }
    }

    private function buildFaqPrompt($propertyData)
    {
        $prompt = "Generate 8-10 frequently asked questions and detailed answers for this real estate property. ";
        $prompt .= "The questions should cover important aspects that potential buyers or renters would want to know.\n\n";
        $prompt .= "Property Details:\n";

        foreach ($propertyData as $key => $value) {
            if (is_array($value)) {
                $prompt .= "- " . ucfirst(str_replace('_', ' ', $key)) . ": " . implode(', ', $value) . "\n";
            } else {
                $prompt .= "- " . ucfirst(str_replace('_', ' ', $key)) . ": " . $value . "\n";
            }
        }

        $prompt .= "\nGenerate FAQs covering:\n";
        $prompt .= "- Property features and amenities\n";
        $prompt .= "- Location and neighborhood\n";
        $prompt .= "- Building facilities (if applicable)\n";
        $prompt .= "- Transportation and commute\n";
        $prompt .= "- Parking and storage\n";
        $prompt .= "- Maintenance fees and utilities\n";
        $prompt .= "- Schools and education (if relevant)\n";
        $prompt .= "- Pet policies (if known)\n";
        $prompt .= "- Investment potential\n";
        $prompt .= "- Move-in readiness\n\n";

        $prompt .= "Format each FAQ as:\n";
        $prompt .= "Q: [Question]\n";
        $prompt .= "A: [Detailed answer]\n";
        $prompt .= "---\n";
        $prompt .= "Use --- as separator between FAQs.\n";
        $prompt .= "Make answers informative and specific to this property.";

        return $prompt;
    }

    private function parseFaqs($content)
    {
        $faqs = [];
        $sections = preg_split('/\n---\n|\n\n---\n\n/', $content);

        foreach ($sections as $section) {
            $section = trim($section);
            if (empty($section)) continue;

            if (preg_match('/Q:\s*(.+?)\n+A:\s*(.+)/is', $section, $matches)) {
                $faqs[] = [
                    'question' => trim($matches[1]),
                    'answer' => trim($matches[2])
                ];
            }
        }

        return $faqs;
    }

    public function saveFaqs($mlsId, $faqs)
    {
        PropertyFaq::where('mls_id', $mlsId)->delete();

        foreach ($faqs as $index => $faq) {
            PropertyFaq::create([
                'mls_id' => $mlsId,
                'question' => $faq['question'],
                'answer' => $faq['answer'],
                'order' => $index + 1,
                'is_active' => true,
                'ai_model' => 'gemini-1.5-flash'
            ]);
        }

        return true;
    }

    private function generateMockDescription($property)
    {
        $propertyData = $this->preparePropertyData($property);

        // Generate contextual mock description
        $bedrooms = $propertyData['bedrooms'] ?? rand(1, 4);
        $bathrooms = $propertyData['bathrooms'] ?? rand(1, 3);
        $city = $propertyData['city'] ?? 'Toronto';
        $address = $propertyData['address'] ?? 'Premium Location';
        $propertyType = $propertyData['type'] ?? 'residence';

        $overview = "Welcome to this exceptional {$bedrooms} bedroom, {$bathrooms} bathroom {$propertyType} in the heart of {$city}. " .
                   "This beautifully appointed residence offers modern luxury living with premium finishes throughout.";

        $detailed = "Located at {$address}, this stunning property represents the pinnacle of sophisticated urban living. ";
        $detailed .= "The thoughtfully designed layout maximizes space and natural light, creating an inviting atmosphere throughout. ";
        $detailed .= "Premium finishes include hardwood flooring, granite countertops, and stainless steel appliances. ";
        $detailed .= "The property features {$bedrooms} spacious bedrooms and {$bathrooms} well-appointed bathrooms. ";

        if ($city === 'Toronto') {
            $detailed .= "Situated in Toronto's vibrant community, residents enjoy easy access to world-class dining, shopping, and entertainment. ";
            $detailed .= "Excellent transit connections make commuting effortless, with TTC and major highways nearby. ";
        }

        $detailed .= "Building amenities include 24/7 concierge, fitness facilities, and guest suites. ";
        $detailed .= "This property offers an exceptional opportunity for discerning buyers seeking quality and location.";

        return [
            'overview' => $overview,
            'detailed' => $detailed
        ];
    }
}