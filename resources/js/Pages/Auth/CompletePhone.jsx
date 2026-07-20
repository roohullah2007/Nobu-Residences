import { Head, useForm, usePage } from '@inertiajs/react';
import PhoneInput from '@/Components/PhoneInput';

/**
 * "Add your phone number" step shown right after a Google sign-in when the
 * account has no phone yet (Google provides none). Saving also completes
 * the lead's Follow Up Boss profile server-side.
 */
export default function CompletePhone({ redirect }) {
    const { globalWebsite, website } = usePage().props;
    const currentWebsite = globalWebsite || website || {};
    const websiteName = currentWebsite?.name || 'Our Site';
    const brandColors = currentWebsite?.brand_colors || {};
    const buttonPrimaryBg = brandColors.button_primary_bg || '#293056';
    const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';

    const { data, setData, post, processing, errors } = useForm({
        phone: '',
        redirect: redirect || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.complete-phone.store'));
    };

    return (
        <>
            <Head title={`Add your phone number - ${websiteName}`} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-white shadow-xl rounded-2xl p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-space-grotesk font-bold text-gray-900 mb-2">
                                One last step
                            </h2>
                            <p className="text-sm font-work-sans text-gray-600">
                                Add your phone number so our team can reach you about listings, tours and alerts.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-work-sans font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <PhoneInput
                                    id="phone"
                                    name="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg font-work-sans text-gray-900 placeholder-gray-400 transition-colors border-2 border-gray-300 focus:border-gray-300"
                                    placeholder="Enter your phone number"
                                    autoFocus
                                    required
                                />
                                {errors.phone && (
                                    <p className="mt-2 text-sm font-work-sans text-red-600">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 px-6 font-work-sans font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
                            >
                                {processing ? 'Saving...' : 'Save and continue'}
                            </button>
                        </form>
                    </div>

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
