"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search, ShoppingCart, User } from "lucide-react";
import CartDrawer from "./CartDrawer";
import { useCartStore } from "../../store/useCartStore";

interface SearchRestaurant {
	id: number;
	name: string;
	image: string;
	cuisines: string[];
}

const restaurants: SearchRestaurant[] = [
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

export default function Navbar() {
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [query, setQuery] = useState("");
	const items = useCartStore((state) => state.items);
	const totalItems = items.reduce((total, item) => total + item.quantity, 0);

	useEffect(() => {
		if (!query) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setQuery("");
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [query]);

	const filteredRestaurants = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) return [];

		return restaurants.filter((restaurant) => {
			const nameMatches = restaurant.name.toLowerCase().includes(normalizedQuery);
			const cuisineMatches = restaurant.cuisines.some((cuisine) =>
				cuisine.toLowerCase().includes(normalizedQuery),
			);

			return nameMatches || cuisineMatches;
		});
	}, [query]);

	return (
		<header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:px-8">
				<div className="flex items-center justify-between gap-4 lg:shrink-0">
					<Link href="/" className="flex items-baseline gap-1 text-2xl font-extrabold tracking-tight">
						<span className="text-orange-600">Food</span>
						<span className="text-black">Drop</span>
					</Link>

					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-orange-200 hover:text-orange-700 lg:hidden"
					>
						<MapPin className="h-4 w-4 text-orange-600" />
						<span className="truncate">Dhaka, Bangladesh</span>
					</button>
				</div>

				<button
					type="button"
					className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-orange-200 hover:text-orange-700 lg:inline-flex"
				>
					<MapPin className="h-4 w-4 text-orange-600" />
					<span className="truncate">Dhaka, Bangladesh</span>
				</button>

				<div className="w-full lg:max-w-2xl lg:flex-1">
					<div className="relative">
						<label className="relative block">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
							<input
								type="search"
								placeholder="Search for restaurants or dishes"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								className="h-12 w-full rounded-full border border-black/10 bg-white pl-11 pr-4 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
							/>
						</label>

						{query.length > 0 ? (
							<div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-[10000] text-black">
								{filteredRestaurants.length > 0 ? (
									filteredRestaurants.map((restaurant) => (
										<Link
											key={restaurant.id}
											href={`/restaurants/${restaurant.id}`}
											onClick={() => setQuery("")}
											className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
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
												<p className="truncate text-sm font-semibold text-zinc-950">
													{restaurant.name}
												</p>
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

				<div className="flex items-center justify-between gap-3 lg:shrink-0">
					<button
						type="button"
						onClick={() => setIsCartOpen(true)}
						className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-zinc-800 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
						aria-label="Cart"
					>
						<ShoppingCart className="h-5 w-5" />
						<span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-semibold leading-none text-white">
							{totalItems}
						</span>
					</button>

					<button
						type="button"
						className="inline-flex h-12 items-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
					>
						<User className="h-4 w-4" />
						{/* Login Button Section */}
<Link 
  href="/login" 
  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.98]"
>
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
  Login
</Link>
					</button>
				</div>
			</div>

			<CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
		</header>
	);
}
