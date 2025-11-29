'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Package, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { productsApi, categoriesApi } from '@/lib/api'

interface Product {
  id: number
  name: string
  slug: string
  price: string
  originalPrice: string | null
  imageUrl: string | null
  sizes: string | null
  colors: string | null
  stock: number
  inStock: boolean
  featured: boolean
  newArrival: boolean
  categoryId: number | null
}

interface Category {
  id: number
  name: string
}

export default function AdminProductsPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    imageUrl: '',
    sizes: 'S,M,L,XL',
    colors: 'Pink,Purple,White,Black',
    stock: '100',
    featured: false,
    newArrival: false,
  })

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/')
      } else {
        fetchData()
      }
    }
  }, [user, authLoading, isAdmin, router])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        originalPrice: formData.originalPrice || null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        imageUrl: formData.imageUrl,
        sizes: formData.sizes,
        colors: formData.colors,
        stock: parseInt(formData.stock),
        featured: formData.featured,
        newArrival: formData.newArrival,
      }

      if (editingProduct) {
        await productsApi.update(editingProduct.id, productData)
      } else {
        await productsApi.create(productData)
      }

      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('Failed to save product')
    }
    setSaving(false)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: '',
      price: product.price,
      originalPrice: product.originalPrice || '',
      categoryId: product.categoryId?.toString() || '',
      imageUrl: product.imageUrl || '',
      sizes: product.sizes || 'S,M,L,XL',
      colors: product.colors || 'Pink,Purple,White,Black',
      stock: product.stock?.toString() || '100',
      featured: product.featured,
      newArrival: product.newArrival,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await productsApi.delete(id)
      fetchData()
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('Failed to delete product')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      imageUrl: '',
      sizes: 'S,M,L,XL',
      colors: 'Pink,Purple,White,Black',
      stock: '100',
      featured: false,
      newArrival: false,
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
            <Link href="/admin/products" className="text-white hover:text-sanor-pink transition-colors">Products</Link>
            <Link href="/admin/categories" className="text-white/70 hover:text-sanor-pink transition-colors">Categories</Link>
            <Link href="/admin/orders" className="text-white/70 hover:text-sanor-pink transition-colors">Orders</Link>
            <Link href="/admin/users" className="text-white/70 hover:text-sanor-pink transition-colors">Users</Link>
            <Link href="/" className="text-white/70 hover:text-sanor-pink transition-colors">← Back to Store</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-sanor-black">Products</h1>
          <button
            onClick={() => {
              setEditingProduct(null)
              resetForm()
              setShowModal(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Price</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Stock</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No products yet. Add your first product!</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sanor-black">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sizes}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-sanor-black">₹{parseFloat(product.price).toFixed(2)}</p>
                      {product.originalPrice && (
                        <p className="text-sm text-gray-400 line-through">₹{parseFloat(product.originalPrice).toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${product.stock > 10 ? 'bg-green-100 text-green-600' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {product.featured && (
                          <span className="px-2 py-1 bg-sanor-pink-soft text-sanor-pink text-xs rounded">Featured</span>
                        )}
                        {product.newArrival && (
                          <span className="px-2 py-1 bg-sanor-purple-soft text-sanor-purple text-xs rounded">New</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-gray-400 hover:text-sanor-purple transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-sanor-black">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-sanor-black mb-2">Product Name *</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sanor-black mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sanor-pink"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sanor-black mb-2">Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sanor-pink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sanor-black mb-2">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sanor-pink"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sanor-black mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sanor-pink"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sanor-black mb-2">Sizes (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData(prev => ({ ...prev, sizes: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sanor-pink"
                    placeholder="S,M,L,XL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sanor-black mb-2">Colors (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sanor-pink"
                    placeholder="Pink,Purple,White"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-200 text-sanor-pink focus:ring-sanor-pink"
                  />
                  <span className="text-sm text-sanor-black">Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.newArrival}
                    onChange={(e) => setFormData(prev => ({ ...prev, newArrival: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-200 text-sanor-pink focus:ring-sanor-pink"
                  />
                  <span className="text-sm text-sanor-black">New Arrival</span>
                </label>
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
                    editingProduct ? 'Update Product' : 'Add Product'
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

