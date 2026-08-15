import { User } from "./user";
import { MenuItem } from "./menu";
import { Restaurant } from "./restaurant";

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "ACCEPTED_BY_RIDER"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id?: string;
  quantity: number;
  menuItemId?: string;
  menuItem: {
    id?: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    category?: string | null;
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
  restaurant?: {
    id?: string;
    name: string;
    address?: string;
    phone?: string;
  };
  customer?: {
    id?: string;
    name: string;
    phone?: string | null;
  };
  rider?: User | null;
  orderItems: OrderItem[];
}

export interface TodaySummary {
  count: number;
  earnings: number;
}

export interface RiderEarningsSummary {
  today: number;
  thisWeek: number;
  total: number;
  totalDeliveries: number;
}

export interface RiderHistoryResponse {
  orders: Order[];
  earnings: RiderEarningsSummary;
}

export interface RestaurantDashboardData {
  ownerName: string;
  restaurant: Restaurant & {
    orders: Order[];
  };
  stats: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrdersCount: number;
  };
}
