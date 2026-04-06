<?php

namespace App\Services;

use App\Models\Property;
use App\Models\Building;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * MLS Integration Service
 *
 * Integrates MLS data with local property and building data using Repliers API
 */
class MLSIntegrationService
{
    private RepliersApiService $repliersApi;

    public function __construct(RepliersApiService $repliersApi)
    {
        $this->repliersApi = $repliersApi;
    }

    /**
     * Sync properties from MLS
     */
    public function syncProperties(array $filters = []): array
    {
        try {
            $params = [
                'status' => 'A',
                'class' => 'condoProperty',
                'resultsPerPage' => $filters['limit'] ?? 100,
                'pageNum' => 1,
                'sortBy' => 'updatedOnDesc',
            ];

            // Apply filters
            if (!empty($filters['city'])) {
                $params['city'] = $filters['city'];
            }
            if (!empty($filters['transactionType'])) {
                $params['type'] = strtolower($filters['transactionType']) === 'rent' ? 'lease' : 'sale';
            }
            if (!empty($filters['minPrice'])) {
                $params['minPrice'] = $filters['minPrice'];
            }
            if (!empty($filters['maxPrice'])) {
                $params['maxPrice'] = $filters['maxPrice'];
            }

            $result = $this->repliersApi->searchListings($params);

            $syncedProperties = [];
            $syncedBuildings = [];

            DB::transaction(function () use ($result, &$syncedProperties, &$syncedBuildings) {
                foreach ($result['listings'] as $listing) {
                    // Sync building if building name exists
                    $building = null;
                    $buildingName = $listing['address']['neighborhood'] ?? null;
                    if ($buildingName) {
                        $building = $this->syncBuilding($listing);
                        if ($building && !in_array($building->id, $syncedBuildings)) {
                            $syncedBuildings[] = $building->id;
                        }
                    }

                    // Sync property
                    $property = $this->syncProperty($listing, $building);
                    if ($property) {
                        $syncedProperties[] = $property->id;
                    }
                }
            });

            return [
                'success' => true,
                'total_properties' => $result['count'],
                'synced_properties' => count($syncedProperties),
                'synced_buildings' => count($syncedBuildings),
                'properties' => $syncedProperties,
                'buildings' => $syncedBuildings,
            ];

        } catch (Exception $e) {
            Log::error('MLS Property Sync Error', [
                'error' => $e->getMessage(),
                'filters' => $filters,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Sync building from Repliers listing data
     */
    private function syncBuilding(array $listing): ?Building
    {
        $address = $listing['address'] ?? [];
        $buildingName = $address['neighborhood'] ?? $address['streetName'] ?? '';

        if (empty($buildingName)) {
            return null;
        }

        try {
            $city = $address['city'] ?? '';
            $building = Building::where('name', $buildingName)
                ->where('city', $city)
                ->first();

            $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));

            $buildingData = [
                'name' => $buildingName,
                'address' => $fullAddress,
                'full_address' => $fullAddress . ', ' . $city . ', ' . ($address['state'] ?? 'ON'),
                'city' => $city,
                'province' => $address['state'] ?? 'ON',
                'postal_code' => $address['zip'] ?? '',
                'country' => $address['country'] ?? 'Canada',
                'latitude' => $listing['map']['latitude'] ?? null,
                'longitude' => $listing['map']['longitude'] ?? null,
                'building_type' => $this->mapPropertyTypeToBuilding($listing['details']['style'] ?? ''),
                'year_built' => $listing['details']['yearBuilt'] ?? null,
                'status' => 'active',
            ];

            if ($building) {
                $building->update($buildingData);
            } else {
                $buildingData['mls_building_id'] = $buildingName . '_' . $city;
                $building = Building::create($buildingData);
            }

            return $building;

        } catch (Exception $e) {
            Log::error('Building Sync Error', [
                'error' => $e->getMessage(),
                'building_name' => $buildingName,
            ]);
            return null;
        }
    }

    /**
     * Sync property from Repliers listing data
     */
    private function syncProperty(array $listing, ?Building $building = null): ?Property
    {
        try {
            $mlsNumber = $listing['mlsNumber'] ?? '';
            $property = Property::where('mls_number', $mlsNumber)->first();

            $address = $listing['address'] ?? [];
            $details = $listing['details'] ?? [];
            $map = $listing['map'] ?? [];

            $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
            if (!empty($address['unitNumber'])) {
                $fullAddress = $address['unitNumber'] . ' - ' . $fullAddress;
            }

            $transactionType = strtolower($listing['type'] ?? 'sale');

            $propertyData = [
                'building_id' => $building?->id,
                'title' => $this->generatePropertyTitle($listing),
                'description' => $details['description'] ?? '',
                'address' => $fullAddress,
                'full_address' => $fullAddress . ', ' . ($address['city'] ?? '') . ', ' . ($address['state'] ?? 'ON'),
                'city' => $address['city'] ?? '',
                'province' => $address['state'] ?? 'ON',
                'postal_code' => $address['zip'] ?? '',
                'country' => $address['country'] ?? 'Canada',
                'latitude' => $map['latitude'] ?? null,
                'longitude' => $map['longitude'] ?? null,
                'price' => $listing['listPrice'] ?? 0,
                'property_type' => $details['propertyType'] ?? '',
                'transaction_type' => $transactionType === 'lease' ? 'rent' : 'sale',
                'status' => $this->mapRepliersStatus($listing['status'] ?? 'A', $listing['lastStatus'] ?? ''),
                'bedrooms' => $details['numBedrooms'] ?? null,
                'bathrooms' => $details['numBathrooms'] ?? null,
                'area' => $details['sqft'] ?? null,
                'area_unit' => 'sqft',
                'year_built' => $details['yearBuilt'] ?? null,
                'listing_date' => $listing['listDate'] ?? now(),
                'mls_number' => $mlsNumber,
            ];

            if ($property) {
                $property->update($propertyData);
            } else {
                $property = Property::create($propertyData);
            }

            return $property;

        } catch (Exception $e) {
            Log::error('Property Sync Error', [
                'error' => $e->getMessage(),
                'mls_number' => $listing['mlsNumber'] ?? 'unknown',
            ]);
            return null;
        }
    }

    /**
     * Get property images from MLS
     */
    public function syncPropertyImages(array $mlsNumbers): array
    {
        try {
            $synced = 0;
            foreach ($mlsNumbers as $mlsNumber) {
                $listing = $this->repliersApi->getListingByMlsNumber($mlsNumber);
                if ($listing) {
                    $imageUrls = $this->repliersApi->getListingImageUrls($listing);
                    $property = Property::where('mls_number', $mlsNumber)->first();
                    if ($property && !empty($imageUrls)) {
                        $property->update(['images' => $imageUrls]);
                        $synced++;
                    }
                }
            }

            return [
                'success' => true,
                'synced_properties' => $synced,
            ];

        } catch (Exception $e) {
            Log::error('Property Images Sync Error', [
                'error' => $e->getMessage(),
                'mls_numbers' => $mlsNumbers,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Search properties using MLS integration
     */
    public function searchProperties(array $searchParams): array
    {
        try {
            $params = [
                'status' => 'A',
                'resultsPerPage' => $searchParams['limit'] ?? 20,
                'pageNum' => $searchParams['page'] ?? 1,
                'sortBy' => 'updatedOnDesc',
            ];

            // Apply search filters
            if (!empty($searchParams['search'])) {
                $params['search'] = $searchParams['search'];
            }

            if (!empty($searchParams['forSale'])) {
                $params['type'] = $searchParams['forSale'] === 'sale' ? 'sale' : 'lease';
            }

            if (!empty($searchParams['bedType'])) {
                $params['minBedrooms'] = $searchParams['bedType'];
            }

            if (!empty($searchParams['minPrice']) && $searchParams['minPrice'] !== '0') {
                $params['minPrice'] = (int) str_replace(['$', ','], '', $searchParams['minPrice']);
            }

            if (!empty($searchParams['maxPrice']) && $searchParams['maxPrice'] !== '$37,000,000') {
                $params['maxPrice'] = (int) str_replace(['$', ','], '', $searchParams['maxPrice']);
            }

            $result = $this->repliersApi->searchListings($params);

            // Transform Repliers data to our format
            $properties = array_map(function ($listing) {
                $address = $listing['address'] ?? [];
                $details = $listing['details'] ?? [];
                $map = $listing['map'] ?? [];
                $images = $this->repliersApi->getListingImageUrls($listing);

                $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
                if (!empty($address['unitNumber'])) {
                    $fullAddress = $address['unitNumber'] . ' - ' . $fullAddress;
                }

                return [
                    'id' => $listing['mlsNumber'],
                    'listingKey' => $listing['mlsNumber'],
                    'price' => $listing['listPrice'] ?? 0,
                    'propertyType' => $details['propertyType'] ?? '',
                    'transactionType' => ucfirst($listing['type'] ?? 'Sale'),
                    'bedrooms' => $details['numBedrooms'] ?? 0,
                    'bathrooms' => $details['numBathrooms'] ?? 0,
                    'address' => $fullAddress,
                    'city' => $address['city'] ?? '',
                    'province' => $address['state'] ?? 'ON',
                    'latitude' => $map['latitude'] ?? null,
                    'longitude' => $map['longitude'] ?? null,
                    'buildingName' => $address['neighborhood'] ?? null,
                    'isRental' => strtolower($listing['type'] ?? '') === 'lease',
                    'image' => !empty($images) ? $images[0] : $this->getDefaultImage($listing['mlsNumber']),
                ];
            }, $result['listings']);

            return [
                'success' => true,
                'properties' => $properties,
                'total' => $result['count'],
                'page' => $searchParams['page'] ?? 1,
                'limit' => $searchParams['limit'] ?? 20,
            ];

        } catch (Exception $e) {
            Log::error('MLS Property Search Error', [
                'error' => $e->getMessage(),
                'search_params' => $searchParams,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'properties' => [],
                'total' => 0,
            ];
        }
    }

    /**
     * Get a default placeholder image
     */
    private function getDefaultImage(string $mlsNumber): string
    {
        $defaultImages = [
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80',
        ];

        $imageIndex = crc32($mlsNumber) % count($defaultImages);
        return $defaultImages[abs($imageIndex)];
    }

    /**
     * Map Repliers status to our internal status
     */
    private function mapRepliersStatus(string $status, string $lastStatus = ''): string
    {
        $lastStatusLower = strtolower($lastStatus);

        if ($lastStatusLower === 'sld') {
            return 'sold';
        }
        if ($lastStatusLower === 'lsd') {
            return 'leased';
        }

        return match (strtoupper($status)) {
            'A' => 'active',
            'U' => in_array($lastStatusLower, ['sld']) ? 'sold' : (in_array($lastStatusLower, ['lsd', 'lc']) ? 'leased' : 'inactive'),
            default => 'active',
        };
    }

    /**
     * Map property type to building type
     */
    private function mapPropertyTypeToBuilding(string $style): string
    {
        return match (strtolower($style)) {
            'apartment', 'condo apartment' => 'Condo',
            'townhouse', 'stacked townhouse' => 'Townhouse',
            'commercial' => 'Commercial',
            default => 'Mixed Use',
        };
    }

    /**
     * Generate property title from listing data
     */
    private function generatePropertyTitle(array $listing): string
    {
        $details = $listing['details'] ?? [];
        $address = $listing['address'] ?? [];
        $bedrooms = $details['numBedrooms'] ?? '';
        $style = $details['style'] ?? '';
        $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? ''));

        if (!empty($bedrooms) && !empty($style)) {
            return "{$bedrooms} Bed {$style} - {$fullAddress}";
        } elseif (!empty($style)) {
            return "{$style} - {$fullAddress}";
        }

        return $fullAddress ?: 'Property Listing';
    }
}
