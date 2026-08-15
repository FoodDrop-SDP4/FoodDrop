"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Plus,
  Utensils,
  DollarSign,
  AlignLeft,
  Image as ImageIcon,
  Loader2,
  RefreshCcw,
  ShoppingBag,
  TrendingUp,
  Clock,
  ChefHat,
  User as UserIcon,
  Store,
  Tag,
  Trash2,
  XCircle,
  Edit,
  Settings,
  ToggleLeft,
  ToggleRight,
  X,
  Flame,
  CheckCircle2,
  AlertCircle,
  Phone,
  Bike,
  Sparkles,
  Percent,
} from "lucide-react";
import { MenuItem, Order, Restaurant, RestaurantStats, CATEGORIES } from "../../types";

type RestaurantData = Restaurant & {
  orders: Order[];
  menuItems: MenuItem[];
};

type WorkspaceTab = "orders" | "menu" | "add-dish" | "analytics";
type OrderFilter = "ALL" | "PENDING" | "PREPARING" | "READY_FOR_PICKUP" | "DELIVERED" | "CANCELLED";

export default function ProfessionalRestaurantDashboard() {
  const [ownerName, setOwnerName] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [stats, setStats] = useState<RestaurantStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrdersCount: 0,
  });

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("orders");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("ALL");
  const [menuSearchQuery, setMenuSearchQuery] = useState("");

  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deletingFoodId, setDeletingFoodId] = useState<string | null>(null);

  // Add Food Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Fast Food & Burger");

  // Modal States
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editResName, setEditResName] = useState("");
  const [editResAddress, setEditResAddress] = useState("");

  const fetchDashboardData = async (targetId?: string) => {
    const activeId = targetId || ownerId;
    if (!activeId) return setIsFetching(false);

    setIsFetching(true);
    try {
      const res = await fetch(`/api/restaurants/dashboard?ownerId=${activeId}`);
      if (res.ok) {
        const result = await res.json();
        setOwnerName(result.ownerName || "Owner");
        setRestaurant(result.restaurant);
        setStats(result.stats);
        if (result.restaurant) {
          setEditResName(result.restaurant.name);
          setEditResAddress(result.restaurant.address);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id) {
          setOwnerId(parsedUser.id);
          setOwnerName(parsedUser.name || "Owner");
          fetchDashboardData(parsedUser.id);
        } else {
          setIsFetching(false);
        }
      } catch (err) {
        setIsFetching(false);
      }
    } else {
      setIsFetching(false);
    }
  }, []);

  // 🚀 Add Food Item with Discount Support
  const handleAddFood = async (e: FormEvent) => {
    e.preventDefault();
    if (!ownerId) return alert("Owner info missing.");
    setIsLoading(true);

    try {
      const res = await fetch("/api/restaurants/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price,
          originalPrice: originalPrice.trim() ? originalPrice : null,
          category,
          imageUrl,
          ownerId,
        }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        setPrice("");
        setOriginalPrice("");
        setImageUrl("");
        setCategory("Fast Food & Burger");
        await fetchDashboardData(ownerId);
        setActiveTab("menu"); // Switch to Menu Catalog to view new food
      } else {
        alert("Failed to add food item");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Stock Toggle
  const handleToggleStock = async (item: MenuItem) => {
    try {
      const res = await fetch("/api/restaurants/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isAvailable: !(item.isAvailable ?? true) }),
      });
      if (res.ok) fetchDashboardData(ownerId || undefined);
    } catch (err) {
      console.error(err);
    }
  };

  // 🚀 Save Edited Menu Item with Discount
  const handleSaveEditItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/restaurants/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          originalPrice: editingItem.originalPrice,
          category: editingItem.category,
          imageUrl: editingItem.imageUrl,
          isAvailable: editingItem.isAvailable,
        }),
      });

      if (res.ok) {
        setEditingItem(null);
        fetchDashboardData(ownerId || undefined);
      } else {
        alert("Failed to update item.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Save Profile
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/restaurants/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          name: editResName,
          address: editResAddress,
        }),
      });

      if (res.ok) {
        setIsProfileModalOpen(false);
        fetchDashboardData(ownerId || undefined);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    setDeletingFoodId(foodId);

    try {
      const res = await fetch(`/api/restaurants/menu?id=${foodId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDashboardData(ownerId || undefined);
      } else {
        alert("Failed to delete food item.");
      }
    } finally {
      setDeletingFoodId(null);
    }
  };

  // 🚀 Update Order Status (Accept, Ready, Decline)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const targetOrder = restaurant?.orders.find((o) => o.id === orderId);

    if (newStatus === "CANCELLED") {
      const isOnline = targetOrder?.paymentMethod && targetOrder.paymentMethod !== "COD";
      const confirmText = isOnline
        ? `⚠️ Customer paid ৳${targetOrder?.totalAmount} online via ${targetOrder?.paymentMethod}.\nDeclining will automatically initiate an instant refund.\n\nAre you sure you want to decline this order?`
        : "Are you sure you want to decline this Cash on Delivery order?";

      if (!confirm(confirmText)) return;
    }

    setActionLoadingId(orderId);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchDashboardData(ownerId || undefined);
      } else {
        alert("Failed to update order status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Orders
  const orders = restaurant?.orders || [];
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const readyOrders = orders.filter((o) => o.status === "READY_FOR_PICKUP");
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");

  const filteredOrders =
    orderFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === orderFilter);

  // Filtered Menu Items
  const menuItems = restaurant?.menuItems || [];
  const filteredMenuItems = menuItems.filter((item) => {
    if (!menuSearchQuery.trim()) return true;
    const q = menuSearchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  // Calculate Form Discount Preview
  const numPrice = parseFloat(price) || 0;
  const numOrig = parseFloat(originalPrice) || 0;
  const formDiscountPercent =
    numOrig > numPrice && numPrice > 0
      ? Math.round(((numOrig - numPrice) / numOrig) * 100)
      : 0;

  if (isFetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 font-sans pb-20">
      
      {/* 🚀 Top Command Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900">
                  {restaurant?.name || "Kitchen Hub"}
                </h1>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  title="Settings & Profile"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {restaurant?.address || "Dhaka, Bangladesh"} • Managed by {ownerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 border border-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700">Kitchen Live</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6">
        
        {/* 🚀 Metric Stat Counters */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          
          {/* Revenue */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Revenue
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              ৳{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">From delivered customer orders</p>
          </div>

          {/* Pending Orders */}
          <div
            onClick={() => {
              setActiveTab("orders");
              setOrderFilter("PENDING");
            }}
            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm cursor-pointer hover:border-amber-400 transition"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Pending Requests
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600">{pendingOrders.length}</div>
            <p className="text-[11px] text-amber-600/80 mt-1 font-bold">Needs kitchen acceptance</p>
          </div>

          {/* Cooking in Kitchen */}
          <div
            onClick={() => {
              setActiveTab("orders");
              setOrderFilter("PREPARING");
            }}
            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm cursor-pointer hover:border-orange-400 transition"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                In Cooking
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <ChefHat className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-orange-600">{preparingOrders.length}</div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Active cooking & packaging</p>
          </div>

          {/* Menu Items Count */}
          <div
            onClick={() => setActiveTab("menu")}
            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm cursor-pointer hover:border-blue-400 transition"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Menu Dishes
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Utensils className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{menuItems.length} Items</div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              {menuItems.filter((m) => m.originalPrice && m.originalPrice > m.price).length} with active discount
            </p>
          </div>

        </div>

        {/* 🚀 Workspace Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            
            {/* Tab 1: Live Kitchen Feed */}
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
                activeTab === "orders"
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <ChefHat className="h-4 w-4" />
              <span>Live Kitchen Feed</span>
              {pendingOrders.length > 0 && (
                <span className="rounded-full bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[10px] font-black">
                  {pendingOrders.length}
                </span>
              )}
            </button>

            {/* Tab 2: Menu Catalog */}
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
                activeTab === "menu"
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Utensils className="h-4 w-4" />
              <span>Menu Catalog & Stock</span>
              <span className="text-[10px] opacity-80">({menuItems.length})</span>
            </button>

            {/* Tab 3: Add New Dish */}
            <button
              onClick={() => setActiveTab("add-dish")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
                activeTab === "add-dish"
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Add New Dish / Offer</span>
            </button>

            {/* Tab 4: Analytics */}
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
                activeTab === "analytics"
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Sales Insights</span>
            </button>

          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 pr-3">
            <span>Logged in as: <strong className="text-slate-900">{ownerName}</strong></span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            TAB 1: LIVE KITCHEN FEED (ORDERS)
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500 mr-2">Filter Orders:</span>
              {[
                { key: "ALL", label: "All Orders", count: orders.length },
                { key: "PENDING", label: "Pending (New)", count: pendingOrders.length, badgeColor: "bg-amber-100 text-amber-800" },
                { key: "PREPARING", label: "Cooking", count: preparingOrders.length, badgeColor: "bg-orange-100 text-orange-800" },
                { key: "READY_FOR_PICKUP", label: "Ready for Pickup", count: readyOrders.length, badgeColor: "bg-blue-100 text-blue-800" },
                { key: "DELIVERED", label: "Completed", count: deliveredOrders.length, badgeColor: "bg-emerald-100 text-emerald-800" },
                { key: "CANCELLED", label: "Declined / Cancelled", count: cancelledOrders.length, badgeColor: "bg-rose-100 text-rose-800" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setOrderFilter(filter.key as OrderFilter)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    orderFilter === filter.key
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                      orderFilter === filter.key ? "bg-white/20 text-white" : filter.badgeColor || "bg-white text-slate-700"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center text-slate-400">
                <ChefHat className="h-12 w-12 mx-auto mb-3 text-slate-300 stroke-1" />
                <p className="text-base font-bold text-slate-700">No orders found under "{orderFilter}" filter.</p>
                <p className="text-xs text-slate-400 mt-1">Incoming live orders will automatically appear here.</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredOrders.map((order) => {
                  const isPending = order.status === "PENDING";
                  const isPreparing = order.status === "PREPARING";
                  const isReady = order.status === "READY_FOR_PICKUP";
                  const isDelivered = order.status === "DELIVERED";
                  const isCancelled = order.status === "CANCELLED";
                  const isOnlinePayment = order.paymentMethod && order.paymentMethod !== "COD";

                  return (
                    <div
                      key={order.id}
                      className={`flex flex-col justify-between rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                        isPending
                          ? "border-amber-300 ring-2 ring-amber-200/50"
                          : isPreparing
                          ? "border-orange-200"
                          : isReady
                          ? "border-blue-200"
                          : "border-slate-200"
                      }`}
                    >
                      <div>
                        {/* Order Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-slate-900">
                                #{order.id.slice(0, 8)}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                  isPending
                                    ? "bg-amber-100 text-amber-800"
                                    : isPreparing
                                    ? "bg-orange-100 text-orange-800"
                                    : isReady
                                    ? "bg-blue-100 text-blue-800"
                                    : isDelivered
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {order.status.replace("_", " ")}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900">৳{order.totalAmount}</span>
                            <span className="block text-[10px] font-bold text-slate-500">
                              {order.paymentMethod ? `${order.paymentMethod} Paid` : "Cash on Delivery"}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info & Phone */}
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-bold text-slate-900">{order.customer?.name || "Customer"}</span>
                          </div>
                          {(order.customer?.phone || (order as any).contactPhone) && (
                            <a
                              href={`tel:${order.customer?.phone || (order as any).contactPhone}`}
                              className="flex items-center gap-1 font-bold text-orange-600 hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              <span>{order.customer?.phone || (order as any).contactPhone}</span>
                            </a>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="mt-3 space-y-1.5">
                          {order.orderItems?.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs font-medium text-slate-700">
                              <span>
                                {item.quantity}x {item.menuItem?.name || "Dish"}
                              </span>
                              <span className="font-mono text-slate-900">
                                ৳{(item.menuItem?.price || 0) * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Address */}
                        <p className="mt-3 text-[11px] text-slate-500 font-medium line-clamp-1">
                          📍 {order.deliveryAddress}
                        </p>

                        {/* Assigned Rider Info */}
                        {order.rider && (
                          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 p-2 rounded-xl border border-blue-100">
                            <Bike className="h-4 w-4 shrink-0" />
                            <span>Assigned Rider: {order.rider.name} ({order.rider.phone || "Active"})</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                              disabled={actionLoadingId === order.id}
                              className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                              disabled={actionLoadingId === order.id}
                              className="flex-2 rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-600/30 transition hover:bg-orange-700 disabled:opacity-50"
                            >
                              {actionLoadingId === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              ) : (
                                "Accept & Start Cooking 🍳"
                              )}
                            </button>
                          </>
                        )}

                        {isPreparing && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "READY_FOR_PICKUP")}
                            disabled={actionLoadingId === order.id}
                            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
                          >
                            {actionLoadingId === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                              "Mark Food Ready for Rider 📦"
                            )}
                          </button>
                        )}

                        {isReady && (
                          <div className="w-full text-center py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl">
                            Waiting for Rider to Pick Up
                          </div>
                        )}

                        {isDelivered && (
                          <div className="w-full text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl">
                            ✓ Successfully Delivered
                          </div>
                        )}

                        {isCancelled && (
                          <div className="w-full text-center py-2 text-xs font-bold text-rose-700 bg-rose-50 rounded-xl">
                            {isOnlinePayment ? "Cancelled • Auto-Refund Initiated" : "Cancelled • COD"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2: MENU CATALOG & STOCK MANAGER
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "menu" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Search & Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search dishes in menu..."
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-4 text-xs font-medium outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <button
                onClick={() => setActiveTab("add-dish")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-orange-600/30 transition hover:bg-orange-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Food</span>
              </button>
            </div>

            {/* Dishes Grid */}
            {filteredMenuItems.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center text-slate-400">
                <Utensils className="h-12 w-12 mx-auto mb-3 text-slate-300 stroke-1" />
                <p className="text-base font-bold text-slate-700">No dishes match your search.</p>
                <button
                  onClick={() => setActiveTab("add-dish")}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-orange-600 hover:underline"
                >
                  <Plus className="h-4 w-4" /> Add your first dish
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMenuItems.map((item) => {
                  const isAvailable = item.isAvailable ?? true;
                  const hasDiscount = Boolean(item.originalPrice && item.originalPrice > item.price);
                  const discountPct = hasDiscount
                    ? Math.round((((item.originalPrice || 0) - item.price) / (item.originalPrice || 1)) * 100)
                    : 0;

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col justify-between rounded-3xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                        !isAvailable ? "opacity-60 bg-slate-50 border-slate-200" : "border-slate-200/80"
                      }`}
                    >
                      <div>
                        {/* Image & Badges */}
                        <div className="relative h-44 overflow-hidden rounded-2xl mb-4 bg-slate-100">
                          <img
                            src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />

                          {/* Discount Badge */}
                          {hasDiscount && (
                            <div className="absolute left-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-black text-white shadow-md shadow-rose-600/30">
                              🔥 {discountPct}% OFF
                            </div>
                          )}

                          {/* Category */}
                          {item.category && (
                            <div className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                              {item.category}
                            </div>
                          )}

                          {/* Stock Status Banner if Out of stock */}
                          {!isAvailable && (
                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                              <span className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white shadow-md">
                                OUT OF STOCK
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title & Price */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                          <div className="text-right">
                            {hasDiscount && (
                              <span className="block text-[11px] line-through text-slate-400">
                                ৳{item.originalPrice}
                              </span>
                            )}
                            <span className={`text-base font-black ${hasDiscount ? "text-rose-600" : "text-slate-900"}`}>
                              ৳{item.price}
                            </span>
                          </div>
                        </div>

                        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description || "No description provided."}
                        </p>
                      </div>

                      {/* Stock Switch & Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                        
                        {/* Stock Availability Toggle */}
                        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-xs font-bold text-slate-700">
                            Availability Status:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleStock(item)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                              isAvailable
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                            }`}
                          >
                            {isAvailable ? "In Stock ✓" : "Out of Stock ✗"}
                          </button>
                        </div>

                        {/* Edit & Delete Controls */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit Dish</span>
                          </button>
                          <button
                            onClick={() => handleDeleteFood(item.id)}
                            disabled={deletingFoodId === item.id}
                            className="flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                          >
                            {deletingFoodId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 3: ADD NEW DISH & DISCOUNT OFFER CREATOR
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "add-dish" && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Add New Dish to Menu</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Create dishes with optional promotional discount pricing for customers.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddFood} className="space-y-4">
              
              {/* Dish Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Dish / Food Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Smoky BBQ Bacon Burger"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing & Discount Fields */}
              <div className="grid gap-4 sm:grid-cols-2 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Selling Price (৳) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 280"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm font-bold text-slate-900 outline-none focus:border-orange-500"
                  />
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                    Customer will pay this price
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Regular / Original Price (৳) <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 350"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm font-bold text-slate-900 outline-none focus:border-orange-500"
                  />
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                    Crossed out price for discount badge
                  </span>
                </div>

                {/* Live Discount Calculation Tag */}
                {formDiscountPercent > 0 && (
                  <div className="sm:col-span-2 flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-100/80 p-2.5 rounded-xl">
                    <Flame className="h-4 w-4 text-rose-600 animate-pulse" />
                    <span>
                      Customer Badge Preview: <strong>🔥 {formDiscountPercent}% OFF</strong> (Save ৳{numOrig - numPrice})
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Description & Ingredients</label>
                <textarea
                  rows={3}
                  placeholder="Ingredients, preparation, portion size..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Food Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-orange-600 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 active:scale-98 disabled:opacity-70 mt-4"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  "Publish Dish to Restaurant Menu 🚀"
                )}
              </button>

            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 4: SALES ANALYTICS & REVENUE INSIGHTS
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900">Kitchen Sales & Order Insights</h2>
              <p className="text-xs text-slate-500 font-medium">
                Live metrics tracked across customer order lifecycles.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Delivered Orders</span>
                <span className="text-3xl font-black text-emerald-700">{deliveredOrders.length}</span>
                <span className="text-xs text-emerald-600 block mt-1">Successfully fulfilled</span>
              </div>

              <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100">
                <span className="text-xs font-bold text-orange-800 uppercase block mb-1">Active Pipeline</span>
                <span className="text-3xl font-black text-orange-700">
                  {pendingOrders.length + preparingOrders.length + readyOrders.length}
                </span>
                <span className="text-xs text-orange-600 block mt-1">Orders in progress</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase block mb-1">Average Order Value</span>
                <span className="text-3xl font-black text-slate-900">
                  ৳
                  {deliveredOrders.length > 0
                    ? Math.round(stats.totalRevenue / deliveredOrders.length)
                    : 0}
                </span>
                <span className="text-xs text-slate-500 block mt-1">Per delivered basket</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 🚀 Edit Menu Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setEditingItem(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Edit Dish & Offers</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dish Name</label>
                <input
                  required
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Selling Price (৳)</label>
                  <input
                    required
                    type="number"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    value={editingItem.originalPrice || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        originalPrice: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="Crossed price"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-1/3 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 rounded-xl bg-orange-600 py-3 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsProfileModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Restaurant Settings</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Restaurant Name</label>
                <input
                  required
                  type="text"
                  value={editResName}
                  onChange={(e) => setEditResName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Address / Area</label>
                <input
                  required
                  type="text"
                  value={editResAddress}
                  onChange={(e) => setEditResAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-1/3 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 rounded-xl bg-orange-600 py-3 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}