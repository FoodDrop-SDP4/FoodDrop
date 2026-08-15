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
