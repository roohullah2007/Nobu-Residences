import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import { FAQ } from '@/Website/Global/Components';
import RealEstateLinksSection from '@/Website/Components/PropertyDetail/RealEstateLinksSection';

export default function Blog({ auth, siteName = 'NobuResidence', siteUrl, year, website, blogs, categories: backendCategories }) {
    // Use backend data or fallback to empty
    const blogData = blogs?.data || [];
    const pagination = blogs || null;

    // Combine backend categories with "All" option
    const categories = ['All', ...(backendCategories || [])];
    const [selectedCategory, setSelectedCategory] = React.useState('All');

    // Filter posts by selected category
    const filteredPosts = selectedCategory === 'All'
        ? blogData
        : blogData.filter(post => post.category === selectedCategory);

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
                className="relative bg-cover bg-center bg-no-repeat flex items-center"
                style={{
                    backgroundImage: 'url(/assets/building.jpg)',
                    height: '441px'
                }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                {/* Content */}
                <div className="relative z-10 text-left text-white container mx-auto px-4 md:px-8">
                    {/* Breadcrumb */}
                    <h3 className="text-lg md:text-xl font-medium mb-4">
                        / Blog
                    </h3>

                    {/* Main Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold max-w-3xl leading-tight">
                        Inspiration for Real Estate by real people
                    </h1>
                </div>
            </section>

            {/* Category Filter */}
            <section className="py-8 border-b">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    {filteredPosts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                {filteredPosts.map(post => (
                                    <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
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
                                            {post.category && (
                                                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
                                                    {post.category}
                                                </span>
                                            )}
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                                                <Link href={`/blog/${post.slug || post.id}`}>
                                                    {post.title}
                                                </Link>
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                                <span>By {post.author || 'Admin'}</span>
                                                <span>{formatDate(post.published_at || post.created_at)}</span>
                                            </div>
                                            <Link
                                                href={`/blog/${post.slug || post.id}`}
                                                className="text-blue-600 font-medium text-sm hover:text-blue-700"
                                            >
                                                Read More →
                                            </Link>
                                        </div>
                                    </article>
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
                            <p className="text-gray-600 text-lg">No blog posts found.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="bg-gray-100 py-16">
                <div className="container mx-auto px-4 text-center">
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