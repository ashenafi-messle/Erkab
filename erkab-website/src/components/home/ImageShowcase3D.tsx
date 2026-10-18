'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Container } from '../layout/Container';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles, ImageOff } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface ShowcaseImage {
  id: string;
  url: string;
  alt: string;
  title: string;
  subtitle: string;
}

export const SHOWCASE_IMAGES: ShowcaseImage[] = [
  {
    id: 'showcase-1',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311076/5947544860829093950.jpg',
    alt: 'Erkab leaders and community elders touring the interior of the newly built training center hall in Gondar',
    title: 'Community Tour & Hall Inspection',
    subtitle: 'Gondar Training Center Campus',
  },
  {
    id: 'showcase-2',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311077/5947544860829093946.jpg',
    alt: 'Exterior architectural view of the Dr. John Rawls Computer Training Center building in Gondar with Ethiopian flag flying',
    title: 'Dr. John Rawls Computer Center',
    subtitle: 'Main Facility & Training Campus',
  },
  {
    id: 'showcase-3',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311077/5947544860829093952.jpg',
    alt: 'Community members and youth gathered inside the newly constructed center hall reviewing training initiatives',
    title: 'Youth & Community Gathering',
    subtitle: 'Orienting Future Tech Pioneers',
  },
  {
    id: 'showcase-4',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311076/5947544860829093949.jpg',
    alt: 'Erkab coordinator standing proudly before the Kamal Foundation donor recognition wall honoring community supporters',
    title: 'Donor Wall of Honor & Gratitude',
    subtitle: 'Recognizing Global Benefactors',
  },
  {
    id: 'showcase-5',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311076/5947544860829093942.jpg',
    alt: 'Painted exterior wall sign reading Dr. John Rawls Computer Training Center Gondar Ethiopia',
    title: 'Center Dedication Signage',
    subtitle: 'A Landmark of Digital Opportunity',
  },
  {
    id: 'showcase-6',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311076/5947544860829093945.jpg',
    alt: 'Community elders, officials, and organizers cutting the ceremonial ribbon during the training center opening',
    title: 'Grand Opening Ribbon Cutting',
    subtitle: 'Inauguration of Vocational Excellence',
  },
  {
    id: 'showcase-7',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311075/5947544860829093926.jpg',
    alt: 'Spacious computer training lab equipped with modern desktop workstations and daylight seating',
    title: 'Modern Workstation Computer Lab',
    subtitle: 'High-Tech Digital Learning Spaces',
  },
  {
    id: 'showcase-8',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311076/5947544860829093947.jpg',
    alt: 'Student in a white laboratory coat conducting practical scientific research with a microscope',
    title: 'Hands-on Scientific & Lab Training',
    subtitle: 'Practical Vocational Experience',
  },
  {
    id: 'showcase-9',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311076/5947544860829093934.jpg',
    alt: 'Francesca Library and Kamal Foundation commemorative donor inscription wall on brick masonry',
    title: 'Francesca Library Memorial Wall',
    subtitle: 'Community-Funded Educational Wing',
  },
  {
    id: 'showcase-10',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311076/5947544860829093939.jpg',
    alt: 'Artisan hand-painting the Amharic title for the Dr. John Rawls Computer Training Center on the exterior brick',
    title: 'Traditional Hand-Crafted Signage',
    subtitle: 'Local Artistry Meets Digital Future',
  },
  {
    id: 'showcase-11',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311076/5947544860829093898.jpg',
    alt: 'Erkab leadership and community partners holding an organizational planning session in the center office',
    title: 'Leadership & Partner Planning Session',
    subtitle: 'Strategic Community Development',
  },
  {
    id: 'showcase-12',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311075/5947544860829093933.jpg',
    alt: 'Commemorative brick wall listing global diaspora and foundation sponsors supporting the center',
    title: 'Global Diaspora Sponsor Wall',
    subtitle: 'Diaspora & Foundation Partnerships',
  },
  {
    id: 'showcase-13',
    url: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792311579/Screenshot_2026-10-17_093446.png',
    alt: 'Group portrait of the Erkab instructors, project coordinators, and community leaders at the training facility',
    title: 'Instructional & Project Leadership Team',
    subtitle: 'Mentors Shaping Tomorrow’s Leaders',
  },
];

const AUTOPLAY_INTERVAL_MS = 3000;

