import { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import MainLayout from '@/Website/Global/MainLayout';

export default function UserProfile({ auth, mustVerifyEmail, status, website }) {
    const user = auth.user;
    const [photoPreview, setPhotoPreview] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const photoInput = useRef();

    // Profile Information Form
    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        photo: null,
    });

    // Password Update Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            profileForm.setData('photo', file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        profileForm.setData('photo', null);
        setPhotoPreview(null);
        if (photoInput.current) {
            photoInput.current.value = '';
        }
    };

    const submitProfile = (e) => {
        e.preventDefault();

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('name', profileForm.data.name);
        formData.append('email', profileForm.data.email);
        formData.append('phone', profileForm.data.phone || '');
        formData.append('bio', profileForm.data.bio || '');

        if (profileForm.data.photo) {
            formData.append('photo', profileForm.data.photo);
        }

        // Use router.post with FormData
        router.post(route('profile.update'), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                // Reset only the photo field
                setPhotoPreview(null);
                if (photoInput.current) {
                    photoInput.current.value = '';
                }
                profileForm.setData('photo', null);
            },
            onError: (errors) => {
                console.error('Profile update errors:', errors);
                profileForm.setErrors(errors);
            },
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();

        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
            onError: (errors) => {
                if (errors.current_password) {
                    passwordForm.reset('current_password');
                }
                if (errors.password) {
                    passwordForm.reset('password', 'password_confirmation');
                }
            },
        });
    };

    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const deleteAccount = () => {
        if (!deletePassword) {
            setDeleteError('Please enter your password to confirm deletion.');
            return;
        }

        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            router.delete(route('profile.destroy'), {
                data: { password: deletePassword },
                preserveScroll: true,
                onSuccess: () => window.location.href = '/',
                onError: (errors) => {
                    setDeleteError(errors.password || 'Failed to delete account.');
                    setDeletePassword('');
                },
            });
        }
    };

    const brandColors = website?.brand_colors || {
        primary: '#912018',
        secondary: '#293056'
    };

    return (
        <MainLayout auth={auth} website={website}>
            <Head title="Profile Settings" />

            {/* Main Content */}
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Tabs Navigation */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="border-b border-gray-200">
                            <nav className="flex">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`px-8 py-4 text-sm font-medium font-work-sans border-b-3 transition-all ${
                                        activeTab === 'profile'
                                            ? 'border-b-3 text-white'
                                            : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                    style={{
                                        borderBottomColor: activeTab === 'profile' ? brandColors.primary : 'transparent',
                                        borderBottomWidth: activeTab === 'profile' ? '3px' : '0',
                                        backgroundColor: activeTab === 'profile' ? brandColors.primary : 'transparent',
                                    }}
                                >
                                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profile Information
                                </button>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`px-8 py-4 text-sm font-medium font-work-sans border-b-3 transition-all ${
                                        activeTab === 'password'
                                            ? 'border-b-3 text-white'
                                            : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                    style={{
                                        borderBottomColor: activeTab === 'password' ? brandColors.primary : 'transparent',
                                        borderBottomWidth: activeTab === 'password' ? '3px' : '0',
                                        backgroundColor: activeTab === 'password' ? brandColors.primary : 'transparent',
                                    }}
                                >
                                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Security
                                </button>
                                <button
                                    onClick={() => setActiveTab('danger')}
                                    className={`px-8 py-4 text-sm font-medium font-work-sans border-b-3 transition-all ${
                                        activeTab === 'danger'
                                            ? 'border-b-3 text-white bg-red-600'
                                            : 'border-transparent text-gray-600 hover:text-red-600 hover:bg-red-50'
                                    }`}
                                    style={{
                                        borderBottomColor: activeTab === 'danger' ? '#dc2626' : 'transparent',
                                        borderBottomWidth: activeTab === 'danger' ? '3px' : '0',
                                    }}
                                >
                                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Danger Zone
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-8">
                            {/* Profile Information Tab */}
                            {activeTab === 'profile' && (
                                <form onSubmit={submitProfile} className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 font-space-grotesk mb-2">
                                            Profile Information
                                        </h2>
                                        <p className="text-gray-600 font-work-sans">
                                            Update your account's profile information and email address.
                                        </p>
                                    </div>

                                    {/* Profile Photo Section */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <label className="block text-sm font-medium text-gray-700 font-work-sans mb-4">
                                            Profile Photo
                                        </label>
                                        <div className="flex items-center space-x-6">
                                            {/* Current/Preview Photo */}
                                            <div className="relative">
                                                <div className="w-32 h-32 rounded-full bg-white p-1 shadow-xl">
                                                    {photoPreview || user.avatar ? (
                                                        <img
                                                            src={photoPreview || user.avatar}
                                                            alt={user.name}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#912018] to-[#d42f24] flex items-center justify-center">
                                                            <span className="text-4xl font-bold text-white font-space-grotesk">
                                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => photoInput.current?.click()}
                                                    className="absolute bottom-0 right-0 bg-white rounded-full p-2.5 shadow-lg hover:shadow-xl transition-shadow"
                                                    style={{ backgroundColor: brandColors.primary }}
                                                >
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                                <input
                                                    ref={photoInput}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handlePhotoChange}
                                                />
                                            </div>

                                            {/* Upload Instructions */}
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-600 font-work-sans mb-2">
                                                    {photoPreview ? 'New photo selected' : 'Click the camera icon to upload a new photo'}
                                                </p>
                                                <p className="text-xs text-gray-500 font-work-sans">
                                                    JPG, PNG or GIF. Max size 2MB.
                                                </p>
                                                {photoPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={removePhoto}
                                                        className="mt-3 text-red-600 hover:text-red-700 font-work-sans font-medium text-sm"
                                                    >
                                                        Remove new photo
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-work-sans mb-2">
                                                Name
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans"
                                                value={profileForm.data.name}
                                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                                required
                                            />
                                            <InputError className="mt-2" message={profileForm.errors.name} />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-work-sans mb-2">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans"
                                                value={profileForm.data.email}
                                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                                required
                                            />
                                            <InputError className="mt-2" message={profileForm.errors.email} />
                                        </div>

                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 font-work-sans mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                id="phone"
                                                type="tel"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans"
                                                value={profileForm.data.phone}
                                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                                                placeholder="+1 (555) 000-0000"
                                            />
                                            <InputError className="mt-2" message={profileForm.errors.phone} />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 font-work-sans mb-2">
                                                Bio
                                            </label>
                                            <textarea
                                                id="bio"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans"
                                                rows="4"
                                                value={profileForm.data.bio}
                                                onChange={(e) => profileForm.setData('bio', e.target.value)}
                                                placeholder="Tell us about yourself..."
                                            />
                                            <InputError className="mt-2" message={profileForm.errors.bio} />
                                        </div>
                                    </div>

                                    {mustVerifyEmail && user.email_verified_at === null && (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800 font-work-sans">
                                                Your email address is unverified.
                                                <button
                                                    type="button"
                                                    onClick={() => router.post(route('verification.send'))}
                                                    className="ml-2 text-yellow-600 underline hover:text-yellow-700 font-medium"
                                                >
                                                    Click here to re-send the verification email.
                                                </button>
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <button
                                            type="submit"
                                            disabled={profileForm.processing}
                                            className="px-6 py-3 text-white font-work-sans font-medium rounded-lg transition-all hover:shadow-lg disabled:opacity-50"
                                            style={{ backgroundColor: brandColors.primary }}
                                        >
                                            Save Changes
                                        </button>

                                        <Transition
                                            show={profileForm.recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-green-600 font-work-sans">Saved successfully.</p>
                                        </Transition>
                                    </div>
                                </form>
                            )}

                            {/* Password Tab */}
                            {activeTab === 'password' && (
                                <form onSubmit={submitPassword} className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 font-space-grotesk mb-2">
                                            Update Password
                                        </h2>
                                        <p className="text-gray-600 font-work-sans">
                                            Ensure your account is using a long, random password to stay secure.
                                        </p>
                                    </div>

                                    <div className="space-y-6 max-w-xl">
                                        <div>
                                            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 font-work-sans mb-2">
                                                Current Password
                                            </label>
                                            <input
                                                id="current_password"
                                                type="password"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans"
                                                value={passwordForm.data.current_password}
                                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            />
                                            <InputError className="mt-2" message={passwordForm.errors.current_password} />
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-work-sans mb-2">
                                                New Password
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans"
                                                value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                            />
                                            <InputError className="mt-2" message={passwordForm.errors.password} />
                                        </div>

                                        <div>
                                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 font-work-sans mb-2">
                                                Confirm Password
                                            </label>
                                            <input
                                                id="password_confirmation"
                                                type="password"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans"
                                                value={passwordForm.data.password_confirmation}
                                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                            />
                                            <InputError className="mt-2" message={passwordForm.errors.password_confirmation} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            type="submit"
                                            disabled={passwordForm.processing}
                                            className="px-6 py-3 text-white font-work-sans font-medium rounded-lg transition-all hover:shadow-lg disabled:opacity-50"
                                            style={{ backgroundColor: brandColors.primary }}
                                        >
                                            Update Password
                                        </button>

                                        <Transition
                                            show={passwordForm.recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-green-600 font-work-sans">Password updated successfully.</p>
                                        </Transition>
                                    </div>
                                </form>
                            )}

                            {/* Danger Zone Tab */}
                            {activeTab === 'danger' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 font-space-grotesk mb-2">
                                            Delete Account
                                        </h2>
                                        <p className="text-gray-600 font-work-sans">
                                            Once your account is deleted, all of its resources and data will be permanently deleted.
                                        </p>
                                    </div>

                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-2xl space-y-6">
                                        <div className="flex items-start space-x-3">
                                            <svg className="w-6 h-6 text-red-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <div>
                                                <h3 className="text-lg font-semibold text-red-800 font-space-grotesk mb-2">
                                                    This action is irreversible
                                                </h3>
                                                <p className="text-red-700 font-work-sans">
                                                    All your data including saved properties, searches, and preferences will be permanently removed.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label htmlFor="delete_password" className="block text-sm font-medium text-red-700 font-work-sans mb-2">
                                                    Enter your password to confirm
                                                </label>
                                                <input
                                                    id="delete_password"
                                                    type="password"
                                                    className="w-full max-w-sm px-4 py-3 rounded-lg border-2 border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-work-sans"
                                                    value={deletePassword}
                                                    onChange={(e) => {
                                                        setDeletePassword(e.target.value);
                                                        setDeleteError('');
                                                    }}
                                                    placeholder="Your current password"
                                                />
                                                {deleteError && (
                                                    <p className="mt-2 text-sm text-red-600 font-work-sans">{deleteError}</p>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={deleteAccount}
                                                className="px-6 py-3 bg-red-600 text-white font-work-sans font-medium rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={!deletePassword}
                                            >
                                                Delete My Account Permanently
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Success Message */}
                    {status && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 font-work-sans">{status}</p>
                        </div>
                    )}
                </div>
            </div>

        </MainLayout>
    );
}