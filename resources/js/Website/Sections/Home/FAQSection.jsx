import { useState } from 'react';

// ICE-reference FAQ: centered header + grouped accordion blocks (bg-neutral-50,
// divide-y, plus/× toggle). Data is dynamic from pageContent.faq — supports
// either grouped FAQs (faq.groups = [{ title, items:[{question,answer}] }]) or
// a flat faq.items list (rendered as one block). The shared global FAQ
// component used by BuildingDetail stays untouched.
export default function FAQSection({ website, pageContent, building = {} }) {
    const faqData = pageContent?.faq || {};
    const faqEnabled = faqData?.enabled !== false;

    const buildingName = building?.name || 'Nobu Residences';
    const eyebrow = faqData.eyebrow || 'Knowledge Base';
    const title = faqData.title || 'Frequently Asked Questions';
    const subtitle = faqData.subtitle ||
        `Everything you need to know about buying, renting, or investing at ${buildingName}.`;

    // Default flat items (used when no admin faq data is configured).
    const defaultItems = [
        { question: `Where is ${buildingName} located?`, answer: `${buildingName} is located at 15 Mercer Street in Toronto's Entertainment District, in the heart of King West — steps from the Financial District and major transit, with the Nobu Hotel and Restaurant on site.` },
        { question: 'Who is the developer?', answer: 'The building was developed by Madison Group in partnership with Westdale Properties.' },
        { question: 'What amenities are available?', answer: 'Residents enjoy hospitality-grade amenities including 24-hour concierge/security, an outdoor pool, party and meeting rooms, a media room, a rooftop deck, and parking — plus direct access to the Nobu Hotel and Restaurant.' },
        { question: 'What suite types are available?', answer: 'Suites range from studios to multi-bedroom residences. Live availability and pricing are shown in the listings above, updated every 15 minutes from the MLS®.' },
        { question: 'How do I schedule a viewing?', answer: 'Use the contact form below or reach our team directly by phone or email — we will tailor a shortlist of available suites and arrange a private viewing.' },
    ];

    // Normalise to groups: prefer faq.groups, else a single untitled group of
    // faq.items (or defaults).
    const groups = (Array.isArray(faqData.groups) && faqData.groups.length)
        ? faqData.groups.map((g) => ({ title: g.title || '', items: Array.isArray(g.items) ? g.items : [] }))
        : [{ title: '', items: (Array.isArray(faqData.items) && faqData.items.length) ? faqData.items : defaultItems }];

    const [openKey, setOpenKey] = useState(null);

    if (!faqEnabled) return null;

    return (
        <section id="faq" className="bg-white py-20 md:py-28">
            <div className="max-w-4xl mx-auto px-4 md:px-0">
                {/* Centered header */}
                <div className="text-center mb-14">
                    <p className="font-work-sans text-gold-500 text-[11px] tracking-[0.3em] uppercase mb-3">{eyebrow}</p>
                    <h2 className="font-playfair text-3xl md:text-4xl text-neutral-900 mb-4">{title}</h2>
                    <p className="font-work-sans text-neutral-500 text-sm max-w-xl mx-auto">{subtitle}</p>
                </div>

                <div className="space-y-10">
                    {groups.map((group, gi) => (
                        <div key={group.title || `group-${gi}`}>
                            {group.title && (
                                <h3 className="text-[12px] tracking-[0.2em] uppercase text-gold-500 font-semibold mb-4">{group.title}</h3>
                            )}
                            <div className="bg-neutral-50 rounded-xl overflow-hidden divide-y divide-neutral-200">
                                {group.items.map((item, ii) => {
                                    const key = `${gi}-${ii}`;
                                    const open = openKey === key;
                                    const question = item.question || item.q || '';
                                    const answer = item.answer || item.a || item.body || '';
                                    return (
                                        <div key={key}>
                                            <button
                                                type="button"
                                                onClick={() => setOpenKey(open ? null : key)}
                                                className="w-full flex items-center justify-between px-6 py-5 text-left group"
                                                aria-expanded={open}
                                            >
                                                <span className="text-[15px] text-neutral-800 font-medium pr-4 group-hover:text-neutral-600 transition-colors">
                                                    {question}
                                                </span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                    className={`text-neutral-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
                                                    aria-hidden="true"
                                                >
                                                    <path d="M5 12h14" />
                                                    <path d="M12 5v14" />
                                                </svg>
                                            </button>
                                            {open && answer && (
                                                <div className="px-6 pb-5">
                                                    <p className="text-[14px] text-neutral-500 leading-relaxed">{answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
