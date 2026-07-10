import { useEffect, useRef } from 'react';

const GOOGLE_READY_POLL_MS = 400;
const GOOGLE_READY_MAX_ATTEMPTS = 25;

/**
 * Extract the address parts we store on a building from a Google Place.
 * Google returns short_name "ON" for province, which matches the admin
 * form's province select values.
 */
const parseAddressComponents = (place) => {
    const components = place?.address_components || [];
    const find = (type, key = 'long_name') =>
        components.find((c) => c.types.includes(type))?.[key] || '';

    const streetNumber = find('street_number');
    const streetName = find('route');

    return {
        streetAddress: [streetNumber, streetName].filter(Boolean).join(' '),
        city: find('locality') || find('postal_town') || find('sublocality_level_1'),
        province: find('administrative_area_level_1', 'short_name'),
        postalCode: find('postal_code'),
        country: find('country'),
        latitude: place?.geometry?.location?.lat?.() ?? '',
        longitude: place?.geometry?.location?.lng?.() ?? '',
    };
};

/**
 * Attach Google Places Autocomplete to a text input (looked up by id —
 * the shared TextInput component does not forward its DOM node). The Maps
 * JS API with the `places` library is loaded globally in app.blade.php
 * (async), so this polls briefly until window.google is ready.
 *
 * @param {string} inputId The id attribute of the address <input>.
 * @param {(parsed: object, place: object) => void} onPlaceSelected Called
 *        with the parsed address parts whenever the user picks a suggestion.
 */
export default function useGooglePlacesAutocomplete(inputId, onPlaceSelected) {
    // Keep the latest callback without re-initializing the widget.
    const callbackRef = useRef(onPlaceSelected);
    callbackRef.current = onPlaceSelected;

    useEffect(() => {
        let attempts = 0;
        let pollTimer = null;
        let autocomplete = null;

        const init = () => {
            const input = document.getElementById(inputId);
            if (!window.google?.maps?.places?.Autocomplete || !input) {
                attempts += 1;
                if (attempts < GOOGLE_READY_MAX_ATTEMPTS) {
                    pollTimer = setTimeout(init, GOOGLE_READY_POLL_MS);
                }
                return;
            }

            autocomplete = new window.google.maps.places.Autocomplete(input, {
                types: ['address'],
                componentRestrictions: { country: 'ca' },
                fields: ['address_components', 'geometry'],
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place?.address_components) return;
                callbackRef.current?.(parseAddressComponents(place), place);
            });
        };

        init();

        return () => {
            if (pollTimer) clearTimeout(pollTimer);
            if (autocomplete && window.google?.maps?.event) {
                window.google.maps.event.clearInstanceListeners(autocomplete);
            }
        };
    }, [inputId]);
}
