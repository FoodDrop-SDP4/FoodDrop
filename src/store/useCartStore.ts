import { create } from "zustand";

export interface CartItem {
	id: string | number;
	name: string;
	price: number;
	quantity: number;
	image: string;
}

export interface CartState {
	items: CartItem[];
	addItem: (item: Omit<CartItem, "quantity">) => void;
	removeItem: (id: CartItem["id"]) => void;
	updateQuantity: (id: CartItem["id"], quantity: number) => void;
	clearCart: () => void;
	getTotalItems: () => number;
	getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
	items: [],
	addItem: (item) =>
		set((state) => {
			const existingItem = state.items.find((cartItem) => cartItem.id === item.id);

			if (existingItem) {
				return {
					items: state.items.map((cartItem) =>
						cartItem.id === item.id
							? { ...cartItem, quantity: cartItem.quantity + 1 }
							: cartItem,
					),
				};
			}

			return {
				items: [...state.items, { ...item, quantity: 1 }],
			};
		}),
	removeItem: (id) =>
		set((state) => ({
			items: state.items.filter((item) => item.id !== id),
		})),
	updateQuantity: (id, quantity) =>
		set((state) => ({
			items:
				quantity <= 0
					? state.items.filter((item) => item.id !== id)
					: state.items.map((item) =>
						item.id === id ? { ...item, quantity } : item,
					),
		})),
	clearCart: () => set({ items: [] }),
	getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
	getTotalPrice: () =>
		get().items.reduce((total, item) => total + item.price * item.quantity, 0),
}));
