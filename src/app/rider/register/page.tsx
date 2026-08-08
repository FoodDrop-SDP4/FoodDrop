"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bike, User, Mail, Lock, Phone, MapPin, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";

export default function RiderRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: "Motorcycle",
    vehicleNumber: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rider/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "RIDER",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save user to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-state-change"));
        router.push("/rider");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pt-24 pb-16">
      <div className="mx-auto max-w-xl px-6">
        
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 mb-6 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mb-3">
              <Bike className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Become a FoodDrop Rider</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">Deliver food, earn daily money & set your own hours!</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Rakibul Islam"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    placeholder="rider@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Vehicle Type Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Vehicle Type</label>
              <div className="grid grid-cols-3 gap-2">
                {["Motorcycle", "Bicycle", "Walking"].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setFormData({ ...formData, vehicleType: type })}
                    className={`rounded-2xl border py-2.5 text-xs font-bold transition ${
                      formData.vehicleType === type
                        ? "border-orange-600 bg-orange-600 text-white shadow-md shadow-orange-200"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {type === "Motorcycle" ? "🏍️ Bike" : type === "Bicycle" ? "🚲 Cycle" : "🚶 Walk"}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Number (If Motorcycle) */}
            {formData.vehicleType === "Motorcycle" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Registration Number</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. DHAKA METRO-HA 12-3456"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>
            )}

            {/* Address */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Present Address / Area</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Mirpur, Dhaka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-orange-600 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:opacity-70 mt-4"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Register as Rider"}
            </button>

          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already registered as a Rider?{" "}
            <Link href="/login" className="font-bold text-orange-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}