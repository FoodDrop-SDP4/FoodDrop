"use client";

import { useEffect, useState, use } from "react";
import { Loader2, MapPin, Star, Plus, Store } from "lucide-react";
import { Restaurant, MenuItem } from "../../../types";
import { useCartStore } from "../../../store/useCartStore";
import FoodDetailModal from "../../../components/food/FoodDetailModal";

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const resolvedParams = use(params);
  const restaurantId = resolvedParams.id;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data);
        }
      } catch (err) {
        console.error("Error fetching restaurant:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantId) fetchRestaurantDetails();
  }, [restaurantId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-500">
        <Store className="h-12 w-12 text-slate-300 mb-2" />
        <h2 className="text-xl font-bold text-slate-700">Restaurant not found!</h2>
      </div>
    );
  }

  const totalReviews = restaurant.reviews?.length || 0;
  const avgRating =
    totalReviews > 0
      ? (
          restaurant.reviews!.reduce(
            (sum: number, r) => sum + Number(r.rating || 0),
            0
          ) / totalReviews
        ).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-16 pt-20">
      {/* Banner Section */}
      <div className="relative h-64 sm:h-80 w-full bg-slate-950">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600"
          alt="Banner"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 mx-auto max-w-7xl text-white">
          <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Verified Restaurant
          </span>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{restaurant.name}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-orange-500" />
              {restaurant.address || "Location set"}
            </span>

            <span className="flex items-center gap-1 font-bold">
              <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
              {totalReviews > 0 ? (
                <>
                  <span>{avgRating}</span>
                  <span className="text-slate-400 font-normal">
                    ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </>
              ) : (
                <span className="text-orange-400">New Restaurant</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-2xl font-black text-slate-900 mb-8">
          Available Menu ({restaurant.menuItems?.length || 0})
        </h2>

        {!restaurant.menuItems || restaurant.menuItems.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
            No items available in this restaurant right now.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurant.menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md cursor-pointer"
              >
                <div className="flex gap-4">
                  <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                    alt={item.name}
                    className="h-20 w-20 rounded-2xl object-cover shrink-0 transition duration-300 group-hover:scale-105"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 transition group-hover:text-orange-600">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-black text-orange-600 text-sm">৳{item.price}</span>
                      {item.category && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                      quantity: 1,
                      restaurantId: restaurant.id,
                      restaurantName: restaurant.name,
                    });
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reusable Food Detail Modal */}
      <FoodDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        restaurantName={restaurant.name}
      />
    </main>
  );
}