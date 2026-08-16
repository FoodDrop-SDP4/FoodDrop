"use client";

import React from "react";
import Link from "next/link";
import { Utensils, ArrowLeft, ShieldCheck, Zap, Star, Sparkles } from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

const HERO_STATS = [
  { icon: Zap, label: "Express 30-Min Delivery", sub: "Fresh & piping hot", color: "text-amber-400", bg: "bg-amber-500/15" },
  { icon: Star, label: "4.9/5 Average Rating", sub: "Loved by 50,000+ food lovers", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  { icon: ShieldCheck, label: "256-Bit Encrypted", sub: "Bank-level security for your data", color: "text-sky-400", bg: "bg-sky-500/15" },
];

const FLOATING_CARDS = [
  { emoji: "🍔", name: "BBQ Burger", price: "৳290", rating: "4.9", top: "15%", right: "5%", delay: "0s" },
  { emoji: "🍱", name: "Kacchi Biryani", price: "৳340", rating: "5.0", top: "55%", left: "3%", delay: "1.5s" },
  { emoji: "🍕", name: "Pepperoni Pizza", price: "৳750", rating: "4.8", bottom: "18%", right: "4%", delay: "0.8s" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[680px] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-black/20 grid lg:grid-cols-12" style={{ fontFamily: "var(--font-sans)" }}>
      
      {/* ── LEFT PANEL ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 overflow-hidden text-white"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(234, 88, 12, 0.2) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 20%, rgba(249, 115, 22, 0.12) 0%, transparent 50%),
            linear-gradient(135deg, #0c0c14 0%, #13131f 60%, #1a0a00 100%)
          `,
        }}
      >
        {/* Animated orbs */}
        <div className="animate-orb-1 absolute -top-20 -left-20 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="animate-orb-2 absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Floating food cards */}
        {FLOATING_CARDS.map((card, i) => (
          <div
            key={i}
            className="absolute hidden xl:block rounded-2xl p-3 pointer-events-none"
            style={{
              top: card.top,
              left: (card as any).left,
              right: (card as any).right,
              bottom: card.bottom,
              animation: `float-slow ${5 + i}s ease-in-out infinite`,
              animationDelay: card.delay,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{card.emoji}</span>
              <div>
                <p className="text-[11px] font-bold text-white">{card.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-orange-400">{card.price}</span>
                  <span className="text-[10px] text-amber-400">⭐ {card.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Logo & Back */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-xl shadow-orange-500/40 group-hover:scale-105 transition-transform">
              <Utensils className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-white">
              Food<span className="text-orange-400">Drop</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white px-3 py-1.5 rounded-full transition"
            style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("login_back_home", "Back")}
          </Link>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 border border-orange-500/30 px-4 py-1.5 text-xs font-bold text-orange-300">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            {t("login_hero_badge", "Dhaka's #1 Food Delivery App")}
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              {t("login_hero_heading_1", "Hot meals,")}<br />
              <span className="bg-clip-text text-transparent bg-brand-gradient-animated" style={{ backgroundSize: "200% 200%" }}>
                {t("login_hero_heading_2", "lightning speed.")}
              </span>
            </h2>
            <p className="text-sm text-slate-300/80 leading-relaxed max-w-xs">
              {t("login_hero_desc", "Order your favorite kacchi, burgers, and gourmet dishes or manage your partner dashboard.")}
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            {HERO_STATS.map(({ icon: Icon, label, sub, color, bg }) => (
              <div key={label} className="flex items-center gap-3.5 rounded-2xl p-3.5 transition" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Secured & Trusted
          </span>
          <span>© 2026 FoodDrop</span>
        </div>
      </div>

      {/* ── RIGHT PANEL (Children) ─────────────────────────────── */}
      <div className="lg:col-span-7 bg-white relative">
        {children}
      </div>
    </div>
  );
}
