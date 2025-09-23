import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import GoogleLoginButton from '@/Components/GoogleLoginButton';

const LoginModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('register');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  // Reset form when modal opens/closes or tab changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: '',
        confirmPassword: ''
      });
      setForgotPasswordEmail('');
      setErrors({});
      setForgotPasswordSuccess(false);
      setShowForgotPassword(false);
    }
  }, [isOpen, activeTab]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Registration specific validations
    if (activeTab === 'register') {
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = 'Full name must be at least 2 characters';
      }

      if (!formData.phone || formData.phone.trim().length < 10) {
        newErrors.phone = 'Phone number must be at least 10 digits';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear any previous errors

    if (activeTab === 'login') {
      // Handle login
      router.post('/login', {
        email: formData.email,
        password: formData.password,
      }, {
        onSuccess: (page) => {
          onClose();
          // Laravel will handle the redirect automatically
        },
        onError: (errors) => {
          // Handle Laravel validation errors
          const formattedErrors = {};
          Object.keys(errors).forEach(key => {
            if (Array.isArray(errors[key])) {
              formattedErrors[key] = errors[key][0]; // Take first error message
            } else {
              formattedErrors[key] = errors[key];
            }
          });
          setErrors(formattedErrors);
          setIsLoading(false);
        },
        onFinish: () => {
          setIsLoading(false);
        }
      });
    } else {
      // Handle registration
      router.post('/register', {
        name: formData.name.trim(),
        email: formData.email,
        phone: formData.phone.trim(),
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      }, {
        onSuccess: (page) => {
          onClose();
          // Laravel will handle the redirect automatically
        },
        onError: (errors) => {
          // Handle Laravel validation errors
          const formattedErrors = {};
          Object.keys(errors).forEach(key => {
            if (Array.isArray(errors[key])) {
              formattedErrors[key] = errors[key][0]; // Take first error message
            } else {
              formattedErrors[key] = errors[key];
            }
          });
          setErrors(formattedErrors);
          setIsLoading(false);
        },
        onFinish: () => {
          setIsLoading(false);
        }
      });
    }
  };

  // Handle forgot password submission
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setErrors({ email: 'Email is invalid' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    router.post('/forgot-password', {
      email: forgotPasswordEmail,
    }, {
      onSuccess: () => {
        setForgotPasswordSuccess(true);
        setIsLoading(false);
      },
      onError: (errors) => {
        setErrors(errors);
        setIsLoading(false);
      },
      onFinish: () => {
        setIsLoading(false);
      }
    });
  };

  // Close modal when clicking outside
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleModalClick}
    >
      <div className="bg-white rounded-xl max-w-md w-full mx-4 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="p-6">
          {/* Modal Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-space-grotesk font-bold text-[#293056] mb-2">
              {showForgotPassword ? 'Reset Password' : 'Welcome to X Houses'}
            </h2>
            <p className="text-gray-600 text-sm">
              {showForgotPassword
                ? 'Enter your email address and we\'ll send you a link to reset your password'
                : activeTab === 'login' 
                  ? 'Sign in to access your account and saved properties' 
                  : 'Create an account to save properties and get personalized recommendations'
              }
            </p>
          </div>

          {/* Tab Navigation */}
          {!showForgotPassword && (
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'login'
                    ? 'bg-white text-[#293056] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'register'
                    ? 'bg-white text-[#293056] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Form */}
          {showForgotPassword ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              {forgotPasswordSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                      <path d="m9 12 2 2 4-4"></path>
                      <circle cx="12" cy="12" r="9"></circle>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Email Sent!</h3>
                  <p className="text-gray-600 mb-6">
                    We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordSuccess(false);
                      setForgotPasswordEmail('');
                    }}
                    className="text-[#293056] hover:text-[#1e2142] font-medium"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="forgotEmail"
                      value={forgotPasswordEmail}
                      onChange={(e) => {
                        setForgotPasswordEmail(e.target.value);
                        if (errors.email) {
                          setErrors(prev => ({ ...prev, email: null }));
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#293056] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#1e2142] focus:outline-none focus:ring-2 focus:ring-[#293056] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending Reset Link...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="text-sm text-[#293056] hover:text-[#1e2142] transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            /* Login/Register Form */
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration fields in grid layout */}
            {activeTab === 'register' && (
              <>
                {/* First row: Name and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Name Field */}
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
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone Field */}
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
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Email Field - Full width */}
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
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Second row: Password and Confirm Password */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your password"
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Login fields - keep as is */}
            {activeTab === 'login' && (
              <>
                {/* Email Field */}
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
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#293056] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#1e2142] focus:outline-none focus:ring-2 focus:ring-[#293056] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {activeTab === 'login' ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                activeTab === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
          )}
          
          {/* OR Divider and Google Login - Only show when not in forgot password mode */}
          {!showForgotPassword && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Login Button */}
              <GoogleLoginButton 
                text={activeTab === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                className="w-full"
              />
            </>
          )}

          {/* Forgot Password Link (Login only) */}
          {activeTab === 'login' && !showForgotPassword && (
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm text-[#293056] hover:text-[#1e2142] transition-colors"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginModal;