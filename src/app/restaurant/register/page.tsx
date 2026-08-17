"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  ChefHat,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Loader2,
  Utensils,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { RestaurantType } from "../../../types";

export default function RestaurantRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Seller Type State (RESTAURANT vs HOMEMADE)
  const [sellerType, setSellerType] = useState<RestaurantType>("RESTAURANT");

  // ফর্ম স্টেট
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // 🚀 Regex & Validation Checks
    const nameRegex = /^[a-zA-Z\s.-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const bdPhoneRegex = /^(?:01[3-9]\d{8})$/;

    if (!restaurantName.trim()) {
      setErrorMsg(
        sellerType === "HOMEMADE"
          ? "Please enter your home kitchen or brand name."
          : "Please enter a valid restaurant name."
      );
      setIsLoading(false);
      return;
    }

    if (!nameRegex.test(ownerName.trim())) {
      setErrorMsg("Owner / Chef Name can only contain letters and spaces. Numbers are not allowed.");
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (!bdPhoneRegex.test(phone.trim())) {
      setErrorMsg("Please enter a valid 11-digit Bangladeshi mobile number (e.g., 01712345678).");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (!address.trim()) {
      setErrorMsg(
        sellerType === "HOMEMADE"
          ? "Please enter your kitchen / pick-up address."
          : "Please enter your restaurant address."
      );
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/restaurants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: restaurantName.trim(),
          ownerName: ownerName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
          address: address.trim(),
          restaurantType: sellerType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // ১. লোকাল স্টোরেজে ইউজার ডাটা সেভ
        localStorage.setItem("user", JSON.stringify(data.user));

        // 🚀 ২. নেভবারকে নোটিফাই করা যে নতুন ইউজার লগইন করেছে
        window.dispatchEvent(new Event("user-state-change"));

        alert(
          sellerType === "HOMEMADE"
            ? "🎉 হোম কিচেন সফলভাবে রেজিস্টার্ড হয়েছে! FoodDrop-এ স্বাগতম।"
            : "🎉 রেস্টুরেন্ট সফলভাবে রেজিস্টার্ড হয়েছে! FoodDrop-এ স্বাগতম।"
        );
        router.push("/restaurant");
      } else {
        setErrorMsg(data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMsg("Something went wrong! Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500";

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl shadow-slate-100">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-200">
            {sellerType === "HOMEMADE" ? (
              <ChefHat className="h-7 w-7" />
            ) : (
              <Store className="h-7 w-7" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Partner with FoodDrop
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Choose your kitchen model and start receiving orders from hungry customers.
          </p>
        </div>

        {/* 🌟 Seller Type Selector Cards */}
        <div className="mb-8">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-3 text-center">
            Select Your Business Type
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Commercial Restaurant Option */}
            <button
              type="button"
              onClick={() => setSellerType("RESTAURANT")}
              className={`relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left ${
                sellerType === "RESTAURANT"
                  ? "border-orange-600 bg-orange-50/40 shadow-md shadow-orange-500/10 ring-1 ring-orange-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-2.5 rounded-xl ${
                    sellerType === "RESTAURANT"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Store className="h-5 w-5" />
                </div>
                {sellerType === "RESTAURANT" && (
                  <CheckCircle2 className="h-5 w-5 text-orange-600 fill-orange-100" />
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Commercial Restaurant</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Physical restaurant, fast-food shop, cafe, or dine-in outlet.
              </p>
            </button>

            {/* 2. Homemade Food / Home Chef Option */}
            <button
              type="button"
              onClick={() => setSellerType("HOMEMADE")}
              className={`relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left ${
                sellerType === "HOMEMADE"
                  ? "border-emerald-600 bg-emerald-50/40 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-2.5 rounded-xl ${
                    sellerType === "HOMEMADE"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <ChefHat className="h-5 w-5" />
                </div>
                {sellerType === "HOMEMADE" && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Home Kitchen / Chef{" "}
                <span className="inline-block text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 ml-1">
                  Popular
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Authentic home-cooked meals, home catering, or homemade bakery.
              </p>
            </button>
          </div>
        </div>

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Restaurant / Kitchen Name */}
            <div className="relative">
              {sellerType === "HOMEMADE" ? (
                <ChefHat className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              ) : (
                <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              )}
              <input
                required
                type="text"
                placeholder={
                  sellerType === "HOMEMADE"
                    ? "Home Kitchen / Brand Name (e.g. Ammi's Kitchen)"
                    : "Restaurant Name (e.g. Sultan's Dine)"
                }
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className={inputClassName}
              />
            </div>

            {/* Owner / Chef Name */}
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="text"
                placeholder={
                  sellerType === "HOMEMADE" ? "Chef / Owner Full Name" : "Owner Full Name"
                }
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Email */}
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="text"
                placeholder="Mobile Number (e.g. 017XXXXXXXX)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-bold text-orange-600 hover:underline flex items-center gap-1"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" /> Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Show
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Create Password (Min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassName}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Address */}
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              type="text"
              placeholder={
                sellerType === "HOMEMADE"
                  ? "Kitchen Address (e.g., Road 4, Sector 7, Uttara)"
                  : "Restaurant Address (e.g., Banani 11, Dhaka)"
              }
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClassName}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-bold text-white shadow-lg transition disabled:opacity-70 ${
              sellerType === "HOMEMADE"
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                : "bg-orange-600 hover:bg-orange-700 shadow-orange-200"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Setting up your kitchen...
              </>
            ) : (
              <>
                {sellerType === "HOMEMADE" ? (
                  <ChefHat className="h-5 w-5" />
                ) : (
                  <Utensils className="h-5 w-5" />
                )}
                {sellerType === "HOMEMADE"
                  ? "Register Home Kitchen & Launch Dashboard"
                  : "Register Restaurant & Launch Dashboard"}
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered your kitchen?{" "}
          <Link href="/login" className="font-bold text-orange-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}