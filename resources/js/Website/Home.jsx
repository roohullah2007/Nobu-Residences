import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '@/Website/Global/MainLayout';
import HomeHeader from '@/Website/Sections/Home/HomeHeader';
import HeroSection from '@/Website/Sections/Home/HeroSection';
import MarketSnapshot from '@/Website/Sections/Home/MarketSnapshot';
import ListingCarousel from '@/Website/Sections/Home/ListingCarousel';
import BuildingInfo from '@/Website/Sections/Home/BuildingInfo';
import UnitTypesTable from '@/Website/Sections/Home/UnitTypesTable';
import AmenitiesSection from '@/Website/Sections/Home/AmenitiesSection';
import LocationSection from '@/Website/Sections/Home/LocationSection';
import OwnershipCosts from '@/Website/Sections/Home/OwnershipCosts';
import HistoryTimeline from '@/Website/Sections/Home/HistoryTimeline';
import FAQSection from '@/Website/Sections/Home/FAQSection';
import ContactSection from '@/Website/Sections/Home/ContactSection';
import { ViewingRequestModal } from '@/Website/Global/Components';
import { normalizeListing, priceStats } from '@/Website/Sections/Home/iceData';

export default function Home({ auth, laravelVersion, phpVersion, website, siteName, siteUrl, year, pageContent, availableIcons, buildingData, ...props }) {
    const building = buildingData || {};
    const { globalWebsite } = usePage().props;
    const pageTitle = globalWebsite?.meta_title || `${siteName} - Luxury Condominiums at Nobu Residences`;

    const [viewingModal, setViewingModal] = useState({ isOpen: false, property: null });

    // Live listings shared across Market Snapshot, carousels, and Unit Types.
    const [forSale, setForSale] = useState([]);
    const [forRent, setForRent] = useState([]);
    const [listingsLoaded, setListingsLoaded] = useState(false);

    // Global function to open viewing modal from property cards (SSR-safe).
    useEffect(() => {
        window.openViewingModal = (property) => {
            setViewingModal({ isOpen: true, property });
        };
        return () => {
            delete window.openViewingModal;
        };
    }, []);

    // Fetch homepage listings once (same endpoint/shape as the original
    // PropertiesForSale/PropertiesForRent components).
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [saleRes, rentRes] = await Promise.all([
                    axios.get('/api/homepage-properties', { params: { type: 'sale' } }),
                    axios.get('/api/homepage-properties', { params: { type: 'rent' } }),
                ]);

                if (cancelled) return;

                const saleRaw = saleRes?.data?.success ? (saleRes.data.data.forSale || []) : [];
                const rentRaw = rentRes?.data?.success ? (rentRes.data.data.forRent || []) : [];

                setForSale(saleRaw.map((p) => normalizeListing(p, { isRental: false })).filter(Boolean));
                setForRent(rentRaw.map((p) => normalizeListing(p, { isRental: true })).filter(Boolean));
                setListingsLoaded(true);
            } catch (error) {
                console.error('Error fetching homepage listings:', error);
                // Stop the count placeholders from spinning forever on failure.
                if (!cancelled) setListingsLoaded(true);
            }
        };

        load();
        return () => { cancelled = true; };
    }, []);

    const handleCloseViewingModal = () => setViewingModal({ isOpen: false, property: null });

    // "Starting From" = lowest for-sale price.
    const startingFromPrice = priceStats(forSale).min;

    return (
        <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} website={website} pageContent={pageContent} auth={auth} hideHeader={true}>
            <Head title={pageTitle} />
            <div className="overflow-x-hidden bg-neutral-950">
                <HomeHeader auth={auth} website={website} />

                <HeroSection
                    auth={auth}
                    siteName={siteName}
                    website={website}
                    pageContent={pageContent}
                    building={building}
                    startingFromPrice={startingFromPrice}
                    forSaleCount={forSale.length}
                    forRentCount={forRent.length}
                    countsReady={listingsLoaded}
                />

                <MarketSnapshot forSale={forSale} forRent={forRent} building={building} />

                <ListingCarousel
                    id="for-sale"
                    eyebrow="Available Now"
                    title={`For Sale at ${building.name || siteName || 'Nobu Residences'}`}
                    listings={forSale}
                    viewMoreHref="/search"
                    auth={auth}
                    building={buildingData}
                    website={website}
                />

                <ListingCarousel
                    id="for-rent"
                    eyebrow="Available Now"
                    title={`For Rent at ${building.name || siteName || 'Nobu Residences'}`}
                    listings={forRent}
                    viewMoreHref="/search"
                    auth={auth}
                    building={buildingData}
                    website={website}
                />

                <BuildingInfo pageContent={pageContent} building={building} />

                <UnitTypesTable forSale={forSale} forRent={forRent} building={building} />

                <AmenitiesSection pageContent={pageContent} availableIcons={availableIcons} building={building} />

                <LocationSection pageContent={pageContent} building={building} />

                <OwnershipCosts building={building} />

                <HistoryTimeline pageContent={pageContent} building={building} />

                <FAQSection website={website} pageContent={pageContent} building={building} />

                <ContactSection website={website} pageContent={pageContent} building={building} />
            </div>

            {/* Global Viewing Request Modal */}
            <ViewingRequestModal
                isOpen={viewingModal.isOpen}
                onClose={handleCloseViewingModal}
                property={viewingModal.property}
            />
        </MainLayout>
    );
}
