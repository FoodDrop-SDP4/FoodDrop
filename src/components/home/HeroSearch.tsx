"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Store, ArrowRight } from "lucide-react";
import { MenuItem } from "../../types";

interface HeroSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  suggestions: MenuItem[];
  onSelectSuggestion: (food: MenuItem) => void;
}

export default function HeroSearch({
  searchQuery,
  onSearchChange,
  suggestions,
  onSelectSuggestion,
}: HeroSearchProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: MenuItem) => {
    onSelectSuggestion(item);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onSearchChange("");
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex min-h-[420px] flex-col items-center justify-center bg-slate-950 px-6 pb-14 pt-16 text-center sm:px-12 sm:pb-16 sm:pt-20 font-sans z-20">
      {/* Background & Decorative Glow Layer (Clipped independently) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-25 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-orange-600/20 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl space-y-5">
        {/* Highlight Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black text-white backdrop-blur-md border border-white/15 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          <span>Restaurants & Homemade Home-Cooked Food in One Place</span>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
          Craving something <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">delicious?</span>
        </h1>
        <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-300 font-medium">
          Order from your favorite commercial restaurants or authentic home kitchens & get it delivered fast.
        </p>

        {/* Search Box Container */}
        <div ref={searchRef} className="relative mx-auto w-full max-w-xl pt-2">
          <div className="relative">
            <div className="flex w-full items-center overflow-hidden rounded-full bg-white p-1.5 shadow-2xl transition focus-within:ring-4 focus-within:ring-orange-500/20 border border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center text-slate-400">
                <Search className="h-5 w-5 text-orange-500" />
              </div>
              <input
                type="text"
                placeholder="Search dishes, burgers, biryani, or home chefs..."
                value={searchQuery}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (e.target.value.trim()) setShowSuggestions(true);
                }}
                className="h-12 w-full bg-transparent px-2 font-medium text-slate-900 outline-none placeholder:text-slate-400 text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 text-slate-400 hover:text-slate-600 mr-1 transition"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                className="h-12 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 px-7 font-bold text-white shadow-md shadow-orange-600/30 transition hover:scale-105 active:scale-95 shrink-0"
              >
                Find Food
              </button>
            </div>

            {/* Autocomplete Suggestions Dropdown directly below search input */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-3xl border border-slate-100 bg-white p-2 shadow-2xl text-left divide-y divide-slate-100 max-h-72 overflow-y-auto">
                <div className="px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Search Suggestions
                </div>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-orange-50 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                        alt={item.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                        }}
                        className="h-10 w-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                          <Store className="h-3 w-3 text-orange-500 shrink-0" />
                          <span className="truncate">{item.restaurant?.name || "Kitchen"}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <span className="text-sm font-black text-slate-900">৳{item.price}</span>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-orange-600 transition ml-auto mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Popular Keywords Chips */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 font-semibold">
            <span>Popular:</span>
            {[
              { label: "🍛 Kacchi", query: "Kacchi" },
              { label: "🏡 Khichuri", query: "Khichuri" },
              { label: "🍔 BBQ Burger", query: "Burger" },
              { label: "🍕 Pizza", query: "Pizza" },
              { label: "🐟 Ilish", query: "Ilish" },
              { label: "🧁 Cupcake", query: "Cupcake" },
            ].map((tag) => (
              <button
                key={tag.query}
                type="button"
                onClick={() => onSearchChange(tag.query)}
                className="rounded-full bg-white/10 px-3 py-1 text-slate-200 backdrop-blur transition hover:bg-white/20 hover:text-white border border-white/10"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
