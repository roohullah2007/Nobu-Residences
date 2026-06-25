import { a as createSEOBuildingUrl } from "./slug-BdTdDGUL.js";
const generatePropertyUrl = (property, building = null) => {
  if (!property) return "/";
  if (!building && property.building && (property.building.name || property.building.slug)) {
    building = property.building;
  }
  if (building) {
    const listingKey2 = property.ListingKey || property.listingKey || property.mls_id || property.mlsNumber || "";
    const unitNumber2 = property.UnitNumber || property.unitNumber || "";
    const listingSlug2 = unitNumber2 ? `unit-${unitNumber2}-${listingKey2}` : listingKey2;
    const buildingUrl = createSEOBuildingUrl(building);
    if (buildingUrl && !buildingUrl.startsWith("/building/unknown")) {
      return `${buildingUrl}/${listingSlug2}`;
    }
  }
  const listingKey = property.ListingKey || property.listingKey || property.mls_id || property.mlsNumber || "";
  const city = property.City || property.city || "toronto";
  const unitNumber = property.UnitNumber || property.unitNumber || "";
  const streetNumber = property.StreetNumber || property.streetNumber || "";
  const streetName = property.StreetName || property.streetName || "";
  const streetSuffix = property.StreetSuffix || property.streetSuffix || "";
  let citySlug = city.toLowerCase();
  citySlug = citySlug.replace(/\s*[cewns]\d{2}\b/gi, "");
  citySlug = citySlug.trim().replace(/\s+/g, "-");
  let addressParts = [];
  if (streetNumber) addressParts.push(streetNumber);
  if (streetName) addressParts.push(streetName.toLowerCase());
  if (streetSuffix) addressParts.push(streetSuffix.toLowerCase());
  if (citySlug) addressParts.push(citySlug);
  let addressSlug = addressParts.join("-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  if (!addressSlug) {
    const fullAddress = property.UnparsedAddress || property.address || "";
    addressSlug = createAddressSlug(fullAddress);
  }
  let listingSlug = unitNumber ? `unit-${unitNumber}-${listingKey}` : listingKey;
  return `/${citySlug}/${addressSlug}/${listingSlug}`;
};
const createAddressSlug = (address) => {
  if (!address) return "property";
  let slug = address.toLowerCase();
  slug = slug.replace(/[,\s]*#\s*\d+.*/i, "");
  slug = slug.replace(/,?\s*(unit|suite|apt|apartment)\s*\d+.*/i, "");
  const commaIndex = slug.indexOf(",");
  if (commaIndex > 0) {
    slug = slug.substring(0, commaIndex);
  }
  slug = slug.trim();
  slug = slug.replace(/[^a-z0-9\s-]/g, "");
  slug = slug.replace(/\s+/g, "-");
  slug = slug.replace(/-+/g, "-");
  return slug.replace(/^-+|-+$/g, "") || "property";
};
export {
  generatePropertyUrl as g
};
