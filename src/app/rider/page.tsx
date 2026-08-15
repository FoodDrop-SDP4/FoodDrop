"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, Power, DollarSign, CheckCircle2, Clock, MapPin, Phone, PackageCheck, Loader2, Store } from "lucide-react";
import Link from "next/link";
import { User, Order, TodaySummary } from "../../types";

export default function RiderDashboardPage() {
  const router = useRouter();
  const [rider, setRider] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [todaySummary, setTodaySummary] = useState<TodaySummary>({ count: 0, earnings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // 🚀 Step 3: নির্দিষ্ট অর্ডারের লোডিং স্টেট ট্র্যাক করার জন্য
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // 🚀 রাইডারের অ্যাক্টিভ অর্ডার এবং আজকের সামারি ফেচ করা
  const fetchRiderData = async (riderId: string) => {
    if (!riderId) return;
    try {
      const res = await fetch(`/api/orders/rider?riderId=${riderId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveOrder(data.activeOrder);
        setTodaySummary(data.todaySummary || { count: 0, earnings: 0 });
        // availableOrders এখান থেকে সরিয়ে নিচে আলাদা ৩ সেকেন্ডের পলিং-এ নিয়ে যাওয়া হয়েছে
      }
    } catch (err) {
      console.error("Error fetching rider data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Step 3: রিয়েল-টাইমে অ্যাভেইলেবল অর্ডার খোঁজার জন্য (Polling)
  const fetchAvailableOrders = async () => {
    try {
      const res = await fetch("/api/rider/available-orders");
      if (res.ok) {
        const data = await res.json();
        setAvailableOrders(data);
      }
    } catch (err) {
      console.error("Error fetching available orders:", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/rider/register");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "RIDER") {
        router.push("/");
        return;
      }

      setRider(user);
      setIsOnline(user.isOnline ?? true);
      
      // Initial Fetch
      fetchRiderData(user.id);
      fetchAvailableOrders();

      // 🚀 Step 3: ৩ সেকেন্ড পর পর অ্যাভেইলেবল অর্ডার আপডেট করবে (অটো সিঙ্ক)
      const availableInterval = setInterval(() => fetchAvailableOrders(), 3000);
      
      // ১০ সেকেন্ড পর পর রাইডারের অ্যাক্টিভ অর্ডার ও সামারি আপডেট করবে
      const mainInterval = setInterval(() => fetchRiderData(user.id), 10000);
      
      return () => {
        clearInterval(availableInterval);
        clearInterval(mainInterval);
      };
    } catch (e) {
      console.error(e);
      router.push("/login");
    }
  }, [router]);

  const toggleOnlineStatus = async () => {
    if (!rider) return;
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

  // 🚀 Step 3: অর্ডার এক্সেপ্ট করার জন্য Atomic Update API-তে কল
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
        alert("🎉 " + data.message);
        // লোকাল স্টেট থেকে সাথে সাথেই রিমুভ
        setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
        // অ্যাক্টিভ অর্ডারে এটি লোড করার জন্য রাইডার ডাটা রিফ্রেশ
        fetchRiderData(rider.id);
      } else {
        // ⚠️ যদি অন্য কেউ আগে এক্সেপ্ট করে ফেলে
        alert("⚠️ " + data.message);
        // স্ক্রিন থেকে ওই অর্ডারটি সাথে সাথে ফেলে দাও
        setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (err) {
      console.error("Accept error:", err);
      alert("Something went wrong! Please try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  // অ্যাক্টিভ অর্ডারের স্ট্যাটাস (Picked Up / Delivered) আপডেট করার জন্য
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
      <div className="mx-auto max-w-4xl px-6 space-y-6">

        {/* 1. Header & Online/Offline Toggle */}
        <div className="flex items-center gap-2">
          <Link href="/rider/profile"
            className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            Earnings & Profile
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Bike className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{rider?.name}</h1>
              <p className="text-xs font-semibold text-slate-500">
                {rider?.vehicleType || "Motorcycle"} • {rider?.phone || "Rider Partner"}
              </p>
            </div>
          </div>

          <button
            onClick={toggleOnlineStatus}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition shadow-sm ${
              isOnline
                ? "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            <Power className="h-4 w-4" />
            <span>{isOnline ? "You are Online" : "Go Online"}</span>
          </button>
        </div>

        {/* 2. Today's Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Today's Deliveries</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{todaySummary.count}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Today's Earnings</p>
              <h3 className="text-2xl font-black text-orange-600 mt-1">৳{todaySummary.earnings}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* 3. Active Order Delivery Section */}
        {activeOrder && (
          <div className="rounded-3xl border-2 border-orange-500 bg-white p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3.5 py-1 text-xs font-bold text-orange-600">
                📦 Active Delivery #{activeOrder.id.slice(-6).toUpperCase()}
              </span>
              <span className="text-xs font-bold text-slate-400">Est. Fee: ৳{activeOrder.deliveryFee || 60}</span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <Store className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400">Pickup Restaurant</p>
                  <p className="font-bold text-slate-900">{activeOrder.restaurant?.name}</p>
                  <p className="text-xs text-slate-500">{activeOrder.restaurant?.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400">Drop-off Customer Location</p>
                  <p className="font-bold text-slate-900">{activeOrder.customer?.name}</p>
                  <p className="text-xs text-slate-500">{activeOrder.deliveryAddress}</p>
                  <a
                    href={`tel:${activeOrder.customer?.phone}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 mt-2 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call Customer ({activeOrder.customer?.phone})
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2">
              {activeOrder.status === "ACCEPTED_BY_RIDER" || activeOrder.status === "PREPARING" || activeOrder.status === "READY_FOR_PICKUP" ? (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateOrderStatus(activeOrder.id, "ON_THE_WAY")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-xs font-bold text-white shadow-lg transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                  <span>Mark as Picked Up</span>
                </button>
              ) : (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateOrderStatus(activeOrder.id, "DELIVERED")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-xs font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Mark as Delivered</span>
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
                <p className="font-bold text-slate-700">Searching for nearby orders...</p>
                <p className="text-xs text-slate-400 mt-1">New delivery orders will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {availableOrders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-black text-slate-900 text-sm">{order.restaurant?.name}</span>
                      <span className="font-extrabold text-orange-600 text-sm">৳{order.deliveryFee || 60} Earning</span>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-600">
                      <p><span className="font-bold text-slate-400">Pickup:</span> {order.restaurant?.address}</p>
                      <p><span className="font-bold text-slate-400">Drop-off:</span> {order.deliveryAddress}</p>
                    </div>

                    <button
                      disabled={acceptingId === order.id}
                      onClick={() => handleAcceptOrder(order.id)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-xs font-bold text-white shadow-md shadow-orange-100 transition hover:bg-orange-700 disabled:opacity-50"
                    >
                      {acceptingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept Order"}
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