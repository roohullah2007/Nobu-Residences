import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import ProtectedPropertyCard from '@/Website/Global/Components/PropertyCards/ProtectedPropertyCard';

// Filter icon components
const Search = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Filter = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
  </svg>
);

const Shield = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function PublicPropertyListing({ properties, filters = {} }) {
  const [searchFilters, setSearchFilters] = useState({
    city: filters.city || '',
    property_type: filters.property_type || '',
    transaction_type: filters.transaction_type || '',
    min_price: filters.min_price || '',
    max_price: filters.max_price || '',
    bedrooms: filters.bedrooms || '',
    bathrooms: filters.bathrooms || '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Remove empty filters
    const cleanFilters = Object.fromEntries(
      Object.entries(searchFilters).filter(([_, value]) => value !== '')
    );
    
    router.get('/agent/properties', cleanFilters);
  };

  const clearFilters = () => {
    setSearchFilters({
      city: '',
      property_type: '',
      transaction_type: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      bathrooms: '',
    });
    router.get('/agent/properties');
  };

  const propertyTypes = [
    { value: 'detached', label: 'Detached House' },
    { value: 'semi_detached', label: 'Semi-Detached' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'condo', label: 'Condo' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' },
  ];

  const transactionTypes = [
    { value: 'sale', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' },
    { value: 'lease', label: 'For Lease' },
  ];

  return (
    <MainLayout>
      <Head title="Protected Properties - Proprio-Link" />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#293056] to-[#93370D] text-white">
          <div className="max-w-[1280px] mx-auto px-5 py-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-12 h-12" />
              <h1 className="font-space-grotesk font-bold text-4xl md:text-5xl">
                Protected Properties
              </h1>
            </div>
            <p className="font-work-sans text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Browse properties with privacy protection. Exact addresses and agent contact information 
              are secured until you purchase access.
            </p>
            
            {/* Privacy Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Address Protection</h3>
                <p className="text-sm text-gray-200">Street numbers hidden, approximate location shown</p>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Agent Privacy</h3>
                <p className="text-sm text-gray-200">Contact details secured until purchase</p>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Secure Access</h3>
                <p className="text-sm text-gray-200">Pay-per-contact affordable pricing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-[1280px] mx-auto px-5 py-6">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Main Search Bar */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by city..."
                    value={searchFilters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
                
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#93370D] text-white rounded-lg hover:bg-[#7A2A09] transition-colors font-medium"
                >
                  Search
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <select
                      value={searchFilters.property_type}
                      onChange={(e) => handleFilterChange('property_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction</label>
                    <select
                      value={searchFilters.transaction_type}
                      onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
                    >
                      <option value="">All Transactions</option>
                      {transactionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                    <input
                      type="number"
                      placeholder="Min price"
                      value={searchFilters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                    <input
                      type="number"
                      placeholder="Max price"
                      value={searchFilters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Bedrooms</label>
                    <select
                      value={searchFilters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Bathrooms</label>
                    <select
                      value={searchFilters.bathrooms}
                      onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex gap-4">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-[#93370D] text-white rounded-md hover:bg-[#7A2A09] transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-[1280px] mx-auto px-5 py-8">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#293056] mb-2">
                {properties.total} Protected Properties Found
              </h2>
              <p className="text-gray-600">
                Showing {properties.from}-{properties.to} of {properties.total} results
              </p>
            </div>
            
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <Shield className="w-4 h-4 inline mr-2" />
              All properties are privacy-protected
            </div>
          </div>

          {/* Property Grid */}
          {properties.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {properties.data.map((property) => (
                <ProtectedPropertyCard
                  key={property.id}
                  property={property}
                  size="default"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-[#93370D] text-white rounded-lg hover:bg-[#7A2A09] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {properties.last_page > 1 && (
            <div className="flex justify-center items-center gap-2">
              {properties.links.map((link, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (link.url) {
                      const url = new URL(link.url);
                      const page = url.searchParams.get('page');
                      router.get('/agent/properties', { ...searchFilters, page });
                    }
                  }}
                  disabled={!link.url}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    link.active
                      ? 'bg-[#93370D] text-white'
                      : link.url
                      ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
