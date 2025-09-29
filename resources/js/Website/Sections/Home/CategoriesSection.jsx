import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * Categories Section Component
 * Displays property categories in a grid layout
 */
const CategoriesSection = ({ categories = [] }) => {
    // Default categories if none provided
    const defaultCategories = [
        {
            id: 1,
            name: 'Houses',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop',
            link: '/search?property_type=House'
        },
        {
            id: 2,
            name: 'Condos',
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=400&fit=crop',
            link: '/search?property_type=Condo'
        },
        {
            id: 3,
            name: 'Townhomes',
            image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=400&fit=crop',
            link: '/search?property_type=Townhouse'
        }
    ];

    const displayCategories = categories.length > 0 ? categories : defaultCategories;

    return (
        <section className="py-8">
            <div className="max-w-[1280px] mx-auto px-4 md:px-0">
                {/* Section Header */}
                <div className="flex flex-row justify-between items-center mb-8 md:mb-12 h-[50px]">
                    {/* Categories Title */}
                    <h2 className="font-space-grotesk font-bold text-[32px] md:text-[40px] leading-[40px] md:leading-[50px] tracking-[-0.03em] text-[#293056]">
                        Categories
                    </h2>

                    {/* View All Button */}
                    <Link
                        href="/search"
                        className="flex flex-row items-center gap-4 group"
                    >
                        <span className="font-work-sans font-bold text-lg leading-[27px] tracking-[-0.03em] text-[#293056] group-hover:text-[#293056]/80 transition-colors">
                            View All
                        </span>
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M5 12H19M19 12L12 5M19 12L12 19"
                                stroke="#293056"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </svg>
                    </Link>
                </div>

                {/* Categories Grid - 3 cards per row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {displayCategories.slice(0, 3).map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            </div>
        </section>
    );
};

/**
 * Individual Category Card Component
 */
const CategoryCard = ({ category }) => {
    return (
        <Link
            href={category.link}
            className="group relative block w-full h-[397px] rounded-xl p-6 overflow-hidden bg-cover bg-center transition-transform hover:scale-[1.02]"
            style={{
                backgroundImage: `url(${category.image})`
            }}
        >
            {/* Dark overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl" />

            {/* Content Container */}
            <div className="relative h-full flex flex-col justify-end">
                {/* Category Name and Arrow - Bottom, Flex Between */}
                <div className="flex justify-between items-center">
                    <h3 className="font-space-grotesk font-bold text-[40px] leading-[50px] tracking-[-0.03em] text-white">
                        {category.name}
                    </h3>

                    {/* Arrow Button with Background */}
                    <div className="w-14 h-14 rounded-full bg-[#93370D] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M4 11H16.17L10.58 5.41L12 4L20 12L12 20L10.59 18.59L16.17 13H4V11Z" fill="white"/>
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
};

/**
 * Tailwind CSS equivalents for the provided styles:
 *
 * Original CSS -> Tailwind Classes:
 *
 * Section Header:
 * - display: flex -> flex
 * - flex-direction: row -> flex-row
 * - justify-content: space-between -> justify-between
 * - align-items: center -> items-center
 * - width: 1280px -> max-w-[1280px]
 * - height: 50px -> h-[50px]
 *
 * Categories Title:
 * - font-family: 'Space Grotesk' -> font-space-grotesk
 * - font-weight: 700 -> font-bold
 * - font-size: 40px -> text-[40px]
 * - line-height: 50px -> leading-[50px]
 * - letter-spacing: -0.03em -> tracking-[-0.03em]
 * - color: #293056 -> text-[#293056]
 *
 * View All Button:
 * - gap: 16px -> gap-4
 * - font-family: 'Work Sans' -> font-work-sans
 * - font-weight: 700 -> font-bold
 * - font-size: 18px -> text-lg
 * - line-height: 27px -> leading-[27px]
 *
 * Category Card:
 * - width: 397px -> w-full (responsive)
 * - height: 397px -> h-[397px]
 * - border-radius: 12px -> rounded-xl
 * - padding: 24px -> p-6
 *
 * Arrow SVG:
 * - width: 56px -> w-14
 * - height: 56px -> h-14
 * - border-radius: 28px -> rounded-full
 * - background: #93370D -> bg-[#93370D]
 * - transform: matrix(-1 0 0 1 56 0) -> -scale-x-100
 */

export default CategoriesSection;