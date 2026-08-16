"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Utensils,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Store,
  Bike,
} from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import AuthLayout from "../../components/layout/AuthLayout";

export default function RegisterPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200", text: "" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1)
      return {
        score: 1,
        label: t("reg_pwd_weak", "Weak"),
        color: "bg-rose-500",
        text: "text-rose-600",
      };
    if (score === 2 || score === 3)
      return {
        score: 2,
        label: t("reg_pwd_medium", "Medium"),
        color: "bg-amber-500",
        text: "text-amber-600",
      };
    return {
      score: 3,
      label: t("reg_pwd_strong", "Strong & Secure"),
      color: "bg-emerald-500",
      text: "text-emerald-600",
    };
  }, [formData.password, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Front-end Validations
    const nameRegex = /^[a-zA-Z\s.-]+$/;
    if (!nameRegex.test(formData.name.trim())) {
      setErrorMsg(t("reg_err_name", "Full Name cannot contain numbers or special symbols."));
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMsg(t("reg_err_email", "Please enter a valid email address."));
      setIsLoading(false);
      return;
    }

    const bdPhoneRegex = /^(?:01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(formData.phone.trim())) {
      setErrorMsg(t("reg_err_phone", "Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678)."));
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg(t("reg_err_pwd", "Password must be at least 6 characters long."));
      setIsLoading(false);
      return;
    }

    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setErrorMsg(t("reg_err_pwd_match", "Passwords do not match. Please check again."));
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg(t("reg_err_terms", "Please agree to the Terms of Service & Privacy Policy."));
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: "CUSTOMER",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(t("reg_success", "Account created successfully! Redirecting..."));

        // Save user to localStorage
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

        // Notify Navbar
        window.dispatchEvent(new Event("user-state-change"));

        // Redirect to homepage
        setTimeout(() => {
          window.location.href = "/";
        }, 1200);
      } else {
        setErrorMsg(data.message || t("reg_err_failed", "Registration failed! Please try again."));
      }
    } catch (error) {
      console.error("Register Error:", error);
      setErrorMsg(t("reg_err_network", "Something went wrong. Please check your network connection."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-orange-50/40 to-amber-50/30 flex items-center justify-center px-4 py-10 md:py-16 font-sans">
      <AuthLayout>
        <div className="flex flex-col justify-center h-full p-6 sm:p-10 md:p-12 overflow-y-auto">
          {/* Mobile Top Header */}
          <div className="flex items-center justify-between lg:hidden mb-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-500/30">
                <Utensils className="h-4 w-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 font-sans">
                Food<span className="text-orange-600">Drop</span>
              </span>
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t("login_back_home", "Home")}
            </Link>
          </div>

          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/70 text-orange-700 text-[11px] font-bold mb-2">
                <Sparkles className="h-3.5 w-3.5" /> {t("reg_badge", "Customer Registration")}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {t("reg_title", "Create your account")} ✨
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {t(
                  "reg_subtitle",
                  "Fill in your details to start ordering your favorite foods."
                )}
              </p>
            </div>

            {/* Other Account Options */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1.5 border border-slate-200/60 text-center">
              <Link
                href="/restaurant/register"
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[11px] font-bold text-slate-600 hover:text-orange-600 hover:bg-white transition"
              >
                <Store className="h-3.5 w-3.5" /> {t("reg_reg_kitchen", "Register Kitchen")}
              </Link>
              <Link
                href="/rider/register"
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[11px] font-bold text-slate-600 hover:text-orange-600 hover:bg-white transition"
              >
                <Bike className="h-3.5 w-3.5" /> {t("reg_become_rider", "Become a Rider")}
              </Link>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t("reg_full_name", "Full Name")}
                </label>
                <div className="relative group">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    type="text"
                    placeholder={t("reg_full_name_placeholder", "e.g. Tanvir Ahmed")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t("reg_email", "Email Address")}
                </label>
                <div className="relative group">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t("reg_phone", "Mobile Number")}
                </label>
                <div className="relative group">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400 group-focus-within:text-orange-600 transition-colors">
                    <Phone className="h-4 w-4" />
                    <span className="text-xs font-bold text-slate-400 border-r border-slate-200 pr-2">
                      +880
                    </span>
                  </div>
                  <input
                    type="tel"
                    placeholder="1712345678"
                    value={
                      formData.phone.startsWith("+880")
                        ? formData.phone.slice(4)
                        : formData.phone
                    }
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.startsWith("880")) val = val.slice(3);
                      setFormData({
                        ...formData,
                        phone: val.startsWith("0") ? val : "0" + val,
                      });
                    }}
                    required
                    maxLength={11}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-24 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {t("reg_password", "Password")}
                  </label>
                  {formData.password && (
                    <span className={`text-[11px] font-bold ${passwordStrength.text}`}>
                      {passwordStrength.label}
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t(
                      "reg_pwd_placeholder",
                      "Create a strong password (min 6 chars)"
                    )}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                  <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator Bar */}
                {formData.password && (
                  <div className="mt-2 flex gap-1.5 h-1.5 w-full">
                    <div
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 1 ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 2 ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 3 ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t("reg_confirm_password", "Confirm Password")}
                </label>
                <div className="relative group">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("reg_confirm_pwd_placeholder", "Repeat password")}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-slate-600 leading-tight cursor-pointer select-none"
                >
                  {t("reg_agree_terms", "I agree to FoodDrop's")}{" "}
                  <span className="text-orange-600 font-bold hover:underline">
                    {t("reg_terms", "Terms of Service")}
                  </span>{" "}
                  &{" "}
                  <span className="text-orange-600 font-bold hover:underline">
                    {t("reg_privacy", "Privacy Policy")}
                  </span>
                  .
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-600/25 transition-all duration-200 hover:from-orange-500 hover:to-amber-500 hover:shadow-orange-600/40 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{t("reg_creating", "Creating your account...")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("reg_submit_btn", "Create Customer Account")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="pt-5 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
              {t("reg_already_have", "Already have an account?")}{" "}
              <Link
                href="/login"
                className="font-bold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1"
              >
                {t("reg_signin_here", "Sign In here")} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    </main>
  );
}