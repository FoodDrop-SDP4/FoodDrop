"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Order } from "../../types";
import OrderCard from "../../components/orders/OrderCard";
import ReviewModal from "../../components/orders/ReviewModal";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const router = useRouter();

  const fetchOrders = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login?redirect=/orders");
      return;
    }

    const user = JSON.parse(storedUser);

    try {
      const res = await fetch(`/api/orders/user?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 font-sans pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
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
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
            <Package className="h-16 w-16 mb-3 text-slate-300 stroke-1" />
            <h3 className="text-lg font-bold text-slate-700">No orders found!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Looks like you haven't ordered anything yet.
            </p>
            <Link
              href="/"
              className="mt-6 rounded-2xl bg-orange-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
            >
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOpenReviewModal={(selected) => setReviewOrder(selected)}
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
      </div>
    </main>
  );
}