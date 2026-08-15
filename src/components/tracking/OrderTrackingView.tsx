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
  Radar,
  Star,
  Store,
  Truck,
  User,
  X,
  AlertCircle,
  XCircle,
  ShoppingBag,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Order, OrderStatus } from "../../types";
import OrderReceiptModal from "../orders/OrderReceiptModal";

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
  { key: "PENDING", label: "Order Placed", sub: "Waiting for restaurant", icon: Clock },
  { key: "PREPARING", label: "Cooking", sub: "Kitchen preparing food", icon: ChefHat },
  { key: "READY_FOR_PICKUP", label: "Food Ready", sub: "Packed & ready for pickup", icon: Package },
  { key: "ON_THE_WAY", label: "On the Way", sub: "Rider is delivering to you", icon: Truck },
  { key: "DELIVERED", label: "Delivered", sub: "Enjoy your delicious meal!", icon: CheckCircle2 },
];

const getProgressByStatus = (status: OrderStatus): number => {
  switch (status) {
    case "PENDING": return 10;
    case "PREPARING": return 30;
    case "READY_FOR_PICKUP": return 50;
    case "ACCEPTED_BY_RIDER": return 65;
    case "ON_THE_WAY": return 80;
    case "DELIVERED": return 100;
    default: return 10;
  }
};

