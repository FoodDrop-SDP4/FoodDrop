"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Utensils, TrendingUp, SlidersHorizontal, ArrowUpDown, ChevronDown } from "lucide-react";
import { MenuItem, CATEGORIES } from "../types";
import HeroSearch from "../components/home/HeroSearch";
import CategoryFilter from "../components/food/CategoryFilter";
import FoodCard from "../components/food/FoodCard";
import TrendingSection from "../components/home/TrendingSection";
import FilterModal, { FilterState, DEFAULT_FILTER, SortOption } from "../components/home/FilterModal";
import { useLanguage } from "../lib/i18n/LanguageContext";

export default function CustomerHomepage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [foods, setFoods] = useState<MenuItem[]>([]);
  const [trendingItems, setTrendingItems] = useState<MenuItem[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER);
  const [sortOpen, setSortOpen] = useState(false);

  // Role redirect
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "RIDER") { router.replace("/rider"); return; }
        if (user.role === "RESTAURANT_OWNER") { router.replace("/restaurant"); return; }
      }
    } catch (e) { /* quiet */ }
  }, [router]);

  // Fetch all foods
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch("/api/restaurants/menu");
        if (res.ok) {
          const data = await res.json();
          setFoods(data);
          setFilteredFoods(data);
        }
      } catch (error) {
        console.error("Failed to fetch foods:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // Fetch trending items
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/trending");
        if (res.ok) {
          const data = await res.json();
          setTrendingItems(data);
        }
      } catch (error) {
        console.error("Failed to fetch trending:", error);
      }
    };
    fetchTrending();
  }, []);

  // Filter + Search + Sort logic
  const applyFilters = useCallback(() => {
    let result = [...foods];

    // Category
    if (selectedCategory !== "All") {
      result = result.filter((food) => {
        if (!food.category) return false;
        const cat = food.category.toLowerCase();
        const selected = selectedCategory.toLowerCase();
        return cat.includes(selected.split(" ")[0]) || selected.includes(cat.split(" ")[0]);
      });
    }

    // Search
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (food) =>
          food.name.toLowerCase().includes(q) ||
          food.restaurant?.name.toLowerCase().includes(q) ||
          food.category?.toLowerCase().includes(q)
      );
      const matches = foods.filter((f) =>
        f.name.toLowerCase().includes(q) || f.restaurant?.name.toLowerCase().includes(q)
      ).slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }

    // Price range
    result = result.filter(
      (food) => food.price >= filters.minPrice && food.price <= filters.maxPrice
    );

    // Min rating
    if (filters.minRating > 0) {
      result = result.filter((food) => (food.avgRating ?? 5) >= filters.minRating);
    }

    // Discount only
    if (filters.discountOnly) {
      result = result.filter((food) => food.originalPrice && food.originalPrice > food.price);
    }

    // Sort
    switch (filters.sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
        break;
      case "popular":
        result.sort((a, b) => (b.totalReviews ?? 0) - (a.totalReviews ?? 0));
        break;
    }

    setFilteredFoods(result);
  }, [foods, selectedCategory, searchQuery, filters]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const activeFilterCount = [
    filters.sortBy !== "default",
    filters.minPrice > 0,
    filters.maxPrice < 2000,
    filters.minRating > 0,
    filters.discountOnly,
  ].filter(Boolean).length;

  const SORT_LABELS: Record<SortOption, string> = {
    default:    t("filter_sort_default",    "Default"),
    price_asc:  t("filter_sort_price_asc",  "Price ↑"),
    price_desc: t("filter_sort_price_desc", "Price ↓"),
    rating:     t("filter_sort_rating",     "Rating"),
    popular:    t("filter_sort_popular",    "Popular"),
  };

  return (
    <main className="min-h-screen bg-slate-50" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Hero Search */}
      <HeroSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        suggestions={suggestions}
        onSelectSuggestion={(food) => setSearchQuery(food.name)}
      />

      {/* Trending Section */}
      <TrendingSection items={trendingItems} />

      {/* Food Grid Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">

        {/* Section header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {searchQuery
                  ? `${t("search_results_for", "Results for")} "${searchQuery}"`
                  : t("popular_near_you", "Popular Near You")}
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-400">
              {t("showing_items", "Showing")}{" "}
              <span className="font-bold text-orange-600">{filteredFoods.length}</span>{" "}
              {t("items_in", "items in")}{" "}
              <span className="font-bold text-slate-700">
                {selectedCategory === "All" ? t("cat_all", "All categories") : selectedCategory}
              </span>
            </p>
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex items-center gap-2">
            {/* Filter button */}
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all shadow-sm cursor-pointer ${
                activeFilterCount > 0
                  ? "bg-orange-500 text-white border-orange-500 shadow-orange-500/30"
                  : "bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">{t("filter_title", "Filter")}</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-[10px] font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600 transition-all shadow-sm cursor-pointer"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">{SORT_LABELS[filters.sortBy]}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30">
                  {(["default", "price_asc", "price_desc", "rating", "popular"] as SortOption[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, sortBy: s }));
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-xl font-medium transition-colors cursor-pointer ${
                        filters.sortBy === s
                          ? "bg-orange-50 text-orange-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {SORT_LABELS[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Content States */}
        {isLoading ? (
          <div className="flex h-72 flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-400">Loading delicious food...</p>
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
              <Utensils className="h-8 w-8 text-slate-300 stroke-1" />
            </div>
            <p className="text-lg font-bold text-slate-700">
              {t("no_food_found", "No matching food found!")}
            </p>
            <p className="mt-1.5 text-sm text-slate-400 max-w-xs">
              {t("no_food_desc", "Try adjusting your filters or search for something else.")}
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setFilters(DEFAULT_FILTER); }}
              className="mt-5 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-90 transition cursor-pointer"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}
            >
              {t("filter_reset", "Reset All Filters")}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFoods.map((food, i) => (
              <div
                key={food.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms`, animationFillMode: "both" }}
              >
                <FoodCard food={food} />
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        {!isLoading && filteredFoods.length > 0 && (
          <div className="mt-16 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0c0c14, #13131f, #1a0a00)" }}>
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.15) 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <div className="text-4xl mb-3">🍽️</div>
              <h3 className="text-2xl font-extrabold text-white mb-2">Can't find what you want?</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                Try a different category or reset your filters to see all available dishes.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setFilters(DEFAULT_FILTER); }}
                className="rounded-2xl px-8 py-3.5 text-sm font-bold text-white cursor-pointer transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 8px 24px rgba(249,115,22,0.4)" }}
              >
                View All Food
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        activeCount={activeFilterCount}
      />

      {/* Close sort dropdown on outside click */}
      {sortOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />
      )}
    </main>
  );
}