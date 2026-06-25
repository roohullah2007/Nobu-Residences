function normalizeListing(p, { isRental = false } = {}) {
  if (!p) return null;
  const listingKey = p.ListingKey || p.listingKey || "";
  const price = Number(p.ListPrice || p.price || 0) || 0;
  const bedrooms = Number(p.BedroomsTotal || p.bedroomsTotal || p.bedrooms || 0) || 0;
  const bathrooms = Number(p.BathroomsTotalInteger || p.bathroomsTotalInteger || p.bathrooms || 0) || 0;
  const parking = Number(p.ParkingTotal || p.parkingTotal || p.parking || 0) || 0;
  const unitNumber = p.UnitNumber || p.unitNumber || "";
  const streetNumber = p.StreetNumber || p.streetNumber || "";
  const streetName = p.StreetName || p.streetName || "";
  const city = p.City || p.city || "Toronto";
  let addressLine = "";
  if (unitNumber && streetNumber && streetName) {
    addressLine = `${unitNumber} - ${streetNumber} ${streetName}`.trim();
  } else if (streetNumber && streetName) {
    addressLine = `${streetNumber} ${streetName}`.trim();
  } else if (p.address) {
    addressLine = String(p.address).split(",")[0].trim();
  } else {
    addressLine = "Address available on request";
  }
  const imageUrl = p.MediaURL || p.imageUrl || p.image || (Array.isArray(p.images) && p.images.length ? p.images[0] : "") || "/images/no-image-placeholder.jpg";
  const sqftRaw = p.LivingAreaRange || p.livingAreaRange || p.sqft || "";
  const sqft = sqftRaw ? typeof sqftRaw === "string" ? sqftRaw : `${sqftRaw} sqft` : "";
  const broker = p.ListOfficeName || p.listOfficeName || "";
  const buildingName = p.building_name || p.buildingName || "";
  const dateRaw = p.ListingDate || p.listingDate || p.OriginalEntryTimestamp || p.ModificationTimestamp || p.created_at || p.createdAt || null;
  let listedAt = null;
  if (dateRaw) {
    const d = new Date(dateRaw);
    if (!isNaN(d.getTime())) listedAt = d;
  }
  const den = !!(p.den || p.Den || /den/i.test(String(p.PropertySubType || p.propertyType || "")));
  return {
    listingKey,
    url: listingKey ? `/property/${listingKey}` : "/search",
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
    daysOnMarket: p.days_on_market ?? p.daysOnMarket ?? null,
    isRental: isRental || !!p.isRental
  };
}
function formatMaint(n) {
  if (n == null) return "";
  const num = typeof n === "number" ? n : parseFloat(String(n).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(num) || num <= 0) return "";
  const rounded = Math.round(num * 100) / 100;
  const text = Number.isInteger(rounded) ? rounded.toLocaleString("en-US") : rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `$${text}/mo`;
}
function formatMoney(n) {
  if (!n || n <= 0) return "—";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
function formatMoneyShort(n) {
  if (!n || n <= 0) return "—";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
function priceStats(list) {
  const prices = list.map((l) => l.price).filter((p) => p > 0);
  if (!prices.length) return { count: list.length, min: 0, max: 0, avg: 0 };
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  return { count: list.length, min, max, avg };
}
function bedroomLabel(l) {
  if (l.bedrooms <= 0) return "Studio";
  if (l.bedrooms === 1) return l.den ? "1 Bed + Den" : "1 Bedroom";
  return `${l.bedrooms} Bedrooms`;
}
const BUCKET_ORDER = ["Studio", "1 Bedroom", "1 Bed + Den", "2 Bedrooms", "3 Bedrooms", "4 Bedrooms"];
function groupByBedrooms(list) {
  const map = /* @__PURE__ */ new Map();
  list.forEach((l) => {
    const key = bedroomLabel(l);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(l);
  });
  const rows = [];
  map.forEach((items, label) => {
    const stats = priceStats(items);
    const sizes = items.map((i) => i.sqft).filter(Boolean);
    rows.push({
      label,
      count: items.length,
      avg: stats.avg,
      min: stats.min,
      max: stats.max,
      sizeSample: sizes[0] || ""
    });
  });
  rows.sort((a, b) => {
    const ia = BUCKET_ORDER.indexOf(a.label);
    const ib = BUCKET_ORDER.indexOf(b.label);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return rows;
}
export {
  formatMoney as a,
  formatMaint as b,
  formatMoneyShort as f,
  groupByBedrooms as g,
  normalizeListing as n,
  priceStats as p
};
