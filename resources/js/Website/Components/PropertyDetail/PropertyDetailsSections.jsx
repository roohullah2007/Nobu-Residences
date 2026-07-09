import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import MortgageCalculator from './MortgageCalculator';
import NearbySchools from './NearbySchools';
import Amenities from './Amenities';

/**
 * PropertyDetailsSections
 *
 * Tabbed property-detail body (Overview / Floors & Rooms / Amenities /
 * Mortgage Calculator / Nearby schools) — the SAME tab navigation as before,
 * but the content of each tab is rendered with the updated white "card" design.
 *
 * Everything is data-driven from the Repliers listing (passed through by the
 * controller as `property.repliers`) plus the matched building. Each section /
 * row only renders when the underlying field actually has a value, so a sparse
 * listing simply shows fewer rows instead of "N/A" noise.
 */

const NAVY = 'rgb(2, 46, 80)';
const LABEL = 'rgb(75, 85, 99)';
const VALUE = 'rgb(55, 65, 81)';

// First non-empty value. Arrays are joined with ", ". Treats '', null, '0' and
// undefined as empty (zero counts carry no useful info on a listing page).
const pick = (...cands) => {
  for (const c of cands) {
    if (c === undefined || c === null) continue;
    if (Array.isArray(c)) {
      const joined = c
        .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
        .join(', ');
      if (joined) return joined;
      continue;
    }
    const s = String(c).trim();
    if (s === '' || s === '0') continue;
    return c;
  }
  return '';
};

// First positive integer (for counts like beds / kitchens / stories).
const num = (...cands) => {
  for (const c of cands) {
    const n = parseInt(c, 10);
    if (!isNaN(n) && n > 0) return n;
  }
  return '';
};

const money = (v) => {
  const n = Number(String(v ?? '').replace(/[^0-9.]/g, ''));
  if (!n) return '';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(n);
};

