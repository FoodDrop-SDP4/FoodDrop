"use client";

import { useEffect, useState, use } from "react";
import { Loader2, MapPin, Star, Plus, Store, X, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../../store/useCartStore";

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const restaurantId = resolvedParams.id;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 Modal State for Selected Food Item
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);

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

  // Modal Handlers
  const handleOpenModal = (item: any) => {
    setSelectedItem(item);
    setQuantity(1);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setQuantity(1);
  };

  const handleModalAddToCart = () => {
    if (!selectedItem) return;

    addToCart({
      id: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      imageUrl: selectedItem.imageUrl,
      quantity: quantity,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    });

    handleCloseModal();
  };

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

  // Dynamic Rating and Review Count Calculation
  const totalReviews = restaurant.reviews?.length || 0;
  const avgRating =
    totalReviews > 0
      ? (
          restaurant.reviews.reduce(
            (sum: number, r: any) => sum + Number(r.rating || 0),
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
            {restaurant.menuItems.map((item: any) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => handleOpenModal(item)}
              >
                <div className="flex gap-4">
                  <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                    alt={item.name}
                    className="h-20 w-20 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition duration-300"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
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
                      imageUrl: item.imageUrl,
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

      {/* FOOD DETAIL MODAL / POPUP */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-white overflow-hidden shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-md hover:bg-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Food Image */}
            <div className="relative h-60 w-full bg-slate-100">
              <img
                src={selectedItem.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                alt={selectedItem.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Food Content Details */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedItem.name}</h2>
                  {selectedItem.category && (
                    <span className="mt-1 inline-block rounded-md bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-600 border border-orange-100">
                      {selectedItem.category}
                    </span>
                  )}
                </div>
                <span className="text-2xl font-black text-orange-600">৳{selectedItem.price}</span>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  {selectedItem.description || "No description provided for this item."}
                </p>
              </div>

              {/* Quantity Counter & Add To Cart Button */}
              <div className="mt-8 flex items-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm transition hover:bg-slate-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center font-bold text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm transition hover:bg-slate-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleModalAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart (৳{selectedItem.price * quantity})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}