export default function OrderTrackingView({ initialOrder }: OrderTrackingViewProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialOrder.status);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [progressPercent, setProgressPercent] = useState<number>(() =>
    getProgressByStatus(initialOrder.status)
  );

  // Call & Chat Modal State
  const [activeModal, setActiveModal] = useState<"CALL" | "CHAT" | null>(null);
  const [chatMessages, setChatMessages] = useState<string[]>([
    "Hello! I am on the way with your food.",
  ]);
  const [newMessage, setNewMessage] = useState("");

  // 🚀 Real-time Polling: Check backend every 3 seconds for updated order & rider info
  useEffect(() => {
    if (currentStatus === "CANCELLED") return;

    const fetchLatestOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`);
        if (res.ok) {
          const latest: Order = await res.json();
          setOrder(latest);
          setCurrentStatus(latest.status);
          setProgressPercent(getProgressByStatus(latest.status));
        }
      } catch (err) {
        // quiet fail
      }
    };

    const interval = setInterval(fetchLatestOrder, 3000);
    return () => clearInterval(interval);
  }, [order.id, currentStatus]);

  const stageIndex = useMemo(() => {
    switch (currentStatus) {
      case "PENDING":
        return 0;
      case "PREPARING":
        return 1;
      case "READY_FOR_PICKUP":
      case "ACCEPTED_BY_RIDER":
        return 2;
      case "ON_THE_WAY":
        return 3;
      case "DELIVERED":
        return 4;
      default:
        return 0;
    }
  }, [currentStatus]);

  // Sync ETA based on stage
  const etaText = useMemo(() => {
    switch (currentStatus) {
      case "CANCELLED":
        return "Order Cancelled";
      case "PENDING":
        return "Order Placed • Waiting for restaurant confirmation";
      case "PREPARING":
        return "Kitchen Preparing • Food is being freshly cooked 👨‍🍳";
      case "READY_FOR_PICKUP":
        return order.rider
          ? `Food Ready & Packed • ${order.rider.name} heading for pickup 📦`
          : "Food Ready & Packed • Waiting for nearby rider pickup 📦";
      case "ACCEPTED_BY_RIDER":
        return `Rider Assigned • ${order.rider?.name || "Rider"} heading to restaurant 🏍️`;
      case "ON_THE_WAY":
        return "Out for Delivery • Arriving in ~10-15 mins 🛵";
      case "DELIVERED":
        return "Order Delivered Successfully! 🎉";
      default:
        return "Estimated Arrival: ~25 mins";
    }
  }, [currentStatus, order.rider]);

  const isOnlinePayment = order.paymentMethod && order.paymentMethod !== "COD";

  // 🚀 Customer Cancel Order Action
  const handleCustomerCancelOrder = async () => {
    const confirmMessage = isOnlinePayment
      ? `Are you sure you want to cancel this order?\n\nSince this order was paid online via ${order.paymentMethod}, an automated instant refund of ৳${order.totalAmount} will be immediately credited to your account.`
      : "Are you sure you want to cancel this Cash on Delivery order?";

    if (!confirm(confirmMessage)) return;

    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentStatus("CANCELLED");
        setOrder((prev) => ({ ...prev, status: "CANCELLED" }));
      } else {
        alert(data.message || "Failed to cancel order.");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("Something went wrong while cancelling order.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages((prev) => [...prev, `You: ${newMessage.trim()}`]);
    setNewMessage("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        `${order.rider?.name || "Rider"}: Got it! Reaching your location shortly.`,
      ]);
    }, 1200);
  };

  // 🚀 If order is CANCELLED, render clear cancellation view
  if (currentStatus === "CANCELLED") {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-28 pt-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm border border-slate-200 transition hover:bg-orange-50 hover:text-orange-600"
            >
              <ArrowLeft className="h-4 w-4" /> Back to My Orders
            </Link>
          </div>

          <div className="rounded-3xl border border-rose-200 bg-white p-8 sm:p-12 shadow-xl shadow-rose-500/5 space-y-6 text-center animate-in fade-in zoom-in-95">
            
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 shadow-lg shadow-rose-200">
              <XCircle className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <span className="rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-xs font-black uppercase tracking-wider">
                Order Cancelled
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                This Order has been Cancelled
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Order #{order.id.slice(0, 8)} from {order.restaurant?.name || "the restaurant"} has been cancelled.
              </p>
            </div>

            {/* Refund / COD Notice Box */}
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 text-left max-w-lg mx-auto space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                <span className="text-xs font-bold text-slate-500">Payment Status</span>
                <span className="text-xs font-black text-slate-900">
                  {isOnlinePayment ? `Online (${order.paymentMethod})` : "Cash on Delivery"}
                </span>
              </div>

              {isOnlinePayment ? (
                <div className="flex items-start gap-3 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <CreditCard className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-black text-emerald-900">Automated Refund Initiated!</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      Your payment of <strong>৳{order.totalAmount}</strong> has been auto-refunded to your {order.paymentMethod} account.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-xs font-medium text-slate-700 bg-slate-100 p-3 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                  <span>No payment was charged since this was a Cash on Delivery order.</span>
                </div>
              )}
            </div>

            {/* Order Items Recap */}
            <div className="max-w-lg mx-auto rounded-2xl border border-slate-100 p-4 text-left divide-y divide-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Cancelled Items:
              </span>
              {order.orderItems?.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-xs font-medium text-slate-700">
                  <span>{item.quantity}x {item.menuItem?.name || "Dish"}</span>
                  <span className="font-mono text-slate-900">৳{(item.menuItem?.price || 0) * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Explore Other Restaurants</span>
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-6 py-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
              >
                View Order History
              </Link>
            </div>

          </div>

        </div>
      </div>
    );
  }

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

          <div className="flex items-center gap-3">
            {/* 🧾 View Receipt / Invoice Button */}
            <button
              onClick={() => setIsReceiptOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm border border-slate-200 transition hover:bg-orange-50 hover:text-orange-600 active:scale-95"
              title="View Tax Invoice & Receipt"
            >
              <span>Receipt 🧾</span>
            </button>

            {/* 🚀 Cancel Order Button for Customer when PENDING */}
            {currentStatus === "PENDING" && (
              <button
                onClick={handleCustomerCancelOrder}
                disabled={isCancelling}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-50 px-4 py-2 text-xs font-black text-rose-600 border border-rose-200 transition hover:bg-rose-100 active:scale-95 disabled:opacity-50"
              >
                {isCancelling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                <span>Cancel Order</span>
              </button>
            )}

            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-black text-emerald-700 border border-emerald-200">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>LIVE GPS TRACKING</span>
            </div>
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
            
            {/* Rider Card - Real assigned rider OR searching state */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Delivery Partner
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold border ${
                    order.rider
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : currentStatus === "PENDING"
                      ? "bg-slate-100 text-slate-600 border-slate-200"
                      : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                  }`}
                >
                  {order.rider
                    ? "Rider Assigned"
                    : currentStatus === "PENDING"
                    ? "Awaiting Kitchen"
                    : "Searching Rider"}
                </span>
              </div>

              {order.rider ? (
                <>
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
                        {order.rider.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-500">
                        {order.rider.vehicleType === "Motorcycle"
                          ? `🏍️ Motorcycle • ${order.rider.vehicleNumber || "Verified"}`
                          : order.rider.vehicleType === "Bicycle"
                          ? "🚲 Bicycle Courier"
                          : "🚶 Walker Courier"}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs font-black text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{order.rider.rating || 4.9} ({order.rider.totalReviews || 120}+ Deliveries)</span>
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
                </>
              ) : currentStatus === "PENDING" ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Waiting for kitchen confirmation
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      The restaurant is reviewing your order. Once accepted, cooking begins and nearby riders will be notified.
                    </p>
                  </div>

                  <button
                    onClick={handleCustomerCancelOrder}
                    disabled={isCancelling}
                    className="mt-2 w-full rounded-xl bg-rose-50 border border-rose-200 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-5 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                    <Radar className="h-6 w-6 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Looking for nearby delivery partner...
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      As soon as a rider claims your order, their live details and contact buttons will appear right here.
                    </p>
                  </div>
                </div>
              )}
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

      {/* Simulated Call Modal */}
      {activeModal === "CALL" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 text-white p-8 text-center shadow-2xl space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 animate-pulse">
              <Phone className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-black">Calling {order.rider?.name || "Rider"}...</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">{order.rider?.phone || "+880 1744-444444"}</p>
              <p className="text-xs text-orange-400 font-bold mt-2">
                "Hello, I am near your delivery location!"
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
                  <h4 className="text-sm font-bold">{order.rider?.name || "Rider"} Chat</h4>
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
                    {msg.replace("You: ", "").replace(`${order.rider?.name || "Rider"}: `, "")}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2">
              <input
                type="text"
                placeholder={`Type a message to ${order.rider?.name || "rider"}...`}
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

      {/* 🧾 Reusable Tax Invoice & POS Receipt Modal */}
      <OrderReceiptModal
        order={order}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

    </div>
  );
}
