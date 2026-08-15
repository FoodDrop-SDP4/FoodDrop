"use client";

import { use, useEffect, useState } from "react";
import { Loader2, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Order } from "../../../../types";
import OrderTrackingView from "../../../../components/tracking/OrderTrackingView";

interface TrackPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderTrackPage({ params }: TrackPageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Error loading order tracking data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
          <p className="text-sm font-bold text-slate-700">Connecting to Live GPS Tracking...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <Package className="h-16 w-16 stroke-1 text-slate-300 mb-3" />
        <h2 className="text-xl font-black text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          We couldn't retrieve tracking data for this order ID. It may have been archived or removed.
        </p>
        <Link
          href="/orders"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-bold text-white transition hover:bg-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  return <OrderTrackingView initialOrder={order} />;
}
