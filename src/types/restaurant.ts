import { MenuItem } from "./menu";
import { Review } from "./review";

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  isOnline?: boolean;
  ownerId?: string;
  menuItems?: MenuItem[];
  reviews?: Review[];
  createdAt?: string;
}

export interface RestaurantStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrdersCount: number;
}
