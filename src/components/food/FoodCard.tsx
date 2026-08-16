"use client";

import Link from "next/link";
import { ShoppingBag, Star, Store, Tag, Heart, Clock } from "lucide-react";
import { MenuItem } from "../../types";
import { useCartStore } from "../../store/useCartStore";
import { playAddToCartSound } from "../../lib/sound";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { useState } from "react";

interface FoodCardProps {
  food: MenuItem;
  onSelect?: (food: MenuItem) => void;
}

export default function FoodCard({ food, onSelect }: FoodCardProps) {
  const { t } = useLanguage();
  const addToCart = useCartStore((state) => state.addToCart);
  const [isWished, setIsWished] = useState(false);
  const [ripple, setRipple] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    playAddToCartSound();
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      imageUrl: food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      quantity: 1,
      restaurantId: food.restaurantId,
      restaurantName: food.restaurant?.name || "Restaurant",
    });
  };

  const handleWish = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWished((prev) => !prev);
  };

  const hasDiscount = Boolean(food.originalPrice && food.originalPrice > food.price);
  const discountPercent = hasDiscount
    ? Math.round((((food.originalPrice || 0) - food.price) / (food.originalPrice || 1)) * 100)
    : 0;

  const ratingStars = Math.min(5, Math.max(1, Math.round(food.avgRating || 5)));

  return (
    <div
      onClick={() => onSelect && onSelect(food)}
      className={`food-card group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100/80 ${
        onSelect ? "cursor-pointer" : ""
      }`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* ── Image Container ──────────────────────── */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"}
          alt={food.name}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
          }}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Dark gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleWish}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer ${
            isWished
              ? "bg-red-500 text-white shadow-lg shadow-red-500/40 scale-110"
              : "bg-white/90 text-slate-400 hover:bg-red-50 hover:text-red-500"
          }`}
        >
          <Heart className={`h-4 w-4 transition-all ${isWished ? "fill-current" : ""}`} />
        </button>

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-2.5 py-1 text-[11px] font-black text-white shadow-lg shadow-red-500/30">
              🔥 {discountPercent}% {t("food_off", "OFF")}
            </span>
          </div>
        )}

        {/* Rating badge */}
        <div className="absolute right-3 bottom-3">
          <div className="flex items-center gap-1 rounded-xl bg-black/50 backdrop-blur-md px-2.5 py-1.5 text-xs font-bold text-white">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{food.avgRating?.toFixed(1) || "5.0"}</span>
            {food.totalReviews && food.totalReviews > 0 && (
              <span className="text-white/60 font-normal">({food.totalReviews})</span>
            )}
          </div>
        </div>

        {/* Category pill at bottom-left */}
        {food.category && (
          <div className="absolute left-3 bottom-3">
            <span className="flex items-center gap-1 rounded-lg bg-black/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white/90">
              <Tag className="h-2.5 w-2.5 text-orange-400" />
              {food.category}
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body ──────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5">

        {/* Price row */}
        <div className="flex items-center gap-2 mb-3">
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through font-medium">
              ৳{food.originalPrice}
            </span>
          )}
          <span className={`text-xl font-extrabold ${hasDiscount ? "text-rose-600" : "text-slate-900"}`}>
            ৳{food.price}
          </span>
          {!hasDiscount && (
            <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Clock className="h-3 w-3" />
              30 min
            </span>
          )}
        </div>

        {/* Name */}
        <Link
          href={`/restaurants/${food.restaurantId}`}
          onClick={(e) => onSelect && e.stopPropagation()}
          className="line-clamp-1 text-base font-extrabold text-slate-900 transition-colors hover:text-orange-600 leading-snug"
        >
          {food.name}
        </Link>

        {/* Restaurant */}
        {food.restaurant && (
          <Link
            href={`/restaurants/${food.restaurantId}`}
            onClick={(e) => onSelect && e.stopPropagation()}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-slate-600"
          >
            <Store className="h-3.5 w-3.5 shrink-0 text-orange-500" />
            <span className="truncate font-medium">{food.restaurant.name}</span>
          </Link>
        )}

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {food.description}
        </p>

        {/* Add to Cart button */}
        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={handleAddToCart}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:from-orange-500 hover:to-orange-700 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] cursor-pointer group/btn"
          >
            {/* Ripple effect */}
            {ripple && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-4 w-4 rounded-full bg-white/30 animate-[ripple_0.6s_ease-out]" />
              </span>
            )}
            <ShoppingBag className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
            <span>{t("food_add_to_cart", "Add to Cart")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