export function ImageShowcase3D() {
  const { locale } = useLanguage();
  const isAm = locale === 'am';

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const total = SHOWCASE_IMAGES.length;

  // Check user preference for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (e.matches) setIsPlaying(false);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // Autoplay management
  useEffect(() => {
    if (!isPlaying || isHovered || isFocused || isReducedMotion) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      goToNext();
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, isHovered, isFocused, isReducedMotion, goToNext]);

  // Page visibility listener: pause when tab hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else if (isPlaying && !isHovered && !isFocused && !isReducedMotion) {
        if (!timerRef.current) {
          timerRef.current = setInterval(() => {
            goToNext();
          }, AUTOPLAY_INTERVAL_MS);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, isHovered, isFocused, isReducedMotion, goToNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    } else if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      togglePlayPause();
    }
  };

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diffX = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45; // 45px threshold

    if (diffX > minSwipeDistance) {
      goToNext();
    } else if (diffX < -minSwipeDistance) {
      goToPrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  // Calculate circular offset for 3D positioning
  const getOffset = (index: number) => {
    let diff = index - activeIndex;
    if (diff > Math.floor(total / 2)) {
      diff -= total;
    } else if (diff < -Math.floor(total / 2)) {
      diff += total;
    }
    return diff;
  };

  const getSlideClass = (offset: number) => {
    if (offset === 0) return 'showcase-slide-active';
    if (offset === 1) return 'showcase-slide-next-1';
    if (offset === -1) return 'showcase-slide-prev-1';
    if (offset === 2) return 'showcase-slide-next-2';
    if (offset === -2) return 'showcase-slide-prev-2';
    if (offset === 3) return 'showcase-slide-next-3';
    if (offset === -3) return 'showcase-slide-prev-3';
    return 'showcase-slide-hidden';
  };

  const currentItem = SHOWCASE_IMAGES[activeIndex];

  return (
    <section
      className="showcase-3d-section"
      aria-roledescription="carousel"
      aria-label={
        isAm ? 'የእርካብ ግቢ እና የማህበረሰብ 3D ምስል ማሳያ' : 'Erkab Campus & Community 3D Image Showcase'
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Container>
        {/* Section Heading */}
        <div className="showcase-header text-center">
          <div className="d-inline-flex align-items-center gap-2 mb-2">
            <span className="erkab-badge badge-blue">
              <Sparkles size={14} />
              <span>{isAm ? 'የግቢ እና የማህበረሰብ ዕይታ' : 'Campus & Community Showcase'}</span>
            </span>
          </div>

          <h2 className="showcase-title">
            {isAm ? 'መማር፣ መፍጠር እና የወደፊቱን መገንባት' : 'Learning, Creating & Building the Future'}
          </h2>

          <p className="showcase-subtitle">
            {isAm
              ? 'የእርካብ ማህበረሰብን የሚያነሳሱ ዕድሎችን፣ ሀሳቦችን እና ተግባራዊ ክህሎቶችን ይመልከቱ።'
              : 'Discover the opportunities, ideas, and practical skills that inspire the Erkab community.'}
          </p>
        </div>

        {/* 3D Gallery Stage */}
        <div
          className="showcase-stage-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="showcase-stage-track">
            {SHOWCASE_IMAGES.map((item, index) => {
              const offset = getOffset(index);
              const slideClass = getSlideClass(offset);
              const isCenter = offset === 0;
              const hasFailed = failedImages[index];
              const isInitialCenter = index === 0;

              return (
                <div
                  key={item.id}
                  className={`showcase-slide ${slideClass}`}
                  onClick={() => {
                    if (!isCenter) goToIndex(index);
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${total}: ${item.title}`}
                  aria-hidden={!isCenter}
                >
                  <div className="showcase-card">
                    {/* Image or Fallback */}
                    {hasFailed ? (
                      <div className="showcase-fallback">
                        <ImageOff size={44} className="text-white-50 mb-2" />
                        <span className="small text-white fw-semibold">{item.title}</span>
                      </div>
                    ) : (
                      <Image
                        src={item.url}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 640px) 88vw, (max-width: 991px) 65vw, 620px"
                        priority={isInitialCenter}
                        className="showcase-img"
                        onError={() => handleImageError(index)}
                      />
                    )}

                    {/* Gradient overlay for depth */}
                    <div className="showcase-card-overlay" />

                    {/* Active Card Label & Badge */}
                    {isCenter && (
                      <div className="showcase-caption">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="showcase-caption-tag">{item.subtitle}</span>
                          <span className="showcase-counter">
                            {index + 1} / {total}
                          </span>
                        </div>
                        <h3 className="showcase-caption-title">{item.title}</h3>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accessible Controls Bar */}
        <div className="showcase-controls-wrapper">
          <div className="showcase-controls-bar">
            {/* Previous Button */}
            <button
              type="button"
              className="showcase-btn"
              onClick={goToPrev}
              aria-label={isAm ? 'ቀዳሚ ምስል' : 'Previous image'}
              title={isAm ? 'ቀዳሚ' : 'Previous (Left Arrow)'}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              className={`showcase-btn showcase-btn-toggle ${!isPlaying ? 'showcase-btn-paused' : ''}`}
              onClick={togglePlayPause}
              aria-label={
                isPlaying
                  ? isAm
                    ? 'ስላይድ አቁም'
                    : 'Pause automatic sliding'
                  : isAm
                  ? 'ስላይድ ጀምር'
                  : 'Start automatic sliding'
              }
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '2px' }} />}
              <span className="showcase-btn-label">
                {isPlaying ? (isAm ? 'አፍታ አቁም' : 'Pause') : isAm ? 'ቀጥል' : 'Play'}
              </span>
            </button>

            {/* Next Button */}
            <button
              type="button"
              className="showcase-btn"
              onClick={goToNext}
              aria-label={isAm ? 'ቀጣይ ምስል' : 'Next image'}
              title={isAm ? 'ቀጣይ' : 'Next (Right Arrow)'}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Pagination Indicators (13 Dots) */}
          <div
            className="showcase-dots"
            role="tablist"
            aria-label={isAm ? 'የምስል ምርጫዎች' : 'Showcase slide navigation'}
          >
            {SHOWCASE_IMAGES.map((img, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={`dot-${img.id}`}
                  type="button"
                  role="tab"
                  className={`showcase-dot ${isActive ? 'showcase-dot-active' : ''}`}
                  onClick={() => goToIndex(idx)}
                  aria-label={`${isAm ? 'ምስል' : 'Slide'} ${idx + 1}: ${img.title}`}
                  aria-selected={isActive}
                  title={`${idx + 1}: ${img.title}`}
                />
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
