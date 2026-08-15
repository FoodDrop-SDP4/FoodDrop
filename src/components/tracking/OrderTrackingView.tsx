"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  ChefHat,
  Clock,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Play,
  RotateCcw,
  SkipForward,
  Star,
  Store,
  Truck,
  User,
  X,
} from "lucide-react";
import { Order, OrderStatus } from "../../types";

// Dynamic import for Leaflet map component (SSR: false)
const LiveTrackingMap = dynamic(() => import("./LiveTrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[380px] w-full items-center justify-center rounded-3xl border border-slate-200 bg-slate-100">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        <span className="text-xs font-bold">Initializing Live Map...</span>
      </div>
    </div>
  ),
});

interface OrderTrackingViewProps {
  initialOrder: Order;
}

const STAGES: { key: OrderStatus; label: string; sub: string; icon: React.ElementType }[] = [
  { key: "PENDING", label: "Order Placed", sub: "Received by restaurant", icon: Clock },
  { key: "PREPARING", label: "Cooking", sub: "Kitchen preparing fresh food", icon: ChefHat },
  { key: "ACCEPTED_BY_RIDER", label: "Rider Assigned", sub: "Heading to pickup food", icon: Bike },
  { key: "ON_THE_WAY", label: "On the Way", sub: "Rider is delivering to you", icon: Truck },
  { key: "DELIVERED", label: "Delivered", sub: "Enjoy your delicious meal!", icon: CheckCircle2 },
];

