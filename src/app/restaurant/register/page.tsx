"use client";

import { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Loader2,
  Utensils,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "../../../lib/i18n/LanguageContext";
import AuthLayout from "../../../components/layout/AuthLayout";

export default function RestaurantRegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");

  // Password strength
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "bg-slate-200", text: "" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score += 1;
    if (score <= 1) return { score: 1, label: t("reg_pwd_weak", "Weak"), color: "bg-rose-500", text: "text-rose-600" };
    if (score === 2) return { score: 2, label: t("reg_pwd_medium", "Medium"), color: "bg-amber-500", text: "text-amber-600" };
    return { score: 3, label: t("reg_pwd_strong", "Strong"), color: "bg-emerald-500", text: "text-emerald-600" };
  }, [password, t]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Regex & Validations
    const nameRegex = /^[a-zA-Z\s.-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const bdPhoneRegex = /^(?:01[3-9]\d{8})$/;

    if (!restaurantName.trim()) {
      setErrorMsg(t("reg_rest_err_name", "Please enter a valid restaurant name."));
      setIsLoading(false);
      return;
    }

    if (!nameRegex.test(ownerName.trim())) {
      setErrorMsg(t("reg_err_name", "Owner Name can only contain letters and spaces. Numbers are not allowed."));
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setErrorMsg(t("reg_err_email", "Please enter a valid email address."));
      setIsLoading(false);
      return;
    }

    if (!bdPhoneRegex.test(phone.trim())) {
      setErrorMsg(t("reg_err_phone", "Please enter a valid 11-digit Bangladeshi mobile number."));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t("reg_err_pwd", "Password must be at least 6 characters long."));
      setIsLoading(false);
      return;
    }

    if (!address.trim()) {
      setErrorMsg(t("reg_rest_err_addr", "Please enter your restaurant location / address."));
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
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(t("reg_rest_success", "🎉 Restaurant registered successfully! Launching dashboard..."));
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-state-change"));
        setTimeout(() => {
          router.push("/restaurant");
        }, 1000);
      } else {
        setErrorMsg(data.message || t("reg_err_failed", "Registration failed!"));
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMsg(t("reg_err_network", "Something went wrong! Please check your network and try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-orange-50/40 to-amber-50/30 flex items-center justify-center px-4 py-10 md:py-16 font-sans">
      <AuthLayout>
        <div className="flex flex-col justify-center h-full p-6 sm:p-10 md:p-12 overflow-y-auto bg-white">
          {/* Mobile Top Header */}
          <div className="flex items-center justify-between lg:hidden mb-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-500/30">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 font-sans">
                Food<span className="text-orange-600">Drop</span>
              </span>
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t("login_back_home", "Back Home")}
            </Link>
          </div>

          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold mb-2">
                <Store className="h-3.5 w-3.5" /> {t("reg_rest_badge", "Restaurant Registration")}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {t("reg_rest_title", "List your restaurant 🍽️")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {t("reg_rest_subtitle", "Register your kitchen details to unlock the merchant dashboard.")}
              </p>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 leading-snug">{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="flex-1 leading-snug">{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Restaurant & Owner Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {t("reg_rest_name", "Restaurant Name")}
                  </label>
                  <div className="relative group">
                    <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                    <input
                      required
                      type="text"
                      placeholder={t("reg_rest_name_pl", "e.g. Sultan's Dine")}
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {t("reg_owner_name", "Owner Full Name")}
                  </label>
                  <div className="relative group">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                    <input
                      required
                      type="text"
                      placeholder={t("reg_owner_name_pl", "e.g. Sultan Ahmed")}
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {t("reg_biz_email", "Business Email")}
                  </label>
                  <div className="relative group">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                    <input
                      required
                      type="email"
                      placeholder="kitchen@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {t("reg_phone", "Phone Number")}
                  </label>
                  <div className="relative group">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                    <input
                      required
                      type="tel"
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={11}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                    />
                  </div>
                </div>
              </div>

              {/* Password with Strength Indicator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">{t("reg_password", "Account Password")}</label>
                  {password && (
                    <span className={`text-[11px] font-bold ${passwordStrength.text}`}>
                      {passwordStrength.label}
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder={t("reg_pwd_placeholder", "Create a secure password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
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
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t("reg_rest_addr", "Kitchen Address & Area")}
                </label>
                <div className="relative group">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    required
                    type="text"
                    placeholder={t("reg_rest_addr_pl", "e.g. House 14, Road 7, Dhanmondi 27, Dhaka")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-600/25 transition-all duration-200 hover:from-amber-400 hover:to-orange-500 hover:shadow-orange-600/40 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t("reg_rest_creating", "Setting up your kitchen portal...")}</span>
                  </>
                ) : (
                  <>
                    <Utensils className="h-4 w-4" />
                    <span>{t("reg_rest_submit", "Register Restaurant & Go Live")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="pt-5 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
              {t("reg_rest_already", "Already registered your kitchen?")}{" "}
              <Link
                href="/login"
                className="font-bold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1"
              >
                {t("reg_rest_signin", "Sign In to Dashboard")} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    </main>
  );
}