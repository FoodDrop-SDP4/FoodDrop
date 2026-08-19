<div align="center">

# 🍔 FoodDrop

### *Next-Generation Food Delivery, Multi-Kitchen & Rider Logistics Platform*

**A full-stack, enterprise-grade food delivery ecosystem engineered with Next.js 16 (App Router & Turbopack), React 19, Prisma ORM, PostgreSQL, Universal PWA, Live GPS Navigation, Rider Gamification & Fintech Cash Ledger.**

---

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2_(Turbopack)-black?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![React 19](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)](#)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](#)
[![PWA Ready](https://img.shields.io/badge/PWA-Universal_Installable-ea580c?style=for-the-badge&logo=pwa&logoColor=white)](#)
[![Leaflet Maps](https://img.shields.io/badge/Leaflet-Interactive_Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](#)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features & Capabilities](#-key-features--capabilities)
- [System Architecture & Role Workflows](#-system-architecture--role-workflows)
  - [1. 👤 Customer Experience](#1--customer-experience)
  - [2. 🤖 Foodie AI Culinary Chef](#2--foodie-ai-culinary-chef)
  - [3. 🏪 Restaurant & Home Kitchen Command Center](#3--restaurant--home-kitchen-command-center)
  - [4. 🛵 Delivery Rider Logistics & Gamification Cockpit](#4--delivery-rider-logistics--gamification-cockpit)
  - [5. 📱 Universal Progressive Web App (PWA)](#5--universal-progressive-web-app-pwa)
- [Fintech & Security Features](#-fintech--security-features)
  - [💵 COD Cash in Hand Ledger & Settlement](#-cod-cash-in-hand-ledger--settlement)
  - [🔐 Live One-Tap Delivery Confirmation & 4-Digit PIN](#-live-one-tap-delivery-confirmation--4-digit-pin)
  - [🏆 Rider Gamification & Rewards Hub](#-rider-gamification--rewards-hub)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Configuration](#-environment-configuration)
- [Database Setup & Migration](#-database-setup--migration)
- [REST API Reference](#-rest-api-reference)
- [Contributing & License](#-contributing--license)

---

## 🍽️ Overview

**FoodDrop** is a modern, reactive food delivery and restaurant intelligence ecosystem designed for hyper-local food commerce in Bangladesh. Built on **Next.js 16 App Router, React 19, Tailwind CSS v4, and Prisma ORM**, FoodDrop seamlessly unifies:

1. **Customers:** AI-powered food discovery, dynamic kitchen filtering (Commercial vs. Authentic Homemade), cart persistence across reloads, and live GPS order tracking.
2. **Restaurants & Home Chefs:** Real-time incoming order management, POS/KOT receipt printing, dynamic menu pricing, and kitchen prep synchronization.
3. **Delivery Riders:** Stacked multi-order routing (batching up to 3 orders), live OpenStreetMap navigation, kitchen status guards, COD Cash in Hand ledger, and gamified tier progressions.

---

## ✨ Key Features & Capabilities

- ⚡ **Turbopack Architecture:** High-speed Hot Module Replacement (HMR) with zero-latency Server Components.
- 📱 **Universal Progressive Web App (PWA):** Installs as a standalone native app on Android, iOS, Windows, and macOS with service worker offline caching.
- 🤖 **Multilingual AI Chef Assistant:** Conversational food recommendations in English, Bangla script, or Banglish (e.g., *"200 takar moddhe jhal biryani"*), with calorie estimations and auto-combo discounts.
- 🛵 **Stacked Orders (Multi-Order Batching):** Riders can batch up to 3 deliveries from nearby restaurants to maximize trip earnings.
- 🔒 **Kitchen Lock Security:** Backend validation ensures riders cannot pick up orders until the kitchen explicitly marks them `READY_FOR_PICKUP`.
- 🔐 **Live One-Tap Delivery Confirmation:** Customer receives a real-time prompt upon arrival (`Yes, Received Food! 🎉`) with 4-digit backup PIN code verification.
- 💵 **COD Cash in Hand Ledger:** Real-time tracking of rider cash collections, net earnings, platform payables, and safety float limit (৳5,000 max) with bKash/Nagad/Office settlement.
- 🏆 **Rider Gamification Hub:** Dynamic partner tiers (Bronze, Silver, Gold, Platinum), Daily Quests with cash rewards, and unlockable achievement badges.
- 🛒 **Cart Persistence:** Zustand `persist` store preserving cart items and quantities across reloads.
- 🗺️ **Live Leaflet GPS Maps:** Real-time interactive delivery routes, waypoint tracking, and rider radar simulation.

---

## 🏛️ System Architecture & Role Workflows

```mermaid
graph TD
    User([Customer]) -->|Browse / AI Search / Checkout| CoreApp[FoodDrop App]
    Owner([Restaurant / Home Chef]) -->|Manage Orders & Kitchen KOT| RestPortal[Restaurant Dashboard]
    Rider([Delivery Rider]) -->|Accept Stacked Orders & GPS Nav| RiderPortal[Rider Cockpit]
    
    CoreApp -->|Prisma ORM| DB[(PostgreSQL Database)]
    RestPortal -->|Prisma ORM| DB
    RiderPortal -->|Prisma ORM| DB
    
    CoreApp -->|NLP / RAG Engine| AIChef[Foodie AI Chef]
    RiderPortal -->|Live Confirmation Prompt| User
    RiderPortal -->|Float Settlement| DB
```

### 1. 👤 Customer Experience
* **Hero Search & Suggestions:** Instant dish matching with category autocomplete and price tags.
* **Dual Kitchen Modes:** Switch effortlessly between *🍽️ Commercial Restaurants* and *🏡 Authentic Homemade Kitchens*.
* **Cart Drawer & Persistence:** Real-time price calculation, coupon discounts, delivery notes, and instant checkout.
* **Live GPS Order Tracking:** Real-time 5-stage progress stepper (*Placed* ➔ *Cooking* ➔ *Ready* ➔ *On the Way / Arrived* ➔ *Delivered*) with Leaflet maps.

### 2. 🤖 Foodie AI Culinary Chef
* **Natural Language Understanding:** Interprets Bengali numerals (`৩০০`), Bangla script (`"কম ঝালের বিরিয়ানি"`), and Banglish (`"khida lagse combo dao"`).
* **Smart Combos & Nutrition:** Pairs complementary dishes and drinks with an exclusive 10% AI combo discount and estimated calories (~kcal).

### 3. 🏪 Restaurant & Home Kitchen Command Center
* **Incoming Live Orders:** Audio-visual notifications on order arrival with decline/accept actions.
* **Kitchen Order Ticket (KOT):** Printable thermal receipts for kitchen chefs.
* **Status Controls:** Step transitions from *Start Cooking 🍳* to *Mark Food Ready for Rider 📦*.

### 4. 🛵 Delivery Rider Logistics & Gamification Cockpit
* **Multi-Order Stack Cockpit:** Manage up to 3 concurrent active deliveries with combined payout summaries.
* **Interactive Navigation:** OpenStreetMap & Leaflet route directions and direct customer/restaurant calling.
* **Kitchen Guard:** Prevents pickup until the restaurant marks food as ready.
* **One-Tap Arrival & PIN:** Triggers arrival prompt on customer's device or verifies via 4-digit code.

### 5. 📱 Universal Progressive Web App (PWA)
* **Manifest & Icons:** App manifest with shortcuts (Browse, Rider, Kitchen) and maskable icons.
* **Service Worker (`sw.js`):** Caches static assets for fast load times.
* **Role-Based Install Banner:** Tailored install prompts for Customers, Restaurant Owners, and Delivery Riders.

---

## 💳 Fintech & Security Features

### 💵 COD Cash in Hand Ledger & Settlement
| Field | Description | Formula |
|:---|:---|:---|
| 💵 **Cash in Hand** | Total cash collected from customers | $\text{Gross Cash} - \text{Total Settled}$ |
| 💰 **My Net Earnings** | Retained rider delivery payout | $\sum (\text{Delivery Fee})$ |
| 🏦 **Payable to Platform** | Company/Restaurant share to be deposited | $\text{Cash in Hand} - \text{Net Earnings} - \text{Settled}$ |
| 🛡️ **Float Safety Limit** | Maximum allowed un-deposited cash | **৳5,000 Limit** with color-coded alerts |

* **Digital Settlement Flow:** Riders deposit float via **bKash Merchant, Nagad, or Office Cash Desk**. Transactions are stored in PostgreSQL (`Settlement` table) and instantly adjust payable balances with zero-overdeposit guards.

### 🔐 Live One-Tap Delivery Confirmation & 4-Digit PIN
1. Rider arrives at customer's doorstep and taps **"🛵 I Have Arrived at Doorstep"** (Order status: `ARRIVED`).
2. A live interactive prompt appears on the Customer's phone: **`"Yes, I Received My Food! 🍕"`**.
3. Tapping confirms delivery, plays celebration audio, triggers fireworks, and completes the trip.
4. If customer's phone is offline, the rider enters the **4-Digit Backup Delivery PIN** shown on the customer's tracking screen.

### 🏆 Rider Gamification & Rewards Hub
* **Partner Tiers:**
  * 🥉 **Bronze Starter (0–15 trips):** Base payout.
  * 🥈 **Silver Partner (16–40 trips):** +৳5 bonus per delivery + Stacked orders unlocked.
  * 🥇 **Gold Partner (41–90 trips):** +৳10 bonus per delivery + Priority dispatch.
  * 💎 **Platinum Legend (90+ trips & 4.8+ rating):** +৳15 bonus per delivery + VIP 24/7 helpline.
* **Daily Quests:** Real-time quests (e.g. *"Complete 3 trips today ➔ +৳50 Bonus"*) with instant reward claiming.
* **Achievement Badges:** 🚀 *First Flight*, ⚡ *Speed Striker*, ⭐ *5-Star Master*, 📦 *Multi-Stack Pro*, 🔥 *Weekend Warrior*, 🌙 *Night Owl*.

---

## 🛠️ Tech Stack

| Category | Technologies |
|:---|:---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions, Route Handlers) |
| **Frontend & UI** | [React 19](https://react.dev/), [Lucide Icons](https://lucide.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (PostCSS) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Database & ORM** | [PostgreSQL (Supabase)](https://supabase.com/), [Prisma ORM 5.22](https://www.prisma.io/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) with `persist` storage middleware |
| **PWA Engine** | Web App Manifest, Service Worker (`sw.js`), Next.js Metadata |
| **Maps & GPS** | [Leaflet](https://leafletjs.com/), [React-Leaflet](https://react-leaflet.js.org/), OpenStreetMap |
| **Auth & Security** | [Jose](https://github.com/panva/jose) (JWT), [Bcryptjs](https://www.npmjs.com/package/bcryptjs) |

---

## 🗂️ Project Directory Structure

```text
FoodDrop/
├── prisma/
│   ├── schema.prisma              # PostgreSQL schema (User, Restaurant, MenuItem, Order, Settlement, Review)
│   └── seed.ts                    # Database seeder with sample restaurants & dishes
├── public/
│   ├── icons/                     # PWA icons (192x192, 512x512, maskable)
│   ├── sw.js                      # Service Worker script
│   └── favicon.ico / apple-touch  # App icons & metadata
├── src/
│   ├── app/
│   │   ├── api/                   # REST API Endpoints
│   │   │   ├── ai/recommend/      # AI Chef recommendation engine
│   │   │   ├── auth/              # Auth routes (login, register, OTP, me)
│   │   │   ├── orders/            # Order creation, rider active orders, tracking
│   │   │   │   ├── [id]/          # Order by ID (GET, PATCH)
│   │   │   │   ├── rider/         # Rider active orders & status updates
│   │   │   │   └── user/          # Customer order history
│   │   │   ├── restaurants/       # Restaurant management & menus
│   │   │   └── rider/             # Rider acceptance, status, history & settlements
│   │   │       ├── accept-order/  # Claim order with stack limit validation
│   │   │       ├── history/       # Rider completed deliveries & cash ledger
│   │   │       └── settle/        # COD cash float settlement
│   │   ├── checkout/              # Checkout & payment processing
│   │   ├── manifest.ts            # Next.js App Router Web App Manifest
│   │   ├── orders/ / [id]/track/  # Order history & live GPS tracking
│   │   ├── restaurant/            # Restaurant owner portal
│   │   ├── rider/                 # Rider delivery cockpit & profile
│   │   │   └── profile/           # Rider Gamification & Cash Ledger Hub
│   │   ├── layout.tsx             # Root layout with PWA, Navbar & Live Prompt
│   │   ├── page.tsx               # Customer homepage
│   │   └── globals.css            # Tailwind CSS v4 styling
│   ├── components/
│   │   ├── ai/                    # Foodie AI Assistant conversational modal
│   │   ├── common/                # Navbar, CartDrawer, PWAInstallPrompt
│   │   ├── food/                  # FoodCard, CategoryFilter, FoodDetailModal
│   │   ├── home/                  # HeroSearch with suggestion autocomplete
│   │   ├── orders/                # LiveCustomerDeliveryPrompt, OrderCard, ReceiptModal
│   │   ├── rider/                 # RiderNavigationMap with Leaflet GPS
│   │   └── tracking/              # OrderTrackingView with arrival confirmation
│   ├── lib/                       # Prisma client, sound engine, confetti, auth
│   ├── store/                     # Zustand stores (useCartStore with persist)
│   └── types/                     # TypeScript interfaces (User, Order, Settlement, CashLedger)
├── .env                           # Environment variables
├── next.config.ts                 # Next.js config (allowedDevOrigins, headers)
├── package.json                   # Dependencies & scripts
└── tsconfig.json                  # TypeScript compiler configuration
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v18.18.0` or higher (Node 20+ recommended)
- **npm** or **pnpm** / **yarn**
- **PostgreSQL Database** (e.g., Supabase, Neon, or Local PostgreSQL)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/FoodDrop-SDP4/FoodDrop.git
cd FoodDrop
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the root directory:
```env
# PostgreSQL Database Connection (Supabase / Local)
DATABASE_URL="postgresql://postgres:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@host:5432/postgres"

# JWT Secret Key
JWT_SECRET="your_secure_jwt_secret_key"

# (Optional) Google Gemini API Key
GEMINI_API_KEY="your_gemini_api_key"
```

### 4️⃣ Database Setup & Migrations
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Seed Initial Data
npx prisma db seed
```

### 5️⃣ Run the Application
```bash
# Development Mode (Accessible on LAN: 0.0.0.0)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 REST API Reference

### 🔐 Authentication
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/auth/register` | Register new Customer / Restaurant Owner / Rider |
| `POST` | `/api/auth/register/verify-otp` | Verify registration OTP code |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT cookie |
| `GET` | `/api/auth/me` | Fetch active authenticated user credentials |

### 📦 Orders & Delivery
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/orders` | Create a new food delivery order |
| `GET` | `/api/orders/user?userId=...` | Fetch orders placed by a customer |
| `GET` | `/api/orders/[id]` | Get detailed order status and live tracking info |
| `PATCH`| `/api/orders/[id]` | Update order status (`DELIVERED`, `CANCELLED`) |
| `GET` | `/api/orders/rider?riderId=...` | Fetch active stacked orders for a rider |
| `PATCH`| `/api/orders/rider` | Rider status transition (`ON_THE_WAY`, `ARRIVED`, `DELIVERED`) |

### 🛵 Rider Operations & Fintech
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/rider/available-orders` | Fetch unassigned orders ready for delivery |
| `POST` | `/api/rider/accept-order` | Claim an order (max 3 stacked limit) |
| `PATCH`| `/api/rider/status` | Toggle rider Online/Offline GPS availability |
| `GET` | `/api/rider/history?riderId=...` | Fetch completed deliveries, earnings & Cash in Hand ledger |
| `POST` | `/api/rider/settle` | Settle & deposit COD cash float (bKash, Nagad, Office) |

### 🍽️ Restaurants & Menus
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/restaurants/menu` | Fetch all menu items across restaurants |
| `GET` | `/api/restaurants/[id]` | Fetch restaurant details and parsed menu discounts |
| `POST` | `/api/restaurants/register` | Register a new commercial restaurant or home kitchen |
| `GET` | `/api/restaurants/dashboard` | Fetch owner restaurant statistics, revenue & orders |

---

## 👥 Contributing & License

Contributions, bug reports, and feature proposals are welcome!

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

<div align="center">

Made with ❤️ by the **FoodDrop Engineering Team**

⭐ Star us on GitHub if you love this platform!

</div>
