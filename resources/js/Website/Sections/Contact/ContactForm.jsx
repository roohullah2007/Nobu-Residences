import React, { useState } from 'react';

export default function ContactForm({ website }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiry_type: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiry_type: 'general'
        });
      } else {
        setErrorMessage(result.message || 'Something went wrong. Please try again.');
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setErrorMessage('Failed to submit form. Please check your connection and try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const brandColors = website?.brand_colors || {
    primary: '#912018',
    secondary: '#1d957d',
    accent: '#F5F8FF',
    text: '#000000',
    background: '#FFFFFF',
    button_primary_bg: '#912018',
    button_primary_text: '#FFFFFF'
  };

  // Get button colors with fallbacks - use secondary color for buttons
  const buttonSecondaryBg = brandColors.button_secondary_bg || brandColors.secondary;
  const buttonSecondaryText = brandColors.button_secondary_text || '#FFFFFF';

  if (submitStatus === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="font-space-grotesk font-bold text-xl mb-4" style={{ color: brandColors.primary }}>
            Message Sent Successfully!
          </h3>
          <p className="font-work-sans text-gray-600 mb-6">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => setSubmitStatus(null)}
            className="px-6 py-3 rounded-full font-work-sans font-medium hover:opacity-90 transition-colors"
            style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }}
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="font-space-grotesk font-bold text-2xl mb-6" style={{ color: brandColors.primary }}>
        Send us a Message
      </h2>

      {/* Error Message */}
      {submitStatus === 'error' && errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-work-sans text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Inquiry Type */}
        <div>
          <label className="block font-work-sans font-medium text-gray-700 mb-2">
            What can we help you with?
          </label>
          <select
            name="inquiry_type"
            value={formData.inquiry_type}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors"
            style={{ '--tw-ring-color': brandColors.primary }}
            required
          >
            <option value="general">General Inquiry</option>
            <option value="viewing">Property Viewing</option>
            <option value="rental">Rental Information</option>
            <option value="purchase">Purchase Information</option>
            <option value="support">Technical Support</option>
          </select>
        </div>

        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-work-sans font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': brandColors.primary }}
              required
            />
          </div>
          
          <div>
            <label className="block font-work-sans font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': brandColors.primary }}
              required
            />
          </div>
        </div>

        {/* Phone and Subject Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-work-sans font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': brandColors.primary }}
            />
          </div>
          
          <div>
            <label className="block font-work-sans font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': brandColors.primary }}
              required
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block font-work-sans font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors resize-none"
            style={{ '--tw-ring-color': brandColors.primary }}
            placeholder="Please provide details about your inquiry..."
            required
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-full font-work-sans font-bold text-lg transition-all duration-300 disabled:opacity-70 hover:opacity-90"
          style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Sending Message...
            </div>
          ) : (
            'Send Message'
          )}
        </button>

      </form>
    </div>
  );
}
