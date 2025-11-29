'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Package, X, Loader2, Layers } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { categoriesApi } from '@/lib/api'

interface Category {
    id: number
    name: string
    slug: string
    description: string | null
    imageUrl: string | null
    createdAt: string
}

export default function AdminCategoriesPage() {
    const router = useRouter()
    const { user, loading: authLoading, isAdmin } = useAuth()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
    })

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login')
            } else if (!isAdmin) {
                router.push('/')
            } else {
                fetchCategories()
            }
        }
    }, [user, authLoading, isAdmin, router])

    const fetchCategories = async () => {
        try {
            const data = await categoriesApi.getAll()
            setCategories(data)
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await categoriesApi.create(formData)
            setShowModal(false)
            resetForm()
            fetchCategories()
        } catch (error) {
            console.error('Failed to save category:', error)
            alert('Failed to save category')
        }
        setSaving(false)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            imageUrl: '',
        })
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
                        <Link href="/admin/categories" className="text-white hover:text-sanor-pink transition-colors">Categories</Link>
                        <Link href="/admin/orders" className="text-white/70 hover:text-sanor-pink transition-colors">Orders</Link>
                        <Link href="/admin/users" className="text-white/70 hover:text-sanor-pink transition-colors">Users</Link>
                        <Link href="/" className="text-white/70 hover:text-sanor-pink transition-colors">← Back to Store</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-sanor-black">Categories</h1>
                    <button
                        onClick={() => {
                            resetForm()
                            setShowModal(true)
                        }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Category
                    </button>
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Category</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Slug</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Description</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <Layers size={48} className="mx-auto mb-4 text-gray-300" />
                                        <p>No categories yet. Add your first category!</p>
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {category.imageUrl ? (
                                                        <img
                                                            src={category.imageUrl}
                                                            alt={category.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-sanor-black">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {category.slug}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                            {category.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(category.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Add Category Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-sanor-black">Add New Category</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-sanor-black mb-2">Category Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sanor-pink"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sanor-black mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sanor-pink resize-none"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sanor-black mb-2">Image URL</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sanor-pink"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 btn-secondary py-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Add Category'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
