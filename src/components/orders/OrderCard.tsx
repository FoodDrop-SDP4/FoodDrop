"use client";

import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ChefHat,
  AlertCircle,
  MapPin,
  Star,
  Bike,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Order, OrderStatus } from "../../types";

interface OrderCardProps {
  order: Order;
  onOpenReviewModal: (order: Order) => void;
  onCancelOrder?: (order: Order) => void;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Order Placed",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    icon: Clock,
  },
  PREPARING: {
    label: "Preparing Food",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    icon: ChefHat,
  },
  ACCEPTED_BY_RIDER: {
    label: "Rider Assigned",
    bg: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-700",
    icon: Bike,
  },
  READY_FOR_PICKUP: {
    label: "Ready for Pickup",
    bg: "bg-purple-50 border-purple-200",
    text: "text-purple-700",
    icon: Package,
  },
  ON_THE_WAY: {
    label: "On the Way",
    bg: "bg-orange-50 border-orange-200",
    text: "text-orange-700",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
    icon: AlertCircle,
  },
};

export default function OrderCard({
  order,
  onOpenReviewModal,
  onCancelOrder,
}: OrderCardProps) {
  const currentStatus = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = currentStatus.icon;

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isActiveOrder =
    order.status !== "DELIVERED" && order.status !== "CANCELLED";

  const storedPayment =
    typeof window !== "undefined"
      ? localStorage.getItem(`fooddrop_order_${order.id}_payment`)
      : null;

  const paymentMethod = order.paymentMethod || storedPayment || "CASH_ON_DELIVERY";
  const isOnlinePaid = paymentMethod !== "CASH_ON_DELIVERY";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Order #{order.id.slice(0, 8)}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">{formattedDate}</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 mt-1">
            {order.restaurant?.name || "Restaurant"}
          </h3>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold ${currentStatus.bg} ${currentStatus.text}`}
        >
          <StatusIcon className="h-4 w-4" />
          <span>{currentStatus.label}</span>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="p-6 divide-y divide-slate-100">
        <div className="space-y-3 pb-4">
          {order.orderItems.map((item, idx) => (
            <div key={item.id || idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                {item.menuItem.imageUrl && (
                  <img
                    src={item.menuItem.imageUrl}
                    alt={item.menuItem.name}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                )}
                <div>
                  <p className="font-bold text-slate-900">{item.menuItem.name}</p>
                  <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-bold text-slate-800">
                ৳{item.menuItem.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Footer info & Actions */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate max-w-xs">{order.deliveryAddress}</span>
            </div>
            {(order.contactPhone || order.customer?.phone) && (
              <p className="text-[11px] text-slate-400 font-medium pl-6">
                Contact: <span className="font-bold text-slate-600">{order.contactPhone || order.customer?.phone}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 ml-auto">
            <div className="text-right mr-2">
              <span className="text-[11px] text-slate-400 font-bold block">
                {isOnlinePaid ? `Paid (${paymentMethod})` : "Cash on Delivery"}
              </span>
              <span className="text-base font-black text-slate-900">৳{order.totalAmount}</span>
            </div>

            {/* 🚀 Show Live Tracking button ONLY for active ongoing orders */}
            {isActiveOrder && (
              <Link
                href={`/orders/${order.id}/track`}
                className="flex items-center gap-1.5 rounded-2xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 active:scale-95"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Track Live on Map 🗺️</span>
              </Link>
            )}

            {/* Customer can cancel only if PENDING (before restaurant starts cooking) */}
            {order.status === "PENDING" && onCancelOrder && (
              <button
                onClick={() => onCancelOrder({ ...order, paymentMethod })}
                className="flex items-center gap-1 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600 border border-rose-200 transition hover:bg-rose-100 active:scale-95"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Cancel Order</span>
              </button>
            )}

            {/* Delivered actions */}
            {order.status === "DELIVERED" && (
              <button
                onClick={() => onOpenReviewModal(order)}
                className="flex items-center gap-1.5 rounded-2xl bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-600 border border-orange-200 transition hover:bg-orange-100 active:scale-95"
              >
                <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                <span>Rate & Review</span>
              </button>
            )}

            {/* Cancelled notice - Online Refunded vs COD */}
            {order.status === "CANCELLED" && (
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  isOnlinePaid
                    ? "text-rose-600 bg-rose-50 border-rose-200"
                    : "text-slate-600 bg-slate-100 border-slate-200"
                }`}
              >
                {isOnlinePaid
                  ? `Cancelled • Auto-Refunded (${paymentMethod})`
                  : "Cancelled (COD • No Charge)"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
