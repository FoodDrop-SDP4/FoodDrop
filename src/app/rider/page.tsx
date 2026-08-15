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
} from "lucide-react";
import Link from "next/link";
import { User, Order, TodaySummary } from "../../types";
import { triggerFireworks } from "../../lib/confetti";

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
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [todaySummary, setTodaySummary] = useState<TodaySummary>({ count: 0, earnings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Fetch Rider active order & stats
  const fetchRiderData = async (riderId: string) => {
    if (!riderId) return;
    try {
      const res = await fetch(`/api/orders/rider?riderId=${riderId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveOrder(data.activeOrder);
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

  // Accept Order
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
        setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
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

      if (res.ok) {
        if (status === "DELIVERED") {
          triggerFireworks();
        }
        fetchRiderData(rider.id);
      } else {
        alert("Action failed. Try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

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
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            📊 Earnings & Profile History
          </Link>

          <button
            onClick={toggleOnlineStatus}
            className={`flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black transition shadow-sm ${
              isOnline
                ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
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
                {rider?.vehicleType || "Motorcycle"} • {rider?.vehicleNumber || "Registration Verified"} • {rider?.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>GPS Active</span>
          </div>
        </div>

        {/* 2. Today's Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Today's Completed Trips</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{todaySummary.count}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Today's Earnings</p>
              <h3 className="text-3xl font-black text-orange-600 mt-1">৳{todaySummary.earnings}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* 3. Active Order Delivery Cockpit & Turn-by-Turn Map */}
        {activeOrder && (
          <div className="rounded-3xl border-2 border-orange-500 bg-white p-6 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3.5 py-1 text-xs font-bold text-orange-700">
                  📦 Ongoing Delivery #{activeOrder.id.slice(0, 8)}
                </span>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Current Status: <b className="text-slate-900">{activeOrder.status}</b>
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 px-4 py-2 border border-emerald-200 text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Payout</span>
                <span className="text-lg font-black text-emerald-700">৳{activeOrder.deliveryFee || 60}</span>
              </div>
            </div>

            {/* 🗺️ Interactive Rider Turn-by-Turn GPS Map */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-blue-600" />
                Live Rider GPS Routing
              </h3>
              <RiderNavigationMap
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
                <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase">
                  <Store className="h-4 w-4" /> Pickup Restaurant
                </div>
                <h4 className="font-black text-slate-900">{activeOrder.restaurant?.name}</h4>
                <p className="text-xs text-slate-600">{activeOrder.restaurant?.address}</p>
                <a
                  href={`tel:${activeOrder.restaurant?.phone || "01700000000"}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline pt-1"
                >
                  <Phone className="h-3 w-3" /> Call Restaurant
                </a>
              </div>

              <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
                  <MapPin className="h-4 w-4" /> Drop-off Customer
                </div>
                <h4 className="font-black text-slate-900">{activeOrder.customer?.name || "Customer"}</h4>
                <p className="text-xs text-slate-600">{activeOrder.deliveryAddress}</p>
                {activeOrder.customer?.phone && (
                  <a
                    href={`tel:${activeOrder.customer.phone}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline pt-1"
                  >
                    <Phone className="h-3 w-3" /> Call Customer ({activeOrder.customer.phone})
                  </a>
                )}
              </div>
            </div>

            {/* Step Action Button */}
            <div className="pt-2">
              {activeOrder.status === "ACCEPTED_BY_RIDER" ||
              activeOrder.status === "PREPARING" ||
              activeOrder.status === "READY_FOR_PICKUP" ? (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateOrderStatus(activeOrder.id, "ON_THE_WAY")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl transition hover:bg-orange-600 active:scale-98 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <PackageCheck className="h-5 w-5" />
                  )}
                  <span>At Restaurant • Pick Up Food & Go Out for Delivery 📦</span>
                </button>
              ) : (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateOrderStatus(activeOrder.id, "DELIVERED")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  <span>At Customer Doorstep • Mark as Delivered ✅</span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* 4. New Available Order Requests */}
        {!activeOrder && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Available Delivery Requests</span>
            </h2>

            {!isOnline ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
                <Power className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-700">You are currently Offline</p>
                <p className="text-xs text-slate-400 mt-1">Switch to 'You are Online' to receive new requests.</p>
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
                  <div key={order.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="font-black text-slate-900 text-sm">{order.restaurant?.name}</span>
                      <span className="font-black text-emerald-600 text-sm">৳{order.deliveryFee || 60} Payout</span>
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
                      className="w-full rounded-2xl bg-orange-600 py-3 text-xs font-bold text-white shadow transition hover:bg-orange-700 active:scale-95 disabled:opacity-50"
                    >
                      {acceptingId === order.id ? "Accepting..." : "Accept Delivery 🚀"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}