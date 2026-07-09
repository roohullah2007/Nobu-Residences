import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

const getCsrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

/**
 * A <select> with an inline "+ New" quick-create form so admins can add a
 * missing option (neighbourhood, sub-neighbourhood, developer, ...) without
 * leaving the page. POSTs { name, ...createPayload } to createUrl, then
 * calls onCreated(item) and onChange(item.id) with the JSON response.
 */
export default function QuickCreateSelect({
    id,
    label,
    value,
    onChange,
    options = [],
    getOptionLabel = (option) => option.name,
    createUrl,
    createPayload = {},
    createTitle = 'Add new',
    placeholder = 'Select...',
    error,
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
            onChange(result.id);
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

    return (
        <div>
            <div className="flex items-center justify-between">
                <InputLabel htmlFor={id} value={label} />
                <button
                    type="button"
                    onClick={() => setIsCreating(!isCreating)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                    {isCreating ? 'Cancel' : '+ New'}
                </button>
            </div>
            <select
                id={id}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {getOptionLabel(option)}
                    </option>
                ))}
            </select>
            {isCreating && (
                <div className="mt-2 rounded-md border border-indigo-200 bg-indigo-50 p-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`${createTitle}...`}
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
                    </div>
                    {createError && <p className="mt-1 text-xs text-red-600">{createError}</p>}
                </div>
            )}
            <InputError message={error} className="mt-2" />
        </div>
    );
}
