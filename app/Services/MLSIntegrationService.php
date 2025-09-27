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
 * Integrates MLS data with local property and building data using AMPRE API
 */
class MLSIntegrationService
{
    private AmpreApiService $ampreApi;

    public function __construct(AmpreApiService $ampreApi)
    {
        $this->ampreApi = $ampreApi;
    }

    /**
     * Sync properties from MLS
     */
    public function syncProperties(array $filters = []): array
    {
        try {
            // Set up default filters
            $this->ampreApi->resetFilters();
            $this->ampreApi->setSelect([
                'ListingKey', 'ListPrice', 'PropertyType', 'TransactionType',
                'BedroomsTotal', 'BathroomsTotalInteger', 'UnparsedAddress',
                'City', 'StateOrProvince', 'PostalCode', 'Country',
                'Latitude', 'Longitude', 'ListingDate', 'ExpirationDate',
                'MLSNumber', 'PropertySubType', 'LivingArea', 'YearBuilt',
                'PublicRemarks', 'StandardStatus', 'BuildingName'
            ]);

            // Apply filters
            if (!empty($filters['city'])) {
                $this->ampreApi->addFilter('City', $filters['city']);
            }
            if (!empty($filters['propertyType'])) {
                $this->ampreApi->addFilter('PropertyType', $filters['propertyType']);
            }
            if (!empty($filters['transactionType'])) {
                $this->ampreApi->addFilter('TransactionType', $filters['transactionType']);
            }
            if (!empty($filters['minPrice']) && !empty($filters['maxPrice'])) {
                $this->ampreApi->setPriceRange($filters['minPrice'], $filters['maxPrice']);
            }

            // Add active status filter
            $this->ampreApi->addFilter('StandardStatus', 'Active');

            // Set ordering (use ModificationTimestamp as ListingDate might not be available)
            $this->ampreApi->setOrderBy(['ModificationTimestamp desc']);
            $this->ampreApi->setTop($filters['limit'] ?? 100);

            $result = $this->ampreApi->fetchPropertiesWithCount();
            
            $syncedProperties = [];
            $syncedBuildings = [];

            DB::transaction(function () use ($result, &$syncedProperties, &$syncedBuildings) {
                foreach ($result['properties'] as $mlsProperty) {
                    // Sync building if BuildingName exists
                    $building = null;
                    if (!empty($mlsProperty['BuildingName'])) {
                        $building = $this->syncBuilding($mlsProperty);
                        if ($building && !in_array($building->id, $syncedBuildings)) {
                            $syncedBuildings[] = $building->id;
                        }
                    }

                    // Sync property
                    $property = $this->syncProperty($mlsProperty, $building);
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
                'buildings' => $syncedBuildings
            ];

        } catch (Exception $e) {
            Log::error('MLS Property Sync Error', [
                'error' => $e->getMessage(),
                'filters' => $filters
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Sync building from MLS data
     */
    private function syncBuilding(array $mlsProperty): ?Building
    {
        if (empty($mlsProperty['BuildingName'])) {
            return null;
        }

        try {
            // Look for existing building by name and address
            $building = Building::where('name', $mlsProperty['BuildingName'])
                ->where('city', $mlsProperty['City'] ?? '')
                ->first();

            $buildingData = [
                'name' => $mlsProperty['BuildingName'],
                'address' => $mlsProperty['UnparsedAddress'] ?? '',
                'full_address' => $mlsProperty['UnparsedAddress'] ?? '',
                'city' => $mlsProperty['City'] ?? '',
                'province' => $mlsProperty['StateOrProvince'] ?? '',
                'postal_code' => $mlsProperty['PostalCode'] ?? '',
                'country' => $mlsProperty['Country'] ?? 'Canada',
                'latitude' => $mlsProperty['Latitude'] ?? null,
                'longitude' => $mlsProperty['Longitude'] ?? null,
                'building_type' => $this->mapPropertyTypeToBuilding($mlsProperty['PropertyType'] ?? ''),
                'year_built' => $mlsProperty['YearBuilt'] ?? null,
                'status' => 'active',
            ];

            if ($building) {
                // Update existing building
                $building->update($buildingData);
                $building->syncFromMLS($mlsProperty);
            } else {
                // Create new building
                $buildingData['mls_building_id'] = $mlsProperty['BuildingName'] . '_' . ($mlsProperty['City'] ?? '');
                $building = Building::create($buildingData);
                $building->syncFromMLS($mlsProperty);
            }

            return $building;

        } catch (Exception $e) {
            Log::error('Building Sync Error', [
                'error' => $e->getMessage(),
                'building_name' => $mlsProperty['BuildingName']
            ]);
            return null;
        }
    }

    /**
     * Sync property from MLS data
     */
    private function syncProperty(array $mlsProperty, ?Building $building = null): ?Property
    {
        try {
            // Look for existing property by MLS number
            $property = Property::where('mls_number', $mlsProperty['MLSNumber'] ?? $mlsProperty['ListingKey'])
                ->first();

            $propertyData = [
                'building_id' => $building?->id,
                'title' => $this->generatePropertyTitle($mlsProperty),
                'description' => $mlsProperty['PublicRemarks'] ?? '',
                'address' => $mlsProperty['UnparsedAddress'] ?? '',
                'full_address' => $mlsProperty['UnparsedAddress'] ?? '',
                'city' => $mlsProperty['City'] ?? '',
                'province' => $mlsProperty['StateOrProvince'] ?? '',
                'postal_code' => $mlsProperty['PostalCode'] ?? '',
                'country' => $mlsProperty['Country'] ?? 'Canada',
                'latitude' => $mlsProperty['Latitude'] ?? null,
                'longitude' => $mlsProperty['Longitude'] ?? null,
                'price' => $mlsProperty['ListPrice'] ?? 0,
                'property_type' => $mlsProperty['PropertyType'] ?? '',
                'transaction_type' => strtolower($mlsProperty['TransactionType'] ?? 'sale'),
                'status' => $this->mapMLSStatus($mlsProperty['StandardStatus'] ?? 'Active'),
                'bedrooms' => $mlsProperty['BedroomsTotal'] ?? null,
                'bathrooms' => $mlsProperty['BathroomsTotalInteger'] ?? null,
                'area' => $mlsProperty['LivingArea'] ?? null,
                'area_unit' => 'sqft',
                'year_built' => $mlsProperty['YearBuilt'] ?? null,
                'listing_date' => $mlsProperty['ListingDate'] ?? now(),
                'expiry_date' => $mlsProperty['ExpirationDate'] ?? null,
                'mls_number' => $mlsProperty['MLSNumber'] ?? $mlsProperty['ListingKey'],
            ];

            if ($property) {
                // Update existing property
                $property->update($propertyData);
            } else {
                // Create new property
                $property = Property::create($propertyData);
            }

            return $property;

        } catch (Exception $e) {
            Log::error('Property Sync Error', [
                'error' => $e->getMessage(),
                'mls_number' => $mlsProperty['MLSNumber'] ?? $mlsProperty['ListingKey']
            ]);
            return null;
        }
    }

    /**
     * Get property images from MLS
     */
    public function syncPropertyImages(array $listingKeys): array
    {
        try {
            $images = $this->ampreApi->getPropertiesImages($listingKeys);
            
            $synced = 0;
            foreach ($images as $listingKey => $propertyImages) {
                $property = Property::where('mls_number', $listingKey)->first();
                if ($property && !empty($propertyImages)) {
                    $imageUrls = array_map(function($img) {
                        return $img['MediaURL'];
                    }, $propertyImages);
                    
                    $property->update(['images' => $imageUrls]);
                    $synced++;
                }
            }

            return [
                'success' => true,
                'synced_properties' => $synced
            ];

        } catch (Exception $e) {
            Log::error('Property Images Sync Error', [
                'error' => $e->getMessage(),
                'listing_keys' => $listingKeys
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Search properties using MLS integration
     */
    public function searchProperties(array $searchParams): array
    {
        try {
            $this->ampreApi->resetFilters();
            $this->ampreApi->setSelect([
                'ListingKey', 'ListPrice', 'PropertyType', 'TransactionType',
                'BedroomsTotal', 'BathroomsTotalInteger', 'UnparsedAddress',
                'City', 'StateOrProvince', 'PostalCode', 'Latitude', 'Longitude',
                'PropertySubType', 'PublicRemarks', 'StandardStatus'
            ]);

            // Apply search filters
            if (!empty($searchParams['search'])) {
                $this->ampreApi->addCustomFilter(
                    "contains(UnparsedAddress,'{$searchParams['search']}') or contains(City,'{$searchParams['search']}')"
                );
            }

            if (!empty($searchParams['forSale'])) {
                $this->ampreApi->addFilter('TransactionType', $searchParams['forSale'] === 'sale' ? 'Sale' : 'Rent');
            }

            if (!empty($searchParams['bedType'])) {
                $this->ampreApi->addFilter('BedroomsTotal', $searchParams['bedType'], 'ge');
            }

            if (!empty($searchParams['minPrice']) && $searchParams['minPrice'] !== '0') {
                $minPrice = (int) str_replace(['$', ','], '', $searchParams['minPrice']);
                $this->ampreApi->addFilter('ListPrice', (string)$minPrice, 'ge');
            }

            if (!empty($searchParams['maxPrice']) && $searchParams['maxPrice'] !== '$37,000,000') {
                $maxPrice = (int) str_replace(['$', ','], '', $searchParams['maxPrice']);
                $this->ampreApi->addFilter('ListPrice', (string)$maxPrice, 'le');
            }

            // Only active listings
            $this->ampreApi->addFilter('StandardStatus', 'Active');

            // Set pagination
            $limit = $searchParams['limit'] ?? 20;
            $skip = ($searchParams['page'] ?? 1 - 1) * $limit;
            $this->ampreApi->setTop($limit);
            $this->ampreApi->setSkip($skip);

            // Set ordering (use ModificationTimestamp as ListingDate might not be available)
            $this->ampreApi->setOrderBy(['ModificationTimestamp desc']);

            $result = $this->ampreApi->fetchPropertiesWithCount();

            // Fetch images for properties if we have results
            $propertyImages = [];
            if (!empty($result['properties'])) {
                try {
                    $listingKeys = array_column($result['properties'], 'ListingKey');
                    // Try to get images with different size descriptions
                    $sizeDescriptions = ['Large', 'Medium', 'Largest', 'Original'];
                    
                    foreach ($sizeDescriptions as $sizeDescription) {
                        $propertyImages = $this->ampreApi->getPropertiesImages($listingKeys, $sizeDescription, 250);
                        if (!empty($propertyImages)) {
                            break; // Use the first successful result
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to fetch property images: ' . $e->getMessage());
                }
            }

            // Transform MLS data to our format
            $properties = array_map(function($mlsProperty) use ($propertyImages) {
                return [
                    'id' => $mlsProperty['ListingKey'],
                    'listingKey' => $mlsProperty['ListingKey'],
                    'price' => $mlsProperty['ListPrice'] ?? 0,
                    'propertyType' => $mlsProperty['PropertyType'] ?? '',
                    'transactionType' => $mlsProperty['TransactionType'] ?? '',
                    'bedrooms' => $mlsProperty['BedroomsTotal'] ?? 0,
                    'bathrooms' => $mlsProperty['BathroomsTotalInteger'] ?? 0,
                    'address' => $mlsProperty['UnparsedAddress'] ?? '',
                    'city' => $mlsProperty['City'] ?? '',
                    'province' => $mlsProperty['StateOrProvince'] ?? '',
                    'latitude' => $mlsProperty['Latitude'] ?? null,
                    'longitude' => $mlsProperty['Longitude'] ?? null,
                    'buildingName' => null, // BuildingName not available in current API
                    'isRental' => strtolower($mlsProperty['TransactionType'] ?? '') === 'rent',
                    'image' => $this->getPropertyImage($mlsProperty['ListingKey'], $propertyImages)
                ];
            }, $result['properties']);

            return [
                'success' => true,
                'properties' => $properties,
                'total' => $result['count'],
                'page' => $searchParams['page'] ?? 1,
                'limit' => $limit
            ];

        } catch (Exception $e) {
            Log::error('MLS Property Search Error', [
                'error' => $e->getMessage(),
                'search_params' => $searchParams
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'properties' => [],
                'total' => 0
            ];
        }
    }

    /**
     * Get the first available image for a property
     */
    private function getPropertyImage(string $listingKey, array $propertyImages): string
    {
        if (isset($propertyImages[$listingKey]) && !empty($propertyImages[$listingKey])) {
            $imageUrl = $propertyImages[$listingKey][0]['MediaURL'] ?? '';
            
            // Validate the image URL
            if (!empty($imageUrl) && filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                return $imageUrl;
            }
        }
        
        // Return a consistent default image based on listing key
        $defaultImages = [
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80',
        ];
        
        // Use listing key to consistently get the same fallback image
        $imageIndex = crc32($listingKey) % count($defaultImages);
        return $defaultImages[abs($imageIndex)];
    }

    /**
     * Map MLS status to our internal status
     */
    private function mapMLSStatus(string $mlsStatus): string
    {
        return match (strtolower($mlsStatus)) {
            'active' => 'active',
            'sold' => 'sold',
            'leased' => 'rented',
            'expired', 'withdrawn', 'cancelled' => 'inactive',
            default => 'active'
        };
    }

    /**
     * Map property type to building type
     */
    private function mapPropertyTypeToBuilding(string $propertyType): string
    {
        return match (strtolower($propertyType)) {
            'condominium', 'condo' => 'Condo',
            'apartment' => 'Apartment',
            'townhouse', 'townhome' => 'Townhouse',
            'commercial' => 'Commercial',
            default => 'Mixed Use'
        };
    }

    /**
     * Generate property title from MLS data
     */
    private function generatePropertyTitle(array $mlsProperty): string
    {
        $address = $mlsProperty['UnparsedAddress'] ?? '';
        $propertyType = $mlsProperty['PropertyType'] ?? '';
        $bedrooms = $mlsProperty['BedroomsTotal'] ?? '';
        
        if (!empty($bedrooms) && !empty($propertyType)) {
            return "{$bedrooms} Bed {$propertyType} - {$address}";
        } elseif (!empty($propertyType)) {
            return "{$propertyType} - {$address}";
        }
        
        return $address ?: 'Property Listing';
    }
}