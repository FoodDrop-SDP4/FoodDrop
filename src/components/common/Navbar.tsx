"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Bike, UserCircle, LogOut, Utensils, ShoppingBag, Package, MapPin } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { User } from "../../types";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const cart = useCartStore((state) => state.cart);
  const openCart = useCartStore((state) => state.openCart);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const syncUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
          return;
        }
      }
    } catch (err) {
      // Fallback to localStorage if offline
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    syncUser();

    window.addEventListener("storage", syncUser);
    window.addEventListener("user-state-change", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("user-state-change", syncUser);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user-state-change"));
    router.push("/");
  };

  const homeHref =
    user?.role === "RIDER"
      ? "/rider"
      : user?.role === "RESTAURANT_OWNER"
      ? "/restaurant"
      : "/";

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-md md:px-12 font-sans">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* Logo */}
        <Link href={homeHref} className="flex items-center gap-2 text-2xl font-black tracking-tighter text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white shadow-md shadow-orange-200">
            <Utensils className="h-4 w-4" />
          </div>
          FoodDrop
        </Link>

        {/* Dynamic Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* 1. Guest Visitor */}
          {!user && (
            <>
              <Link href="/restaurant/register" className="hidden items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600 sm:flex">
                <Store className="h-4 w-4" />
                Partner with us
              </Link>

              <Link href="/rider/register" className="hidden items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600 sm:flex">
  <Bike className="h-4 w-4" />
  Ride with us
</Link>

              <button
                onClick={openCart}
                className="relative flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600 transition hover:bg-orange-100"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Cart</span>
                {totalCartItems > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[11px] font-black text-white shadow-sm">
                    {totalCartItems}
                  </span>
                )}
              </button>

              <Link href="/login" className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-orange-600">
                <UserCircle className="h-5 w-5" />
                Sign In
              </Link>
            </>
          )}

          {/* 2. Customer */}
          {user?.role === "CUSTOMER" && (
            <>
              {/* 🚀 Hi, [Name] ফেরত আনা হলো */}
              <div className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-800 sm:flex">
                <UserCircle className="h-4 w-4 text-orange-600" />
                <span>Hi, {user.name}</span>
              </div>

              <Link href="/orders" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600">
                <Package className="h-4 w-4 text-orange-500" />
                <span className="hidden md:inline">My Orders</span>
              </Link>

              <Link href="/profile/addresses" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span className="hidden md:inline">Addresses</span>
              </Link>

              <button
                onClick={openCart}
                className="relative flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600 transition hover:bg-orange-100"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Cart</span>
                {totalCartItems > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[11px] font-black text-white shadow-sm">
                    {totalCartItems}
                  </span>
                )}
              </button>

              <button onClick={handleLogout} title="Logout" className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

          {/* 3. Restaurant Owner */}
          {user?.role === "RESTAURANT_OWNER" && (
            <>
              <Link href="/restaurant" className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600 transition hover:bg-orange-100">
                <Store className="h-4 w-4" />
                Owner Dashboard
              </Link>

              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full">
                <UserCircle className="h-4 w-4 text-orange-600" />
                <span>{user.name}</span>
              </div>

              <button onClick={handleLogout} title="Logout" className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

          {/* 4. Rider */}
          {user?.role === "RIDER" && (
            <>
              <Link href="/rider" className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600 transition hover:bg-orange-100">
                <Bike className="h-4 w-4" />
                Rider Dashboard
              </Link>

              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full">
                <UserCircle className="h-4 w-4 text-orange-600" />
                <span>{user.name}</span>
              </div>

              <button onClick={handleLogout} title="Logout" className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}