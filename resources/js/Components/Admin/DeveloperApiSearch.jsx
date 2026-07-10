import { useEffect, useRef, useState } from 'react';
import { searchDevelopersApi } from '@/utils/developersApi';

const SEARCH_DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

/**
 * Debounced developer search against the condos.ca Developers API (via the
 * admin proxy). Renders a text input with a result dropdown; picking a
 * result calls onSelect(apiDeveloper) — importing/selecting the developer
 * is the caller's job. Results carry { slug, name, building_count,
 * website, logo_url }.
 */
export default function DeveloperApiSearch({
    label = 'Search developer directory',
    placeholder = 'Type a developer name (condos.ca directory)...',
    onSelect,
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const requestIdRef = useRef(0);

    useEffect(() => {
        const term = query.trim();
        if (term.length < MIN_QUERY_LENGTH) {
            setResults([]);
            setIsLoading(false);
            return undefined;
        }

        setIsLoading(true);
        setError('');
        const requestId = ++requestIdRef.current;
        const timer = setTimeout(async () => {
            try {
                const data = await searchDevelopersApi(term);
                if (requestId !== requestIdRef.current) return;
                setResults(data?.developers ?? []);
                if (data?.configured === false) {
                    setError('The developer directory is not configured (DEVELOPERS_API_KEY missing).');
                }
            } catch (err) {
                if (requestId !== requestIdRef.current) return;
                setError(err.message ?? 'Search failed.');
                setResults([]);
            } finally {
                if (requestId === requestIdRef.current) setIsLoading(false);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (developer) => {
        setQuery('');
        setResults([]);
        onSelect?.(developer);
    };

    const hasQuery = query.trim().length >= MIN_QUERY_LENGTH;

    return (
        <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            <input
                type="text"
                autoComplete="off"
                className="block w-full rounded-md !border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900"
                value={query}
                placeholder={placeholder}
                onChange={(e) => setQuery(e.target.value)}
            />
            {isLoading && <p className="mt-1 text-xs text-gray-400">Searching directory...</p>}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {hasQuery && !isLoading && !error && results.length === 0 && (
                <p className="mt-1 text-xs text-gray-400">No developers found in the directory.</p>
            )}
            {results.length > 0 && (
                <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
                    {results.map((developer) => (
                        <li key={developer.slug}>
                            <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-gray-900 hover:bg-indigo-50"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelect(developer);
                                }}
                            >
                                {developer.logo_url ? (
                                    <img
                                        src={developer.logo_url}
                                        alt=""
                                        className="h-6 w-6 rounded object-contain"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs font-semibold text-gray-500">
                                        {(developer.name ?? '?').charAt(0)}
                                    </span>
                                )}
                                <span className="flex-1 truncate">{developer.name}</span>
                                {developer.building_count > 0 && (
                                    <span className="text-xs text-gray-400">{developer.building_count} buildings</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
