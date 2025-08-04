import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';

// Icons
const Lock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" />
  </svg>
);

const CreditCard = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const Phone = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const Mail = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function AgentPropertyDetail({ property, canPurchaseContact }) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    buyer_name: '',
    buyer_email: '',
    payment_method: 'stripe'
  });
  const [loading, setLoading] = useState(false);

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(route('agent.properties.purchase-contact', property.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify(purchaseForm),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the page to show the updated property details
        router.reload();
      } else {
        alert(data.message || 'Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <MainLayout>
      <Head title={`${property.title} - Property Details`} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Property Header */}
        <div className="bg-white border-b">
          <div className="max-w-[1280px] mx-auto px-5 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-5">
              <div className="flex-1">
                <h1 className="font-space-grotesk font-bold text-3xl md:text-4xl text-[#293056] mb-3">
                  {property.title}
                </h1>
                
                {/* Address with lock indicator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="font-work-sans text-lg text-[#293056]">
                    {property.address}
                  </div>
                  {!property.has_contact_access && (
                    <div className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                      <Lock className="w-4 h-4" />
                      <span>Exact Address Hidden</span>
                    </div>
                  )}
                </div>

                {/* Show full address only if user has access */}
                {property.has_contact_access && property.full_address && property.full_address !== property.address && (
                  <div className="text-gray-600 mb-4">
                    <strong>Complete Address:</strong> {property.full_address}
                  </div>
                )}

                {/* Postal Code with masking indicator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-gray-600">
                    Postal Code: <span className="font-medium">{property.postal_code}</span>
                  </div>
                  {!property.has_contact_access && (
                    <div className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                      Partial
                    </div>
                  )}
                </div>

                {!property.has_contact_access && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900 mb-1">
                          Address Protection Active
                        </div>
                        <div className="text-sm text-blue-700">
                          The exact street address is hidden for privacy. Location shown is approximate (±1km). Purchase contact access to view the precise address and coordinates.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-[#93370D] mb-2">
                  ${property.price?.toLocaleString()}
                </div>
                {canPurchaseContact && (
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="bg-[#93370D] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#7A2A09] transition-colors flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Get Contact Info (${property.contact_price})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1280px] mx-auto px-5 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images and Details */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              {property.images && property.images.length > 0 && (
                <div className="mb-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.images.slice(0, 6).map((image, index) => (
                      <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Property image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Property Details */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-600 text-sm">Type</div>
                    <div className="font-medium">{property.property_type}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Bedrooms</div>
                    <div className="font-medium">{property.bedrooms}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Bathrooms</div>
                    <div className="font-medium">{property.bathrooms}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Area</div>
                    <div className="font-medium">{property.area} sqft</div>
                  </div>
                  {property.parking > 0 && (
                    <div>
                      <div className="text-gray-600 text-sm">Parking</div>
                      <div className="font-medium">{property.parking}</div>
                    </div>
                  )}
                  {property.maintenance_fees && (
                    <div>
                      <div className="text-gray-600 text-sm">Maintenance</div>
                      <div className="font-medium">${property.maintenance_fees}</div>
                    </div>
                  )}
                  {property.property_taxes && (
                    <div>
                      <div className="text-gray-600 text-sm">Property Tax</div>
                      <div className="font-medium">${property.property_taxes}</div>
                    </div>
                  )}
                  {property.exposure && (
                    <div>
                      <div className="text-gray-600 text-sm">Exposure</div>
                      <div className="font-medium">{property.exposure}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>

            {/* Agent Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-bold mb-4">Agent Information</h3>
                
                <div className="flex items-center gap-3 mb-4">
                  {property.agent.photo ? (
                    <img 
                      src={property.agent.photo} 
                      alt={property.agent.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {property.agent.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{property.agent.name}</div>
                    <div className="text-sm text-gray-600">Real Estate Agent</div>
                  </div>
                </div>

                {property.has_contact_access ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <div className="font-medium">{property.agent.phone}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium">{property.agent.email}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-700 text-center">
                        ✓ Contact information unlocked!
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="p-4 bg-orange-50 rounded-lg mb-4">
                      <Lock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-sm text-orange-700">
                        Contact information is protected. Purchase access to view agent's phone and email.
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="w-full bg-[#93370D] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#7A2A09] transition-colors flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Purchase Contact (${property.contact_price})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Purchase Contact Information</h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Property</div>
                <div className="font-medium">{property.title}</div>
                <div className="text-sm text-gray-600 mt-1">Agent: {property.agent.name}</div>
                <div className="text-lg font-bold text-[#93370D] mt-2">
                  ${property.contact_price}
                </div>
              </div>

              <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="buyer_name"
                    value={purchaseForm.buyer_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="buyer_email"
                    value={purchaseForm.buyer_email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    name="payment_method"
                    value={purchaseForm.payment_method}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
                  >
                    <option value="stripe">Credit Card (Stripe)</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPurchaseModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#93370D] text-white py-2 px-4 rounded-md font-medium hover:bg-[#7A2A09] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
