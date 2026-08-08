"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BellRing,
  Clock3,
  CircleDollarSign,
  ImagePlus,
  LayoutGrid,
  ListOrdered,
  MenuSquare,
  Package,
  Plus,
  Store,
  ToggleLeft,
  ToggleRight,
  Truck,
  UtensilsCrossed,
  X,
} from "lucide-react";

type TabKey = "overview" | "live-orders" | "menu-management";
type OrderStatus = "pending" | "preparing" | "ready";

type OrderItem = {
  name: string;
  quantity: number;
};

type Order = {
  id: string;
  customerName: string;
  deliveryArea: string;
  timestamp: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  prepTime: number;
};

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
};

type MenuFormState = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
};

const tabs: Array<{ key: TabKey; label: string; icon: typeof LayoutGrid }> = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "live-orders", label: "Live Orders", icon: ListOrdered },
  { key: "menu-management", label: "Menu Management", icon: MenuSquare },
];

const initialOrders: Order[] = [
  {
    id: "#FD-8921",
    customerName: "Nabila Rahman",
    deliveryArea: "Dhanmondi 27",
    timestamp: "10:42 AM",
    items: [
      { name: "Chicken Biryani", quantity: 2 },
      { name: "Borhani", quantity: 2 },
    ],
    total: 1240,
    status: "pending",
    prepTime: 24,
  },
  {
    id: "#FD-8922",
    customerName: "Farhan Ahmed",
    deliveryArea: "Lalmatia",
    timestamp: "10:29 AM",
    items: [
      { name: "Beef Tehari", quantity: 1 },
      { name: "Chicken Fry", quantity: 1 },
    ],
    total: 890,
    status: "preparing",
    prepTime: 20,
  },
  {
    id: "#FD-8923",
    customerName: "Tania Akter",
    deliveryArea: "Shankharipara",
    timestamp: "10:15 AM",
    items: [
      { name: "Grilled Chicken Platter", quantity: 1 },
      { name: "Mint Lemonade", quantity: 2 },
    ],
    total: 1450,
    status: "ready",
    prepTime: 26,
  },
  {
    id: "#FD-8924",
    customerName: "Sabbir Hossain",
    deliveryArea: "Kalabagan",
    timestamp: "09:58 AM",
    items: [
      { name: "Family Combo Pizza", quantity: 1 },
      { name: "Garlic Dip", quantity: 2 },
    ],
    total: 2250,
    status: "pending",
    prepTime: 18,
  },
];

const initialMenuItems: MenuItem[] = [
  {
    id: "menu-1",
    name: "Chicken Biryani",
    description: "Fragrant rice, tender chicken, and a house spice blend.",
    price: 420,
    category: "Rice",
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "menu-2",
    name: "Beef Tehari",
    description: "Rich beef tehari with soft potatoes and aromatic rice.",
    price: 390,
    category: "Signature",
    imageUrl: "https://images.unsplash.com/photo-1604908554027-7d0b3a8b6c88?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "menu-3",
    name: "Grilled Chicken Platter",
    description: "A high-protein platter served with salad and dip.",
    price: 560,
    category: "Grill",
    imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "menu-4",
    name: "Cold Coffee",
    description: "Creamy, chilled, and balanced with light sweetness.",
    price: 180,
    category: "Beverage",
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
  },
];

const orderLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready for Pickup",
};

const orderBadgeStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  preparing: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
  ready: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
};

const menuBadgeStyles: Record<string, string> = {
  Rice: "bg-slate-950 text-white",
  Signature: "bg-emerald-100 text-emerald-800",
  Grill: "bg-sky-100 text-sky-800",
  Beverage: "bg-amber-100 text-amber-800",
};

