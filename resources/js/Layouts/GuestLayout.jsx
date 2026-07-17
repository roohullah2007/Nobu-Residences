import { Link, usePage } from '@inertiajs/react';

// Guest auth pages (forgot/reset password) render on tenant landing domains,
// so the header carries the current site's logo/name — never the stock
// framework logo.
export default function GuestLayout({ children }) {
    const { globalWebsite } = usePage().props;
    const logoUrl = globalWebsite?.logo_url;
    const siteName = globalWebsite?.name || 'Home';

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    {logoUrl ? (
                        /* Site logos are typically white-on-transparent (made
                           for the navy header), so they sit on a navy chip
                           here to stay legible on the gray page. */
                        <span className="inline-block rounded-xl bg-[#293056] px-6 py-3">
                            <img
                                src={logoUrl}
                                alt={siteName}
                                className="h-12 max-w-[200px] object-contain"
                            />
                        </span>
                    ) : (
                        <span className="text-2xl font-bold" style={{ color: '#293056' }}>
                            {siteName}
                        </span>
                    )}
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
