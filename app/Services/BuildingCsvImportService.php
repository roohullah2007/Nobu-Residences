<?php

namespace App\Services;

use App\Models\Building;
use App\Models\Developer;
use App\Models\Neighbourhood;
use App\Models\SubNeighbourhood;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * CSV → buildings importer with admin-defined field mapping.
 *
 * The admin uploads a CSV, maps each CSV column to a building field in the
 * UI, and this service turns each row into a Building. Relational fields
 * (developer, neighbourhood, sub-neighbourhood) are matched by name and
 * auto-created when missing, so a spreadsheet can be imported in one pass
 * without preparing taxonomies first.
 */
class BuildingCsvImportService
{
    public const DUPLICATE_SKIP = 'skip';
    public const DUPLICATE_UPDATE = 'update';

    /** Fields the admin can map CSV columns onto. Order = display order. */
    public const IMPORTABLE_FIELDS = [
        'name' => 'Building Name (required)',
        'address' => 'Address (required)',
        'street_address_2' => 'Street Address 2 (secondary)',
        'city' => 'City',
        'province' => 'Province',
        'postal_code' => 'Postal Code',
        'country' => 'Country',
        'building_type' => 'Building Type',
        'status' => 'Status',
        'listing_type' => 'Listing Type',
        'developer_name' => 'Developer (by name, auto-created)',
        'neighbourhood_name' => 'Neighbourhood (by name, auto-created)',
        'sub_neighbourhood_name' => 'Sub-Neighbourhood (by name, auto-created)',
        'management_name' => 'Management Company',
        'corp_number' => 'Corp Number',
        'date_registered' => 'Date Registered',
        'total_units' => 'Total Units',
        'floors' => 'Floors',
        'year_built' => 'Year Built',
        'parking_spots' => 'Parking Spots',
        'locker_spots' => 'Locker Spots',
        'maintenance_fee_range' => 'Maintenance Fee Range',
        'maintenance_fee_amenities' => 'Included in Maintenance (comma-separated, auto-created)',
        'sqft_range' => 'Sqft Range',
        'avg_price_per_sqft' => 'Avg Price Per Sqft',
        'amenities' => 'Amenities (comma-separated, auto-created)',
        'images' => 'Image URLs (first becomes main image)',
        'description' => 'Description',
        'website_url' => 'Website URL',
        'virtual_tour_url' => 'Virtual Tour URL',
        'latitude' => 'Latitude',
        'longitude' => 'Longitude',
    ];

    private const INTEGER_FIELDS = ['total_units', 'floors', 'year_built', 'parking_spots', 'locker_spots'];
    private const FLOAT_FIELDS = ['latitude', 'longitude'];

    /**
     * Sane [min, max] per integer field — spreadsheets routinely carry
     * placeholder zeros ("Built_Year: 0") or corrupted values (a floors
     * column of 871 for a 1-storey building); out-of-range values are
     * dropped rather than imported.
     */
    private const INTEGER_BOUNDS = [
        'total_units' => [1, 20000],
        'floors' => [1, 130],
        'year_built' => [1600, 2100],
        'parking_spots' => [0, 100000],
        'locker_spots' => [0, 100000],
    ];

    /** Cell values spreadsheets use to mean "no data". */
    private const NULL_PLACEHOLDERS = ['-', '--', 'n/a', 'na', 'null', 'none'];

    private const VALID_STATUSES = ['active', 'inactive', 'pending', 'pre_construction', 'under_construction', 'completed', 'sold_out'];
    private const VALID_LISTING_TYPES = ['For Sale', 'For Rent', 'Both'];

    /**
     * Parse a CSV file: returns headers, a small preview, and the row count.
     * Delimiter is auto-detected from the header line (comma / semicolon / tab).
     *
     * @return array{headers: string[], preview: array[], total_rows: int, delimiter: string}
     */
    public function parse(string $path, int $previewRows = 5): array
    {
        $handle = $this->openCsv($path);
        $delimiter = $this->detectDelimiter($path);

        $headers = fgetcsv($handle, 0, $delimiter, '"', '\\');
        if ($headers === false) {
            fclose($handle);
            throw new \RuntimeException('The CSV file is empty.');
        }
        $headers = array_map(fn ($h) => trim((string) $h), $this->stripBom($headers));

        $preview = [];
        $totalRows = 0;
        while (($row = fgetcsv($handle, 0, $delimiter, '"', '\\')) !== false) {
            if ($this->isBlankRow($row)) {
                continue;
            }
            $totalRows++;
            if (count($preview) < $previewRows) {
                $preview[] = array_map(fn ($v) => (string) $v, $row);
            }
        }
        fclose($handle);

        return [
            'headers' => $headers,
            'preview' => $preview,
            'total_rows' => $totalRows,
            'delimiter' => $delimiter,
        ];
    }

