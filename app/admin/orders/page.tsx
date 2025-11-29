'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Clock, CheckCircle, Truck, XCircle, Eye } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { adminApi } from '@/lib/api'

interface Order {
  order: {
    id: number
    status: string
    totalAmount: string
    shippingCity: string
    createdAt: string
  }
  user: {
    id: number
    email: string
    name: string | null
  } | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-600',
  paid: 'bg-blue-100 text-blue-600',
  processing: 'bg-purple-100 text-purple-600',
  shipped: 'bg-indigo-100 text-indigo-600',
  delivered: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/')
      } else {
        fetchOrders()
      }
    }
  }, [user, authLoading, isAdmin, router])

  const fetchOrders = async () => {
    try {
      const data = await adminApi.getOrders()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
    setLoading(false)
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus)
      fetchOrders()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update order status')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sanor-pink border-t-transparent"></div>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-sanor-black text-white py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="logo-font text-2xl tracking-widest">sanor</Link>
            <span className="text-sm bg-sanor-pink px-3 py-1 rounded-full">Admin</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-white/70 hover:text-sanor-pink transition-colors">Dashboard</Link>
            <Link href="/admin/products" className="text-white/70 hover:text-sanor-pink transition-colors">Products</Link>
            <Link href="/admin/categories" className="text-white/70 hover:text-sanor-pink transition-colors">Categories</Link>
            <Link href="/admin/orders" className="text-white hover:text-sanor-pink transition-colors">Orders</Link>
            <Link href="/admin/users" className="text-white/70 hover:text-sanor-pink transition-colors">Users</Link>
            <Link href="/" className="text-white/70 hover:text-sanor-pink transition-colors">← Back to Store</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-sanor-black mb-8">Orders</h1>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Order ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Total</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No orders yet.</p>
                  </td>
                </tr>
              ) : (
                orders.map(({ order, user: orderUser }) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-sanor-black">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-sanor-black">{orderUser?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{orderUser?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold gradient-text">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-sanor-purple hover:underline"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

