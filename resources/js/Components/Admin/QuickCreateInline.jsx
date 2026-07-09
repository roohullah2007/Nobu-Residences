import { useState } from 'react';

const getCsrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

/**
 * Inline "+ New" creator without a select — used by the amenity pickers on
 * the building create/edit pages. POSTs { name, ...createPayload } to
 * createUrl and calls onCreated(item) with the JSON response, so the page
 * can append the new item to its list and select it.
 */
export default function QuickCreateInline({
    createUrl,
    createPayload = {},
    buttonLabel = '+ New',
    placeholder = 'Name...',
    onCreated,
}) {
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [createError, setCreateError] = useState('');

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name || isSaving) return;
        setIsSaving(true);
        setCreateError('');
        try {
            const response = await fetch(createUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ ...createPayload, name }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.message ?? `Server returned ${response.status}`);
            }
            onCreated?.(result);
            setNewName('');
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
            setCreateError('');
        }
    };

    if (!isCreating) {
        return (
            <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
                {buttonLabel}
            </button>
        );
    }

    return (
        <div className="rounded-md border border-indigo-200 bg-indigo-50 p-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    className="block w-full rounded-md !border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus
                />
                <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isSaving || !newName.trim()}
                    className="whitespace-nowrap rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSaving ? 'Adding...' : 'Add'}
                </button>
                <button
                    type="button"
                    onClick={() => { setIsCreating(false); setCreateError(''); }}
                    className="whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                    Cancel
                </button>
            </div>
            {createError && <p className="mt-1 text-xs text-red-600">{createError}</p>}
        </div>
    );
}
