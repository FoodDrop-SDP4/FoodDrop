"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Store, ArrowRight, Clock, Flame, Star, MapPin, ChevronRight } from "lucide-react";
import { MenuItem } from "../../types";
import { useLanguage } from "../../lib/i18n/LanguageContext";

interface HeroSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  suggestions: MenuItem[];
  onSelectSuggestion: (food: MenuItem) => void;
}

const FLOATING_FOODS = [
  { emoji: "🍔", label: "Burger", top: "15%", left: "8%", delay: "0s", size: "text-4xl" },
  { emoji: "🍕", label: "Pizza", top: "20%", right: "10%", delay: "1.5s", size: "text-5xl" },
  { emoji: "🍱", label: "Biryani", bottom: "20%", left: "6%", delay: "0.8s", size: "text-3xl" },
  { emoji: "🧁", label: "Dessert", bottom: "15%", right: "8%", delay: "2s", size: "text-4xl" },
  { emoji: "🌮", label: "Tacos", top: "50%", left: "2%", delay: "1.2s", size: "text-3xl" },
  { emoji: "🍜", label: "Noodles", top: "40%", right: "3%", delay: "0.5s", size: "text-3xl" },
];

const LIVE_STATS = [
  { icon: Clock, value: "28 min", label: "Avg Delivery", color: "text-amber-400" },
  { icon: Store, value: "120+", label: "Restaurants", color: "text-emerald-400" },
  { icon: Star, value: "4.9★", label: "Rating", color: "text-sky-400" },
];

const TRENDING = ["Kacchi Biryani", "Zinger Burger", "Margherita Pizza", "Chocolate Cake"];

export default function HeroSearch({
  searchQuery,
  onSearchChange,
  suggestions,
  onSelectSuggestion,
}: HeroSearchProps) {
  const { t } = useLanguage();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setInputFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: MenuItem) => {
    onSelectSuggestion(item);
    setShowSuggestions(false);
    setInputFocused(false);
  };

  const handleClear = () => {
    onSearchChange("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div
      className="relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-24 text-center sm:px-12"
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(234, 88, 12, 0.18) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 20%, rgba(249, 115, 22, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 60% 80%, rgba(251, 191, 36, 0.08) 0%, transparent 40%),
          linear-gradient(135deg, #0c0c14 0%, #13131f 50%, #1a0a00 100%)
        `,
      }}
    >
      
      {/* Animated background orbs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(234,88,12,0.18)", animation: "orb-float-1 12s ease-in-out infinite" }} />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(251,191,36,0.12)", animation: "orb-float-2 15s ease-in-out infinite" }} />

      {/* Floating food emojis */}
      {FLOATING_FOODS.map((food, i) => (
        <div
          key={i}
          className="absolute hidden lg:flex items-center justify-center pointer-events-none select-none"
          style={{
            top: food.top,
            left: (food as any).left,
            right: (food as any).right,
            bottom: food.bottom,
            animation: `float-slow ${5 + i * 0.7}s ease-in-out infinite`,
            animationDelay: food.delay,
          }}
        >
          <div className="rounded-2xl px-3 py-2 flex flex-col items-center gap-1" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <span className={food.size}>{food.emoji}</span>
            <span className="text-[10px] font-semibold text-white/60">{food.label}</span>
          </div>
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-3xl space-y-8">
        
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 border border-orange-500/30 px-4 py-1.5 text-xs font-bold text-orange-300 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
          </span>
          {t("hero_badge", "Live • Delivering in Dhaka Now")}
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
          {t("hero_title_1", "Craving something")}{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(-45deg, #f97316, #ea580c, #fbbf24, #f59e0b)",
              backgroundSize: "300% 300%",
              animation: "gradient-shift 5s ease infinite",
            }}
          >
            {t("hero_title_2", "delicious?")}
          </span>
        </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-300/80 leading-relaxed">
            {t(
              "hero_subtitle",
              "Order from your favorite restaurants and get it delivered right to your doorstep in minutes."
            )}
          </p>
        </div>

        {/* Live Stats Bar */}
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {LIVE_STATS.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <div className="text-left">
                <p className="text-xs font-black text-white">{value}</p>
                <p className="text-[10px] text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search Box */}
        <div ref={searchRef} className="relative mx-auto w-full max-w-xl">
          <div
            className={`flex w-full items-center overflow-hidden rounded-2xl bg-white transition-all duration-300 ${
              inputFocused
                ? "shadow-2xl shadow-orange-500/30 ring-2 ring-orange-500/50"
                : "shadow-2xl shadow-black/30"
            }`}
          >
            <div className={`flex h-14 w-14 items-center justify-center shrink-0 transition-colors ${inputFocused ? "text-orange-500" : "text-slate-400"}`}>
              <Search className="h-5 w-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder={t("search_placeholder", "Search for food or restaurants...")}
              value={searchQuery}
              onFocus={() => {
                setInputFocused(true);
                if (searchQuery.trim()) setShowSuggestions(true);
              }}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (e.target.value.trim()) setShowSuggestions(true);
                else setShowSuggestions(false);
              }}
              className="h-14 w-full bg-transparent px-2 font-semibold text-slate-900 outline-none placeholder:text-slate-400 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-slate-600 mr-1 cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              className="h-10 rounded-xl px-6 sm:px-8 font-bold text-white text-sm shrink-0 mr-2 cursor-pointer transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 16px rgba(249,115,22,0.4)" }}
            >
              {t("search_btn", "Search")}
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-3 z-50 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl text-left">
              <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {t("search_suggestions", "Suggestions")}
              </p>
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="flex w-full items-center justify-between p-3 rounded-xl hover:bg-orange-50 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                      alt={item.name}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Store className="h-3 w-3 text-orange-500" />
                        {item.restaurant?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-orange-600">৳{item.price}</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 transition" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Trending Tags */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            {t("hero_trending", "Trending:")}
          </span>
          {TRENDING.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => onSearchChange(tag)}
              className="rounded-full px-3 py-1 text-[11px] font-semibold text-white/70 hover:text-white transition cursor-pointer"
              style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,80 C360,20 1080,20 1440,80 L1440,80 L0,80 Z" fill="#f8fafc" />
        </svg>
      </div>
    </div>
  );
}
