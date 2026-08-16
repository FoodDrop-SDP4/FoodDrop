"use client";

import { useState, FormEvent, Suspense } from "react";
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
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import AuthLayout from "../../components/layout/AuthLayout";

type RoleType = "CUSTOMER" | "RESTAURANT_OWNER" | "RIDER";

const ROLE_CONFIG = {
  CUSTOMER: {
    icon: User,
    label: "Customer",
    emoji: "🛍️",
    gradient: "from-orange-500 to-amber-500",
    glow: "shadow-orange-500/30",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    activeRing: "ring-orange-500/30",
  },
  RESTAURANT_OWNER: {
    icon: Store,
    label: "Restaurant",
    emoji: "🏪",
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/30",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    activeRing: "ring-violet-500/30",
  },
  RIDER: {
    icon: Bike,
    label: "Rider",
    emoji: "🛵",
    gradient: "from-sky-500 to-blue-600",
    glow: "shadow-sky-500/30",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    activeRing: "ring-sky-500/30",
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("CUSTOMER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
            `This account is registered as ${data.user.role.replace("_", " ")}, not ${selectedRole.replace("_", " ")}. Please select the matching role above.`
          );
          setIsLoading(false);
          return;
        }

        localStorage.setItem("user", JSON.stringify(data.user));
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
      setErrorMsg("Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleConf = ROLE_CONFIG[selectedRole];

  return (
    <AuthLayout>
      <div className="flex flex-col justify-center h-full p-6 sm:p-10 md:p-12 overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden mb-7">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-md shadow-orange-500/30">
              <Utensils className="h-4 w-4" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Food<span className="text-orange-600">Drop</span>
            </span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-orange-600 flex items-center gap-1 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("login_back_home", "Home")}
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Headline */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("login_welcome_back", "Welcome back")} 👋
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-1.5">
              {t("login_welcome_desc", "Choose your role and sign in to continue.")}
            </p>
          </div>

          {/* Role Switcher */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2.5">
              {t("login_sign_in_as", "Sign In As")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["CUSTOMER", "RESTAURANT_OWNER", "RIDER"] as RoleType[]).map((role) => {
                const conf = ROLE_CONFIG[role];
                const isActive = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => { setSelectedRole(role); setErrorMsg(""); }}
                    className={`relative flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer border-2 ${
                      isActive
                        ? `${conf.border} ${conf.bg} ${conf.text} shadow-lg ${conf.glow} scale-[1.03] ring-4 ${conf.activeRing}`
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${conf.gradient} text-white shadow-md`}>
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                    )}
                    <span className="text-xl leading-none">{conf.emoji}</span>
                    <span>{t(`role_${role.toLowerCase()}`, conf.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <p className="text-xs font-semibold text-red-700 leading-snug">{errorMsg}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                {t("login_email", "Email Address")}
              </label>
              <div className="relative group">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium w-full rounded-2xl bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-600">
                  {t("login_password", "Password")}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPassword ? t("login_hide", "Hide") : t("login_show", "Show")}
                </button>
              </div>
              <div className="relative group">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium w-full rounded-2xl bg-slate-50 py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-semibold">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-md accent-orange-600 cursor-pointer"
                />
                {t("login_remember", "Remember this device")}
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-sm font-extrabold text-white cursor-pointer disabled:opacity-60 transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 8px 28px rgba(249,115,22,0.4)" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("login_verifying", "Verifying...")}</span>
                </>
              ) : (
                <>
                  <span className="text-lg leading-none">{ROLE_CONFIG[selectedRole].emoji}</span>
                  <span>
                    {t("login_btn_submit", "Sign In as")} {t(`role_${selectedRole.toLowerCase()}`, ROLE_CONFIG[selectedRole].label)}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            {selectedRole === "CUSTOMER" && (
              <p className="text-xs text-slate-500">
                {t("login_new_to_app", "New to FoodDrop?")}{" "}
                <Link href="/register" className="font-extrabold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1">
                  {t("login_create_customer", "Create Account")} <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            )}
            {selectedRole === "RESTAURANT_OWNER" && (
              <p className="text-xs text-slate-500">
                {t("login_want_partner", "Want to list your restaurant?")}{" "}
                <Link href="/restaurant/register" className="font-extrabold text-violet-600 hover:text-violet-700 hover:underline inline-flex items-center gap-1">
                  {t("login_register_restaurant", "Register Restaurant")} <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            )}
            {selectedRole === "RIDER" && (
              <p className="text-xs text-slate-500">
                {t("login_want_rider", "Want to earn with us?")}{" "}
                <Link href="/rider/register" className="font-extrabold text-sky-600 hover:text-sky-700 hover:underline inline-flex items-center gap-1">
                  {t("login_apply_rider", "Apply as Rider")} <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <main
      className="min-h-screen bg-gradient-to-br from-slate-100 via-orange-50/30 to-amber-50/20 flex items-center justify-center px-4 py-12 md:py-16"
      style={{ fontFamily: "var(--font-sans)" }}
    >
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