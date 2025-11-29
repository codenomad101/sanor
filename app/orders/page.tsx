'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/context/AuthContext'
import { ordersApi } from '@/lib/api'

interface Order {
  id: number
  status: string
  totalAmount: string
  shippingCity: string
  createdAt: string
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  paid: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

const statusColors: Record<string, string> = {
  pending: 'text-yellow-500 bg-yellow-50',
  paid: 'text-blue-500 bg-blue-50',
  processing: 'text-purple-500 bg-purple-50',
  shipped: 'text-indigo-500 bg-indigo-50',
  delivered: 'text-green-500 bg-green-50',
  cancelled: 'text-red-500 bg-red-50',
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    if (user) {
      fetchOrders()
    }
  }, [user, authLoading, router])

  const fetchOrders = async () => {
    try {
      const data = await ordersApi.getAll()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
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

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sanor-purple-soft/20">
      <Navbar />

      <main className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-sanor-black mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-20 glass rounded-2xl">
              <Package size={64} className="mx-auto text-gray-300 mb-6" />
              <h2 className="text-2xl font-semibold text-sanor-black mb-4">No orders yet</h2>
              <p className="text-gray-600 mb-8">Start shopping to see your orders here.</p>
              <Link href="/" className="btn-primary inline-flex items-center gap-2">
                Start Shopping <ChevronRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Clock
                const statusColor = statusColors[order.status] || 'text-gray-500 bg-gray-50'

                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block glass rounded-2xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${statusColor}`}>
                          <StatusIcon size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-sanor-black">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="font-bold gradient-text">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
                          <p className="text-sm capitalize text-gray-500">{order.status}</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

