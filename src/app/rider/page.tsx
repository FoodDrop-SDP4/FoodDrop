"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Bike,
  Power,
  DollarSign,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  PackageCheck,
  Loader2,
  Store,
  Navigation,
  ExternalLink,
  Layers,
  Zap,
  Route,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { User, Order, TodaySummary } from "../../types";
import { triggerFireworks, triggerConfetti } from "../../lib/confetti";
import { playDeliveryCompleteSound, playKitchenBellSound } from "../../lib/sound";

// Dynamically import Rider Navigation Map
const RiderNavigationMap = dynamic(
  () => import("../../components/rider/RiderNavigationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-3xl bg-slate-100 text-xs font-bold text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        Initializing Rider GPS Route...
      </div>
    ),
  }
);

export default function RiderDashboardPage() {
  const router = useRouter();
  const [rider, setRider] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [todaySummary, setTodaySummary] = useState<TodaySummary>({ count: 0, earnings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [showItinerary, setShowItinerary] = useState(true);

  // Fetch Rider active orders & stats
  const fetchRiderData = async (riderId: string) => {
    if (!riderId) return;
    try {
      const res = await fetch(`/api/orders/rider?riderId=${riderId}`);
      if (res.ok) {
        const data = await res.json();
        const orders: Order[] = data.activeOrders || (data.activeOrder ? [data.activeOrder] : []);
        setActiveOrders(orders);

        // Keep selected order valid
        setSelectedOrderId((prev) => {
          if (prev && orders.some((o) => o.id === prev)) {
            return prev;
          }
          return orders[0]?.id || null;
        });

        setTodaySummary(data.todaySummary || { count: 0, earnings: 0 });
      }
    } catch (err) {
      console.error("Error fetching rider data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time polling for available orders
  const fetchAvailableOrders = async () => {
    if (!isOnline) return;
    try {
      const res = await fetch("/api/rider/available-orders");
      if (res.ok) {
        const data = await res.json();
        setAvailableOrders(data);
      }
    } catch (err) {
      console.error("Error polling available orders:", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/rider/register");
      return;
    }

    const user: User = JSON.parse(storedUser);
    if (user.role !== "RIDER") {
      router.push("/");
      return;
    }

    setRider(user);
    setIsOnline(user.isOnline ?? true);
    fetchRiderData(user.id);

    // Sync full profile from server session to keep all fields fresh
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setRider(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    fetchAvailableOrders();
    const interval = setInterval(() => {
      fetchAvailableOrders();
      if (rider?.id) fetchRiderData(rider.id);
    }, 4000);

    return () => clearInterval(interval);
  }, [isOnline, rider?.id]);

  // Toggle Online/Offline
  const toggleOnlineStatus = async () => {
    if (!rider?.id) return;
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);

    try {
      await fetch("/api/rider/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId: rider.id, isOnline: nextStatus }),
      });

      const updatedUser = { ...rider, isOnline: nextStatus };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setRider(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  // Accept Order (Single or Stacked)
  const handleAcceptOrder = async (orderId: string) => {
    if (!rider?.id) return;
    setAcceptingId(orderId);

    try {
      const res = await fetch("/api/rider/accept-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          riderId: rider.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        playKitchenBellSound();
        triggerConfetti();
        setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
        setSelectedOrderId(orderId);
        fetchRiderData(rider.id);
      } else {
        alert("⚠️ " + data.message);
        setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (err) {
      console.error("Accept error:", err);
      alert("Something went wrong! Please try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  // Update Status (Picked Up / Delivered)
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    if (!rider?.id) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/orders/rider", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (status === "DELIVERED") {
          playDeliveryCompleteSound();
          triggerFireworks();
        } else {
          playKitchenBellSound();
        }
        await fetchRiderData(rider.id);
      } else {
        alert("⚠️ " + (data.message || "Action failed. Try again."));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Current active order being focused
  const activeOrder = activeOrders.find((o) => o.id === selectedOrderId) || activeOrders[0] || null;
  const isStackedTrip = activeOrders.length > 1;
  const totalStackedPayout = activeOrders.reduce((sum, o) => sum + (o.deliveryFee || 60), 0);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">

        {/* 1. Header & Online/Offline Toggle */}
        <div className="flex items-center justify-between">
          <Link
            href="/rider/profile"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
          >
            <DollarSign className="h-4 w-4 text-orange-600" />
            <span>Earnings & Profile</span>
          </Link>

          <button
            onClick={toggleOnlineStatus}
            className={`flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black transition shadow-sm ${
              isOnline
                ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700 cursor-pointer"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
            }`}
          >
            <Power className="h-4 w-4" />
            <span>{isOnline ? "You are Online" : "Go Online"}</span>
          </button>
        </div>

        {/* Rider Hero Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-md shadow-orange-100">
              <Bike className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{rider?.name}</h1>
              <p className="text-xs font-semibold text-slate-500">
                {rider?.vehicleType === "Motorcycle"
                  ? `🏍️ Motorcycle • ${rider?.vehicleNumber || "Verified Registration"}`
                  : rider?.vehicleType === "Bicycle"
                  ? "🚲 Bicycle Courier • Eco Partner"
                  : rider?.vehicleType === "Walking"
                  ? "🚶 Walker Courier • Local Partner"
                  : `${rider?.vehicleType || "Delivery Partner"}`}{" "}
                {rider?.phone && `• ${rider.phone}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>GPS Active</span>
          </div>
        </div>

        {/* 2. Today's Summary Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Completed Trips</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{todaySummary.count}</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Today's Earnings</p>
              <h3 className="text-2xl font-black text-orange-600 mt-1">৳{todaySummary.earnings}</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">💵 Cash in Hand</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">৳{todaySummary.cashInHand || 0}</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Active Stack</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">
                {activeOrders.length} {activeOrders.length === 1 ? "Order" : "Orders"}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 3. Stacked Orders Multi-Stop Delivery Cockpit */}
        {activeOrders.length > 0 && activeOrder && (
          <div className="rounded-3xl border-2 border-orange-500 bg-white p-6 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Stacked Banner & Total Payout */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                {isStackedTrip ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1 text-xs font-black text-white shadow-sm">
                      <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                      STACKED TRIP ({activeOrders.length} ORDERS BATCHED)
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3.5 py-1 text-xs font-bold text-orange-700">
                    📦 Single Delivery In Progress
                  </span>
                )}
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Currently Viewing: <b className="text-slate-900">Order #{activeOrder.id.slice(0, 8)}</b> ({activeOrder.status})
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 px-4 py-2 border border-emerald-200 text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                  {isStackedTrip ? "Combined Stack Payout" : "Trip Payout"}
                </span>
                <span className="text-xl font-black text-emerald-700">৳{totalStackedPayout}</span>
              </div>
            </div>

            {/* Interactive Stacked Order Switcher Tabs */}
            {isStackedTrip && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-purple-600" />
                  Select Stacked Task to View & Manage:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {activeOrders.map((order, idx) => {
                    const isSelected = order.id === activeOrder.id;
                    const isPickedUp = order.status === "ON_THE_WAY";
                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`text-left p-3.5 rounded-2xl border transition relative cursor-pointer ${
                          isSelected
                            ? "bg-purple-50/80 border-purple-500 ring-2 ring-purple-400 shadow-sm"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-black text-purple-700 uppercase tracking-wide">
                            Stop #{idx + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPickedUp
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {isPickedUp ? "On The Way 🛵" : "To Pick Up 🏬"}
                          </span>
                        </div>
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {order.restaurant?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          ➔ {order.deliveryAddress}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Multi-Stop Itinerary Roadmap */}
            {isStackedTrip && (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowItinerary(!showItinerary)}
                >
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Multi-Stop Trip Sequence ({activeOrders.length * 2} Steps)
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    {showItinerary ? "Hide Itinerary ▲" : "Show Itinerary ▼"}
                  </span>
                </div>

                {showItinerary && (
                  <div className="pt-2 space-y-2 text-xs">
                    {/* Pickups */}
                    {activeOrders.map((order, idx) => (
                      <div key={`pickup-${order.id}`} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-[11px] shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 truncate">
                          <span className="font-bold text-slate-900">Pickup:</span>{" "}
                          <span className="text-slate-700 font-medium">{order.restaurant?.name}</span>{" "}
                          <span className="text-slate-400 text-[11px]">({order.restaurant?.address})</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            order.status === "ON_THE_WAY"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {order.status === "ON_THE_WAY" ? "Collected ✓" : "Pending Pickup"}
                        </span>
                      </div>
                    ))}

                    {/* Deliveries */}
                    {activeOrders.map((order, idx) => (
                      <div key={`drop-${order.id}`} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0">
                          {activeOrders.length + idx + 1}
                        </div>
                        <div className="flex-1 truncate">
                          <span className="font-bold text-slate-900">Deliver:</span>{" "}
                          <span className="text-slate-700 font-medium">{order.customer?.name || "Customer"}</span>{" "}
                          <span className="text-slate-400 text-[11px]">({order.deliveryAddress})</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 shrink-0">
                          Drop-off
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 🗺️ Interactive Rider Turn-by-Turn GPS Map for Current Focused Order */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-blue-600" />
                Live Navigation for Order #{activeOrder.id.slice(0, 8)}
              </h3>
              <RiderNavigationMap
                key={activeOrder.id}
                restaurantName={activeOrder.restaurant?.name || "Restaurant"}
                restaurantAddress={activeOrder.restaurant?.address || "Dhaka, Bangladesh"}
                customerName={activeOrder.customer?.name || "Customer"}
                customerAddress={activeOrder.deliveryAddress}
                orderStatus={activeOrder.status}
              />
            </div>

            {/* Pickup & Drop-off Info Cards */}
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-2xl bg-orange-50/60 p-4 border border-orange-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase">
                    <Store className="h-4 w-4" /> Pickup Restaurant
                  </div>
                  <span className="text-[10px] font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                    Step 1
                  </span>
                </div>
                <h4 className="font-black text-slate-900">{activeOrder.restaurant?.name}</h4>
                <p className="text-xs text-slate-600">{activeOrder.restaurant?.address}</p>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href={`tel:${activeOrder.restaurant?.phone || "01700000000"}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline"
                  >
                    <Phone className="h-3 w-3" /> Call Restaurant
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      activeOrder.restaurant?.address || "Dhaka"
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> Directions
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
                    <MapPin className="h-4 w-4" /> Drop-off Customer
                  </div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Step 2
                  </span>
                </div>
                <h4 className="font-black text-slate-900">{activeOrder.customer?.name || "Customer"}</h4>
                <p className="text-xs text-slate-600">{activeOrder.deliveryAddress}</p>
                <div className="flex items-center gap-3 pt-1">
                  {(activeOrder.contactPhone || activeOrder.customer?.phone) && (
                    <a
                      href={`tel:${activeOrder.contactPhone || activeOrder.customer?.phone}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                    >
                      <Phone className="h-3 w-3" /> Call ({activeOrder.contactPhone || activeOrder.customer?.phone})
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      activeOrder.deliveryAddress
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> Directions
                  </a>
                </div>
              </div>
            </div>

            {/* Food Items Preview */}
            {activeOrder.orderItems && activeOrder.orderItems.length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-orange-600" /> Items to Collect ({activeOrder.orderItems.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeOrder.orderItems.map((item, i) => (
                    <span
                      key={item.id || i}
                      className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs"
                    >
                      <span className="text-orange-600 font-black">{item.quantity}x</span>
                      <span>{item.menuItem?.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Step Action Button for Selected Order */}
            <div className="pt-2">
              {activeOrder.status === "ACCEPTED_BY_RIDER" || activeOrder.status === "PREPARING" ? (
                <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <Clock className="h-4 w-4 animate-spin text-amber-600" />
                      <span>Kitchen is Cooking the Meal...</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                      Cooking in progress 🍳
                    </span>
                  </div>
                  <p className="text-xs text-amber-700">
                    You can head to the restaurant now. The <b>"Pick Up Food"</b> button will unlock automatically once the restaurant marks the order as <b>Ready for Pickup</b>.
                  </p>
                  <button
                    type="button"
                    disabled
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-200 py-3.5 text-xs font-black uppercase tracking-wider text-slate-500 cursor-not-allowed opacity-80"
                  >
                    <PackageCheck className="h-4 w-4" />
                    <span>Waiting for Kitchen to Finish Cooking ⏳</span>
                  </button>
                </div>
              ) : activeOrder.status === "READY_FOR_PICKUP" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 w-fit">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Food is Packed & Ready for Pickup! 🎉</span>
                  </div>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateOrderStatus(activeOrder.id, "ON_THE_WAY")}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl transition hover:bg-orange-600 active:scale-98 disabled:opacity-50 cursor-pointer animate-pulse hover:animate-none"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <PackageCheck className="h-5 w-5" />
                    )}
                    <span>
                      Collect Food from Kitchen & Start Delivery 📦
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateOrderStatus(activeOrder.id, "DELIVERED")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  <span>
                    At Doorstep • Mark Order #{activeOrder.id.slice(0, 6)} as Delivered ✅
                  </span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* 4. Available Delivery Requests & Stack Opportunities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {activeOrders.length > 0 ? (
                <>
                  <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <span>Stack More Orders • Batch Opportunities ({3 - activeOrders.length} slots left)</span>
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Available Delivery Requests</span>
                </>
              )}
            </h2>

            {activeOrders.length > 0 && (
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                ⚡ Max 3 per trip
              </span>
            )}
          </div>

          {!isOnline ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
              <Power className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700">You are currently Offline</p>
              <p className="text-xs text-slate-400 mt-1">Switch to 'You are Online' to receive new requests.</p>
            </div>
          ) : activeOrders.length >= 3 ? (
            <div className="rounded-3xl border border-purple-200 bg-purple-50/50 p-6 text-center text-purple-900 space-y-1">
              <Sparkles className="h-8 w-8 mx-auto text-purple-600" />
              <p className="font-black text-sm">Full Stack Active (3/3 Orders Batched!)</p>
              <p className="text-xs text-purple-700">
                Complete one of your active deliveries to unlock new batch opportunities.
              </p>
            </div>
          ) : availableOrders.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
              <Bike className="h-10 w-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="font-bold text-slate-700">Searching for nearby kitchen orders...</p>
              <p className="text-xs text-slate-400 mt-1">Orders accepted by restaurants will appear here instantly.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {availableOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 relative hover:border-orange-300 transition"
                >
                  {activeOrders.length > 0 && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black text-purple-700">
                      <Zap className="h-3 w-3 fill-purple-600" />
                      BATCH OPPORTUNITY • SAME ZONE
                    </div>
                  )}

                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="font-black text-slate-900 text-sm truncate">{order.restaurant?.name}</span>
                    <span className="font-black text-emerald-600 text-sm shrink-0">
                      +৳{order.deliveryFee || 60} Payout
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <Store className="h-3.5 w-3.5 text-orange-600 shrink-0 mt-0.5" />
                      <span className="truncate">{order.restaurant?.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="truncate">{order.deliveryAddress}</span>
                    </div>
                  </div>

                  <button
                    disabled={acceptingId === order.id}
                    onClick={() => handleAcceptOrder(order.id)}
                    className={`w-full rounded-2xl py-3 text-xs font-bold text-white shadow transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeOrders.length > 0
                        ? "bg-purple-600 hover:bg-purple-700 shadow-purple-200"
                        : "bg-orange-600 hover:bg-orange-700 shadow-orange-200"
                    }`}
                  >
                    {acceptingId === order.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Accepting into Stack...</span>
                      </>
                    ) : activeOrders.length > 0 ? (
                      <>
                        <Zap className="h-3.5 w-3.5 fill-white" />
                        <span>Add to Stack (+৳{order.deliveryFee || 60}) ⚡</span>
                      </>
                    ) : (
                      <span>Accept Delivery 🚀</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}