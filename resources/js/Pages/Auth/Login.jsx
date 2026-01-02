import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import GoogleLoginButton from '@/Components/GoogleLoginButton';

export default function Login({ status, canResetPassword }) {
    const { globalWebsite, website, googleOAuthEnabled } = usePage().props;
    const currentWebsite = globalWebsite || website || {};
    const websiteName = currentWebsite?.name || 'Our Site';
    const brandColors = globalWebsite?.brand_colors || website?.brand_colors || {};
    const buttonPrimaryBg = brandColors.button_primary_bg || '#293056';
    const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title={`Login - ${websiteName}`} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                {/* Login Card */}
                <div className="relative z-10 w-full max-w-md">
                    {/* Login Form Card */}
                    <div className="bg-white shadow-xl rounded-2xl p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-space-grotesk font-bold text-gray-900 mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-sm font-work-sans text-gray-600">
                                Sign in to access your account
                            </p>
                        </div>

                        {status && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-work-sans text-green-600">
                                    {status}
                                </p>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-work-sans font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg font-work-sans text-gray-900 placeholder-gray-400 transition-colors border-2 border-gray-300 focus:border-gray-300"
                                    placeholder="Enter your email"
                                    autoComplete="username"
                                    autoFocus
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm font-work-sans text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-work-sans font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg font-work-sans text-gray-900 placeholder-gray-400 transition-colors pr-12 border-2 border-gray-300 focus:border-gray-300"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm font-work-sans text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 text-[#293056] border-gray-300 rounded focus:ring-[#293056] focus:ring-2"
                                    />
                                    <span className="ml-2 text-sm font-work-sans text-gray-600">
                                        Remember me
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-work-sans text-[#293056] hover:text-[#1f2441] transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 px-6 font-work-sans font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
                            >
                                {processing ? 'Signing in...' : 'Sign In'}
                            </button>

                            {/* OR Divider and Google Login - Only show when OAuth is configured */}
                            {googleOAuthEnabled && (
                                <>
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500 font-work-sans">Or continue with</span>
                                        </div>
                                    </div>

                                    {/* Google Login Button */}
                                    <GoogleLoginButton />
                                </>
                            )}

                            {/* Register Link */}
                            <div className="text-center pt-4 border-t border-gray-100">
                                <p className="text-sm font-work-sans text-gray-600">
                                    Don't have an account?{' '}
                                    <Link
                                        href={route('register')}
                                        className="text-[#293056] font-semibold hover:text-[#1f2441] transition-colors"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs font-work-sans text-gray-500">
                            © {new Date().getFullYear()} {websiteName}. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}