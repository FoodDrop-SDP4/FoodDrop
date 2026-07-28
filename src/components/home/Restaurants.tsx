import Image from "next/image";
import Link from "next/link";

interface Restaurant {
	id: number;
	name: string;
	image: string;
	rating: number;
	deliveryTime: string;
	cuisines: string[];
	minOrder: string;
}

const restaurants: Restaurant[] = [
	{
		id: 1,
		name: "Burger House",
		image:
			"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
		rating: 4.8,
		deliveryTime: "25-30 min",
		cuisines: ["Burgers", "Fast Food"],
		minOrder: "৳310 minimum",
	},
	{
		id: 2,
		name: "Spicy Biryani",
		image:
			"https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1200&q=80",
		rating: 4.7,
		deliveryTime: "30-40 min",
		cuisines: ["Biryani", "South Asian"],
		minOrder: "৳250 minimum",
	},
	{
		id: 3,
		name: "Pizza Palermo",
		image:
			"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
		rating: 4.9,
		deliveryTime: "20-25 min",
		cuisines: ["Pizza", "Italian"],
		minOrder: "৳180 minimum",
	},
	{
		id: 4,
		name: "Noodle Lab",
		image:
			"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
		rating: 4.6,
		deliveryTime: "30-35 min",
		cuisines: ["Noodles", "Asian"],
		minOrder: "৳150 minimum",
	},
	{
		id: 5,
		name: "Sweet Table",
		image:
			"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
		rating: 4.8,
		deliveryTime: "15-20 min",
		cuisines: ["Desserts", "Bakery"],
		minOrder: "৳70 minimum",
	},
	{
		id: 6,
		name: "Fresh Sip",
		image:
			"https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80",
		rating: 4.5,
		deliveryTime: "10-15 min",
		cuisines: ["Drinks", "Smoothies"],
		minOrder: "৳5140 minimum",
	},
];


interface RestaurantsProps {
	searchQuery: string;
}

export default function Restaurants({ searchQuery }: RestaurantsProps) {
	const normalizedQuery = searchQuery.trim().toLowerCase();
	const filteredRestaurants = restaurants.filter((restaurant) => {
		if (!normalizedQuery) return true;

		const nameMatches = restaurant.name.toLowerCase().includes(normalizedQuery);
		const cuisineMatches = restaurant.cuisines.some((cuisine) =>
			cuisine.toLowerCase().includes(normalizedQuery),
		);

		return nameMatches || cuisineMatches;
	});

	return (
		<section className="bg-zinc-50 py-10 sm:py-14">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-6 flex items-end justify-between gap-4">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
							Restaurants
						</p>
						<h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
							Popular picks near you
						</h2>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredRestaurants.length === 0 ? (
						<div className="col-span-full rounded-3xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
							<p className="text-lg font-bold text-zinc-950">No restaurants found</p>
							<p className="mt-2 text-sm text-zinc-500">
								Try a different dish, cuisine, or restaurant name.
							</p>
						</div>
					) : (
						filteredRestaurants.map((restaurant) => (
						<Link
							key={restaurant.id}
							href={`/restaurants/${restaurant.id}`}
							className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-lg"
						>
							<article>
								<div className="relative overflow-hidden">
									<Image
										src={restaurant.image}
										alt={restaurant.name}
										width={1200}
										height={900}
										className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
									/>
									<span className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
										{restaurant.deliveryTime}
									</span>
								</div>

								<div className="space-y-3 p-5">
									<div className="flex items-start justify-between gap-3">
										<div>
											<h3 className="text-lg font-bold text-zinc-950">
												{restaurant.name}
											</h3>
											<p className="mt-1 text-sm text-zinc-500">
												{restaurant.cuisines.join(" • ")}
											</p>
										</div>

										<div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
											<span aria-hidden="true">★</span>
											<span>{restaurant.rating.toFixed(1)}</span>
										</div>
									</div>

									<div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-sm text-zinc-600">
										<span>{restaurant.minOrder}</span>
										<span className="font-medium text-zinc-900">
											{restaurant.deliveryTime}
										</span>
									</div>
								</div>
							</article>
						</Link>
						))
					)}
				</div>
			</div>
		</section>
	);
}
