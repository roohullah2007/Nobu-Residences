import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import { FAQ } from '@/Website/Global/Components';
import RealEstateLinksSection from '@/Website/Components/PropertyDetail/RealEstateLinksSection';

// Blog Card Component
const BlogCard = ({ post, formatDate, calculateReadTime }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    return (
        <article className="flex flex-col w-[300px] min-h-0 bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative">
            <Link href={`/blog/${post.slug || post.id}`} className="flex flex-col h-full text-inherit no-underline">
                {/* Image Container */}
                <div className="relative w-full h-[200px] overflow-hidden bg-gray-100 rounded-t-xl">
                    <div className="relative overflow-hidden w-full h-full transition-transform duration-300 group-hover:scale-105">
                        {/* Loading State */}
                        {imageLoading && !imageError && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-100">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-full h-full absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse"></div>
                                    <div className="relative z-10 w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="relative z-10 text-xs text-gray-600 font-medium">Loading image...</span>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {imageError && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50">
                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs font-medium">Image unavailable</span>
                                </div>
                            </div>
                        )}

                        <img
                            src={post.image || '/images/blog-placeholder.jpg'}
                            alt={post.title}
                            className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                                imageLoading ? 'opacity-50 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'
                            }`}
                            onLoad={() => {
                                setImageLoading(false);
                                setImageError(false);
                            }}
                            onError={(e) => {
                                if (!imageError) {
                                    setImageError(true);
                                    setImageLoading(false);
                                    e.target.src = '/images/blog-placeholder.jpg';
                                }
                            }}
                        />

                        {/* Badges */}
                        <div className="absolute inset-2 flex flex-col justify-between">
                            <div className="flex justify-between items-center gap-2.5 h-8">
                                {post.category && (
                                    <span className="flex items-center justify-center px-3 py-1.5 text-sm h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200">
                                        {post.category}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow items-start p-4 gap-2.5 box-border">
                    {/* Title */}
                    <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056] line-clamp-2">
                        {post.title}
                    </div>

                    <div className="flex flex-col items-start gap-2 w-full">
                        {/* Excerpt */}
                        <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-[#293056] line-clamp-3">
                            {post.excerpt}
                        </div>

                        {/* Author and Date */}
                        <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-600">
                            {post.author || 'Admin'} | {formatDate(post.published_at || post.created_at)}
                        </div>

                        {/* Read Time */}
                        <div className="flex items-center justify-start w-full min-h-8">
                            <div className="font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]">
                                {post.reading_time || calculateReadTime(post.content)}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default function BlogDetail({ auth, siteName = 'NobuResidence', siteUrl, year, website, blog, relatedPosts, recentPosts }) {
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

    // Calculate reading time
    const calculateReadTime = (content) => {
        if (!content) return '5 min read';
        const words = content.split(' ').length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min read`;
    };

    // Share functions
    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank');
    };

    const shareOnTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${blog.title}`, '_blank');
    };

    const shareOnLinkedIn = () => {
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${blog.title}`, '_blank');
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    return (
        <MainLayout auth={auth} website={website}>
            <Head title={blog.title} />

            {/* Hero Section with Featured Image */}
            {blog.image && (
                <section
                    className="relative bg-cover bg-center bg-no-repeat h-[400px] flex items-end"
                    style={{
                        backgroundImage: `url(${blog.image})`
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="relative z-10 container mx-auto px-4 pb-8">
                        <div className="max-w-4xl">
                            {blog.category && (
                                <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                                    {blog.category}
                                </span>
                            )}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                                {blog.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/90">
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {blog.author || 'Admin'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {formatDate(blog.published_at || blog.created_at)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {blog.reading_time || calculateReadTime(blog.content)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {blog.views || 0} views
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* If no image, show simple header */}
            {!blog.image && (
                <section className="bg-white border-b py-12">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            {blog.category && (
                                <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                                    {blog.category}
                                </span>
                            )}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                {blog.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {blog.author || 'Admin'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {formatDate(blog.published_at || blog.created_at)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {blog.reading_time || calculateReadTime(blog.content)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {blog.views || 0} views
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Main Content Section */}
            <article className="py-12 bg-white">
                <div className="max-w-[1280px] mx-auto px-4">
                    {/* Excerpt */}
                    {blog.excerpt && (
                        <div className="mb-8 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-600">
                            <p className="text-lg text-gray-700 italic">
                                {blog.excerpt}
                            </p>
                        </div>
                    )}

                    {/* Content */}
                    <div
                        className="prose prose-lg max-w-none mb-12 text-left"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Share Buttons */}
                    <div className="py-6 border-t border-b">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
                        <div className="flex flex-wrap gap-3">
                        <button
                            onClick={shareOnFacebook}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                        </button>
                        <button
                            onClick={shareOnTwitter}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                            Twitter
                        </button>
                        <button
                            onClick={shareOnLinkedIn}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                        </button>
                        <button
                            onClick={copyLink}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copy Link
                        </button>
                        </div>
                    </div>
                </div>
            </article>


            {/* Recent Blogs Section */}
            {recentPosts && recentPosts.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-[1280px] mx-auto px-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">
                            Recent Articles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recentPosts.map(post => (
                                <BlogCard
                                    key={post.id}
                                    post={post}
                                    formatDate={formatDate}
                                    calculateReadTime={calculateReadTime}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Back to Blog */}
            <section className="py-8">
                <div className="container mx-auto px-4 text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Blog
                    </Link>
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