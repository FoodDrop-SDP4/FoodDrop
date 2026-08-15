"use client";

import Link from "next/link";
import { ShoppingBag, Star, Store, Tag } from "lucide-react";
import { MenuItem } from "../../types";
import { useCartStore } from "../../store/useCartStore";

interface FoodCardProps {
  food: MenuItem;
  onSelect?: (food: MenuItem) => void;
}

export default function FoodCard({ food, onSelect }: FoodCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const hasDiscount = Boolean(food.originalPrice && food.originalPrice > food.price);
  const discountPercent = hasDiscount
    ? Math.round((((food.originalPrice || 0) - food.price) / (food.originalPrice || 1)) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelect && onSelect(food)}
      className={`group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-500/10 ${
        onSelect ? "cursor-pointer" : ""
      }`}
    >
      {/* Food Image Container */}
      <div className="relative h-52 overflow-hidden block">
        <img
          src={food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
          alt={food.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Price & Discount Badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <div className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-slate-900 shadow-sm backdrop-blur flex items-center gap-1">
            {hasDiscount && (
              <span className="line-through text-slate-400 font-normal text-[11px]">
                ৳{food.originalPrice}
              </span>
            )}
            <span className={hasDiscount ? "text-rose-600 font-black" : "text-slate-900"}>
              ৳{food.price}
            </span>
          </div>

          {hasDiscount && (
            <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-black text-white shadow-md shadow-rose-600/30">
              🔥 {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Category Tag */}
        {food.category && (
          <div className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur">
            <Tag className="h-3 w-3 text-orange-400" />
            {food.category}
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1.5 text-xs font-bold text-slate-900 shadow-sm backdrop-blur">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {food.totalReviews && food.totalReviews > 0 ? (
            <>
              <span>{food.avgRating?.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-normal">({food.totalReviews})</span>
            </>
          ) : (
            <span className="text-[11px] text-orange-600 font-black">New</span>
          )}
        </div>
      </div>

      {/* Food Info & Action */}
      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/restaurants/${food.restaurantId}`}
          onClick={(e) => onSelect && e.stopPropagation()}
          className="line-clamp-1 text-lg font-bold text-slate-900 transition hover:text-orange-600"
        >
          {food.name}
        </Link>

        {food.restaurant && (
          <Link
            href={`/restaurants/${food.restaurantId}`}
            onClick={(e) => onSelect && e.stopPropagation()}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-900"
          >
            <Store className="h-3.5 w-3.5 shrink-0 text-orange-500" />
            <span className="truncate font-medium">{food.restaurant.name}</span>
          </Link>
        )}

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {food.description}
        </p>

        <div className="mt-auto pt-5">
          <button
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-orange-600 active:scale-[0.98]"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
