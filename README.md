<div align="center">

# 🍔 FoodDrop

### *Your Food, Delivered Fast.*

**A next-generation, full-stack food delivery and culinary intelligence ecosystem connecting Customers, Commercial Restaurants, Home Chefs, and Delivery Riders in real-time.**

---

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2_(Turbopack)-black?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![React 19](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)](#)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](#)
[![Leaflet Maps](https://img.shields.io/badge/Leaflet-Interactive_Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](#)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Highlights](#-key-highlights)
- [System Architecture & Roles](#-system-architecture--roles)
  - [1. 👤 Customer Experience](#1--customer-experience)
  - [2. 🤖 AI Chef Assistant](#2--foodie-ai-chef-assistant)
  - [3. 🏪 Restaurant & Home Kitchen Portal](#3--restaurant--home-kitchen-portal)
  - [4. 🛵 Delivery Rider Command Center](#4--delivery-rider-command-center)
- [Tech Stack](#-tech-stack)
- [Project Directory Layout](#-project-directory-layout)
- [Getting Started & Installation](#-getting-started--installation)
- [Environment Configuration](#-environment-configuration)
- [Database Setup & Seeding](#-database-setup--seeding)
- [Running the Application](#-running-the-application)
- [REST API Documentation](#-rest-api-documentation)
- [Contributing & Team](#-contributing--team)

---

## 🍽️ Overview

**FoodDrop** is an all-in-one food delivery ecosystem engineered to revolutionize online food ordering in Bangladesh. Built on **Next.js 16 with Turbopack, React 19, and Prisma ORM**, FoodDrop seamlessly unifies commercial restaurants, authentic homemade kitchens, delivery riders, and customers into one lightning-fast, reactive web application.

Unlike conventional delivery platforms, FoodDrop features an intelligent **Foodie AI Chef** with multilingual natural language understanding (English, Bangla, and Banglish), dual-kitchen classification (Restaurants vs. Authentic Home Cooks), real-time interactive Leaflet maps with rider simulation, and dynamic audio-visual feedback.

---

## ✨ Key Highlights

- ⚡ **Turbopack & Next.js 16 Architecture:** Instant HMR, zero-latency server rendering, and optimized production builds.
- 🤖 **Smart Multilingual AI Assistant:** Deep intent understanding for queries in English, Bengali script, or Banglish (e.g., *"200 takar moddhe jhal biryani"*, *"combo for 2"*), with calorie estimations and one-click cart additions.
- 🏡 **Commercial & Homemade Kitchen Support:** Dedicated filters and verification badges distinguishing high-end restaurants from authentic homemade home cooks.
- 🗺️ **Live Leaflet Map & GPS Navigation:** Interactive route tracking and animated rider radar simulation for real-time delivery status.
- 🏷️ **Smart Discounts & Strike-Through Pricing:** Automatic promotion parsing, discount percentages (`🔥 20% OFF`), and restaurant review aggregations.
- 🎵 **Interactive Audio & Celebrations:** Audio cues for cart actions and festive confetti triggers (`canvas-confetti`).
- 🔐 **Secure Role-Based Access Control (RBAC):** Cookie-based JWT auth protecting Customer, Restaurant Owner, and Rider routes.

---

## 🏛️ System Architecture & Roles

```mermaid
graph TD
    User([Customer]) -->|Browse / AI Search / Order| App[FoodDrop Core App]
    Owner([Restaurant / Home Chef]) -->|Manage Menu & Orders| Dashboard[Restaurant Dashboard]
    Rider([Delivery Rider]) -->|Accept Orders & GPS Nav| RiderPortal[Rider Portal]
    App -->|Prisma ORM| DB[(PostgreSQL Database)]
    Dashboard -->|Prisma ORM| DB
    RiderPortal -->|Prisma ORM| DB
    App -->|Multilingual NLP / RAG| AIChef[Foodie AI Chef Engine]
```

### 1. 👤 Customer Experience
- **Smart Hero Search:** Autocomplete dropdown with live dish search, pricing, and category suggestions.
- **Dynamic Kitchen Switcher:** Toggle instantly between *All Kitchens*, *🍽️ Commercial Restaurants*, and *🏡 Homemade Foods*.
- **Category Filter:** Biryani & Rice, Fast Food & Burgers, Pizza & Pasta, Chinese & Thai, Desserts, and Drinks.
- **Cart & Checkout Drawer:** Live price calculation, custom item quantities, delivery notes, and instant checkout.
- **Live Order Tracking:** Step-by-step progress (*Pending* ➔ *Accepted* ➔ *Preparing* ➔ *Out for Delivery* ➔ *Delivered*) with Leaflet map visualization.

### 2. 🤖 Foodie AI Chef Assistant
- **Multilingual Query Parser:** Understands Bengali numerals (`২০০`), Bengali script (`"আমার ২০০ টাকার মধ্যে কাচ্চি বিরিয়ানি"`), and Banglish (`"khida lagse 2 joner combo dao"`).
- **Time-Aware Recommendations:** Dynamic greetings and suggestions tailored to Breakfast, Lunch, Evening Snacks, or Late-Night Cravings.
- **Calorie & Macro Estimation:** Accurate estimate tags (~kcal, protein count, diet suitability).
- **Smart Combo Builder:** Automatically pairs compatible mains and beverages with an exclusive 10% AI combo discount.
- **LLM Ready:** Built-in adapter for Google Gemini API (`GEMINI_API_KEY`) with high-speed local NLP fallback.

### 3. 🏪 Restaurant & Home Kitchen Portal
- **Dashboard Overview:** View active orders, completed deliveries, and revenue analytics.
- **Menu Management:** Add, edit, or remove dishes with custom pricing, discount tags (`[ORIGINAL:xxx]`), categories, and availability switches.
- **Kitchen Verification:** Distinguish homemade food creators with verified home kitchen badges.

### 4. 🛵 Delivery Rider Command Center
- **Available Orders Radar:** Real-time stream of nearby unassigned orders ready for pickup.
- **Interactive Navigation Map:** OpenStreetMap & Leaflet with pulsing radar markers and route plotting.
- **Order Lifecycle Management:** One-click transitions (*Accept Order* ➔ *Picked Up* ➔ *Delivered*).
- **Earnings & History Tracker:** Track total deliveries and daily payouts.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions & API Routes) |
| **UI & Components** | [React 19](https://react.dev/), [Lucide Icons](https://lucide.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (PostCSS, Custom Design System) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Database & ORM** | [PostgreSQL (Supabase)](https://supabase.com/), [Prisma ORM 5.22](https://www.prisma.io/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) (Cart store, sound preferences) |
| **Maps & Geolocation** | [Leaflet](https://leafletjs.com/), [React-Leaflet](https://react-leaflet.js.org/), OpenStreetMap tiles |
| **Authentication & Security** | [Jose](https://github.com/panva/jose) (JWT), [Bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| **Validation** | [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/) |

---

## 🗂️ Project Directory Layout

```text
FoodDrop/
├── prisma/
│   ├── schema.prisma              # Database schemas (User, Restaurant, MenuItem, Order, Review, Address)
│   └── seed.ts                    # Database seeder with authentic menus & test data
├── public/                        # Static assets, sound clips, branding
├── src/
│   ├── app/
│   │   ├── api/                   # RESTful API Endpoints
│   │   │   ├── ai/recommend/      # Multilingual AI Chef recommendation engine
│   │   │   ├── auth/              # Login, register, logout, OTP verification, /me
│   │   │   ├── orders/            # Order creation, history, tracking, rider feeds
│   │   │   ├── restaurants/       # Restaurant profiles, menus, dashboard
│   │   │   ├── reviews/           # Customer food and restaurant ratings
│   │   │   └── rider/             # Rider status, history, acceptance
│   │   ├── checkout/              # Checkout & payment processing page
│   │   ├── login/ / register/     # Customer auth pages
│   │   ├── orders/ / [id]/track/  # Order history & live GPS tracking
│   │   ├── restaurant/            # Restaurant owner portal & registration
│   │   ├── restaurants/[id]/      # Public restaurant menu page
│   │   ├── rider/                 # Rider delivery portal & profile
│   │   ├── layout.tsx             # Root layout with Navbar, Cart Drawer & AI Assistant
│   │   ├── page.tsx               # Customer homepage (Hero search, category filter, food grid)
│   │   └── globals.css            # Tailwind CSS v4 root stylesheet
│   ├── components/
│   │   ├── ai/                    # Foodie AI Assistant modal & conversational UI
│   │   ├── common/                # Navbar, CartDrawer, Footer
│   │   ├── food/                  # FoodCard, CategoryFilter, FoodDetailModal
│   │   ├── home/                  # HeroSearch with suggestion dropdown & popular chips
│   │   └── rider/                 # RiderNavigationMap with Leaflet markers & radar
│   ├── lib/                       # Prisma client, menu parser, sound engine, confetti
│   ├── store/                     # Zustand stores (useCartStore, useSoundStore)
│   └── types/                     # TypeScript interfaces (User, Restaurant, MenuItem, Order)
├── .env                           # Environment variables (Database URL, Secrets)
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies & scripts
└── tsconfig.json                  # TypeScript compiler settings
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js**: `v18.18.0` or higher (Node 20+ recommended)
- **npm** or **yarn** / **pnpm**
- **PostgreSQL Database** (e.g., Local PostgreSQL, Supabase, Neon, or Railway)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/FoodDrop-SDP4/FoodDrop.git
cd FoodDrop
```

### 2️⃣ Install Dependencies
```bash
npm install
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# PostgreSQL Database Connection (Supabase / Local / Neon)
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/postgres"

# JWT Secret for Authentication
JWT_SECRET="your_secure_jwt_secret_key_here"

# (Optional) Google Gemini API Key for LLM-powered AI Chef
GEMINI_API_KEY="your_gemini_api_key_here"
```

---

## 🗄️ Database Setup & Seeding

1. **Run Prisma Migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **(Optional) Seed Initial Restaurants & Menus:**
   ```bash
   npx prisma db seed
   ```

4. **(Optional) Explore Database with Prisma Studio:**
   ```bash
   npx prisma studio
   ```

---

## ▶️ Running the Application

### Development Mode (with Turbopack)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view FoodDrop.

### Production Build
```bash
npm run build
npm start
```

---

## 🔌 REST API Documentation

### 🔐 Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new customer / restaurant / rider |
| `POST` | `/api/auth/register/verify-otp` | Verify registration OTP code |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT cookie |
| `POST` | `/api/auth/logout` | Clear session cookies |
| `GET` | `/api/auth/me` | Fetch active user credentials & role |

### 🍽️ Restaurants & Menus
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/restaurants/menu` | Fetch all menu items with ratings & reviews |
| `GET` | `/api/restaurants/[id]` | Fetch restaurant details and parsed menu discounts |
| `POST` | `/api/restaurants/register` | Register a new restaurant or home kitchen |
| `GET` | `/api/restaurants/dashboard` | Fetch owner restaurant statistics and menu items |

### 📦 Orders & Delivery
| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/orders` | List user orders or create a new order |
| `GET` | `/api/orders/[id]` | Get detailed order status and live tracking info |
| `POST` | `/api/orders/[id]/cancel` | Cancel an order before preparation |
| `GET` | `/api/orders/rider` | Fetch current active delivery for rider |

### 🛵 Rider Operations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/rider/available-orders` | Fetch unassigned pending delivery orders |
| `POST` | `/api/rider/accept-order` | Claim an available order for delivery |
| `GET/POST`| `/api/rider/status` | Get or update rider online/offline status |
| `GET` | `/api/rider/history` | View completed deliveries and earnings |

### 🤖 AI Culinary Assistant
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/recommend` | Natural language food recommendations, combos & calories |

---

## 👥 Contributing & Team

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">

Made with ❤️ by the **FoodDrop Team**

⭐ Star us on GitHub if you like this project!

</div>
