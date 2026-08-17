"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Utensils } from "lucide-react";
import { MenuItem, CATEGORIES } from "../types";
import HeroSearch from "../components/home/HeroSearch";
import CategoryFilter from "../components/food/CategoryFilter";
import FoodCard from "../components/food/FoodCard";

export default function CustomerHomepage() {
  const router = useRouter();
  const [foods, setFoods] = useState<MenuItem[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);

  // 🚀 Fast client-side hydration check for Riders & Restaurant Owners
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "RIDER") {
          router.replace("/rider");
          return;
        }
        if (user.role === "RESTAURANT_OWNER") {
          router.replace("/restaurant");
          return;
        }
      }
    } catch (e) {
      // quiet
    }
  }, [router]);

  // Fetch foods from API
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

  const [selectedKitchenType, setSelectedKitchenType] = useState<"ALL" | "RESTAURANT" | "HOMEMADE">("ALL");

  // Filter & Search Logic
  useEffect(() => {
    let result = foods;

    // 1. Kitchen Type Filter (Restaurants vs Homemade)
    if (selectedKitchenType !== "ALL") {
      result = result.filter((food) => {
        const type = food.restaurant?.restaurantType || "RESTAURANT";
        return type === selectedKitchenType;
      });
    }

    // 2. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((food) => {
        if (!food.category) return false;
        const cat = food.category.toLowerCase();
        const selected = selectedCategory.toLowerCase();
        return cat.includes(selected) || selected.includes(cat);
      });
    }

    // 3. Search Query Matching
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase();

      result = result.filter(
        (food) =>
          food.name.toLowerCase().includes(q) ||
          food.restaurant?.name.toLowerCase().includes(q) ||
          food.category?.toLowerCase().includes(q)
      );

      // Suggestions (Top 5 matches)
      const matches = foods
        .filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.restaurant?.name.toLowerCase().includes(q)
        )
        .slice(0, 5);

      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }

    setFilteredFoods(result);
  }, [searchQuery, selectedCategory, selectedKitchenType, foods]);

  const homemadeCount = foods.filter((f) => f.restaurant?.restaurantType === "HOMEMADE").length;
  const restaurantCount = foods.filter((f) => (f.restaurant?.restaurantType || "RESTAURANT") === "RESTAURANT").length;

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      {/* Reusable Hero Search Component */}
      <HeroSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        suggestions={suggestions}
        onSelectSuggestion={(food) => setSearchQuery(food.name)}
      />

      {/* Food Grid Section */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
        <div className="mb-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Near You"}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Showing {filteredFoods.length} items{" "}
                {selectedCategory !== "All" && `in ${selectedCategory}`}
              </p>
            </div>

            {/* 🌟 Kitchen Type Switcher Tabs (All | Restaurants | Homemade) */}
            <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 border border-slate-200/80 shadow-sm self-start sm:self-auto">
              <button
                onClick={() => setSelectedKitchenType("ALL")}
                className={`rounded-xl px-3.5 py-2 text-xs font-black transition ${
                  selectedKitchenType === "ALL"
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                All Kitchens ({foods.length})
              </button>

              <button
                onClick={() => setSelectedKitchenType("HOMEMADE")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition ${
                  selectedKitchenType === "HOMEMADE"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <span>🏡 Homemade Foods</span>
                {homemadeCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      selectedKitchenType === "HOMEMADE"
                        ? "bg-white text-emerald-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {homemadeCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSelectedKitchenType("RESTAURANT")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition ${
                  selectedKitchenType === "RESTAURANT"
                    ? "bg-orange-600 text-white shadow-md shadow-orange-500/20"
                    : "text-orange-700 hover:bg-orange-50"
                }`}
              >
                <span>🍽️ Restaurants</span>
                {restaurantCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      selectedKitchenType === "RESTAURANT"
                        ? "bg-white text-orange-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {restaurantCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Reusable Category Filter Component */}
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Content States */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            <Utensils className="mb-3 h-12 w-12 text-slate-300 stroke-1" />
            <p className="text-lg font-bold text-slate-700">No matching food found!</p>
            <p className="mt-1 text-xs text-slate-400">
              Try searching for something else like "Burger", "Pizza" or "Biryani".
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}