export default function OrderTrackingView({ initialOrder }: OrderTrackingViewProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialOrder.status);
  const [progressPercent, setProgressPercent] = useState<number>(() => {
    switch (initialOrder.status) {
      case "PENDING": return 10;
      case "PREPARING": return 25;
      case "ACCEPTED_BY_RIDER": return 40;
      case "ON_THE_WAY": return 65;
      case "DELIVERED": return 100;
      default: return 15;
    }
  });

  // Call & Chat Modal State
  const [activeModal, setActiveModal] = useState<"CALL" | "CHAT" | null>(null);
  const [chatMessages, setChatMessages] = useState<string[]>([
    "Hello! I am on the way with your food.",
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Demo auto-simulation state
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);

  const stageIndex = useMemo(() => {
    const idx = STAGES.findIndex((s) => s.key === currentStatus);
    return idx === -1 ? 0 : idx;
  }, [currentStatus]);

  // Sync ETA based on stage
  const etaText = useMemo(() => {
    switch (currentStatus) {
      case "PENDING": return "Estimated Arrival: ~30-35 mins";
      case "PREPARING": return "Estimated Arrival: ~20-25 mins";
      case "ACCEPTED_BY_RIDER": return "Rider arriving at restaurant in ~5 mins";
      case "ON_THE_WAY": return "Arriving in ~10-15 mins";
      case "DELIVERED": return "Order Delivered Successfully! 🎉";
      default: return "Estimated Arrival: ~25 mins";
    }
  }, [currentStatus]);

  // Update order status on backend & sync state
  const updateStatus = async (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Demo Controls
  const handleNextStage = () => {
    const nextIdx = (stageIndex + 1) % STAGES.length;
    const nextStage = STAGES[nextIdx].key;
    const nextProgress = ((nextIdx + 1) / STAGES.length) * 100;
    setProgressPercent(nextProgress);
    updateStatus(nextStage);
  };

  const handleResetDemo = () => {
    setIsAutoSimulating(false);
    setProgressPercent(10);
    updateStatus("PREPARING");
  };

  const handleStartAutoSimulation = () => {
    setIsAutoSimulating(true);
    let progress = 15;
    updateStatus("PREPARING");

    const interval = setInterval(() => {
      progress += 2;
      setProgressPercent(progress);

      if (progress >= 35 && progress < 45) {
        setCurrentStatus("ACCEPTED_BY_RIDER");
      } else if (progress >= 45 && progress < 95) {
        setCurrentStatus("ON_THE_WAY");
      } else if (progress >= 98) {
        setProgressPercent(100);
        updateStatus("DELIVERED");
        setIsAutoSimulating(false);
        clearInterval(interval);
      }
    }, 500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages((prev) => [...prev, `You: ${newMessage.trim()}`]);
    setNewMessage("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        "Rider: Got it! Reaching your location shortly.",
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm border border-slate-200 transition hover:bg-orange-50 hover:text-orange-600"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Orders
          </Link>

          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-black text-emerald-700 border border-emerald-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>LIVE TRACKING ACTIVE</span>
          </div>
        </div>

        {/* Top ETA & Status Banner */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-2xl shadow-slate-950/20 relative">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-orange-600/20 to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                Order #{order.id.slice(0, 8)} • {order.restaurant?.name || "Restaurant"}
              </span>
              <h1 className="mt-1 text-2xl sm:text-4xl font-black">{etaText}</h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                <span>{order.deliveryAddress}</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10 text-center sm:text-right shrink-0">
              <span className="text-xs text-slate-400 font-bold block">Total Amount</span>
              <span className="text-2xl font-black text-white">৳{order.totalAmount}</span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-white/10">
            {STAGES.map((st, idx) => {
              const Icon = st.icon;
              const isPassed = idx <= stageIndex;
              const isCurrent = idx === stageIndex;

              return (
                <div
                  key={st.key}
                  className={`flex items-center gap-3 rounded-2xl p-3 transition-all ${
                    isCurrent
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 ring-2 ring-orange-400"
                      : isPassed
                      ? "bg-white/10 text-emerald-300"
                      : "bg-white/5 text-slate-500 opacity-60"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold ${
                      isCurrent
                        ? "bg-white text-orange-600"
                        : isPassed
                        ? "bg-emerald-500 text-white"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate">{st.label}</p>
                    <p className="text-[10px] truncate opacity-80">{st.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Map & Details Sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left / Center 2 Cols: Interactive Leaflet Map */}
          <div className="lg:col-span-2 space-y-4">
            <LiveTrackingMap
              restaurantName={order.restaurant?.name || "Restaurant"}
              deliveryAddress={order.deliveryAddress}
              progressPercent={progressPercent}
              status={currentStatus}
            />
          </div>

          {/* Right Col: Rider & Order Details Card */}
          <div className="space-y-6">
            
            {/* Rider Card */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Assigned Rider
                </h3>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  On Duty
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                    <User className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-white shadow">
                    <Bike className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {order.rider?.name || "Rakib Delivery Partner"}
                  </h4>
                  <p className="text-xs font-bold text-slate-500">
                    {order.rider?.vehicleType || "Motorcycle"} • {order.rider?.vehicleNumber || "DHAKA-HA-1234"}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs font-black text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>4.9 (140+ Deliveries)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setActiveModal("CALL")}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow transition hover:bg-orange-600"
                >
                  <Phone className="h-4 w-4" />
                  Call Rider
                </button>
                <button
                  onClick={() => setActiveModal("CHAT")}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-orange-50 py-3 text-xs font-bold text-orange-600 border border-orange-200 transition hover:bg-orange-100"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </button>
              </div>
            </div>

            {/* Order Items Breakdown */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                Order Items ({order.orderItems?.length || 0})
              </h3>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {order.orderItems?.map((item, i) => (
                  <div key={item.id || i} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {item.menuItem?.imageUrl && (
                        <img
                          src={item.menuItem.imageUrl}
                          alt={item.menuItem.name}
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.menuItem?.name}</p>
                        <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      ৳{(item.menuItem?.price || 0) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 🚀 Presentation / Competition Showcase Demo Controller */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-slate-950/90 p-3 shadow-2xl backdrop-blur-md border border-white/20 text-white">
          <div className="flex items-center gap-2 pl-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-black tracking-wider uppercase text-orange-400">
              Demo Mode Controller
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNextStage}
              disabled={isAutoSimulating}
              className="flex items-center gap-1.5 rounded-2xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-orange-500 active:scale-95 disabled:opacity-50"
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span>Next Stage ⏩</span>
            </button>

            <button
              onClick={handleStartAutoSimulation}
              disabled={isAutoSimulating}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Auto Simulate 🚀</span>
            </button>

            <button
              onClick={handleResetDemo}
              className="flex items-center gap-1.5 rounded-2xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
              title="Reset to Initial State"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Call Modal */}
      {activeModal === "CALL" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 text-white p-8 text-center shadow-2xl space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 animate-pulse">
              <Phone className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-black">Calling Rider...</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">+880 1744-444444</p>
              <p className="text-xs text-orange-400 font-bold mt-2">
                "Hello, I am near your building gate!"
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full rounded-2xl bg-rose-600 py-3.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Simulated Chat Modal */}
      {activeModal === "CHAT" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col h-[480px]">
            <div className="flex items-center justify-between bg-slate-900 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-xs">
                  <Bike className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Rider Chat</h4>
                  <p className="text-[10px] text-emerald-400">Online • On the move</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.startsWith("You:") ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium ${
                      msg.startsWith("You:")
                        ? "bg-orange-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 shadow-sm border border-slate-200 rounded-bl-none"
                    }`}
                  >
                    {msg.replace("You: ", "").replace("Rider: ", "")}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2">
              <input
                type="text"
                placeholder="Type a message to rider..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-700 transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
