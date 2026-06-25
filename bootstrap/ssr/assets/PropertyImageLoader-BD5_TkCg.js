import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
const PropertyImageLoader = ({
  listingKey,
  alt,
  className,
  fallbackImage = null,
  enableLazyLoading = true
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!enableLazyLoading);
  const imgRef = useRef();
  useEffect(() => {
    if (!enableLazyLoading) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50px", threshold: 0.1 }
      // Same as plugin config
    );
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    return () => observer.disconnect();
  }, [enableLazyLoading]);
  useEffect(() => {
    if (inView && listingKey && !imageUrl && !error) {
      fetchPropertyImage(listingKey);
    }
  }, [inView, listingKey, imageUrl, error]);
  const fetchPropertyImage = async (key) => {
    if (!key || key.trim() === "") {
      setError(true);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/property-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        },
        body: JSON.stringify({
          listing_keys: [key.trim()],
          batch: false
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.images && data.images[key]) {
        const imageData = data.images[key];
        if (imageData.image_url && !imageData.is_placeholder) {
          setImageUrl(imageData.image_url);
        } else {
          setError(true);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching property image:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  const getDisplayImage = () => {
    if (imageUrl) return imageUrl;
    if (fallbackImage) return fallbackImage;
    return null;
  };
  if (!inView) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref: imgRef,
        className: `${className} bg-gray-200 flex items-center justify-center`,
        children: /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-sm", children: "Loading..." })
      }
    );
  }
  const displayImage = getDisplayImage();
  return /* @__PURE__ */ jsxs("div", { ref: imgRef, className: "relative w-full h-full", children: [
    loading && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gray-200/80 flex items-center justify-center z-10", children: /* @__PURE__ */ jsx("div", { className: "w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" }) }),
    displayImage ? /* @__PURE__ */ jsx(
      "img",
      {
        src: displayImage,
        alt,
        className: `${className} ${loading ? "opacity-50" : "opacity-100"} transition-opacity duration-300`,
        onError: () => {
          if (!error) {
            setError(true);
            setLoading(false);
          }
        },
        onLoad: () => setLoading(false)
      }
    ) : (
      // Show a gray placeholder when no image available
      /* @__PURE__ */ jsx("div", { className: `${className} bg-gray-200 flex items-center justify-center`, children: /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-sm", children: "No Image" }) })
    )
  ] });
};
export {
  PropertyImageLoader as default
};
