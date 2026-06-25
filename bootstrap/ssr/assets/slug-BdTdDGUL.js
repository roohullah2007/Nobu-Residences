const createSlug = (text) => {
  if (!text) return "";
  return text.toString().toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
};
const createBuildingUrl = (nameOrSlug, id, options = {}) => {
  if (options.slug) {
    return `/building/${options.slug}`;
  }
  if (options && typeof options === "object" && options.address && options.city) {
    const citySlug = createSlug(options.city);
    const streetSlug = createSlug(options.address);
    const nameSlug = createSlug(nameOrSlug || "building");
    return `/${citySlug}/${streetSlug}/${nameSlug}`;
  }
  if (options.city && options.street) {
    const citySlug = createSlug(options.city);
    const streetSlug = createSlug(options.street);
    const nameSlug = createSlug(nameOrSlug || "building");
    return `/${citySlug}/${streetSlug}/${nameSlug}`;
  }
  const slug = createSlug(nameOrSlug || "building");
  return `/building/${slug}`;
};
const createSEOBuildingUrl = (building) => {
  if (!building) return "/building/unknown";
  const {
    name,
    slug,
    address,
    street_address_1,
    street_address_2,
    city,
    id
  } = building;
  const addressOnly = (s) => {
    if (typeof s !== "string") return "";
    return s.split(/\s*[,&]\s*/).map((p) => p.trim()).filter((p) => /^\d/.test(p)).join(" ");
  };
  const parts = [];
  if (name) parts.push(createSlug(name));
  if (address) {
    const addressSlug = createSlug(addressOnly(address) || address);
    if (addressSlug) parts.push(addressSlug);
  } else {
    if (street_address_1) parts.push(createSlug(addressOnly(street_address_1) || street_address_1));
    if (street_address_2) parts.push(createSlug(addressOnly(street_address_2) || street_address_2));
  }
  if (city && parts.length > 0) {
    return `/${createSlug(city)}/${parts.filter(Boolean).join("-")}`;
  }
  if (slug) {
    return `/building/${slug}`;
  }
  return createBuildingUrl(name, id, { slug });
};
export {
  createSEOBuildingUrl as a,
  createBuildingUrl as c
};
