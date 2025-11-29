'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Loader2, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { ordersApi } from '@/lib/api'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { items, totalPrice, refreshCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)

  const [shippingData, setShippingData] = useState({
    shippingName: '',
    shippingEmail: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPincode: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    if (user) {
      setShippingData(prev => ({
        ...prev,
        shippingName: user.name || '',
        shippingEmail: user.email || '',
      }))
    }
  }, [user, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create Razorpay order
      const orderData = await ordersApi.createRazorpayOrder(shippingData)

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'sanor',
        description: 'Fashion Purchase',
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            await ordersApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.orderId,
            })
            
            setOrderId(orderData.orderId)
            setSuccess(true)
            await refreshCart()
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: shippingData.shippingName,
          email: shippingData.shippingEmail,
          contact: shippingData.shippingPhone,
        },
        theme: {
          color: '#FF69B4',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create order. Please try again.')
    }
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sanor-pink border-t-transparent"></div>
      </div>
    )
  }

  if (!user) return null

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-sanor-purple-soft/20">
        <Navbar />
        <main className="pt-24 pb-20 px-6">
          <div className="max-w-lg mx-auto text-center">
            <div className="glass rounded-3xl p-12">
              <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
              <h1 className="text-3xl font-bold text-sanor-black mb-4">Order Placed!</h1>
              <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
              <p className="text-gray-600 mb-8">Order ID: #{orderId}</p>
              <div className="space-y-4">
                <Link href={`/orders`} className="btn-primary w-full block py-4">
                  View My Orders
                </Link>
                <Link href="/" className="btn-secondary w-full block py-4">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  const totalWithTax = totalPrice * 1.18

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sanor-purple-soft/20">
      <Navbar />

      <main className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sanor-purple hover:underline mb-8">
            <ArrowLeft size={20} />
            Back to Cart
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-sanor-black mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Shipping Form */}
            <div className="glass rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-sanor-black mb-6">Shipping Information</h2>

              <form onSubmit={handlePayment} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sanor-black mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="shippingName"
                      value={shippingData.shippingName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-sanor-pink-light bg-white/80"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sanor-black mb-2">Email *</label>
                    <input
                      type="email"
                      name="shippingEmail"
                      value={shippingData.shippingEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-sanor-pink-light bg-white/80"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sanor-black mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="shippingPhone"
                    value={shippingData.shippingPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-sanor-pink-light bg-white/80"
                    placeholder="+91 XXXXXXXXXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sanor-black mb-2">Address *</label>
                  <textarea
                    name="shippingAddress"
                    value={shippingData.shippingAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-sanor-pink-light bg-white/80 resize-none"
                    placeholder="House/Flat No., Street, Landmark"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sanor-black mb-2">City *</label>
                    <input
                      type="text"
                      name="shippingCity"
                      value={shippingData.shippingCity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-sanor-pink-light bg-white/80"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sanor-black mb-2">State *</label>
                    <input
                      type="text"
                      name="shippingState"
                      value={shippingData.shippingState}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-sanor-pink-light bg-white/80"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sanor-black mb-2">Pincode *</label>
                    <input
                      type="text"
                      name="shippingPincode"
                      value={shippingData.shippingPincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-sanor-pink-light bg-white/80"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2 mt-8"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Pay ₹{totalWithTax.toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="glass rounded-2xl p-6 md:p-8 sticky top-28">
                <h2 className="text-xl font-bold text-sanor-black mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.product.imageUrl && (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sanor-black truncate">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sanor-black">
                        ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-sanor-pink-light pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (18%)</span>
                    <span>₹{(totalPrice * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-sanor-pink-light pt-3">
                    <div className="flex justify-between text-xl font-bold text-sanor-black">
                      <span>Total</span>
                      <span className="gradient-text">₹{totalWithTax.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-sanor-purple-soft/30 rounded-xl">
                  <p className="text-sm text-gray-600">
                    🔒 Payments are secure and encrypted. Powered by Razorpay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

