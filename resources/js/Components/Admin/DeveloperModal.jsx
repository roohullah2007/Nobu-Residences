import { useState } from 'react';
import { csrfHeaders } from '@/utils/csrf';

const EMPTY_FORM = {
    name: '',
    type: 'developer',
    email: '',
    phone: '',
    website: '',
    established_year: '',
    description: '',
    logo: null,
};

const DEVELOPER_TYPES = [
    { value: 'developer', label: 'Developer' },
    { value: 'builder', label: 'Builder' },
    { value: 'builder_developer', label: 'Builder & Developer' },
];

const inputClasses = 'w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]';

/**
 * Full "Add Developer" modal for use inside other forms (e.g. the building
 * create/edit pages) — same fields as the Developers tab, including the logo
 * upload. Posts as FormData to the JSON quick-create endpoint and hands the
 * created developer back via onCreated so the caller can select it without
 * a page reload.
 */
export default function DeveloperModal({ open, onClose, onCreated }) {
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [logoPreview, setLogoPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    if (!open) return null;

    const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setField('logo', file);
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleClose = () => {
        setForm({ ...EMPTY_FORM });
        setLogoPreview(null);
        setError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || isSaving) return;
        setIsSaving(true);
        setError('');

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== '') {
                    formData.append(key, value);
                }
            });

            const response = await fetch(route('admin.api.developers.store'), {
                method: 'POST',
                headers: {
                    ...csrfHeaders(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.message ?? `Server returned ${response.status}`);
            }

            onCreated?.(result);
            handleClose();
        } catch (err) {
            setError(err.message ?? 'Failed to create developer.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Add Developer</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                                    Name <span className="text-[#dc2626]">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={inputClasses}
                                    value={form.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                                    Type <span className="text-[#dc2626]">*</span>
                                </label>
                                <select
                                    className={inputClasses}
                                    value={form.type}
                                    onChange={(e) => setField('type', e.target.value)}
                                    required
                                >
                                    {DEVELOPER_TYPES.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Email</label>
                                <input
                                    type="email"
                                    className={inputClasses}
                                    value={form.email}
                                    onChange={(e) => setField('email', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Phone</label>
                                <input
                                    type="text"
                                    className={inputClasses}
                                    value={form.phone}
                                    onChange={(e) => setField('phone', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Website</label>
                                <input
                                    type="text"
                                    placeholder="https://example.com"
                                    className={inputClasses}
                                    value={form.website}
                                    onChange={(e) => setField('website', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Established Year</label>
                                <input
                                    type="number"
                                    min="1800"
                                    max={new Date().getFullYear()}
                                    placeholder="e.g. 1985"
                                    className={inputClasses}
                                    value={form.established_year}
                                    onChange={(e) => setField('established_year', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Description</label>
                            <textarea
                                rows={4}
                                placeholder="Company profile shown on the public developer page..."
                                className={inputClasses}
                                value={form.description}
                                onChange={(e) => setField('description', e.target.value)}
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

                        {error && (
                            <p className="text-sm text-[#dc2626]">{error}</p>
                        )}
                    </div>

                    <div className="mt-6 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !form.name.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
