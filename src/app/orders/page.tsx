"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Order, User } from "../../types";
import OrderCard from "../../components/orders/OrderCard";
import ReviewModal from "../../components/orders/ReviewModal";
import OrderReceiptModal from "../../components/orders/OrderReceiptModal";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const router = useRouter();

  const fetchOrders = async () => {
    let currentUser: User | null = null;

    // 1. First check localStorage for immediate client hydration
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (e) {
        currentUser = null;
      }
    }

    // 2. If not found in localStorage, fetch from session cookie
    if (!currentUser) {
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user) {
            currentUser = authData.user;
            localStorage.setItem("user", JSON.stringify(authData.user));
          }
        }
      } catch (e) {
        console.error("Session check error:", e);
      }
    }

    // If still no user, redirect to login
    if (!currentUser?.id) {
      setIsLoading(false);
      router.push("/login?redirect=/orders");
      return;
    }

    // 3. Fetch user orders
    try {
      const res = await fetch(`/api/orders/user?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    const isOnlinePaid =
      order.paymentMethod && order.paymentMethod !== "CASH_ON_DELIVERY";

    const promptText = isOnlinePaid
      ? `Are you sure you want to cancel Order #${order.id.slice(0, 8)}?\n\nSince this order was paid online via ${order.paymentMethod}, an automated refund of ৳${order.totalAmount} will be immediately initiated to your account.`
      : `Are you sure you want to cancel Order #${order.id.slice(0, 8)}? (Cash on Delivery order)`;

    const isConfirmed = confirm(promptText);
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      alert(data.message || "Order cancelled successfully!");
      fetchOrders();
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("Failed to cancel order.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 font-sans pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">My Orders</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Track live status and view past order history
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              <p className="text-xs font-bold text-slate-400">Loading your orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
            <Package className="h-16 w-16 mb-3 text-slate-300 stroke-1" />
            <h3 className="text-lg font-bold text-slate-700">No orders found!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Looks like you haven't placed any orders yet.
            </p>
            <Link
              href="/"
              className="mt-6 rounded-2xl bg-orange-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
            >
              Explore Restaurants & Food
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOpenReviewModal={(selected) => setReviewOrder(selected)}
                onOpenReceiptModal={(selected) => setReceiptOrder(selected)}
                onCancelOrder={handleCancelOrder}
              />
            ))}
          </div>
        )}

        {/* Reusable Review Modal Component */}
        <ReviewModal
          order={reviewOrder}
          isOpen={Boolean(reviewOrder)}
          onClose={() => setReviewOrder(null)}
          onSuccess={fetchOrders}
        />

        {/* 🧾 Reusable Official Tax Invoice / Receipt Modal */}
        <OrderReceiptModal
          order={receiptOrder}
          isOpen={Boolean(receiptOrder)}
          onClose={() => setReceiptOrder(null)}
        />
      </div>
    </main>
  );
}