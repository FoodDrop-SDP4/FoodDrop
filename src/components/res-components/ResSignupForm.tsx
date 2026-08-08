"use client";

import type { ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const phoneRegex = /^(01[3-9]\d{8})$/; // exactly 11 digits, starts with 013-019
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const signupSchema = z.object({
  businessName: z
    .string()
    .min(3, "Business name must be at least 3 characters / রেস্তোরাঁর নাম অন্তত ৩ অক্ষরের হতে হবে"),
  businessType: z.enum(["Restaurant", "HomeCook", "Bakery"]),
  ownerFirstName: z
    .string()
    .min(2, "First name is required / নামের প্রথম অংশ দিন")
    .regex(/^([^\d]*)$/, "Name must not contain digits / নামের মধ্যে সংখ্যা থাকতে পারবে না"),
  ownerLastName: z
    .string()
    .min(2, "Last name is required / নামের শেষ অংশ দিন")
    .regex(/^([^\d]*)$/, "Name must not contain digits / নামের মধ্যে সংখ্যা থাকতে পারবে না"),
  email: z.string().email("Invalid email address / সঠিক ইমেইল দিন"),
  phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number (e.g., 017XXXXXXXX) / সঠিক মোবাইল নম্বর দিন"),
  password: z
    .string()
    .min(8, "Password must be strong / শক্তিশালী পাসওয়ার্ড দিন")
    .regex(strongPasswordRegex, "Password must be strong / শক্তিশালী পাসওয়ার্ড দিন"),
  tradeLicenseNumber: z
    .string()
    .min(5, "Trade License Number is required / ট্রেড লাইসেন্স নম্বর দিন"),
  tradeLicenseDoc: z.any().refine((value) => {
    if (typeof value === "string") return value.trim().length > 0;
    if (value instanceof File) return value.size > 0;
    return false;
  }, "Trade license document is required / ট্রেড লাইসেন্স ডকুমেন্ট দিন"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

type StepKey = 1 | 2 | 3;

const stepMeta: Record<StepKey, { title: string; subtitle: string }> = {
  1: { title: "Basic Info", subtitle: "বেসিক তথ্য" },
  2: { title: "Contact & Security", subtitle: "যোগাযোগ ও নিরাপত্তা" },
  3: { title: "Legal & Verification", subtitle: "আইনি তথ্য ও যাচাইকরণ" },
};

const highlights = [
  {
    icon: Clock3,
    title: "Real-time KDS",
    subtitle: "রিয়েল-টাইম KDS",
    text: "Manage live kitchen order flow, timing, and workflow without delays.",
  },
  {
    icon: ShieldCheck,
    title: "0% Commission for 30 Days",
    subtitle: "৩০ দিনের জন্য ০% কমিশন",
    text: "Start with a low-risk launch and scale your brand faster.",
  },
  {
    icon: Sparkles,
    title: "Instant Promo Control",
    subtitle: "তাৎক্ষণিক প্রমো নিয়ন্ত্রণ",
    text: "Drive more orders with targeted deals and menu updates in seconds.",
  },
];

export default function ResSignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepKey>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      businessName: "",
      businessType: "Restaurant",
      ownerFirstName: "",
      ownerLastName: "",
      email: "",
      phone: "",
      password: "",
      tradeLicenseNumber: "",
      tradeLicenseDoc: undefined,
    },
  });

  const progress = useMemo(() => (currentStep / 3) * 100, [currentStep]);

  const stepFields: Record<StepKey, (keyof SignupFormValues)[]> = {
    1: ["businessName", "businessType", "ownerFirstName", "ownerLastName"],
    2: ["email", "phone", "password"],
    3: ["tradeLicenseNumber", "tradeLicenseDoc"],
  };

  const validateCurrentStep = async () => {
    const fields = stepFields[currentStep];
    return await trigger(fields);
  };

  const goNext = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3) as StepKey);
  };

  const goPrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as StepKey);
  };

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/res-partner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          tradeLicenseDocumentName: data.tradeLicenseDoc instanceof File ? data.tradeLicenseDoc.name : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed.");
      }

      router.push("/res-dashboard");
    } catch (error) {
      console.error("Restaurant partner registration failed:", error);
      alert(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("tradeLicenseDoc", file, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-600/20 ring-1 ring-pink-500/20">
              <span className="text-base font-black text-pink-400">FD</span>
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-white">FoodDrop</p>
            </div>
          </div>

          <a
            href="/res-login"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-pink-400/60 hover:bg-white/10"
          >
            Login / লগইন
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
        <section className="relative overflow-hidden rounded-[30px] border border-pink-500/10 bg-gradient-to-br from-slate-900 via-slate-950 to-pink-950 p-6 shadow-[0_30px_80px_rgba(236,72,153,0.15)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(244,114,182,0.12),transparent_32%)]" />
          <div className="absolute -left-10 top-12 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute -right-10 bottom-10 h-44 w-44 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-pink-200">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              partner onboarding
            </div>

            <h1 className="mt-6 max-w-lg text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
              Grow your food business with FoodDrop.
              <span className="mt-2 block text-pink-400">আপনার খাবারের ব্যবসা FoodDrop-এ শুরু করুন।</span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Take orders, manage menus, and scale your kitchen from one streamlined dashboard.
              <span className="mt-2 block text-slate-200">একটি সিম্পল ড্যাশবোর্ডে অর্ডার, মেনু ও দোকানের ব্যবসা বাড়ান।</span>
            </p>

            <div className="mt-8 space-y-4">
              {highlights.map(({ icon: Icon, title, subtitle, text }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500/15 text-pink-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-white">{title}</h2>
                    </div>
                    <p className="mt-1 text-xs font-medium text-pink-200">{subtitle}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              <BadgeCheck className="h-5 w-5 text-emerald-300" />
              <span>Approval in 24 hours • Better margins • More visibility</span>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.4)] sm:p-7">
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-pink-600">Registration</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Partner Signup</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 ring-1 ring-pink-100">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>

              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Step {currentStep} of 3</span>
                  <span>{stepMeta[currentStep].title}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">{stepMeta[currentStep].subtitle}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {currentStep === 1 && (
                <div className="space-y-4 animate-[fadeIn_0.25s_ease]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Business Name / ব্যবসার নাম</label>
                    <input
                      {...register("businessName")}
                      placeholder="FoodDrop Kitchen"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                    />
                    {errors.businessName && (
                      <p className="mt-1 text-xs text-red-500">{errors.businessName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Business Type / ব্যবসার ধরন</label>
                    <select
                      {...register("businessType")}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                    >
                      <option value="Restaurant">Restaurant</option>
                      <option value="HomeCook">HomeCook</option>
                      <option value="Bakery">Bakery</option>
                    </select>
                    {errors.businessType && (
                      <p className="mt-1 text-xs text-red-500">{errors.businessType.message}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Owner First Name / মালিকের নাম (প্রথম)</label>
                      <input
                        {...register("ownerFirstName")}
                        placeholder="Rahim"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                      />
                      {errors.ownerFirstName && (
                        <p className="mt-1 text-xs text-red-500">{errors.ownerFirstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Owner Last Name / মালিকের নাম (শেষ)</label>
                      <input
                        {...register("ownerLastName")}
                        placeholder="Karim"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                      />
                      {errors.ownerLastName && (
                        <p className="mt-1 text-xs text-red-500">{errors.ownerLastName.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 animate-[fadeIn_0.25s_ease]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Email / ইমেইল</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone / ফোন</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder="017XXXXXXXX"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Password / পাসওয়ার্ড</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        {...register("password")}
                        type="password"
                        placeholder="Create a strong password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 animate-[fadeIn_0.25s_ease]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Trade License Number / ট্রেড লাইসেন্স নম্বর</label>
                    <div className="relative">
                      <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        {...register("tradeLicenseNumber")}
                        placeholder="TL-2024-0001"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                      />
                    </div>
                    {errors.tradeLicenseNumber && (
                      <p className="mt-1 text-xs text-red-500">{errors.tradeLicenseNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Trade License Document / ট্রেড লাইসেন্স ডকুমেন্ট</label>
                    <div className="flex w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center transition hover:border-pink-400 hover:bg-pink-50/50">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="trade-license-upload"
                      />
                      <label htmlFor="trade-license-upload" className="flex cursor-pointer flex-col items-center gap-2 text-sm text-slate-600">
                        <FileText className="h-6 w-6 text-pink-600" />
                        <span className="font-medium text-slate-700">Upload your document / ডকুমেন্ট আপলোড করুন</span>
                        <span className="text-xs text-slate-500">PDF, JPG, or PNG</span>
                      </label>
                    </div>
                    {errors.tradeLicenseDoc && (
                      <p className="mt-1 text-xs text-red-500">{String(errors.tradeLicenseDoc.message)}</p>
                    )}
                    {getValues("tradeLicenseDoc") instanceof File && (
                      <p className="mt-2 text-xs text-emerald-600">
                        Selected: {(getValues("tradeLicenseDoc") as File).name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={currentStep === 1}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous / আগে
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition hover:bg-pink-500"
                  >
                    Next / পরবর্তী
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Registering... / রেজিস্ট্রেশন হচ্ছে...
                      </>
                    ) : (
                      <>
                        Submit & Register / জমা দিন ও রেজিস্টার করুন
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
