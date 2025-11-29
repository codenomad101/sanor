'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { categoriesApi } from '@/lib/api'
import { Loader2 } from 'lucide-react'

interface Category {
    id: number
    name: string
    slug: string
    description: string | null
    imageUrl: string | null
}

export default function CollectionsPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const data = await categoriesApi.getAll()
            setCategories(data)
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 size={48} className="animate-spin text-sanor-purple" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-sanor-black mb-4">Our Collections</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Explore our carefully curated categories designed to elevate your lifestyle.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categories.map((category, index) => {
                            // Fallback images for each category
                            const fallbackImages: Record<string, string> = {
                                'sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
                                'kurtis': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
                                'tops': 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=400&fit=crop',
                                'jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
                                'dresses': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop',
                                'lehengas': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop',
                                'bags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
                                'jewelry': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
                                'footwear': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop',
                                'ethnic-wear': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop',
                            }
                            const imageUrl = category.imageUrl || fallbackImages[category.slug] || `https://picsum.photos/400/400?random=${index}`

                            return (
                                <Link
                                    key={category.id}
                                    href={`/shop?category=${category.id}`}
                                    className="group relative overflow-hidden rounded-2xl aspect-[4/5] block"
                                >
                                    <img
                                        src={imageUrl}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                        <h3 className="text-white text-xl font-bold mb-1">{category.name}</h3>
                                        {category.description && (
                                            <p className="text-white/80 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                                {category.description}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </main>
        </div>
    )
}
