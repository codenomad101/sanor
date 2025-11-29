'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { items, loading, updateQuantity, removeItem, totalPrice } = useCart()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sanor-pink border-t-transparent"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sanor-purple-soft/20">
      <Navbar />

      <main className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-sanor-black mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
              <h2 className="text-2xl font-semibold text-sanor-black mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
              <Link href="/" className="btn-primary inline-flex items-center gap-2">
                Continue Shopping <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="glass rounded-2xl p-4 md:p-6 flex gap-4 md:gap-6">
                    {/* Product Image */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag size={32} />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sanor-black text-lg mb-1 truncate">
                        {item.product.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-3">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      <p className="text-lg font-bold gradient-text">₹{parseFloat(item.product.price).toFixed(2)}</p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>

                      <div className="flex items-center gap-2 bg-sanor-purple-soft/30 rounded-full p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-white rounded-full transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-white rounded-full transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass rounded-2xl p-6 sticky top-28">
                  <h2 className="text-xl font-bold text-sanor-black mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>₹{(totalPrice * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-sanor-pink-light pt-4">
                      <div className="flex justify-between text-lg font-bold text-sanor-black">
                        <span>Total</span>
                        <span className="gradient-text">₹{(totalPrice * 1.18).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="/"
                    className="block text-center mt-4 text-sanor-purple hover:underline text-sm"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

