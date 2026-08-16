"use client";

import Link from "next/link";
import { Star, Store, ShoppingBag, TrendingUp, Award } from "lucide-react";
import { MenuItem } from "../../types";
import { useCartStore } from "../../store/useCartStore";
import { playAddToCartSound } from "../../lib/sound";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useState } from "react";

interface TrendingSectionProps {
  items: MenuItem[];
}

const RANK_BADGES = [
  { bg: "from-amber-400 to-yellow-500", label: "#1", shadow: "shadow-amber-500/40", icon: "🥇" },
  { bg: "from-slate-400 to-gray-500",   label: "#2", shadow: "shadow-slate-400/40",  icon: "🥈" },
  { bg: "from-orange-600 to-amber-700", label: "#3", shadow: "shadow-orange-600/40", icon: "🥉" },
];

export default function TrendingSection({ items }: TrendingSectionProps) {
  const { t } = useLanguage();
  const addToCart = useCartStore((s) => s.addToCart);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (!items || items.length === 0) return null;

  const handleAdd = (item: MenuItem) => {
    playAddToCartSound();
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      quantity: 1,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurant?.name || "Restaurant",
    });
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1500);
  };

  return (
    <section className="bg-white py-10 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {t("trending_section_title", "🔥 Trending Now")}
              </h2>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {t("trending_section_sub", "Most ordered dishes this week")}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
            <Award className="h-3.5 w-3.5" />
            Live Rankings
          </div>
        </div>

        {/* Horizontal Scroll Row */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {items.slice(0, 10).map((item, i) => {
            const rankBadge = RANK_BADGES[i] ?? { bg: "from-slate-500 to-slate-600", label: `#${i + 1}`, shadow: "shadow-slate-500/30", icon: "⭐" };
            const hasDiscount = Boolean(item.originalPrice && item.originalPrice > item.price);
            const isAdded = addedIds.has(item.id);

            return (
              <div
                key={item.id}
                className="group shrink-0 w-56 flex flex-col rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/80 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Rank Badge */}
                  <div className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-xl bg-gradient-to-br ${rankBadge.bg} px-2.5 py-1.5 shadow-lg ${rankBadge.shadow}`}>
                    <span className="text-sm leading-none">{rankBadge.icon}</span>
                    <span className="text-[11px] font-black text-white">
                      {i === 0
                        ? t("trending_badge_1", "#1 Best Seller")
                        : i === 1
                        ? t("trending_badge_2", "#2 Most Ordered")
                        : t("trending_badge_3", "Trending")}
                    </span>
                  </div>

                  {/* Discount badge */}
                  {hasDiscount && (
                    <div className="absolute top-3 right-3 rounded-lg bg-rose-500 px-2 py-1 text-[10px] font-black text-white shadow-md">
                      -{Math.round((((item.originalPrice || 0) - item.price) / (item.originalPrice || 1)) * 100)}%
                    </div>
                  )}

                  {/* Rating */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/50 backdrop-blur-sm px-2 py-1 text-[11px] font-bold text-white">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {item.avgRating?.toFixed(1) || "5.0"}
                    {item.totalReviews ? <span className="text-white/60">({item.totalReviews})</span> : null}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Price */}
                  <div className="flex items-center gap-1.5 mb-2">
                    {hasDiscount && (
                      <span className="text-xs text-slate-400 line-through">৳{item.originalPrice}</span>
                    )}
                    <span className={`text-base font-extrabold ${hasDiscount ? "text-rose-600" : "text-slate-900"}`}>
                      ৳{item.price}
                    </span>
                  </div>

                  <Link
                    href={`/restaurants/${item.restaurantId}`}
                    className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-1 hover:text-orange-600 transition mb-1.5"
                  >
                    {item.name}
                  </Link>

                  {item.restaurant && (
                    <p className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mb-3">
                      <Store className="h-3 w-3 text-orange-500 shrink-0" />
                      <span className="truncate">{item.restaurant.name}</span>
                    </p>
                  )}

                  {/* Order count indicator */}
                  {item.totalReviews && item.totalReviews > 0 && (
                    <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {item.totalReviews * 12}+ {t("trending_orders", "orders")} {t("filter_sort_popular", "this week") === "Most Popular" ? "this week" : ""}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    className={`mt-auto flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-extrabold transition-all cursor-pointer ${
                      isAdded
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                        : "text-white hover:opacity-90"
                    }`}
                    style={isAdded ? {} : { background: "linear-gradient(135deg, #0f172a, #1e293b)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {isAdded ? "✓ Added!" : t("food_add_to_cart", "Add to Cart")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
