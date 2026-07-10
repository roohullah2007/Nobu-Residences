<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Developer;
use App\Services\DevelopersApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin JSON endpoints for the Condos.ca Developers API: live search,
 * building-name -> developer auto-match, and import-into-local-DB. All
 * remote traffic is proxied server-side so the API key stays in .env.
 */
class DeveloperApiController extends Controller
{
    public function __construct(protected DevelopersApiService $developersApi)
    {
    }

    /**
     * Live search of the remote developer directory (used by the developer
     * search inputs on the building form and the Add Developer modal).
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate(['q' => 'required|string|min:2|max:255']);

        $results = $this->developersApi->search($validated['q']);

        return response()->json([
            'configured' => $this->developersApi->isConfigured(),
            'developers' => $results['developers'],
            'buildings' => $results['buildings'],
        ]);
    }

    /**
     * Auto-match: given a building name, find its developer on the API,
     * import it (existing local rows are reused; only missing fields are
     * filled) and return the local record so the form can select it.
     */
    public function matchBuilding(Request $request): JsonResponse
    {
        $validated = $request->validate(['name' => 'required|string|min:2|max:255']);

        $match = $this->developersApi->matchDeveloperByBuildingName($validated['name']);
        if (!$match || empty($match['slug'])) {
            return response()->json(['developer' => null]);
        }

        $developer = $this->developersApi->importDeveloper($match['slug']);

        return response()->json(['developer' => $developer ? $this->toOption($developer) : null]);
    }

    /**
     * Import a developer picked from the API search results into the local
     * developers table.
     */
    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate(['slug' => 'required|string|max:255']);

        $developer = $this->developersApi->importDeveloper($validated['slug']);
        if (!$developer) {
            return response()->json(['message' => 'Developer not found on the developer directory.'], 404);
        }

        return response()->json(
            $this->toOption($developer),
            $developer->wasRecentlyCreated ? 201 : 200
        );
    }

    /**
     * The shape the QuickCreateSelect/dropdown callers expect.
     */
    protected function toOption(Developer $developer): array
    {
        return [
            'id' => $developer->id,
            'name' => $developer->name,
            'type' => $developer->type,
            'slug' => $developer->slug,
        ];
    }
}
