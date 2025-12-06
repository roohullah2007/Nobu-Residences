import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function DevelopersIndex({ developers }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDeveloper, setEditingDeveloper] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [logoPreview, setLogoPreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'developer',
        email: '',
        phone: '',
        logo: null
    });

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('type', data.type);
        formData.append('email', data.email || '');
        formData.append('phone', data.phone || '');
        if (data.logo) {
            formData.append('logo', data.logo);
        }

        router.post(route('admin.developers.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
                setLogoPreview(null);
            }
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('type', data.type);
        formData.append('email', data.email || '');
        formData.append('phone', data.phone || '');
        formData.append('_method', 'PUT');
        if (data.logo) {
            formData.append('logo', data.logo);
        }

        router.post(route('admin.developers.update', editingDeveloper.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowEditModal(false);
                setEditingDeveloper(null);
                setLogoPreview(null);
            }
        });
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            router.delete(route('admin.developers.destroy', id));
        }
    };

    const openEditModal = (developer) => {
        setEditingDeveloper(developer);
        setData({
            name: developer.name,
            type: developer.type,
            email: developer.email || '',
            phone: developer.phone || '',
            logo: null
        });
        setLogoPreview(developer.logo ? `/storage/${developer.logo}` : null);
        setShowEditModal(true);
    };

    const openCreateModal = () => {
        reset();
        setLogoPreview(null);
        setShowCreateModal(true);
    };

    const developersList = developers.data || developers;
    const filteredDevelopers = developersList.filter(dev =>
        dev.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeBadge = (type) => {
        const types = {
            builder: { label: 'Builder', class: 'bg-[#dbeafe] text-[#1e40af]' },
            developer: { label: 'Developer', class: 'bg-[#f0fdf4] text-[#16a34a]' },
            builder_developer: { label: 'Builder & Developer', class: 'bg-[#fef3c7] text-[#92400e]' }
        };
        const config = types[type] || types.developer;
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.class}`}>
                {config.label}
            </span>
        );
    };

    return (
        <AdminLayout title="Developers">
            <Head title="Developers" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[#0f172a]">Developers</h1>
                        <p className="text-sm text-[#64748b] mt-1">
                            Manage building developers and builders
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Developer
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{developersList.length}</p>
                                <p className="text-sm text-[#64748b]">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">
                                    {developersList.filter(d => d.type === 'developer').length}
                                </p>
                                <p className="text-sm text-[#64748b]">Developers</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#dbeafe] flex items-center justify-center text-[#1e40af]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">
                                    {developersList.filter(d => d.type === 'builder' || d.type === 'builder_developer').length}
                                </p>
                                <p className="text-sm text-[#64748b]">Builders</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search developers..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Developers Table */}
                <div className="bg-white rounded-lg border border-[#e2e8f0]">
                    {filteredDevelopers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#e2e8f0]">
                                <thead className="bg-[#f8fafc]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Developer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#e2e8f0]">
                                    {filteredDevelopers.map((developer) => (
                                        <tr key={developer.id} className="hover:bg-[#f8fafc] transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {developer.logo ? (
                                                        <img
                                                            src={`/storage/${developer.logo}`}
                                                            alt={developer.name}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center">
                                                            <span className="text-sm font-semibold text-white">
                                                                {developer.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium text-[#0f172a]">
                                                        {developer.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {getTypeBadge(developer.type)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-[#0f172a]">
                                                    {developer.email || '-'}
                                                </div>
                                                <div className="text-xs text-[#94a3b8]">
                                                    {developer.phone || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(developer)}
                                                        className="px-3 py-1.5 text-xs font-medium text-[#64748b] bg-[#f1f5f9] rounded-md hover:bg-[#e2e8f0] transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(developer.id, developer.name)}
                                                        className="px-3 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-[#0f172a]">No developers found</p>
                            <p className="text-xs text-[#94a3b8] mt-1">Add your first developer to get started</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {developers.links && developers.last_page > 1 && (
                        <div className="px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-between">
                            <p className="text-sm text-[#64748b]">
                                Showing {developers.from || 0} to {developers.to || 0} of {developers.total || 0}
                            </p>
                            <nav className="flex items-center gap-1">
                                {developers.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                            link.active
                                                ? 'bg-[#0f172a] text-white'
                                                : link.url
                                                ? 'text-[#64748b] hover:bg-[#f1f5f9]'
                                                : 'text-[#cbd5e1] cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Add Developer</h2>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                                        Name <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-[#dc2626] mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                                        Type <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        required
                                    >
                                        <option value="developer">Developer</option>
                                        <option value="builder">Builder</option>
                                        <option value="builder_developer">Builder & Developer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Logo</label>
                                    <input
                                        type="file"
                                        className="w-full text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#f1f5f9] file:text-[#0f172a] file:font-medium hover:file:bg-[#e2e8f0]"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                    {logoPreview && (
                                        <div className="mt-3 p-3 bg-[#f8fafc] rounded-lg">
                                            <p className="text-xs text-[#64748b] mb-2">Preview:</p>
                                            <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-contain" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateModal(false); setLogoPreview(null); reset(); }}
                                    className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Edit Developer</h2>
                        <form onSubmit={handleEdit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                                        Name <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                                        Type <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        required
                                    >
                                        <option value="developer">Developer</option>
                                        <option value="builder">Builder</option>
                                        <option value="builder_developer">Builder & Developer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Logo</label>
                                    <input
                                        type="file"
                                        className="w-full text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#f1f5f9] file:text-[#0f172a] file:font-medium hover:file:bg-[#e2e8f0]"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                    {logoPreview && (
                                        <div className="mt-3 p-3 bg-[#f8fafc] rounded-lg">
                                            <p className="text-xs text-[#64748b] mb-2">Current/Preview:</p>
                                            <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-contain" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setEditingDeveloper(null); setLogoPreview(null); reset(); }}
                                    className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
