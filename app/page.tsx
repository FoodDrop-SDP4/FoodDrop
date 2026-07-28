"use client";

import { useState } from "react";
import Hero from "@/src/components/home/Hero";
import Categories from "@/src/components/home/Categories";
import Restaurants from "@/src/components/home/Restaurants";

export default function Home() {
	const [searchQuery, setSearchQuery] = useState("");

  return (
    <main>
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Categories />
      <Restaurants searchQuery={searchQuery} />
    </main>
  );
}
