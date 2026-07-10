import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { c as csrfHeaders } from "./csrf-Rc-HMXbg.js";
const JSON_HEADERS = {
  Accept: "application/json",
  "X-Requested-With": "XMLHttpRequest"
};
async function searchDevelopersApi(query) {
  const url = `${route("admin.api.developers-api.search")}?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: JSON_HEADERS });
  if (!response.ok) {
    throw new Error(`Developer directory search failed (${response.status})`);
  }
  return response.json();
}
async function importDeveloperFromApi(slug) {
  const response = await fetch(route("admin.api.developers-api.import"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...csrfHeaders(), ...JSON_HEADERS },
    body: JSON.stringify({ slug })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message ?? `Import failed (${response.status})`);
  }
  return result;
}
async function matchDeveloperByBuildingName(name) {
  const response = await fetch(route("admin.api.developers-api.match-building"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...csrfHeaders(), ...JSON_HEADERS },
    body: JSON.stringify({ name })
  });
  if (!response.ok) {
    return null;
  }
  const result = await response.json();
  return result?.developer ?? null;
}
const SEARCH_DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;
function DeveloperApiSearch({
  label = "Search developer directory",
  placeholder = "Type a developer name (condos.ca directory)...",
  onSelect
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);
  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return void 0;
    }
    setIsLoading(true);
    setError("");
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      try {
        const data = await searchDevelopersApi(term);
        if (requestId !== requestIdRef.current) return;
        setResults(data?.developers ?? []);
        if (data?.configured === false) {
          setError("The developer directory is not configured (DEVELOPERS_API_KEY missing).");
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err.message ?? "Search failed.");
        setResults([]);
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);
  const handleSelect = (developer) => {
    setQuery("");
    setResults([]);
    onSelect?.(developer);
  };
  const hasQuery = query.trim().length >= MIN_QUERY_LENGTH;
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-500 mb-1", children: label }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        autoComplete: "off",
        className: "block w-full rounded-md !border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900",
        value: query,
        placeholder,
        onChange: (e) => setQuery(e.target.value)
      }
    ),
    isLoading && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-400", children: "Searching directory..." }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: error }),
    hasQuery && !isLoading && !error && results.length === 0 && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-400", children: "No developers found in the directory." }),
    results.length > 0 && /* @__PURE__ */ jsx("ul", { className: "absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg", children: results.map((developer) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "flex w-full items-center gap-2 px-3 py-1.5 text-left text-gray-900 hover:bg-indigo-50",
        onMouseDown: (e) => {
          e.preventDefault();
          handleSelect(developer);
        },
        children: [
          developer.logo_url ? /* @__PURE__ */ jsx(
            "img",
            {
              src: developer.logo_url,
              alt: "",
              className: "h-6 w-6 rounded object-contain",
              onError: (e) => {
                e.target.style.display = "none";
              }
            }
          ) : /* @__PURE__ */ jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs font-semibold text-gray-500", children: (developer.name ?? "?").charAt(0) }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 truncate", children: developer.name }),
          developer.building_count > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400", children: [
            developer.building_count,
            " buildings"
          ] })
        ]
      }
    ) }, developer.slug)) })
  ] });
}
export {
  DeveloperApiSearch as D,
  importDeveloperFromApi as i,
  matchDeveloperByBuildingName as m
};
