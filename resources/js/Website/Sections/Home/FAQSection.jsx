import { FAQ } from '@/Website/Global/Components';

/**
 * FAQ Section wrapper for Home page
 * Uses the global FAQ component with home page specific settings
 */
export default function FAQSection({ website, pageContent }) {
    // Use FAQ data from props, check correct path: pageContent.faq.items
    const faqData = pageContent?.faq;
    const faqItems = faqData?.items || null; // null will use default data from FAQ component
    const faqTitle = faqData?.title || "FAQs";
    const faqEnabled = faqData?.enabled !== false; // Default to true if not explicitly disabled

    // Don't render if FAQ is explicitly disabled
    if (!faqEnabled) {
        return null;
    }

    return (
        <FAQ 
            faqItems={faqItems}
            title={faqTitle}
            containerClassName="py-4 md:py-16 bg-white"
            showContainer={true}
        />
    );
}