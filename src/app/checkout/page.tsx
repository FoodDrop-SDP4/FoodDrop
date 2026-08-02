"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../store/useCartStore";

type PaymentMethod = "cod" | "mobile";

const areaOptions = ["Dhanmondi", "Gulshan", "Mirpur", "Uttara", "Banani"];

const formatTaka = (value: number) =>
	new Intl.NumberFormat("bn-BD", {
		style: "currency",
		currency: "BDT",
		currencyDisplay: "narrowSymbol",
		maximumFractionDigits: 0,
	}).format(value);

export default function CheckoutPage() {
	const router = useRouter();
	const items = useCartStore((state) => state.items);
	const clearCart = useCartStore((state) => state.clearCart);
	const totalPrice = useCartStore((state) => state.getTotalPrice());
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

	const deliveryFee = 60;
	const grandTotal = totalPrice + deliveryFee;

	const orderItems = useMemo(
		() =>
			items.map((item) => ({
				...item,
				subtotal: item.price * item.quantity,
			})),
		[items],
	);

	const handlePlaceOrder = () => {
		clearCart();
		router.push("/order-success");
	};

	return (
		<main className="bg-zinc-50 py-8 text-zinc-900 sm:py-10">
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-3 lg:px-8">
				<section className="space-y-6 lg:col-span-2">
					<div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
							Checkout
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
							Complete your order
						</h1>
						<p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
							Add your delivery details and choose a payment method to finish your FoodDrop order.
						</p>
					</div>

					<div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
						<h2 className="text-xl font-bold tracking-tight text-zinc-950">
							Delivery Details
						</h2>

						<div className="mt-6 grid gap-4 sm:grid-cols-2">
							<label className="space-y-2 sm:col-span-1">
								<span className="text-sm font-medium text-zinc-700">Full Name</span>
								<input
									type="text"
									placeholder="Your full name"
									className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
								/>
							</label>

							<label className="space-y-2 sm:col-span-1">
								<span className="text-sm font-medium text-zinc-700">Phone Number</span>
								<input
									type="tel"
									placeholder="01XXXXXXXXX"
									className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
								/>
							</label>

							<label className="space-y-2 sm:col-span-2">
								<span className="text-sm font-medium text-zinc-700">Delivery Address</span>
								<input
									type="text"
									placeholder="House, road, apartment, landmark"
									className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
								/>
							</label>

							<label className="space-y-2 sm:col-span-2">
								<span className="text-sm font-medium text-zinc-700">Area</span>
								<select className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100">
									{areaOptions.map((area) => (
										<option key={area}>{area}</option>
									))}
								</select>
							</label>
						</div>
					</div>

					<div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
						<h2 className="text-xl font-bold tracking-tight text-zinc-950">
							Payment Method
						</h2>

						<div className="mt-6 grid gap-4 sm:grid-cols-2">
							<button
								type="button"
								onClick={() => setPaymentMethod("cod")}
								className={`rounded-3xl border p-5 text-left transition ${
									paymentMethod === "cod"
										? "border-orange-400 bg-orange-50 shadow-sm shadow-orange-100"
										: "border-zinc-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
								}`}
							>
								<p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
									Option 1
								</p>
								<h3 className="mt-2 text-lg font-bold text-zinc-950">Cash on Delivery</h3>
								<p className="mt-1 text-sm leading-6 text-zinc-600">
									Pay with cash when your order arrives at your doorstep.
								</p>
							</button>

							<button
								type="button"
								onClick={() => setPaymentMethod("mobile")}
								className={`rounded-3xl border p-5 text-left transition ${
									paymentMethod === "mobile"
										? "border-orange-400 bg-orange-50 shadow-sm shadow-orange-100"
										: "border-zinc-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
								}`}
							>
								<p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
									Option 2
								</p>
								<h3 className="mt-2 text-lg font-bold text-zinc-950">Mobile Banking</h3>
								<p className="mt-1 text-sm leading-6 text-zinc-600">
									Use bKash or Nagad for quick and secure payment.
								</p>
							</button>
						</div>
					</div>
				</section>

				<aside className="lg:col-span-1">
					<div className="lg:sticky lg:top-24 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
						<h2 className="text-xl font-bold tracking-tight text-zinc-950">
							Order Summary
						</h2>

						<div className="mt-6 space-y-4">
							{orderItems.length === 0 ? (
								<div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-600">
									Your cart is empty.
								</div>
							) : (
								orderItems.map((item) => (
									<div
										key={item.id}
										className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-3"
									>
										<div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl bg-white">
											<Image
												src={item.image}
												alt={item.name}
												fill
												sizes="56px"
												className="object-cover"
											/>
										</div>

										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-bold text-zinc-950">{item.name}</p>
											<p className="mt-1 text-xs text-zinc-500">Qty {item.quantity}</p>
										</div>

										<div className="text-right text-sm font-semibold text-orange-600">
											{formatTaka(item.subtotal)}
										</div>
									</div>
								))
							)}
						</div>

						<div className="mt-6 space-y-3 border-t border-zinc-200 pt-6 text-sm">
							<div className="flex items-center justify-between text-zinc-600">
								<span>Subtotal</span>
								<span className="font-semibold text-zinc-950">{formatTaka(totalPrice)}</span>
							</div>
							<div className="flex items-center justify-between text-zinc-600">
								<span>Delivery Fee</span>
								<span className="font-semibold text-zinc-950">{formatTaka(deliveryFee)}</span>
							</div>
							<div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-base">
								<span className="font-bold text-zinc-950">Grand Total</span>
								<span className="text-xl font-black text-orange-600">{formatTaka(grandTotal)}</span>
							</div>
						</div>

						<button
							type="button"
							onClick={handlePlaceOrder}
							className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-orange-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
						>
							Place Order
						</button>
					</div>
				</aside>
			</div>
		</main>
	);
}
