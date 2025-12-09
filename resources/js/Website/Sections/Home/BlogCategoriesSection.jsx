import React from 'react';
import { Link } from '@inertiajs/react';

// Default fallback image
const DEFAULT_CATEGORY_IMAGE = '/images/no-image-placeholder.jpg';

// Simple helper to get valid image URL - no async loading
const getValidImageUrl = (category) => {
    // If backend validated the image exists, use it
    if (category.validated_featured_image) {
        return category.validated_featured_image;
    }
    // Otherwise use placeholder
    return DEFAULT_CATEGORY_IMAGE;
};

/**
 * Blog Categories Section Component
 * Displays blog categories in a grid layout
 */
const BlogCategoriesSection = ({ categories = [] }) => {
    // Use categories from backend directly
    const displayCategories = categories;

    // Don't render if no categories
    if (!displayCategories || displayCategories.length === 0) {
        return null;
    }

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
                        href="/blogs"
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

                {/* Categories Grid - Show all 4 categories, 3 per row on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {displayCategories.map((category) => (
                        <BlogCategoryCard key={category.id} category={category} />
                    ))}
                </div>
            </div>
        </section>
    );
};

/**
 * Individual Blog Category Card Component
 */
const BlogCategoryCard = ({ category }) => {
    const bgImage = getValidImageUrl(category);

    return (
        <Link
            href={`/blogs?category=${category.slug}`}
            className="group relative block w-full h-[397px] rounded-xl p-6 overflow-hidden bg-cover bg-center transition-transform hover:scale-[1.02]"
            style={{
                backgroundImage: `url(${bgImage})`
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

                    {/* Arrow Button with Background - matching property categories exactly */}
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

export default BlogCategoriesSection;