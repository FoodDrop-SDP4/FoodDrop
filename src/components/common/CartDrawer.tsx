"use client";

import { useCartStore } from "../../store/useCartStore";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, Sparkles } from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeFromCart } = useCartStore();
  const router = useRouter();
  const { t } = useLanguage();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 60 : 0;
  const total = subtotal + deliveryFee;

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-md animate-slide-in-right flex flex-col bg-white shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/30">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {t("cart_title", "Your Cart")}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 mb-4">
                  <ShoppingBag className="h-10 w-10 stroke-1 text-slate-300" />
                </div>
                <p className="font-bold text-slate-700 text-base">{t("cart_empty", "Your cart is empty")}</p>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-44">
                  {t("cart_empty_desc", "Add items from restaurants to get started!")}
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-5 rounded-2xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition cursor-pointer"
                >
                  Browse Food
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="group flex gap-3 rounded-2xl bg-white p-3.5 border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-200"
                >
                  <div className="relative shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white shadow-md">
                      {item.quantity}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.restaurantName}</p>
                    <p className="font-extrabold text-orange-600 text-base mt-1">
                      ৳{item.price * item.quantity}
                    </p>

                    {/* Controls */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center text-slate-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 hover:bg-orange-50 hover:text-orange-500 transition cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {cart.length > 0 && (
            <div className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/50 p-5 space-y-4">
              {/* Order Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span className="font-medium">{t("cart_subtotal", "Subtotal")}</span>
                  <span className="font-semibold text-slate-900">৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span className="font-medium">{t("cart_delivery_fee", "Delivery Fee")}</span>
                  <span className="font-semibold text-slate-900">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-100 pt-2.5 mt-1">
                  <span>{t("cart_total", "Total")}</span>
                  <span className="text-orange-600">৳{total}</span>
                </div>
              </div>

              {/* Promo hint */}
              <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3.5 py-2.5 border border-orange-100">
                <Tag className="h-4 w-4 text-orange-500 shrink-0" />
                <p className="text-xs text-orange-700 font-semibold">
                  Free delivery on orders above ৳500! 🎉
                </p>
              </div>

              {/* Checkout button */}
              <button
                type="button"
                onClick={handleCheckout}
                className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-700 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-orange-500/35 transition-all hover:shadow-orange-500/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl" />
                <Sparkles className="h-4 w-4 relative" />
                <span className="relative">{t("cart_checkout_btn", "Proceed to Checkout")}</span>
                <ArrowRight className="h-4 w-4 relative transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}