"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Bike,
  UserCircle,
  LogOut,
  Utensils,
  ShoppingBag,
  Package,
  MapPin,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { User } from "../../types";
import { isSoundEnabled, toggleSoundEnabled } from "../../lib/sound";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  // Scroll detection for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleToggleSound = () => {
    const next = toggleSoundEnabled();
    setSoundOn(next);
  };

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
    setUserMenuOpen(false);
    window.dispatchEvent(new Event("user-state-change"));
    router.push("/");
  };

  const homeHref =
    user?.role === "RIDER"
      ? "/rider"
      : user?.role === "RESTAURANT_OWNER"
      ? "/restaurant"
      : "/";

  const roleColor =
    user?.role === "RIDER"
      ? "text-sky-500"
      : user?.role === "RESTAURANT_OWNER"
      ? "text-violet-500"
      : "text-orange-500";

  const roleBg =
    user?.role === "RIDER"
      ? "from-sky-500/20 to-blue-500/10 border-sky-500/30"
      : user?.role === "RESTAURANT_OWNER"
      ? "from-violet-500/20 to-purple-500/10 border-violet-500/30"
      : "from-orange-500/20 to-amber-500/10 border-orange-500/30";

  return (
    <nav
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/80"
          : "bg-white/90 backdrop-blur-md border-b border-slate-100"
      }`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        {/* ── Logo ─────────────────────────────────── */}
        <Link href={homeHref} className="flex items-center gap-2.5 group shrink-0">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-105">
            <Utensils className="h-4.5 w-4.5" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Food<span className="text-orange-500">Drop</span>
          </span>
        </Link>

        {/* ── Right Controls ───────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Guest */}
          {!user && (
            <>
              <Link
                href="/restaurant/register"
                className="hidden items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-orange-600 lg:flex"
              >
                <Store className="h-3.5 w-3.5" />
                <span>{t("nav_partner", "Partner with us")}</span>
              </Link>

              <Link
                href="/rider/register"
                className="hidden items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-orange-600 lg:flex"
              >
                <Bike className="h-3.5 w-3.5" />
                <span>{t("nav_ride", "Ride with us")}</span>
              </Link>

              {/* Cart */}
              <button
                type="button"
                onClick={openCart}
                id="navbar-cart-button"
                className="relative flex items-center gap-1.5 rounded-xl bg-orange-50 px-3.5 py-2.5 text-xs font-bold text-orange-600 transition-all hover:bg-orange-100 hover:shadow-md hover:shadow-orange-500/15 active:scale-95 cursor-pointer border border-orange-100"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav_cart", "Cart")}</span>
                {totalCartItems > 0 && (
                  <span className="animate-count flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-[10px] font-black text-white shadow-md shadow-orange-500/40">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {/* Sign In */}
              <Link
                href="/login"
                id="navbar-signin-button"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg hover:from-orange-600 hover:to-orange-700 active:scale-95"
              >
                <UserCircle className="h-4 w-4" />
                <span>{t("nav_signin", "Sign In")}</span>
              </Link>
            </>
          )}

          {/* Customer */}
          {user?.role === "CUSTOMER" && (
            <>
              <Link
                href="/orders"
                className="hidden items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:bg-orange-50 hover:text-orange-600 md:flex border border-slate-200/80"
              >
                <Package className="h-3.5 w-3.5 text-orange-500" />
                <span>{t("nav_my_orders", "My Orders")}</span>
              </Link>

              <Link
                href="/profile/addresses"
                className="hidden items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:bg-orange-50 hover:text-orange-600 lg:flex border border-slate-200/80"
              >
                <MapPin className="h-3.5 w-3.5 text-orange-500" />
                <span>{t("nav_addresses", "Addresses")}</span>
              </Link>

              {/* Cart */}
              <button
                type="button"
                onClick={openCart}
                className="relative flex items-center gap-1.5 rounded-xl bg-orange-50 px-3.5 py-2.5 text-xs font-bold text-orange-600 transition-all hover:bg-orange-100 hover:shadow-md hover:shadow-orange-500/15 active:scale-95 cursor-pointer border border-orange-100"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav_cart", "Cart")}</span>
                {totalCartItems > 0 && (
                  <span className="animate-count flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-[10px] font-black text-white shadow-md shadow-orange-500/40">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 rounded-xl bg-gradient-to-br ${roleBg} px-3 py-2 text-xs font-bold border transition-all hover:scale-[1.02] cursor-pointer`}
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-orange-100`}>
                    <UserCircle className={`h-4 w-4 ${roleColor}`} />
                  </div>
                  <span className="hidden sm:inline text-slate-700 max-w-[80px] truncate">{user.name}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white shadow-xl border border-slate-100 p-2 z-50 animate-fade-up">
                    <div className="px-3 py-2 mb-1 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-orange-600 font-medium">Customer Account</p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <Package className="h-4 w-4" />
                      {t("nav_my_orders", "My Orders")}
                    </Link>
                    <Link
                      href="/profile/addresses"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      {t("nav_addresses", "Addresses")}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer mt-1 border-t border-slate-100 pt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("nav_signout", "Sign Out")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Restaurant Owner */}
          {user?.role === "RESTAURANT_OWNER" && (
            <>
              <Link
                href="/restaurant"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 px-3.5 py-2.5 text-xs font-bold text-violet-700 transition-all hover:shadow-md border border-violet-100"
              >
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav_owner_dashboard", "Dashboard")}</span>
              </Link>

              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
                <UserCircle className="h-4 w-4 text-violet-600" />
                <span className="max-w-[80px] truncate">{user.name}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-xl bg-red-50 p-2.5 text-red-500 transition-all hover:bg-red-100 hover:scale-105 cursor-pointer border border-red-100"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Rider */}
          {user?.role === "RIDER" && (
            <>
              <Link
                href="/rider"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 px-3.5 py-2.5 text-xs font-bold text-sky-700 transition-all hover:shadow-md border border-sky-100"
              >
                <Bike className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav_rider_dashboard", "Dashboard")}</span>
              </Link>

              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
                <UserCircle className="h-4 w-4 text-sky-600" />
                <span className="max-w-[80px] truncate">{user.name}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-xl bg-red-50 p-2.5 text-red-500 transition-all hover:bg-red-100 hover:scale-105 cursor-pointer border border-red-100"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={soundOn ? t("sound_on_tip", "Audio: ON") : t("sound_off_tip", "Audio: MUTED")}
            className={`flex items-center justify-center rounded-xl p-2.5 transition-all active:scale-90 cursor-pointer ${
              soundOn
                ? "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100"
                : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
}