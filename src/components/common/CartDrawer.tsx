// File: src/components/common/CartDrawer.tsx
"use client";

import { useCartStore } from "../../store/useCartStore";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Utensils } from "lucide-react";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeFromCart } = useCartStore();
  const router = useRouter();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 60 : 0;
  const total = subtotal + deliveryFee;

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // 🚀 রিডাইরেক্ট প্যারামিটার সহ লগইন পেজে পাঠানো
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const handleBrowseFoods = () => {
    closeCart();
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeCart} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          <div className="flex items-center justify-between border-b px-6 py-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-bold text-slate-900">Your Cart ({cart.length})</h2>
            </div>
            <button onClick={closeCart} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500 shadow-inner">
                  <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBrowseFoods}
                  className="flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 active:scale-95 cursor-pointer"
                >
                  <Utensils className="h-4 w-4" />
                  <span>Browse Foods</span>
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 relative">
                  <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.restaurantName}</p>
                    <p className="font-black text-orange-600 text-sm mt-1">৳{item.price * item.quantity}</p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-500 hover:text-orange-600">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-500 hover:text-orange-600">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-slate-100 p-6 space-y-4 bg-slate-50/50">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-slate-900">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 border-t pt-2">
                  <span>Total</span>
                  <span className="text-orange-600">৳{total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}