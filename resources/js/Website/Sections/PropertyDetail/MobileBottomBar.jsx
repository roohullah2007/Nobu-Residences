import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Phone, Calendar, Close } from '@/Website/Components/Icons';

export default function MobileBottomBar() {
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};

  const buttonTertiaryBg = brandColors.button_tertiary_bg || '#000000';
  const buttonTertiaryText = brandColors.button_tertiary_text || '#FFFFFF';
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Viewing request submitted:', formData);
    setShowRequestModal(false);
    // Reset form
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <>
      {/* Mobile Request Viewing Button - Fixed at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex gap-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex-1 py-3 px-4 rounded-full font-work-sans font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
          >
            <Calendar className="w-4 h-4" />
            Request a viewing
          </button>
          <button className="flex-none bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-full font-work-sans font-bold text-sm hover:bg-gray-50 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Request Viewing Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Request a Viewing</h3>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Schedule a viewing for <span className="font-semibold text-gray-900">Property</span>
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any specific requirements or questions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
                >
                  Request Viewing
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
