import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { db } from '../db'
import { products, categories, users, cartItems, orders, orderItems } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.SESSION_SECRET || 'sanor-secret-key'

// Razorpay instance - lazy initialization
let razorpay: Razorpay | null = null

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null
  }
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpay
}

app.use(cors())
app.use(express.json())

// Types
interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
    role: string
  }
}

// JWT Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Admin Middleware
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// ==================== AUTH ROUTES ====================

// Seed demo users and data
app.post('/api/seed', async (req: Request, res: Response) => {
  try {
    const userPasswordHash = await bcrypt.hash('user123', 10)
    const adminPasswordHash = await bcrypt.hash('admin123', 10)
    const pratikshaPasswordHash = await bcrypt.hash('pratikshasantosh', 10)

    const results = []

    // Seed users
    const existingUser = await db.select().from(users).where(eq(users.email, 'user@sanor.com'))
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@sanor.com'))
    const existingPratiksha = await db.select().from(users).where(eq(users.email, 'pratiksha@sanor.store'))

    if (existingUser.length === 0) {
      await db.insert(users).values({
        email: 'user@sanor.com',
        name: 'Demo User',
        passwordHash: userPasswordHash,
        role: 'user',
      })
      results.push('User created: user@sanor.com')
    }

    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        email: 'admin@sanor.com',
        name: 'Admin User',
        passwordHash: adminPasswordHash,
        role: 'admin',
      })
      results.push('Admin created: admin@sanor.com')
    }

    if (existingPratiksha.length === 0) {
      await db.insert(users).values({
        email: 'pratiksha@sanor.store',
        name: 'Pratiksha',
        passwordHash: pratikshaPasswordHash,
        role: 'admin',
      })
      results.push('User created: pratiksha@sanor.store')
    }

    // Seed categories with unique images
    const categoryData = [
      { name: 'Sarees', slug: 'sarees', description: 'Traditional & designer sarees', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop' },
      { name: 'Kurtis', slug: 'kurtis', description: 'Elegant kurtis & kurtas', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop' },
      { name: 'Tops', slug: 'tops', description: 'Trendy tops & blouses', imageUrl: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=400&fit=crop' },
      { name: 'Jeans', slug: 'jeans', description: 'Stylish jeans & denims', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop' },
      { name: 'Dresses', slug: 'dresses', description: 'Beautiful dresses for every occasion', imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop' },
      { name: 'Lehengas', slug: 'lehengas', description: 'Bridal & party lehengas', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop' },
      { name: 'Bags', slug: 'bags', description: 'Handbags, clutches & totes', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop' },
      { name: 'Jewelry', slug: 'jewelry', description: 'Earrings, necklaces & more', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop' },
      { name: 'Footwear', slug: 'footwear', description: 'Heels, flats & sandals', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop' },
      { name: 'Ethnic Wear', slug: 'ethnic-wear', description: 'Traditional Indian wear', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop' },
    ]

    const existingCategories = await db.select().from(categories)
    if (existingCategories.length === 0) {
      await db.insert(categories).values(categoryData)
      results.push('Categories seeded: ' + categoryData.length)
    }

    // Get category IDs
    const allCategories = await db.select().from(categories)
    const getCategoryId = (slug: string) => allCategories.find(c => c.slug === slug)?.id

    // Seed products with unique images per product
    const existingProducts = await db.select().from(products)
    if (existingProducts.length === 0) {
      const productData = [
        // Sarees - unique images
        { name: 'Pink Banarasi Silk Saree', slug: 'pink-banarasi-silk-saree', description: 'Elegant pink Banarasi silk saree with golden zari work', price: '4999.00', originalPrice: '6999.00', categoryId: getCategoryId('sarees'), imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop', sizes: 'Free Size', colors: 'Pink,Magenta,Red', featured: true, newArrival: true },
        { name: 'Purple Chiffon Saree', slug: 'purple-chiffon-saree', description: 'Lightweight purple chiffon saree perfect for parties', price: '2499.00', categoryId: getCategoryId('sarees'), imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop', sizes: 'Free Size', colors: 'Purple,Lavender', featured: true },
        { name: 'White Cotton Saree', slug: 'white-cotton-saree', description: 'Pure white cotton saree for daily wear', price: '1299.00', categoryId: getCategoryId('sarees'), imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=500&fit=crop', sizes: 'Free Size', colors: 'White,Off-White', newArrival: true },
        
        // Kurtis - unique images
        { name: 'Floral Print Anarkali Kurti', slug: 'floral-anarkali-kurti', description: 'Beautiful floral print Anarkali style kurti', price: '1499.00', originalPrice: '1999.00', categoryId: getCategoryId('kurtis'), imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop', sizes: 'S,M,L,XL,XXL', colors: 'Pink,Yellow,Blue', featured: true },
        { name: 'Cotton Straight Kurti', slug: 'cotton-straight-kurti', description: 'Comfortable cotton straight cut kurti', price: '899.00', categoryId: getCategoryId('kurtis'), imageUrl: 'https://images.unsplash.com/photo-1583391733981-8b530c8a89c0?w=400&h=500&fit=crop', sizes: 'S,M,L,XL', colors: 'White,Black,Navy', newArrival: true },
        { name: 'Embroidered A-Line Kurti', slug: 'embroidered-aline-kurti', description: 'Elegant A-line kurti with thread embroidery', price: '1799.00', categoryId: getCategoryId('kurtis'), imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=500&fit=crop', sizes: 'S,M,L,XL', colors: 'Maroon,Green,Purple' },

        // Tops - unique images
        { name: 'Pink Ruffle Top', slug: 'pink-ruffle-top', description: 'Trendy pink top with ruffle details', price: '799.00', originalPrice: '1199.00', categoryId: getCategoryId('tops'), imageUrl: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop', sizes: 'XS,S,M,L,XL', colors: 'Pink,White,Black', featured: true, newArrival: true },
        { name: 'White Crop Top', slug: 'white-crop-top', description: 'Stylish white crop top for casual wear', price: '599.00', categoryId: getCategoryId('tops'), imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop', sizes: 'XS,S,M,L', colors: 'White,Black,Pink' },
        { name: 'Lavender Peplum Top', slug: 'lavender-peplum-top', description: 'Elegant lavender peplum style top', price: '999.00', categoryId: getCategoryId('tops'), imageUrl: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=400&h=500&fit=crop', sizes: 'S,M,L,XL', colors: 'Lavender,Pink,Mint', featured: true },
        { name: 'Floral Print Blouse', slug: 'floral-print-blouse', description: 'Beautiful floral print casual blouse', price: '899.00', categoryId: getCategoryId('tops'), imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=500&fit=crop', sizes: 'S,M,L,XL', colors: 'Multicolor', newArrival: true },

        // Jeans - unique images
        { name: 'High Waist Skinny Jeans', slug: 'high-waist-skinny-jeans', description: 'Flattering high waist skinny fit jeans', price: '1499.00', originalPrice: '1999.00', categoryId: getCategoryId('jeans'), imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop', sizes: '26,28,30,32,34', colors: 'Blue,Black,Grey', featured: true },
        { name: 'Mom Fit Jeans', slug: 'mom-fit-jeans', description: 'Comfortable mom fit relaxed jeans', price: '1299.00', categoryId: getCategoryId('jeans'), imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop', sizes: '26,28,30,32,34', colors: 'Light Blue,Medium Blue', newArrival: true },
        { name: 'Wide Leg Palazzo Jeans', slug: 'wide-leg-palazzo-jeans', description: 'Trendy wide leg palazzo style jeans', price: '1699.00', categoryId: getCategoryId('jeans'), imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=500&fit=crop', sizes: '26,28,30,32', colors: 'Dark Blue,Black' },
        { name: 'Ripped Boyfriend Jeans', slug: 'ripped-boyfriend-jeans', description: 'Stylish ripped boyfriend fit jeans', price: '1599.00', originalPrice: '2199.00', categoryId: getCategoryId('jeans'), imageUrl: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&h=500&fit=crop', sizes: '26,28,30,32', colors: 'Blue,Light Blue', featured: true },

        // Dresses - unique images
        { name: 'Pink Floral Maxi Dress', slug: 'pink-floral-maxi-dress', description: 'Gorgeous pink floral print maxi dress', price: '2499.00', originalPrice: '3499.00', categoryId: getCategoryId('dresses'), imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop', sizes: 'XS,S,M,L,XL', colors: 'Pink,Blue,Yellow', featured: true, newArrival: true },
        { name: 'Little Black Dress', slug: 'little-black-dress', description: 'Classic little black dress for parties', price: '1999.00', categoryId: getCategoryId('dresses'), imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', sizes: 'XS,S,M,L', colors: 'Black', featured: true },
        { name: 'Lavender Midi Dress', slug: 'lavender-midi-dress', description: 'Elegant lavender midi dress', price: '1799.00', categoryId: getCategoryId('dresses'), imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop', sizes: 'S,M,L,XL', colors: 'Lavender,Pink,Mint' },
        { name: 'Summer Wrap Dress', slug: 'summer-wrap-dress', description: 'Light and breezy summer wrap dress', price: '1599.00', categoryId: getCategoryId('dresses'), imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop', sizes: 'S,M,L', colors: 'White,Yellow,Coral', newArrival: true },

        // Lehengas - unique images
        { name: 'Bridal Red Lehenga', slug: 'bridal-red-lehenga', description: 'Stunning bridal red lehenga with heavy embroidery', price: '24999.00', originalPrice: '34999.00', categoryId: getCategoryId('lehengas'), imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=500&fit=crop', sizes: 'S,M,L,XL', colors: 'Red,Maroon', featured: true },
        { name: 'Pink Party Lehenga', slug: 'pink-party-lehenga', description: 'Beautiful pink lehenga for parties', price: '8999.00', categoryId: getCategoryId('lehengas'), imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop', sizes: 'S,M,L,XL', colors: 'Pink,Peach', newArrival: true },

        // Bags - unique images
        { name: 'Pink Leather Tote Bag', slug: 'pink-leather-tote', description: 'Spacious pink leather tote bag', price: '2999.00', originalPrice: '3999.00', categoryId: getCategoryId('bags'), imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop', sizes: 'One Size', colors: 'Pink,Black,Brown', featured: true },
        { name: 'Lavender Sling Bag', slug: 'lavender-sling-bag', description: 'Cute lavender sling bag for daily use', price: '1499.00', categoryId: getCategoryId('bags'), imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop', sizes: 'One Size', colors: 'Lavender,White,Pink', newArrival: true },
        { name: 'Black Clutch', slug: 'black-clutch', description: 'Elegant black clutch for evening parties', price: '999.00', categoryId: getCategoryId('bags'), imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=500&fit=crop', sizes: 'One Size', colors: 'Black,Gold,Silver' },

        // Jewelry - unique images
        { name: 'Pearl Drop Earrings', slug: 'pearl-drop-earrings', description: 'Elegant pearl drop earrings', price: '799.00', categoryId: getCategoryId('jewelry'), imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop', sizes: 'One Size', colors: 'Gold,Silver', featured: true },
        { name: 'Pink Stone Necklace', slug: 'pink-stone-necklace', description: 'Beautiful pink stone statement necklace', price: '1299.00', categoryId: getCategoryId('jewelry'), imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=500&fit=crop', sizes: 'One Size', colors: 'Pink,Purple', newArrival: true },
        { name: 'Kundan Jewelry Set', slug: 'kundan-jewelry-set', description: 'Traditional kundan necklace set', price: '3499.00', originalPrice: '4999.00', categoryId: getCategoryId('jewelry'), imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=500&fit=crop', sizes: 'One Size', colors: 'Gold,Multicolor' },

        // Footwear - unique images
        { name: 'Pink Block Heels', slug: 'pink-block-heels', description: 'Comfortable pink block heels', price: '1799.00', originalPrice: '2499.00', categoryId: getCategoryId('footwear'), imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop', sizes: '36,37,38,39,40,41', colors: 'Pink,Nude,Black', featured: true },
        { name: 'White Sneakers', slug: 'white-sneakers', description: 'Classic white sneakers for casual wear', price: '1499.00', categoryId: getCategoryId('footwear'), imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=500&fit=crop', sizes: '36,37,38,39,40', colors: 'White,Pink,Black', newArrival: true },
        { name: 'Embellished Flats', slug: 'embellished-flats', description: 'Pretty embellished flat sandals', price: '999.00', categoryId: getCategoryId('footwear'), imageUrl: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=500&fit=crop', sizes: '36,37,38,39,40', colors: 'Gold,Silver,Rose Gold' },
      ]

      await db.insert(products).values(productData)
      results.push('Products seeded: ' + productData.length)
    }

    res.json({ message: 'Seed completed', results })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: 'Failed to seed data' })
  }
})

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email))
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = await db.insert(users).values({
      email,
      name,
      passwordHash,
      role: 'user',
    }).returning()

    const token = jwt.sign(
      { id: newUser[0].id, email: newUser[0].email, role: newUser[0].role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role,
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const user = await db.select().from(users).where(eq(users.email, email))
    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user[0].passwordHash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user[0].id, email: user[0].email, role: user[0].role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        role: user[0].role,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get current user
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, req.user!.id))
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      role: user[0].role,
      phone: user[0].phone,
      address: user[0].address,
      city: user[0].city,
      state: user[0].state,
      pincode: user[0].pincode,
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

// ==================== PRODUCT ROUTES ====================

// Get all products
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt))
    res.json(allProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Get featured products
app.get('/api/products/featured', async (req: Request, res: Response) => {
  try {
    const featuredProducts = await db.select().from(products).where(eq(products.featured, true))
    res.json(featuredProducts)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    res.status(500).json({ error: 'Failed to fetch featured products' })
  }
})

// Get single product
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await db.select().from(products).where(eq(products.id, parseInt(req.params.id)))
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product[0])
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// Create product (Admin only)
app.post('/api/products', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, originalPrice, categoryId, imageUrl, images, sizes, colors, stock, featured, newArrival } = req.body

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    const newProduct = await db.insert(products).values({
      name,
      slug: `${slug}-${Date.now()}`,
      description,
      price,
      originalPrice,
      categoryId,
      imageUrl,
      images,
      sizes,
      colors,
      stock: stock || 100,
      featured: featured || false,
      newArrival: newArrival || false,
    }).returning()

    res.json(newProduct[0])
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// Update product (Admin only)
app.put('/api/products/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, originalPrice, categoryId, imageUrl, images, sizes, colors, stock, inStock, featured, newArrival } = req.body

    const updatedProduct = await db.update(products)
      .set({
        name,
        description,
        price,
        originalPrice,
        categoryId,
        imageUrl,
        images,
        sizes,
        colors,
        stock,
        inStock,
        featured,
        newArrival,
        updatedAt: new Date(),
      })
      .where(eq(products.id, parseInt(req.params.id)))
      .returning()

    if (updatedProduct.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(updatedProduct[0])
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// Delete product (Admin only)
app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await db.delete(products).where(eq(products.id, parseInt(req.params.id)))
    res.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// ==================== CATEGORY ROUTES ====================

app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const allCategories = await db.select().from(categories)
    res.json(allCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

app.post('/api/categories', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, imageUrl } = req.body
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const newCategory = await db.insert(categories).values({
      name,
      slug,
      description,
      imageUrl,
    }).returning()

    res.json(newCategory[0])
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// ==================== CART ROUTES ====================

// Get cart
app.get('/api/cart', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const items = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        size: cartItems.size,
        color: cartItems.color,
        product: products,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, req.user!.id))

    res.json(items)
  } catch (error) {
    console.error('Error fetching cart:', error)
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

// Add to cart
app.post('/api/cart', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, size, color } = req.body

    // Check if item already in cart
    const existingItem = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.userId, req.user!.id),
        eq(cartItems.productId, productId),
        size ? eq(cartItems.size, size) : undefined,
        color ? eq(cartItems.color, color) : undefined,
      ))

    if (existingItem.length > 0) {
      // Update quantity
      const updatedItem = await db.update(cartItems)
        .set({ quantity: existingItem[0].quantity + (quantity || 1), updatedAt: new Date() })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning()
      return res.json(updatedItem[0])
    }

    const newItem = await db.insert(cartItems).values({
      userId: req.user!.id,
      productId,
      quantity: quantity || 1,
      size,
      color,
    }).returning()

    res.json(newItem[0])
  } catch (error) {
    console.error('Error adding to cart:', error)
    res.status(500).json({ error: 'Failed to add to cart' })
  }
})

// Update cart item
app.put('/api/cart/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = req.body

    if (quantity <= 0) {
      await db.delete(cartItems).where(and(
        eq(cartItems.id, parseInt(req.params.id)),
        eq(cartItems.userId, req.user!.id)
      ))
      return res.json({ message: 'Item removed' })
    }

    const updatedItem = await db.update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(and(
        eq(cartItems.id, parseInt(req.params.id)),
        eq(cartItems.userId, req.user!.id)
      ))
      .returning()

    res.json(updatedItem[0])
  } catch (error) {
    console.error('Error updating cart:', error)
    res.status(500).json({ error: 'Failed to update cart' })
  }
})

// Remove from cart
app.delete('/api/cart/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await db.delete(cartItems).where(and(
      eq(cartItems.id, parseInt(req.params.id)),
      eq(cartItems.userId, req.user!.id)
    ))
    res.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Error removing from cart:', error)
    res.status(500).json({ error: 'Failed to remove from cart' })
  }
})

// Clear cart
app.delete('/api/cart', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await db.delete(cartItems).where(eq(cartItems.userId, req.user!.id))
    res.json({ message: 'Cart cleared' })
  } catch (error) {
    console.error('Error clearing cart:', error)
    res.status(500).json({ error: 'Failed to clear cart' })
  }
})

// ==================== ORDER & PAYMENT ROUTES ====================

// Create Razorpay order
app.post('/api/orders/create-razorpay-order', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { shippingName, shippingEmail, shippingPhone, shippingAddress, shippingCity, shippingState, shippingPincode } = req.body

    // Get cart items
    const items = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        size: cartItems.size,
        color: cartItems.color,
        product: products,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, req.user!.id))

    if (items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.product?.price || '0') * item.quantity)
    }, 0)

    // Create order in database
    const order = await db.insert(orders).values({
      userId: req.user!.id,
      status: 'pending',
      totalAmount: totalAmount.toFixed(2),
      shippingName,
      shippingEmail,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
    }).returning()

    // Create order items
    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: order[0].id,
        productId: item.product!.id,
        productName: item.product!.name,
        productImage: item.product!.imageUrl,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product!.price,
      })
    }

    // Create Razorpay order
    const razorpayInstance = getRazorpay()
    if (!razorpayInstance) {
      return res.status(500).json({ error: 'Payment gateway not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env' })
    }
    
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: `order_${order[0].id}`,
    })

    // Update order with Razorpay order ID
    await db.update(orders)
      .set({ razorpayOrderId: razorpayOrder.id })
      .where(eq(orders.id, order[0].id))

    res.json({
      orderId: order[0].id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Verify payment
app.post('/api/orders/verify-payment', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(sign)
      .digest('hex')

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }

    // Update order
    await db.update(orders)
      .set({
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.userId, req.user!.id))

    res.json({ message: 'Payment verified successfully', orderId })
  } catch (error) {
    console.error('Error verifying payment:', error)
    res.status(500).json({ error: 'Payment verification failed' })
  }
})

// Get user orders
app.get('/api/orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userOrders = await db.select().from(orders)
      .where(eq(orders.userId, req.user!.id))
      .orderBy(desc(orders.createdAt))

    res.json(userOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Get order details
app.get('/api/orders/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const order = await db.select().from(orders).where(eq(orders.id, parseInt(req.params.id)))
    
    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Check if user owns this order or is admin
    if (order[0].userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order[0].id))

    res.json({ ...order[0], items })
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// ==================== ADMIN ROUTES ====================

// Get all orders (Admin)
app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const allOrders = await db
      .select({
        order: orders,
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
        }
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))

    res.json(allOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Update order status (Admin)
app.put('/api/admin/orders/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body

    const updatedOrder = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, parseInt(req.params.id)))
      .returning()

    res.json(updatedOrder[0])
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// Get all users (Admin)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      phone: users.phone,
      city: users.city,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt))

    res.json(allUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Dashboard stats (Admin)
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const totalProducts = await db.select().from(products)
    const totalOrders = await db.select().from(orders)
    const totalUsers = await db.select().from(users)
    
    const paidOrders = totalOrders.filter(o => o.status !== 'pending' && o.status !== 'cancelled')
    const totalRevenue = paidOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)

    res.json({
      totalProducts: totalProducts.length,
      totalOrders: totalOrders.length,
      totalUsers: totalUsers.length,
      totalRevenue: totalRevenue.toFixed(2),
      recentOrders: totalOrders.slice(0, 5),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
