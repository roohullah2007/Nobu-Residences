import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';

const GLOBAL_SCOPE = 'global';

const findTemplate = (templates, type, websiteId) =>
    templates.find((t) => t.type === type && (t.website_id ?? null) === websiteId) || null;

/**
 * Editable fields for one email type + scope. Remounted (via key) when the
 * scope changes so the form always starts from that scope's saved values.
 */
function TemplateFields({ typeConfig, websiteId, template }) {
    const [form, setForm] = useState({
        subject: template?.subject || '',
        headline: template?.headline || '',
        intro: template?.intro || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSave = () => {
        router.put(
            route('admin.email-templates.update'),
            { type: typeConfig.type, website_id: websiteId, ...form },
            {
                preserveScroll: true,
                onStart: () => setIsSaving(true),
                onFinish: () => setIsSaving(false),
            }
        );
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                    type="text"
                    value={form.subject}
                    onChange={handleChange('subject')}
                    placeholder={typeConfig.defaults.subject}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                <input
                    type="text"
                    value={form.headline}
                    onChange={handleChange('headline')}
                    placeholder={typeConfig.defaults.headline}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intro paragraph</label>
                <textarea
                    rows={4}
                    value={form.intro}
                    onChange={handleChange('intro')}
                    placeholder={typeConfig.defaults.intro}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
            </div>
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                    Empty fields use the {websiteId ? 'global template' : 'default text'} (shown as placeholder).
                </p>
                <PrimaryButton onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                </PrimaryButton>
            </div>
        </div>
    );
}

/**
 * One email type: scope selector (global / per site), fields, and the
 * merge-tag legend.
 */
function TemplateEditor({ typeConfig, templates, websites }) {
    const [scope, setScope] = useState(GLOBAL_SCOPE);
    const websiteId = scope === GLOBAL_SCOPE ? null : Number(scope);
    const template = findTemplate(templates, typeConfig.type, websiteId);

    return (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{typeConfig.label}</h2>
                <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                >
                    <option value={GLOBAL_SCOPE}>All websites (global)</option>
                    {websites.map((site) => (
                        <option key={site.id} value={site.id}>
                            {site.name} {site.domain ? `(${site.domain})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            <TemplateFields
                key={`${typeConfig.type}-${scope}`}
                typeConfig={typeConfig}
                websiteId={websiteId}
                template={template}
            />

            <div className="border-t border-gray-100 pt-3">
                <div className="text-xs font-medium text-gray-500 mb-2">
                    Available tags (replaced per recipient when the email is sent):
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {typeConfig.tags.map((tag) => (
                        <code key={tag} className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                            {tag}
                        </code>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function EmailTemplatesIndex({ types, templates, websites }) {
    return (
        <AdminLayout title="Email Templates">
            <Head title="Email Templates" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <p className="text-sm text-gray-600">
                        Personalize the listing alert emails. Use tags like <code className="px-1 bg-gray-100 rounded">%first_name%</code> or{' '}
                        <code className="px-1 bg-gray-100 rounded">%building_name%</code> in the subject or text — they are replaced with each
                        recipient's real values when the email goes out. A site-specific template overrides the global one; empty fields fall back.
                    </p>

                    {types.map((typeConfig) => (
                        <TemplateEditor
                            key={typeConfig.type}
                            typeConfig={typeConfig}
                            templates={templates}
                            websites={websites}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
