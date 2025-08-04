import { Head, Link, usePage, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';

export default function Index({ auth }) {
    const { icons, title } = usePage().props;
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingIcon, setEditingIcon] = useState(null);

    // Create form
    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
        name: '',
        category: 'key_facts',
        svg_content: '',
        icon_url: '',
        description: '',
    });

    // Edit form
    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors } = useForm({
        name: '',
        category: '',
        svg_content: '',
        icon_url: '',
        description: '',
        is_active: true,
    });

    // Group icons by category
    const iconsByCategory = icons ? icons.reduce((acc, icon) => {
        if (!acc[icon.category]) {
            acc[icon.category] = [];
        }
        acc[icon.category].push(icon);
        return acc;
    }, {}) : {};

    const categories = ['all', ...Object.keys(iconsByCategory)];

    const filteredIcons = selectedCategory === 'all' 
        ? icons || []
        : iconsByCategory[selectedCategory] || [];

    const categoryOptions = [
        { value: 'key_facts', label: 'Key Facts' },
        { value: 'amenities', label: 'Amenities' },
        { value: 'highlights', label: 'Highlights' },
        { value: 'contact', label: 'Contact' },
        { value: 'general', label: 'General' },
    ];

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createPost(route('admin.icons.api.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
            }
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editPut(route('admin.icons.update', editingIcon.id), {
            onSuccess: () => {
                setEditingIcon(null);
            }
        });
    };

    const startEdit = (icon) => {
        setEditingIcon(icon);
        setEditData({
            name: icon.name,
            category: icon.category,
            svg_content: icon.svg_content || '',
            icon_url: icon.icon_url || '',
            description: icon.description || '',
            is_active: icon.is_active,
        });
    };

    const handleDelete = (icon) => {
        if (confirm(`Are you sure you want to delete the "${icon.name}" icon?`)) {
            // Handle delete via form submission
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = route('admin.icons.destroy', icon.id);
            
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'DELETE';
            form.appendChild(methodInput);
            
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            form.appendChild(tokenInput);
            
            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <AdminLayout title={title}>
            <Head title={title} />

            <div className="space-y-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                Icon Management
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700"
                            >
                                <span className="mr-2">+</span>
                                Add New Icon
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedCategory === category
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {category === 'all' ? 'All Icons' : category.replace('_', ' ').toUpperCase()}
                                        {category !== 'all' && iconsByCategory[category] && (
                                            <span className="ml-2 bg-gray-300 text-gray-600 px-2 py-1 rounded-full text-xs">
                                                {iconsByCategory[category].length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Icons Grid */}
                        {filteredIcons.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {filteredIcons.map((icon) => (
                                    <div key={icon.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center space-y-3">
                                            {/* Icon Display */}
                                            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border">
                                                {icon.svg_content ? (
                                                    <div 
                                                        dangerouslySetInnerHTML={{ __html: icon.svg_content }}
                                                        className="w-8 h-8"
                                                    />
                                                ) : icon.icon_url ? (
                                                    <img 
                                                        src={icon.icon_url} 
                                                        alt={icon.name}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No Icon</span>
                                                )}
                                            </div>

                                            {/* Icon Info */}
                                            <div className="text-center">
                                                <h4 className="text-sm font-medium text-gray-900 truncate w-full">
                                                    {icon.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {icon.category.replace('_', ' ')}
                                                </p>
                                            </div>

                                            {/* Status */}
                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    icon.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {icon.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex space-x-2 w-full">
                                                <button
                                                    onClick={() => startEdit(icon)}
                                                    className="flex-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                    title="Edit"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(icon)}
                                                    className="flex-1 text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                    title="Delete"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-4xl">🎨</span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No icons found</h3>
                                <p className="text-gray-500">
                                    {selectedCategory === 'all' 
                                        ? 'Get started by adding your first icon.'
                                        : `No icons found in the ${selectedCategory.replace('_', ' ')} category.`
                                    }
                                </p>
                                <button 
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700"
                                >
                                    <span className="mr-2">+</span>
                                    Add New Icon
                                </button>
                            </div>
                        )}

                        {/* Icon Statistics */}
                        {icons && icons.length > 0 && (
                            <div className="mt-8 bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Icon Statistics</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{icons.length}</div>
                                        <div className="text-sm text-gray-500">Total Icons</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {icons.filter(icon => icon.is_active).length}
                                        </div>
                                        <div className="text-sm text-gray-500">Active</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {Object.keys(iconsByCategory).length}
                                        </div>
                                        <div className="text-sm text-gray-500">Categories</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {icons.filter(icon => icon.svg_content).length}
                                        </div>
                                        <div className="text-sm text-gray-500">SVG Icons</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Back Button */}
                        <div className="mt-8 flex justify-between">
                            <Link
                                href={route('admin.websites.index')}
                                className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400"
                            >
                                ← Back to Websites
                            </Link>
                            <Link
                                href={route('admin.dashboard')}
                                className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Icon Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Icon</h3>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        />
                                        {createErrors.name && <p className="text-red-500 text-xs mt-1">{createErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <select
                                            value={createData.category}
                                            onChange={(e) => setCreateData('category', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        >
                                            {categoryOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">SVG Content</label>
                                        <textarea
                                            value={createData.svg_content}
                                            onChange={(e) => setCreateData('svg_content', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            rows="4"
                                            placeholder="<svg>...</svg>"
                                        />
                                        {createErrors.svg_content && <p className="text-red-500 text-xs mt-1">{createErrors.svg_content}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Icon URL (Alternative)</label>
                                        <input
                                            type="url"
                                            value={createData.icon_url}
                                            onChange={(e) => setCreateData('icon_url', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="https://example.com/icon.svg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <input
                                            type="text"
                                            value={createData.description}
                                            onChange={(e) => setCreateData('description', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetCreate();
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createProcessing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {createProcessing ? 'Creating...' : 'Create Icon'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Icon Modal */}
            {editingIcon && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Icon: {editingIcon.name}</h3>
                            <form onSubmit={handleEditSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData('name', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        />
                                        {editErrors.name && <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <select
                                            value={editData.category}
                                            onChange={(e) => setEditData('category', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        >
                                            {categoryOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">SVG Content</label>
                                        <textarea
                                            value={editData.svg_content}
                                            onChange={(e) => setEditData('svg_content', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            rows="4"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Icon URL</label>
                                        <input
                                            type="url"
                                            value={editData.icon_url}
                                            onChange={(e) => setEditData('icon_url', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <input
                                            type="text"
                                            value={editData.description}
                                            onChange={(e) => setEditData('description', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={editData.is_active}
                                                onChange={(e) => setEditData('is_active', e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Active</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setEditingIcon(null)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editProcessing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {editProcessing ? 'Updating...' : 'Update Icon'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
