'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const { totalItems } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="logo-font text-3xl text-sanor-black tracking-widest">
            sanor
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="nav-link text-sanor-black hover:text-sanor-purple transition-colors">Home</Link>
            <Link href="/shop" className="nav-link text-sanor-black hover:text-sanor-purple transition-colors">Shop</Link>
            <Link href="/collections" className="nav-link text-sanor-black hover:text-sanor-purple transition-colors">Collections</Link>
            <Link href="/about" className="nav-link text-sanor-black hover:text-sanor-purple transition-colors">About</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-sanor-pink-soft rounded-full transition-colors">
              <Search size={20} className="text-sanor-black" />
            </button>
            <button className="p-2 hover:bg-sanor-pink-soft rounded-full transition-colors">
              <Heart size={20} className="text-sanor-black" />
            </button>
            <Link href="/cart" className="p-2 hover:bg-sanor-pink-soft rounded-full transition-colors relative">
              <ShoppingBag size={20} className="text-sanor-black" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-sanor-pink text-white text-xs rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 hover:bg-sanor-pink-soft rounded-full transition-colors flex items-center gap-2"
                >
                  <User size={20} className="text-sanor-black" />
                  <span className="hidden md:inline text-sm text-sanor-black">{user.name || user.email.split('@')[0]}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-sanor-pink-light">
                      <p className="text-sm font-medium text-sanor-black">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-sanor-black hover:bg-sanor-pink-soft transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-sanor-purple hover:bg-sanor-pink-soft transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-sanor-pink-soft transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary text-sm py-2 px-4"
              >
                Login
              </Link>
            )}

            <button
              className="md:hidden p-2 hover:bg-sanor-pink-soft rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-sanor-pink-light">
          <div className="px-6 py-4 space-y-4">
            <Link href="/" className="block text-sanor-black hover:text-sanor-purple py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/shop" className="block text-sanor-black hover:text-sanor-purple py-2" onClick={() => setIsMenuOpen(false)}>Shop</Link>
            <Link href="/collections" className="block text-sanor-black hover:text-sanor-purple py-2" onClick={() => setIsMenuOpen(false)}>Collections</Link>
            <Link href="/about" className="block text-sanor-black hover:text-sanor-purple py-2" onClick={() => setIsMenuOpen(false)}>About</Link>
            {!user && (
              <Link href="/login" className="block text-sanor-purple font-medium py-2" onClick={() => setIsMenuOpen(false)}>Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