    /**
     * Validate the column mapping before anything is queued.
     *
     * @param array<int|string, string> $mapping CSV column index => building field key.
     * @return array<int|string, string> The mapping filtered to known fields.
     */
    public function validateMapping(array $mapping): array
    {
        $mapping = array_filter($mapping, fn ($field) => isset(self::IMPORTABLE_FIELDS[$field]));
        if (!in_array('name', $mapping, true)) {
            throw new \RuntimeException('Map a CSV column to "Building Name" before importing.');
        }
        return $mapping;
    }

    /**
     * Import one chunk of the CSV so a queued job can work through a large
     * file gradually instead of processing everything in a single request.
     *
     * @param string $path Absolute path to the uploaded CSV.
     * @param array<int|string, string> $mapping CSV column index => building field key.
     * @param string $duplicateAction self::DUPLICATE_SKIP | self::DUPLICATE_UPDATE
     * @param int $offset Number of non-blank data rows already processed.
     * @param int $limit Maximum number of rows to process in this call.
     * @return array{processed: int, created: int, updated: int, skipped: int, errors: array<int, string>, done: bool}
     */
    public function importChunk(string $path, array $mapping, string $duplicateAction, int $offset, int $limit): array
    {
        $mapping = $this->validateMapping($mapping);

        $handle = $this->openCsv($path);
        $delimiter = $this->detectDelimiter($path);
        fgetcsv($handle, 0, $delimiter, '"', '\\'); // skip header row

        $processed = 0;
        $created = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];
        $dataRow = 0;
        $done = true;

        while (($row = fgetcsv($handle, 0, $delimiter, '"', '\\')) !== false) {
            if ($this->isBlankRow($row)) {
                continue;
            }
            $dataRow++;
            if ($dataRow <= $offset) {
                continue;
            }
            if ($processed >= $limit) {
                $done = false;
                break;
            }

            try {
                $result = $this->importRow($row, $mapping, $duplicateAction);
                match ($result) {
                    'created' => $created++,
                    'updated' => $updated++,
                    default => $skipped++,
                };
            } catch (\Throwable $e) {
                $errors[$dataRow] = $e->getMessage();
            }
            $processed++;
        }
        fclose($handle);

