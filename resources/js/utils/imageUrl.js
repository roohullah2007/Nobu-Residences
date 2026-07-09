/**
 * Normalize an uploaded-image URL for the current host.
 *
 * Older records were saved with Storage::url(), which bakes the
 * uploading environment's APP_URL into the value (e.g.
 * "http://127.0.0.1:8000/storage/agents/x.png"). Serving that on any
 * other host breaks the image. Strip the foreign origin and keep the
 * host-relative /storage/... path; leave every other URL untouched.
 */
export function normalizeImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const storageIndex = url.indexOf('/storage/');
    return storageIndex > 0 ? url.slice(storageIndex) : url;
}

export default normalizeImageUrl;
