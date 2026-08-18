import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Sparkles,
    GraduationCap,
    BookOpen,
} from 'lucide-react';
import Button from '@/Components/Button';

export default function HeroCarousel({ slides = [], className = '' }) {
    const { ppdb } = usePage().props;
    const isPpdbOpen = !!ppdb?.isOpen;

    // Filter active slides
    const activeSlides = slides && slides.length > 0 ? slides : [];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);

    const timerRef = useRef(null);
    const containerRef = useRef(null);

    // Fallback slide data if no active slides available
    const fallbackSlide = {
        id: 'fallback',
        subtitle: 'Portal Pendidikan Modern 2026/2027',
        title: 'Membentuk Generasi Cerdas, Berkarakter & Berdaya Saing Global.',
        description: 'Selamat datang di website resmi sekolah. Temukan informasi terbaru mengenai kegiatan, prestasi, pembelajaran virtual, dan profil sekolah.',
        image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
        button_text: isPpdbOpen ? 'Daftar Siswa Baru' : 'Lihat Profil Sekolah',
        button_url: isPpdbOpen ? '/pendaftaran' : '/profil',
        secondary_button_text: 'Program Unggulan',
        secondary_button_url: '/profil',
        text_position: 'left',
        overlay_type: 'gradient',
        duration: 5000,
    };

    const effectiveSlides = activeSlides.length > 0 ? activeSlides : [fallbackSlide];
    const totalSlides = effectiveSlides.length;

    // Navigation functions
    const goToNext = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, [totalSlides]);

    const goToPrev = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }, [totalSlides]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Auto play timer with custom duration per slide
    useEffect(() => {
        if (totalSlides <= 1 || isPaused) {
            return;
        }

        const currentDuration = effectiveSlides[currentSlide]?.duration || 5000;

        timerRef.current = setTimeout(() => {
            goToNext();
        }, currentDuration);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [currentSlide, totalSlides, isPaused, effectiveSlides, goToNext]);

    // Keyboard navigation (ArrowLeft & ArrowRight)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                goToNext();
            } else if (e.key === 'ArrowLeft') {
                goToPrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrev]);

    // Touch Swipe Handlers for Mobile
    const handleTouchStart = (e) => {
        setIsPaused(true);
        setTouchStartX(e.targetTouches[0].clientX);
        setTouchEndX(null);
    };

    const handleTouchMove = (e) => {
        setTouchEndX(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        setIsPaused(false);
        if (!touchStartX || !touchEndX) return;

        const distance = touchStartX - touchEndX;
        const minSwipeDistance = 50; // threshold in pixels

        if (distance > minSwipeDistance) {
            // Swiped left -> Next
            goToNext();
        } else if (distance < -minSwipeDistance) {
            // Swiped right -> Previous
            goToPrev();
        }

        setTouchStartX(null);
        setTouchEndX(null);
    };

    // Adapt CTA according to PPDB status
    const resolveCta = (text, url) => {
        if (!text || !url) return { text: null, url: null };

        // If PPDB is closed and this CTA points to registration, adapt to alternative profile CTA
        if (!isPpdbOpen && (url.includes('/pendaftaran') || text.toLowerCase().includes('daftar'))) {
            return {
                text: 'Pelajari Program',
                url: '/profil',
            };
        }

        return { text, url };
    };

    const renderButton = (btnText, btnUrl, isPrimary = true, isLight = false) => {
        const { text, url } = resolveCta(btnText, btnUrl);
        if (!text || !url) return null;

        const isInternal = url.startsWith('/') && !url.startsWith('//');
        const buttonClasses = isPrimary
            ? isLight
                ? 'bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-xl shadow-brand-600/30'
                : 'bg-brand-500 hover:bg-brand-400 text-white font-bold shadow-xl shadow-brand-500/30 ring-2 ring-brand-400/30'
            : isLight
            ? 'bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 border border-slate-300 font-semibold backdrop-blur-md'
            : 'bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md font-semibold';

        if (isInternal) {
            return (
                <Link href={url}>
                    <Button
                        variant={isPrimary ? 'primary' : 'glass'}
                        size="lg"
                        rightIcon={isPrimary ? ArrowRight : undefined}
                        className={`${buttonClasses} text-sm sm:text-base px-6 py-3.5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5`}
                    >
                        {text}
                    </Button>
                </Link>
            );
        }

        return (
            <a href={url} target="_blank" rel="noopener noreferrer">
                <Button
                    variant={isPrimary ? 'primary' : 'glass'}
                    size="lg"
                    rightIcon={isPrimary ? ArrowRight : undefined}
                    className={`${buttonClasses} text-sm sm:text-base px-6 py-3.5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5`}
                >
                    {text}
                </Button>
            </a>
        );
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full min-h-[100svh] flex flex-col justify-between overflow-hidden select-none group ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="region"
            aria-label="Full Page Hero Carousel Banner"
        >
            {/* Slides Background and Content Container */}
            {effectiveSlides.map((slide, index) => {
                const isActive = index === currentSlide;
                const isLight = slide.overlay_type === 'light';

                return (
                    <div
                        key={slide.id || index}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col justify-between ${
                            isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                        aria-hidden={!isActive}
                    >
                        {/* Background Image with subtle Ken Burns zoom */}
                        <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-950">
                            <img
                                src={slide.image_url}
                                alt={slide.title}
                                className={`w-full h-full object-cover transition-transform duration-7000 ease-out motion-reduce:transform-none ${
                                    isActive ? 'scale-105' : 'scale-100'
                                }`}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80';
                                }}
                            />

                            {/* Dynamic Layered Overlay */}
                            <div
                                className={`absolute inset-0 ${
                                    slide.overlay_type === 'dark'
                                        ? 'bg-slate-950/80 backdrop-blur-xs'
                                        : slide.overlay_type === 'light'
                                        ? 'bg-white/85 backdrop-blur-xs'
                                        : slide.text_position === 'center'
                                        ? 'bg-radial from-slate-950/70 via-slate-950/80 to-slate-950/95'
                                        : slide.text_position === 'right'
                                        ? 'bg-gradient-to-l from-slate-950/95 via-slate-950/70 to-slate-950/30'
                                        : 'bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/30'
                                }`}
                            />
                        </div>

                        {/* Top Spacer for Overlay Header & Navbar */}
                        <div className="w-full h-12 sm:h-16" />

                        {/* Main Slide Content constrained in standard max-w-7xl container */}
                        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto py-8">
                            <div
                                className={`space-y-5 sm:space-y-7 ${
                                    slide.text_position === 'center'
                                        ? 'max-w-3xl mx-auto text-center'
                                        : slide.text_position === 'right'
                                        ? 'max-w-3xl ml-auto text-right'
                                        : 'max-w-3xl text-left'
                                }`}
                            >
                                {/* Subtitle Pill */}
                                {slide.subtitle && (
                                    <div
                                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase shadow-md ${
                                            isLight
                                                ? 'bg-brand-100/95 text-brand-900 border border-brand-300'
                                                : 'bg-white/15 text-brand-200 border border-white/20 backdrop-blur-md'
                                        }`}
                                    >
                                        <Sparkles className="w-4 h-4 text-brand-400" />
                                        <span>{slide.subtitle}</span>
                                    </div>
                                )}

                                {/* Main Title */}
                                <h1
                                    className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] drop-shadow-lg ${
                                        isLight ? 'text-slate-950' : 'text-white'
                                    }`}
                                >
                                    {slide.title}
                                </h1>

                                {/* Description */}
                                {slide.description && (
                                    <p
                                        className={`text-sm sm:text-lg lg:text-xl leading-relaxed max-w-2xl ${
                                            slide.text_position === 'center' ? 'mx-auto' : ''
                                        } ${
                                            isLight ? 'text-slate-700' : 'text-slate-200/90 font-normal'
                                        }`}
                                    >
                                        {slide.description}
                                    </p>
                                )}

                                {/* CTA Buttons */}
                                {(slide.button_text || slide.secondary_button_text) && (
                                    <div
                                        className={`pt-2 sm:pt-4 flex flex-wrap items-center gap-4 ${
                                            slide.text_position === 'center'
                                                ? 'justify-center'
                                                : slide.text_position === 'right'
                                                ? 'justify-end'
                                                : 'justify-start'
                                        }`}
                                    >
                                        {renderButton(slide.button_text, slide.button_url, true, isLight)}
                                        {renderButton(slide.secondary_button_text, slide.secondary_button_url, false, isLight)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Spacer for Dot Navigation */}
                        <div className="w-full h-16 sm:h-20" />
                    </div>
                );
            })}

            {/* Navigation Arrows (‹ and ›) */}
            {totalSlides > 1 && (
                <>
                    <button
                        type="button"
                        onClick={goToPrev}
                        aria-label="Previous slide"
                        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 opacity-75 hover:opacity-100 hover:scale-110 shadow-2xl cursor-pointer"
                    >
                        <ChevronLeft className="w-7 h-7" />
                    </button>

                    <button
                        type="button"
                        onClick={goToNext}
                        aria-label="Next slide"
                        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 opacity-75 hover:opacity-100 hover:scale-110 shadow-2xl cursor-pointer"
                    >
                        <ChevronRight className="w-7 h-7" />
                    </button>
                </>
            )}

            {/* Bottom Dot Indicators */}
            {totalSlides > 1 && (
                <div className="absolute bottom-8 inset-x-0 z-20 flex items-center justify-center gap-2.5">
                    {effectiveSlides.map((_, idx) => {
                        const isCurrent = idx === currentSlide;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => goToSlide(idx)}
                                aria-label={`Menuju slide ${idx + 1}`}
                                className={`transition-all duration-300 rounded-full cursor-pointer ${
                                    isCurrent
                                        ? 'w-10 h-3 bg-brand-400 shadow-lg shadow-brand-400/50'
                                        : 'w-3 h-3 bg-white/40 hover:bg-white/70'
                                }`}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
