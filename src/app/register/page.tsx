"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Loader2 } from "lucide-react";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verificationId, setVerificationId] = useState("");
  const [otp, setOtp] = useState("");

  const phoneRegex = /^(01[3-9]\d{8})$/;
  const emailRegex = /^\S+@\S+\.\S+$/;
  const nameNoDigitRegex = /^([^\d]*)$/;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!nameNoDigitRegex.test(form.name)) {
      alert("Name must not contain digits.");
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(String(form.email).trim().toLowerCase())) {
      alert("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (!phoneRegex.test(String(form.phone).trim())) {
      alert("Mobile number must be a valid Bangladeshi number (013-019) with 11 digits.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: "CUSTOMER",
        }),
      });

      const data = await res.json();

      if (res.status === 202 && data.requiresOtp) {
        setOtpSent(true);
        setVerificationId(data.verificationId || "");
        if (data.debugOtpCode) {
          alert(`OTP (dev): ${data.debugOtpCode}`);
        } else {
          alert("OTP sent to your mobile. Enter the code to verify.");
        }
      } else if (res.ok) {
        // Registration without OTP flow
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-state-change"));
        router.push("/");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!verificationId || !otp) return alert("Provide OTP");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-state-change"));
        alert("Registration complete. You are signed in.");
        router.push("/");
      } else {
        alert(data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong verifying OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center px-4 py-16 font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <section className="hidden md:flex flex-col justify-center px-6 py-12 rounded-3xl bg-gradient-to-br from-orange-600 to-pink-500 text-white shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Welcome to FoodDrop</h2>
                <p className="text-sm opacity-90">Order quickly — delicious food delivered to your door.</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold">Simple, reliable ordering</h3>
            <p className="mt-3 text-sm opacity-90">Create an account and start ordering from nearby restaurants. Track orders in real time and enjoy special offers.</p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <User className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">Create Customer Account</h1>
            <p className="text-sm text-slate-500">Sign up to order food quickly — no address required now.</p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-slate-200 bg-gray-50 py-3.5 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-gray-50 py-3.5 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full rounded-xl border border-slate-200 bg-gray-50 py-3.5 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create password"
                    className="w-full rounded-xl border border-slate-200 bg-gray-50 py-3.5 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-700 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Enter OTP</label>
                <input
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="4 digit code"
                  className="w-full rounded-xl border border-slate-200 bg-gray-50 py-3.5 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-700 disabled:opacity-70"
                >
                  Verify OTP
                </button>

                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setVerificationId(""); setOtp(""); }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}
