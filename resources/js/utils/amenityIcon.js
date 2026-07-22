/**
 * Amenity name → icon path resolution, shared by every amenities renderer
 * (property page Amenities, BuildingAmenities, homepage AmenitiesSection).
 *
 * Client requirement: every amenity chip must show a RELATED icon — the
 * generic star only ever appears when nothing at all matches. DB icon URLs
 * win, then the legacy exact-name map, then a keyword matcher that covers
 * real-world MLS/condo amenity names ("Fitness Centre", "7th Floor Pool",
 * "24-Hour Concierge", "Party Room with Full Kitchen", ...).
 */

const DEFAULT_ICON = '/assets/svgs/amenity-default.svg';

// Legacy exact-name map (kept for backwards compatibility with seeded data).
const EXACT_ICONS = {
  'Concierge': '/assets/svgs/concierge.svg',
  'Party Room': '/assets/svgs/party-horn.svg',
  'Meeting Room': '/assets/svgs/meeting-consider-deliberate-about-meet.svg',
  'Security Guard': '/assets/svgs/police-security-policeman.svg',
  'Gym': '/assets/svgs/gym.svg',
  'Fitness Center': '/assets/svgs/gym.svg',
  'Visitor Parking': '/assets/svgs/parking.svg',
  'Parking Garage': '/assets/svgs/parking-garage-transportation-car-parking.svg',
  'Guest Suites': '/assets/svgs/bed.svg',
  'Pet Restriction': '/assets/svgs/pets.svg',
  'BBQ Permitted': '/assets/svgs/bbq-permitted.svg',
  'Outdoor Pool': '/assets/svgs/pool-ladder.svg',
  'Pool': '/assets/svgs/pool-ladder.svg',
  'Media Room': '/assets/svgs/media-room.svg',
  'Rooftop Deck': '/assets/svgs/deck-chair-under-the-sun.svg',
  'Security System': '/assets/svgs/security.svg',
  'Hot Tub': '/assets/svgs/shower.svg',
  'Playground': '/assets/svgs/party-horn.svg',
  'Tennis Court': '/assets/svgs/gym.svg',
  'Basketball Court': '/assets/svgs/gym.svg',
  'Library': '/assets/svgs/meeting-consider-deliberate-about-meet.svg',
  'Storage': '/assets/svgs/parking-garage-transportation-car-parking.svg',
  'Lounge': '/assets/svgs/media-room.svg',
};

// Ordered keyword → icon rules; the FIRST match wins, so more specific
// concepts (guest suite, visitor parking, fire pit) come before broad ones.
const KEYWORD_ICONS = [
  [/concierge|front desk/, '/assets/svgs/concierge.svg'],
  [/guest suite|guest room/, '/assets/svgs/bed.svg'],
  [/fitness|gym|exercise|yoga|pilates|cardio|weight|tennis|basketball|squash|golf|sport/, '/assets/svgs/gym.svg'],
  [/pool|swim|whirlpool|jacuzzi|plunge/, '/assets/svgs/pool-ladder.svg'],
  [/sauna|steam|hot tub|spa|shower|change room|locker room|wellness/, '/assets/svgs/shower.svg'],
  [/bbq|barbecue|grill|fire ?pit|firepit/, '/assets/svgs/bbq-grill.svg'],
  [/party|kitchen|dining|playground|games|game room|kids|entertainment/, '/assets/svgs/party-horn.svg'],
  [/terrace|rooftop|roof deck|deck|cabana|lounger|garden|courtyard|patio|outdoor|landscap|gazebo|sun/, '/assets/svgs/deck-chair-under-the-sun.svg'],
  [/lounge|club|media|theatre|theater|cinema|screening|billiard|bar\b/, '/assets/svgs/media-room.svg'],
  [/meeting|board room|boardroom|library|study|business|office|co.?work|conference/, '/assets/svgs/meeting-consider-deliberate-about-meet.svg'],
  [/visitor parking/, '/assets/svgs/parking.svg'],
  [/parking|garage|bike|bicycle|storage|locker/, '/assets/svgs/parking-garage-transportation-car-parking.svg'],
  [/security|guard|surveillance|camera|enter ?phone|gatehouse/, '/assets/svgs/security.svg'],
  [/pet|dog|paw/, '/assets/svgs/pets.svg'],
  [/suite|bed/, '/assets/svgs/bed.svg'],
  [/water/, '/assets/svgs/water.svg'],
];

/**
 * @param {string} name   amenity display name
 * @param {string|null} dbIcon  icon value stored on the amenity record
 * @returns {string} a usable icon path (never empty)
 */
export const resolveAmenityIconPath = (name, dbIcon = null) => {
  // A real stored icon URL wins.
  if (dbIcon && (dbIcon.startsWith('/assets') || dbIcon.startsWith('http'))) {
    return dbIcon;
  }

  const label = String(name || '').trim();
  if (EXACT_ICONS[label]) {
    return EXACT_ICONS[label];
  }

  const lower = label.toLowerCase();
  for (const [pattern, icon] of KEYWORD_ICONS) {
    if (pattern.test(lower)) {
      return icon;
    }
  }

  return DEFAULT_ICON;
};

export default resolveAmenityIconPath;
