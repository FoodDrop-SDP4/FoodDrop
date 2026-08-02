import Link from "next/link";
import { CheckCircle } from "lucide-react";

const stages = [
	{ label: "Order Confirmed", status: "active" },
	{ label: "Preparing Food", status: "active" },
	{ label: "Out for Delivery", status: "pending" },
	{ label: "Arrived at Destination", status: "pending" },
];

export default function OrderSuccessPage() {
	return (
		<main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
			<section className="w-full max-w-3xl rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
				<div className="flex flex-col items-center text-center">
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 shadow-sm shadow-green-100">
						<CheckCircle className="h-12 w-12 animate-pulse text-green-600" />
					</div>

					<h1 className="mt-6 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
						Order Placed Successfully!
					</h1>
					<p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base">
						Thank you for ordering from FoodDrop! Your food is on the way.
					</p>
				</div>

				<div className="mt-10 rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
					<div className="mb-5 flex items-center justify-between">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
								Live Tracker
							</p>
							<h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">
								Your order progress
							</h2>
						</div>
					</div>

					<div className="space-y-4">
						{stages.map((stage, index) => {
							const isActive = stage.status === "active";

							return (
								<div key={stage.label} className="flex gap-4">
									<div className="flex flex-col items-center">
										<div
											className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
												isActive
													? "border-green-600 bg-green-600 text-white shadow-sm shadow-green-200"
													: "border-zinc-300 bg-white text-zinc-400"
											}`}
										>
											<span className="text-sm font-bold">{index + 1}</span>
										</div>
										{index < stages.length - 1 ? (
											<div className={`mt-2 h-10 w-px ${isActive ? "bg-green-200" : "bg-zinc-200"}`} />
										) : null}
									</div>

									<div className="flex-1 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
										<div className="flex items-center justify-between gap-3">
											<h3 className="text-base font-bold text-zinc-950">{stage.label}</h3>
											<span
												className={`rounded-full px-3 py-1 text-xs font-semibold ${
													isActive
														? "bg-green-50 text-green-700"
														: "bg-zinc-100 text-zinc-500"
												}`}
											>
												{isActive ? "In Progress" : "Pending"}
											</span>
										</div>
										<p className="mt-2 text-sm leading-6 text-zinc-600">
											{isActive
												? index === 0
													? "We have received your order and are confirming the details."
													: "Our kitchen is preparing your meal with care."
												: index === 2
													? "Your rider will head out once the food is ready."
													: "Your order will arrive at your doorstep shortly."
											}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className="mt-10 flex justify-center">
					<Link
						href="/"
						className="inline-flex items-center justify-center rounded-full bg-orange-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
					>
						Back to Home
					</Link>
				</div>
			</section>
		</main>
	);
}
