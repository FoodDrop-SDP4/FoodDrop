"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface HeroProps {
	searchQuery?: string;
	setSearchQuery?: (value: string) => void;
}

interface HeroRestaurant {
	id: number;
	name: string;
	image: string;
	cuisines: string[];
}

const restaurants: HeroRestaurant[] = [
	{
		id: 1,
		name: "Burger House",
		image:
			"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
		cuisines: ["Burgers", "Fast Food"],
	},
	{
		id: 2,
		name: "Spicy Biryani",
		image:
			"https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1200&q=80",
		cuisines: ["Biryani", "South Asian"],
	},
	{
		id: 3,
		name: "Pizza Palermo",
		image:
			"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
		cuisines: ["Pizza", "Italian"],
	},
	{
		id: 4,
		name: "Noodle Lab",
		image:
			"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
		cuisines: ["Noodles", "Asian"],
	},
	{
		id: 5,
		name: "Sweet Table",
		image:
			"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
		cuisines: ["Desserts", "Bakery"],
	},
	{
		id: 6,
		name: "Fresh Sip",
		image:
			"https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80",
		cuisines: ["Drinks", "Smoothies"],
	},
];

export default function Hero({ searchQuery = "", setSearchQuery }: HeroProps) {
	const [query, setQuery] = useState(searchQuery);

	useEffect(() => {
		setQuery(searchQuery);
	}, [searchQuery]);

	const filteredRestaurants = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return [];
		}

		return restaurants.filter((restaurant) => {
			const nameMatches = restaurant.name.toLowerCase().includes(normalizedQuery);
			const cuisineMatches = restaurant.cuisines.some((cuisine) =>
				cuisine.toLowerCase().includes(normalizedQuery),
			);

			return nameMatches || cuisineMatches;
		});
	}, [query]);

	const handleQueryChange = (value: string) => {
		setQuery(value);
		setSearchQuery?.(value);
	};

	return (
		<section className="relative overflow-hidden bg-zinc-50">
			<div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
				<div className="flex flex-col items-center text-center lg:items-start lg:text-left">
					<p className="mb-4 inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm">
						Fast delivery, fresh favorites
					</p>

					<h1 className="max-w-2xl text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
						Hungry? Grab your favorite meals in a flash.
					</h1>

					<p className="mt-6 max-w-xl text-base leading-8 text-zinc-600 sm:text-lg">
						Discover nearby restaurants, quick bites, and comfort food that arrives hot and on time. Search, choose, and enjoy without the wait.
					</p>

					<div className="mt-8 flex w-full justify-center lg:justify-start">
						<Link
							href="/res-partner"
							className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
						>
							Sign Up as Restaurant Partner
						</Link>
					</div>

					<div className="mt-8 w-full max-w-xl">
						<div className="relative">
							<div className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white p-3 shadow-lg shadow-black/5 sm:flex-row sm:items-center">
								<label className="sr-only" htmlFor="food-search">
									Search for food
								</label>
								<input
									id="food-search"
									type="search"
									placeholder="Search dishes, restaurants, or cuisines"
									value={query}
									onChange={(event) => handleQueryChange(event.target.value)}
									className="h-14 flex-1 rounded-2xl border border-transparent bg-zinc-50 px-5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-200 focus:bg-white focus:ring-2 focus:ring-orange-100"
								/>
								<button
									type="button"
									className="inline-flex h-14 items-center justify-center rounded-2xl bg-orange-600 px-6 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-700"
								>
									Explore Food
								</button>
							</div>

							{query.length > 0 ? (
								<div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-xl z-50">
									{filteredRestaurants.length > 0 ? (
										filteredRestaurants.map((restaurant) => (
											<Link
												key={restaurant.id}
												href={`/restaurants/${restaurant.id}`}
												className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
												onClick={() => handleQueryChange("")}
											>
												<div className="relative h-10 w-10 flex-none overflow-hidden rounded-xl bg-gray-100">
													<Image
														src={restaurant.image}
														alt={restaurant.name}
														fill
														sizes="40px"
														className="object-cover"
													/>
												</div>
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-semibold text-zinc-950">{restaurant.name}</p>
													<p className="truncate text-xs text-zinc-500">
														{restaurant.cuisines.join(" • ")}
													</p>
												</div>
											</Link>
										))
									) : (
										<div className="px-4 py-5 text-sm font-medium text-zinc-500">
											No results found
										</div>
									)}
								</div>
							) : null}
						</div>
					</div>
				</div>

				<div className="flex items-center justify-center">
					<div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl shadow-2xl shadow-black/10">
						<Image
							src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
							alt="FoodDrop hero food preview"
							fill
							priority
							sizes="(max-width: 1024px) 100vw, 50vw"
							className="object-cover"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
