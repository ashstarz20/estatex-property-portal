import React, { useState, useEffect } from 'react';
import { useAuth, useProtectedApi } from '../contexts/AuthContext';

const BannerCarousel = () => {
  const { user } = useAuth();
  const api = useProtectedApi();
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fallback banner images from Pexels
  const fallbackBanners = [
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
    'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
    'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg'
  ];

  useEffect(() => {
    fetchBanners();
    const interval = setInterval(nextBanner, 5000); // Auto-advance every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      // Start with fallback banners
      setBanners(fallbackBanners);
      
      // Try to fetch custom banners if user is logged in
      if (user?.subscription?.locations) {
        const locations = user.subscription.locations
          .map(loc => loc.name)
          .join(',');

        const response = await api.get('/location/banners', {
          params: { location: locations }
        });

        if (response.data.data && response.data.data.length > 0) {
          setBanners(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      // Keep using fallback banners on error
    } finally {
      setLoading(false);
    }
  };

  const nextBanner = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previousBanner = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToBanner = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="relative h-96 bg-gray-200 animate-pulse rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yinmn-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 overflow-hidden rounded-lg">
      {/* Banner Images */}
      <div 
        className="relative h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        <div className="absolute top-0 left-0 flex h-full w-full">
          {banners.map((banner, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-full h-full"
              style={{ left: `${index * 100}%` }}
            >
              <img
                src={banner}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackBanners[index % fallbackBanners.length];
                }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={previousBanner}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToBanner(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-200
              ${index === currentIndex 
                ? 'bg-white' 
                : 'bg-white/50 hover:bg-white/75'
              }`}
          >
            <span className="sr-only">Go to banner {index + 1}</span>
          </button>
        ))}
      </div>

      {/* Banner Content */}
      <div className="absolute bottom-16 left-0 right-0 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">
          Discover Premium Properties
        </h2>
        <p className="text-xl">
          Your Gateway to Exclusive Real Estate Opportunities
        </p>
      </div>
    </div>
  );
};

export default BannerCarousel;
