"use client";

import { FormEvent, useEffect, useState } from "react";
import { 
  Plus, Utensils, DollarSign, AlignLeft, Image as ImageIcon, 
  Loader2, RefreshCcw, ShoppingBag, TrendingUp, Clock, ChefHat, User as UserIcon, Store, Tag, Trash2, XCircle, Edit, Settings, ToggleLeft, ToggleRight, X 
} from "lucide-react";
import { MenuItem, Order, Restaurant, RestaurantStats } from "../../types";

type RestaurantData = Restaurant & {
  orders: Order[];
  menuItems: MenuItem[];
};

export default function ProfessionalRestaurantDashboard() {
  const [ownerName, setOwnerName] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [stats, setStats] = useState<RestaurantStats>({ totalRevenue: 0, totalOrders: 0, pendingOrdersCount: 0 });
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deletingFoodId, setDeletingFoodId] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Fast Food & Burger");

  // Modal States
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editResName, setEditResName] = useState("");
  const [editResAddress, setEditResAddress] = useState("");

  const fetchDashboardData = async (targetId?: string) => {
    const activeId = targetId || ownerId;
    if (!activeId) return setIsFetching(false);

    setIsFetching(true);
    try {
      const res = await fetch(`/api/restaurants/dashboard?ownerId=${activeId}`);
      if (res.ok) {
        const result = await res.json();
        setOwnerName(result.ownerName || "Owner");
        setRestaurant(result.restaurant);
        setStats(result.stats);
        if (result.restaurant) {
          setEditResName(result.restaurant.name);
          setEditResAddress(result.restaurant.address);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id) {
          setOwnerId(parsedUser.id);
          setOwnerName(parsedUser.name || "Owner");
          fetchDashboardData(parsedUser.id);
        } else setIsFetching(false);
      } catch (err) {
        setIsFetching(false);
      }
    } else setIsFetching(false);
  }, []);

  const handleAddFood = async (e: FormEvent) => {
    e.preventDefault();
    if (!ownerId) return alert("Owner info missing.");
    setIsLoading(true);

    try {
      const res = await fetch("/api/restaurants/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, price, category, imageUrl, ownerId }),
      });

      if (res.ok) {
        setName(""); setDescription(""); setPrice(""); setImageUrl("");
        setCategory("Fast Food & Burger");
        fetchDashboardData(ownerId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Stock Toggle
  const handleToggleStock = async (item: MenuItem) => {
    try {
      const res = await fetch("/api/restaurants/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isAvailable: !(item.isAvailable ?? true) }),
      });
      if (res.ok) fetchDashboardData(ownerId || undefined);
    } catch (err) {
      console.error(err);
    }
  };

  // 🚀 Save Edited Menu Item
  const handleSaveEditItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/restaurants/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        setEditingItem(null);
        fetchDashboardData(ownerId || undefined);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Save Profile
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/restaurants/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: restaurant.id, name: editResName, address: editResAddress }),
      });

      if (res.ok) {
        setIsProfileModalOpen(false);
        fetchDashboardData(ownerId || undefined);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    if (!confirm("Are you sure?")) return;
    setDeletingFoodId(foodId);
    try {
      const res = await fetch(`/api/restaurants/menu?id=${foodId}`, { method: "DELETE" });
      if (res.ok) fetchDashboardData(ownerId || undefined);
    } finally {
      setDeletingFoodId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setActionLoadingId(orderId);
    try {
      const res = await fetch("/api/orders/rider", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        if (newStatus === "CANCELLED") {
          const target = restaurant?.orders.find((o) => o.id === orderId);
          const isOnline =
            target?.paymentMethod && target.paymentMethod !== "CASH_ON_DELIVERY";
          if (isOnline) {
            alert(
              `Order declined. An automated refund of ৳${target?.totalAmount} has been initiated to the customer's ${target?.paymentMethod} account.`
            );
          } else {
            alert("Order declined. (Cash on Delivery order - no payment charged).");
          }
        }
        fetchDashboardData(ownerId || undefined);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500";

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      
      {/* Sub-Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white font-black shadow-md shadow-orange-200">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{restaurant?.name || "My Restaurant"}</h2>
                <button onClick={() => setIsProfileModalOpen(true)} className="text-slate-400 hover:text-orange-600 transition">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">{restaurant?.address || "Location pending"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              <UserIcon className="h-4 w-4 text-orange-600" />
              <span>{ownerName || "Owner"}</span>
            </div>
            <button onClick={() => fetchDashboardData()} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow hover:bg-orange-600 transition">
              <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        
        {/* Metrics */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><TrendingUp className="h-7 w-7" /></div>
            <div><p className="text-sm font-medium text-slate-500">Total Revenue</p><h3 className="text-2xl font-black text-slate-950">৳{stats.totalRevenue}</h3></div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><ShoppingBag className="h-7 w-7" /></div>
            <div><p className="text-sm font-medium text-slate-500">Total Orders Received</p><h3 className="text-2xl font-black text-slate-950">{stats.totalOrders}</h3></div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Clock className="h-7 w-7" /></div>
            <div><p className="text-sm font-medium text-slate-500">Active Kitchen Orders</p><h3 className="text-2xl font-black text-slate-950">{stats.pendingOrdersCount}</h3></div>
          </div>
        </div>

        {/* Workspace */}
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          
          {/* Add Food */}
          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><Plus className="h-5 w-5" /></div>
              <h2 className="text-xl font-bold text-slate-900">Add Menu Item</h2>
            </div>
            <form onSubmit={handleAddFood} className="space-y-4">
              <div className="relative"><Utensils className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Food Name" className={inputClassName} /></div>
              <div className="relative"><DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input required value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price (৳)" className={inputClassName} /></div>
              <div className="relative"><Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputClassName} appearance-none cursor-pointer font-semibold`}>
                  <option value="Biryani & Rice">Biryani & Rice</option>
                  <option value="Fast Food & Burger">Fast Food & Burger</option>
                  <option value="Pizza & Pasta">Pizza & Pasta</option>
                  <option value="Chinese & Thai">Chinese & Thai</option>
                  <option value="Dessert & Bakery">Dessert & Bakery</option>
                  <option value="Beverages & Drinks">Beverages & Drinks</option>
                </select>
              </div>
              <div className="relative"><AlignLeft className="absolute left-4 top-1/4 h-4 w-4 text-slate-400" /><textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." className={`${inputClassName} min-h-[90px] resize-none pl-11`} /></div>
              <div className="relative"><ImageIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} type="url" placeholder="Image URL (Optional)" className={inputClassName} /></div>
              <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-orange-700">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Publish to Menu"}
              </button>
            </form>
          </section>

          {/* Right Panel */}
          <div className="space-y-8">
            
            {/* Live Orders */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-900 flex items-center gap-2"><ChefHat className="h-6 w-6 text-orange-600" />Live Kitchen Feed ({restaurant?.orders.length || 0})</h2>
              {isFetching ? (
                <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
              ) : !restaurant?.orders || restaurant.orders.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm">No orders right now.</div>
              ) : (
                <div className="space-y-4">
                  {restaurant.orders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>{order.status}</span>
                            <span className="text-[11px] font-bold text-slate-400">
                              {order.paymentMethod && order.paymentMethod !== "CASH_ON_DELIVERY" ? `Paid (${order.paymentMethod})` : "Cash on Delivery"}
                            </span>
                          </div>
                          <h4 className="mt-2 font-black text-slate-900">৳{order.totalAmount}</h4>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          <p className="font-bold text-slate-900">{order.customer?.name || "Customer"}</p>
                          <p>{order.contactPhone || order.customer?.phone || "No Phone"}</p>
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 border-t border-slate-200/60 pt-2"><ul className="list-disc pl-4 space-y-0.5">{order.orderItems?.map((oi) => (<li key={oi.id}>{oi.menuItem?.name} × {oi.quantity}</li>))}</ul></div>
                      <div className="flex gap-2 pt-2">
                        {order.status === "PENDING" && (
                          <>
                            <button onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")} disabled={actionLoadingId === order.id} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700">Accept Order</button>
                            <button onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")} disabled={actionLoadingId === order.id} className="flex items-center gap-1 rounded-xl bg-red-100 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-200"><XCircle className="h-4 w-4" />Decline</button>
                          </>
                        )}
                        {order.status === "PREPARING" && (
                          <button onClick={() => handleUpdateOrderStatus(order.id, "READY_FOR_PICKUP")} disabled={actionLoadingId === order.id} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700">Mark Ready for Rider</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Menu Management */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-900">Active Restaurant Menu</h2>
              {!restaurant?.menuItems || restaurant.menuItems.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm">No food items added yet.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {restaurant.menuItems.map((item) => (
                    <div key={item.id} className={`flex gap-4 rounded-2xl border p-4 shadow-sm items-center relative overflow-hidden transition ${item.isAvailable ?? true ? "border-slate-100 bg-white" : "border-slate-200 bg-slate-100/60 opacity-70"}`}>
                      <img src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={item.name} className="h-16 w-16 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0 pr-16">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                          {!(item.isAvailable ?? true) && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">UNAVAILABLE</span>}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{item.description}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="font-black text-orange-600 text-sm">৳{item.price}</p>
                          {item.category && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{item.category}</span>}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button onClick={() => handleToggleStock(item)} title={item.isAvailable ?? true ? "Mark Out of Stock" : "Mark Available"} className="p-1.5 text-slate-500 hover:text-orange-600 transition">
                          {item.isAvailable ?? true ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" />}
                        </button>
                        <button onClick={() => setEditingItem(item)} title="Edit Item" className="p-1.5 text-slate-400 hover:text-blue-600 transition">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteFood(item.id)} title="Delete Item" className="p-1.5 text-slate-400 hover:text-red-600 transition">
                          {deletingFoodId === item.id ? <Loader2 className="h-4 w-4 animate-spin text-red-600" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

        </div>
      </div>

      {/* 🚀 Modal 1: Edit Food Item */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Edit Menu Item</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveEditItem} className="space-y-3">
              <div><label className="text-xs font-bold text-slate-600">Name</label><input required value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className="w-full rounded-xl border bg-gray-50 p-3 text-sm" /></div>
              <div><label className="text-xs font-bold text-slate-600">Price (৳)</label><input required type="number" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })} className="w-full rounded-xl border bg-gray-50 p-3 text-sm" /></div>
              <div><label className="text-xs font-bold text-slate-600">Category</label>
                <select value={editingItem.category || "Fast Food & Burger"} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} className="w-full rounded-xl border bg-gray-50 p-3 text-sm font-semibold">
                  <option value="Biryani & Rice">Biryani & Rice</option>
                  <option value="Fast Food & Burger">Fast Food & Burger</option>
                  <option value="Pizza & Pasta">Pizza & Pasta</option>
                  <option value="Chinese & Thai">Chinese & Thai</option>
                  <option value="Dessert & Bakery">Dessert & Bakery</option>
                  <option value="Beverages & Drinks">Beverages & Drinks</option>
                </select>
              </div>
              <div><label className="text-xs font-bold text-slate-600">Description</label><textarea value={editingItem.description || ""} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full rounded-xl border bg-gray-50 p-3 text-sm min-h-[70px]" /></div>
              <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-orange-600 py-3 text-sm font-bold text-white shadow hover:bg-orange-700">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 Modal 2: Edit Restaurant Profile */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Update Restaurant Details</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div><label className="text-xs font-bold text-slate-600">Restaurant Name</label><input required value={editResName} onChange={(e) => setEditResName(e.target.value)} className="w-full rounded-xl border bg-gray-50 p-3 text-sm" /></div>
              <div><label className="text-xs font-bold text-slate-600">Address / Location</label><input required value={editResAddress} onChange={(e) => setEditResAddress(e.target.value)} className="w-full rounded-xl border bg-gray-50 p-3 text-sm" /></div>
              <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow hover:bg-orange-600">Save Profile</button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}