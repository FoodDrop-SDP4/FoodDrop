"use client";

import { useState, useEffect } from "react";
import { X, SlidersHorizontal, Star, Tag, ArrowUpDown, CheckSquare, Square, RefreshCw } from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export type SortOption = "default" | "price_asc" | "price_desc" | "rating" | "popular";

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  discountOnly: boolean;
  sortBy: SortOption;
}

export const DEFAULT_FILTER: FilterState = {
  minPrice: 0,
  maxPrice: 2000,
  minRating: 0,
  discountOnly: false,
  sortBy: "default",
};

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  activeCount: number;
}

export default function FilterModal({ isOpen, onClose, filters, onApply, activeCount }: FilterModalProps) {
  const { t } = useLanguage();
  const [local, setLocal] = useState<FilterState>(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  if (!isOpen) return null;

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "default",    label: t("filter_sort_default",    "Default") },
    { value: "price_asc",  label: t("filter_sort_price_asc",  "Price: Low to High") },
    { value: "price_desc", label: t("filter_sort_price_desc", "Price: High to Low") },
    { value: "rating",     label: t("filter_sort_rating",     "Highest Rated") },
    { value: "popular",    label: t("filter_sort_popular",    "Most Popular") },
  ];

  const handleReset = () => setLocal(DEFAULT_FILTER);
  const handleApply = () => { onApply(local); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{t("filter_title", "Filter & Sort")}</h3>
              {activeCount > 0 && (
                <span className="text-[11px] font-bold text-orange-600">{activeCount} {t("filter_active", "filters active")}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-orange-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("filter_reset", "Reset")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Sort By */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">
              <ArrowUpDown className="inline h-3.5 w-3.5 mr-1 text-orange-500" />
              {t("filter_sort_by", "Sort By")}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLocal(prev => ({ ...prev, sortBy: opt.value }))}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold border-2 transition-all cursor-pointer ${
                    local.sortBy === opt.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-slate-200 text-slate-600 hover:border-orange-200 hover:bg-orange-50/50"
                  }`}
                >
                  <span>{opt.label}</span>
                  {local.sortBy === opt.value && (
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">
              <Tag className="inline h-3.5 w-3.5 mr-1 text-orange-500" />
              {t("filter_price_range", "Price Range")}: ৳{local.minPrice} – ৳{local.maxPrice}
            </label>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-medium">Min Price: ৳{local.minPrice}</p>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={50}
                  value={local.minPrice}
                  onChange={(e) => setLocal(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                  className="w-full h-2 accent-orange-500 cursor-pointer rounded-full"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-medium">Max Price: ৳{local.maxPrice}</p>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={50}
                  value={local.maxPrice}
                  onChange={(e) => setLocal(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                  className="w-full h-2 accent-orange-500 cursor-pointer rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">
              <Star className="inline h-3.5 w-3.5 mr-1 text-amber-500" />
              {t("filter_min_rating", "Minimum Rating")}: {local.minRating > 0 ? `${local.minRating}★+` : t("filter_sort_default", "Any")}
            </label>
            <div className="flex items-center gap-2">
              {[0, 3, 3.5, 4, 4.5, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setLocal(prev => ({ ...prev, minRating: r }))}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                    local.minRating === r
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-500 hover:border-amber-200 hover:bg-amber-50/50"
                  }`}
                >
                  {r === 0 ? "All" : `${r}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Discount Only */}
          <div>
            <button
              type="button"
              onClick={() => setLocal(prev => ({ ...prev, discountOnly: !prev.discountOnly }))}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                local.discountOnly
                  ? "border-rose-500 bg-rose-50"
                  : "border-slate-200 hover:border-rose-200 hover:bg-rose-50/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🔥</span>
                <span className={`text-sm font-bold ${local.discountOnly ? "text-rose-700" : "text-slate-600"}`}>
                  {t("filter_discount_only", "Discounted Items Only")}
                </span>
              </div>
              {local.discountOnly
                ? <CheckSquare className="h-5 w-5 text-rose-500" />
                : <Square className="h-5 w-5 text-slate-400" />
              }
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <button
            type="button"
            onClick={handleApply}
            className="w-full rounded-2xl py-4 text-sm font-extrabold text-white transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 8px 28px rgba(249,115,22,0.4)" }}
          >
            ✓ {t("filter_apply", "Apply Filters")}
          </button>
        </div>
      </div>
    </div>
  );
}
