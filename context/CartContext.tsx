'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { cartApi } from '@/lib/api'
import { useAuth } from './AuthContext'

interface CartItem {
  id: number
  quantity: number
  size: string | null
  color: string | null
  product: {
    id: number
    name: string
    price: string
    imageUrl: string | null
  }
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addToCart: (productId: number, quantity: number, size?: string, color?: string) => Promise<void>
  updateQuantity: (id: number, quantity: number) => Promise<void>
  removeItem: (id: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      refreshCart()
    } else {
      setItems([])
    }
  }, [user])

  const refreshCart = async () => {
    if (!user) return
    setLoading(true)
    try {
      const cartItems = await cartApi.get()
      setItems(cartItems)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    }
    setLoading(false)
  }

  const addToCart = async (productId: number, quantity: number, size?: string, color?: string) => {
    await cartApi.add(productId, quantity, size, color)
    await refreshCart()
  }

  const updateQuantity = async (id: number, quantity: number) => {
    await cartApi.update(id, quantity)
    await refreshCart()
  }

  const removeItem = async (id: number) => {
    await cartApi.remove(id)
    await refreshCart()
  }

  const clearCart = async () => {
    await cartApi.clear()
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

