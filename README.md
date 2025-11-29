# sanor

A premium IRL clothes e-commerce platform built with Next.js, Express, PostgreSQL, and Drizzle ORM.

## 🎨 Design

- **Colors**: Pink (#FF69B4), Light Purple (#D8BFD8), White, and Black
- **Logo**: Avatar movie-inspired Papyrus font style
- **Theme**: Elegant, modern, feminine fashion aesthetic

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt password hashing
- **Payments**: Razorpay integration

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Razorpay account (for payments)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create your `.env` file (copy from `sample-env.txt`):
```bash
cp sample-env.txt .env
```

3. Update the `.env` file with your credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/sanor
SESSION_SECRET=your-super-secret-key
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

4. Push the database schema:
```bash
npm run db:push
```

5. Run the development servers:
```bash
npm run dev
```

This will start:
- Next.js frontend on `http://localhost:3000`
- Express API server on `http://localhost:3001`

6. Seed demo users (POST request or click "Seed demo users" on login page):
```bash
curl -X POST http://localhost:3001/api/seed
```

## 👤 Demo Accounts

| Role  | Email            | Password |
|-------|------------------|----------|
| User  | user@sanor.com   | user123  |
| Admin | admin@sanor.com  | admin123 |

## 🗂️ Project Structure

```
sanor/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles
│   ├── login/              # Login/Register page
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout with Razorpay
│   ├── orders/             # User orders
│   ├── shop/               # Product listing
│   └── admin/              # Admin dashboard
│       ├── products/       # Product management
│       ├── orders/         # Order management
│       └── users/          # User management
├── components/             # React components
├── context/                # React contexts
│   ├── AuthContext.tsx     # Authentication state
│   └── CartContext.tsx     # Cart state
├── lib/                    # Utilities
│   └── api.ts              # API client
├── db/                     # Database
│   ├── index.ts            # Drizzle client
│   └── schema.ts           # Database schema
├── server/                 # Express backend
│   └── index.ts            # API routes
└── drizzle.config.ts       # Drizzle configuration
```

## 🗄️ Database Schema

- **users**: User accounts with roles (user/admin)
- **categories**: Product categories
- **products**: Products with sizes, colors, prices
- **cart_items**: User shopping carts
- **orders**: Order records with shipping & payment info
- **order_items**: Individual items in orders

## 🚀 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/seed` | Seed demo users |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart` | Add to cart |
| PUT | `/api/cart/:id` | Update cart item |
| DELETE | `/api/cart/:id` | Remove from cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user's orders |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/orders/create-razorpay-order` | Create payment order |
| POST | `/api/orders/verify-payment` | Verify payment |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/orders` | All orders |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/users` | All users |

## 🎨 Features

### Customer Features
- ✅ User registration & login
- ✅ Browse products by category
- ✅ Add products to cart with size/color selection
- ✅ Checkout with shipping address
- ✅ Razorpay payment integration
- ✅ Order tracking

### Admin Features
- ✅ Dashboard with statistics
- ✅ Add/Edit/Delete products
- ✅ Manage product sizes and colors
- ✅ View and update order status
- ✅ View registered users

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Pink | `#FF69B4` | Primary accents |
| Pink Light | `#FFB6C1` | Backgrounds, highlights |
| Pink Soft | `#FFC0CB` | Hover states |
| Purple | `#9B59B6` | Secondary accents |
| Purple Light | `#D8BFD8` | Backgrounds |
| Purple Soft | `#E6E6FA` | Subtle accents |
| Black | `#1A1A1A` | Text, logo |
| White | `#FFFFFF` | Backgrounds |

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run Next.js + Express servers |
| `npm run dev:next` | Run Next.js only |
| `npm run dev:server` | Run Express server only |
| `npm run build` | Build for production |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Made with 💖 by sanor
