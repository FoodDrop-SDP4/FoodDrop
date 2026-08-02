import Image from "next/image";

const categories = [
	{
		name: "Burger",
		image:
			"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80",
	},
	{
		name: "Pizza",
		image:
			"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80",
	},
	{
		name: "Biryani",
		image:
			"https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=150&q=80",
	},
	{
		name: "Pasta",
		image:
			"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=150&q=80",
	},
	{
		name: "Desserts",
		image:
			"https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=150&q=80",
	},
	{
		name: "Drinks",
		image:
			"https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=150&q=80",
	},
];

export default function Categories() {
	return (
		<section className="bg-zinc-50 py-6 sm:py-8">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-4 flex items-end justify-between gap-4">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
							Categories
						</p>
						<h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
							Browse by cravings
						</h2>
					</div>
				</div>

				<div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
					{categories.map((category) => (
						<button
							key={category.name}
							type="button"
							className="group flex min-w-[7.5rem] flex-none flex-col items-center gap-3 rounded-3xl border border-zinc-200 bg-white px-5 py-4 text-center shadow-sm transition duration-200 hover:border-orange-300 hover:scale-105 hover:shadow-md hover:shadow-orange-100"
						>
							<span className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-orange-100 bg-orange-50 shadow-sm transition group-hover:border-orange-300">
								<Image
									src={category.image}
									alt={category.name}
									fill
									sizes="56px"
									className="object-cover"
								/>
							</span>
							<span className="text-sm font-semibold text-zinc-800">
								{category.name}
							</span>
						</button>
					))}
				</div>
			</div>
		</section>
	);
}
