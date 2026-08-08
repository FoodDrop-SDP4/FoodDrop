"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, User, Phone, MapPin, Star, DollarSign, Package, Calendar, HelpCircle, PhoneCall, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function RiderProfilePage() {
  const router = useRouter();
  const [rider, setRider] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "TODAY" | "WEEK">("ALL");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/rider/register");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== "RIDER") {
      router.push("/");
      return;
    }

    setRider(user);

    fetch(`/api/rider/history?riderId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setHistoryData(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  const filteredOrders = historyData?.orders?.filter((order: any) => {
    if (filter === "TODAY") {
      const today = new Date().toDateString();
      return new Date(order.updatedAt).toDateString() === today;
    }
    if (filter === "WEEK") {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return new Date(order.updatedAt) >= startOfWeek;
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-50 font-sans pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6 space-y-8">
        
        <Link href="/rider" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* 1. Rider Profile Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 font-black text-xl">
              <Bike className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{rider?.name}</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {rider?.vehicleType} {rider?.vehicleNumber ? `(${rider.vehicleNumber})` : ""}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs font-bold">
                <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <Star className="h-3.5 w-3.5 fill-amber-400" /> {rider?.rating || "5.0"}
                </span>
                <span className="text-slate-500">{rider?.phone}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-slate-400">Total Completed</p>
            <p className="text-2xl font-black text-slate-900">{historyData?.earnings?.totalDeliveries || 0} Orders</p>
          </div>
        </div>

        {/* 2. Earnings Overview */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600" /> Earnings Overview
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400">Today's Earnings</p>
              <h3 className="text-2xl font-black text-orange-600 mt-1">৳{historyData?.earnings?.today || 0}</h3>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400">This Week</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">৳{historyData?.earnings?.thisWeek || 0}</h3>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400">Total Lifetime Earnings</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">৳{historyData?.earnings?.total || 0}</h3>
            </div>
          </div>
        </div>

        {/* 3. Delivery History with Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" /> Delivery History
            </h2>

            <div className="flex gap-2">
              {(["ALL", "TODAY", "WEEK"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    filter === item
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item === "ALL" ? "All Time" : item === "TODAY" ? "Today" : "This Week"}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders?.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
              <p className="font-bold text-slate-600">No completed deliveries found for this filter.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredOrders?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{order.restaurant?.name}</h4>
                    <p className="text-xs text-slate-400">
                      Order #{order.id.slice(-6)} • {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-600 text-sm">+৳{order.deliveryFee || 60}</span>
                    <p className="text-[10px] font-bold text-slate-400">Completed</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Support Section */}
        <div className="rounded-3xl border border-slate-200/80 bg-orange-50/50 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-orange-600" /> Need Help or Support?
            </h3>
            <p className="text-xs text-slate-500 mt-1">Facing delivery issues, payment mismatch, or customer problems?</p>
          </div>
          <a
            href="tel:01700000000"
            className="flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-orange-200 transition hover:bg-orange-700"
          >
            <PhoneCall className="h-4 w-4" /> Contact Rider Support
          </a>
        </div>

      </div>
    </main>
  );
}