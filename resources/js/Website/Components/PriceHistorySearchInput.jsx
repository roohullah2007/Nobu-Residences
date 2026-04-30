import React, { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * Search input with autocomplete that resolves to /price-history/{listingKey}.
 * Used standalone on the /price-history landing page, and also embedded at
 * the top of /price-history/{listingKey} pre-filled with the listing's
 * address so the user can pivot to another listing's history.
 */
export default function PriceHistorySearchInput({
  initialQuery = '',
  placeholder = 'Search by address or MLS number (e.g. C12345678)',
  autoFocus = false,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const requestSeq = useRef(0);
  // The pre-filled address triggers an immediate fetch on mount, which
  // would auto-open the dropdown before the user has interacted. Track
  // whether the user has typed at least once before showing results.
  const userTypedRef = useRef(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const seq = ++requestSeq.current;
      try {
        const res = await fetch(
          `/api/price-history-suggestions?q=${encodeURIComponent(query.trim())}&limit=8`
        );
        const data = await res.json();
        if (seq !== requestSeq.current) return;
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        if (userTypedRef.current) setOpen(true);
        setHighlightIdx(-1);
      } catch (_e) {
        if (seq !== requestSeq.current) return;
        setSuggestions([]);
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    }, 200);

    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const goTo = (listingKey) => {
    if (!listingKey) return;
    router.visit(`/price-history/${listingKey}`);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (/^[A-Za-z]\d+$/.test(trimmed)) {
      goTo(trimmed.toUpperCase());
      return;
    }
    const target = suggestions[highlightIdx >= 0 ? highlightIdx : 0]?.listingKey;
    if (target) goTo(target);
  };

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <form ref={wrapRef} onSubmit={onSubmit} className="relative w-full">
      <div className="bg-[#F5F5F5] rounded-2xl p-2 flex items-center gap-2">
        <div className="flex-1 bg-white rounded-xl flex items-center gap-3 px-4 py-3 min-h-[52px]">
          <svg
            className="w-5 h-5 text-[#293056] flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              userTypedRef.current = true;
              setQuery(e.target.value);
            }}
            onFocus={() => suggestions.length > 0 && userTypedRef.current && setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="flex-1 border-0 outline-none focus:ring-0 text-sm font-work-sans text-[#293056] bg-transparent"
            autoFocus={autoFocus}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                userTypedRef.current = true;
                setQuery('');
                setSuggestions([]);
                setOpen(false);
                inputRef.current?.focus();
              }}
              className="text-[#293056] hover:text-[#037888] text-lg leading-none px-1"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-[#293056] text-white px-6 py-3 rounded-xl font-work-sans font-bold text-sm hover:opacity-90 transition-opacity min-h-[52px]"
        >
          Search
        </button>
      </div>

      {open && (suggestions.length > 0 || loading) && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
          )}
          {!loading &&
            suggestions.map((s, idx) => (
              <button
                key={`${s.listingKey}-${idx}`}
                type="button"
                onClick={() => goTo(s.listingKey)}
                onMouseEnter={() => setHighlightIdx(idx)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                  highlightIdx === idx ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                {s.image ? (
                  <img
                    src={s.image}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#293056] truncate">
                    {s.address || s.listingKey}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {[s.city, s.province, s.postalCode].filter(Boolean).join(', ')}
                    {s.listingKey ? ` · MLS ${s.listingKey}` : ''}
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}
    </form>
  );
}
