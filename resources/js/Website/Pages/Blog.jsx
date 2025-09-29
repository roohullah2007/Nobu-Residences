import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import { FAQ } from '@/Website/Global/Components';
import RealEstateLinksSection from '@/Website/Components/PropertyDetail/RealEstateLinksSection';
import FeaturedBlogsSection from '@/Website/Sections/Blog/FeaturedBlogsSection';
import BlogCategoriesSection from '@/Website/Sections/Home/BlogCategoriesSection';

export default function Blog({ auth, siteName = 'NobuResidence', siteUrl, year, website, blogs, categories: backendCategories, selectedCategory: selectedCategorySlug }) {
    // Use backend data or fallback to empty
    const blogData = blogs?.data || [];
    const pagination = blogs || null;

    // Use backend categories directly (they're objects now, not strings)
    const categories = backendCategories || [];

    // Find the selected category object from the slug
    const selectedCategoryObj = categories.find(cat => cat.slug === selectedCategorySlug);

    // The posts are already filtered by the backend, so we just use them directly
    const filteredPosts = blogData;

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Calculate reading time (this could come from backend)
    const calculateReadTime = (content) => {
        if (!content) return '5 min read';
        const words = content.split(' ').length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min read`;
    };

    // Handle pagination
    const handlePageChange = (url) => {
        if (url) {
            router.visit(url, { preserveState: true });
        }
    };

    return (
        <MainLayout auth={auth} website={website}>
            <Head title="Real Estate Blog" />

            {/* Hero Section */}
            <section
                className="relative bg-cover bg-center bg-no-repeat flex items-center pt-20 md:pt-32"
                style={{
                    backgroundImage: 'url(/assets/building.jpg)',
                    height: '441px'
                }}
            >
                {/* Gradient Overlay - same as homepage */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>

                {/* Content */}
                <div className="relative z-10 text-left text-white container mx-auto px-4 md:px-0">
                    {/* Breadcrumb */}
                    <h3 className="text-lg md:text-xl font-medium mb-4">
                        / Blog {selectedCategoryObj && `/ ${selectedCategoryObj.name}`}
                    </h3>

                    {/* Main Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold max-w-3xl leading-tight">
                        {selectedCategoryObj
                            ? `${selectedCategoryObj.name} Articles`
                            : 'Inspiration for Real Estate by real people'}
                    </h1>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="py-8">
                <div className="max-w-[1280px] mx-auto px-4 md:px-0">
                    {/* Section Header */}
                    <div className="flex flex-row justify-between items-center mb-8 md:mb-12 h-[50px]">
                        {/* Blog Title */}
                        <div className="flex items-center gap-4">
                            <h2 className="font-space-grotesk font-bold text-[32px] md:text-[40px] leading-[40px] md:leading-[50px] tracking-[-0.03em] text-[#293056]">
                                Blogs
                            </h2>
                            {selectedCategoryObj && (
                                <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                                    {selectedCategoryObj.name}
                                </span>
                            )}
                        </div>

                        {/* View All Button or Clear Filter */}
                        {selectedCategoryObj ? (
                            <Link
                                href="/blogs"
                                className="flex flex-row items-center gap-4 group"
                            >
                                <span className="font-work-sans font-bold text-lg leading-[27px] tracking-[-0.03em] text-[#293056] group-hover:text-[#293056]/80 transition-colors">
                                    Clear Filter
                                </span>
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M6 18L18 6M6 6l12 12"
                                        stroke="#293056"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="group-hover:rotate-90 transition-transform"
                                    />
                                </svg>
                            </Link>
                        ) : (
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
                        )}
                    </div>

                    {filteredPosts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {filteredPosts.map(post => (
                                    <Link
                                        key={post.id}
                                        href={`/blogs/${post.slug || post.id}`}
                                        className="block group"
                                    >
                                        <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
                                            {post.image ? (
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="h-48 w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/images/blog-placeholder.jpg';
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-48 bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500">Blog Image</span>
                                                </div>
                                            )}
                                            <div className="p-6">
                                                {post.blog_category && (
                                                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
                                                        {post.blog_category.name}
                                                    </span>
                                                )}
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                    {post.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>By {post.author || 'Admin'}</span>
                                                    <span>{formatDate(post.published_at || post.created_at)}</span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.last_page > 1 && (
                                <div className="mt-12 flex justify-center gap-2">
                                    {pagination.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePageChange(link.url)}
                                            disabled={!link.url}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">
                                {selectedCategoryObj
                                    ? `No blog posts found in the ${selectedCategoryObj.name} category.`
                                    : 'No blog posts found.'}
                            </p>
                            {selectedCategoryObj && (
                                <Link
                                    href="/blogs"
                                    className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    View all blog posts →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Blogs Section - Show again after main blog grid */}
            {blogData.length > 0 && (
                <FeaturedBlogsSection blogs={blogData} />
            )}

            {/* Blog Categories Section */}
            <BlogCategoriesSection categories={categories} />

            {/* Newsletter Section */}
            <section className="bg-gray-100 py-8">
                <div className="container mx-auto px-4 md:px-0 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Stay Updated
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Subscribe to our newsletter and never miss the latest real estate insights and market updates
                    </p>
                    <form className="max-w-md mx-auto flex gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>

            {/* FAQ Section */}
            <div className="faq-section">
                <FAQ />
            </div>

            {/* Real Estate Links Section */}
            <RealEstateLinksSection />
        </MainLayout>
    );
}