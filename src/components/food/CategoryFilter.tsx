"use client";

interface CategoryFilterProps {
  categories: readonly string[] | string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categoryIcons: Record<string, string> = {
  "All": "✨",
  "Biryani & Rice": "🍛",
  "Fast Food & Burger": "🍔",
  "Pizza & Pasta": "🍕",
  "Chinese & Thai": "🥢",
  "Dessert & Bakery": "🍰",
  "Beverages & Drinks": "🥤",
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        const icon = categoryIcons[cat] || "🍽️";
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`group flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-2.5 text-xs font-black transition-all active:scale-95 ${
              isSelected
                ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/25 scale-[1.02]"
                : "bg-white text-slate-700 hover:bg-orange-50/50 hover:text-orange-600 hover:border-orange-200 border border-slate-200/80 shadow-xs"
            }`}
          >
            <span className="text-sm transition-transform group-hover:scale-110">{icon}</span>
            <span>{cat}</span>
          </button>
        );
      })}
    </div>
  );
}
