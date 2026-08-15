export type Role = "CUSTOMER" | "RESTAURANT_OWNER" | "RIDER";

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "ACCEPTED_BY_RIDER"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  profilePic?: string | null;
  isOnline?: boolean;
  rating?: number;
  totalReviews?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
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

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  isOnline?: boolean;
  ownerId?: string;
  menuItems?: MenuItem[];
  reviews?: Review[];
  orders?: Order[];
  createdAt?: string;
}

export interface OrderItem {
  id?: string;
  quantity: number;
  menuItemId?: string;
  menuItem: {
    id?: string;
    name: string;
    price: number;
    imageUrl?: string | null;
  };
}

export interface Order {
  id: string;
  totalAmount: number;
  deliveryFee?: number;
  status: OrderStatus;
  deliveryAddress: string;
  customerId: string;
  restaurantId: string;
  riderId?: string | null;
  createdAt: string;
  updatedAt?: string;
  restaurant: {
    id?: string;
    name: string;
    address?: string;
  };
  customer?: {
    id?: string;
    name: string;
    phone?: string | null;
  };
  orderItems: OrderItem[];
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  address: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  userId?: string;
  restaurantId?: string;
  menuItemId?: string | null;
  createdAt?: string;
  user?: {
    name: string;
  };
}

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
