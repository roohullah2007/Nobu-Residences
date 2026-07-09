<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\BuildingCsvImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CSV import for buildings: upload → column-to-field mapping → run.
 *
 * The uploaded file is parked in storage/app/building-imports under a random
 * token; the mapping step references it by token so nothing sensitive rides
 * in the client payload.
 */
class BuildingImportController extends Controller
{
    private const STORAGE_DIR = 'building-imports';

    public function __construct(private readonly BuildingCsvImportService $importer)
    {
    }

    /**
     * The import wizard page.
     */
    public function show(): Response
    {
        return Inertia::render('Admin/Buildings/Import', [
            'importableFields' => BuildingCsvImportService::IMPORTABLE_FIELDS,
        ]);
    }

    /**
     * Step 1: receive the CSV, park it, return headers + preview + token.
     */
    public function upload(Request $request): JsonResponse
    {
        // Extension-based check instead of mimes: — Excel-exported CSVs are
        // often sniffed as application/vnd.ms-excel and would fail mimes:csv.
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $extension = strtolower($request->file('file')->getClientOriginalExtension());
        if (!in_array($extension, ['csv', 'txt'], true)) {
            return response()->json(['message' => 'Please upload a .csv file.'], 422);
        }

        $token = Str::uuid()->toString();
        $path = $request->file('file')->storeAs(self::STORAGE_DIR, $token . '.csv');

        try {
            $parsed = $this->importer->parse(Storage::path($path));
        } catch (\Throwable $e) {
            Storage::delete($path);
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'token' => $token,
            'headers' => $parsed['headers'],
            'preview' => $parsed['preview'],
            'total_rows' => $parsed['total_rows'],
        ]);
    }

    /**
     * Step 2: run the import with the admin's column mapping.
     */
    public function run(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|uuid',
            'mapping' => 'required|array|min:1',
            'mapping.*' => 'string',
            'duplicate_action' => 'required|in:skip,update',
        ]);

        $path = self::STORAGE_DIR . '/' . $validated['token'] . '.csv';
        if (!Storage::exists($path)) {
            return response()->json(['message' => 'Upload expired — please upload the CSV again.'], 404);
        }

        try {
            $result = $this->importer->import(
                Storage::path($path),
                $validated['mapping'],
                $validated['duplicate_action']
            );
        } catch (\Throwable $e) {
            Log::error('Building CSV import failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 422);
        } finally {
            Storage::delete($path);
        }

        return response()->json($result);
    }
}
