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

  // Filter & Search Logic
  useEffect(() => {
    let result = foods;

    // 1. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((food) => {
        if (!food.category) return false;
        const cat = food.category.toLowerCase();
        const selected = selectedCategory.toLowerCase();
        return cat.includes(selected) || selected.includes(cat);
      });
    }

    // 2. Search Query Matching
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
  }, [searchQuery, selectedCategory, foods]);

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
        <div className="mb-10 space-y-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Near You"}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Showing {filteredFoods.length} items{" "}
              {selectedCategory !== "All" && `in ${selectedCategory}`}
            </p>
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