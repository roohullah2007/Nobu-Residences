import React from 'react';
import { Link } from '@inertiajs/react';

const FeaturedBlogsSection = ({ blogs = [] }) => {
    // Get the three most recent blogs
    const featuredBlogs = blogs.slice(0, 3);

    // If we don't have enough blogs, return null
    if (featuredBlogs.length < 3) {
        return null;
    }

    const mainBlog = featuredBlogs[0];
    const topSideBlog = featuredBlogs[1];
    const bottomSideBlog = featuredBlogs[2];

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).replace(',', '');
    };

    return (
        <section className="py-8">
            <div className="container mx-auto px-4 md:px-0">
                <div className="w-full max-w-[1280px] mx-auto h-auto md:h-[604px] flex flex-col md:flex-row gap-6">
                    {/* Main Featured Article */}
                    <Link
                        href={`/blogs/${mainBlog.slug || mainBlog.id}`}
                        className="w-full md:w-[815px] h-[400px] md:h-[604px] rounded-xl p-8 flex flex-col justify-end gap-2.5 relative overflow-hidden hover:scale-[1.01] transition-transform"
                        style={{
                            backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0.7) 60%), url('${mainBlog.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="flex flex-col gap-4">
                            {/* Category and Date */}
                            <div className="flex items-center gap-6 h-[22px]">
                                {mainBlog.blog_category && (
                                    <>
                                        <span className="text-white font-medium text-base leading-[140%] font-inter">
                                            {mainBlog.blog_category.name}
                                        </span>
                                        <div className="w-10 h-px bg-white"></div>
                                    </>
                                )}
                                <span className="text-white font-medium text-base leading-[140%] font-inter">
                                    {formatDate(mainBlog.published_at || mainBlog.created_at)}
                                </span>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-white font-medium text-[28px] md:text-[32px] leading-[130%] font-inter max-w-[586px]">
                                {mainBlog.title}
                            </h1>
                        </div>
                    </Link>

                    {/* Side Articles */}
                    <div className="w-full md:w-[441px] h-auto md:h-[604px] flex flex-col gap-[26px]">
                        {/* Top Article */}
                        <Link
                            href={`/blogs/${topSideBlog.slug || topSideBlog.id}`}
                            className="w-full h-[289px] rounded-xl p-6 flex flex-col justify-end gap-2.5 relative overflow-hidden hover:scale-[1.02] transition-transform"
                            style={{
                                backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(0, 0, 0, 0.6) 60%), url('${topSideBlog.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="flex flex-col gap-4">
                                {/* Category and Date */}
                                <div className="flex items-center gap-6 h-[27px]">
                                    {topSideBlog.blog_category && (
                                        <>
                                            <span className="text-white font-normal text-lg leading-[27px] tracking-[-0.03em] font-work-sans">
                                                {topSideBlog.blog_category.name}
                                            </span>
                                            <div className="w-10 h-px bg-white"></div>
                                        </>
                                    )}
                                    <span className="text-white font-normal text-lg leading-[27px] tracking-[-0.03em] font-work-sans">
                                        {formatDate(topSideBlog.published_at || topSideBlog.created_at)}
                                    </span>
                                </div>

                                {/* Heading */}
                                <h2 className="text-white font-bold text-[24px] md:text-[28px] leading-[32px] md:leading-[38px] tracking-[-0.03em] font-space-grotesk max-w-[388px]">
                                    {topSideBlog.title}
                                </h2>
                            </div>
                        </Link>

                        {/* Bottom Article */}
                        <Link
                            href={`/blogs/${bottomSideBlog.slug || bottomSideBlog.id}`}
                            className="w-full h-[289px] rounded-xl p-6 flex flex-col justify-end gap-2.5 relative overflow-hidden hover:scale-[1.02] transition-transform"
                            style={{
                                backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(0, 0, 0, 0.5) 60%), url('${bottomSideBlog.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="flex flex-col gap-4">
                                {/* Category and Date */}
                                <div className="flex items-center gap-6 h-[27px]">
                                    {bottomSideBlog.blog_category && (
                                        <>
                                            <span className="text-white font-normal text-lg leading-[27px] tracking-[-0.03em] font-work-sans">
                                                {bottomSideBlog.blog_category.name}
                                            </span>
                                            <div className="w-10 h-px bg-white"></div>
                                        </>
                                    )}
                                    <span className="text-white font-normal text-lg leading-[27px] tracking-[-0.03em] font-work-sans">
                                        {formatDate(bottomSideBlog.published_at || bottomSideBlog.created_at)}
                                    </span>
                                </div>

                                {/* Heading */}
                                <h2 className="text-white font-bold text-[24px] md:text-[28px] leading-[32px] md:leading-[38px] tracking-[-0.03em] font-space-grotesk max-w-[388px]">
                                    {bottomSideBlog.title}
                                </h2>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedBlogsSection;