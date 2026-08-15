"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, Clock, CheckCircle2, Truck, ChefHat, AlertCircle, MapPin, ArrowLeft, Star, Bike } from "lucide-react";
import Link from "next/link";

type OrderItem = {
  id: string;
  quantity: number;
  menuItem: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
};

type Order = {
  id: string;
  restaurantId: string;
  totalAmount: number;
  // 🚀 ACCEPTED_BY_RIDER টাইপ যুক্ত করা হয়েছে
  status: "PENDING" | "PREPARING" | "ACCEPTED_BY_RIDER" | "READY_FOR_PICKUP" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED";
  deliveryAddress: string;
  createdAt: string;
  restaurant: {
    name: string;
  };
  orderItems: OrderItem[];
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
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

    fetchOrders();
  }, [router]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          restaurantId: reviewOrder.restaurantId,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        alert("Thank you for your review!");
        setReviewOrder(null);
        setComment("");
        setRating(5);
      } else {
        alert("Failed to submit review");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 border border-amber-200/60">
            <Clock className="h-3.5 w-3.5" /> Order Placed
          </span>
        );
      case "PREPARING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 border border-blue-200/60">
            <ChefHat className="h-3.5 w-3.5 animate-bounce" /> Kitchen Preparing
          </span>
        );
      // 🚀 রাইডার এক্সেপ্ট করলে যে স্ট্যাটাস ব্যাজটি দেখাবে
      case "ACCEPTED_BY_RIDER":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 border border-indigo-200/60">
            <Bike className="h-3.5 w-3.5 animate-pulse" /> Rider Accepted Order
          </span>
        );
      case "READY_FOR_PICKUP":
      case "ON_THE_WAY":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-600 border border-purple-200/60">
            <Truck className="h-3.5 w-3.5 animate-pulse" /> Out for Delivery
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-200/60">
            <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 border border-rose-200/60">
            <AlertCircle className="h-3.5 w-3.5" /> Cancelled
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 mb-6 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">My Orders</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Track live status and view past order history</p>
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
            <p className="text-xs text-slate-400 mt-1">Looks like you haven't ordered anything yet.</p>
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
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{order.restaurant?.name || "Restaurant"}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Order ID: <span className="font-mono font-medium text-slate-600">#{order.id.slice(-8)}</span> • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}

                    {/* Give Review Button (Only for Delivered Orders) */}
                    {order.status === "DELIVERED" && (
                      <button
                        onClick={() => setReviewOrder(order)}
                        className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1 text-xs font-bold text-orange-600 border border-orange-200 hover:bg-orange-100 transition"
                      >
                        <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                        <span>Review</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 space-y-4">
                  <div className="divide-y divide-slate-100">
                    {order.orderItems?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.menuItem?.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                            alt={item.menuItem?.name || "Food Item"}
                            className="h-12 w-12 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item.menuItem?.name || "Food Item"}</p>
                            <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-900">৳{(item.menuItem?.price || 0) * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600">
                    <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{order.deliveryAddress}</span>
                  </div>

                  {/* Total Amount */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                    <span className="font-bold text-slate-600">Total Paid</span>
                    <span className="text-lg font-black text-orange-600">৳{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {reviewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900">Review {reviewOrder.restaurant?.name}</h3>
                <button onClick={() => setReviewOrder(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                  Cancel
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 transition transform active:scale-125"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Your Feedback / Comment</label>
                  <textarea
                    rows={3}
                    placeholder="How was the food quality and delivery speed?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full rounded-2xl bg-orange-600 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-orange-700 disabled:opacity-70"
                >
                  {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}