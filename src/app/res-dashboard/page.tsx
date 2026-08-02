"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

const metrics = [
  { label: "Today Orders", value: "184", change: "+12.4%", icon: ShoppingBag, tone: "bg-pink-100 text-pink-700" },
  { label: "Revenue", value: "৳ 34,560", change: "+8.1%", icon: CircleDollarSign, tone: "bg-emerald-100 text-emerald-700" },
  { label: "Active Customers", value: "2,340", change: "+5.6%", icon: Users, tone: "bg-sky-100 text-sky-700" },
  { label: "Avg. Delivery Time", value: "20 min", change: "-3.2%", icon: Clock3, tone: "bg-violet-100 text-violet-700" },
];

const orders = [
  { id: "#1052", customer: "Nadia A.", item: "Chicken Kebab Combo", status: "Preparing", time: "12:30 PM" },
  { id: "#1053", customer: "Samiul R.", item: "Beef Biriyani", status: "Ready", time: "12:42 PM" },
  { id: "#1054", customer: "Mim S.", item: "Cheese Pizza", status: "On the way", time: "12:55 PM" },
  { id: "#1055", customer: "Arafat K.", item: "Grilled Sandwich", status: "Delivered", time: "1:10 PM" },
];

const menuHighlights = [
  { name: "Crispy Chicken Burger", sales: 78, price: "৳ 420" },
  { name: "Beef Biriyani", sales: 64, price: "৳ 550" },
  { name: "Spicy Pasta", sales: 42, price: "৳ 390" },
  { name: "Cold Coffee", sales: 89, price: "৳ 210" },
];

export default function RestaurantDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] bg-slate-900 px-6 py-5 text-white shadow-xl shadow-slate-300/50 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-300">FoodDrop Partner</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Restaurant Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200">
              Welcome, FoodDrop Kitchen
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-500">
              View Store
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, change, icon: Icon, tone }) => (
            <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-emerald-600">{change}</span>
              </div>
              <div className="mt-5">
                <p className="text-sm text-slate-500">{label}</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value}</h2>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Live Feed</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Recent Orders</h2>
              </div>
              <button className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                View all
              </button>
            </div>

            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{order.customer}</p>
                      <p className="text-sm text-slate-500">{order.item}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{order.id}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{order.time}</p>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Performance</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Top Menu</h2>
              </div>
              <TrendingUp className="h-5 w-5 text-pink-600" />
            </div>

            <div className="space-y-4">
              {menuHighlights.map((item) => (
                <div key={item.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.sales} sold</p>
                    </div>
                    <span className="font-bold text-slate-900">{item.price}</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                      style={{ width: `${Math.min(item.sales, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Approved</h3>
                <p className="text-sm text-slate-500">Your store is live</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Rating</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">4.8 / 5</h3>
                <p className="text-sm text-slate-500">Customer satisfaction</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Support</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">24/7</h3>
                <p className="text-sm text-slate-500">Merchant success team</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
