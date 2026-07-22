/**
 * The listing page H1 text (client SEO spec):
 *   "{unit} - {street number} {street name} {suffix} {direction}, {city}"
 *   e.g. "2015 - 470 Front St W, Toronto"
 * Shared by PropertyHeader (the H1 itself) and the section headings that
 * embed the H1 ("Overview of %h1%", "%h1% Details") so they never drift.
 */
export const getListingH1 = (property) => {
  if (!property) return '';

  const unitNumber = property.unitNumber || property.UnitNumber || '';
  const streetNumber = property.streetNumber || property.StreetNumber || '';
  const streetName = property.streetName || property.StreetName || '';
  const streetSuffix = property.streetSuffix || property.StreetSuffix || '';
  const streetDirection = property.streetDirection || property.StreetDirection || '';
  const city = property.city || property.City || '';

  if (streetNumber && streetName) {
    const streetPart = [streetNumber, streetName, streetSuffix, streetDirection]
      .filter(Boolean).join(' ');
    let title = unitNumber ? `${unitNumber} - ${streetPart}` : streetPart;
    if (city) {
      title = `${title}, ${city}`;
    }
    return title;
  }

  return property.address || '';
};