const Card = ({ id, title, subtitle, children }) => (
  <div
    id={id}
    className="scroll-mt-32 rounded-2xl bg-white p-5 sm:p-6 border border-gray-200"
  >
    <h3 style={{ fontSize: '20px', fontWeight: 700, color: NAVY }}>{title}</h3>
    {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    {children}
  </div>
);

// A titled bullet list of label/value rows. Renders nothing when every row is
// empty, so callers can drop it into a grid without guarding each one.
const Group = ({ title, rows }) => {
  const filled = (rows || []).filter(
    ([, v]) => v !== '' && v !== null && v !== undefined
  );
  if (!filled.length) return null;
  return (
    <div className="min-w-0">
      <h4 style={{ fontSize: '15px', fontWeight: 700, color: NAVY }}>{title}</h4>
      <ul className="mt-2 list-disc pl-5 space-y-1.5">
        {filled.map(([label, v]) => (
          <li key={label} style={{ fontSize: '14px', color: LABEL, lineHeight: '22px' }}>
            {label}: <span style={{ fontWeight: 600, color: VALUE }}>{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Meter / Feet pill toggle used at the top (mobile) and bottom of the rooms
// table. Controlled — both instances share the same `useFeet` state so the
// table updates wherever the user flips it.
const UnitToggle = ({ useFeet, setUseFeet, id }) => (
  <div className="relative inline-block align-middle">
    <input
      type="checkbox"
      id={id}
      className="sr-only"
      checked={useFeet}
      onChange={(e) => setUseFeet(e.target.checked)}
    />
    <label htmlFor={id} className="flex items-center cursor-pointer">
      <div className="w-28 h-8 bg-gray-200 rounded-full relative flex items-center">
        <div
          className="absolute w-14 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out top-1 left-1"
          style={{ transform: useFeet ? 'translateX(56px)' : 'translateX(0)' }}
        />
        <div className="flex w-full relative z-10">
          <span
            className={`text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${
              useFeet ? 'text-gray-400' : 'text-gray-700'
            }`}
          >
            Meter
          </span>
          <span
            className={`text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${
              useFeet ? 'text-gray-700' : 'text-gray-400'
            }`}
          >
            Feet
          </span>
        </div>
      </div>
    </label>
  </div>
);

// Days on market from the listing's contract/entry date (ported from the
// previous PropertyStatusTabs so the status badge looks the same as before).
const calculateDaysOnMarket = (property) => {
  const listingDate =
    property?.ListingContractDate ||
    property?.listingContractDate ||
    property?.listDate ||
    property?.listingDate ||
    null;
  if (listingDate) {
    const parsed = new Date(
      typeof listingDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(listingDate)
        ? `${listingDate}T00:00:00`
        : listingDate
    );
    if (!isNaN(parsed.getTime())) {
      const today = new Date();
      parsed.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return Math.max(0, Math.floor((today - parsed) / 86400000));
    }
  }
  const existing = property?.DaysOnMarket ?? property?.daysOnMarket;
  if (existing !== undefined && existing !== null && existing !== '') {
    return parseInt(existing, 10) || 0;
  }
  return 0;
};

const PropertyDetailsSections = ({ property = {}, buildingData = null, aiDescription = null }) => {
  const { globalWebsite, website } = usePage().props;
  const brandColors = globalWebsite?.brand_colors || website?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || '#293056';
  const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';

  const [activeTab, setActiveTab] = useState('overview');
  const [expanded, setExpanded] = useState(false);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const [useFeet, setUseFeet] = useState(false);

  const r = property?.repliers || {};
  const details = r.details || {};
  const condo = r.condominium || {};
  const lot = r.lot || {};
  const addr = r.address || {};
  const taxesRaw = r.taxes;
  const taxes = Array.isArray(taxesRaw) ? (taxesRaw[0] || {}) : (taxesRaw || {});

  // ---- Overview / description ---------------------------------------------
  // Prefer the AI-reprocessed overview (property_ai_descriptions, generated
  // from the IDX remarks); the raw MLS remarks stay accessible under
  // "Original listing remarks" in the expanded state for MLS compliance.
  const originalDescription = pick(
    property.publicRemarks,
    property.PublicRemarks,
    property.description,
    details.description
  );
  const aiOverview =
    typeof aiDescription?.overview === 'string' ? aiDescription.overview.trim() : '';
  const aiDetailed =
    typeof aiDescription?.detailed === 'string' ? aiDescription.detailed.trim() : '';
  const description = aiOverview || originalDescription;
  const DESC_LIMIT = 320;
  const isLong = typeof description === 'string' && description.length > DESC_LIMIT;
  const hasExpandedExtras = !!aiOverview && !!(aiDetailed || originalDescription);
  const shownDescription = !isLong || expanded
    ? description
    : `${description.slice(0, DESC_LIMIT).trim()}...`;

  const mlsNumber = pick(property.mlsNumber, property.listingKey, property.ListingKey);
  const office = pick(property.listOfficeName, property.ListOfficeName, property.listingOffice);
  const mlsLine = mlsNumber ? `MLS®: ${mlsNumber}${office ? `; ${office}` : ''}` : '';

  // ---- Property Details groups ------------------------------------------
  const livingArea = pick(property.LivingAreaRange, property.livingArea, details.sqft);
  const kitchens = num(details.numKitchens) ? (details.numKitchens || 0) + (details.numKitchensPlus || 0) : '';

  const interior = [
    ['Living Area', livingArea ? `${livingArea} ft²` : ''],
    ['Kitchens', kitchens || ''],
    ['Flooring', pick(details.flooring, details.floorType)],
  ];

  // Bathroom full/half split from the Repliers per-washroom breakdown
  // (each entry: { level, count, pieces }). 2-piece = half (powder room),
  // 3+ pieces = full. numBathrooms is the TOTAL, so Full + Half = Total —
  // the old code showed numBathrooms (the total) as "Full", which was wrong.
  let bathBreakdown = details.bathrooms;
  if (bathBreakdown && !Array.isArray(bathBreakdown)) bathBreakdown = Object.values(bathBreakdown);
  let fullBaths = 0;
  let halfBaths = 0;
  (Array.isArray(bathBreakdown) ? bathBreakdown : []).forEach((b) => {
    const cnt = parseInt(b?.count, 10) || 1;
    const pcs = parseInt(b?.pieces, 10) || 0;
    if (pcs >= 3) fullBaths += cnt;
    else if (pcs > 0) halfBaths += cnt; // 1- or 2-piece = half / powder room
  });
  const totalBaths = num(property.bathroomsTotal, property.BathroomsTotalInteger, details.numBathrooms);

  const bedsBaths = [
    ['Bedrooms', num(property.bedroomsTotal, property.BedroomsTotal, details.numBedrooms)],
    ['Bathrooms', totalBaths],
    ['Full bathrooms', fullBaths || ''],
    ['Half bathrooms', halfBaths || ''],
  ];

  const parking = [
    ['Parking Spaces', num(property.parkingTotal, property.ParkingTotal, details.numParkingSpaces)],
    ['Parking Type', pick(details.garage, property.garage)],
  ];

  // Heating, Cooling and Basement live under Construction (no separate
  // "Heating & cooling" group). Basement joins all parts → "Crawl Space, Full,
  // Finished" rather than only the first value.
  const construction = [
    ['Year Built', pick(property.yearBuilt, details.yearBuilt)],
    ['Style', pick(details.style, property.propertySubType, property.PropertySubType)],
    ['Stories', num(condo.stories, details.numStories)],
    ['Heating', pick(details.heating, property.heating)],
    ['Cooling', pick(details.airConditioning, property.cooling)],
    ['Basement', pick(details.basement, [details.basement1, details.basement2, details.basement3])],
    ['Roof', pick(details.roofMaterial, details.roof)],
    ['Foundation', pick(details.foundationType, details.foundationDetails, details.foundation)],
    ['Exterior', pick([details.exteriorConstruction1, details.exteriorConstruction2], details.construction)],
  ];

  const lotLand = [
    ['Zoning', pick(details.zoning, lot.zoning, property.zoning)],
    ['Water Source', pick(details.waterSource, details.water)],
    ['Sewer', pick(details.sewer, details.sewers)],
  ];

  const maintFee = pick(property.associationFee, property.AssociationFee, condo?.fees?.maintenance, details.maintenanceFee);
  // Parking/locker maintenance: Repliers key names vary by board, so try the
  // known candidates, then fall back to the building's admin-entered amounts.
  const parkingMaintFee = pick(
    condo?.fees?.parking,
    condo?.parkingCost,
    details.parkingCost,
    buildingData?.parking_maintenance_fee
  );
  const lockerMaintFee = pick(
    condo?.fees?.locker,
    condo?.lockerCost,
    details.lockerCost,
    buildingData?.locker_maintenance_fee
  );
  const annualTaxVal = Number(String(taxes.annualAmount || property.taxAnnualAmount || '').replace(/[^0-9.]/g, '')) || 0;
  const fees = [
    ['Strata / Maintenance Fee', maintFee ? `${money(maintFee)}/mo` : ''],
    ['Parking Maintenance', money(parkingMaintFee) ? `${money(parkingMaintFee)}/mo` : ''],
    ['Locker Maintenance', money(lockerMaintFee) ? `${money(lockerMaintFee)}/mo` : ''],
    ['Annual Taxes', annualTaxVal ? money(annualTaxVal) : ''],
    ['Property Taxes (Monthly)', annualTaxVal ? `${money(annualTaxVal / 12)}/mo` : ''],
  ];

  const listingDetails = [
    ['Property Type', pick(property.propertyType, property.PropertyType, details.propertyType)],
    ['MLS®#', mlsNumber],
    ['Status', pick(property.StandardStatus, property.standardStatus, property.status)],
  ];

  const detailGroups = [
    { title: 'Interior', rows: interior },
    { title: 'Bedrooms & bathrooms', rows: bedsBaths },
    { title: 'Parking', rows: parking },
    { title: 'Construction', rows: construction },
    { title: 'Lot & land', rows: lotLand },
    { title: 'Fees & assessments', rows: fees },
    { title: 'Listing details', rows: listingDetails },
  ];
  const hasAnyDetail = detailGroups.some((g) =>
    g.rows.some(([, v]) => v !== '' && v !== null && v !== undefined)
  );

  // ---- Rooms -------------------------------------------------------------
  const rooms = (property.Rooms || property.rooms || []).filter(
    (room) => room && (room.name || room.type || room.level || room.dimensions)
  );
  const roomDims = (room) => {
    if (room.dimensions) return room.dimensions;
    const l = parseFloat(room.length) || 0;
    const w = parseFloat(room.width) || 0;
    return l && w ? `${room.length} x ${room.width} m` : '';
  };
  // Dimensions in the unit selected by the toggle. The base data is in metres;
  // when "Feet" is active we parse the two numbers and convert (1 m = 3.28084 ft).
  const roomDimsUnit = (room) => {
    const raw = roomDims(room);
    if (!raw) return '';
    const m = String(raw).match(/([\d.]+)\s*x\s*([\d.]+)/i);
    if (!m) return raw;
    const l = parseFloat(m[1]);
    const w = parseFloat(m[2]);
    if (useFeet) {
      return `${(l * 3.28084).toFixed(2)} x ${(w * 3.28084).toFixed(2)} ft`;
    }
    return `${l} x ${w} m`;
  };

  // ---- Amenities & features ---------------------------------------------
  // Reverted to the original building-driven Amenities component (Building
  // Features & Services + Included in Maintenance Fees). Only show the tab when
  // the matched building actually has amenities.
  const hasBuildingAmenities =
    Array.isArray(buildingData?.amenities) && buildingData.amenities.length > 0;

  // ---- Status badge (same as the previous tabbed layout) ----------------
  const status = pick(property.StandardStatus, property.standardStatus, property.MlsStatus, property.mlsStatus, 'Active');
  const daysOnMarket = calculateDaysOnMarket(property);

  // ----- Card builders ----------------------------------------------------
  const overviewCard = description ? (
    <Card key="overview" id="overview" title="Overview">
      <div className="mt-3" style={{ fontSize: '15px', color: VALUE, lineHeight: '26px' }}>
        <p style={{ whiteSpace: 'pre-line' }}>{shownDescription}</p>
        {expanded && aiOverview && aiDetailed && (
          <p className="mt-3" style={{ whiteSpace: 'pre-line' }}>{aiDetailed}</p>
        )}
        {expanded && aiOverview && originalDescription && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: LABEL }}>
              Original listing remarks
            </h4>
            <p className="mt-2" style={{ whiteSpace: 'pre-line', fontSize: '14px', color: LABEL }}>
              {originalDescription}
            </p>
          </div>
        )}
        {(isLong || hasExpandedExtras) && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 underline"
            style={{ fontSize: '14px', fontWeight: 600, color: NAVY }}
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>
      {mlsLine && (
        <div className="mt-4 flex items-center gap-2.5 pt-4 border-t border-gray-100">
          <span style={{ fontSize: '14px', fontWeight: 600, color: NAVY }}>{mlsLine}</span>
        </div>
      )}
    </Card>
  ) : null;

  const propertyDetailsCard = hasAnyDetail ? (
    <Card key="details" id="property-details" title="Property Details" subtitle="Essentials & finishes">
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-7">
        {detailGroups.map((g) => (
          <Group key={g.title} title={g.title} rows={g.rows} />
        ))}
      </div>
    </Card>
  ) : null;

  const visibleRooms = showAllRooms ? rooms : rooms.slice(0, 3);
  const roomsCard = rooms.length > 0 ? (
    <div
      key="rooms"
      id="rooms"
      className="scroll-mt-32 p-4 rounded-xl border-gray-200 border bg-white"
    >
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'rgb(41, 48, 86)' }}>
          Room Dimensions
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Explore the dimensions of each room and the overall layout of the unit.
        </p>

        {/* Unit toggle — mobile only */}
        <div className="md:hidden mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Unit:</span>
            <UnitToggle useFeet={useFeet} setUseFeet={setUseFeet} id="unit-toggle-mobile" />
          </div>
        </div>

        {/* Column headers */}
        <div className="mb-2">
          <div className="grid grid-cols-12 text-sm gap-2 w-full">
            <div className="col-span-3 font-medium">Rooms</div>
            <div className="col-span-3 font-medium">Dimensions</div>
            <div className="col-span-2"></div>
            <div className="col-span-4 font-medium">Features</div>
          </div>
        </div>

        {/* Room rows */}
        <div id="rooms-container">
          {visibleRooms.map((room, i) => (
            <div key={`${room.name || room.type}-${i}`} className={`mb-1 ${i % 2 === 0 ? 'bg-blue-50' : 'bg-white'}`}>
              <div className="grid grid-cols-12 py-2 text-sm items-center px-3">
                <div className="col-span-3 text-[#263238]">{room.name || room.type || 'Room'}</div>
                <div className="col-span-3">{roomDimsUnit(room)}</div>
                <div className="col-span-2"></div>
                <div className="col-span-4 text-[#263238]">{pick(room.features)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: show all / show less + unit toggle */}
        <div className="mt-4 flex justify-between items-center">
          {rooms.length > 3 ? (
            <button
              type="button"
              onClick={() => setShowAllRooms((v) => !v)}
              className="text-blue-600 text-sm hover:underline focus:outline-none"
            >
              {showAllRooms ? 'Show less' : `Show all ${rooms.length} rooms`}
            </button>
          ) : (
            <span />
          )}
          <UnitToggle useFeet={useFeet} setUseFeet={setUseFeet} id="unit-toggle-bottom" />
        </div>
      </div>
    </div>
  ) : null;

  const amenitiesCard = hasBuildingAmenities ? (
    <div
      key="amenities"
      id="amenities"
      className="scroll-mt-32 p-4 rounded-xl border-gray-200 border shadow-sm bg-white"
    >
      <Amenities buildingData={buildingData} propertyData={property} />
    </div>
  ) : null;

  // ----- Tabs -------------------------------------------------------------
  // Only the sections that existed before, restyled as cards: Overview +
  // Property Details, Rooms, Amenities, Mortgage, Schools. (Building & Condo
  // Info, Extras & Inclusions, Community Information and Bathroom Details are
  // intentionally NOT shown — they weren't part of the page before.)
  const overviewContent = [overviewCard, propertyDetailsCard].filter(Boolean);
  const floorsContent = [roomsCard].filter(Boolean);

  const tabs = [];
  tabs.push({ id: 'overview', label: 'Overview' });
  if (floorsContent.length) tabs.push({ id: 'floors', label: 'Property rooms' });
  if (amenitiesCard) tabs.push({ id: 'amenities', label: 'Amenities' });
  tabs.push({ id: 'mortgage', label: 'Mortgage Calculator' });
  tabs.push({ id: 'schools', label: 'Nearby schools' });

  // If the active tab no longer exists (e.g. listing has no rooms), fall back.
  const activeExists = tabs.some((t) => t.id === activeTab);
  const currentTab = activeExists ? activeTab : 'overview';

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <div className="flex flex-col gap-4">{overviewContent}</div>;
      case 'floors':
        return <div className="flex flex-col gap-4">{floorsContent}</div>;
      case 'amenities':
        return <div className="flex flex-col gap-4">{amenitiesCard}</div>;
      case 'mortgage':
        // Card supplies the big heading; hide the component's inner one.
        return (
          <Card title="Mortgage Calculator">
            <div className="mt-3"><MortgageCalculator property={property} hideHeading /></div>
          </Card>
        );
      case 'schools':
        // Card supplies the big heading; hide the component's inner one.
        return (
          <Card title="Nearby Schools">
            <div className="mt-3"><NearbySchools propertyData={property} hideHeading /></div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto py-0">
      <div className="flex flex-col items-start gap-6 w-full relative z-10">
        {/* Status badges */}
        <div className="flex flex-row items-start gap-[22px] h-10">
          {status === 'Active' && (
            <div className="flex items-center px-2 gap-2 min-w-[138px] h-10 rounded-xl" style={{ backgroundColor: buttonPrimaryBg }}>
              <span className="font-work-sans font-bold text-sm leading-6 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: buttonPrimaryText }}>
                {daysOnMarket} Days on Market
              </span>
            </div>
          )}
        </div>

        {/* Tab navigation — same styling as the previous layout */}
        <div className="flex flex-col items-start gap-[18px] w-full">
          <div className="flex flex-row items-center gap-[8px] h-[50px] overflow-x-auto scrollbar-hide w-full md:flex-wrap">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex justify-center items-center p-2.5 cursor-pointer transition-all duration-300 border-b flex-shrink-0 ${
                  currentTab === tab.id ? 'border-[#252B37]' : 'border-transparent hover:border-[#3E4784]'
                } h-[50px]`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={`font-red-hat font-bold text-xl leading-[30px] tracking-tight whitespace-nowrap flex items-center ${
                  currentTab === tab.id ? 'text-[#252B37]' : 'text-[#252B37] hover:text-[#3E4784]'
                }`}>
                  {tab.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="w-full relative min-h-[200px] mt-5">
        <div className="w-full animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default PropertyDetailsSections;
