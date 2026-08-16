export type Role = "CUSTOMER" | "RESTAURANT_OWNER" | "RIDER";

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
  nid?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export type SafeUser = Omit<User, "password">;
