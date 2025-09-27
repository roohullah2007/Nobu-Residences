<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GeminiAIService;
use App\Services\AmpreApiService;
use App\Models\PropertyAiDescription;
use App\Models\PropertyFaq;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PropertyAiController extends Controller
{
    protected $geminiService;
    protected $ampreApi;

    public function __construct(GeminiAIService $geminiService, AmpreApiService $ampreApi)
    {
        $this->geminiService = $geminiService;
        $this->ampreApi = $ampreApi;
    }

    /**
     * Generate AI descriptions for a property
     */
    public function generateDescription(Request $request)
    {
        $request->validate([
            'mls_id' => 'required|string',
            'force_regenerate' => 'boolean'
        ]);

        $mlsId = $request->input('mls_id');
        $forceRegenerate = $request->input('force_regenerate', false);

        try {
            // Check if descriptions already exist and force_regenerate is false
            if (!$forceRegenerate) {
                $existingDescription = PropertyAiDescription::getByMlsId($mlsId);
                if ($existingDescription) {
                    Log::info("Returning cached AI descriptions for MLS: {$mlsId}");

                    return response()->json([
                        'success' => true,
                        'data' => [
                            'overview' => $existingDescription->overview_description,
                            'detailed' => $existingDescription->detailed_description,
                            'cached' => true,
                            'generated_at' => $existingDescription->created_at,
                            'updated_at' => $existingDescription->updated_at
                        ]
                    ]);
                }
            }

            // Get property data
            $propertyData = null;

            // Check if it's a local property
            if (is_numeric($mlsId)) {
                $property = Property::find($mlsId);
                if ($property) {
                    $propertyData = $property->toArray();
                }
            }

            // If not found locally, try AMPRE API
            if (!$propertyData) {
                $propertyData = $this->ampreApi->getPropertyByKey($mlsId);
            }

            if (!$propertyData) {
                return response()->json([
                    'success' => false,
                    'error' => 'Property not found'
                ], 404);
            }

            // Generate AI descriptions
            $descriptions = $this->geminiService->generatePropertyDescriptions($propertyData, $mlsId);

            // Get the saved description
            $savedDescription = PropertyAiDescription::getByMlsId($mlsId);

            return response()->json([
                'success' => true,
                'data' => [
                    'overview' => $descriptions['overview'],
                    'detailed' => $descriptions['detailed'],
                    'cached' => false,
                    'generated_at' => $savedDescription ? $savedDescription->created_at : now(),
                    'updated_at' => $savedDescription ? $savedDescription->updated_at : now()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Error generating AI descriptions for MLS {$mlsId}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Failed to generate descriptions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate FAQ for a property
     */
    public function generateFaqs(Request $request)
    {
        $request->validate([
            'mls_id' => 'required|string',
            'force_regenerate' => 'boolean'
        ]);

        $mlsId = $request->input('mls_id');
        $forceRegenerate = $request->input('force_regenerate', false);

        try {
            // Check if FAQs already exist and force_regenerate is false
            if (!$forceRegenerate) {
                $existingFaqs = PropertyFaq::getByMlsId($mlsId);
                if ($existingFaqs->count() > 0) {
                    Log::info("Returning cached FAQs for MLS: {$mlsId}");

                    return response()->json([
                        'success' => true,
                        'data' => [
                            'faqs' => $existingFaqs->toArray(),
                            'cached' => true
                        ]
                    ]);
                }
            }

            // Get property data
            $propertyData = null;

            // Check if it's a local property
            if (is_numeric($mlsId)) {
                $property = Property::find($mlsId);
                if ($property) {
                    $propertyData = $property->toArray();
                }
            }

            // If not found locally, try AMPRE API
            if (!$propertyData) {
                $propertyData = $this->ampreApi->getPropertyByKey($mlsId);
            }

            if (!$propertyData) {
                return response()->json([
                    'success' => false,
                    'error' => 'Property not found'
                ], 404);
            }

            // Generate FAQs
            $faqs = $this->geminiService->generatePropertyFaqs($propertyData, $mlsId);

            return response()->json([
                'success' => true,
                'data' => [
                    'faqs' => $faqs['faqs'],
                    'cached' => false
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Error generating FAQs for MLS {$mlsId}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Failed to generate FAQs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all AI-generated content for a property
     */
    public function getAllContent(Request $request)
    {
        $request->validate([
            'mls_id' => 'required|string'
        ]);

        $mlsId = $request->input('mls_id');

        try {
            $description = PropertyAiDescription::getByMlsId($mlsId);
            $faqs = PropertyFaq::getByMlsId($mlsId);

            $hasContent = $description || $faqs->count() > 0;

            if (!$hasContent) {
                return response()->json([
                    'success' => false,
                    'error' => 'No AI content found for this property'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'description' => $description ? [
                        'overview' => $description->overview_description,
                        'detailed' => $description->detailed_description,
                        'generated_at' => $description->created_at,
                        'updated_at' => $description->updated_at
                    ] : null,
                    'faqs' => $faqs->toArray()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Error fetching AI content for MLS {$mlsId}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch AI content: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete AI-generated content for a property
     */
    public function deleteContent(Request $request)
    {
        $request->validate([
            'mls_id' => 'required|string',
            'delete_description' => 'boolean',
            'delete_faqs' => 'boolean'
        ]);

        $mlsId = $request->input('mls_id');
        $deleteDescription = $request->input('delete_description', true);
        $deleteFaqs = $request->input('delete_faqs', true);

        try {
            $deletedItems = [];

            if ($deleteDescription) {
                $deleted = PropertyAiDescription::where('mls_id', $mlsId)->delete();
                if ($deleted) {
                    $deletedItems[] = 'description';
                }
            }

            if ($deleteFaqs) {
                $deleted = PropertyFaq::where('mls_id', $mlsId)->delete();
                if ($deleted) {
                    $deletedItems[] = 'faqs';
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'AI content deleted successfully',
                'deleted' => $deletedItems
            ]);

        } catch (\Exception $e) {
            Log::error("Error deleting AI content for MLS {$mlsId}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Failed to delete AI content: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk generate AI descriptions for multiple properties
     */
    public function bulkGenerate(Request $request)
    {
        $request->validate([
            'mls_ids' => 'required|array',
            'mls_ids.*' => 'string'
        ]);

        $mlsIds = $request->input('mls_ids');
        $results = [];

        foreach ($mlsIds as $mlsId) {
            try {
                // Check if description already exists
                $existingDescription = PropertyAiDescription::getByMlsId($mlsId);
                if ($existingDescription) {
                    $results[] = [
                        'mls_id' => $mlsId,
                        'status' => 'skipped',
                        'message' => 'Description already exists'
                    ];
                    continue;
                }

                // Get property data
                $propertyData = null;

                if (is_numeric($mlsId)) {
                    $property = Property::find($mlsId);
                    if ($property) {
                        $propertyData = $property->toArray();
                    }
                }

                if (!$propertyData) {
                    $propertyData = $this->ampreApi->getPropertyByKey($mlsId);
                }

                if (!$propertyData) {
                    $results[] = [
                        'mls_id' => $mlsId,
                        'status' => 'error',
                        'message' => 'Property not found'
                    ];
                    continue;
                }

                // Generate AI descriptions
                $this->geminiService->generatePropertyDescriptions($propertyData, $mlsId);

                $results[] = [
                    'mls_id' => $mlsId,
                    'status' => 'success',
                    'message' => 'Description generated successfully'
                ];

            } catch (\Exception $e) {
                $results[] = [
                    'mls_id' => $mlsId,
                    'status' => 'error',
                    'message' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'success' => true,
            'results' => $results
        ]);
    }
}