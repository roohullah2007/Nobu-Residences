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
        'street_address_2' => 'Combine into Address (& secondary street)',
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
        'images' => 'Image URLs (downloaded in background; first becomes main image)',
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
     * Hard cap on hyphen-range address expansion. Mirrors the Create page's
     * Expand button (Create.jsx detectAddressRange), which pushes numbers one
     * by one and breaks once the list exceeds 50 — i.e. at most 51 entries.
     */
    private const ADDRESS_EXPANSION_CAP = 51;

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

        // "700 sqft - 1411 sqft" spreadsheet cells → canonical "700 - 1411 sqft".
        $this->normalizeSqftRange($attributes);

        // Compose the full address the way the Create page's Address field is
        // typed (Street_1 [& Street_2], City), then auto-expand hyphen ranges
        // ("455-480 Front St W …") and "&"-joined street lists into the
        // structured address columns exactly like the Create page's "Expand"
        // button + save pipeline. Keep the raw street cell around so rows
        // imported BEFORE address composition existed (address stored as the
        // bare Street_1) are still recognized as the same building.
        $rawAddress = $attributes['address'] ?? null;
        $this->composeAddress($attributes);
        $this->expandAddressRange($attributes);

        // Amenities and maintenance-fee inclusions are relational
        // (belongsToMany) — pull them out of the column attributes and sync
        // them after the building is saved.
        $amenityNames = $this->extractDelimitedNames($attributes, 'amenities');
        $maintenanceAmenityNames = $this->extractDelimitedNames($attributes, 'maintenance_fee_amenities');

        // Image links are parked in pending_image_urls; the scheduled
        // buildings:download-images command downloads them to local storage
        // and only then fills main_image / images (never remote hotlinks).
        $this->extractImages($attributes);

        // Resolve name-based relations, creating them on the fly.
        $this->resolveDeveloper($attributes);
        $this->resolveNeighbourhoods($attributes);

        // Match on the composed address first, then fall back to the raw
        // Street_1 cell — buildings imported before address composition was
        // added stored the bare street, and re-importing must update/skip
        // them rather than create a duplicate.
        $addressCandidates = array_values(array_unique(array_filter([
            $attributes['address'] ?? null,
            $rawAddress,
        ])));
        $existing = null;
        foreach ($addressCandidates as $candidate) {
            $existing = Building::where('name', $name)->where('address', $candidate)->first();
            if ($existing) {
                break;
            }
        }
        if (!$existing && empty($addressCandidates)) {
            $existing = Building::where('name', $name)->first();
        }

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
     * Park the mapped image-links cell in pending_image_urls. We deliberately
     * do NOT write remote URLs into main_image / images — serving hotlinked
     * third-party images is not wanted. The scheduled
     * `buildings:download-images` command downloads each URL to local storage
     * (public/images/buildings, same convention as manual admin uploads) and
     * promotes the stored paths to main_image (first) + the images array.
     *
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
            ->unique()
            ->values()
            ->all();
        if (empty($urls)) {
            return;
        }
        $attributes['pending_image_urls'] = $urls;
        $attributes['image_download_attempts'] = 0;
    }

    /**
     * Normalize a mapped sqft_range cell to the canonical "700 - 1411 sqft"
     * form. Spreadsheets carry the unit on every bound ("700 sqft - 1411
     * sqft"), sometimes with commas or "sq ft" variants; the duplicated unit
     * made the value needlessly long and rendered badly on the building page.
     * Single values become "700 sqft". Cells without any number are dropped.
     */
    private function normalizeSqftRange(array &$attributes): void
    {
        if (!isset($attributes['sqft_range'])) {
            return;
        }
        $raw = (string) $attributes['sqft_range'];
        if (!preg_match_all('/\d[\d,]*(?:\.\d+)?/', $raw, $m) || empty($m[0])) {
            unset($attributes['sqft_range']);
            return;
        }
        $numbers = collect($m[0])
            ->map(fn ($n) => (float) str_replace(',', '', $n))
            ->filter(fn ($n) => $n > 0);
        if ($numbers->isEmpty()) {
            unset($attributes['sqft_range']);
            return;
        }
        $min = (int) round($numbers->min());
        $max = (int) round($numbers->max());
        $attributes['sqft_range'] = $min === $max ? "{$min} sqft" : "{$min} - {$max} sqft";
    }

    /**
     * Compose the primary address exactly the way the Create page's Address
     * field is typed: "Street_1 & Street_2, City".
     *
     * Street_2 is only appended when it isn't already contained in Street_1 —
     * some sheets repeat it (e.g. Street_1 "229 Sutherland St S & 255 Warden
     * St" with Street_2 "255 Warden St"), which must not become
     * "… & 255 Warden St & 255 Warden St". The city suffix is skipped when
     * the street already carries it.
     */
    private function composeAddress(array &$attributes): void
    {
        $street = trim((string) ($attributes['address'] ?? ''));
        if ($street === '') {
            return;
        }
        $street2 = trim((string) ($attributes['street_address_2'] ?? ''));
        if ($street2 !== '' && stripos($street, $street2) === false) {
            $street .= ' & ' . $street2;
        }
        $city = trim((string) ($attributes['city'] ?? ''));
        if ($city !== '' && stripos($street, $city) === false) {
            $street .= ', ' . $city;
        }
        $attributes['address'] = $street;
    }

    /**
     * Server-side port of the Create page's "Detected range — expand?" button
     * (Create.jsx detectAddressRange + handleExpandRange). Runs automatically
     * on import — no button to click — and persists the expanded list the way
     * the Create flow ends up storing it after Save
     * (Admin\BuildingController::distributeAdditionalAddresses): first →
     * street_address_1, second → street_address_2, rest → additional_addresses.
     *
     * When it applies, the distribution REPLACES any directly-mapped
     * street_address_2 cell — the secondary street already participates in
     * the combined address, so writing it verbatim as well would diverge from
     * what the Create page stores.
     */
    private function expandAddressRange(array &$attributes): void
    {
        $address = trim((string) ($attributes['address'] ?? ''));
        if ($address === '') {
            return;
        }

        $expanded = $this->detectAddressRange($address);
        if ($expanded === null) {
            return;
        }

        $attributes['street_address_1'] = $expanded[0];
        $attributes['street_address_2'] = $expanded[1] ?? null;
        $remaining = array_values(array_slice($expanded, 2));
        $attributes['additional_addresses'] = !empty($remaining) ? $remaining : null;
    }

    /**
     * Faithful PHP port of Create.jsx detectAddressRange. The address is
     * split on "&" / "," FIRST (parts not starting with a digit — the
     * ", City" suffix — are dropped), THEN each segment that is a numeric
     * hyphen range expands to every number in it (step 1, odd AND even):
     * "455-480 Front St W & 455 Wellington St W, Toronto" → 455..480 Front
     * St W plus 455 Wellington St W. Expanding before splitting used to glue
     * the "& …" tail onto every number ("456 Front St W & 455 Wellington St
     * W") — addresses that match nothing in the MLS. Segments where
     * end <= start (unit prefixes like "1408-123 Main St") never expand.
     * The combined list is capped at ADDRESS_EXPANSION_CAP entries, with a
     * log line when a range is truncated.
     *
     * @return string[]|null The expanded address list, or null when the
     *                       address is a single plain address.
     */
    private function detectAddressRange(string $address): ?array
    {
        $segments = array_values(array_filter(
            array_map(fn ($p) => trim((string) $p), preg_split('/\s*[,&]\s*/u', $address)),
            fn ($p) => preg_match('/^\d/', $p) === 1
        ));
        if (empty($segments)) {
            return null;
        }

        $expandedAny = false;
        $expanded = [];
        foreach ($segments as $segment) {
            if (preg_match('/^(\d+)\s*[-\x{2013}\x{2014}]\s*(\d+)\s+(.+)$/u', $segment, $m)
                && (int) $m[2] > (int) $m[1] && trim($m[3]) !== '') {
                $start = (int) $m[1];
                $end = (int) $m[2];
                $rest = trim($m[3]);
                $expandedAny = true;
                for ($n = $start; $n <= $end; $n++) {
                    if (count($expanded) >= self::ADDRESS_EXPANSION_CAP) {
                        Log::info('Building CSV import: address range truncated at expansion cap', [
                            'address' => $address,
                            'cap' => self::ADDRESS_EXPANSION_CAP,
                            'range' => "{$start}-{$end}",
                        ]);
                        break;
                    }
                    $expanded[] = $n . ' ' . $rest;
                }
                continue;
            }
            if (count($expanded) < self::ADDRESS_EXPANSION_CAP) {
                $expanded[] = $segment;
            }
        }

        if (!$expandedAny && count($expanded) < 2) {
            return null;
        }

        return $expanded;
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
