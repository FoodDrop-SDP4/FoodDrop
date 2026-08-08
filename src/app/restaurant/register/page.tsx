"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Store, User, Mail, Lock, Phone, MapPin, Loader2, Utensils } from "lucide-react";

export default function RestaurantRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // ফর্ম স্টেট
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/restaurants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: restaurantName,
          ownerName,
          email,
          password,
          phone,
          address,
        }),
      });

      const data = await res.json();

     if (res.ok) {
        // ১. লোকাল স্টোরেজে ইউজার ডাটা সেভ
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // 🚀 ২. নেভবারকে নোটিফাই করা যে নতুন ইউজার লগইন করেছে
        window.dispatchEvent(new Event("user-state-change"));

        alert("🎉 রেস্টুরেন্ট সফলভাবে রেজিস্টার্ড হয়েছে!");
        router.push("/restaurant");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500";

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-200">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Partner with FoodDrop</h1>
          <p className="text-sm text-slate-500">Register your kitchen and start receiving orders instantly.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Restaurant Name */}
            <div className="relative">
              <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="text"
                placeholder="Restaurant Name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className={inputClassName}
              />
            </div>

            {/* Owner Name */}
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="text"
                placeholder="Owner Full Name"
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
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClassName}
            />
          </div>

          {/* Address */}
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              type="text"
              placeholder="Restaurant Address (e.g., Banani, Dhaka)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClassName}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Setting up your kitchen...
              </>
            ) : (
              <>
                <Utensils className="h-5 w-5" />
                Register Restaurant & Launch Dashboard
              </>
            )}
          </button>
        </form>

      </div>
    </main>
  );
}