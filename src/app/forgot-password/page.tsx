"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { triggerFireworks, triggerConfetti } from "../../lib/confetti";

type Step = "REQUEST_OTP" | "VERIFY_OTP" | "NEW_PASSWORD" | "SUCCESS";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("REQUEST_OTP");
  const [identifier, setIdentifier] = useState("");
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(600); // 10 minutes

  // Countdown timer for OTP
  useEffect(() => {
    if (step === "VERIFY_OTP" && countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // 1. Request Reset OTP
  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConfirmedEmail(data.email || identifier.trim());
        if (data.demoOtp) setDemoOtp(data.demoOtp);
        setCountdown(data.expiresInSeconds || 600);
        setStep("VERIFY_OTP");
        setSuccessMsg(data.message || "OTP code sent successfully!");
      } else {
        setErrorMsg(data.message || "Failed to send reset code. Please check your email.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: confirmedEmail,
          otpCode: otpCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep("NEW_PASSWORD");
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Invalid OTP code. Please check and try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Reset to New Password
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: confirmedEmail,
          otpCode: otpCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        triggerFireworks();
        triggerConfetti();
        setStep("SUCCESS");
      } else {
        setErrorMsg(data.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 flex items-center justify-center px-4 py-16 font-sans">
      <div className="w-full max-w-md space-y-6">
        
        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur p-8 sm:p-10 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
          
          {/* Top Accent Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

          {/* ========================================================
              STEP 1: REQUEST OTP (EMAIL)
             ======================================================== */}
          {step === "REQUEST_OTP" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30">
                  <KeyRound className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Forgot Password?
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Enter your registered email address or phone number and we’ll send you a 6-digit verification code.
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Registered Email or Phone
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="name@example.com or 017XXXXXXXX"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 active:scale-98 disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Sending reset code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 2: VERIFY 6-DIGIT OTP
             ======================================================== */}
          {step === "VERIFY_OTP" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30 animate-bounce">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Enter 6-Digit OTP
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  We've sent a 6-digit verification code to: <br />
                  <b className="text-slate-800">{confirmedEmail}</b>
                </p>
              </div>

              {/* Demo OTP Banner for Instant Testing */}
              {demoOtp && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-amber-900">Demo Reset OTP:</span>
                  </div>
                  <span className="font-mono text-base font-black tracking-widest bg-white px-3 py-1 rounded-xl border border-amber-300 text-amber-950 shadow-xs">
                    {demoOtp}
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">6-Digit Code</label>
                    <span className="text-[11px] font-bold text-slate-400">
                      Expires in: <span className="text-orange-600 font-mono">{formatTimer(countdown)}</span>
                    </span>
                  </div>
                  <input
                    required
                    maxLength={6}
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-[0.4em] font-mono text-xl font-black rounded-2xl border border-slate-200 bg-slate-50/60 py-3.5 text-slate-900 outline-none transition placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code & Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep("REQUEST_OTP")}
                  className="inline-flex items-center gap-1 font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Change Email
                </button>

                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Resend Code
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 3: SET NEW PASSWORD
             ======================================================== */}
          {step === "NEW_PASSWORD" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                  <Lock className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Create New Password
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Your identity has been verified. Enter your new strong password below.
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    New Password (Min. 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClassName}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password match indicator */}
                {newPassword && confirmPassword && (
                  <div className="text-[11px] font-bold flex items-center gap-1.5">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match perfectly
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password & Finish</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================
              STEP 4: SUCCESS
             ======================================================== */}
          {step === "SUCCESS" && (
            <div className="space-y-6 text-center py-4 animate-in zoom-in-95">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-100 animate-bounce">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl font-black text-slate-900">
                  Password Reset Successful! 🎉
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Your account password has been updated securely. You can now sign in using your new password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 active:scale-98 cursor-pointer"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
