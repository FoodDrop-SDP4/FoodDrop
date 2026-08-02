"use client";

import { useState } from "react";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import Restaurants from "../components/home/Restaurants";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-55 pb-20">
      {/* Hero Section */}
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {/* Category Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Browse by Category
        </h2>
        <Categories />
      </div>

      {/* Popular Restaurants Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Popular Restaurants Near You
        </h2>
        <Restaurants searchQuery={searchQuery} />
      </div>
    </div>
  );
}