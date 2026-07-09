function normalizeImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  const storageIndex = url.indexOf("/storage/");
  return storageIndex > 0 ? url.slice(storageIndex) : url;
}
export {
  normalizeImageUrl as n
};
