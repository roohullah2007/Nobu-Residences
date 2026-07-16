import React, { useMemo, useRef, useState } from 'react';
import PluginStyleImageLoader from '@/Website/Components/PluginStyleImageLoader';

const MAX_SLIDES = 8;

/**
 * PropertyCardImageCarousel - Slidable image strip for listing cards.
 *
 * Renders the card photo as a horizontal scroll-snap carousel when the
 * listing has more than one image: swipe on touch devices, hover arrows on
 * desktop, dot indicators. Falls back to the single PluginStyleImageLoader
 * when there is only one (or no) image, so cards without extra photos are
 * untouched.
 *
 * Lives inside the card's <a> wrapper, so the arrows stop propagation to
 * avoid navigating; native horizontal scrolling never fires the link click.
 *
 * @param {string} imageUrl - Primary image URL (first slide)
 * @param {Array} images - Extra images: strings or {MediaURL}/{url} objects
 * @param {string} alt - Alt text base for the slides
 * @param {string} imageClassName - Classes for the first-slide loader
 * @param {string} listingKey - Listing key (data attribute passthrough)
 */
const PropertyCardImageCarousel = ({ imageUrl, images = [], alt = '', imageClassName = '', listingKey }) => {
  const trackRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Normalize to a deduped list of URLs, primary image first.
  const slides = useMemo(() => {
    const urls = [];
    const push = (candidate) => {
      const url = typeof candidate === 'string'
        ? candidate
        : candidate?.MediaURL || candidate?.url || candidate?.image_url || '';
      if (url && !urls.includes(url)) urls.push(url);
    };
    push(imageUrl);
    (Array.isArray(images) ? images : []).forEach(push);
    return urls.slice(0, MAX_SLIDES);
  }, [imageUrl, images]);

  const hasMultipleSlides = slides.length > 1;

  if (!hasMultipleSlides) {
    // Single image keeps the original card behavior, including the
    // hover zoom (dropped in carousel mode where slides scroll).
    return (
      <PluginStyleImageLoader
        src={imageUrl}
        alt={alt}
        className={`${imageClassName} transition-transform duration-300 group-hover:scale-105`}
        enableLazyLoading={true}
        rootMargin="200px"
        threshold={0.01}
        enableBlurEffect={true}
        priority="normal"
        data-listing-key={listingKey}
      />
    );
  }

  const scrollToSlide = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
  };

  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    setCurrentSlide(Math.round(track.scrollLeft / track.clientWidth));
  };

  const arrowClass = 'hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#293056] shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200';

  return (
    <div className="relative w-full h-full">
      <div
        ref={trackRef}
        onScroll={handleTrackScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain"
      >
        {slides.map((url, index) => (
          <div key={url} className="w-full h-full flex-shrink-0 snap-center">
            {index === 0 ? (
              <PluginStyleImageLoader
                src={url}
                alt={alt}
                className={imageClassName}
                enableLazyLoading={true}
                rootMargin="200px"
                threshold={0.01}
                enableBlurEffect={true}
                priority="normal"
                data-listing-key={listingKey}
              />
            ) : (
              <img
                src={url}
                alt={`${alt} - photo ${index + 1}`}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {currentSlide > 0 && (
        <button type="button" onClick={(e) => scrollToSlide(e, -1)} className={`${arrowClass} left-2`} aria-label="Previous photo">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {currentSlide < slides.length - 1 && (
        <button type="button" onClick={(e) => scrollToSlide(e, 1)} className={`${arrowClass} right-2`} aria-label="Next photo">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Dot indicators - sit between the Compare and heart chips */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 pointer-events-none">
        {slides.map((url, index) => (
          <span
            key={url}
            className={`rounded-full shadow transition-all duration-200 ${
              index === currentSlide ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertyCardImageCarousel;
