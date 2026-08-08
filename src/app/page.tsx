"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Loader2, ShoppingBag, Utensils, Star, Search, Tag, Store, ArrowRight, X } from "lucide-react";
import { useCartStore } from "../store/useCartStore";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string;
  avgRating?: number;
  totalReviews?: number;
  restaurantId: string;
  restaurant: {
    name: string;
    address: string;
  };
};

const CATEGORIES = [
  "All",
  "Biryani & Rice",
  "Fast Food & Burger",
  "Pizza & Pasta",
  "Chinese & Thai",
  "Dessert & Bakery",
  "Beverages & Drinks",
];

const INITIAL_FOODS: MenuItem[] = [
  {
    id: "demo-burger",
    name: "Classic Smash Burger",
    description: "Juicy beef patty, melted cheese, and house sauce in a toasted bun.",
    price: 320,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    category: "Fast Food & Burger",
    avgRating: 4.8,
    totalReviews: 124,
    restaurantId: "demo-burger-house",
    restaurant: { name: "Burger House", address: "Dhaka, Bangladesh" },
  },
  {
    id: "demo-biryani",
    name: "Chicken Biryani",
    description: "Fragrant basmati rice with tender chicken and aromatic spices.",
    price: 280,
    imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
    category: "Biryani & Rice",
    avgRating: 4.7,
    totalReviews: 96,
    restaurantId: "demo-spicy-biryani",
    restaurant: { name: "Spicy Biryani", address: "Dhaka, Bangladesh" },
  },
  {
    id: "demo-pizza",
    name: "Margherita Pizza",
    description: "Stone-baked pizza with tomato, mozzarella, and fresh basil.",
    price: 450,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    category: "Pizza & Pasta",
    avgRating: 4.9,
    totalReviews: 81,
    restaurantId: "demo-pizza-palermo",
    restaurant: { name: "Pizza Palermo", address: "Dhaka, Bangladesh" },
  },
];

export default function CustomerHomepage() {
  const [foods, setFoods] = useState<MenuItem[]>(INITIAL_FOODS);
  const [filteredFoods, setFilteredFoods] = useState<MenuItem[]>(INITIAL_FOODS);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 🚀 Live Suggestions State & Ref
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    const fetchFoods = async () => {
      try {
        const res = await fetch("/api/restaurants/menu", { signal: controller.signal });
        if (!res.ok) throw new Error(`Menu request failed with status ${res.status}`);

        const data = await res.json();
        setFoods(data);
        setFilteredFoods(data);
        setLoadError(false);
      } catch (error) {
        console.error("Failed to fetch foods:", error);
        setLoadError(true);
      } finally {
        window.clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    fetchFoods();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // 🚀 Outside Click to Close Suggestion Dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🚀 Precise Filter & Autocomplete Suggestion Logic
  useEffect(() => {
    let result = foods;

    // 1. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((food) => {
        if (!food.category) return false;
        const cat = food.category.toLowerCase();
        const selected = selectedCategory.toLowerCase();
        
        // Match exact or partial category tags
        return cat.includes(selected) || selected.includes(cat);
      });
    }

    // 2. Strict Search Matching
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase();

      // Filter main grid strictly by Food Name, Restaurant Name, or Category
      result = result.filter(
        (food) =>
          food.name.toLowerCase().includes(q) ||
          food.restaurant?.name.toLowerCase().includes(q) ||
          food.category?.toLowerCase().includes(q)
      );

      // Generate Top Suggestions (Max 5 items matching food name or restaurant)
      const matches = foods.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.restaurant?.name.toLowerCase().includes(q)
      ).slice(0, 5);

      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    setFilteredFoods(result);
  }, [searchQuery, selectedCategory, foods]);

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      
      {/* Hero Section with Live Autocomplete Search */}
      <div className="relative flex min-h-[480px] flex-col items-center justify-center bg-slate-950 px-6 pb-24 pt-32 text-center sm:px-12">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative z-10 w-full max-w-3xl space-y-8">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Craving something <span className="text-orange-500">delicious?</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-300">
            Order from your favorite restaurants and get it delivered right to your doorstep in minutes.
          </p>

          {/* 🚀 Search Box Container with Dropdown Suggestions */}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full bg-transparent px-2 font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 mr-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button className="h-12 rounded-full bg-orange-600 px-8 font-bold text-white transition hover:bg-orange-700 shrink-0">
                Find Food
              </button>
            </div>

            {/* 🚀 Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-3xl border border-slate-100 bg-white p-2 shadow-2xl text-left divide-y divide-slate-100">
                <div className="px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Search Suggestions
                </div>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSearchQuery(item.name);
                      setShowSuggestions(false);
                    }}
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

      {/* Food Grid Section */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
        <div className="mb-10 space-y-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Near You"}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Showing {filteredFoods.length} items {selectedCategory !== "All" && `in ${selectedCategory}`}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </div>
        ) : loadError ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
            <Utensils className="mb-3 h-12 w-12 text-slate-300 stroke-1" />
            <p className="text-lg font-bold text-slate-700">Menu is temporarily unavailable</p>
            <p className="mt-1 text-xs text-slate-400">Please check the database connection and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-2xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white text-slate-500 p-8 text-center">
            <Utensils className="mb-3 h-12 w-12 text-slate-300 stroke-1" />
            <p className="text-lg font-bold text-slate-700">No matching food found!</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for something else like "Burger", "Pizza" or "Biryani".</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFoods.map((food) => (
              <div key={food.id} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-500/10">
                
                {/* Image Link */}
                <Link href={`/restaurants/${food.restaurantId}`} className="relative h-52 overflow-hidden block cursor-pointer">
                  <img
                    src={food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                    alt={food.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-900 shadow-sm backdrop-blur">
                    ৳{food.price}
                  </div>

                  {food.category && (
                    <div className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur">
                      <Tag className="h-3 w-3 text-orange-400" />
                      {food.category}
                    </div>
                  )}

                  {/* 🚀 Dynamic Rating Badge */}
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
                </Link>
                
                <div className="flex flex-1 flex-col p-5">
                  <Link href={`/restaurants/${food.restaurantId}`} className="line-clamp-1 text-lg font-bold text-slate-900 hover:text-orange-600 transition">
                    {food.name}
                  </Link>
                  
                  {food.restaurant && (
                    <Link href={`/restaurants/${food.restaurantId}`} className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition">
                      <Store className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                      <span className="truncate font-medium">{food.restaurant.name}</span>
                    </Link>
                  )}

                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {food.description}
                  </p>

                  <div className="mt-auto pt-5">
                    <button 
                      onClick={() => addToCart({
                        id: food.id,
                        name: food.name,
                        price: food.price,
                        imageUrl: food.imageUrl,
                        quantity: 1,
                        restaurantId: food.restaurantId,
                        restaurantName: food.restaurant?.name || "Restaurant"
                      })}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-orange-600"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}