'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [seedMessage, setSeedMessage] = useState('')
  
  const { login, register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleSeed = async () => {
    try {
      setSeedMessage('Seeding...')
      const result = await authApi.seed()
      setSeedMessage(result.results.join(', '))
    } catch (err: any) {
      setSeedMessage('Seed failed: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-br from-sanor-pink-soft/30 via-white to-sanor-purple-soft/30">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-sanor-pink-soft rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-sanor-purple-soft rounded-full blur-3xl opacity-40" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="block text-center mb-8">
          <span className="logo-font text-4xl text-sanor-black tracking-widest">sanor</span>
        </Link>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-sanor-black text-center mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600 text-center mb-8">
            {isLogin ? 'Sign in to continue shopping' : 'Join sanor for exclusive access'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-sanor-black mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sanor-pink-light bg-white/80 focus:border-sanor-pink transition-colors"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-sanor-black mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sanor-pink-light bg-white/80 focus:border-sanor-pink transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sanor-black mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sanor-pink-light bg-white/80 focus:border-sanor-pink transition-colors pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sanor-purple"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="ml-2 text-sanor-purple font-medium hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-sanor-purple-soft/30 rounded-xl">
            <p className="text-sm font-medium text-sanor-black mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>User:</strong> user@sanor.com / user123</p>
              <p><strong>Admin:</strong> admin@sanor.com / admin123</p>
            </div>
            <button
              onClick={handleSeed}
              className="mt-3 text-xs text-sanor-purple hover:underline"
            >
              Click here to seed demo users
            </button>
            {seedMessage && (
              <p className="mt-2 text-xs text-gray-600">{seedMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

