import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { csrfHeaders } from '@/utils/csrf';

/**
 * A searchable combobox with an inline "+ New" quick-create form so admins
 * can find or add a missing option (neighbourhood, sub-neighbourhood,
 * developer, ...) without leaving the page. Typing filters the option list;
 * "+ New" POSTs { name, ...createPayload } to createUrl, then calls
 * onCreated(item) and onChange(item.id) with the JSON response.
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
    // When set, "+ New" delegates to the caller (e.g. to open a full modal)
    // instead of showing the inline name-only creator.
    onRequestCreate,
}) {
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [createError, setCreateError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const selectedOption = options.find((option) => String(option.id) === String(value));
    const filteredOptions = query.trim()
        ? options.filter((option) =>
              getOptionLabel(option).toLowerCase().includes(query.trim().toLowerCase()))
        : options;

    const selectOption = (option) => {
        onChange(String(option.id));
        setIsOpen(false);
        setHighlightIndex(-1);
    };

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
                    ...csrfHeaders(),
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
                    onClick={() => (onRequestCreate ? onRequestCreate() : setIsCreating(!isCreating))}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                    {!onRequestCreate && isCreating ? 'Cancel' : '+ New'}
                </button>
            </div>
            {/* Searchable combobox: the input filters the list while open and
                shows the selected label while closed. Options use onMouseDown
                (fires before the input's blur) so clicks register before the
                dropdown closes. */}
            <div className="relative">
                <input
                    id={id}
                    type="text"
                    role="combobox"
                    aria-expanded={isOpen}
                    autoComplete="off"
                    className="mt-1 block w-full rounded-md !border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900 pr-8"
                    value={isOpen ? query : (selectedOption ? getOptionLabel(selectedOption) : '')}
                    placeholder={selectedOption ? getOptionLabel(selectedOption) : placeholder}
                    onFocus={() => { setIsOpen(true); setQuery(''); setHighlightIndex(-1); }}
                    onChange={(e) => { setQuery(e.target.value); setHighlightIndex(-1); }}
                    onBlur={() => setTimeout(() => setIsOpen(false), 100)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') { setIsOpen(false); e.currentTarget.blur(); }
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setIsOpen(true);
                            setHighlightIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
                        }
                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setHighlightIndex((prev) => Math.max(prev - 1, 0));
                        }
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = filteredOptions[highlightIndex]
                                ?? (filteredOptions.length === 1 ? filteredOptions[0] : null);
                            if (target) {
                                selectOption(target);
                                e.currentTarget.blur();
                            }
                        }
                    }}
                />
                <svg
                    className="pointer-events-none absolute right-2.5 top-1/2 mt-0.5 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {isOpen && (
                    <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
                        <li>
                            <button
                                type="button"
                                className="block w-full px-3 py-1.5 text-left text-gray-500 hover:bg-gray-50"
                                onMouseDown={(e) => { e.preventDefault(); onChange(''); setIsOpen(false); }}
                            >
                                {placeholder}
                            </button>
                        </li>
                        {filteredOptions.map((option, index) => (
                            <li key={option.id}>
                                <button
                                    type="button"
                                    className={`block w-full px-3 py-1.5 text-left hover:bg-indigo-50 ${
                                        index === highlightIndex
                                            ? 'bg-indigo-100 text-indigo-900'
                                            : String(option.id) === String(value)
                                            ? 'bg-indigo-50 font-medium text-indigo-700'
                                            : 'text-gray-900'
                                    }`}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        selectOption(option);
                                    }}
                                >
                                    {getOptionLabel(option)}
                                </button>
                            </li>
                        ))}
                        {filteredOptions.length === 0 && (
                            <li className="px-3 py-1.5 text-gray-400">No matches — use "+ New" to add it</li>
                        )}
                    </ul>
                )}
            </div>
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
