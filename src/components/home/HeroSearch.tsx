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
    <div className="relative flex min-h-[480px] flex-col items-center justify-center bg-slate-950 px-6 pb-24 pt-32 text-center sm:px-12 font-sans">
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

      <div className="relative z-10 w-full max-w-3xl space-y-8">
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
          Craving something <span className="text-orange-500">delicious?</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-slate-300">
          Order from your favorite restaurants and get it delivered right to your doorstep in minutes.
        </p>

        {/* Search Box Container with Suggestions Dropdown */}
        <div ref={searchRef} className="relative mx-auto w-full max-w-xl">
          <div className="flex w-full items-center overflow-hidden rounded-full bg-white p-1.5 shadow-2xl transition focus-within:ring-2 focus-within:ring-orange-500">
            <div className="flex h-12 w-12 items-center justify-center text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search for food, category or restaurants..."
              value={searchQuery}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (e.target.value.trim()) setShowSuggestions(true);
              }}
              className="h-12 w-full bg-transparent px-2 font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-slate-600 mr-1"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button className="h-12 rounded-full bg-orange-600 px-8 font-bold text-white transition hover:bg-orange-700 shrink-0">
              Find Food
            </button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-3xl border border-slate-100 bg-white p-2 shadow-2xl text-left divide-y divide-slate-100">
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
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Store className="h-3 w-3 text-orange-500" />
                        {item.restaurant?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">৳{item.price}</span>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-orange-600 transition ml-auto mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
