import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * Blog Section Component for Homepage
 * Displays latest blog posts in a grid
 */
const BlogSection = ({ blogs = [] }) => {
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

    return (
        <section className="py-8">
            <div className="max-w-[1280px] mx-auto px-4 md:px-0">
                {/* Section Header */}
                <div className="flex flex-row justify-between items-center mb-8 md:mb-12 h-[50px]">
                    {/* Blogs Title */}
                    <h2 className="font-space-grotesk font-bold text-[32px] md:text-[40px] leading-[40px] md:leading-[50px] tracking-[-0.03em] text-[#293056]">
                        Blogs
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

                {/* Blogs Grid - 3 columns on desktop, 1 on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {blogs.slice(0, 6).map((blog) => (
                        <BlogCard key={blog.id} blog={blog} formatDate={formatDate} />
                    ))}
                </div>

                {/* Show message if no blogs */}
                {blogs.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg">No blog posts available yet.</p>
                        <p className="text-sm mt-2">Check back soon for updates!</p>
                    </div>
                )}
            </div>
        </section>
    );
};

/**
 * Individual Blog Card Component
 */
const BlogCard = ({ blog, formatDate }) => {
    // Get category name from relationship or fallback to category field
    const categoryName = blog.blog_category?.name || blog.category || 'General';
    const categorySlug = blog.blog_category?.slug || blog.category?.toLowerCase() || 'general';

    return (
        <Link
            href={`/blogs/${blog.slug || blog.id}`}
            className="block group"
        >
            <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                {/* Blog Image */}
                {blog.image ? (
                    <img
                        src={blog.image}
                        alt={blog.title}
                        className="h-48 w-full object-cover"
                    />
                ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Blog Image</span>
                    </div>
                )}

                {/* Blog Content */}
                <div className="p-6">
                    {/* Category Badge */}
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
                        {categoryName}
                    </span>

                    {/* Blog Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {blog.title}
                    </h3>

                    {/* Blog Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {blog.excerpt || blog.content?.substring(0, 100) + '...'}
                    </p>

                    {/* Author and Date */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {blog.author || 'Admin'}</span>
                        <span>{formatDate(blog.published_at || blog.created_at)}</span>
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default BlogSection;