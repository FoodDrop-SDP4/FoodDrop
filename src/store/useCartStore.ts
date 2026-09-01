// File: src/store/useCartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
};

type CartStore = {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => void;
  addMultipleToCart: (items: CartItem[]) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addToCart: (newItem) =>
        set((state) => {
          const isDifferentRestaurant =
            state.cart.length > 0 && state.cart[0].restaurantId !== newItem.restaurantId;

          const currentCart = isDifferentRestaurant ? [] : state.cart;
          const existingItem = currentCart.find((item) => item.id === newItem.id);

          if (existingItem) {
            return {
              cart: currentCart.map((item) =>
                item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }

          return {
            cart: [...currentCart, { ...newItem, quantity: 1 }],
          };
        }),

      addMultipleToCart: (newItems) =>
        set((state) => {
          if (!newItems || newItems.length === 0) return state;

          const incomingRestaurantId = newItems[0].restaurantId;
          const isDifferentRestaurant =
            state.cart.length > 0 && state.cart[0].restaurantId !== incomingRestaurantId;

          let updatedCart = isDifferentRestaurant ? [] : [...state.cart];

          for (const newItem of newItems) {
            const existingIndex = updatedCart.findIndex((item) => item.id === newItem.id);
            if (existingIndex > -1) {
              updatedCart[existingIndex] = {
                ...updatedCart[existingIndex],
                quantity: updatedCart[existingIndex].quantity + (newItem.quantity || 1),
              };
            } else {
              updatedCart.push({ ...newItem, quantity: newItem.quantity || 1 });
            }
          }

          return { cart: updatedCart };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, delta) =>
        set((state) => ({
          cart: state.cart
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[],
        })),

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "fooddrop-cart-storage",
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);