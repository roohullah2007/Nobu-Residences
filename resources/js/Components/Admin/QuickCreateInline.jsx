import { useRef, useState } from 'react';
import { csrfHeaders } from '@/utils/csrf';

/**
 * Inline "+ New" creator without a select — used by the amenity pickers on
 * the building create/edit pages. POSTs { name, ...createPayload } to
 * createUrl and calls onCreated(item) with the JSON response, so the page
 * can append the new item to its list and select it.
 *
 * With `withImage`, an optional icon/image can be attached; the request is
 * then sent as multipart FormData with the file under `imageFieldName`.
 */
export default function QuickCreateInline({
    createUrl,
    createPayload = {},
    buttonLabel = '+ New',
    placeholder = 'Name...',
    onCreated,
    withImage = false,
    imageFieldName = 'icon_file',
}) {
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [createError, setCreateError] = useState('');
    const fileInputRef = useRef(null);

    const resetForm = () => {
        setNewName('');
        setImageFile(null);
        setImagePreview('');
        setCreateError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
        setImagePreview(file ? URL.createObjectURL(file) : '');
    };

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name || isSaving) return;
        setIsSaving(true);
        setCreateError('');
        try {
            let body;
            const headers = {
                ...csrfHeaders(),
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
            };

            if (imageFile) {
                // Multipart so the icon file reaches the server; the browser
                // sets the Content-Type boundary itself.
                body = new FormData();
                Object.entries(createPayload).forEach(([k, v]) => body.append(k, v));
                body.append('name', name);
                body.append(imageFieldName, imageFile);
            } else {
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify({ ...createPayload, name });
            }

            const response = await fetch(createUrl, { method: 'POST', headers, body });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.message ?? `Server returned ${response.status}`);
            }
            onCreated?.(result);
            resetForm();
            setIsCreating(false);
        } catch (err) {
            setCreateError(err.message ?? 'Failed to create.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreate();
        }
        if (e.key === 'Escape') {
            setIsCreating(false);
            resetForm();
        }
    };

    if (!isCreating) {
        return (
            <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50"
            >
                {buttonLabel}
            </button>
        );
    }

    return (
        <div className="w-full rounded-md border border-indigo-200 bg-indigo-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
                <input
                    type="text"
                    className="block flex-1 min-w-[200px] rounded-md !border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus
                />
                {withImage && (
                    <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Icon preview" className="h-5 w-5 object-contain" />
                        ) : (
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                        )}
                        {imageFile ? imageFile.name : 'Upload icon'}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.svg"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                )}
                <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isSaving || !newName.trim()}
                    className="whitespace-nowrap rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSaving ? 'Adding...' : 'Add'}
                </button>
                <button
                    type="button"
                    onClick={() => { setIsCreating(false); resetForm(); }}
                    className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    Cancel
                </button>
            </div>
            {withImage && !imageFile && (
                <p className="mt-1 text-xs text-gray-500">Optional icon — SVG, PNG or JPG, max 2 MB.</p>
            )}
            {createError && <p className="mt-1 text-xs text-red-600">{createError}</p>}
        </div>
    );
}
