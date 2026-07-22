import React, { useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import PhoneInput from '@/Components/PhoneInput';

const DAYS_TO_SHOW = 14;
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'];
const VIEWING_TYPES = [
  { id: 'in-person', label: 'In-Person' },
  { id: 'virtual', label: 'Virtual Tour' },
];

/**
 * Global Viewing Request Modal.
 *
 * Layout per the client's reference: In-Person / Virtual Tour toggle, a
 * horizontal strip of the next days, Morning/Afternoon/Evening slots, the
 * contact fields, a consent checkbox, and submit. Posts to the existing
 * /api/tour-requests endpoint (admin "Tour Requests" page lists them).
 */
const ViewingRequestModal = ({ isOpen, onClose, property }) => {
  const { globalWebsite, website, siteName, auth } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const siteDisplayName = currentWebsite?.name || siteName || 'our team';

  const buttonTertiaryBg = brandColors.button_tertiary_bg || '#000000';
  const buttonTertiaryText = brandColors.button_tertiary_text || '#FFFFFF';

  // The next N days for the date strip; computed once per mount.
  const dateOptions = useMemo(() => {
    const days = [];
    const start = new Date();
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push({
        iso: date.toISOString().split('T')[0],
        dow: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      });
    }
    return days;
  }, []);

  const [viewingType, setViewingType] = useState('in-person');
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.iso || '');
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  // Pre-fill from the signed-in visitor so they don't retype their details.
  const initialFormData = {
    name: auth?.user?.name || '',
    email: auth?.user?.email || '',
    phone: auth?.user?.phone || '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [hasConsented, setHasConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const typeLabel = VIEWING_TYPES.find((t) => t.id === viewingType)?.label || 'In-Person';
      const response = await fetch('/api/tour-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Viewing type: ${typeLabel}`,
          property_id: property?.listingKey || property?.ListingKey || null,
          property_type: property?.propertyType || property?.PropertyType || 'property',
          property_address: property?.address || property?.UnparsedAddress || null,
          selected_date: selectedDate,
          selected_time: selectedTime,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Request failed');
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData(initialFormData);
        setHasConsented(false);
        onClose();
      }, 2500);
    } catch (error) {
      console.error('Error submitting viewing request:', error);
      setSubmitError('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const propertyAddress = property?.address || property?.UnparsedAddress || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999999] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[92dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative text-center px-6 pt-5 pb-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-[#293056]">Request a Viewing</h3>
          {propertyAddress && (
            <p className="text-gray-500 text-sm mt-1">{propertyAddress}</p>
          )}
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {/* In-Person / Virtual Tour toggle */}
          <div className="grid grid-cols-2 rounded-lg overflow-hidden border border-gray-300 mb-4">
            {VIEWING_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setViewingType(type.id)}
                className={`h-11 text-sm font-semibold transition-colors ${
                  viewingType === type.id ? 'text-white' : 'bg-white text-[#293056] hover:bg-gray-50'
                }`}
                style={viewingType === type.id ? { backgroundColor: '#293056' } : undefined}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Date and time */}
          <p className="text-center text-sm text-gray-600 mb-3">Select a Date and Time</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x mb-3 pb-1">
            {dateOptions.map((date) => (
              <button
                key={date.iso}
                type="button"
                onClick={() => setSelectedDate(date.iso)}
                className={`flex-shrink-0 snap-start w-[64px] py-2 rounded-lg border text-center transition-colors ${
                  selectedDate === date.iso
                    ? 'border-[#293056] bg-[#F5F8FF]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="block text-[10px] font-semibold text-gray-500">{date.dow}</span>
                <span className="block text-lg font-bold text-[#293056] leading-6">{date.day}</span>
                <span className="block text-[10px] font-semibold text-gray-500">{date.month}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
                  selectedTime === slot
                    ? 'border-[#293056] bg-[#F5F8FF] text-[#293056]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          {/* Contact fields */}
          <div className="space-y-3 mb-4">
            <div>
              <label htmlFor="viewing-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="viewing-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="viewing-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="viewing-email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="viewing-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <PhoneInput
                id="viewing-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>

          {/* Consent */}
          <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 w-4 h-4 flex-shrink-0"
            />
            <span className="text-xs text-gray-600 leading-5">
              I agree to be contacted by {siteDisplayName} via call, email, and text for real
              estate services. To opt out, you can reply 'stop' at any time or click the
              unsubscribe link in the emails. Message and data rates may apply.{' '}
              <a href="/privacy" className="underline text-[#293056]">Privacy Policy</a>.
            </span>
          </label>

          {/* Feedback */}
          {submitError && (
            <p className="text-red-600 text-sm mb-3" role="alert">{submitError}</p>
          )}
          {showSuccess && (
            <p className="text-green-700 text-sm mb-3 bg-green-50 border border-green-200 rounded-md p-2" role="status">
              Viewing request submitted successfully! We'll contact you soon.
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || showSuccess || !hasConsented}
            className="w-full py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
          >
            {isSubmitting ? 'Submitting...' : 'Request a Viewing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ViewingRequestModal;
