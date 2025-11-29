'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { ordersApi } from '@/lib/api'

interface OrderItem {
  id: number
  productName: string
  productImage: string | null
  quantity: number
  size: string | null
  color: string | null
  price: string
}

interface Order {
  id: number
  status: string
  totalAmount: string
  shippingName: string
  shippingEmail: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingPincode: string
  razorpayPaymentId: string | null
  paidAt: string | null
  createdAt: string
  items: OrderItem[]
}

const statusSteps = ['pending', 'paid', 'processing', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    if (user && params.id) {
      fetchOrder()
    }
  }, [user, authLoading, router, params.id])

  const fetchOrder = async () => {
    try {
      const data = await ordersApi.getOne(Number(params.id))
      setOrder(data)
    } catch (error) {
      console.error('Failed to fetch order:', error)
    }
    setLoading(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sanor-pink border-t-transparent"></div>
      </div>
    )
  }

  if (!user || !order) return null

  const currentStep = statusSteps.indexOf(order.status)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sanor-purple-soft/20">
      <Navbar />

      <main className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/orders" className="inline-flex items-center gap-2 text-sanor-purple hover:underline mb-8">
            <ArrowLeft size={20} />
            Back to Orders
          </Link>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-sanor-black">Order #{order.id}</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
              order.status === 'delivered' ? 'bg-green-100 text-green-600' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
              'bg-sanor-pink-soft text-sanor-purple'
            }`}>
              {order.status}
            </span>
          </div>

          {/* Order Status Timeline */}
          {order.status !== 'cancelled' && (
            <div className="glass rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-sanor-black mb-6">Order Status</h2>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step} className="flex-1 flex items-center">
                    <div className={`flex flex-col items-center ${index <= currentStep ? 'text-sanor-pink' : 'text-gray-300'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index <= currentStep ? 'bg-sanor-pink text-white' : 'bg-gray-100'
                      }`}>
                        {index < currentStep ? <CheckCircle size={20} /> : (
                          index === 0 ? <Clock size={20} /> :
                          index === 1 ? <CreditCard size={20} /> :
                          index === 2 ? <Package size={20} /> :
                          index === 3 ? <Truck size={20} /> :
                          <CheckCircle size={20} />
                        )}
                      </div>
                      <span className="text-xs mt-2 capitalize hidden sm:block">{step}</span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-sanor-pink' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Shipping Address */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin size={20} className="text-sanor-pink" />
                <h2 className="text-lg font-semibold text-sanor-black">Shipping Address</h2>
              </div>
              <div className="text-gray-600 space-y-1">
                <p className="font-medium text-sanor-black">{order.shippingName}</p>
                <p>{order.shippingAddress}</p>
                <p>{order.shippingCity}, {order.shippingState} {order.shippingPincode}</p>
                <p>{order.shippingPhone}</p>
                <p>{order.shippingEmail}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard size={20} className="text-sanor-pink" />
                <h2 className="text-lg font-semibold text-sanor-black">Payment Details</h2>
              </div>
              <div className="text-gray-600 space-y-2">
                <p><span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                {order.paidAt && <p><span className="font-medium">Paid On:</span> {new Date(order.paidAt).toLocaleDateString('en-IN')}</p>}
                {order.razorpayPaymentId && <p><span className="font-medium">Payment ID:</span> {order.razorpayPaymentId}</p>}
                <p className="text-xl font-bold gradient-text mt-4">Total: ₹{parseFloat(order.totalAmount).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-sanor-black mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white/50 rounded-xl">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sanor-black">{item.productName}</p>
                    <div className="flex gap-3 text-sm text-gray-500 mt-1">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-sanor-black">₹{parseFloat(item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

