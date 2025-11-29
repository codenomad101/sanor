'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Heart, Filter, X, Loader2, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { productsApi, categoriesApi } from '@/lib/api'

interface Product {
  id: number
  name: string
  price: string
  originalPrice: string | null
  imageUrl: string | null
  sizes: string | null
  colors: string | null
  categoryId: number | null
  featured: boolean
  newArrival: boolean
}

interface Category {
  id: number
  name: string
  slug: string
  imageUrl: string | null
}

export default function ShopPage() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll(),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    setAddingToCart(product.id)
    try {
      const sizes = product.sizes?.split(',') || ['M']
      const colors = product.colors?.split(',') || ['Default']
      await addToCart(product.id, 1, sizes[0].trim(), colors[0].trim())
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
    setAddingToCart(null)
  }

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoryId === selectedCategory)
    : products

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sanor-purple-soft/20">
      <Navbar />

      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-sanor-purple">Home</Link>
            <ChevronRight size={14} />
            <span className="text-sanor-black">Shop</span>
            {selectedCategory && (
              <>
                <ChevronRight size={14} />
                <span className="text-sanor-black">{categories.find(c => c.id === selectedCategory)?.name}</span>
              </>
            )}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-sanor-black mb-2">
                {selectedCategory 
                  ? categories.find(c => c.id === selectedCategory)?.name 
                  : 'All Products'}
              </h1>
              <p className="text-gray-600">{filteredProducts.length} products</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn-secondary flex items-center gap-2 py-2 px-4"
            >
              <Filter size={18} />
              Filters
            </button>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="glass rounded-2xl p-6 sticky top-28">
                <h3 className="font-semibold text-sanor-black mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === null ? 'bg-sanor-pink text-white' : 'hover:bg-sanor-pink-soft'
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id ? 'bg-sanor-pink text-white' : 'hover:bg-sanor-pink-soft'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-sanor-black">Filters</h3>
                    <button onClick={() => setShowFilters(false)}>
                      <X size={24} />
                    </button>
                  </div>
                  <h4 className="font-medium text-sanor-black mb-3">Categories</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(null)
                        setShowFilters(false)
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === null ? 'bg-sanor-pink text-white' : 'hover:bg-sanor-pink-soft'
                      }`}
                    >
                      All Products
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setShowFilters(false)
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id ? 'bg-sanor-pink text-white' : 'hover:bg-sanor-pink-soft'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {/* Category Pills on Mobile */}
              <div className="md:hidden overflow-x-auto pb-4 mb-6 -mx-6 px-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-colors ${
                      selectedCategory === null 
                        ? 'bg-sanor-pink text-white' 
                        : 'bg-white border border-sanor-pink-light hover:bg-sanor-pink-soft'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-sanor-pink text-white' 
                          : 'bg-white border border-sanor-pink-light hover:bg-sanor-pink-soft'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={48} className="animate-spin text-sanor-pink" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 glass rounded-2xl">
                  <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
                  <h2 className="text-2xl font-semibold text-sanor-black mb-4">No products found</h2>
                  <p className="text-gray-600 mb-6">Check back later for new arrivals!</p>
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="btn-primary"
                  >
                    View All Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="product-card group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                      <div className="relative overflow-hidden aspect-[3/4]">
                        <img
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.newArrival && (
                            <span className="px-2 py-1 bg-sanor-pink text-white text-xs rounded-full">NEW</span>
                          )}
                          {product.originalPrice && (
                            <span className="px-2 py-1 bg-sanor-purple text-white text-xs rounded-full">SALE</span>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 bg-white rounded-full shadow-lg hover:bg-sanor-pink-soft transition-colors">
                            <Heart size={16} className="text-sanor-black" />
                          </button>
                        </div>

                        {/* Add to Cart */}
                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={addingToCart === product.id}
                            className="w-full py-2.5 bg-sanor-black text-white text-sm rounded-xl hover:bg-sanor-purple transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {addingToCart === product.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <ShoppingBag size={16} />
                            )}
                            {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-medium text-sanor-black text-sm mb-1 truncate">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sanor-black">₹{parseFloat(product.price).toLocaleString()}</span>
                          {product.originalPrice && (
                            <span className="text-gray-400 line-through text-sm">₹{parseFloat(product.originalPrice).toLocaleString()}</span>
                          )}
                        </div>
                        {product.sizes && (
                          <p className="text-xs text-gray-500 mt-1">Sizes: {product.sizes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
