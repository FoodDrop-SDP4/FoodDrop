// File: src/app/checkout/page.tsx
"use client";

import { useCartStore } from "../../store/useCartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, MapPin, Phone, CreditCard, Loader2, CheckCircle2, ArrowLeft, Home, Briefcase } from "lucide-react";
import Link from "next/link";
import { User, Address } from "../../types";

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const router = useRouter();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login?redirect=/checkout");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // 🚀 সঠিক API রাউট থেকে সেভ করা এড্রেস নিয়ে আসা
      fetch(`/api/users/addresses?userId=${parsedUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setSavedAddresses(data);
        })
        .catch((err) => console.error("Error fetching saved addresses:", err));
    }
  }, [router]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 60;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryAddress || !phone) {
      alert("Please provide delivery address and phone number!");
      return;
    }

    if (!user) {
      alert("Please login first!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user.id,
          restaurantId: cart[0].restaurantId,
          deliveryAddress,
          phone,
          paymentMethod,
          totalAmount: total,
          items: cart.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        setPlacedOrderId(data.order?.id || null);
        setOrderPlaced(true);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Your order has been sent to the restaurant and assigned for instant live preparation.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {placedOrderId && (
              <Link
                href={`/orders/${placedOrderId}/track`}
                className="block w-full rounded-2xl bg-orange-600 py-4 text-sm font-bold text-white shadow-xl shadow-orange-600/30 transition hover:bg-orange-700 active:scale-95"
              >
                Track Live on Map 🗺️
              </Link>
            )}

            <Link
              href="/orders"
              className="block w-full rounded-2xl bg-slate-900 py-3.5 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Foods
        </Link>

        <h1 className="text-3xl font-black text-slate-900 mb-8">Checkout</h1>

        {cart.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-slate-600">Your cart is empty!</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Form */}
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              
              {/* Delivery Information Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" /> Delivery Information
                </h2>

                {/* 🚀 Saved Addresses Quick Selector Component */}
                {savedAddresses.length > 0 && (
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                    <p className="text-xs font-bold text-slate-500">Select from saved addresses:</p>
                    <div className="flex flex-wrap gap-2">
                      {savedAddresses.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDeliveryAddress(item.address)}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                            deliveryAddress === item.address
                              ? "border-orange-600 bg-orange-600 text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {item.label === "Home" && <Home className="h-3.5 w-3.5" />}
                          {item.label === "Office" && <Briefcase className="h-3.5 w-3.5" />}
                          {item.label === "Other" && <MapPin className="h-3.5 w-3.5" />}
                          <span>{item.label}:</span>
                          <span className="font-normal truncate max-w-[150px]">{item.address}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-600">Full Delivery Address</label>
                  <input
                    required
                    type="text"
                    placeholder="House no, Road no, Area (e.g., Mirpur 10, Dhaka)"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-50 p-3.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Contact Phone Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-50 p-3.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-600" /> Payment Method
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                    className={`rounded-2xl border p-4 text-left font-bold text-sm transition ${
                      paymentMethod === "CASH_ON_DELIVERY"
                        ? "border-orange-600 bg-orange-50/50 text-orange-600"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Cash on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BKASH")}
                    className={`rounded-2xl border p-4 text-left font-bold text-sm transition ${
                      paymentMethod === "BKASH"
                        ? "border-orange-600 bg-orange-50/50 text-orange-600"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    bKash / Online Demo
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-orange-600 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-orange-700 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : `Confirm Order (৳${total})`}
              </button>
            </form>

            {/* Summary */}
            <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 text-lg border-b pb-3">Order Summary</h2>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.name} × {item.quantity}</span>
                    <span className="font-bold text-slate-900">৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between"><span>Subtotal</span><span>৳{subtotal}</span></div>
                <div className="flex justify-between"><span>Delivery Fee</span><span>৳{deliveryFee}</span></div>
                <div className="flex justify-between text-sm font-black text-slate-900 border-t pt-2">
                  <span>Total</span>
                  <span className="text-orange-600">৳{total}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}