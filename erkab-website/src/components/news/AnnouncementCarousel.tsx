'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AnnouncementImage } from '@/features/announcements/service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface AnnouncementCarouselProps {
  images?: AnnouncementImage[];
  title: string;
}

export function AnnouncementCarousel({ images = [], title }: AnnouncementCarouselProps) {
  const { locale } = useLanguage();
  const isAm = locale === 'am';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const validImages = images.filter((img) => img && img.imageUrl && img.imageUrl.trim().length > 0);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  }, [validImages.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  }, [validImages.length]);

  // Keyboard navigation when user is focusing or on page
  useEffect(() => {
    if (validImages.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [validImages.length, prevSlide, nextSlide]);

  if (!validImages || validImages.length === 0) {
    return null; // Preserve text-only layout without images
  }

  // Single Image Display (no carousel controls or indicators)
  if (validImages.length === 1) {
    const single = validImages[0];
    const isFailed = failedImages[single.imageUrl];

    return (
      <div className="w-100 mb-4">
        <div
          className="position-relative w-100 rounded-4 overflow-hidden shadow-sm border border-light-subtle"
          style={{ aspectRatio: '16 / 9', maxHeight: '460px', backgroundColor: '#071927' }}
        >
          {isFailed ? (
            <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white-50 p-4">
              <ImageIcon size={48} className="mb-2 opacity-50" />
              <span className="small">{isAm ? 'ምስሉን መጫን አልተቻለም' : 'Unable to load announcement image'}</span>
            </div>
          ) : (
            <Image
              src={single.imageUrl}
              alt={single.caption || title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 820px"
              style={{ objectFit: 'cover' }}
              onError={() => setFailedImages((prev) => ({ ...prev, [single.imageUrl]: true }))}
            />
          )}
        </div>
        {single.caption && (
          <div className="text-muted small mt-2 text-center fst-italic">
            {single.caption}
          </div>
        )}
      </div>
    );
  }

  // Multi-Image Interactive Carousel
  const currentImage = validImages[currentIndex] || validImages[0];
  const isCurrentFailed = failedImages[currentImage.imageUrl];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous
      prevSlide();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div className="w-100 mb-4">
      {/* Main Slideshow Frame */}
      <div
        className="position-relative w-100 rounded-4 overflow-hidden shadow-sm border border-light-subtle select-none"
        style={{
          aspectRatio: '16 / 9',
          maxHeight: '460px',
          backgroundColor: '#071927',
          userSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isCurrentFailed ? (
          <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white-50 p-4">
            <ImageIcon size={48} className="mb-2 opacity-50" />
            <span className="small">{isAm ? 'ምስሉን መጫን አልተቻለም' : 'Unable to load photo'}</span>
          </div>
        ) : (
          <Image
            key={currentImage.imageUrl}
            src={currentImage.imageUrl}
            alt={currentImage.caption || `${title} - slide ${currentIndex + 1}`}
            fill
            priority={currentIndex === 0}
            sizes="(max-width: 1200px) 100vw, 820px"
            style={{ objectFit: 'contain' }}
            onError={() => setFailedImages((prev) => ({ ...prev, [currentImage.imageUrl]: true }))}
          />
        )}

        {/* Counter Badge */}
        <div
          className="position-absolute top-0 end-0 m-3 px-2 py-1 rounded-pill bg-dark bg-opacity-75 text-white small fw-medium font-monospace"
          style={{ fontSize: '0.78rem', zIndex: 2 }}
        >
          {isAm
            ? `ፎቶ ${currentIndex + 1} ከ ${validImages.length}`
            : `${currentIndex + 1} / ${validImages.length}`}
        </div>

        {/* Previous Button */}
        <button
          type="button"
          onClick={prevSlide}
          className="btn btn-dark bg-opacity-75 text-white position-absolute top-50 start-0 translate-middle-y rounded-end-pill px-3 py-2 border-0 shadow"
          style={{ zIndex: 3 }}
          aria-label={isAm ? 'ቀዳሚ ፎቶ' : 'Previous slide'}
          title={isAm ? 'ቀዳሚ ፎቶ' : 'Previous photo'}
        >
          <ChevronLeft size={22} />
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={nextSlide}
          className="btn btn-dark bg-opacity-75 text-white position-absolute top-50 end-0 translate-middle-y rounded-start-pill px-3 py-2 border-0 shadow"
          style={{ zIndex: 3 }}
          aria-label={isAm ? 'ቀጣይ ፎቶ' : 'Next slide'}
          title={isAm ? 'ቀጣይ ፎቶ' : 'Next photo'}
        >
          <ChevronRight size={22} />
        </button>

        {/* Dot Indicators */}
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x pb-3 d-flex gap-1 align-items-center"
          style={{ zIndex: 3 }}
        >
          {validImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={isAm ? `ፎቶ ${idx + 1}` : `Go to slide ${idx + 1}`}
              className={`border-0 rounded-pill p-0 transition-all ${
                currentIndex === idx
                  ? 'bg-primary'
                  : 'bg-white bg-opacity-60'
              }`}
              style={{
                width: currentIndex === idx ? '20px' : '8px',
                height: '8px',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* Caption if provided */}
      {currentImage.caption && (
        <div className="text-muted small mt-2 text-center fst-italic">
          {currentImage.caption}
        </div>
      )}

      {/* Thumbnails Strip */}
      <div className="d-flex gap-2 mt-3 overflow-auto pb-1 justify-content-center">
        {validImages.map((img, idx) => (
          <button
            key={img.id || img.imageUrl}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`position-relative rounded-3 overflow-hidden border p-0 flex-shrink-0 transition-all ${
              currentIndex === idx
                ? 'border-primary border-2 shadow-sm'
                : 'border-light-subtle opacity-75'
            }`}
            style={{ width: '64px', height: '48px', backgroundColor: '#071927', cursor: 'pointer' }}
            aria-label={`Select photo ${idx + 1}`}
          >
            <Image
              src={img.imageUrl}
              alt={`Thumbnail ${idx + 1}`}
              fill
              sizes="64px"
              style={{ objectFit: 'cover' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
