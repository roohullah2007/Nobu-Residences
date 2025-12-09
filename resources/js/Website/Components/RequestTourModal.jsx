import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

const RequestTourModal = ({ isOpen, onClose, property, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    tourType: 'in-person' // 'in-person' or 'virtual'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get website and brand colors
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};

  const buttonTertiaryBg = brandColors.button_tertiary_bg || '#000000';
  const buttonTertiaryText = brandColors.button_tertiary_text || '#FFFFFF';

  // Get button colors with fallbacks
  const buttonSecondaryBg = brandColors.button_secondary_bg || '#912018';
  const buttonSecondaryText = brandColors.button_secondary_text || '#FFFFFF';
  const buttonQuaternaryBg = brandColors.button_quaternary_bg || '#FFFFFF';
  const buttonQuaternaryText = brandColors.button_quaternary_text || '#293056';

  // Cleanup effect to ensure scrolling is re-enabled
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the request to your backend
      const response = await fetch('/api/request-tour', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify({
          ...formData,
          propertyId: property?.id || property?.listingKey,
          propertyAddress: property?.address
        })
      });

      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          preferredDate: '',
          preferredTime: '',
          message: '',
          tourType: 'in-person'
        });
        // Show success in modal, then close after delay
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          // Call onSuccess callback if provided (for parent components)
          if (onSuccess) {
            onSuccess();
          }
        }, 2500);
      } else {
        alert('Failed to submit tour request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting tour request:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-hidden">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
          {/* Modal Header - Fixed */}
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Request a Tour</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {property && (
              <p className="mt-2 text-sm text-gray-600">
                {property.address}
              </p>
            )}
          </div>

          {/* Modal Body - Scrollable if needed */}
          {showSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tour Request Submitted!</h3>
              <p className="text-gray-600 text-center">We'll contact you soon to confirm your tour.</p>
            </div>
          ) : (
          <form id="tour-request-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
            <div>
              {/* Tour Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tour Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tourType"
                      value="in-person"
                      checked={formData.tourType === 'in-person'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm">In-Person</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tourType"
                      value="virtual"
                      checked={formData.tourType === 'virtual'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Virtual</span>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': buttonSecondaryBg }}
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': buttonSecondaryBg }}
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': buttonSecondaryBg }}
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Preferred Date */}
              <div className="mb-4">
                <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': buttonSecondaryBg }}
                />
              </div>

              {/* Preferred Time */}
              <div className="mb-4">
                <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': buttonSecondaryBg }}
                >
                  <option value="">Select a time</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 8 PM)</option>
                </select>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': buttonSecondaryBg }}
                  placeholder="Any specific questions or requirements?"
                />
              </div>
            </div>
          </form>
          )}

          {/* Modal Footer - Fixed - Only show when not showing success */}
          {!showSuccess && (
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:opacity-80 transition-all"
              style={{ backgroundColor: buttonQuaternaryBg, color: buttonQuaternaryText, borderColor: buttonQuaternaryText }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="tour-request-form"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
            >
              {isSubmitting ? 'Submitting...' : 'Request Tour'}
            </button>
          </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RequestTourModal;