import React, { useState, useEffect } from 'react';

// Inject styles for hiding range slider thumbs
const injectSliderStyles = () => {
  const styleId = 'filters-modal-slider-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .filters-modal-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      background: transparent;
      cursor: pointer;
      border: none;
    }
    .filters-modal-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: transparent;
      cursor: pointer;
      border: none;
    }
    .filters-modal-slider::-ms-thumb {
      width: 18px;
      height: 18px;
      background: transparent;
      cursor: pointer;
      border: none;
    }
  `;
  document.head.appendChild(style);
};

const FiltersModal = ({
  isOpen,
  onClose,
  onApply,
  currentFilters = {},
  totalCount = 0
}) => {
  // Filter states
  const [status, setStatus] = useState(currentFilters.status || 'For Sale');
  const [priceMin, setPriceMin] = useState(currentFilters.price_min || '');
  const [priceMax, setPriceMax] = useState(currentFilters.price_max || '');
  // Numeric price values for slider (0 to 10M range)
  const [priceMinSlider, setPriceMinSlider] = useState(currentFilters.price_min ? parseInt(String(currentFilters.price_min).replace(/,/g, '')) : 0);
  const [priceMaxSlider, setPriceMaxSlider] = useState(currentFilters.price_max ? parseInt(String(currentFilters.price_max).replace(/,/g, '')) : 10000000);
  const [propertyTypes, setPropertyTypes] = useState(currentFilters.property_type || []);
  const [bedrooms, setBedrooms] = useState(currentFilters.bedrooms || 'Any');
  const [bathrooms, setBathrooms] = useState(currentFilters.bathrooms || 'Any');
  const [homeTypes, setHomeTypes] = useState([]);
  const [daysOnMarket, setDaysOnMarket] = useState('Any');
  const [buildingAge, setBuildingAge] = useState('Any');
  const [locker, setLocker] = useState('Any');
  const [balcony, setBalcony] = useState('Any');
  const [amenities, setAmenities] = useState([]);
  const [keywords, setKeywords] = useState('');

  // Inject slider styles on mount
  useEffect(() => {
    injectSliderStyles();
  }, []);

  // Update states when currentFilters change or modal opens
  useEffect(() => {
    if (currentFilters && isOpen) {
      // Handle status - check for Sold/Leased in property_status
      if (currentFilters.property_status === 'Sold' || currentFilters.property_status === 'Leased') {
        setStatus(currentFilters.property_status);
      } else {
        setStatus(currentFilters.status || 'For Sale');
      }

      // Price values
      const minPrice = currentFilters.price_min ? parseInt(String(currentFilters.price_min).replace(/,/g, '')) : 0;
      const maxPrice = currentFilters.price_max ? parseInt(String(currentFilters.price_max).replace(/,/g, '')) : 10000000;

      setPriceMin(minPrice > 0 ? minPrice.toLocaleString() : '');
      setPriceMax(maxPrice < 10000000 ? maxPrice.toLocaleString() : '');
      setPriceMinSlider(minPrice);
      setPriceMaxSlider(maxPrice);

      // Property types - handle both array and string formats
      const propTypes = Array.isArray(currentFilters.property_type)
        ? currentFilters.property_type
        : (currentFilters.property_type ? [currentFilters.property_type] : []);
      setPropertyTypes(propTypes);

      // Bedrooms - convert number to string format
      const bedroomVal = currentFilters.bedrooms;
      if (!bedroomVal || bedroomVal === 0) {
        setBedrooms('Any');
      } else if (bedroomVal >= 3) {
        setBedrooms('3+');
      } else {
        setBedrooms(String(bedroomVal));
      }

      // Bathrooms - convert number to string format
      const bathroomVal = currentFilters.bathrooms;
      if (!bathroomVal || bathroomVal === 0) {
        setBathrooms('Any');
      } else if (bathroomVal >= 5) {
        setBathrooms('5+');
      } else {
        setBathrooms(String(bathroomVal));
      }
    }
  }, [currentFilters, isOpen]);

  // Sync slider with text inputs
  const handlePriceMinChange = (value) => {
    const formatted = formatPrice(value);
    setPriceMin(formatted);
    const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    if (numValue < priceMaxSlider) {
      setPriceMinSlider(numValue);
    }
  };

  const handlePriceMaxChange = (value) => {
    const formatted = formatPrice(value);
    setPriceMax(formatted);
    const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 10000000;
    if (numValue > priceMinSlider) {
      setPriceMaxSlider(numValue);
    }
  };

  // Sync text inputs with slider - allow full range from 0 to max
  const handleSliderMinChange = (value) => {
    // Allow min to go up to max value (they can meet)
    const newMin = Math.min(value, priceMaxSlider);
    setPriceMinSlider(newMin);
    setPriceMin(newMin > 0 ? newMin.toLocaleString() : '');
  };

  const handleSliderMaxChange = (value) => {
    // Allow max to go down to min value (they can meet)
    const newMax = Math.max(value, priceMinSlider);
    setPriceMaxSlider(newMax);
    setPriceMax(newMax < 10000000 ? newMax.toLocaleString() : '');
  };

  const propertyTypeOptions = ['Townhouse', 'Condo Apartment', 'Co-Op Apt', 'Detached', 'Semi-Detached'];
  const bedroomOptions = ['Any', 'Studio', '1', '1+1', '2', '2+1', '3+'];
  const bathroomOptions = ['Any', '1', '2', '3', '4', '5+'];
  const homeTypeOptions = ['High-Rise', 'Mid-Rise', 'Low-Rise', 'Loft', 'Luxury', 'Penthouse'];
  const amenityOptions = ['Gym', 'Pool', 'Concierge', 'Guest Suites', 'Visitor Parking', 'BBQ Permitted', 'Party Room', 'Rooftop Deck', 'Beanfield Fibre', 'FibreStream'];

  const togglePropertyType = (type) => {
    setPropertyTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleHomeType = (type) => {
    setHomeTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleAmenity = (amenity) => {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleReset = () => {
    setStatus('For Sale');
    setPriceMin('');
    setPriceMax('');
    setPriceMinSlider(0);
    setPriceMaxSlider(10000000);
    setPropertyTypes([]);
    setBedrooms('Any');
    setBathrooms('Any');
    setHomeTypes([]);
    setDaysOnMarket('Any');
    setBuildingAge('Any');
    setLocker('Any');
    setBalcony('Any');
    setAmenities([]);
    setKeywords('');
  };

  const handleApply = () => {
    // Use slider values as primary source (they are always numeric and in sync)
    const filters = {
      status,
      price_min: priceMinSlider || 0,
      price_max: priceMaxSlider || 10000000,
      property_type: propertyTypes,
      bedrooms: bedrooms === 'Any' ? 0 : bedrooms === 'Studio' ? 0 : parseInt(bedrooms.replace('+', '')),
      bathrooms: bathrooms === 'Any' ? 0 : parseInt(bathrooms.replace('+', '')),
      home_types: homeTypes,
      days_on_market: daysOnMarket,
      building_age: buildingAge,
      locker,
      balcony,
      amenities,
      keywords
    };
    console.log('🔍 FiltersModal applying filters:', filters);
    onApply(filters);
    onClose();
  };

  const formatPrice = (value) => {
    const num = value.replace(/[^0-9]/g, '');
    return num ? parseInt(num).toLocaleString() : '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[650px] max-h-[90vh] flex flex-col font-['Work_Sans']">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div></div>
          <h2 className="font-medium text-[#293056] text-base leading-6 tracking-[-0.03em]">Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">

          {/* Status Tabs */}
          <div className="flex gap-2 p-1 bg-gray-50 rounded-lg mb-6">
            {['For Sale', 'For Rent', 'Sold', 'Leased'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex-1 h-11 rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] transition-all ${
                  status === s
                    ? 'bg-[#293056] text-white'
                    : 'bg-transparent text-[#293056] hover:bg-gray-200'
                }`}
              >
                {s === 'For Rent' ? 'For rent' : s}
              </button>
            ))}
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] mb-3">Price</label>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="text"
                placeholder="No min"
                value={priceMin}
                onChange={(e) => handlePriceMinChange(e.target.value)}
                className="flex-1 h-11 px-4 bg-white border border-[#293056] rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] placeholder:text-[#293056] focus:outline-none"
              />
              <span className="font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056]">to</span>
              <input
                type="text"
                placeholder="No max"
                value={priceMax}
                onChange={(e) => handlePriceMaxChange(e.target.value)}
                className="flex-1 h-11 px-4 bg-white border border-[#293056] rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] placeholder:text-[#293056] focus:outline-none"
              />
            </div>

            {/* Price Slider with Custom Draggable Handles */}
            <div className="relative flex w-full items-center h-5">
              {/* Slider Track Background */}
              <div className="absolute w-full h-[1.61px] bg-gray-300 rounded-full"></div>

              {/* Active Track (between min and max) */}
              <div
                className="absolute h-[1.61px] bg-[#293056] rounded-full pointer-events-none"
                style={{
                  left: `${(priceMinSlider / 10000000) * 100}%`,
                  right: `${100 - (priceMaxSlider / 10000000) * 100}%`
                }}
              ></div>

              {/* Min Range Input */}
              <input
                type="range"
                min="0"
                max="10000000"
                step="50000"
                value={priceMinSlider}
                onChange={(e) => handleSliderMinChange(parseInt(e.target.value))}
                className="filters-modal-slider absolute w-full h-5 appearance-none bg-transparent cursor-pointer"
                style={{
                  zIndex: 4,
                  pointerEvents: 'auto'
                }}
              />

              {/* Max Range Input */}
              <input
                type="range"
                min="0"
                max="10000000"
                step="50000"
                value={priceMaxSlider}
                onChange={(e) => handleSliderMaxChange(parseInt(e.target.value))}
                className="filters-modal-slider absolute w-full h-5 appearance-none bg-transparent cursor-pointer"
                style={{
                  zIndex: 3,
                  pointerEvents: 'auto'
                }}
              />

              {/* Left Handle SVG - Draggable */}
              <div
                className="absolute flex-shrink-0 z-30 cursor-grab active:cursor-grabbing"
                style={{
                  left: `calc(${(priceMinSlider / 10000000) * 100}% - 9px)`,
                  touchAction: 'none'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const slider = e.currentTarget.parentElement;
                  const rect = slider.getBoundingClientRect();

                  const handleDrag = (event) => {
                    const clientX = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
                    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
                    const value = Math.round((percentage / 100) * 10000000 / 50000) * 50000;
                    // Allow dragging from 0 to max (no gap restriction)
                    handleSliderMinChange(value);
                  };

                  const handleRelease = () => {
                    document.removeEventListener('mousemove', handleDrag);
                    document.removeEventListener('mouseup', handleRelease);
                    document.removeEventListener('touchmove', handleDrag);
                    document.removeEventListener('touchend', handleRelease);
                  };

                  document.addEventListener('mousemove', handleDrag);
                  document.addEventListener('mouseup', handleRelease);
                }}
                onTouchStart={(e) => {
                  const slider = e.currentTarget.parentElement;
                  const rect = slider.getBoundingClientRect();

                  const handleDrag = (event) => {
                    const clientX = event.touches[0].clientX;
                    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
                    const value = Math.round((percentage / 100) * 10000000 / 50000) * 50000;
                    // Allow dragging from 0 to max (no gap restriction)
                    handleSliderMinChange(value);
                  };

                  const handleRelease = () => {
                    document.removeEventListener('touchmove', handleDrag);
                    document.removeEventListener('touchend', handleRelease);
                  };

                  document.addEventListener('touchmove', handleDrag);
                  document.addEventListener('touchend', handleRelease);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="0.644043" width="20.3559" height="19.0476" rx="9.52381" fill="white"/>
                  <rect x="1.14404" y="0.5" width="19.3559" height="18.0476" rx="9.02381" stroke="#293056"/>
                  <path d="M14.489 4.85712C14.489 5.21076 14.348 5.54988 14.098 5.79992C13.848 6.04996 13.509 6.19046 13.155 6.19046C12.802 6.19046 12.463 6.04996 12.213 5.79992C11.963 5.54988 11.822 5.21076 11.822 4.85712C11.822 4.50348 11.963 4.16437 12.213 3.91432C12.463 3.66428 12.802 3.52379 13.155 3.52379C13.509 3.52379 13.848 3.66428 14.098 3.91432C14.348 4.16437 14.489 4.50348 14.489 4.85712ZM14.489 9.52379C14.489 9.87743 14.348 10.2165 14.098 10.4666C13.848 10.7166 13.509 10.8571 13.155 10.8571C12.802 10.8571 12.463 10.7166 12.213 10.4666C11.963 10.2165 11.822 9.87743 11.822 9.52379C11.822 9.17015 11.963 8.83104 12.213 8.58099C12.463 8.33095 12.802 8.19046 13.155 8.19046C13.509 8.19046 13.848 8.33095 14.098 8.58099C14.348 8.83104 14.489 9.17015 14.489 9.52379ZM8.489 15.5238C8.842 15.5238 9.181 15.3833 9.432 15.1333C9.682 14.8832 9.822 14.5441 9.822 14.1905C9.822 13.8368 9.682 13.4977 9.432 13.2477C9.181 12.9976 8.842 12.8571 8.489 12.8571C8.135 12.8571 7.796 12.9976 7.546 13.2477C7.296 13.4977 7.155 13.8368 7.155 14.1905C7.155 14.5441 7.296 14.8832 7.546 15.1333C7.796 15.3833 8.135 15.5238 8.489 15.5238ZM13.155 15.5238C13.509 15.5238 13.848 15.3833 14.098 15.1333C14.348 14.8832 14.489 14.5441 14.489 14.1905C14.489 13.8368 14.348 13.4977 14.098 13.2477C13.848 12.9976 13.509 12.8571 13.155 12.8571C12.802 12.8571 12.463 12.9976 12.213 13.2477C11.963 13.4977 11.822 13.8368 11.822 14.1905C11.822 14.5441 11.963 14.8832 12.213 15.1333C12.463 15.3833 12.802 15.5238 13.155 15.5238ZM8.489 10.8571C8.842 10.8571 9.181 10.7166 9.432 10.4666C9.682 10.2165 9.822 9.87743 9.822 9.52379C9.822 9.17015 9.682 8.83104 9.432 8.58099C9.181 8.33095 8.842 8.19046 8.489 8.19046C8.135 8.19046 7.796 8.33095 7.546 8.58099C7.296 8.83104 7.155 9.17015 7.155 9.52379C7.155 9.87743 7.296 10.2165 7.546 10.4666C7.796 10.7166 8.135 10.8571 8.489 10.8571ZM8.489 6.19046C8.842 6.19046 9.181 6.04996 9.432 5.79992C9.682 5.54988 9.822 5.21076 9.822 4.85712C9.822 4.50348 9.682 4.16437 9.432 3.91432C9.181 3.66428 8.842 3.52379 8.489 3.52379C8.135 3.52379 7.796 3.66428 7.546 3.91432C7.296 4.16437 7.155 4.50348 7.155 4.85712C7.155 5.21076 7.296 5.54988 7.546 5.79992C7.796 6.04996 8.135 6.19046 8.489 6.19046Z" fill="#293056"/>
                </svg>
              </div>

              {/* Right Handle SVG - Draggable */}
              <div
                className="absolute flex-shrink-0 z-30 cursor-grab active:cursor-grabbing"
                style={{
                  left: `calc(${(priceMaxSlider / 10000000) * 100}% - 9px)`,
                  touchAction: 'none'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const slider = e.currentTarget.parentElement;
                  const rect = slider.getBoundingClientRect();

                  const handleDrag = (event) => {
                    const clientX = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
                    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
                    const value = Math.round((percentage / 100) * 10000000 / 50000) * 50000;
                    // Allow dragging from max to 0 (no gap restriction)
                    handleSliderMaxChange(value);
                  };

                  const handleRelease = () => {
                    document.removeEventListener('mousemove', handleDrag);
                    document.removeEventListener('mouseup', handleRelease);
                    document.removeEventListener('touchmove', handleDrag);
                    document.removeEventListener('touchend', handleRelease);
                  };

                  document.addEventListener('mousemove', handleDrag);
                  document.addEventListener('mouseup', handleRelease);
                }}
                onTouchStart={(e) => {
                  const slider = e.currentTarget.parentElement;
                  const rect = slider.getBoundingClientRect();

                  const handleDrag = (event) => {
                    const clientX = event.touches[0].clientX;
                    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
                    const value = Math.round((percentage / 100) * 10000000 / 50000) * 50000;
                    // Allow dragging from max to 0 (no gap restriction)
                    handleSliderMaxChange(value);
                  };

                  const handleRelease = () => {
                    document.removeEventListener('touchmove', handleDrag);
                    document.removeEventListener('touchend', handleRelease);
                  };

                  document.addEventListener('touchmove', handleDrag);
                  document.addEventListener('touchend', handleRelease);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="20.3559" height="19.0476" rx="9.52381" fill="white"/>
                  <rect x="0.5" y="0.5" width="19.3559" height="18.0476" rx="9.02381" stroke="#293056"/>
                  <path d="M13.845 4.85712C13.845 5.21076 13.704 5.54988 13.454 5.79992C13.204 6.04996 12.865 6.19046 12.511 6.19046C12.158 6.19046 11.818 6.04996 11.568 5.79992C11.318 5.54988 11.178 5.21076 11.178 4.85712C11.178 4.50348 11.318 4.16437 11.568 3.91432C11.818 3.66428 12.158 3.52379 12.511 3.52379C12.865 3.52379 13.204 3.66428 13.454 3.91432C13.704 4.16437 13.845 4.50348 13.845 4.85712ZM13.845 9.52379C13.845 9.87743 13.704 10.2165 13.454 10.4666C13.204 10.7166 12.865 10.8571 12.511 10.8571C12.158 10.8571 11.818 10.7166 11.568 10.4666C11.318 10.2165 11.178 9.87743 11.178 9.52379C11.178 9.17015 11.318 8.83104 11.568 8.58099C11.818 8.33095 12.158 8.19046 12.511 8.19046C12.865 8.19046 13.204 8.33095 13.454 8.58099C13.704 8.83104 13.845 9.17015 13.845 9.52379ZM7.845 15.5238C8.198 15.5238 8.537 15.3833 8.787 15.1333C9.037 14.8832 9.178 14.5441 9.178 14.1905C9.178 13.8368 9.037 13.4977 8.787 13.2477C8.537 12.9976 8.198 12.8571 7.845 12.8571C7.491 12.8571 7.152 12.9976 6.902 13.2477C6.652 13.4977 6.511 13.8368 6.511 14.1905C6.511 14.5441 6.652 14.8832 6.902 15.1333C7.152 15.3833 7.491 15.5238 7.845 15.5238ZM12.511 15.5238C12.865 15.5238 13.204 15.3833 13.454 15.1333C13.704 14.8832 13.845 14.5441 13.845 14.1905C13.845 13.8368 13.704 13.4977 13.454 13.2477C13.204 12.9976 12.865 12.8571 12.511 12.8571C12.158 12.8571 11.818 12.9976 11.568 13.2477C11.318 13.4977 11.178 13.8368 11.178 14.1905C11.178 14.5441 11.318 14.8832 11.568 15.1333C11.818 15.3833 12.158 15.5238 12.511 15.5238ZM7.845 10.8571C8.198 10.8571 8.537 10.7166 8.787 10.4666C9.037 10.2165 9.178 9.87743 9.178 9.52379C9.178 9.17015 9.037 8.83104 8.787 8.58099C8.537 8.33095 8.198 8.19046 7.845 8.19046C7.491 8.19046 7.152 8.33095 6.902 8.58099C6.652 8.83104 6.511 9.17015 6.511 9.52379C6.511 9.87743 6.652 10.2165 6.902 10.4666C7.152 10.7166 7.491 10.8571 7.845 10.8571ZM7.845 6.19046C8.198 6.19046 8.537 6.04996 8.787 5.79992C9.037 5.54988 9.178 5.21076 9.178 4.85712C9.178 4.50348 9.037 4.16437 8.787 3.91432C8.537 3.66428 8.198 3.52379 7.845 3.52379C7.491 3.52379 7.152 3.66428 6.902 3.91432C6.652 4.16437 6.511 4.50348 6.511 4.85712C6.511 5.21076 6.652 5.54988 6.902 5.79992C7.152 6.04996 7.491 6.19046 7.845 6.19046Z" fill="#293056"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div className="mb-6">
            <label className="block font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] mb-3">Property Type</label>
            <div className="flex flex-wrap gap-2">
              {propertyTypeOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => togglePropertyType(type)}
                  className={`px-4 h-11 rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] transition-all shadow-[0px_3px_11px_rgba(0,0,0,0.02)] ${
                    propertyTypes.includes(type)
                      ? 'bg-[#293056] text-white'
                      : 'bg-[#E9EAEB] text-[#293056] hover:bg-[#d1d3d6]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div className="mb-6">
            <label className="block font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] mb-3">Bedrooms</label>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map((bed) => (
                <button
                  key={bed}
                  onClick={() => setBedrooms(bed)}
                  className={`min-w-[46px] px-2.5 h-11 rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] transition-all shadow-[0px_3px_11px_rgba(0,0,0,0.02)] ${
                    bedrooms === bed
                      ? 'bg-[#293056] text-white'
                      : 'bg-[#E9EAEB] text-[#293056] hover:bg-[#d1d3d6]'
                  }`}
                >
                  {bed === 'Any' || bed === 'Studio' ? bed : `${bed}BD`}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div className="mb-6">
            <label className="block font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] mb-3">Bathrooms</label>
            <div className="flex flex-wrap gap-2">
              {bathroomOptions.map((bath) => (
                <button
                  key={bath}
                  onClick={() => setBathrooms(bath)}
                  className={`min-w-[46px] px-2.5 h-11 rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] transition-all shadow-[0px_3px_11px_rgba(0,0,0,0.02)] ${
                    bathrooms === bath
                      ? 'bg-[#293056] text-white'
                      : 'bg-[#E9EAEB] text-[#293056] hover:bg-[#d1d3d6]'
                  }`}
                >
                  {bath}
                </button>
              ))}
            </div>
          </div>

          {/* Home Type */}
          <div className="mb-6">
            <label className="block font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] mb-3">Home Type</label>
            <div className="flex flex-wrap gap-2">
              {homeTypeOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleHomeType(type)}
                  className={`px-4 h-11 rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] transition-all shadow-[0px_3px_11px_rgba(0,0,0,0.02)] ${
                    homeTypes.includes(type)
                      ? 'bg-[#293056] text-white'
                      : 'bg-[#E9EAEB] text-[#293056] hover:bg-[#d1d3d6]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Days on Market */}
          <div className="mb-6">
            <label className="block font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] mb-3">Days on Market</label>
            <div className="relative">
              <select
                value={daysOnMarket}
                onChange={(e) => setDaysOnMarket(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#293056] rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] appearance-none cursor-pointer focus:outline-none pr-10"
              >
                <option>Any</option>
                <option>1 day</option>
                <option>7 days</option>
                <option>14 days</option>
                <option>30 days</option>
                <option>90 days</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#293056]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Building Age */}
          <div className="mb-6">
            <label className="block font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] mb-3">Building Age</label>
            <div className="relative">
              <select
                value={buildingAge}
                onChange={(e) => setBuildingAge(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#293056] rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] appearance-none cursor-pointer focus:outline-none pr-10"
              >
                <option>Any</option>
                <option>New Construction</option>
                <option>1-5 years</option>
                <option>5-10 years</option>
                <option>10-20 years</option>
                <option>20+ years</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#293056]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Condo Includes */}
          <div className="mb-6">
            <label className="block font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] mb-3">Condo Includes</label>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <select
                  value={locker}
                  onChange={(e) => setLocker(e.target.value)}
                  className="w-full h-11 px-4 bg-white border border-[#293056] rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] appearance-none cursor-pointer focus:outline-none pr-10"
                >
                  <option value="Any">Locker (Any)</option>
                  <option value="Yes">Locker Included</option>
                  <option value="No">No Locker</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#293056]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 relative">
                <select
                  value={balcony}
                  onChange={(e) => setBalcony(e.target.value)}
                  className="w-full h-11 px-4 bg-white border border-[#293056] rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] appearance-none cursor-pointer focus:outline-none pr-10"
                >
                  <option value="Any">Balcony (Any)</option>
                  <option value="Yes">Balcony Included</option>
                  <option value="No">No Balcony</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#293056]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <label className="block font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] mb-3">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.map((amenity) => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 h-11 rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] transition-all shadow-[0px_3px_11px_rgba(0,0,0,0.02)] ${
                    amenities.includes(amenity)
                      ? 'bg-[#293056] text-white'
                      : 'bg-[#E9EAEB] text-[#293056] hover:bg-[#d1d3d6]'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords Search */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#293056] opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full h-11 pr-4 pl-10 bg-white border border-[#293056] rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] placeholder:text-[#293056] placeholder:opacity-60 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            className="h-11 px-4 bg-white border border-[#293056] rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] hover:bg-gray-200 transition-all cursor-pointer"
          >
            Reset filters
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="h-11 px-4 bg-white border border-[#293056] rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] text-[#293056] hover:bg-gray-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="h-11 px-4 bg-[#293056] rounded-lg font-normal text-sm leading-6 tracking-[-0.03em] text-white hover:bg-[#1a1b4b] transition-all cursor-pointer border-none"
            >
              See {totalCount > 0 ? totalCount.toLocaleString() : ''} properties
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FiltersModal;
