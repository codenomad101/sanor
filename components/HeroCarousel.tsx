'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react'

const slides = [
    {
        id: 1,
        type: 'default',
        title: 'Summer Sale',
        subtitle: 'Up to 50% Off',
        description: 'Discover amazing deals on sarees, kurtis, jeans & more!',
        ctaText: 'Shop Now',
        ctaLink: '/shop',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop',
        gradient: 'bg-[#660033]', // Burgundy solid
        badge: 'Limited Time Offer',
        icon: Sparkles
    },
    {
        id: 2,
        type: 'bags',
        title: 'Latest Bags Collection',
        subtitle: 'Carry Style With You',
        description: 'Explore our premium range of handbags, clutches, and totes.',
        ctaText: 'View Collection',
        ctaLink: '/shop?category=bags', // Assuming 'bags' category ID or slug handling
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=600&fit=crop',
        gradient: 'bg-[#660033]', // Burgundy solid
        badge: 'New Arrivals',
        icon: ShoppingBag
    },
    {
        id: 3,
        type: 'ethnic',
        title: 'Ethnic Elegance',
        subtitle: 'Traditional & Timeless',
        description: 'Handpicked sarees and lehengas for your special occasions.',
        ctaText: 'Explore Ethnic',
        ctaLink: '/shop?category=ethnic-wear',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop',
        gradient: 'bg-[#660033]', // Burgundy solid
        badge: 'Featured Collection',
        icon: Sparkles
    }
]

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    useEffect(() => {
        if (!isAutoPlaying) return

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isAutoPlaying])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setIsAutoPlaying(false)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        setIsAutoPlaying(false)
    }

    return (
        <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
            <div
                className="flex transition-transform duration-700 ease-out h-[500px] md:h-[400px]"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className={`w-full flex-shrink-0 relative ${slide.gradient} p-8 md:p-12 flex items-center`}
                    >
                        {/* Background Decorations */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

                        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                                    <slide.icon size={14} className="text-white" />
                                    <span className="text-sm text-white font-medium">{slide.badge}</span>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                                    {slide.title}
                                    <span className="block text-white/90 text-2xl md:text-4xl mt-2 font-normal">{slide.subtitle}</span>
                                </h1>

                                <p className="text-white/90 mb-8 max-w-md text-lg mx-auto md:mx-0">
                                    {slide.description}
                                </p>

                                <Link
                                    href={slide.ctaLink}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
                                >
                                    {slide.ctaText}
                                    <ArrowRight size={20} />
                                </Link>
                            </div>

                            <div className="hidden md:block flex-1 max-w-md">
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronLeft size={24} />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setCurrentSlide(index)
                            setIsAutoPlaying(false)
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
