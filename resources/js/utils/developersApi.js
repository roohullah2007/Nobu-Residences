import { csrfHeaders } from '@/utils/csrf';

const JSON_HEADERS = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
};

/**
 * Thin client for the admin-side Condos.ca Developers API proxy
 * (see DEVELOPERS-API-DOCS.md). The API key stays on the server.
 */
export async function searchDevelopersApi(query) {
    const url = `${route('admin.api.developers-api.search')}?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { headers: JSON_HEADERS });
    if (!response.ok) {
        throw new Error(`Developer directory search failed (${response.status})`);
    }
    return response.json();
}

/**
 * Import an API developer into the local database. Existing developers are
 * reused (only their missing fields are filled). Resolves to
 * { id, name, type, slug } for dropdown selection.
 */
export async function importDeveloperFromApi(slug) {
    const response = await fetch(route('admin.api.developers-api.import'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders(), ...JSON_HEADERS },
        body: JSON.stringify({ slug }),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result?.message ?? `Import failed (${response.status})`);
    }
    return result;
}

/**
 * Auto-match: resolve a building name to its developer via the API and
 * import it. Resolves to { id, name, type, slug } or null when no match.
 */
export async function matchDeveloperByBuildingName(name) {
    const response = await fetch(route('admin.api.developers-api.match-building'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders(), ...JSON_HEADERS },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        return null;
    }
    const result = await response.json();
    return result?.developer ?? null;
}
