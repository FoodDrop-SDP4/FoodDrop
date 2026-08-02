"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

interface CartDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

const formatTaka = (value: number) =>
	new Intl.NumberFormat("bn-BD", {
		style: "currency",
		currency: "BDT",
		currencyDisplay: "narrowSymbol",
		maximumFractionDigits: 0,
	}).format(value);

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
	const items = useCartStore((state) => state.items);
	const updateQuantity = useCartStore((state) => state.updateQuantity);
	const removeItem = useCartStore((state) => state.removeItem);
	const totalPrice = useCartStore((state) => state.getTotalPrice());

	if (!mounted || !isOpen) return null;

	return createPortal(
		<div
			className={`fixed inset-0 z-[9999] flex justify-end overflow-hidden ${
				isOpen ? "pointer-events-auto" : "pointer-events-none"
			}`}
			aria-hidden={!isOpen}
		>
			<button
				type="button"
				aria-label="Close cart drawer"
				onClick={onClose}
				className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
					isOpen ? "opacity-100" : "opacity-0"
				}`}
			/>

			<div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
				<aside
					role="dialog"
					aria-modal="true"
					aria-label="Cart drawer"
					className={`relative z-50 flex h-screen w-screen max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out pointer-events-auto ${
						isOpen ? "translate-x-0" : "translate-x-full"
					}`}
				>
					<header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4">
						<div>
							<p className="text-xs font-bold uppercase tracking-wider text-orange-600">
								Cart
							</p>
							<h2 className="text-xl font-bold text-gray-900">Your Order</h2>
						</div>

						<button
							type="button"
							onClick={onClose}
							className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
							aria-label="Close cart"
						>
							<X className="h-5 w-5" />
						</button>
					</header>

					<div className="flex-1 min-h-0 overflow-y-auto space-y-4 bg-gray-50 p-4 scrollbar-thin">
						{items.length === 0 ? (
							<div className="flex min-h-full items-center justify-center p-6 text-center">
								<div className="w-full max-w-xs">
									<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 mx-auto">
										<ShoppingBag className="h-8 w-8 text-orange-500" />
									</div>
									<p className="font-medium text-gray-500">Your cart is empty</p>
									<button
										type="button"
										onClick={onClose}
										className="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
									>
										Browse Food
									</button>
								</div>
								</div>
						) : (
							items.map((item) => (
								<div
									key={item.id}
									className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
								>
									<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
										<Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
									</div>

									<div className="min-w-0 flex-1">
										<h4 className="truncate text-sm font-bold text-gray-900">{item.name}</h4>
										<p className="mt-0.5 text-sm font-extrabold text-orange-600">{formatTaka(item.price)}</p>
									</div>

									<div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-1">
										<button
											type="button"
											onClick={() => updateQuantity(item.id, item.quantity - 1)}
											className="rounded-lg p-1 text-gray-600 transition hover:bg-white"
											aria-label={`Decrease quantity of ${item.name}`}
										>
											<Minus className="h-3 w-3" />
										</button>
										<span className="w-4 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
										<button
											type="button"
											onClick={() => updateQuantity(item.id, item.quantity + 1)}
											className="rounded-lg p-1 text-gray-600 transition hover:bg-white"
											aria-label={`Increase quantity of ${item.name}`}
										>
											<Plus className="h-3 w-3" />
										</button>
									</div>

									<button
										type="button"
										onClick={() => removeItem(item.id)}
										className="rounded-full p-2 text-gray-400 transition hover:text-red-500"
										aria-label={`Remove ${item.name}`}
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							))
						)}
					</div>

					<footer className="sticky bottom-0 z-10 shrink-0 border-t border-gray-200 bg-white p-4 shadow-lg">
						<div className="mb-4 flex items-center justify-between">
							<span className="font-medium text-gray-500">Subtotal</span>
							<span className="text-xl font-black text-gray-900">{formatTaka(totalPrice)}</span>
						</div>
						<Link
							href="/checkout"
							onClick={onClose}
							className="inline-flex w-full items-center justify-center rounded-2xl bg-orange-600 py-4 text-center font-bold text-white shadow-lg shadow-orange-600/20 transition active:scale-[0.98] hover:bg-orange-700"
						>
							Proceed to Checkout
						</Link>
					</footer>
				</aside>
			</div>
		</div>,
		document.body,
	);
}
