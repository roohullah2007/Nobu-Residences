import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import Navbar from '@/Website/Global/Navbar';
import { PropertyCardV1 } from '@/Website/Global/Components/PropertyCards';

// Icon components
const SearchIcon = ({ className }) => (
  <svg className={className} width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.6 18.5L10.3 12.2C9.8 12.6 9.225 12.9167 8.575 13.15C7.925 13.3833 7.23333 13.5 6.5 13.5C4.68333 13.5 3.14583 12.8708 1.8875 11.6125C0.629167 10.3542 0 8.81667 0 7C0 5.18333 0.629167 3.64583 1.8875 2.3875C3.14583 1.12917 4.68333 0.5 6.5 0.5C8.31667 0.5 9.85417 1.12917 11.1125 2.3875C12.3708 3.64583 13 5.18333 13 7C13 7.73333 12.8833 8.425 12.65 9.075C12.4167 9.725 12.1 10.3 11.7 10.8L18 17.1L16.6 18.5ZM6.5 11.5C7.75 11.5 8.8125 11.0625 9.6875 10.1875C10.5625 9.3125 11 8.25 11 7C11 5.75 10.5625 4.6875 9.6875 3.8125C8.8125 2.9375 7.75 2.5 6.5 2.5C5.25 2.5 4.1875 2.9375 3.3125 3.8125C2.4375 4.6875 2 5.75 2 7C2 8.25 2.4375 9.3125 3.3125 10.1875C4.1875 11.0625 5.25 11.5 6.5 11.5Z" fill="white"/>
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GridIcon = ({ className }) => (
  <svg className={className} width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1H13C12.7239 1 12.5 1.22386 12.5 1.5V3.5C12.5 3.77614 12.7239 4 13 4H16C16.2761 4 16.5 3.77614 16.5 3.5V1.5C16.5 1.22386 16.2761 1 16 1Z" fill="currentColor"/>
    <path d="M16 6H13C12.7239 6 12.5 6.22386 12.5 6.5V8.5C12.5 8.77614 12.7239 9 13 9H16C16.2761 9 16.5 8.77614 16.5 8.5V6.5C16.5 6.22386 16.2761 6 16 6Z" fill="currentColor"/>
    <path d="M16 11H13C12.7239 11 12.5 11.2239 12.5 11.5V13.5C12.5 13.7761 12.7239 14 13 14H16C16.2761 14 16.5 13.7761 16.5 13.5V11.5C16.5 11.2239 16.2761 11 16 11Z" fill="currentColor"/>
    <path d="M10 1H7C6.72386 1 6.5 1.22386 6.5 1.5V3.5C6.5 3.77614 6.72386 4 7 4H10C10.2761 4 10.5 3.77614 10.5 3.5V1.5C10.5 1.22386 10.2761 1 10 1Z" fill="currentColor"/>
    <path d="M4 1H1C0.723858 1 0.5 1.22386 0.5 1.5V3.5C0.5 3.77614 0.723858 4 1 4H4C4.27614 4 4.5 3.77614 4.5 3.5V1.5C4.5 1.22386 4.27614 1 4 1Z" fill="currentColor"/>
    <path d="M10 6H7C6.72386 6 6.5 6.22386 6.5 6.5V8.5C6.5 8.77614 6.72386 9 7 9H10C10.2761 9 10.5 8.77614 10.5 8.5V6.5C10.5 6.22386 10.2761 6 10 6Z" fill="currentColor"/>
    <path d="M4 6H1C0.723858 6 0.5 6.22386 0.5 6.5V8.5C0.5 8.77614 0.723858 9 1 9H4C4.27614 9 4.5 8.77614 4.5 8.5V6.5C4.5 6.22386 4.27614 6 4 6Z" fill="currentColor"/>
    <path d="M10 11H7C6.72386 11 6.5 11.2239 6.5 11.5V13.5C6.5 13.7761 6.72386 14 7 14H10C10.2761 14 10.5 13.7761 10.5 13.5V11.5C10.5 11.2239 10.2761 11 10 11Z" fill="currentColor"/>
    <path d="M4 11H1C0.723858 11 0.5 11.2239 0.5 11.5V13.5C0.5 13.7761 0.723858 14 1 14H4C4.27614 14 4.5 13.7761 4.5 13.5V11.5C4.5 11.2239 4.27614 11 4 11Z" fill="currentColor"/>
  </svg>
);

const ListIcon = ({ className }) => (
  <svg className={className} width="27" height="15" viewBox="0 0 27 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25.7 1.5H12.7V13.5H25.7V1.5Z" stroke="currentColor"/>
    <path d="M9.69995 1H6.69995C6.42381 1 6.19995 1.22386 6.19995 1.5V3.5C6.19995 3.77614 6.42381 4 6.69995 4H9.69995C9.97609 4 10.2 3.77614 10.2 3.5V1.5C10.2 1.22386 9.97609 1 9.69995 1Z" fill="currentColor"/>
    <path d="M9.69995 6H6.69995C6.42381 6 6.19995 6.22386 6.19995 6.5V8.5C6.19995 8.77614 6.42381 9 6.69995 9H9.69995C9.97609 9 10.2 8.77614 10.2 8.5V6.5C10.2 6.22386 9.97609 6 9.69995 6Z" fill="currentColor"/>
    <path d="M9.69995 11H6.69995C6.42381 11 6.19995 11.2239 6.19995 11.5V13.5C6.19995 13.7761 6.42381 14 6.69995 14H9.69995C9.97609 14 10.2 13.7761 10.2 13.5V11.5C10.2 11.2239 9.97609 11 9.69995 11Z" fill="currentColor"/>
    <path d="M3.69995 1H0.699951C0.423809 1 0.199951 1.22386 0.199951 1.5V3.5C0.199951 3.77614 0.423809 4 0.699951 4H3.69995C3.97609 4 4.19995 3.77614 4.19995 3.5V1.5C4.19995 1.22386 3.97609 1 3.69995 1Z" fill="currentColor"/>
    <path d="M3.69995 6H0.699951C0.423809 6 0.199951 6.22386 0.199951 6.5V8.5C0.199951 8.77614 0.423809 9 0.699951 9H3.69995C3.97609 9 4.19995 8.77614 4.19995 8.5V6.5C4.19995 6.22386 3.97609 6 3.69995 6Z" fill="currentColor"/>
    <path d="M3.69995 11H0.699951C0.423809 11 0.199951 11.2239 0.199951 11.5V13.5C0.199951 13.7761 0.423809 14 0.699951 14H3.69995C3.97609 14 4.19995 13.7761 4.19995 13.5V11.5C4.19995 11.2239 3.97609 11 3.69995 11Z" fill="currentColor"/>
  </svg>
);

export default function PropertySearch({ auth, siteName, siteUrl, year, properties = [], filters = {} }) {
  const [searchFilters, setSearchFilters] = useState({
    search: filters.search || '',
    forSale: filters.forSale || '',
    bedType: filters.bedType || '',
    minPrice: filters.minPrice || '0',
    maxPrice: filters.maxPrice || '$37,000,000',
  });

  const [viewType, setViewType] = useState('grid'); // 'grid' or 'mixed'

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Search filters:', searchFilters);
  };

  return (
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year}>
      <Head title={`Property Search - ${siteName}`} />
      
      {/* Header with same styling as PropertyDetail */}
      <div className='bg-[#293056] w-screen h-[85px] md:h-[120px] mb-10'>
        <Navbar auth={auth} />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-0">
        {/* Mobile Search Filters */}
        <div className="md:hidden mb-6">
          <div className="bg-[#F5F5F5] p-4 rounded-lg">
            {/* Mobile Search Bar */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 bg-white rounded-xl p-3">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full font-work-sans font-bold text-sm text-[#1C1463] bg-transparent border-none outline-none focus:ring-0 focus:border-none placeholder:font-bold placeholder:text-[#1C1463]"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="bg-black p-3 rounded-xl"
              >
                <SearchIcon className="w-[18px] h-[19px] text-white" />
              </button>
            </div>
            
            {/* Mobile Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <div className="relative bg-white rounded-lg">
                <select
                  value={searchFilters.forSale}
                  onChange={(e) => handleFilterChange('forSale', e.target.value)}
                  className="px-3 py-2 pr-8 font-work-sans font-bold text-sm text-[#293056] bg-transparent border-none outline-none whitespace-nowrap appearance-none"
                >
                  <option value="">For Sale</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDownIcon className="w-4 h-4 text-[#293056]" />
                </div>
              </div>
              
              <div className="relative bg-white rounded-lg">
                <select
                  value={searchFilters.bedType}
                  onChange={(e) => handleFilterChange('bedType', e.target.value)}
                  className="px-3 py-2 pr-8 font-work-sans font-bold text-sm text-[#293056] bg-transparent border-none outline-none whitespace-nowrap appearance-none"
                >
                  <option value="">Bed type</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDownIcon className="w-4 h-4 text-[#293056]" />
                </div>
              </div>
            </div>
            
            {/* Mobile Price Range */}
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                placeholder="Min price"
                value={searchFilters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="flex-1 bg-white px-3 py-2 rounded-lg text-xs font-work-sans text-black border border-[#293056] outline-none"
              />
              <span className="text-[#293056] text-xs font-work-sans py-2">to</span>
              <input
                type="text"
                placeholder="Max price"
                value={searchFilters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="flex-1 bg-white px-3 py-2 rounded-lg text-xs font-work-sans text-black border border-[#293056] outline-none"
              />
            </div>
            
            {/* Mobile View Toggle and Save */}
            <div className="flex gap-2 mt-4">
              <div className="flex bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => setViewType('grid')}
                  className={`flex flex-col items-center px-4 py-2 rounded-l-lg transition-colors ${
                    viewType === 'grid' ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  <GridIcon className={`w-4 h-3.5 mb-1 ${viewType === 'grid' ? 'text-white' : 'text-black'}`} />
                  <span className="font-work-sans font-normal text-xs">Grid</span>
                </button>
                <button
                  onClick={() => setViewType('mixed')}
                  className={`flex flex-col items-center px-4 py-2 rounded-r-lg transition-colors ${
                    viewType === 'mixed' ? 'bg-black text-white' : 'bg-white text-[#263238]'
                  }`}
                >
                  <ListIcon className={`w-6 h-3.5 mb-1 ${viewType === 'mixed' ? 'text-white' : 'text-[#263238]'}`} />
                  <span className="font-work-sans font-normal text-xs">Mixed</span>
                </button>
              </div>
              
              <button className="flex-1 bg-white px-4 py-2 rounded-lg font-work-sans font-bold text-sm text-[#293056]">
                Save search
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Search Filters Header */}
        <div className="hidden md:block mb-6">
          <div className="bg-[#F5F5F5] px-4 py-3 h-[75px] flex items-center">
            <div className="w-full max-w-[1248px] mx-auto flex items-center justify-between">
              {/* Left Side - Search and Filters */}
              <div className="flex items-center gap-8">
                {/* Search Bar */}
                <div className="flex items-center bg-white rounded-xl w-[324px] h-12">
                  <div className="flex items-center justify-between w-full px-1">
                    <div className="flex items-center px-4 flex-1">
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchFilters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full font-work-sans font-bold text-sm text-[#1C1463] bg-transparent border-none outline-none focus:ring-0 focus:border-none placeholder-[#1C1463] placeholder:font-bold"
                      />
                    </div>
                    <button 
                      onClick={handleSearch}
                      className="flex items-center justify-center w-10 h-10 bg-black rounded-xl mr-1"
                    >
                      <SearchIcon className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>

                {/* For Sale Dropdown */}
                <div className="flex items-center bg-white rounded-lg w-[99px] h-10 relative">
                  <select
                    value={searchFilters.forSale}
                    onChange={(e) => handleFilterChange('forSale', e.target.value)}
                    className="w-full h-full px-3 font-work-sans font-bold text-sm text-[#293056] bg-transparent border-none outline-none appearance-none cursor-pointer"
                  >
                    <option value="">For Sale</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                    <option value="lease">For Lease</option>
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronDownIcon className="w-4 h-4 text-[#293056]" />
                  </div>
                </div>

                {/* Bed Type Dropdown */}
                <div className="flex items-center bg-white rounded-lg w-[105px] h-10 relative">
                  <select
                    value={searchFilters.bedType}
                    onChange={(e) => handleFilterChange('bedType', e.target.value)}
                    className="w-full h-full px-3 font-work-sans font-bold text-sm text-[#293056] bg-transparent border-none outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Bed type</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronDownIcon className="w-4 h-4 text-[#293056]" />
                  </div>
                </div>

                {/* Price Range */}
                <div className="flex flex-col w-[286px]">
                  {/* Price Inputs Row */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center justify-center bg-white border border-[#293056] rounded-lg w-[99px] h-[27px]">
                      <input
                        type="text"
                        placeholder="0"
                        value={searchFilters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full text-center font-work-sans text-xs text-black bg-transparent border-none outline-none placeholder:text-black"
                      />
                    </div>
                    
                    <span className="font-work-sans text-xs text-[#293056] mx-3">to</span>
                    
                    <div className="flex items-center justify-center bg-white border border-[#293056] rounded-lg w-[99px] h-[27px]">
                      <input
                        type="text"
                        placeholder="$37,000,000"
                        value={searchFilters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full text-center font-work-sans text-xs text-black bg-transparent border-none outline-none placeholder:text-black"
                      />
                    </div>
                  </div>
                  
                  {/* Price Slider */}
                  <div className="relative w-full h-5">
                    {/* Slider Track */}
                    <div className="absolute left-[8.39%] right-[7.34%] top-[45%] h-[2px] bg-[#293056] rounded-full"></div>
                    
                    {/* Min Handle */}
                    <div className="absolute left-0 top-[0.95px] w-[20px] h-[19px] bg-white border border-[#293056] rounded-full cursor-pointer flex items-center justify-center">
                      <div className="w-[7px] h-[7px] bg-[#293056] rounded-full"></div>
                    </div>
                    
                    {/* Max Handle */}
                    <div className="absolute right-0 top-0 w-[20px] h-[19px] bg-white border border-[#293056] rounded-full cursor-pointer flex items-center justify-center">
                      <div className="w-[7px] h-[7px] bg-[#293056] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - View Toggle and Save */}
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex bg-white rounded-[10px] shadow-[0px_4px_5px_rgba(0,0,0,0.15)] w-[145px] h-11">
                  <button
                    onClick={() => setViewType('grid')}
                    className={`flex flex-col items-center justify-center px-3 py-2 w-[79px] h-full rounded-l-[10px] transition-colors ${
                      viewType === 'grid' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
                    }`}
                  >
                    <GridIcon className={`w-4 h-[14px] mb-1 ${viewType === 'grid' ? 'text-white' : 'text-black'}`} />
                    <span className="font-work-sans font-normal text-xs">Grid</span>
                  </button>
                  
                  <button
                    onClick={() => setViewType('mixed')}
                    className={`flex flex-col items-center justify-center px-3 py-2 w-[66px] h-full rounded-r-[10px] transition-colors ${
                      viewType === 'mixed' ? 'bg-black text-white' : 'bg-white text-[#263238] hover:bg-gray-50'
                    }`}
                  >
                    <ListIcon className={`w-[26px] h-[14px] mb-1 ${viewType === 'mixed' ? 'text-white' : 'text-[#263238]'}`} />
                    <span className="font-work-sans font-normal text-xs">Mixed</span>
                  </button>
                </div>

                {/* Save Search */}
                <button className="flex items-center justify-center bg-white rounded-lg px-4 py-2 w-[120px] h-12 hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <span className="font-work-sans font-bold text-sm text-[#293056]">Save search</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Property Listing Section */}
        <div className="py-8">
          {/* Header Section */}
          <div className="mb-8">
            {/* Main Heading */}
            <h1 className="font-space-grotesk font-bold text-[40px] leading-[50px] tracking-[-0.03em] text-black mb-6">
              Toronto condos for ...
            </h1>
            
            {/* Navigation and Controls */}
            <div className="flex items-center justify-between">
              {/* Left: Listing and Buildings Tabs */}
              <div className="flex items-center">
                {/* Listing Tab */}
                <div className="flex flex-row justify-center items-center px-[10px] py-[10px] gap-[10px] w-[168px] h-[50px] border-b border-[#252B37] box-border">
                  <span className="w-[148px] h-[30px] font-red-hat-display font-bold text-[20px] leading-[30px] flex items-center tracking-[-0.03em] text-[#252B37]">
                    Listing 1234.903
                  </span>
                </div>
                
                {/* Buildings Tab */}
                <div className="flex flex-row justify-center items-center px-[10px] py-[10px] gap-[10px] w-[120px] h-[50px]">
                  <span className="font-red-hat-display font-bold text-[20px] leading-[30px] flex items-center tracking-[-0.03em] text-gray-400">
                    Buildings
                  </span>
                </div>
              </div>
              
              {/* Right: Sort and Filter */}
              <div className="flex items-center gap-4">
                {/* Sort Button */}
                <div className="flex flex-row justify-center items-center px-3 py-[12px] gap-2 w-[80px] h-[25px] rounded-lg">
                  <span className="w-8 h-[25px] font-work-sans font-medium text-base leading-[25px] flex items-center text-center tracking-[-0.03em] text-black">
                    Sort
                  </span>
                  <div className="w-4 h-4">
                    <ChevronDownIcon className="w-4 h-4 text-black" />
                  </div>
                </div>
                
                {/* Filter Button */}
                <div className="flex flex-col items-start px-6 py-4 w-[176px] h-[57px] bg-white border border-black rounded-xl box-border">
                  <div className="flex flex-row justify-between items-center gap-[72px] w-[128px] h-[25px]">
                    <span className="w-10 h-[25px] font-work-sans font-medium text-base leading-[25px] tracking-[-0.03em] text-black">
                      Filter
                    </span>
                    <div className="w-4 h-4 relative">
                      <ChevronDownIcon className="w-4 h-4 text-black" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Property Cards Grid */}
          {viewType === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample Property Cards */}
              {[
                {
                  id: 1,
                  listingKey: "N12210656",
                  image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
                  price: 750,
                  propertyType: "Condo Apartment",
                  transactionType: "For Rent",
                  bedrooms: 4,
                  bathrooms: 5,
                  address: "20724 visa Court, london, CA 95476",
                  isRental: true
                },
                {
                  id: 2,
                  listingKey: "N12210657",
                  image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80",
                  price: 750,
                  propertyType: "Condo Apartment",
                  transactionType: "For Rent",
                  bedrooms: 4,
                  bathrooms: 5,
                  address: "20724 visa Court, london, CA 95476",
                  isRental: true
                },
                {
                  id: 3,
                  listingKey: "N12210658",
                  image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80",
                  price: 750,
                  propertyType: "Condo Apartment",
                  transactionType: "For Rent",
                  bedrooms: 4,
                  bathrooms: 5,
                  address: "20724 visa Court, london, CA 95476",
                  isRental: true
                },
                {
                  id: 4,
                  listingKey: "N12210659",
                  image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
                  price: 750,
                  propertyType: "Condo Apartment",
                  transactionType: "For Rent",
                  bedrooms: 4,
                  bathrooms: 5,
                  address: "20724 visa Court, london, CA 95476",
                  isRental: true
                },
                {
                  id: 5,
                  listingKey: "N12210660",
                  image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80",
                  price: 750,
                  propertyType: "Condo Apartment",
                  transactionType: "For Rent",
                  bedrooms: 4,
                  bathrooms: 5,
                  address: "20724 visa Court, london, CA 95476",
                  isRental: true
                },
                {
                  id: 6,
                  listingKey: "N12210661",
                  image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80",
                  price: 750,
                  propertyType: "Condo Apartment",
                  transactionType: "For Rent",
                  bedrooms: 4,
                  bathrooms: 5,
                  address: "20724 visa Court, london, CA 95476",
                  isRental: true
                }
              ].map((property) => (
                <PropertyCardV1
                  key={property.id}
                  property={property}
                  size="default"
                  className="mx-auto"
                />
              ))}
            </div>
          ) : (
            /* Mixed View - Cards + Map */
            <div className="flex gap-12">
              {/* Cards Section - Half width */}
              <div className="w-1/2 flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Show only first 4 cards in mixed view */}
                  {[
                    {
                      id: 1,
                      listingKey: "N12210656",
                      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
                      price: 750,
                      propertyType: "Condo Apartment",
                      transactionType: "For Rent",
                      bedrooms: 4,
                      bathrooms: 5,
                      address: "20724 visa Court, london, CA 95476",
                      isRental: true
                    },
                    {
                      id: 2,
                      listingKey: "N12210657",
                      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80",
                      price: 750,
                      propertyType: "Condo Apartment",
                      transactionType: "For Rent",
                      bedrooms: 4,
                      bathrooms: 5,
                      address: "20724 visa Court, london, CA 95476",
                      isRental: true
                    },
                    {
                      id: 3,
                      listingKey: "N12210658",
                      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80",
                      price: 750,
                      propertyType: "Condo Apartment",
                      transactionType: "For Rent",
                      bedrooms: 4,
                      bathrooms: 5,
                      address: "20724 visa Court, london, CA 95476",
                      isRental: true
                    },
                    {
                      id: 4,
                      listingKey: "N12210659",
                      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
                      price: 750,
                      propertyType: "Condo Apartment",
                      transactionType: "For Rent",
                      bedrooms: 4,
                      bathrooms: 5,
                      address: "20724 visa Court, london, CA 95476",
                      isRental: true
                    }
                  ].map((property) => (
                    <PropertyCardV1
                      key={property.id}
                      property={property}
                      size="default"
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
              
              {/* Map Section - Half width */}
              <div className="w-1/2 h-[600px] bg-green-100 rounded-lg relative overflow-hidden">
                {/* Map Background */}
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-122.4194,37.7749,10,0/600x600@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw')`
                  }}
                >
                  {/* Property Markers */}
                  <div className="absolute top-12 left-20 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-24 left-32 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-36 left-16 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-40 left-40 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-28 left-56 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-52 left-24 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-44 left-60 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-60 left-36 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-32 left-72 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-48 left-80 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-64 left-52 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-20 left-64 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-56 left-68 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-36 left-44 w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute top-42 left-28 w-3 h-3 bg-black rounded-full"></div>
                </div>
                
                {/* Draw Button */}
                <div className="absolute left-4 top-4 flex flex-row justify-center items-center px-[20.8px] py-[12.8px] gap-2 w-[93.6px] h-[41.6px] bg-white border border-[#E7E7E7] rounded-lg box-border">
                  {/* Draw Icon */}
                  <div className="w-4 h-4 relative">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5 2.5L13.5 3.5L4.5 12.5H3.5V11.5L12.5 2.5Z" stroke="#000000" strokeWidth="1" fill="none"/>
                      <path d="M11.5 3.5L12.5 4.5" stroke="#000000" strokeWidth="1"/>
                    </svg>
                  </div>
                  
                  {/* Draw Text */}
                  <span className="w-7 h-4 font-red-hat-display font-semibold text-xs leading-4 flex items-center text-center text-black">
                    Draw
                  </span>
                </div>
                
                {/* Zoom Controls */}
                <div className="absolute right-4 bottom-20 flex flex-col gap-1">
                  <button className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center text-lg font-bold hover:bg-gray-50">
                    +
                  </button>
                  <button className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center text-lg font-bold hover:bg-gray-50">
                    −
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