        return [
            'processed' => $processed,
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
            'errors' => $errors,
            'done' => $done,
        ];
    }

    /**
     * Import a single CSV row. Returns 'created' | 'updated' | 'skipped'.
     */
    private function importRow(array $row, array $mapping, string $duplicateAction): string
    {
        $attributes = [];
        foreach ($mapping as $columnIndex => $field) {
            $value = trim((string) ($row[(int) $columnIndex] ?? ''));
            if ($value === '' || in_array(strtolower($value), self::NULL_PLACEHOLDERS, true)) {
                continue;
            }
            $attributes[$field] = $value;
        }

        $name = $attributes['name'] ?? '';
        if ($name === '') {
            throw new \RuntimeException('Building name is empty.');
        }

        $attributes = $this->castScalars($attributes);
        $attributes = $this->normalizeEnums($attributes);

        // Amenities and maintenance-fee inclusions are relational
        // (belongsToMany) — pull them out of the column attributes and sync
        // them after the building is saved.
        $amenityNames = $this->extractDelimitedNames($attributes, 'amenities');
        $maintenanceAmenityNames = $this->extractDelimitedNames($attributes, 'maintenance_fee_amenities');

        // Image links become main_image (first) + the images JSON array.
        $this->extractImages($attributes);

        // Resolve name-based relations, creating them on the fly.
        $this->resolveDeveloper($attributes);
        $this->resolveNeighbourhoods($attributes);

        $existing = Building::where('name', $name)
            ->when(!empty($attributes['address']), fn ($q) => $q->where('address', $attributes['address']))
            ->first();

        if ($existing) {
            if ($duplicateAction !== self::DUPLICATE_UPDATE) {
                return 'skipped';
            }
            // Only the mapped, non-empty values — never clobber existing data
            // with create-time defaults.
            DB::transaction(function () use ($existing, $attributes, $amenityNames, $maintenanceAmenityNames) {
                $existing->update($attributes);
                $this->syncAmenities($existing, $amenityNames);
                $this->syncMaintenanceFeeAmenities($existing, $maintenanceAmenityNames);
            });
            return 'updated';
        }

        if (empty($attributes['address'])) {
            throw new \RuntimeException('Address is empty.');
        }

        // Defaults apply to NEW buildings only.
        $attributes += ['city' => 'Toronto', 'province' => 'ON', 'country' => 'Canada', 'status' => 'active'];

        DB::transaction(function () use ($attributes, $amenityNames, $maintenanceAmenityNames) {
            $building = Building::create($attributes);
            $this->syncAmenities($building, $amenityNames);
            $this->syncMaintenanceFeeAmenities($building, $maintenanceAmenityNames);
        });
        return 'created';
    }

    /** Split a mapped multi-value cell into clean names (comma/semicolon/pipe). */
    private function extractDelimitedNames(array &$attributes, string $field): array
    {
        $raw = $attributes[$field] ?? '';
        unset($attributes[$field]);
        if ($raw === '') {
            return [];
        }
        return collect(preg_split('/[,;|]/', $raw))
            ->map(fn ($n) => trim($n))
            ->filter()
            ->unique(fn ($n) => strtolower($n))
            ->values()
            ->all();
    }

    /**
     * Turn the mapped image-links cell into main_image + the images array.
     * URLs never contain commas, so splitting on comma/semicolon/pipe/
     * whitespace covers every export style seen so far.
     */
    private function extractImages(array &$attributes): void
    {
        $raw = $attributes['images'] ?? '';
        unset($attributes['images']);
        if ($raw === '') {
            return;
        }
        $urls = collect(preg_split('/[,;|\s]+/', $raw))
            ->map(fn ($u) => trim($u))
            ->filter(fn ($u) => str_starts_with($u, 'http://') || str_starts_with($u, 'https://'))
            ->values()
            ->all();
        if (empty($urls)) {
            return;
        }
        $attributes['main_image'] = $urls[0];
        $attributes['images'] = $urls;
    }

    /** Attach amenities by name, creating missing ones (case-insensitive match). */
    private function syncAmenities(Building $building, array $names): void
    {
        if (empty($names)) {
            return;
        }
        $ids = [];
        foreach ($names as $n) {
            $amenity = \App\Models\Amenity::whereRaw('LOWER(name) = ?', [strtolower($n)])->first()
                ?? \App\Models\Amenity::create(['name' => $n]);
            $ids[] = $amenity->id;
        }
        // Additive: keep amenities the building already has.
        $building->amenities()->syncWithoutDetaching($ids);
    }

    /** Attach maintenance-fee inclusions by name, creating missing ones. */
    private function syncMaintenanceFeeAmenities(Building $building, array $names): void
    {
        if (empty($names)) {
            return;
        }
        $ids = [];
        foreach ($names as $n) {
            $amenity = \App\Models\MaintenanceFeeAmenity::whereRaw('LOWER(name) = ?', [strtolower($n)])->first()
                ?? \App\Models\MaintenanceFeeAmenity::create(['name' => $n, 'is_active' => true, 'sort_order' => 0]);
            $ids[] = $amenity->id;
        }
        $building->maintenanceFeeAmenities()->syncWithoutDetaching($ids);
    }

    /**
     * Convert developer_name → developer_id.
     *
     * Lookup is case-insensitive; a missing developer is created (name +
     * auto-generated slug via the Developer model's boot hook). When the
     * Gemini AI key is configured, a short profile description is generated
     * for NEWLY created developers — failures are swallowed so the import
     * never depends on the AI being reachable.
     */
    private function resolveDeveloper(array &$attributes): void
    {
        $name = $attributes['developer_name'] ?? null;
        if (!$name) {
            return;
        }

        $developer = Developer::whereRaw('LOWER(name) = ?', [strtolower($name)])->first();

        if (!$developer) {
            $developer = Developer::create(['name' => $name, 'type' => 'developer']);
            $this->generateDeveloperDescription($developer);
        }

        $attributes['developer_id'] = $developer->id;
    }

    /** Best-effort AI description for a newly imported developer. */
    private function generateDeveloperDescription(Developer $developer): void
    {
        // Same guard as the rest of the AI features: no key, no call.
        if (empty(config('services.gemini.api_key'))) {
            return;
        }

        try {
            $prompt = "Write a professional 2-3 sentence profile description for the real estate developer \"{$developer->name}\" "
                . 'operating in the Greater Toronto Area. Focus on residential condominium development. '
                . 'Do not invent specific project names, awards or founding dates. Return plain text only.';

            $description = app(GeminiAIService::class)->generateBuildingDescription($prompt, ['name' => $developer->name]);

            // Only persist a real answer — the service returns a generic
            // building-flavoured fallback string on API failure.
            if (is_string($description) && strlen(trim($description)) > 60 && stripos($description, 'this building') === false) {
                $developer->update(['description' => trim($description)]);
            }
        } catch (\Throwable $e) {
            Log::warning('Developer AI description skipped during CSV import', [
                'developer' => $developer->name,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /** Convert neighbourhood_name / sub_neighbourhood_name → taxonomy IDs. */
    private function resolveNeighbourhoods(array &$attributes): void
    {
        $neighbourhood = null;
        if (!empty($attributes['neighbourhood_name'])) {
            $neighbourhood = Neighbourhood::firstOrCreate(
                ['name' => $attributes['neighbourhood_name']],
                ['city' => $attributes['city'] ?? null, 'is_active' => true, 'sort_order' => 0]
            );
            $attributes['neighbourhood_id'] = $neighbourhood->id;
            $attributes['neighbourhood'] = $neighbourhood->name;
        }
        unset($attributes['neighbourhood_name']);

        if (!empty($attributes['sub_neighbourhood_name'])) {
            $sub = SubNeighbourhood::firstOrCreate(
                [
                    'name' => $attributes['sub_neighbourhood_name'],
                    'neighbourhood_id' => $neighbourhood?->id,
                ],
                ['is_active' => true, 'sort_order' => 0]
            );
            $attributes['sub_neighbourhood_id'] = $sub->id;
            $attributes['sub_neighbourhood'] = $sub->name;
        }
        unset($attributes['sub_neighbourhood_name']);
    }

    private function castScalars(array $attributes): array
    {
        foreach (self::INTEGER_FIELDS as $field) {
            if (isset($attributes[$field])) {
                $clean = preg_replace('/[^\d\-]/', '', $attributes[$field]);
                $value = $clean === '' ? null : (int) $clean;
                // Drop implausible values (placeholder 0s, corrupted cells)
                // instead of clobbering existing data with garbage.
                [$min, $max] = self::INTEGER_BOUNDS[$field] ?? [PHP_INT_MIN, PHP_INT_MAX];
                if ($value === null || $value < $min || $value > $max) {
                    unset($attributes[$field]);
                } else {
                    $attributes[$field] = $value;
                }
            }
        }
        foreach (self::FLOAT_FIELDS as $field) {
            if (isset($attributes[$field])) {
                $attributes[$field] = is_numeric($attributes[$field]) ? (float) $attributes[$field] : null;
            }
        }
        if (isset($attributes['date_registered'])) {
            try {
                $attributes['date_registered'] = \Carbon\Carbon::parse($attributes['date_registered'])->toDateString();
            } catch (\Throwable) {
                unset($attributes['date_registered']);
            }
        }
        return $attributes;
    }

    /** Snap status / listing_type / building_type onto their allowed values. */
    private function normalizeEnums(array $attributes): array
    {
        if (isset($attributes['status'])) {
            $status = strtolower(str_replace([' ', '-'], '_', $attributes['status']));
            $attributes['status'] = in_array($status, self::VALID_STATUSES, true) ? $status : 'active';
        }
        if (isset($attributes['listing_type'])) {
            $match = collect(self::VALID_LISTING_TYPES)
                ->first(fn ($t) => strcasecmp($t, $attributes['listing_type']) === 0);
            if ($match) {
                $attributes['listing_type'] = $match;
            } else {
                unset($attributes['listing_type']);
            }
        }
        if (isset($attributes['building_type'])) {
            $attributes['building_type'] = $this->normalizeBuildingType($attributes['building_type']);
        }
        return $attributes;
    }

    /**
     * Snap free-form spreadsheet types ("Low-Rise condo", "High-Rise",
     * "Townhouse") onto the values the admin UI uses: condominium,
     * apartment, townhouse, commercial, mixed_use.
     */
    private function normalizeBuildingType(string $raw): string
    {
        $type = strtolower(str_replace([' ', '-'], '_', trim($raw)));

        return match (true) {
            str_contains($type, 'condo') || str_contains($type, 'rise') => 'condominium',
            str_contains($type, 'town') => 'townhouse',
            str_contains($type, 'apartment') => 'apartment',
            str_contains($type, 'mixed') => 'mixed_use',
            str_contains($type, 'commercial') => 'commercial',
            default => $type,
        };
    }

    private function openCsv(string $path)
    {
        $handle = @fopen($path, 'r');
        if ($handle === false) {
            throw new \RuntimeException('Could not open the uploaded CSV file.');
        }
        return $handle;
    }

    private function detectDelimiter(string $path): string
    {
        $firstLine = (string) @file_get_contents($path, false, null, 0, 4096);
        $counts = [
            ',' => substr_count($firstLine, ','),
            ';' => substr_count($firstLine, ';'),
            "\t" => substr_count($firstLine, "\t"),
        ];
        arsort($counts);
        $best = array_key_first($counts);
        return $counts[$best] > 0 ? $best : ',';
    }

    /** Strip a UTF-8 BOM from the first header cell (Excel exports have one). */
    private function stripBom(array $headers): array
    {
        if (isset($headers[0])) {
            $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $headers[0]);
        }
        return $headers;
    }

    private function isBlankRow(array $row): bool
    {
        return $row === [null] || trim(implode('', array_map(fn ($v) => (string) $v, $row))) === '';
    }
}
