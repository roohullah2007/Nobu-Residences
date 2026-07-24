import React, { useState, useEffect } from 'react';
import { csrfHeaders } from '@/utils/csrf';

/**
 * SaveSearchModal — save the current search criteria as a SavedSearch with
 * email alerts. Used from the Search results page ("Get alerts for this
 * search") and building pages ("Notify me when units become available").
 *
 * Guest flow: the host page stashes the intent in sessionStorage
 * (PENDING_SAVED_SEARCH_KEY), opens the login modal, and re-opens this modal
 * after the post-login page load.
 */

export const PENDING_SAVED_SEARCH_KEY = 'pendingSavedSearch';

export const stashPendingSavedSearch = (payload) => {
  try {
    sessionStorage.setItem(PENDING_SAVED_SEARCH_KEY, JSON.stringify(payload));
  } catch (e) {
    // sessionStorage unavailable (private mode etc.) — intent is simply lost
  }
};

export const popPendingSavedSearch = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_SAVED_SEARCH_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_SAVED_SEARCH_KEY);
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const FREQUENCIES = [
  { value: 1, label: 'Daily' },
  { value: 7, label: 'Weekly' },
  { value: 30, label: 'Monthly' },
];

// Human-readable one-liner of the criteria being saved.
const summarizeCriteria = (params = {}) => {
  const parts = [];
  if (params.query) parts.push(params.query);
  if (params.status) parts.push(params.status);
  if (Array.isArray(params.property_type) && params.property_type.length > 0) {
    parts.push(params.property_type.join(', '));
  }
  if (params.bedrooms > 0) parts.push(`${params.bedrooms}+ beds`);
  if (params.bathrooms > 0) parts.push(`${params.bathrooms}+ baths`);
  if (params.price_min > 0 || (params.price_max > 0 && params.price_max < 10000000)) {
    const min = params.price_min > 0 ? `$${Number(params.price_min).toLocaleString()}` : '$0';
    const max = params.price_max > 0 && params.price_max < 10000000
      ? `$${Number(params.price_max).toLocaleString()}`
      : 'any';
    parts.push(`${min} – ${max}`);
  }
  if (params.min_sqft > 0) parts.push(`${params.min_sqft}+ sqft`);
  return parts.join(' · ');
};

export default function SaveSearchModal({
  isOpen,
  onClose,
  searchParams = {},
  defaultName = '',
  auth,
  onSaved,
  onLoginRequired,
  buttonPrimaryBg = '#293056',
  buttonPrimaryText = '#FFFFFF',
  buttonQuaternaryBg = '#FFFFFF',
  buttonQuaternaryText = '#293056',
}) {
  const [searchName, setSearchName] = useState(defaultName);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [frequency, setFrequency] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchName(defaultName);
      setError('');
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const criteria = summarizeCriteria(searchParams);

  const handleSave = async () => {
    if (!auth?.user) {
      stashPendingSavedSearch({ search_params: searchParams, name: searchName || defaultName });
      onClose();
      if (onLoginRequired) onLoginRequired();
      return;
    }

    if (!searchName.trim()) {
      setError('Please enter a name for your search');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/save-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({
          name: searchName.trim(),
          search_params: searchParams,
          email_alerts: emailAlerts,
          frequency,
        }),
      });

      const contentType = response.headers.get('content-type');
      if ((contentType && contentType.includes('text/html')) || response.status === 401) {
        stashPendingSavedSearch({ search_params: searchParams, name: searchName || defaultName });
        onClose();
        if (onLoginRequired) onLoginRequired();
        return;
      }

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save search');
      }

      onClose();
      if (onSaved) onSaved(result.data);
    } catch (e) {
      setError(e.message || 'Failed to save search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-2 mb-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={buttonPrimaryBg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={buttonPrimaryBg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="text-lg font-bold" style={{ color: buttonQuaternaryText }}>Get email alerts</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          We'll email you when new listings match this search.
        </p>

        {criteria && (
          <div className="mb-4 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
            {criteria}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Name
          </label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="e.g., Downtown Toronto Condos"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#293056]"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded border-gray-300 text-[#293056] focus:ring-[#293056]"
            />
            <span className="ml-2 text-sm text-gray-700">
              Send me email alerts for new matching listings
            </span>
          </label>
        </div>

        {emailAlerts && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert frequency
            </label>
            <div className="flex gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className="flex-1 px-3 py-2 rounded-md border text-sm font-medium transition-all"
                  style={frequency === f.value
                    ? { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText, borderColor: buttonPrimaryBg }
                    : { backgroundColor: '#FFFFFF', color: '#374151', borderColor: '#D1D5DB' }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-md hover:opacity-80 transition-all"
            style={{ backgroundColor: buttonQuaternaryBg, color: buttonQuaternaryText, borderColor: buttonQuaternaryText }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
          >
            {isLoading ? 'Saving...' : emailAlerts ? 'Save & Get Alerts' : 'Save Search'}
          </button>
        </div>
      </div>
    </div>
  );
}