function formatTk(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

export default function RestaurantAdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [availability, setAvailability] = useState(true);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<MenuFormState>({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const overviewMetrics = useMemo(() => {
    const todaysOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter((order) => order.status === "pending").length;
    const activeMenuItems = menuItems.length;

    return [
      { label: "Today's Orders", value: String(todaysOrders), icon: UtensilsCrossed },
      { label: "Total Revenue", value: formatTk(totalRevenue), icon: CircleDollarSign },
      { label: "Pending Orders", value: String(pendingOrders), icon: BellRing },
      { label: "Active Menu Items", value: String(activeMenuItems), icon: Package },
    ];
  }, [menuItems.length, orders]);

  const pendingOrders = useMemo(() => orders.filter((order) => order.status === "pending"), [orders]);
  const preparingOrders = useMemo(() => orders.filter((order) => order.status === "preparing"), [orders]);
  const readyOrders = useMemo(() => orders.filter((order) => order.status === "ready"), [orders]);

  const updateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)),
    );
  };

  const removeOrder = (orderId: string) => {
    setOrders((currentOrders) => currentOrders.filter((order) => order.id !== orderId));
  };

  const handleAddMenuItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();
    const trimmedImageUrl = form.imageUrl.trim();
    const priceValue = Number(form.price);

    if (!trimmedName || !trimmedDescription || !trimmedImageUrl || Number.isNaN(priceValue) || priceValue <= 0) {
      return;
    }

    const category = trimmedDescription.toLowerCase().includes("coffee")
      ? "Beverage"
      : trimmedDescription.toLowerCase().includes("grill")
        ? "Grill"
        : "Signature";

    setMenuItems((currentItems) => [
      {
        id: `menu-${Date.now()}`,
        name: trimmedName,
        description: trimmedDescription,
        price: priceValue,
        category,
        imageUrl: trimmedImageUrl,
      },
      ...currentItems,
    ]);

    setForm({ name: "", description: "", price: "", imageUrl: "" });
    setIsModalOpen(false);
    setActiveTab("menu-management");
  };

  return (
    <main className="min-h-screen bg-gray-50/50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-6">
        <header className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                <Store className="h-3.5 w-3.5" />
                Restaurant Owner Dashboard
              </div>
              <div>
                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Sultan&apos;s Dine - Dhanmondi Branch
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                  High-signal control center for live order flow, menu updates, and quick operational visibility.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAvailability((current) => !current)}
              className={`inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
                availability
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-100 text-slate-700"
              }`}
            >
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Availability</span>
              <span>{availability ? "Online" : "Offline"}</span>
              {availability ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            </button>
          </div>

          <nav className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            {tabs.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
                    isActive
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </nav>
        </header>

        {activeTab === "overview" ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {overviewMetrics.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{label}</p>
                      <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Live Summary</p>
                    <h2 className="mt-1 text-2xl font-black">Order Funnel</h2>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                    {pendingOrders.length + preparingOrders.length + readyOrders.length} active
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { title: "Pending", count: pendingOrders.length, tone: "bg-amber-50 text-amber-800" },
                    { title: "Preparing", count: preparingOrders.length, tone: "bg-sky-50 text-sky-800" },
                    { title: "Ready", count: readyOrders.length, tone: "bg-emerald-50 text-emerald-800" },
                  ].map((entry) => (
                    <div key={entry.title} className={`rounded-3xl p-5 ${entry.tone}`}>
                      <p className="text-sm font-medium opacity-80">{entry.title}</p>
                      <p className="mt-3 text-4xl font-black tracking-tight">{entry.count}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Operations</p>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Kitchen status", value: availability ? "Online" : "Offline" },
                    { label: "Avg. prep window", value: "22 mins" },
                    { label: "Delivery handoff", value: "Rider queue active" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-950">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "live-orders" ? (
          <section className="grid gap-4">
            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                No live orders in the queue.
              </div>
            ) : (
              orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${orderBadgeStyles[order.status]}`}
                        >
                          {orderLabels[order.status]}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">{order.id}</span>
                      </div>

                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-950">{order.customerName}</h2>
                        <p className="mt-1 text-sm text-slate-600">
                          {order.deliveryArea} • {order.timestamp}
                        </p>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {order.items.map((item) => (
                          <div key={`${order.id}-${item.name}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-slate-700">{item.name}</span>
                              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                                x{item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:min-w-[280px]">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-slate-500">Total</span>
                        <span className="text-2xl font-black tracking-tight text-slate-950">{formatTk(order.total)}</span>
                      </div>

                      <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                        <span>Estimated prep</span>
                        <span className="font-semibold text-slate-900">{order.prepTime} mins</span>
                      </div>

                      <div className="pt-1">
                        {order.status === "pending" ? (
                          <div className="grid gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, "preparing")}
                              className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => removeOrder(order.id)}
                              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
                            >
                              Decline
                            </button>
                          </div>
                        ) : order.status === "preparing" ? (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, "ready")}
                            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                          >
                            Mark as Ready
                          </button>
                        ) : (
                          <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                            <Truck className="h-4 w-4" />
                            Ready for Pickup
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        ) : null}

        {activeTab === "menu-management" ? (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Menu Management</p>
                <h2 className="mt-1 text-2xl font-black">Current Menu Items</h2>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                Add New Item
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {menuItems.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-black text-slate-950">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${menuBadgeStyles[item.category] ?? "bg-slate-100 text-slate-700"}`}>
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-sm text-slate-500">Price</span>
                      <span className="text-xl font-black text-slate-950">{formatTk(item.price)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Add Item</p>
                <h3 className="mt-1 text-2xl font-black">New Menu Entry</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="mt-5 grid gap-4" onSubmit={handleAddMenuItem}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Name
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="e.g. Spicy Beef Burger"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Price (Tk)
                  <input
                    value={form.price}
                    onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="e.g. 450"
                    inputMode="numeric"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                  placeholder="Short description of the dish"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Image URL
                <div className="relative">
                  <ImagePlus className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.imageUrl}
                    onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="https://..."
                  />
                </div>
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}