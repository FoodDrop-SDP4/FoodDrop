import { Review } from "./review";

export const CATEGORIES = [
  "All",
  "Biryani & Rice",
  "Fast Food & Burger",
  "Pizza & Pasta",
  "Chinese & Thai",
  "Dessert & Bakery",
  "Beverages & Drinks",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  imageUrl: string | null;
  category?: string | null;
  isAvailable?: boolean;
  restaurantId: string;
  avgRating?: number;
  totalReviews?: number;
  restaurant?: {
    id?: string;
    name: string;
    address?: string;
    reviews?: Review[];
  };
}
