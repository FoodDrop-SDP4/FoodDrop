"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bike,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "../../../lib/i18n/LanguageContext";
import AuthLayout from "../../../components/layout/AuthLayout";

export default function RiderRegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: "Motorcycle",
    vehicleNumber: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200", text: "" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score += 1;
    if (score <= 1) return { score: 1, label: t("reg_pwd_weak", "Weak"), color: "bg-rose-500", text: "text-rose-600" };
    if (score === 2) return { score: 2, label: t("reg_pwd_medium", "Medium"), color: "bg-amber-500", text: "text-amber-600" };
    return { score: 3, label: t("reg_pwd_strong", "Strong"), color: "bg-emerald-500", text: "text-emerald-600" };
  }, [formData.password, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Regex Validations
    const nameRegex = /^[a-zA-Z\s.-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const bdPhoneRegex = /^(?:01[3-9]\d{8})$/;

    if (!nameRegex.test(formData.name.trim())) {
      setError(t("reg_err_name", "Full Name can only contain letters and spaces. Numbers are not allowed."));
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(formData.email.trim())) {
      setError(t("reg_err_email", "Please enter a valid email address."));
      setIsLoading(false);
      return;
    }

    if (!bdPhoneRegex.test(formData.phone.trim())) {
      setError(t("reg_err_phone", "Please enter a valid 11-digit Bangladeshi phone number."));
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t("reg_err_pwd", "Password must be at least 6 characters long."));
      setIsLoading(false);
      return;
    }

    if (formData.vehicleType === "Motorcycle" && !formData.vehicleNumber.trim()) {
      setError(t("reg_rider_err_vehicle", "Please enter your vehicle registration number."));
      setIsLoading(false);
      return;
    }

    if (!formData.address.trim()) {
      setError(t("reg_rider_err_area", "Please enter your preferred operating area / address."));
      setIsLoading(false);
      return;
    }

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
        setSuccess(t("reg_rider_success", "🎉 Rider application submitted! Loading your rider dashboard..."));
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-state-change"));
        setTimeout(() => {
          router.push("/rider");
        }, 1000);
      } else {
        setError(data.message || t("reg_err_failed", "Registration failed"));
      }
    } catch (err) {
      console.error(err);
      setError(t("reg_err_network", "Something went wrong. Please try again."));
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
                <Bike className="h-4 w-4" />
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold mb-2">
                <Bike className="h-3.5 w-3.5" /> {t("reg_rider_badge", "Rider Hero Registration")}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {t("reg_rider_title", "Become a FoodDrop Rider 🛵")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {t("reg_rider_subtitle", "Fill in your details to start delivering and earning today.")}
              </p>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 leading-snug">{error}</div>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="flex-1 leading-snug">{success}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t("reg_full_name", "Full Name")}
                </label>
                <div className="relative group">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    required
                    type="text"
                    placeholder={t("reg_full_name_placeholder", "e.g. Rakibul Islam")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {t("reg_email", "Email Address")}
                  </label>
                  <div className="relative group">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                    <input
                      required
                      type="email"
                      placeholder="rider@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      maxLength={11}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">{t("reg_password", "Account Password")}</label>
                  {formData.password && (
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
                    placeholder={t("reg_pwd_placeholder", "Create a strong password")}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              {/* Vehicle Type Selection Cards */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t("reg_rider_vehicle", "Delivery Vehicle Type")}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { type: "Motorcycle", label: t("reg_rider_moto", "Motorbike"), icon: "🏍️" },
                    { type: "Bicycle", label: t("reg_rider_bike", "Bicycle"), icon: "🚲" },
                    { type: "Walking", label: t("reg_rider_walk", "Walking"), icon: "🚶" },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.type}
                      onClick={() => setFormData({ ...formData, vehicleType: item.type })}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        formData.vehicleType === item.type
                          ? "border-orange-600 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20 shadow-xs"
                          : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-xl mb-1">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Number (Motorcycle only) */}
              {formData.vehicleType === "Motorcycle" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {t("reg_rider_plate", "Vehicle Number Plate")}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={t("reg_rider_plate_pl", "e.g. DHAKA METRO-HA 12-3456")}
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              )}

              {/* Area / Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t("reg_rider_area", "Preferred Delivery Area / City")}
                </label>
                <div className="relative group">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    required
                    type="text"
                    placeholder={t("reg_rider_area_pl", "e.g. Mirpur, Banani, Dhanmondi, Dhaka")}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-600/25 transition-all duration-200 hover:from-orange-500 hover:to-amber-500 hover:shadow-orange-600/40 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t("reg_rider_creating", "Processing rider profile...")}</span>
                  </>
                ) : (
                  <>
                    <Bike className="h-4 w-4" />
                    <span>{t("reg_rider_submit", "Apply as Rider Hero")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="pt-5 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
              {t("reg_rider_already", "Already registered as a Rider?")}{" "}
              <Link
                href="/login"
                className="font-bold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1"
              >
                {t("reg_rider_signin", "Sign In to Rider App")} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    </main>
  );
}