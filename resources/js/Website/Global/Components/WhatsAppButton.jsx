// Floating WhatsApp contact button (bottom-right on every public landing
// page that renders it). Opens a WhatsApp chat with the client's number and
// a pre-filled, page-specific message passed in via the `message` prop:
//   - Homepage:        unit availability enquiry with the building name
//   - Property detail: For Sale / For Rent enquiry with MLS ID + address
const WHATSAPP_PHONE = '14166694755'; // +1 (416) 669-4755

export default function WhatsAppButton({ message, className = 'bottom-6' }) {
    if (!message) {
        return null;
    }

    const href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            title="Chat with us on WhatsApp"
            className={`fixed right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-200 hover:scale-110 hover:shadow-xl ${className}`}
        >
            <svg
                viewBox="0 0 32 32"
                className="h-8 w-8 fill-white"
                aria-hidden="true"
            >
                <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.58-1.67a12.74 12.74 0 0 0 6.22 1.61h.01c7.06 0 12.79-5.74 12.79-12.8 0-3.42-1.33-6.63-3.75-9.05a12.72 12.72 0 0 0-9.05-3.69zm0 23.39h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.02 1.07-3.92-.25-.4a10.55 10.55 0 0 1-1.63-5.66c0-5.87 4.78-10.65 10.66-10.65 2.85 0 5.52 1.11 7.53 3.12a10.59 10.59 0 0 1 3.12 7.54c0 5.87-4.78 10.66-10.68 10.66zm5.84-7.98c-.32-.16-1.89-.93-2.19-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.3c.16.21 2.25 3.44 5.45 4.82.76.33 1.36.53 1.82.67.77.24 1.46.21 2.01.13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z" />
            </svg>
        </a>
    );
}
