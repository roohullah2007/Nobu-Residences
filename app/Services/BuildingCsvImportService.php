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
        'description' => 'Description',
        'website_url' => 'Website URL',
        'virtual_tour_url' => 'Virtual Tour URL',
        'latitude' => 'Latitude',
        'longitude' => 'Longitude',
    ];

    private const INTEGER_FIELDS = ['total_units', 'floors', 'year_built', 'parking_spots', 'locker_spots'];
    private const FLOAT_FIELDS = ['latitude', 'longitude'];

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
     * Run the import.
     *
     * @param string $path Absolute path to the uploaded CSV.
     * @param array<int|string, string> $mapping CSV column index => building field key.
     * @param string $duplicateAction self::DUPLICATE_SKIP | self::DUPLICATE_UPDATE
     * @return array{created: int, updated: int, skipped: int, errors: array<int, string>}
     */
    public function import(string $path, array $mapping, string $duplicateAction = self::DUPLICATE_SKIP): array
    {
        $mapping = array_filter($mapping, fn ($field) => isset(self::IMPORTABLE_FIELDS[$field]));
        if (!in_array('name', $mapping, true)) {
            throw new \RuntimeException('Map a CSV column to "Building Name" before importing.');
        }

        $handle = $this->openCsv($path);
        $delimiter = $this->detectDelimiter($path);
        fgetcsv($handle, 0, $delimiter, '"', '\\'); // skip header row

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];
        $line = 1;

        while (($row = fgetcsv($handle, 0, $delimiter, '"', '\\')) !== false) {
            $line++;
            if ($this->isBlankRow($row)) {
                continue;
            }

            try {
                $result = $this->importRow($row, $mapping, $duplicateAction);
                match ($result) {
                    'created' => $created++,
                    'updated' => $updated++,
                    default => $skipped++,
                };
            } catch (\Throwable $e) {
                $errors[$line] = $e->getMessage();
            }
        }
        fclose($handle);

        Log::info('Building CSV import finished', [
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
            'error_count' => count($errors),
        ]);

        return [
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
            'errors' => $errors,
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
            if ($value === '') {
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
            DB::transaction(fn () => $existing->update($attributes));
            return 'updated';
        }

        if (empty($attributes['address'])) {
            throw new \RuntimeException('Address is empty.');
        }

        // Defaults apply to NEW buildings only.
        $attributes += ['city' => 'Toronto', 'province' => 'ON', 'country' => 'Canada', 'status' => 'active'];

        DB::transaction(fn () => Building::create($attributes));
        return 'created';
    }

    /** Convert developer_name → developer_id (firstOrCreate by name). */
    private function resolveDeveloper(array &$attributes): void
    {
        $name = $attributes['developer_name'] ?? null;
        if (!$name) {
            return;
        }
        $developer = Developer::firstOrCreate(['name' => $name], ['type' => 'developer']);
        $attributes['developer_id'] = $developer->id;
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
                $attributes[$field] = $clean === '' ? null : (int) $clean;
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
            $attributes['building_type'] = strtolower(str_replace([' ', '-'], '_', $attributes['building_type']));
        }
        return $attributes;
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
