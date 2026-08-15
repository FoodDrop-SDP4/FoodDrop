"use client";

import { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, Star, Tag } from "lucide-react";
import { MenuItem } from "../../types";
import { useCartStore } from "../../store/useCartStore";

interface FoodDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  restaurantName?: string;
}

export default function FoodDetailModal({
  item,
  isOpen,
  onClose,
  restaurantName = "Restaurant",
}: FoodDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      quantity,
      restaurantId: item.restaurantId,
      restaurantName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header Image */}
        <div className="relative h-64 w-full">
          <img
            src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
            alt={item.name}
            className="h-full w-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur transition hover:bg-slate-900"
          >
            <X className="h-5 w-5" />
          </button>

          {item.category && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur">
              <Tag className="h-3.5 w-3.5 text-orange-400" />
              <span>{item.category}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900">{item.name}</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{restaurantName}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-orange-600">৳{item.price}</span>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {item.description || "No description provided for this delicious item."}
          </p>

          {/* Quantity Controls & Add to Cart */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm transition hover:bg-orange-50 hover:text-orange-600"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-black text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm transition hover:bg-orange-50 hover:text-orange-600"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Add to Cart • ৳{item.price * quantity}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
