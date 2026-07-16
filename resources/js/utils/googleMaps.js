/**
 * On-demand Google Maps JS API loader.
 *
 * The API script used to be a global <script> in app.blade.php, which made
 * every landing page download ~250KB of maps code it often never ran
 * (PageSpeed "Reduce unused JavaScript"). Instead, every component that
 * needs maps/places/drawing awaits loadGoogleMaps() and the script is
 * injected once, on first use, with the superset of libraries any of them
 * needs — so load order between components can't strand a page on a script
 * tag that's missing a library.
 *
 * Resolves with window.google.maps; rejects when no API key is configured
 * or the script fails/times out.
 */
let loaderPromise = null;

const LIBRARIES = 'places,drawing,geometry,marker';
const LOAD_TIMEOUT_MS = 15000;

export default function loadGoogleMaps() {
    if (window.google?.maps?.Map) {
        return Promise.resolve(window.google.maps);
    }
    if (loaderPromise) {
        return loaderPromise;
    }

    loaderPromise = new Promise((resolve, reject) => {
        const apiKey = window.googleMapsApiKey;
        if (!apiKey) {
            loaderPromise = null;
            reject(new Error('Google Maps API key is not configured'));
            return;
        }

        const fail = (message) => {
            loaderPromise = null;
            reject(new Error(message));
        };

        // Another script tag may already be in flight (e.g. injected by a
        // component that hasn't been migrated to this loader) — wait for it
        // instead of double-loading the API.
        const waitForReady = () => {
            const started = Date.now();
            const timer = setInterval(() => {
                if (window.google?.maps?.Map) {
                    clearInterval(timer);
                    resolve(window.google.maps);
                } else if (Date.now() - started > LOAD_TIMEOUT_MS) {
                    clearInterval(timer);
                    fail('Google Maps failed to load');
                }
            }, 100);
        };

        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
            waitForReady();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${LIBRARIES}&loading=async&callback=__onGoogleMapsReady`;
        script.async = true;
        window.__onGoogleMapsReady = () => {
            delete window.__onGoogleMapsReady;
            resolve(window.google.maps);
        };
        script.onerror = () => fail('Failed to load the Google Maps script');
        document.head.appendChild(script);
    });

    return loaderPromise;
}
