'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Mail, Calendar, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { adminApi } from '@/lib/api'

interface User {
  id: number
  email: string
  name: string | null
  role: string
  phone: string | null
  city: string | null
  createdAt: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/')
      } else {
        fetchUsers()
      }
    }
  }, [user, authLoading, isAdmin, router])

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
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
            <Link href="/admin" className="text-white/70 hover:text-sanor-pink transition-colors">Dashboard</Link>
            <Link href="/admin/products" className="text-white/70 hover:text-sanor-pink transition-colors">Products</Link>
            <Link href="/admin/categories" className="text-white/70 hover:text-sanor-pink transition-colors">Categories</Link>
            <Link href="/admin/orders" className="text-white/70 hover:text-sanor-pink transition-colors">Orders</Link>
            <Link href="/admin/users" className="text-white hover:text-sanor-pink transition-colors">Users</Link>
            <Link href="/" className="text-white/70 hover:text-sanor-pink transition-colors">← Back to Store</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-sanor-black mb-8">Users</h1>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">User</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Location</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No users yet.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sanor-pink to-sanor-purple flex items-center justify-center text-white font-medium">
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sanor-black">{u.name || 'Unnamed'}</p>
                          <p className="text-sm text-gray-500">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${u.role === 'admin' ? 'bg-sanor-purple-soft text-sanor-purple' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {u.role === 'admin' && <Shield size={14} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {u.city || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar size={16} />
                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
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

