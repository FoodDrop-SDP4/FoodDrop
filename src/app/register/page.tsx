"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Phone, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "CUSTOMER", // কাস্টমার রোল সরাসরি সেট করা হচ্ছে
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // 🚀 ১. লোকাল স্টোরেজে ইউজার ডাটা সেভ (যদি এপিআই থেকে ইউজার অবজেক্ট ব্যাক আসে)
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          // এপিআই যদি সরাসরি user না পাঠায়, ফ্রন্টএন্ড স্টেট থেকেই ডাটা সেট করা
          localStorage.setItem(
            "user",
            JSON.stringify({
              name: formData.name.trim(),
              email: formData.email.trim().toLowerCase(),
              role: "CUSTOMER",
            })
          );
        }

        // 🚀 ২. গ্লোবাল নেভবারকে সিঙ্ক হতে বলা
        window.dispatchEvent(new Event("user-state-change"));

        alert("🎉 Registration Successful! Welcome aboard.");

        // 🚀 ৩. সরাসরি কাস্টমার ড্যাশবোর্ড / হোম পেজে রিডাইরেক্ট করা
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Create Account</h2>
        <p className="text-center text-sm font-medium text-slate-500 mb-6">
          Sign up as a customer to start ordering food.
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-center text-xs font-bold text-red-600 border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Full Name (Alphabet only)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Mobile (e.g. 01712345678)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="password"
              placeholder="Password (Min 6 characters)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs font-medium text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-orange-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}