"use client";

import { useLanguage } from "../../lib/i18n/LanguageContext";

interface CategoryFilterProps {
  categories: readonly string[] | string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORY_META: Record<string, { emoji: string; gradient: string }> = {
  "All":                { emoji: "✨", gradient: "from-slate-700 to-slate-900" },
  "Biryani & Rice":     { emoji: "🍱", gradient: "from-amber-500 to-orange-600" },
  "Fast Food & Burger": { emoji: "🍔", gradient: "from-red-500 to-rose-600" },
  "Pizza & Pasta":      { emoji: "🍕", gradient: "from-orange-400 to-red-500" },
  "Chinese & Thai":     { emoji: "🥢", gradient: "from-emerald-500 to-teal-600" },
  "Dessert & Bakery":   { emoji: "🧁", gradient: "from-pink-500 to-rose-500" },
  "Beverages & Drinks": { emoji: "🧃", gradient: "from-sky-500 to-blue-600" },
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const { t } = useLanguage();

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "All":                return t("cat_all", "All");
      case "Biryani & Rice":     return t("cat_biryani_rice", "Biryani & Rice");
      case "Fast Food & Burger": return t("cat_fast_food_burger", "Fast Food & Burger");
      case "Pizza & Pasta":      return t("cat_pizza_pasta", "Pizza & Pasta");
      case "Chinese & Thai":     return t("cat_chinese_thai", "Chinese & Thai");
      case "Dessert & Bakery":   return t("cat_dessert_bakery", "Dessert & Bakery");
      case "Beverages & Drinks": return t("cat_beverages_drinks", "Beverages & Drinks");
      default:                   return cat;
    }
  };

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        const meta = CATEGORY_META[cat] ?? { emoji: "🍽️", gradient: "from-slate-600 to-slate-800" };

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`group relative flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer shrink-0 ${
              isSelected
                ? "text-white shadow-lg scale-[1.04]"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:border-orange-200 hover:text-orange-600 hover:shadow-md"
            }`}
            style={
              isSelected
                ? {
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    boxShadow: `0 8px 24px rgba(249,115,22,0.35)`,
                  }
                : {}
            }
          >
            {/* Gradient background for selected */}
            {isSelected && (
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${meta.gradient} opacity-100`}
              />
            )}

            <span className="relative z-10 text-base leading-none">{meta.emoji}</span>
            <span className="relative z-10">{getCategoryLabel(cat)}</span>

            {/* Active indicator dot */}
            {isSelected && (
              <span className="relative z-10 ml-0.5 h-1.5 w-1.5 rounded-full bg-white/60" />
            )}
          </button>
        );
      })}
    </div>
  );
}
