"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Phone, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Calculate password strength
  const getPasswordStrength = () => {
    const len = formData.password.length;
    if (len === 0) return { label: "", color: "bg-slate-200", percent: 0 };
    if (len < 6) return { label: "Too Short", color: "bg-rose-500", percent: 33 };
    if (len < 10) return { label: "Good", color: "bg-amber-500", percent: 66 };
    return { label: "Strong", color: "bg-emerald-500", percent: 100 };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // Front-end Validations
    const nameRegex = /^[a-zA-Z\s.-]+$/;
    if (!nameRegex.test(formData.name.trim())) {
      setErrorMsg("Name cannot contain numbers or special characters.");
      setIsLoading(false);
      return;
    }

    const bdPhoneRegex = /^(?:01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(formData.phone.trim())) {
      setErrorMsg("Please enter a valid 11-digit Bangladeshi phone number (e.g. 01712345678).");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("Please accept the Terms of Service & Privacy Policy to register.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "CUSTOMER",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          localStorage.setItem(
            "user",
            JSON.stringify({
              name: formData.name.trim(),
              email: formData.email.trim().toLowerCase(),
              role: "CUSTOMER",
            })
          );
        }

        window.dispatchEvent(new Event("user-state-change"));
        alert("🎉 Registration Successful! Welcome to FoodDrop.");
        window.location.href = "/";
      } else {
        setErrorMsg(data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Register Error:", error);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100 p-4 font-sans py-12">
      <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur p-8 sm:p-10 shadow-2xl shadow-slate-200/60 border border-slate-200/80 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30">
            <User className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Create Account</h2>
          <p className="text-xs font-medium text-slate-500">
            Sign up as a customer to start ordering food in minutes.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Rakibul Islam"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className={inputClassName}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className={inputClassName}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Mobile Number</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="017XXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
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
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
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

            {/* Password Strength Meter */}
            {formData.password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 text-right">
                  Strength: <span className="text-slate-700">{strength.label}</span>
                </p>
              </div>
            )}
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
              />
              <span>I agree to FoodDrop Terms of Service & Privacy Policy</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Sign Up & Start Ordering</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs font-medium text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-orange-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}