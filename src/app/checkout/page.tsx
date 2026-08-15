"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  MapPin,
  Phone,
  CreditCard,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Home,
  Briefcase,
  Tag,
  Percent,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { User, Address } from "../../types";
import {
  calculatePromoDiscount,
  AVAILABLE_PROMOS,
  PromoCode,
} from "../../lib/promo";
import { triggerConfetti, triggerFireworks } from "../../lib/confetti";
import { playOrderSuccessSound } from "../../lib/sound";
import PaymentGatewayModal, {
  PaymentGatewayType,
} from "../../components/checkout/PaymentGatewayModal";

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const router = useRouter();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH_ON_DELIVERY" | "BKASH" | "NAGAD" | "CARD"
  >("CASH_ON_DELIVERY");

  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Digital Payment Modal State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [activeGateway, setActiveGateway] = useState<PaymentGatewayType>("BKASH");

  useEffect(() => {
    const hydrateUser = async () => {
      let currentUser: User | null = null;

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
        } catch (e) {
          currentUser = null;
        }
      }

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
          // quiet
        }
      }

      if (!currentUser) {
        router.push("/login?redirect=/checkout");
        return;
      }

      setUser(currentUser);

      // 🚀 Auto-prefill registered phone number from account
      if (currentUser.phone) {
        setPhone(currentUser.phone);
      }

      // Fetch saved addresses and auto-select default
      fetch(`/api/users/addresses?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setSavedAddresses(data);
            const defaultAddr = data.find((a: Address) => a.isDefault) || data[0];
            if (defaultAddr?.address) {
              setDeliveryAddress((prev) => prev || defaultAddr.address);
            }
          }
        })
        .catch((err) => console.error("Error fetching saved addresses:", err));
    };

    hydrateUser();
  }, [router]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 60 : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Apply Promo Code
  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) return;

    const result = calculatePromoDiscount(code, subtotal, deliveryFee);

    if (result.isValid && result.promoCode) {
      setAppliedPromo(result.promoCode);
      setDiscountAmount(result.discount);
      setPromoMessage(result.message);
      setPromoError(null);
      setPromoInput(code);
      triggerConfetti();
    } else {
      setPromoError(result.message);
      setPromoMessage(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoMessage(null);
    setPromoError(null);
    setPromoInput("");
  };

  // Execute Order Placement to Backend API
  const executePlaceOrder = async (extraData?: {
    paymentMethod?: string;
    transactionId?: string;
  }) => {
    if (!user) {
      alert("Please login to place an order.");
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
          paymentMethod: extraData?.paymentMethod || paymentMethod,
          transactionId: extraData?.transactionId || undefined,
          totalAmount: grandTotal,
          deliveryFee,
          items: cart.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const finalMethod = extraData?.paymentMethod || paymentMethod;
        if (data.order?.id) {
          try {
            localStorage.setItem(`fooddrop_order_${data.order.id}_payment`, finalMethod);
          } catch (e) {
            // ignore
          }
        }
        clearCart();
        setPlacedOrderId(data.order?.id || null);
        setOrderPlaced(true);
        playOrderSuccessSound();
        triggerFireworks();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while placing order!");
    } finally {
      setIsLoading(false);
    }
  };

  // Form Submit Handler
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryAddress.trim() || !phone.trim()) {
      alert("Please provide a complete delivery address and contact phone number!");
      return;
    }

    if (paymentMethod === "CASH_ON_DELIVERY") {
      executePlaceOrder();
    } else {
      setActiveGateway(paymentMethod as PaymentGatewayType);
      setIsGatewayOpen(true);
    }
  };

  // Gateway Success Callback
  const handleGatewaySuccess = (transactionId: string, method: PaymentGatewayType) => {
    setIsGatewayOpen(false);
    executePlaceOrder({
      paymentMethod: method,
      transactionId,
    });
  };

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h1>
            <p className="text-xs text-slate-500 mt-1.5">
              Your order has been sent to the kitchen and is ready for live GPS tracking.
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
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Foods
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-slate-900">Checkout & Payment</h1>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure 256-Bit Checkout</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-slate-600">Your cart is empty!</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            
            {/* Left Col: Forms & Payment Options */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              
              {/* Delivery Information Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" /> Delivery Information
                </h2>

                {/* Saved Addresses Quick Selector */}
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
                    placeholder="House no, Road no, Area (e.g. House 12, Road 5, Dhanmondi, Dhaka)"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-50 p-3.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600">Contact Phone Number</label>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      Auto-filled • Editable
                    </span>
                  </div>
                  <input
                    required
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-50 p-3.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-600" /> Select Payment Method
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* COD */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                    className={`rounded-2xl border p-4 text-left font-bold text-sm transition relative ${
                      paymentMethod === "CASH_ON_DELIVERY"
                        ? "border-orange-600 bg-orange-50/50 text-orange-700 ring-2 ring-orange-500/20"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Cash on Delivery</span>
                      {paymentMethod === "CASH_ON_DELIVERY" && <Check className="h-4 w-4 text-orange-600" />}
                    </div>
                    <p className="text-[11px] font-normal text-slate-400 mt-1">
                      Pay with cash upon food arrival.
                    </p>
                  </button>

                  {/* bKash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BKASH")}
                    className={`rounded-2xl border p-4 text-left font-bold text-sm transition relative ${
                      paymentMethod === "BKASH"
                        ? "border-[#E2136E] bg-pink-50 text-[#E2136E] ring-2 ring-[#E2136E]/20"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="h-4 w-4 text-[#E2136E]" /> bKash Wallet
                      </span>
                      {paymentMethod === "BKASH" && <Check className="h-4 w-4 text-[#E2136E]" />}
                    </div>
                    <p className="text-[11px] font-normal text-slate-400 mt-1">
                      Instant simulated mobile payment.
                    </p>
                  </button>

                  {/* Nagad */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("NAGAD")}
                    className={`rounded-2xl border p-4 text-left font-bold text-sm transition relative ${
                      paymentMethod === "NAGAD"
                        ? "border-[#F7931E] bg-amber-50 text-[#F7931E] ring-2 ring-[#F7931E]/20"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="h-4 w-4 text-[#F7931E]" /> Nagad Wallet
                      </span>
                      {paymentMethod === "NAGAD" && <Check className="h-4 w-4 text-[#F7931E]" />}
                    </div>
                    <p className="text-[11px] font-normal text-slate-400 mt-1">
                      Simulated postal digital cash.
                    </p>
                  </button>

                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CARD")}
                    className={`rounded-2xl border p-4 text-left font-bold text-sm transition relative ${
                      paymentMethod === "CARD"
                        ? "border-slate-900 bg-slate-100 text-slate-900 ring-2 ring-slate-900/20"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-slate-800" /> Credit / Debit Card
                      </span>
                      {paymentMethod === "CARD" && <Check className="h-4 w-4 text-slate-900" />}
                    </div>
                    <p className="text-[11px] font-normal text-slate-400 mt-1">
                      Visa, Mastercard, AMEX.
                    </p>
                  </button>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-orange-600 py-4 text-sm font-black tracking-wide text-white shadow-xl shadow-orange-600/30 transition hover:bg-orange-700 active:scale-98 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : paymentMethod === "CASH_ON_DELIVERY" ? (
                  `Place Order • ৳${grandTotal}`
                ) : (
                  `Proceed to ${paymentMethod === "BKASH" ? "bKash" : paymentMethod === "NAGAD" ? "Nagad" : "Card"} Payment (৳${grandTotal})`
                )}
              </button>
            </form>

            {/* Right Col: Summary & Promo Code Engine */}
            <div className="space-y-6">
              
              {/* Promo Code Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Tag className="h-4 w-4 text-orange-600" /> Have a Promo Code?
                </h2>

                {!appliedPromo ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Promo (e.g. FOODDROP50)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider outline-none focus:border-orange-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyPromo()}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 active:scale-95"
                      >
                        Apply
                      </button>
                    </div>

                    {promoError && (
                      <p className="text-xs font-semibold text-rose-600">{promoError}</p>
                    )}

                    {/* Quick Available Voucher Chips */}
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Available Coupons:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_PROMOS.map((promo) => (
                          <button
                            key={promo.code}
                            type="button"
                            onClick={() => handleApplyPromo(promo.code)}
                            className="rounded-lg bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-600 border border-orange-200 hover:bg-orange-100 transition"
                          >
                            🏷️ {promo.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-emerald-800">
                          {appliedPromo.code} Applied!
                        </p>
                        <p className="text-[11px] text-emerald-600">{appliedPromo.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Order Breakdown */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 text-lg border-b pb-3">Order Summary</h2>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-50">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs pt-2">
                      <span className="font-medium text-slate-700">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-bold text-slate-900">
                        ৳{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-800">৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-slate-800">৳{deliveryFee}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Discount ({appliedPromo?.code})</span>
                      <span>-৳{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black text-slate-900 border-t pt-3">
                    <span>Grand Total</span>
                    <span className="text-xl text-orange-600">৳{grandTotal}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Simulated Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        onSuccess={handleGatewaySuccess}
        amount={grandTotal}
        paymentMethod={activeGateway}
      />
    </main>
  );
}