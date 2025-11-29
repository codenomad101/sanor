'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Heart, ChevronRight, Star, Sparkles, Loader2, Percent, Truck, Shield, Clock } from 'lucide-react'
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
  featured: boolean
  newArrival: boolean
  categoryId: number | null
}

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
}

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [user])

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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-sanor-pink" />
      </div>
    )
  }

  // Show Landing Page when NOT logged in
  if (!user) {
    return <LandingPage />
  }

  // Show Home Page when logged in
  return (
    <LoggedInHomePage 
      products={products}
      categories={categories}
      loading={loading}
      addingToCart={addingToCart}
      onAddToCart={handleAddToCart}
    />
  )
}

// ==================== LANDING PAGE (Not Logged In) ====================
function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sanor-pink-soft rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-sanor-purple-soft rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-sanor-pink-light/30 to-sanor-purple-light/30 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full mb-8 shadow-sm">
            <Sparkles size={16} className="text-sanor-pink" />
            <span className="text-sm text-sanor-black">New Collection 2025</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-sanor-black mb-6 leading-tight">
            Discover Your
            <span className="block gradient-text">Perfect Style</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Explore our curated collection of premium IRL fashion.
            Sarees, Kurtis, Jeans, Dresses & more. Where elegance meets comfort.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="btn-primary flex items-center gap-2">
              Get Started <ChevronRight size={18} />
            </Link>
            <Link href="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 mt-16">
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">500+</p>
              <p className="text-gray-500 text-sm">Unique Styles</p>
            </div>
            <div className="w-px h-12 bg-sanor-pink-light" />
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">50k+</p>
              <p className="text-gray-500 text-sm">Happy Customers</p>
            </div>
            <div className="w-px h-12 bg-sanor-pink-light" />
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">4.9</p>
              <p className="text-gray-500 text-sm">Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sanor-pink-soft flex items-center justify-center">
                <Truck size={28} className="text-sanor-pink" />
              </div>
              <h3 className="font-semibold text-sanor-black mb-2">Free Shipping</h3>
              <p className="text-gray-500 text-sm">On orders above ₹999</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sanor-purple-soft flex items-center justify-center">
                <Shield size={28} className="text-sanor-purple" />
              </div>
              <h3 className="font-semibold text-sanor-black mb-2">Secure Payment</h3>
              <p className="text-gray-500 text-sm">100% secure checkout</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sanor-pink-soft flex items-center justify-center">
                <Percent size={28} className="text-sanor-pink" />
              </div>
              <h3 className="font-semibold text-sanor-black mb-2">Best Offers</h3>
              <p className="text-gray-500 text-sm">Up to 50% off daily</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sanor-purple-soft flex items-center justify-center">
                <Clock size={28} className="text-sanor-purple" />
              </div>
              <h3 className="font-semibold text-sanor-black mb-2">Easy Returns</h3>
              <p className="text-gray-500 text-sm">7-day return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sanor-black mb-4">Shop by Category</h2>
            <p className="text-gray-600">Find your perfect fit in our carefully curated collections</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Sarees', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop' },
              { name: 'Kurtis', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop' },
              { name: 'Jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop' },
              { name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop' },
            ].map((category, index) => (
              <Link
                key={index}
                href="/login"
                className="group relative h-80 md:h-96 rounded-2xl overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <h3 className="text-white text-xl font-semibold">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/login" className="btn-primary">
              Login to Explore All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-sanor-purple-soft/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sanor-black mb-4">What Our Customers Say</h2>
            <p className="text-gray-600">Real reviews from real fashion lovers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Priya S.', text: 'Absolutely love the sarees! The pink Banarasi I ordered exceeded my expectations. Will definitely be back for more.', rating: 5 },
              { name: 'Ananya L.', text: 'sanor has become my go-to for elegant pieces. The kurti collection is stunning and fits perfectly.', rating: 5 },
              { name: 'Meera K.', text: 'Fast shipping, beautiful packaging, and the clothes are even better in person. Highly recommend!', rating: 5 },
            ].map((review, index) => (
              <div key={index} className="glass rounded-2xl p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-sanor-pink text-sanor-pink" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">&ldquo;{review.text}&rdquo;</p>
                <p className="font-semibold text-sanor-black">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sanor-pink to-sanor-purple p-12 md:p-16 text-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Wardrobe?
              </h2>
              <p className="text-white/90 mb-8 max-w-xl mx-auto">
                Join thousands of happy customers and discover the latest trends in fashion. Sign up today and get 20% off your first order!
              </p>
              <Link href="/login" className="inline-block px-8 py-4 bg-white text-sanor-black rounded-full font-semibold hover:bg-sanor-black hover:text-white transition-all">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sanor-black text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="logo-font text-3xl text-white tracking-widest">sanor</span>
              <p className="text-gray-400 text-sm mt-4">
                Premium IRL fashion for the modern soul. Discover your perfect style with us.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/login" className="hover:text-sanor-pink transition-colors">Login</Link></li>
                <li><Link href="/login" className="hover:text-sanor-pink transition-colors">Register</Link></li>
                <li><a href="#" className="hover:text-sanor-pink transition-colors">About Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-sanor-pink transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-sanor-pink transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-sanor-pink transition-colors">Shipping</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-sanor-pink transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-sanor-pink transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-sanor-pink transition-colors">Returns Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 sanor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ==================== HOME PAGE (Logged In) ====================
function LoggedInHomePage({ 
  products, 
  categories, 
  loading, 
  addingToCart,
  onAddToCart 
}: {
  products: Product[]
  categories: Category[]
  loading: boolean
  addingToCart: number | null
  onAddToCart: (product: Product) => void
}) {
  const featuredProducts = products.filter(p => p.featured).slice(0, 8)
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4)
  const saleProducts = products.filter(p => p.originalPrice).slice(0, 4)

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 size={48} className="animate-spin text-sanor-pink" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sanor-pink-soft/10 to-sanor-purple-soft/20">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-24 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sanor-pink to-sanor-purple p-8 md:p-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full mb-4">
                  <Sparkles size={14} className="text-white" />
                  <span className="text-sm text-white">Limited Time Offer</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Summer Sale
                  <span className="block">Up to 50% Off</span>
                </h1>
                <p className="text-white/90 mb-6 max-w-md">
                  Discover amazing deals on sarees, kurtis, jeans & more!
                </p>
                <Link href="/shop" className="inline-block px-8 py-3 bg-white text-sanor-black rounded-full font-semibold hover:bg-sanor-black hover:text-white transition-all">
                  Shop Now
                </Link>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop" 
                  alt="Fashion" 
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Features */}
      <section className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, text: 'Free Shipping', sub: 'Above ₹999' },
              { icon: Shield, text: 'Secure Payment', sub: '100% Safe' },
              { icon: Percent, text: 'Best Offers', sub: 'Daily Deals' },
              { icon: Clock, text: 'Easy Returns', sub: '7 Days' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                <div className="p-2 rounded-lg bg-sanor-pink-soft">
                  <item.icon size={20} className="text-sanor-pink" />
                </div>
                <div>
                  <p className="font-medium text-sanor-black text-sm">{item.text}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-sanor-black">Shop by Category</h2>
            <Link href="/shop" className="text-sanor-purple hover:underline flex items-center gap-1 text-sm">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category, index) => {
              // Fallback images for each category
              const fallbackImages: Record<string, string> = {
                'sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
                'kurtis': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
                'tops': 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=400&fit=crop',
                'jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
                'dresses': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop',
                'lehengas': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop',
                'bags': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
                'jewelry': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
                'footwear': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop',
                'ethnic-wear': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop',
              }
              const imageUrl = category.imageUrl || fallbackImages[category.slug] || `https://picsum.photos/400/400?random=${index}`
              
              return (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.id}`}
                  className="group text-center"
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-gray-100">
                    <img
                      src={imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <p className="font-medium text-sanor-black text-sm">{category.name}</p>
                </Link>
              )
            })}
          </div>

          {categories.length > 6 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {categories.slice(6).map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.id}`}
                  className="whitespace-nowrap px-4 py-2 bg-white rounded-full text-sm border border-sanor-pink-light hover:bg-sanor-pink-soft transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-sanor-black">Featured Products</h2>
                <p className="text-gray-600 text-sm">Handpicked favorites just for you</p>
              </div>
              <Link href="/shop" className="hidden md:flex items-center gap-1 text-sanor-purple hover:underline text-sm">
                View All <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={onAddToCart}
                  addingToCart={addingToCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sale Banner */}
      <section className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-sanor-pink p-6 md:p-8">
              <div className="relative z-10">
                <span className="text-white/80 text-sm">New Arrivals</span>
                <h3 className="text-2xl font-bold text-white mt-1 mb-3">Fresh Styles Just Dropped</h3>
                <Link href="/shop" className="inline-block px-6 py-2 bg-white text-sanor-pink rounded-full text-sm font-medium hover:bg-sanor-black hover:text-white transition-all">
                  Explore
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20">
                <Sparkles size={120} />
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-sanor-purple p-6 md:p-8">
              <div className="relative z-10">
                <span className="text-white/80 text-sm">Limited Offer</span>
                <h3 className="text-2xl font-bold text-white mt-1 mb-3">Flat 30% Off on Sarees</h3>
                <Link href="/shop" className="inline-block px-6 py-2 bg-white text-sanor-purple rounded-full text-sm font-medium hover:bg-sanor-black hover:text-white transition-all">
                  Shop Sarees
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20">
                <Percent size={120} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-8 px-6 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-sanor-black">New Arrivals</h2>
                <p className="text-gray-600 text-sm">Fresh styles just for you</p>
              </div>
              <Link href="/shop" className="hidden md:flex items-center gap-1 text-sanor-purple hover:underline text-sm">
                View All <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newArrivals.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={onAddToCart}
                  addingToCart={addingToCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sale Products */}
      {saleProducts.length > 0 && (
        <section className="py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Percent size={20} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-sanor-black">On Sale</h2>
                  <p className="text-gray-600 text-sm">Grab the best deals</p>
                </div>
              </div>
              <Link href="/shop" className="hidden md:flex items-center gap-1 text-sanor-purple hover:underline text-sm">
                View All <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {saleProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={onAddToCart}
                  addingToCart={addingToCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="py-8 px-6 bg-gradient-to-b from-sanor-purple-soft/20 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-sanor-black">All Products</h2>
            <Link href="/shop" className="text-sanor-purple hover:underline flex items-center gap-1 text-sm">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart}
                addingToCart={addingToCart}
              />
            ))}
          </div>

          {products.length > 8 && (
            <div className="text-center mt-8">
              <Link href="/shop" className="btn-primary">
                Browse All {products.length} Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sanor-black text-white py-12 px-6 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <span className="logo-font text-2xl text-white tracking-widest">sanor</span>
              <p className="text-gray-400 text-sm mt-4">
                Your destination for premium IRL fashion.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                {categories.slice(0, 4).map(cat => (
                  <li key={cat.id}>
                    <Link href="/shop" className="hover:text-sanor-pink transition-colors">{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-sanor-pink transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-sanor-pink transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-sanor-pink transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-sanor-pink transition-colors">Returns</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/orders" className="hover:text-sanor-pink transition-colors">My Orders</Link></li>
                <li><Link href="/cart" className="hover:text-sanor-pink transition-colors">Cart</Link></li>
                <li><a href="#" className="hover:text-sanor-pink transition-colors">Wishlist</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 sanor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ==================== PRODUCT CARD COMPONENT ====================
function ProductCard({ 
  product, 
  onAddToCart, 
  addingToCart 
}: { 
  product: Product
  onAddToCart: (product: Product) => void
  addingToCart: number | null
}) {
  return (
    <div className="product-card group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
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
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)}% OFF
            </span>
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
            onClick={() => onAddToCart(product)}
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
      </div>
    </div>
  )
}
