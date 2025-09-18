import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import PropertyCardV6 from '@/Website/Global/Components/PropertyCards/PropertyCardV6';
import { Heart, Trash2 } from '@/Website/Components/Icons';

export default function UserFavourites({ auth, siteName, siteUrl, year }) {
  const [favourites, setFavourites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, price_high, price_low
  const [filterBy, setFilterBy] = useState('all'); // all, sale, rent, type

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/favourites/properties/with-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavourites(data.data || []);
      } else {
        setError('Failed to load favourites');
      }
    } catch (err) {
      console.error('Error fetching favourites:', err);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavourite = async (listingKey) => {
    try {
      const response = await fetch('/api/favourites/properties', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          property_listing_key: listingKey
        })
      });

      if (response.ok) {
        setFavourites(prev => prev.filter(fav => fav.property_listing_key !== listingKey));
        showNotification('Property removed from favourites', 'removed');
      } else {
        console.error('Failed to remove favourite');
      }
    } catch (err) {
      console.error('Error removing favourite:', err);
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${type === 'removed' ? '💔' : '❤️'}</span>
        <span>${message}</span>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'removed' ? '#6B7280' : '#DC2626'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  // Sort and filter favourites
  const processedFavourites = favourites
    .filter(fav => {
      if (filterBy === 'all') return true;
      if (filterBy === 'sale') return fav.property_data?.transactionType !== 'rent';
      if (filterBy === 'rent') return fav.property_data?.transactionType === 'rent';
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.favourited_at) - new Date(a.favourited_at);
        case 'oldest':
          return new Date(a.favourited_at) - new Date(b.favourited_at);
        case 'price_high':
          return (b.property_price || 0) - (a.property_price || 0);
        case 'price_low':
          return (a.property_price || 0) - (b.property_price || 0);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <MainLayout siteName={siteName} siteUrl={siteUrl} year={year}>
        <Head title={`My Favourites - ${siteName}`} />
        <div className='bg-[#293056] w-screen h-[85px] md:h-[120px] mb-10'>
          <Navbar auth={auth} />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-[#293056] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-[#293056] text-xl font-medium">Loading your favourites...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} auth={auth}>
      <Head title={`My Favourites - ${siteName}`} />
      
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#293056] mb-2">
              My Favourite Properties
            </h1>
            <p className="text-gray-600">
              {favourites.length} {favourites.length === 1 ? 'property' : 'properties'} saved
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter */}
            <select 
              value={filterBy} 
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#293056] focus:border-transparent"
            >
              <option value="all">All Properties</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
            
            {/* Sort */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#293056] focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_high">Price: High to Low</option>
              <option value="price_low">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <span>⚠️</span>
              <span className="font-medium">Error loading favourites</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <button 
              onClick={fetchFavourites}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && processedFavourites.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6">
              <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No favourite properties yet
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Start browsing properties and click the heart icon to save your favourites here.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="px-6 py-3 bg-[#293056] text-white rounded-lg font-medium hover:bg-[#1f2441] transition-colors"
              >
                Browse Properties
              </Link>
              <Link
                href="/sale"
                className="px-6 py-3 border border-[#293056] text-[#293056] rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Properties for Sale
              </Link>
            </div>
          </div>
        )}

        {/* Favourites Grid */}
        {processedFavourites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedFavourites.map((favourite) => {
              // Transform favourite data back to property format
              const propertyData = {
                ...favourite.property_data,
                listingKey: favourite.property_listing_key,
                address: favourite.property_address,
                price: favourite.property_price,
                propertyType: favourite.property_type,
                city: favourite.property_city,
                imageUrl: favourite.property_data?.images?.[0] || favourite.property_data?.imageUrl
              };

              return (
                <div key={favourite.id} className="relative group">
                  <PropertyCardV6
                    property={propertyData}
                    auth={auth}
                    size="default"
                  />
                  
                  {/* Quick Remove Button */}
                  <button
                    onClick={() => removeFavourite(favourite.property_listing_key)}
                    className="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 z-20 flex items-center justify-center"
                    aria-label="Remove from favourites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {/* Favourite Date Badge */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                    Saved {favourite.favourited_date}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back to browsing */}
        {processedFavourites.length > 0 && (
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-[#293056] mb-4">
              Continue Browsing
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="px-6 py-3 bg-[#293056] text-white rounded-lg font-medium hover:bg-[#1f2441] transition-colors"
              >
                Search Properties
              </Link>
              <Link
                href="/sale"
                className="px-6 py-3 border border-[#293056] text-[#293056] rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Browse for Sale
              </Link>
              <Link
                href="/rent"
                className="px-6 py-3 border border-[#293056] text-[#293056] rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Browse for Rent
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
