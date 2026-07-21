// Home-only (ICE-style) data helpers and listing-normalisation utilities.
// These are used exclusively by the redesigned public home page and must
// NOT be imported by the building detail page.

import { generatePropertyUrl } from '@/utils/propertyUrl';

// Normalise a raw MLS/homepage listing object (mixed PascalCase / camelCase
// shapes) into a flat, predictable structure for the ICE-style cards/tables.
// Pass the site's building so card links carry the canonical building-slug
// URL (/{city}/{building-slug}/unit-{unit}-{MLS}) instead of the
// /property/{MLS} redirect's shorter address-only form.
export function normalizeListing(p, { isRental = false, building = null } = {}) {
    if (!p) return null;

    const listingKey = p.ListingKey || p.listingKey || '';
    const price = Number(p.ListPrice || p.price || 0) || 0;
    const bedrooms = Number(p.BedroomsTotal || p.bedroomsTotal || p.bedrooms || 0) || 0;
    const bathrooms = Number(p.BathroomsTotalInteger || p.bathroomsTotalInteger || p.bathrooms || 0) || 0;
    const parking = Number(p.ParkingTotal || p.parkingTotal || p.parking || 0) || 0;

    const unitNumber = p.UnitNumber || p.unitNumber || '';
    const streetNumber = p.StreetNumber || p.streetNumber || '';
    const streetName = p.StreetName || p.streetName || '';
    const city = p.City || p.city || 'Toronto';

    // Display address: "1901 - 15 Mercer"
    let addressLine = '';
    if (unitNumber && streetNumber && streetName) {
        addressLine = `${unitNumber} - ${streetNumber} ${streetName}`.trim();
    } else if (streetNumber && streetName) {
        addressLine = `${streetNumber} ${streetName}`.trim();
    } else if (p.address) {
        addressLine = String(p.address).split(',')[0].trim();
    } else {
        addressLine = 'Address available on request';
    }

    const imageUrl =
        p.MediaURL ||
        p.imageUrl ||
        p.image ||
        (Array.isArray(p.images) && p.images.length ? p.images[0] : '') ||
        '/images/no-image-placeholder.jpg';

    const sqftRaw = p.LivingAreaRange || p.livingAreaRange || p.sqft || '';
    const sqft = sqftRaw
        ? (typeof sqftRaw === 'string' ? sqftRaw : `${sqftRaw} sqft`)
        : '';

    const broker = p.ListOfficeName || p.listOfficeName || '';
    const buildingName = p.building_name || p.buildingName || '';

    // Best-effort listing date for "New This Week"
    const dateRaw =
        p.ListingDate || p.listingDate || p.OriginalEntryTimestamp ||
        p.ModificationTimestamp || p.created_at || p.createdAt || null;
    let listedAt = null;
    if (dateRaw) {
        const d = new Date(dateRaw);
        if (!isNaN(d.getTime())) listedAt = d;
    }

    const den = !!(p.den || p.Den || /den/i.test(String(p.PropertySubType || p.propertyType || '')));

    return {
        listingKey,
        url: listingKey ? generatePropertyUrl(p, building) : '/search',
        price,
        bedrooms,
        bathrooms,
        parking,
        unitNumber,
        addressLine,
        city,
        imageUrl,
        sqft,
        broker,
        buildingName,
        listedAt,
        den,
        maintenance: p.maintenance ?? p.maintenanceFee ?? p.MaintenanceFee ?? null,
        daysOnMarket: (p.days_on_market ?? p.daysOnMarket ?? null),
        isRental: isRental || !!p.isRental,
    };
}

// Format a maintenance fee value into "$X/mo" (e.g. "$502.45/mo").
// Returns '' when the value is missing or not a positive number.
export function formatMaint(n) {
    if (n == null) return '';
    const num = typeof n === 'number' ? n : parseFloat(String(n).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(num) || num <= 0) return '';
    const rounded = Math.round(num * 100) / 100;
    const text = Number.isInteger(rounded)
        ? rounded.toLocaleString('en-US')
        : rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `$${text}/mo`;
}

export function formatMoney(n) {
    if (!n || n <= 0) return '—';
    return `$${Math.round(n).toLocaleString('en-US')}`;
}

export function formatMoneyShort(n) {
    if (!n || n <= 0) return '—';
    if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return `$${Math.round(n).toLocaleString('en-US')}`;
}

export function priceStats(list) {
    const prices = list.map((l) => l.price).filter((p) => p > 0);
    if (!prices.length) return { count: list.length, min: 0, max: 0, avg: 0 };
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { count: list.length, min, max, avg };
}

// Group listings by bedroom bucket for the Unit Types table.
export function bedroomLabel(l) {
    if (l.bedrooms <= 0) return 'Studio';
    if (l.bedrooms === 1) return l.den ? '1 Bed + Den' : '1 Bedroom';
    return `${l.bedrooms} Bedrooms`;
}

const BUCKET_ORDER = ['Studio', '1 Bedroom', '1 Bed + Den', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms'];

export function groupByBedrooms(list) {
    const map = new Map();
    list.forEach((l) => {
        const key = bedroomLabel(l);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(l);
    });

    const rows = [];
    map.forEach((items, label) => {
        const stats = priceStats(items);
        // Size range from sqft strings (handles "416-1389" or numeric)
        const sizes = items
            .map((i) => i.sqft)
            .filter(Boolean);
        rows.push({
            label,
            count: items.length,
            avg: stats.avg,
            min: stats.min,
            max: stats.max,
            sizeSample: sizes[0] || '',
        });
    });

    rows.sort((a, b) => {
        const ia = BUCKET_ORDER.indexOf(a.label);
        const ib = BUCKET_ORDER.indexOf(b.label);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    return rows;
}
