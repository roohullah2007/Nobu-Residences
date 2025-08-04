import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import PropertyUtils from '../utils/propertyUtils';
import translationManager from '../utils/translations';

const PropertiesComponent = ({ 
    properties = { data: [], current_page: 1, last_page: 1 }, 
    filters = [], 
    propertyTypes = {} 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [currentPage, setCurrentPage] = useState(properties.current_page || 1);
    const [locale, setLocale] = useState(translationManager.getLocale());

    console.log('🏠 Agent Properties Component Loaded');
    console.log('📊 Properties received:', properties);
    console.log('🔍 Filters received:', filters);
    console.log('📋 Property types received:', propertyTypes);

    // Listen for locale changes
    useEffect(() => {
        const handleLocaleChange = (event) => {
            setLocale(event.detail.locale);
        };

        window.addEventListener('localeChanged', handleLocaleChange);
        return () => window.removeEventListener('localeChanged', handleLocaleChange);
    }, []);

    // Translation helper
    const t = useCallback((key, defaultValue = null) => {
        return translationManager.translate(key, defaultValue);
    }, [locale]);

    // Debounced search function
    const debouncedSearch = useCallback(
        PropertyUtils.debounce((term) => {
            handleSearch({ search: term, type: selectedType, page: 1 });
        }, 500),
        [selectedType]
    );

    // Handle search input
    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Handle type filter
    const handleTypeChange = (type) => {
        setSelectedType(type);
        handleSearch({ search: searchTerm, type, page: 1 });
    };

    // Handle search with error handling
    const handleSearch = (params) => {
        try {
            const queryString = PropertyUtils.buildQueryString(params);
            const url = window.location.pathname + (queryString ? `?${queryString}` : '');
            
            router.visit(url, {
                preserveScroll: true,
                preserveState: true,
                onError: (errors) => {
                    console.error('Search error:', errors);
                }
            });
        } catch (error) {
            console.error('Search handling error:', error);
        }
    };

    // Handle pagination
    const handlePageChange = (page) => {
        if (page < 1 || page > properties.last_page) return;
        
        setCurrentPage(page);
        PropertyUtils.handlePagination(page, router, window.location.href, {
            search: searchTerm,
            type: selectedType
        });
    };

    // Navigate to property with error handling
    const viewProperty = (propertyId) => {
        PropertyUtils.navigateToProperty(propertyId, router, {
            onError: (errors) => {
                console.error('Navigation error:', errors);
                alert('Error navigating to property. Please try again.');
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {t('Properties', 'Properties')}
                </h1>
                
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Search Input */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder={t('Search...', 'Search...')}
                            value={searchTerm}
                            onChange={handleSearchInput}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    
                    {/* Type Filter */}
                    <div className="md:w-48">
                        <select
                            value={selectedType}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">{t('All Types', 'All Types')}</option>
                            {Object.entries(propertyTypes).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {t(value, value)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Properties Grid */}
            {properties.data && properties.data.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {properties.data.map((property) => {
                            // Validate property data
                            if (!PropertyUtils.validatePropertyData(property)) {
                                return null;
                            }

                            return (
                                <div
                                    key={PropertyUtils.safeToString(property.id)}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                                    onClick={() => viewProperty(property.id)}
                                >
                                    {/* Property Image */}
                                    <div className="h-48 bg-gray-200 relative">
                                        {property.images && property.images.length > 0 ? (
                                            <img
                                                src={property.images[0]}
                                                alt={property.title || t('Property Image', 'Property Image')}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                        
                                        {/* Price Badge */}
                                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            {PropertyUtils.formatPrice(property.price)}
                                        </div>
                                    </div>

                                    {/* Property Details */}
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                                            {property.title || t('Untitled Property', 'Untitled Property')}
                                        </h3>
                                        
                                        {/* Address - Masked if needed */}
                                        <div className="flex items-center text-gray-600 mb-2">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm truncate">
                                                {PropertyUtils.maskAddress(property.address, property.hasContactAccess)}
                                            </span>
                                            {!property.hasContactAccess && (
                                                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                                    {t('Address Hidden', 'Address Hidden')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Property Info */}
                                        <div className="flex justify-between text-sm text-gray-600 mb-3">
                                            <span>{PropertyUtils.getPropertyTypeTranslation(property.type, propertyTypes)}</span>
                                            <span>{property.bedrooms ? `${property.bedrooms} ${t('beds', 'beds')}` : ''}</span>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                viewProperty(property.id);
                                            }}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            {t('View Details', 'View Details')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {properties.last_page > 1 && (
                        <div className="flex justify-center items-center space-x-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('Previous', 'Previous')}
                            </button>

                            {/* Page Numbers */}
                            {Array.from({ length: Math.min(5, properties.last_page) }, (_, i) => {
                                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                                if (pageNum > properties.last_page) return null;
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                                            currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= properties.last_page}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('Next', 'Next')}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                /* No Properties Found */
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {t('No properties found', 'No properties found')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {t('Try adjusting your search filters', 'Try adjusting your search filters')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PropertiesComponent;
