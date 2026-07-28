"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useCartStore } from "../../../store/useCartStore";

interface MenuItem {
	id: number;
	name: string;
	description: string;
	price: string;
	image: string;
	category: string;
}

interface RestaurantMenuData {
	name: string;
	rating: number;
	deliveryTime: string;
	coverImage: string;
	description: string;
	menuItems: MenuItem[];
}

const restaurantCatalog: Record<string, RestaurantMenuData> = {
	"1": {
		name: "Burger House",
		rating: 4.8,
		deliveryTime: "25-30 min",
		coverImage:
			"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=80",
		description: "Crispy, juicy, and built for quick cravings.",
		menuItems: [
			{
				id: 1,
				name: "Classic Smash Burger",
				description: "Double patty, cheddar, pickles, and house sauce.",
				price: "৳420",
				image:
					"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
				category: "Popular",
			},
			{
				id: 2,
				name: "BBQ Cheese Burger",
				description: "Smoky barbecue glaze with melted cheese.",
				price: "৳480",
				image:
					"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
				category: "Main Course",
			},
			{
				id: 3,
				name: "Truffle Fries",
				description: "Golden fries finished with truffle salt.",
				price: "৳180",
				image:
					"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
				category: "Sides",
			},
			{
				id: 4,
				name: "Coleslaw Cup",
				description: "Fresh, cool slaw to balance the heat.",
				price: "৳90",
				image:
					"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
				category: "Sides",
			},
			{
				id: 5,
				name: "Chocolate Milkshake",
				description: "Thick shake with deep cocoa flavor.",
				price: "৳220",
				image:
					"https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80",
				category: "Beverages",
			},
		],
	},
	"2": {
		name: "Spicy Biryani",
		rating: 4.7,
		deliveryTime: "30-40 min",
		coverImage:
			"https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1600&q=80",
		description: "Fragrant rice, bold spices, and slow-cooked flavor.",
		menuItems: [
			{
				id: 1,
				name: "Signature Beef Biryani",
				description: "Layered rice with tender beef and saffron aroma.",
				price: "৳390",
				image:
					"https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1200&q=80",
				category: "Popular",
			},
			{
				id: 2,
				name: "Chicken Tehari",
				description: "Lightly spiced chicken tehari with soft rice.",
				price: "৳320",
				image:
					"https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1200&q=80",
				category: "Main Course",
			},
			{
				id: 3,
				name: "Spiced Raita",
				description: "Cooling yogurt with cucumber and cumin.",
				price: "৳70",
				image:
					"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
				category: "Sides",
			},
			{
				id: 4,
				name: "Borhani",
				description: "Classic salted yogurt drink for balance.",
				price: "৳90",
				image:
					"https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
				category: "Beverages",
			},
			{
				id: 5,
				name: "Mango Lassi",
				description: "Sweet mango yogurt drink served chilled.",
				price: "৳140",
				image:
					"https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80",
				category: "Beverages",
			},
		],
	},
	"3": {
		name: "Pizza Palermo",
		rating: 4.9,
		deliveryTime: "20-25 min",
		coverImage:
			"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80",
		description: "Thin crust pizza with bright, clean flavors.",
		menuItems: [
			{
				id: 1,
				name: "Margherita Pizza",
				description: "Tomato, mozzarella, basil, and olive oil.",
				price: "৳350",
				image:
					"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
				category: "Popular",
			},
			{
				id: 2,
				name: "Pepperoni Feast",
				description: "Loaded with pepperoni and melted cheese.",
				price: "৳470",
				image:
					"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
				category: "Main Course",
			},
			{
				id: 3,
				name: "Garlic Breadsticks",
				description: "Warm breadsticks with garlic butter.",
				price: "৳180",
				image:
					"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
				category: "Sides",
			},
			{
				id: 4,
				name: "Potato Wedges",
				description: "Crispy wedges with paprika seasoning.",
				price: "৳200",
				image:
					"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
				category: "Sides",
			},
			{
				id: 5,
				name: "Sparkling Lemonade",
				description: "Bright citrus cooler with a fizzy finish.",
				price: "৳120",
				image:
					"https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
				category: "Beverages",
			},
		],
	},
	"4": {
		name: "Noodle Lab",
		rating: 4.6,
		deliveryTime: "30-35 min",
		coverImage:
			"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1600&q=80",
		description: "Wok-fired noodles with fresh herbs and punchy sauces.",
		menuItems: [
			{
				id: 1,
				name: "Chicken Noodle Bowl",
				description: "Savory soy noodles with tender chicken.",
				price: "৳340",
				image:
					"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
				category: "Popular",
			},
			{
				id: 2,
				name: "Pad Thai Bowl",
				description: "Peanut, lime, and chili balanced over noodles.",
				price: "৳380",
				image:
					"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
				category: "Main Course",
			},
			{
				id: 3,
				name: "Chili Dumplings",
				description: "Pan-fried dumplings with spicy dip.",
				price: "৳220",
				image:
					"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
				category: "Sides",
			},
			{
				id: 4,
				name: "Veg Spring Rolls",
				description: "Crunchy rolls with a light, fresh filling.",
				price: "৳180",
				image:
					"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
				category: "Sides",
			},
			{
				id: 5,
				name: "Green Tea",
				description: "Clean and calming tea served warm.",
				price: "৳80",
				image:
					"https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80",
				category: "Beverages",
			},
		],
	},
	"5": {
		name: "Sweet Table",
		rating: 4.8,
		deliveryTime: "15-20 min",
		coverImage:
			"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1600&q=80",
		description: "Desserts that feel indulgent but stay elegantly simple.",
		menuItems: [
			{
				id: 1,
				name: "Chocolate Lava Cake",
				description: "Warm cake with a molten chocolate center.",
				price: "৳240",
				image:
					"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
				category: "Popular",
			},
			{
				id: 2,
				name: "Cheesecake Slice",
				description: "Creamy baked cheesecake with berry topping.",
				price: "৳260",
				image:
					"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
				category: "Main Course",
			},
			{
				id: 3,
				name: "Caramel Brownie",
				description: "Fudgy brownie with a silky caramel finish.",
				price: "৳180",
				image:
					"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
				category: "Sides",
			},
			{
				id: 4,
				name: "Fruit Tart",
				description: "Fresh fruit, custard, and a crisp tart shell.",
				price: "৳220",
				image:
					"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
				category: "Sides",
			},
			{
				id: 5,
				name: "Iced Americano",
				description: "A sharp coffee finish with plenty of ice.",
				price: "৳140",
				image:
					"https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80",
				category: "Beverages",
			},
		],
	},
	"6": {
		name: "Fresh Sip",
		rating: 4.5,
		deliveryTime: "10-15 min",
		coverImage:
			"https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1600&q=80",
		description: "Cool drinks and quick bites for an easy refresh.",
		menuItems: [
			{
				id: 1,
				name: "Fresh Mango Smoothie",
				description: "Creamy fruit smoothie with tropical sweetness.",
				price: "৳180",
				image:
					"https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80",
				category: "Popular",
			},
			{
				id: 2,
				name: "Berry Fizz",
				description: "Sparkling berry drink with a clean finish.",
				price: "৳160",
				image:
					"https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
				category: "Beverages",
			},
			{
				id: 3,
				name: "Avocado Shake",
				description: "Silky avocado drink with light sweetness.",
				price: "৳190",
				image:
					"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
				category: "Main Course",
			},
			{
				id: 4,
				name: "Coconut Water",
				description: "Light hydration served ice-cold.",
				price: "৳110",
				image:
					"https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80",
				category: "Beverages",
			},
			{
				id: 5,
				name: "Lemon Mint Cooler",
				description: "Zesty lemon drink with fresh mint.",
				price: "৳130",
				image:
					"https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
				category: "Sides",
			},
		],
	},
};

