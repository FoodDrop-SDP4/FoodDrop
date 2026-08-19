"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Loader2,
  Utensils,
  ArrowRight,
  Store,
  Bike,
  User,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

type RoleType = "CUSTOMER" | "RESTAURANT_OWNER" | "RIDER";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("CUSTOMER");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 🚀 Preload remembered email on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("fooddrop_remembered_email");
      const savedRole = localStorage.getItem("fooddrop_remembered_role") as RoleType | null;
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
      if (savedRole && ["CUSTOMER", "RESTAURANT_OWNER", "RIDER"].includes(savedRole)) {
        setSelectedRole(savedRole);
      }
    } catch (e) {
      // quiet
    }
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        if (data.user.role !== selectedRole) {
          setErrorMsg(
            `This account is registered as ${data.user.role.replace(
              "_",
              " "
            )}, not ${selectedRole.replace(
              "_",
              " "
            )}. Please select the correct role tab.`
          );
          setIsLoading(false);
          return;
        }

        // 🚀 Handle Remember Me Persistence
        if (rememberMe) {
          localStorage.setItem("fooddrop_remembered_email", email.trim());
          localStorage.setItem("fooddrop_remembered_role", selectedRole);
        } else {
          localStorage.removeItem("fooddrop_remembered_email");
          localStorage.removeItem("fooddrop_remembered_role");
        }

        // Save in localStorage for immediate client hydration
        localStorage.setItem("user", JSON.stringify(data.user));

        // Sync global navbar state
        window.dispatchEvent(new Event("user-state-change"));

        if (selectedRole === "RESTAURANT_OWNER") {
          router.push("/restaurant");
        } else if (selectedRole === "RIDER") {
          router.push("/rider");
        } else {
          router.push(redirectUrl);
        }
      } else {
        setErrorMsg(data.message || "Invalid email or password!");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Something went wrong during sign in. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20";

  return (
    <div className="w-full max-w-md space-y-6">
      
      {/* Main Login Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur p-8 sm:p-10 shadow-2xl shadow-slate-200/60">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-7">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30">
            <Utensils className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Welcome Back</h1>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to access your secure account and dashboard.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="mb-6 grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/50">
          <button
            type="button"
            onClick={() => {
              setSelectedRole("CUSTOMER");
              setErrorMsg("");
            }}
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
            onClick={() => {
              setSelectedRole("RESTAURANT_OWNER");
              setErrorMsg("");
            }}
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
            onClick={() => {
              setSelectedRole("RIDER");
              setErrorMsg("");
            }}
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

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••"
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

          {/* 🌟 Remember Me & Security Options */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 hover:text-slate-900">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
              />
              <span>Remember me on this device</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-[11px] font-bold text-slate-500 hover:text-orange-600 cursor-pointer transition"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 active:scale-98 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>
                  Sign In as{" "}
                  {selectedRole === "RESTAURANT_OWNER"
                    ? "Restaurant Owner"
                    : selectedRole === "RIDER"
                    ? "Rider"
                    : "Customer"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Dynamic Sign Up Links */}
        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-100 pt-6">
          {selectedRole === "CUSTOMER" && (
            <p>
              Don't have a customer account?{" "}
              <Link href="/register" className="font-bold text-orange-600 hover:underline">
                Create Account
              </Link>
            </p>
          )}

          {selectedRole === "RESTAURANT_OWNER" && (
            <p>
              Want to partner your kitchen?{" "}
              <Link href="/restaurant/register" className="font-bold text-orange-600 hover:underline">
                Register Restaurant
              </Link>
            </p>
          )}

          {selectedRole === "RIDER" && (
            <p>
              Want to deliver and earn with FoodDrop?{" "}
              <Link href="/rider/register" className="font-bold text-orange-600 hover:underline">
                Apply as Rider
              </Link>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 flex items-center justify-center px-4 py-16 font-sans">
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