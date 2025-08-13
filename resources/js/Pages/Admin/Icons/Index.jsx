import { Head, Link, usePage, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useRef } from 'react';

export default function Index({ auth }) {
    const { icons, title } = usePage().props;
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingIcon, setEditingIcon] = useState(null);
    const [previewIcon, setPreviewIcon] = useState(null);
    const createFileInputRef = useRef(null);
    const editFileInputRef = useRef(null);

    // Create form
    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
        name: '',
        category: 'key_facts',
        svg_content: '',
        icon_url: '',
        icon_file: null,
        description: '',
    });

    // Edit form
    const { data: editData, setData: setEditData, post: editPost, processing: editProcessing, errors: editErrors } = useForm({
        _method: 'PUT',
        name: '',
        category: '',
        svg_content: '',
        icon_url: '',
        icon_file: null,
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

    // File handling functions
    const handleFileChange = (file, isEdit = false) => {
        if (!file) return;

        const formSetter = isEdit ? setEditData : setCreateData;
        const previewSetter = isEdit ? setPreviewIcon : setPreviewIcon;

        formSetter('icon_file', file);

        // Generate preview
        if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const svgContent = e.target.result;
                formSetter('svg_content', svgContent);
                formSetter('icon_url', '');
                previewSetter(svgContent);
            };
            reader.readAsText(file);
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                formSetter('svg_content', '');
                formSetter('icon_url', imageUrl); // Temporary preview URL
                previewSetter(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearFile = (isEdit = false) => {
        const formSetter = isEdit ? setEditData : setCreateData;
        const inputRef = isEdit ? editFileInputRef : createFileInputRef;
        
        formSetter('icon_file', null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        setPreviewIcon(null);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createPost(route('admin.icons.api.store'), {
            forceFormData: true,
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
                setPreviewIcon(null);
                if (createFileInputRef.current) {
                    createFileInputRef.current.value = '';
                }
            }
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editPost(route('admin.icons.update', editingIcon.id), {
            forceFormData: true,
            onSuccess: () => {
                setEditingIcon(null);
                setPreviewIcon(null);
            }
        });
    };

    const startEdit = (icon) => {
        setEditingIcon(icon);
        setEditData({
            _method: 'PUT',
            name: icon.name,
            category: icon.category,
            svg_content: icon.svg_content || '',
            icon_url: icon.icon_url || '',
            icon_file: null,
            description: icon.description || '',
            is_active: icon.is_active,
        });
        setPreviewIcon(null);
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
                                        <label className="block text-sm font-medium text-gray-700">Icon Upload</label>
                                        <div className="mt-1 space-y-2">
                                            <input
                                                ref={createFileInputRef}
                                                type="file"
                                                accept=".svg,.png,.jpg,.jpeg"
                                                onChange={(e) => handleFileChange(e.target.files[0], false)}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            <p className="text-xs text-gray-500">Upload SVG, PNG, or JPG files (max 2MB)</p>
                                            
                                            {/* Preview */}
                                            {previewIcon && (
                                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-8 h-8 flex items-center justify-center bg-white rounded border">
                                                            {previewIcon.startsWith('<svg') ? (
                                                                <div dangerouslySetInnerHTML={{ __html: previewIcon }} className="w-6 h-6" />
                                                            ) : (
                                                                <img src={previewIcon} alt="Preview" className="w-6 h-6 object-contain" />
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-600">Preview</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => clearFile(false)}
                                                        className="text-red-600 hover:text-red-800 text-xs"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
                                        <label className="block text-sm font-medium text-gray-700">SVG Content (Manual Entry)</label>
                                        <textarea
                                            value={createData.svg_content}
                                            onChange={(e) => setCreateData('svg_content', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            rows="4"
                                            placeholder="<svg>...</svg> or upload a file above"
                                            disabled={!!createData.icon_file}
                                        />
                                        {createData.icon_file && (
                                            <p className="text-xs text-gray-500 mt-1">SVG content will be generated from uploaded file</p>
                                        )}
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
                                            disabled={!!createData.icon_file}
                                        />
                                        {createData.icon_file && (
                                            <p className="text-xs text-gray-500 mt-1">URL will be generated from uploaded file</p>
                                        )}
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
                    <div className="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
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

                                    {/* Current Icon Display */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Icon</label>
                                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                                            <div className="w-12 h-12 flex items-center justify-center bg-white rounded border">
                                                {editingIcon.svg_content ? (
                                                    <div 
                                                        dangerouslySetInnerHTML={{ __html: editingIcon.svg_content }}
                                                        className="w-8 h-8"
                                                    />
                                                ) : editingIcon.icon_url ? (
                                                    <img 
                                                        src={editingIcon.icon_url} 
                                                        alt={editingIcon.name}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No Icon</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{editingIcon.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{editingIcon.category.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Replace Icon (Upload New)</label>
                                        <div className="mt-1 space-y-2">
                                            <input
                                                ref={editFileInputRef}
                                                type="file"
                                                accept=".svg,.png,.jpg,.jpeg"
                                                onChange={(e) => handleFileChange(e.target.files[0], true)}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            <p className="text-xs text-gray-500">Upload SVG, PNG, or JPG files to replace current icon</p>
                                            
                                            {/* Preview */}
                                            {previewIcon && (
                                                <div className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-8 h-8 flex items-center justify-center bg-white rounded border">
                                                            {previewIcon.startsWith('<svg') ? (
                                                                <div dangerouslySetInnerHTML={{ __html: previewIcon }} className="w-6 h-6" />
                                                            ) : (
                                                                <img src={previewIcon} alt="New Preview" className="w-6 h-6 object-contain" />
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-600">New Preview</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => clearFile(true)}
                                                        className="text-red-600 hover:text-red-800 text-xs"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
                                        <label className="block text-sm font-medium text-gray-700">SVG Content (Manual Edit)</label>
                                        <textarea
                                            value={editData.svg_content}
                                            onChange={(e) => setEditData('svg_content', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            rows="4"
                                            disabled={!!editData.icon_file}
                                        />
                                        {editData.icon_file && (
                                            <p className="text-xs text-gray-500 mt-1">SVG content will be updated from uploaded file</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Icon URL</label>
                                        <input
                                            type="url"
                                            value={editData.icon_url}
                                            onChange={(e) => setEditData('icon_url', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            disabled={!!editData.icon_file}
                                        />
                                        {editData.icon_file && (
                                            <p className="text-xs text-gray-500 mt-1">URL will be updated from uploaded file</p>
                                        )}
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
                                        onClick={() => {
                                            setEditingIcon(null);
                                            setPreviewIcon(null);
                                        }}
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
