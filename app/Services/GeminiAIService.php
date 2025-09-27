<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\PropertyAiDescription;
use App\Models\PropertyFaq;

class GeminiAIService
{
    private string $apiKey;
    private string $apiUrl;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', env('GEMINI_API_KEY', 'AIzaSyAQiazBsYhcKBAcvcOLKoOuixJJMF8N95Q'));
        $this->model = 'gemini-1.5-flash';
        $this->apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";
    }

    /**
     * Generate property descriptions using Gemini AI
     */
    public function generatePropertyDescriptions(array $propertyData, string $mlsId): array
    {
        try {
            // Check if descriptions already exist in database
            $existingDescription = PropertyAiDescription::where('mls_id', $mlsId)->first();

            if ($existingDescription) {
                Log::info("Using cached AI descriptions for MLS: {$mlsId}");
                return [
                    'overview' => $existingDescription->overview_description,
                    'detailed' => $existingDescription->detailed_description,
                    'cached' => true
                ];
            }

            // Generate new descriptions
            Log::info("Generating new AI descriptions for MLS: {$mlsId}");

            Log::info("Creating prompts for AI generation", ['mls_id' => $mlsId]);

            try {
                $overviewPrompt = $this->createOverviewPrompt($propertyData);
                Log::info("Overview prompt created successfully");
            } catch (\Exception $e) {
                Log::error("Error creating overview prompt: " . $e->getMessage());
                throw $e;
            }

            try {
                $detailedPrompt = $this->createDetailedPrompt($propertyData);
                Log::info("Detailed prompt created successfully");
            } catch (\Exception $e) {
                Log::error("Error creating detailed prompt: " . $e->getMessage());
                throw $e;
            }

            Log::info("Generating AI content with Gemini API");
            $overviewDescription = $this->generateContent($overviewPrompt);
            $detailedDescription = $this->generateContent($detailedPrompt);
            Log::info("AI content generated successfully");

            // Store in database
            Log::info("Attempting to save AI description to database", [
                'mls_id' => $mlsId,
                'overview_length' => strlen($overviewDescription),
                'detailed_length' => strlen($detailedDescription),
                'ai_model' => $this->model
            ]);

            try {
                // Ensure property_data is properly formatted for JSON storage
                $cleanPropertyData = [];
                if (is_array($propertyData)) {
                    foreach ($propertyData as $key => $value) {
                        if (is_array($value)) {
                            $cleanPropertyData[$key] = $value;
                        } else {
                            $cleanPropertyData[$key] = (string) $value;
                        }
                    }
                } else {
                    $cleanPropertyData = $propertyData;
                }

                $saved = PropertyAiDescription::create([
                    'mls_id' => $mlsId,
                    'overview_description' => $overviewDescription,
                    'detailed_description' => $detailedDescription,
                    'property_data' => $cleanPropertyData,
                    'ai_model' => $this->model
                ]);

                Log::info("AI description saved successfully", [
                    'saved_id' => $saved->id,
                    'mls_id' => $mlsId
                ]);
            } catch (\Exception $saveError) {
                Log::error("Failed to save AI description to database", [
                    'mls_id' => $mlsId,
                    'error' => $saveError->getMessage(),
                    'trace' => $saveError->getTraceAsString()
                ]);
                // Don't throw the error, continue with the response
            }

            return [
                'overview' => $overviewDescription,
                'detailed' => $detailedDescription,
                'cached' => false
            ];

        } catch (\Exception $e) {
            Log::error("Error generating AI descriptions: " . $e->getMessage());

            // Generate and save fallback descriptions
            $fallbackOverview = $this->getFallbackOverview($propertyData);
            $fallbackDetailed = $this->getFallbackDetailed($propertyData);

            Log::info("Using fallback descriptions, attempting to save to database");

            try {
                // Save fallback descriptions to database
                $cleanPropertyData = [];
                if (is_array($propertyData)) {
                    foreach ($propertyData as $key => $value) {
                        if (is_array($value)) {
                            $cleanPropertyData[$key] = $value;
                        } else {
                            $cleanPropertyData[$key] = (string) $value;
                        }
                    }
                } else {
                    $cleanPropertyData = $propertyData;
                }

                $saved = PropertyAiDescription::create([
                    'mls_id' => $mlsId,
                    'overview_description' => $fallbackOverview,
                    'detailed_description' => $fallbackDetailed,
                    'property_data' => $cleanPropertyData,
                    'ai_model' => 'fallback'
                ]);

                Log::info("Fallback descriptions saved successfully", [
                    'saved_id' => $saved->id,
                    'mls_id' => $mlsId
                ]);
            } catch (\Exception $saveError) {
                Log::error("Failed to save fallback descriptions", [
                    'mls_id' => $mlsId,
                    'error' => $saveError->getMessage()
                ]);
            }

            // Return fallback descriptions
            return [
                'overview' => $fallbackOverview,
                'detailed' => $fallbackDetailed,
                'cached' => false,
                'error' => true
            ];
        }
    }

    /**
     * Create prompt for overview description
     */
    private function createOverviewPrompt(array $data): string
    {
        $propertyType = $data['PropertySubType'] ?? 'property';
        $address = $data['UnparsedAddress'] ?? '';
        $bedrooms = $data['BedroomsTotal'] ?? 0;
        $bathrooms = $data['BathroomsTotalInteger'] ?? 0;
        $sqft = $data['LivingArea'] ?? 0;
        $price = $data['ListPrice'] ?? 0;
        $city = $data['City'] ?? '';
        $neighborhood = $data['Area'] ?? '';
        $yearBuilt = $data['YearBuilt'] ?? '';
        $parking = $data['ParkingTotal'] ?? 0;
        $listingType = $data['TransactionType'] ?? 'For Sale';

        $prompt = "Generate a concise, SEO-friendly property overview description in 1-2 paragraphs (maximum 150 words) for a {$propertyType} listing. ";
        $prompt .= "Property details: ";
        $prompt .= "Location: {$address}, {$city}";

        if ($neighborhood) {
            $prompt .= " in the {$neighborhood} neighborhood";
        }

        $prompt .= ". {$bedrooms} bedrooms, {$bathrooms} bathrooms";

        if ($sqft > 0) {
            $prompt .= ", {$sqft} sq ft";
        }

        if ($yearBuilt) {
            $prompt .= ", built in {$yearBuilt}";
        }

        if ($parking > 0) {
            $prompt .= ", {$parking} parking space(s)";
        }

        $prompt .= ". Listed {$listingType} at \$" . number_format($price) . ". ";
        $prompt .= "Make it engaging and highlight the property's best features. ";
        $prompt .= "Use natural language that would appeal to home buyers or renters. ";
        $prompt .= "Include relevant keywords for SEO but keep it natural and readable. ";
        $prompt .= "Do not include any markdown formatting, just plain text.";

        return $prompt;
    }

    /**
     * Create prompt for detailed description
     */
    private function createDetailedPrompt(array $data): string
    {
        $propertyType = $data['PropertySubType'] ?? 'property';
        $address = $data['UnparsedAddress'] ?? '';
        $publicRemarks = $data['PublicRemarks'] ?? '';
        $bedrooms = $data['BedroomsTotal'] ?? 0;
        $bathrooms = $data['BathroomsTotalInteger'] ?? 0;
        $sqft = $data['LivingArea'] ?? 0;
        $lotSize = $data['LotSizeArea'] ?? 0;
        $price = $data['ListPrice'] ?? 0;
        $city = $data['City'] ?? '';
        $neighborhood = $data['Area'] ?? '';
        $yearBuilt = $data['YearBuilt'] ?? '';
        $parking = $data['ParkingTotal'] ?? 0;
        $parkingType = is_array($data['ParkingFeatures'] ?? '') ? implode(', ', $data['ParkingFeatures']) : ($data['ParkingFeatures'] ?? '');
        $appliances = is_array($data['Appliances'] ?? '') ? implode(', ', $data['Appliances']) : ($data['Appliances'] ?? '');
        $features = is_array($data['InteriorFeatures'] ?? '') ? implode(', ', $data['InteriorFeatures']) : ($data['InteriorFeatures'] ?? '');
        $exteriorFeatures = is_array($data['ExteriorFeatures'] ?? '') ? implode(', ', $data['ExteriorFeatures']) : ($data['ExteriorFeatures'] ?? '');
        $buildingAmenities = is_array($data['AssociationAmenities'] ?? '') ? implode(', ', $data['AssociationAmenities']) : ($data['AssociationAmenities'] ?? '');
        $maintenanceFee = $data['AssociationFee'] ?? 0;
        $taxes = $data['TaxAnnualAmount'] ?? 0;
        $listingType = $data['TransactionType'] ?? 'For Sale';

        $prompt = "Write a concise property description (2 paragraphs, max 150 words) for this {$propertyType}. ";
        $prompt .= "Property information: ";
        $prompt .= "Location: {$address}, {$city}";

        if ($neighborhood) {
            $prompt .= " in {$neighborhood}";
        }

        $prompt .= ". Configuration: {$bedrooms} bedrooms, {$bathrooms} bathrooms";

        if ($sqft > 0) {
            $prompt .= ", {$sqft} sq ft living area";
        }

        if ($lotSize > 0) {
            $prompt .= ", {$lotSize} sq ft lot";
        }

        if ($yearBuilt) {
            $prompt .= ". Built in {$yearBuilt}";
        }

        if ($parking > 0) {
            $prompt .= ". Parking: {$parking} space(s)";
            if ($parkingType) {
                $prompt .= " ({$parkingType})";
            }
        }

        if ($appliances) {
            $prompt .= ". Appliances: {$appliances}";
        }

        if ($features) {
            $prompt .= ". Interior features: {$features}";
        }

        if ($exteriorFeatures) {
            $prompt .= ". Exterior features: {$exteriorFeatures}";
        }

        if ($buildingAmenities) {
            $prompt .= ". Building amenities: {$buildingAmenities}";
        }

        if ($maintenanceFee > 0) {
            $prompt .= ". Maintenance fee: \$" . number_format($maintenanceFee) . "/month";
        }

        if ($taxes > 0) {
            $prompt .= ". Annual taxes: \$" . number_format($taxes);
        }

        $prompt .= ". Listed {$listingType} at \$" . number_format($price) . ". ";

        if ($publicRemarks) {
            $prompt .= "Original remarks: {$publicRemarks}. ";
            $prompt .= "Rewrite and enhance these remarks to be more engaging and SEO-friendly. ";
        }

        $prompt .= "Create an engaging description that highlights the property's best features, location advantages, and lifestyle benefits. ";
        $prompt .= "Use natural, persuasive language that would appeal to potential buyers or renters. ";
        $prompt .= "Include relevant SEO keywords naturally throughout the text. ";
        $prompt .= "Focus on what makes this property special and desirable. ";
        $prompt .= "Do not include any markdown formatting, just plain text.";

        return $prompt;
    }

    /**
     * Call Gemini API to generate content
     */
    private function generateContent(string $prompt): string
    {
        try {
            // Debug log the API URL being used
            Log::info('Gemini API URL: ' . $this->apiUrl . '?key=***');

            $response = Http::timeout(10)->withHeaders([
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
                    'topK' => 20,
                    'topP' => 0.8,
                    'maxOutputTokens' => 200,
                ]
            ]);

            if ($response->successful()) {
                $result = $response->json();
                if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                    return trim($result['candidates'][0]['content']['parts'][0]['text']);
                }
            }

            Log::error('Gemini API response error: ' . $response->body());
            throw new \Exception('Failed to generate content from Gemini API');

        } catch (\Exception $e) {
            Log::error('Gemini API error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get fallback overview description
     */
    private function getFallbackOverview(array $data): string
    {
        $bedrooms = $data['BedroomsTotal'] ?? 0;
        $bathrooms = $data['BathroomsTotalInteger'] ?? 0;
        $propertyType = $data['PropertySubType'] ?? 'property';
        $city = $data['City'] ?? '';
        $area = $data['Area'] ?? $data['CityRegion'] ?? '';
        $price = $data['ListPrice'] ?? 0;
        $sqft = $data['LivingArea'] ?? 0;
        $yearBuilt = $data['YearBuilt'] ?? '';
        $parking = $data['ParkingTotal'] ?? 0;
        $transactionType = $data['TransactionType'] ?? 'For Sale';
        $unitNumber = $data['UnitNumber'] ?? '';
        $streetName = $data['StreetName'] ?? '';
        $propertyStyle = $data['ArchitecturalStyle'] ?? '';
        $maintenanceFee = $data['AssociationFee'] ?? 0;
        $exposure = $data['DirectionFaces'] ?? $data['Exposure'] ?? '';

        // Build a more comprehensive description
        $description = "Welcome to this exceptional {$propertyType}";

        // Add location details
        if ($streetName) {
            $description .= " located on {$streetName}";
            if ($area) {
                $description .= " in the sought-after {$area} neighborhood";
            }
        } elseif ($city) {
            $description .= " located in {$city}";
        }

        $description .= ". This stunning property offers {$bedrooms} bedroom" . ($bedrooms != 1 ? 's' : '') .
                       " and {$bathrooms} bathroom" . ($bathrooms != 1 ? 's' : '');

        // Add square footage
        if ($sqft > 0) {
            $description .= " across an impressive {$sqft} square feet of thoughtfully designed living space";
        }

        // Add unit details for condos
        if ($unitNumber && strtolower($propertyType) === 'condo apartment') {
            $description .= ". Situated in unit {$unitNumber}";
            if ($exposure) {
                $description .= " with {$exposure} exposure providing abundant natural light";
            }
        }

        $description .= ". ";

        // Add building/property features
        if ($yearBuilt) {
            $description .= "Built in {$yearBuilt}, this property combines classic charm with modern conveniences. ";
        }

        // Add parking
        if ($parking > 0) {
            $description .= "The property includes {$parking} parking space" . ($parking != 1 ? 's' : '') . " for your convenience. ";
        }

        // Add maintenance fee for condos
        if ($maintenanceFee > 0 && strtolower($propertyType) === 'condo apartment') {
            $description .= "Monthly maintenance fees of \$" . number_format($maintenanceFee) . " cover building amenities and services. ";
        }

        // Add price and call to action
        if ($transactionType === 'For Rent') {
            $description .= "Available for rent at \$" . number_format($price) . " per month. ";
        } else {
            $description .= "Offered at \$" . number_format($price) . ", this property represents excellent value in today's market. ";
        }

        $description .= "Don't miss this opportunity to own a piece of prime real estate. Schedule your private showing today and experience all this remarkable property has to offer.";

        return $description;
    }

    /**
     * Get fallback detailed description
     */
    private function getFallbackDetailed(array $data): string
    {
        // Use original public remarks if available, otherwise use enhanced fallback
        if (!empty($data['PublicRemarks'])) {
            return $data['PublicRemarks'];
        }

        $bedrooms = $data['BedroomsTotal'] ?? 0;
        $bathrooms = $data['BathroomsTotalInteger'] ?? 0;
        $propertyType = $data['PropertySubType'] ?? 'property';
        $address = $data['UnparsedAddress'] ?? '';
        $city = $data['City'] ?? '';
        $neighborhood = $data['Area'] ?? '';
        $price = $data['ListPrice'] ?? 0;
        $sqft = $data['LivingArea'] ?? 0;
        $yearBuilt = $data['YearBuilt'] ?? '';
        $parking = $data['ParkingTotal'] ?? 0;

        $description = "Welcome to this exceptional {$propertyType} ";

        if ($address) {
            $description .= "located at {$address}";
            if ($city) {
                $description .= ", {$city}";
            }
            if ($neighborhood) {
                $description .= " in the desirable {$neighborhood} neighborhood";
            }
        }

        $description .= ". This property offers {$bedrooms} bedrooms and {$bathrooms} bathrooms";

        if ($sqft > 0) {
            $description .= " across {$sqft} square feet of well-designed living space";
        }

        if ($yearBuilt) {
            $description .= ". Built in {$yearBuilt}, this home combines classic charm with modern amenities";
        }

        if ($parking > 0) {
            $description .= ". The property includes {$parking} parking space(s) for your convenience";
        }

        $description .= ". Don't miss this opportunity to own a wonderful home";

        if ($city) {
            $description .= " in {$city}";
        }

        if ($price > 0) {
            $description .= ". Listed at \$" . number_format($price);
        }

        $description .= ", this property won't last long. Schedule your private showing today!";

        return $description;
    }

    /**
     * Generate FAQ questions and answers for a property
     */
    public function generatePropertyFaqs(array $propertyData, string $mlsId): array
    {
        try {
            // Check if FAQs already exist in database
            $existingFaqs = PropertyFaq::getByMlsId($mlsId);

            if ($existingFaqs->count() > 0) {
                Log::info("Using cached FAQs for MLS: {$mlsId}");
                return [
                    'faqs' => $existingFaqs->toArray(),
                    'cached' => true
                ];
            }

            // Generate new FAQs
            Log::info("Generating new FAQs for MLS: {$mlsId}");

            $faqPrompt = $this->createFaqPrompt($propertyData);
            $faqResponse = $this->generateContent($faqPrompt);

            // Parse the FAQ response into questions and answers
            $faqs = $this->parseFaqResponse($faqResponse);

            // Store FAQs in database
            foreach ($faqs as $index => $faq) {
                PropertyFaq::create([
                    'mls_id' => $mlsId,
                    'question' => $faq['question'],
                    'answer' => $faq['answer'],
                    'order' => $index,
                    'is_active' => true,
                    'ai_model' => $this->model
                ]);
            }

            return [
                'faqs' => $faqs,
                'cached' => false
            ];

        } catch (\Exception $e) {
            Log::error("Error generating FAQs: " . $e->getMessage());

            // Return fallback FAQs
            $fallbackFaqs = $this->getFallbackFaqs($propertyData);

            // Store fallback FAQs in database
            foreach ($fallbackFaqs as $index => $faq) {
                PropertyFaq::create([
                    'mls_id' => $mlsId,
                    'question' => $faq['question'],
                    'answer' => $faq['answer'],
                    'order' => $index,
                    'is_active' => true,
                    'ai_model' => 'fallback'
                ]);
            }

            return [
                'faqs' => $fallbackFaqs,
                'cached' => false,
                'error' => true
            ];
        }
    }

    /**
     * Create prompt for FAQ generation
     */
    private function createFaqPrompt(array $data): string
    {
        $propertyType = $data['PropertySubType'] ?? 'property';
        $address = $data['UnparsedAddress'] ?? '';
        $bedrooms = $data['BedroomsTotal'] ?? 0;
        $bathrooms = $data['BathroomsTotalInteger'] ?? 0;
        $sqft = $data['LivingArea'] ?? 0;
        $price = $data['ListPrice'] ?? 0;
        $city = $data['City'] ?? '';
        $neighborhood = $data['Area'] ?? '';
        $yearBuilt = $data['YearBuilt'] ?? '';
        $parking = $data['ParkingTotal'] ?? 0;
        $listingType = $data['TransactionType'] ?? 'For Sale';
        $maintenanceFee = $data['AssociationFee'] ?? 0;
        $taxes = $data['TaxAnnualAmount'] ?? 0;
        $appliances = $data['Appliances'] ?? '';
        $features = $data['InteriorFeatures'] ?? '';
        $buildingAmenities = $data['AssociationAmenities'] ?? '';

        $prompt = "Generate 6 frequently asked questions and detailed answers for this {$propertyType} listing. ";
        $prompt .= "Property details: ";
        $prompt .= "{$bedrooms} bedrooms, {$bathrooms} bathrooms";

        if ($sqft > 0) {
            $prompt .= ", {$sqft} sq ft";
        }

        $prompt .= " in {$city}";

        if ($neighborhood) {
            $prompt .= ", {$neighborhood} neighborhood";
        }

        if ($yearBuilt) {
            $prompt .= ", built in {$yearBuilt}";
        }

        if ($parking > 0) {
            $prompt .= ", {$parking} parking space(s)";
        }

        if ($maintenanceFee > 0) {
            $prompt .= ", maintenance fee $" . number_format($maintenanceFee) . "/month";
        }

        if ($taxes > 0) {
            $prompt .= ", annual taxes $" . number_format($taxes);
        }

        $prompt .= ". Listed {$listingType} at $" . number_format($price) . ". ";

        $prompt .= "Generate 6 FAQs that buyers would ask about this property. ";
        $prompt .= "Format the response as a numbered list with 'Q:' for questions and 'A:' for answers. ";
        $prompt .= "Questions should be specific to this property type and location. ";
        $prompt .= "Answers should be detailed (50-100 words each) and informative. ";
        $prompt .= "Include questions about: price/value, neighborhood, amenities, maintenance/fees, transportation/parking, and investment potential. ";
        $prompt .= "Make the answers sound professional and helpful. ";
        $prompt .= "Do not include any markdown formatting, just plain text.";

        return $prompt;
    }

    /**
     * Parse FAQ response from AI into structured array
     */
    private function parseFaqResponse(string $response): array
    {
        $faqs = [];

        // Split by numbered items (1., 2., etc.)
        $items = preg_split('/\d+\./', $response);

        foreach ($items as $item) {
            if (empty(trim($item))) continue;

            // Extract question and answer
            if (preg_match('/Q:\s*(.+?)\s*A:\s*(.+)/s', $item, $matches)) {
                $faqs[] = [
                    'question' => trim($matches[1]),
                    'answer' => trim($matches[2])
                ];
            }
        }

        // If parsing fails, return fallback
        if (empty($faqs)) {
            return $this->getFallbackFaqs([]);
        }

        return $faqs;
    }

    /**
     * Get fallback FAQs when AI generation fails
     */
    private function getFallbackFaqs(array $data): array
    {
        $propertyType = $data['PropertySubType'] ?? 'property';
        $bedrooms = $data['BedroomsTotal'] ?? 0;
        $bathrooms = $data['BathroomsTotalInteger'] ?? 0;
        $sqft = $data['LivingArea'] ?? 0;
        $price = $data['ListPrice'] ?? 0;
        $city = $data['City'] ?? 'this area';
        $neighborhood = $data['Area'] ?? $data['CityRegion'] ?? '';
        $yearBuilt = $data['YearBuilt'] ?? '';
        $parking = $data['ParkingTotal'] ?? 0;
        $maintenanceFee = $data['AssociationFee'] ?? 0;
        $taxes = $data['TaxAnnualAmount'] ?? 0;
        $transactionType = $data['TransactionType'] ?? 'For Sale';
        $address = $data['UnparsedAddress'] ?? '';
        $streetName = $data['StreetName'] ?? '';
        $unitNumber = $data['UnitNumber'] ?? '';

        $faqs = [];

        // Determine property category for dynamic questions
        $isCondo = strtolower($propertyType) === 'condo apartment' || strtolower($propertyType) === 'condo';
        $isHouse = strpos(strtolower($propertyType), 'house') !== false || strpos(strtolower($propertyType), 'detached') !== false;
        $isTownhouse = strpos(strtolower($propertyType), 'townhouse') !== false || strpos(strtolower($propertyType), 'townhome') !== false;
        $isRental = $transactionType === 'For Rent';
        $isLuxury = $price > 1500000;
        $isNew = $yearBuilt && (date('Y') - $yearBuilt <= 5);

        // Question 1: Dynamic price question based on property type and transaction
        $sqftText = $sqft > 0 ? number_format($sqft) . ' sq ft ' : '';
        $priceQuestion = $isRental
            ? "What is the monthly rent for this {$bedrooms} bedroom {$propertyType}?"
            : ($isCondo
                ? "What is the price for this {$bedrooms} bedroom condo" . ($unitNumber ? " (Unit {$unitNumber})" : "") . " and are maintenance fees included?"
                : "What is the asking price for this {$sqftText}{$propertyType}?");

        $faqs[] = [
            'question' => $priceQuestion,
            'answer' => "The " . strtolower($transactionType) . " price for this {$bedrooms} bedroom, {$bathrooms} bathroom {$propertyType} is $" . number_format($price) .
                       ($sqft > 0 ? ", which works out to approximately $" . number_format($price / $sqft, 0) . " per square foot. " : ". ") .
                       "This price reflects the property's prime location" . ($neighborhood ? " in {$neighborhood}" : " in {$city}") .
                       ", its well-maintained condition" . ($yearBuilt ? " (built in {$yearBuilt})" : "") .
                       ", and the current market conditions. The price includes all fixtures and fittings currently in the property. " .
                       ($maintenanceFee > 0 ? "Please note there is a monthly maintenance fee of $" . number_format($maintenanceFee) . " which covers building amenities and services." : "")
        ];

        // Question 2: Dynamic neighborhood question based on location
        $neighborhoodQuestion = $neighborhood
            ? "What makes the {$neighborhood} neighborhood special for {$bedrooms} bedroom properties?"
            : ($streetName
                ? "What's it like living on {$streetName} in {$city}?"
                : "What are the key features of this {$city} location?");

        $faqs[] = [
            'question' => $neighborhoodQuestion,
            'answer' => "This property is located in " . ($neighborhood ? "the desirable {$neighborhood} neighborhood of {$city}" : $city) .
                       ", known for its excellent community atmosphere and convenient location. The area offers a perfect blend of residential tranquility and urban convenience. " .
                       "Within walking distance, you'll find grocery stores, restaurants, cafes, and retail shops. " .
                       "The neighborhood is family-friendly with parks, recreational facilities, and well-maintained public spaces. " .
                       "Public transportation is easily accessible, making commuting convenient. " .
                       "The area has seen steady property value appreciation, making it an attractive location for both living and investment."
        ];

        // Question 3: Dynamic amenities question based on property type
        if ($isCondo) {
            $amenitiesQuestion = $maintenanceFee > 0
                ? "What amenities are included with the $" . number_format($maintenanceFee) . " monthly maintenance fee?"
                : "What building amenities and services are available" . ($unitNumber ? " for Unit {$unitNumber}" : "") . "?";

            $faqs[] = [
                'question' => $amenitiesQuestion,
                'answer' => "This well-managed building offers residents a comprehensive suite of amenities designed for modern living. " .
                           "Common facilities typically include a secure lobby with concierge service, fitness center, party room for entertaining guests, " .
                           "and visitor parking. Many buildings in this area also feature outdoor terraces, BBQ areas, and bike storage. " .
                           ($maintenanceFee > 0 ? "The monthly maintenance fee of $" . number_format($maintenanceFee) . " covers these amenities along with " : "Maintenance fees cover ") .
                           "building insurance, common area maintenance, snow removal, landscaping, and professional property management. " .
                           "The building is well-maintained with regular updates to ensure comfort and property value preservation."
            ];
        } else {
            $featuresQuestion = $isHouse
                ? "What are the standout features of this {$bedrooms} bedroom house" . ($yearBuilt && $isNew ? " built in {$yearBuilt}" : "") . "?"
                : ($isTownhouse
                    ? "What makes this townhouse unique compared to other {$bedrooms} bedroom properties?"
                    : "What are the key features and upgrades of this {$propertyType}?");

            $faqs[] = [
                'question' => $featuresQuestion,
                'answer' => "This {$propertyType} offers {$bedrooms} bedrooms and {$bathrooms} bathrooms" .
                           ($sqft > 0 ? " across {$sqft} square feet of thoughtfully designed living space" : "") . ". " .
                           ($yearBuilt ? "Built in {$yearBuilt}, the property combines classic architecture with modern updates. " : "") .
                           "The layout is designed for both comfortable living and entertaining, with well-proportioned rooms and ample natural light. " .
                           ($parking > 0 ? "The property includes {$parking} parking space(s) for your convenience. " : "") .
                           "Additional features include quality finishes throughout, efficient heating and cooling systems, and plenty of storage space. " .
                           "The property has been well-maintained and is move-in ready for the next owner."
            ];
        }

        // Question 4: Dynamic parking/transportation question
        $parkingQuestion = $parking > 0
            ? "How many parking spaces are included and what type of parking is it?"
            : ($isCondo
                ? "Are parking spaces available for purchase or rent in this building?"
                : "What are the parking and public transportation options nearby?");

        $faqs[] = [
            'question' => $parkingQuestion,
            'answer' => ($parking > 0 ? "This property comes with {$parking} dedicated parking space(s), ensuring convenient and secure parking for residents. " : "Parking options are available in the area. ") .
                       "The location offers excellent transportation connectivity with easy access to major roads and highways. " .
                       "Public transit is readily accessible with bus stops and/or subway stations within walking distance, making commuting throughout the city convenient. " .
                       "The area is also pedestrian and cyclist-friendly with dedicated bike lanes and walking paths. " .
                       "For those who drive, you'll find quick access to main arterial roads, making it easy to navigate to shopping centers, business districts, and recreational areas. " .
                       "The strategic location ensures you're well-connected while enjoying a peaceful residential setting."
        ];

        // Question 5: Dynamic costs question based on property type
        $sqftForCosts = $sqft > 0 ? number_format($sqft) . ' sq ft ' : '';
        $costsQuestion = $isRental
            ? "What's included in the rent and what additional costs should I expect?"
            : ($isCondo && $maintenanceFee > 0
                ? "What do the monthly maintenance fees cover and are there any upcoming assessments?"
                : ($taxes > 0
                    ? "What are the annual property taxes and utility costs for this {$sqftForCosts}property?"
                    : "What are the typical monthly carrying costs for this {$propertyType}?"));

        $faqs[] = [
            'question' => $costsQuestion,
            'answer' => "Beyond the " . ($transactionType === 'For Rent' ? "monthly rent of $" . number_format($price) : "purchase price") .
                       ", buyers should be aware of the following ongoing costs: " .
                       ($taxes > 0 ? "Annual property taxes are approximately $" . number_format($taxes) . ". " : "Property taxes apply based on the municipal assessment. ") .
                       ($maintenanceFee > 0 ? "The monthly maintenance fee is $" . number_format($maintenanceFee) . ", which covers building amenities, common area maintenance, and management services. " : "") .
                       "Utilities (electricity, heating, water) are typically the responsibility of the owner. " .
                       "Home insurance is required and costs vary based on coverage. " .
                       "It's recommended to budget for regular maintenance and potential special assessments for major building repairs. " .
                       "These costs are typical for properties in this area and reflect the quality of the building and neighborhood."
        ];

        // Question 6: Dynamic investment/value question
        $investmentQuestion = $isRental
            ? "What's the typical lease term and are there any restrictions I should know about?"
            : ($isLuxury
                ? "What makes this luxury property worth the premium price point?"
                : ($isNew
                    ? "What are the benefits of buying in this newly built {$yearBuilt} development?"
                    : ($neighborhood
                        ? "How has the {$neighborhood} real estate market performed recently?"
                        : "Is this {$bedrooms} bedroom {$propertyType} a good investment in today's market?")));

        $faqs[] = [
            'question' => $investmentQuestion,
            'answer' => "This property represents a solid investment opportunity in " . ($neighborhood ? "{$neighborhood}, {$city}" : $city) . "'s real estate market. " .
                       "The area has shown consistent property value appreciation over recent years, driven by its desirable location, quality amenities, and strong community appeal. " .
                       ($transactionType === 'For Sale' ? "For investors, the property offers potential for both capital appreciation and rental income generation. " : "") .
                       "The neighborhood continues to attract young professionals, families, and downsizers, ensuring steady demand. " .
                       "Ongoing infrastructure improvements and development in the area are expected to further enhance property values. " .
                       "With its combination of location, condition, and price point, this property offers excellent value in today's market. " .
                       "As always, we recommend consulting with a real estate professional to assess how this property aligns with your specific investment goals."
        ];

        return $faqs;
    }
}