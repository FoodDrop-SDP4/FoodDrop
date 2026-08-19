"use client";

import { useEffect, useState } from "react";
import {
  Bike,
  CheckCircle2,
  Phone,
  Store,
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  KeyRound,
} from "lucide-react";
import { triggerFireworks, triggerConfetti } from "../../lib/confetti";
import { playDeliveryCompleteSound } from "../../lib/sound";

export default function LiveCustomerDeliveryPrompt() {
  const [arrivedOrder, setArrivedOrder] = useState<any | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u?.id) {
            setCurrentUserId(u.id);
          }
        } catch (e) {}
      }
    };
    checkUser();
  }, []);

  // Poll for any active order that has status === "ARRIVED"
  useEffect(() => {
    if (!currentUserId) return;

    const checkArrivedOrders = async () => {
      try {
        const res = await fetch(`/api/orders/user?userId=${currentUserId}`);
        if (!res.ok) return;
        const orders = await res.json();
        if (Array.isArray(orders)) {
          const arrived = orders.find(
            (o: any) => o.status === "ARRIVED" && o.id !== dismissedId
          );
          setArrivedOrder(arrived || null);
        }
      } catch (err) {
        console.error("Error polling arrived orders:", err);
      }
    };

    checkArrivedOrders();
    const interval = setInterval(checkArrivedOrders, 3000);
    return () => clearInterval(interval);
  }, [currentUserId, dismissedId]);

  const handleConfirmDelivery = async () => {
    if (!arrivedOrder) return;
    setIsConfirming(true);

    try {
      const res = await fetch(`/api/orders/${arrivedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DELIVERED" }),
      });

      if (res.ok) {
        playDeliveryCompleteSound();
        triggerFireworks();
        triggerConfetti();
        setArrivedOrder(null);
        alert("🎉 Enjoy your delicious meal! Your delivery has been confirmed.");
      } else {
        alert("⚠️ Failed to confirm delivery. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error confirming delivery.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (!arrivedOrder) return null;

  const pinCode = arrivedOrder.id.slice(-4).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 space-y-5 shadow-2xl border-2 border-orange-500 relative overflow-hidden animate-in slide-in-from-bottom-6">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-md shadow-orange-100 animate-bounce">
              <Bike className="h-7 w-7" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-black text-orange-800">
                <Sparkles className="h-3 w-3 text-orange-600" />
                Rider At Your Doorstep!
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Food Arrival Confirmation
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDismissedId(arrivedOrder.id);
              setArrivedOrder(null);
            }}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            title="Dismiss for now"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Rider & Order Details Card */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500 flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-orange-600" />
              {arrivedOrder.restaurant?.name || "Restaurant"}
            </span>
            <span className="font-black text-slate-900">
              Total: ৳{arrivedOrder.totalAmount}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <div>
              <p className="text-xs font-black text-slate-800">
                {arrivedOrder.rider?.name || "FoodDrop Delivery Partner"}
              </p>
              <p className="text-[11px] text-slate-500">
                {arrivedOrder.rider?.vehicleType || "Rider"} • {arrivedOrder.rider?.phone || "Verified"}
              </p>
            </div>
            {arrivedOrder.rider?.phone && (
              <a
                href={`tel:${arrivedOrder.rider.phone}`}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs hover:bg-orange-50 hover:text-orange-600"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Secret 4-Digit PIN Box */}
        <div className="rounded-2xl bg-amber-50 p-3.5 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-700" />
            <div>
              <span className="text-[11px] font-bold text-amber-900">
                Backup Delivery PIN:
              </span>
              <p className="text-[10px] text-amber-700">
                Tell this code to the rider if needed
              </p>
            </div>
          </div>
          <span className="text-lg font-black tracking-widest text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-xs">
            {pinCode}
          </span>
        </div>

        {/* Confirmation Question */}
        <p className="text-xs text-center text-slate-600 font-medium px-2">
          Did you receive your food package from the rider in good condition?
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => {
              setDismissedId(arrivedOrder.id);
              setArrivedOrder(null);
            }}
            className="flex-1 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition cursor-pointer"
          >
            Not Yet
          </button>

          <button
            type="button"
            onClick={handleConfirmDelivery}
            disabled={isConfirming}
            className="flex-2 flex items-center justify-center gap-2 py-3 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-600/30 transition active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isConfirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>Yes, Received Food! 🎉</span>
          </button>
        </div>

      </div>
    </div>
  );
}
