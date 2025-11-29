'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, ChevronRight, Layers } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { adminApi } from '@/lib/api'

interface Stats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/')
      } else {
        fetchStats()
      }
    }
  }, [user, authLoading, isAdmin, router])

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
    setLoading(false)
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
            <Link href="/admin" className="text-white hover:text-sanor-pink transition-colors">Dashboard</Link>
            <Link href="/admin/products" className="text-white/70 hover:text-sanor-pink transition-colors">Products</Link>
            <Link href="/admin/categories" className="text-white/70 hover:text-sanor-pink transition-colors">Categories</Link>
            <Link href="/admin/orders" className="text-white/70 hover:text-sanor-pink transition-colors">Orders</Link>
            <Link href="/admin/users" className="text-white/70 hover:text-sanor-pink transition-colors">Users</Link>
            <Link href="/" className="text-white/70 hover:text-sanor-pink transition-colors">← Back to Store</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-sanor-black mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-sanor-pink-soft rounded-xl">
                <Package size={24} className="text-sanor-pink" />
              </div>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-sanor-black">{stats?.totalProducts || 0}</p>
            <p className="text-gray-500 text-sm">Total Products</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-sanor-purple-soft rounded-xl">
                <ShoppingBag size={24} className="text-sanor-purple" />
              </div>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-sanor-black">{stats?.totalOrders || 0}</p>
            <p className="text-gray-500 text-sm">Total Orders</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users size={24} className="text-blue-500" />
              </div>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-sanor-black">{stats?.totalUsers || 0}</p>
            <p className="text-gray-500 text-sm">Total Users</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <DollarSign size={24} className="text-green-500" />
              </div>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-sanor-black">₹{stats?.totalRevenue || '0.00'}</p>
            <p className="text-gray-500 text-sm">Total Revenue</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/admin/categories" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-sanor-black mb-2">Manage Categories</h3>
                <p className="text-gray-500 text-sm">Add or view categories</p>
              </div>
              <ChevronRight size={24} className="text-gray-400 group-hover:text-sanor-pink transition-colors" />
            </div>
          </Link>

          <Link href="/admin/products" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-sanor-black mb-2">Manage Products</h3>
                <p className="text-gray-500 text-sm">Add, edit, or remove products</p>
              </div>
              <ChevronRight size={24} className="text-gray-400 group-hover:text-sanor-pink transition-colors" />
            </div>
          </Link>

          <Link href="/admin/orders" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-sanor-black mb-2">View Orders</h3>
                <p className="text-gray-500 text-sm">Track and manage orders</p>
              </div>
              <ChevronRight size={24} className="text-gray-400 group-hover:text-sanor-pink transition-colors" />
            </div>
          </Link>

          <Link href="/admin/users" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-sanor-black mb-2">Manage Users</h3>
                <p className="text-gray-500 text-sm">View registered users</p>
              </div>
              <ChevronRight size={24} className="text-gray-400 group-hover:text-sanor-pink transition-colors" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}

