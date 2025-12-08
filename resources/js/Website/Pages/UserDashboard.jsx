import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import UserFavouritesTab from '@/Website/Components/UserFavouritesTab';
import SavedSearchesTab from '@/Website/Components/SavedSearchesTab';

export default function UserDashboard({ auth, siteName, siteUrl, year, website }) {
  const { globalWebsite } = usePage().props;
  const effectiveWebsite = website || globalWebsite;

  const brandColors = effectiveWebsite?.brand_colors || {
    button_primary_bg: '#293056',
    button_primary_text: '#FFFFFF'
  };

  const buttonPrimaryBg = brandColors.button_primary_bg || '#293056';
  const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';

  const [activeTab, setActiveTab] = useState('saved');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [savedSearchesCount, setSavedSearchesCount] = useState(0);

  useEffect(() => {
    // Fetch favorites count
    fetch('/api/favourites/properties', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.favourites) {
        setFavoritesCount(data.favourites.length);
      }
    })
    .catch(error => console.error('Error fetching favorites count:', error));

    // Fetch saved searches count
    fetch('/api/saved-searches', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.data && Array.isArray(data.data)) {
        setSavedSearchesCount(data.data.length);
      }
    })
    .catch(error => console.error('Error fetching saved searches count:', error));
  }, []);

  // Sample alerts
  const alerts = [
    {
      id: 1,
      title: "New listings in King West",
      description: "3 new properties match your saved search for 2+ bedroom condos",
      time: "2 hours ago",
      type: "new_listings"
    },
    {
      id: 2,
      title: "Price drop alert",
      description: "408 - 155 Dalhousie Street reduced price by $39,000",
      time: "1 day ago",
      type: "price_drop"
    },
    {
      id: 3,
      title: "Market update",
      description: "Downtown Toronto market report for December 2024 is now available",
      time: "3 days ago",
      type: "market_update"
    }
  ];

  const handleLogout = () => {
    router.post('/logout', {}, {
      onSuccess: () => {
        router.get('/');
      }
    });
  };

  const removeSavedProperty = (propertyId) => {
    // Handle removing saved property
    console.log('Removing property:', propertyId);
  };

  const runSearch = (searchQuery) => {
    // Handle running a saved search
    console.log('Running search:', searchQuery);
  };

  const tabs = [
    { id: 'saved', label: 'Saved Properties', count: favoritesCount },
    { id: 'searches', label: 'Recent Searches', count: savedSearchesCount },
    { id: 'alerts', label: 'Alerts', count: alerts.length },
    { id: 'profile', label: 'Profile', count: null }
  ];

  return (
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} auth={auth} website={website}>
      <Head title={`My Account - ${siteName}`} />

      <div className="max-w-[1280px] mx-auto px-4 md:px-0 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-space-grotesk font-bold text-[#293056] mb-2">
              Welcome back, {auth.user.name}
            </h1>
            <p className="text-gray-600">
              Manage your saved properties, searches, and account preferences
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? ''
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
                style={activeTab === tab.id ? { borderColor: buttonPrimaryBg, color: buttonPrimaryBg } : {}}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Saved Properties Tab */}
          {activeTab === 'saved' && <UserFavouritesTab onCountUpdate={setFavoritesCount} />}

          {/* Recent Searches Tab */}
          {activeTab === 'searches' && <SavedSearchesTab onCountUpdate={setSavedSearchesCount} />}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div>
              <h2 className="text-xl font-space-grotesk font-bold text-[#293056] mb-6">
                Alerts & Notifications
              </h2>

              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {alert.type === 'new_listings' && (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            </svg>
                          </div>
                        )}
                        {alert.type === 'price_drop' && (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                              <path d="M7 13l3 3 7-7"></path>
                            </svg>
                          </div>
                        )}
                        {alert.type === 'market_update' && (
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                              <path d="M9 19c-5 0-8-3-8-8s4-8 9-8 8 3 8 8-4 8-8 8z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{alert.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-space-grotesk font-bold text-[#293056] mb-6">
                Profile Settings
              </h2>

              <div className="max-w-2xl">
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={auth.user.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={auth.user.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#293056] focus:ring-[#293056]" />
                      <span className="ml-2 text-sm text-gray-700">Email alerts for new listings</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#293056] focus:ring-[#293056]" />
                      <span className="ml-2 text-sm text-gray-700">Price drop notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-[#293056] focus:ring-[#293056]" />
                      <span className="ml-2 text-sm text-gray-700">Weekly market reports</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all" style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}>
                    Save Changes
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Cancel
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