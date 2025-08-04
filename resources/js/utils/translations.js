// Translation system for the application
class TranslationManager {
    constructor() {
        this.currentLocale = localStorage.getItem('locale') || 'en';
        this.translations = {
            en: {
                'Search...': 'Search...',
                'Properties': 'Properties',
                'House': 'House',
                'Apartment': 'Apartment',
                'Land': 'Land',
                'Commercial': 'Commercial',
                'Others': 'Others',
                'MAISON': 'House',
                'APPARTEMENT': 'Apartment',
                'TERRAIN': 'Land',
                'COMMERCIAL': 'Commercial',
                'AUTRES': 'Others',
                'Price': 'Price',
                'Bedrooms': 'Bedrooms',
                'Bathrooms': 'Bathrooms',
                'Area': 'Area',
                'Type': 'Type',
                'Status': 'Status',
                'For Sale': 'For Sale',
                'For Rent': 'For Rent',
                'Sold': 'Sold',
                'Address Hidden': 'Address Hidden',
                'Contact Required': 'Contact Required',
                'Purchase Contact': 'Purchase Contact',
                'Loading...': 'Loading...',
                'No properties found': 'No properties found',
                'View Details': 'View Details'
            },
            fr: {
                'Search...': 'Rechercher...',
                'Properties': 'Propriétés',
                'House': 'Maison',
                'Apartment': 'Appartement',
                'Land': 'Terrain',
                'Commercial': 'Commercial',
                'Others': 'Autres',
                'MAISON': 'Maison',
                'APPARTEMENT': 'Appartement',
                'TERRAIN': 'Terrain',
                'COMMERCIAL': 'Commercial',
                'AUTRES': 'Autres',
                'Price': 'Prix',
                'Bedrooms': 'Chambres',
                'Bathrooms': 'Salles de bain',
                'Area': 'Surface',
                'Type': 'Type',
                'Status': 'Statut',
                'For Sale': 'À vendre',
                'For Rent': 'À louer',
                'Sold': 'Vendu',
                'Address Hidden': 'Adresse masquée',
                'Contact Required': 'Contact requis',
                'Purchase Contact': 'Acheter le contact',
                'Loading...': 'Chargement...',
                'No properties found': 'Aucune propriété trouvée',
                'View Details': 'Voir les détails'
            }
        };
    }

    // Get current locale
    getLocale() {
        return this.currentLocale;
    }

    // Set locale and save to localStorage
    setLocale(locale) {
        if (this.translations[locale]) {
            this.currentLocale = locale;
            localStorage.setItem('locale', locale);
            
            // Trigger a custom event to notify components
            window.dispatchEvent(new CustomEvent('localeChanged', { 
                detail: { locale: locale } 
            }));
            
            return true;
        }
        return false;
    }

    // Translate a key
    translate(key, defaultValue = null) {
        const translation = this.translations[this.currentLocale]?.[key];
        
        if (translation) {
            return translation;
        }
        
        // Fallback to English if not found in current locale
        const englishTranslation = this.translations.en?.[key];
        if (englishTranslation) {
            return englishTranslation;
        }
        
        // Return default value or the key itself
        return defaultValue || key;
    }

    // Get all available locales
    getAvailableLocales() {
        return Object.keys(this.translations);
    }

    // Get all translations for current locale
    getAllTranslations() {
        return this.translations[this.currentLocale] || this.translations.en;
    }
}

// Create global instance
window.translationManager = new TranslationManager();

// Global translate function for easy access
window.translate = (key, defaultValue = null) => {
    return window.translationManager.translate(key, defaultValue);
};

// Export for ES6 modules
export default window.translationManager;
export { TranslationManager };
