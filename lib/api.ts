const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

// Token management
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sanor_token')
  }
  return null
}

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sanor_token', token)
  }
}

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sanor_token')
  }
}

// API helper
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  me: () => apiFetch('/api/auth/me'),

  seed: () => apiFetch('/api/seed', { method: 'POST' }),
}

// Products API
export const productsApi = {
  getAll: () => apiFetch('/api/products'),
  getFeatured: () => apiFetch('/api/products/featured'),
  getOne: (id: number) => apiFetch(`/api/products/${id}`),
  create: (data: any) =>
    apiFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiFetch(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch(`/api/products/${id}`, { method: 'DELETE' }),
}

// Categories API
export const categoriesApi = {
  getAll: () => apiFetch('/api/categories'),
  create: (data: any) =>
    apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Cart API
export const cartApi = {
  get: () => apiFetch('/api/cart'),
  add: (productId: number, quantity: number, size?: string, color?: string) =>
    apiFetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, size, color }),
    }),
  update: (id: number, quantity: number) =>
    apiFetch(`/api/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  remove: (id: number) =>
    apiFetch(`/api/cart/${id}`, { method: 'DELETE' }),
  clear: () => apiFetch('/api/cart', { method: 'DELETE' }),
}

// Orders API
export const ordersApi = {
  getAll: () => apiFetch('/api/orders'),
  getOne: (id: number) => apiFetch(`/api/orders/${id}`),
  createRazorpayOrder: (shippingData: any) =>
    apiFetch('/api/orders/create-razorpay-order', {
      method: 'POST',
      body: JSON.stringify(shippingData),
    }),
  verifyPayment: (data: any) =>
    apiFetch('/api/orders/verify-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Admin API
export const adminApi = {
  getStats: () => apiFetch('/api/admin/stats'),
  getOrders: () => apiFetch('/api/admin/orders'),
  updateOrderStatus: (id: number, status: string) =>
    apiFetch(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  getUsers: () => apiFetch('/api/admin/users'),
}

