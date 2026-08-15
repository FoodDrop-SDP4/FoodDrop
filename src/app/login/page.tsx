"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, Utensils, ArrowRight, Store, Bike, User } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [isLoading, setIsLoading] = useState(false);

  // Role selector state (Default: CUSTOMER)
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "RESTAURANT_OWNER" | "RIDER">("CUSTOMER");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        if (data.user.role !== selectedRole) {
          alert(
            `⚠️ This account is registered as a ${data.user.role}, not a ${selectedRole.replace("_", " ")}! Please select the correct role.`
          );
          setIsLoading(false);
          return;
        }

        // Save in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Sync global navbar
        window.dispatchEvent(new Event("user-state-change"));

        alert(`🎉 Signed in successfully as ${selectedRole.replace("_", " ")}!`);

        if (selectedRole === "RESTAURANT_OWNER") {
          router.push("/restaurant");
        } else if (selectedRole === "RIDER") {
          router.push("/rider");
        } else {
          router.push(redirectUrl);
        }
      } else {
        alert(data.message || "Invalid email or password!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500";

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-200">
          <Utensils className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Welcome Back</h1>
        <p className="text-sm text-slate-500">Choose your role and sign in to continue.</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="mb-6 grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 p-1.5">
        <button
          type="button"
          onClick={() => setSelectedRole("CUSTOMER")}
          className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedRole === "CUSTOMER"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <User className="h-4 w-4 mb-1" />
          Customer
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole("RESTAURANT_OWNER")}
          className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedRole === "RESTAURANT_OWNER"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Store className="h-4 w-4 mb-1" />
          Restaurant
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole("RIDER")}
          className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedRole === "RIDER"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Bike className="h-4 w-4 mb-1" />
          Rider
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
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

        {/* Password */}
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Sign In as{" "}
              {selectedRole === "RESTAURANT_OWNER"
                ? "Owner"
                : selectedRole === "RIDER"
                ? "Rider"
                : "Customer"}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      {/* Dynamic Link Based on Selected Role */}
      <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-100 pt-6">
        {selectedRole === "CUSTOMER" && (
          <p>
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-orange-600 hover:underline">
              Sign Up
            </Link>
          </p>
        )}

        {selectedRole === "RESTAURANT_OWNER" && (
          <p>
            Want to register a new restaurant?{" "}
            <Link href="/restaurant/register" className="font-bold text-orange-600 hover:underline">
              Partner with us
            </Link>
          </p>
        )}

        {selectedRole === "RIDER" && (
          <p>
            Want to deliver with us?{" "}
            <Link href="/rider/register" className="font-bold text-orange-600 hover:underline">
              Apply as Rider
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 font-sans">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}