const menuCategories = ["Popular", "Main Course", "Sides", "Beverages"];

function getRestaurantMenu(id: string) {
	return restaurantCatalog[id] ?? null;
}

export default function RestaurantMenuPage() {
	const params = useParams<{ id: string }>();
	const addItem = useCartStore((state) => state.addItem);
	const restaurantId = Array.isArray(params.id) ? params.id[0] : params.id;
	const restaurant = restaurantId ? getRestaurantMenu(restaurantId) : null;

	if (!restaurant) {
		return (
			<main className="bg-zinc-50 px-4 py-16 text-zinc-900 sm:px-6 lg:px-8">
				<div className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-[2rem] border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
						Restaurant not found
					</p>
					<h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
						We could not load this menu.
					</h1>
					<p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600">
						Please go back to the restaurant list and choose another place to order from.
					</p>
				</div>
			</main>
		);
	}

	const categoryCounts = menuCategories.map((category) => ({
		category,
		count: restaurant.menuItems.filter((item) => item.category === category).length,
	}));

	return (
		<main className="bg-zinc-50 px-4 py-8 text-zinc-900 sm:px-6 lg:px-8 lg:py-10">
			<div className="mx-auto w-full max-w-7xl space-y-8">
				<section className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-900 shadow-2xl shadow-black/10">
					<div className="relative h-[320px] w-full sm:h-[380px] lg:h-[420px]">
						<Image
							src={restaurant.coverImage}
							alt={restaurant.name}
							fill
							priority
							sizes="100vw"
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
						<div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
							<div className="max-w-2xl space-y-4 text-white">
								<p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
									Top Pick
								</p>
								<h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
									{restaurant.name}
								</h1>
								<p className="max-w-xl text-sm leading-6 text-white/80 sm:text-base">
									{restaurant.description}
								</p>
								<div className="flex flex-wrap items-center gap-3 pt-2 text-sm font-medium text-white/90">
									<span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
										<span className="text-amber-300">★</span>
										{restaurant.rating.toFixed(1)}
									</span>
									<span className="inline-flex rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
										{restaurant.deliveryTime}
									</span>
									<span className="inline-flex rounded-full bg-orange-500/90 px-3 py-1 text-white shadow-lg shadow-orange-500/20">
										{restaurant.menuItems.length} items
									</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
					<aside className="lg:sticky lg:top-24 lg:self-start">
						<div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
							<div className="mb-4">
								<p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
									Menu
								</p>
								<h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">
									Categories
								</h2>
							</div>

							<div className="space-y-3">
								{categoryCounts.map(({ category, count }) => (
									<button
										key={category}
										type="button"
										className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
									>
										<span>{category}</span>
										<span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-zinc-500 shadow-sm">
											{count}
										</span>
									</button>
								))}
							</div>
						</div>
					</aside>

					<div>
						<div className="mb-5 flex items-end justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
									Popular picks
								</p>
								<h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
									Chef-selected menu items
								</h2>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
							{restaurant.menuItems.map((item) => (
								<article
									key={item.id}
									className="overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-lg"
								>
									<div className="relative h-48 overflow-hidden">
										<Image
											src={item.image}
											alt={item.name}
											fill
											sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
											className="object-cover transition duration-300 hover:scale-105"
										/>
										<div className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
											{item.category}
										</div>
									</div>

									<div className="space-y-4 p-5">
										<div>
											<h3 className="text-lg font-bold tracking-tight text-zinc-950">
												{item.name}
											</h3>
											<p className="mt-2 text-sm leading-6 text-zinc-600">
												{item.description}
											</p>
										</div>

										<div className="flex items-center justify-between gap-4">
											<span className="text-lg font-extrabold text-orange-600">
												{item.price}
											</span>
											<button
												type="button"
												onClick={() =>
													addItem({
														id: item.id,
														name: item.name,
														price: Number(item.price.replace(/[^\d]/g, "")),
														image: item.image,
													})
												}
												className="inline-flex items-center justify-center rounded-full bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-700"
											>
												Add to Cart
											</button>
										</div>
									</div>
								</article>
							))}
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
