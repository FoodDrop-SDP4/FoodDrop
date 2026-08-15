"use client";

import { useRef } from "react";
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  QrCode,
  Sparkles,
} from "lucide-react";
import { Order } from "../../types";

interface OrderReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderReceiptModal({
  order,
  isOpen,
  onClose,
}: OrderReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;

  const isOnlinePayment =
    order.paymentMethod && order.paymentMethod !== "COD" && order.paymentMethod !== "CASH_ON_DELIVERY";

  const subtotal = order.orderItems.reduce(
    (sum, item) => sum + (item.menuItem?.price || 0) * item.quantity,
    0
  );
  const deliveryFee = order.deliveryFee ?? 60;
  const grandTotal = order.totalAmount ?? subtotal + deliveryFee;
  const discountAmount = Math.max(0, subtotal + deliveryFee - grandTotal);

  // 🖨️ Handle Print / Save as PDF
  const handlePrint = () => {
    window.print();
  };

  // 📥 Handle CSV/Text Summary Download
  const handleDownloadSummary = () => {
    const itemsList = order.orderItems
      .map(
        (it) =>
          `  - ${it.quantity}x ${it.menuItem?.name || "Dish"} (৳${it.menuItem?.price || 0} each) = ৳${(it.menuItem?.price || 0) * it.quantity}`
      )
      .join("\n");

    const content = `========================================
FOODDROP OFFICIAL TAX INVOICE & RECEIPT
========================================
Invoice No: ${invoiceNumber}
Date: ${formattedDate}
Restaurant: ${order.restaurant?.name || "FoodDrop Partner"}
Delivery To: ${order.deliveryAddress}
Contact: ${order.contactPhone || order.customer?.phone || "N/A"}

ORDER ITEMS:
${itemsList}

FINANCIAL SUMMARY:
  Subtotal: ৳${subtotal}
  Delivery Fee: ৳${deliveryFee}
  Discount: ৳${discountAmount}
  ----------------------------------------
  Grand Total: ৳${grandTotal}
  Payment Method: ${order.paymentMethod || "CASH_ON_DELIVERY"}
  Status: ${order.status}

Thank you for choosing FoodDrop!
========================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt_${invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-600 font-black text-sm">
              🧾
            </span>
            <div>
              <h3 className="text-sm font-black">Official Order Receipt</h3>
              <p className="text-[10px] text-slate-400 font-mono">{invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-orange-700 transition"
              title="Print or Save as PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadSummary}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/20 transition"
              title="Download Text Receipt"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 📄 Scrollable Printable Receipt Canvas */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/50 print:p-0 print:bg-white">
          <div
            ref={receiptRef}
            className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6 text-slate-800 print:border-none print:shadow-none print:p-0"
          >
            {/* Receipt Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-600 text-white font-black text-xs">
                    FD
                  </div>
                  <span className="text-xl font-black text-slate-900 tracking-tight">FoodDrop</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">
                  Tax Invoice & Delivery Memo
                </p>
              </div>

              <div className="text-right">
                <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-black text-slate-800">
                  {invoiceNumber}
                </span>
                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-end gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formattedDate}</span>
                </p>
              </div>
            </div>

            {/* Merchant & Customer Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-5">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  Restaurant / Kitchen
                </span>
                <h4 className="font-black text-slate-900 text-sm">
                  {order.restaurant?.name || "FoodDrop Merchant"}
                </h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {order.restaurant?.address || "Dhaka, Bangladesh"}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  Customer / Deliver To
                </span>
                <h4 className="font-black text-slate-900 text-sm">
                  {order.customer?.name || "FoodDrop Customer"}
                </h4>
                <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">
                  {order.deliveryAddress}
                </p>
                {(order.contactPhone || order.customer?.phone) && (
                  <p className="text-slate-600 text-[11px] font-bold mt-1">
                    Phone: {order.contactPhone || order.customer?.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Itemized Order Table */}
            <div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-2">Item Description</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.orderItems.map((item, idx) => (
                    <tr key={item.id || idx} className="py-2.5">
                      <td className="py-2.5 font-bold text-slate-900">
                        {item.menuItem?.name || "Menu Item"}
                      </td>
                      <td className="py-2.5 text-center font-semibold text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-600">
                        ৳{item.menuItem?.price || 0}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        ৳{(item.menuItem?.price || 0) * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Calculation */}
            <div className="border-t border-slate-200 pt-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({order.orderItems.length} items)</span>
                <span className="font-mono font-semibold text-slate-800">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Standard Delivery Fee</span>
                <span className="font-mono font-semibold text-slate-800">৳{deliveryFee}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Special Discount & Promo</span>
                  <span className="font-mono">-৳{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2.5 text-sm font-black text-slate-900">
                <span>Grand Total</span>
                <span className="font-mono text-base text-orange-600">৳{grandTotal}</span>
              </div>
            </div>

            {/* Payment & Security Verification Footer */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200/80">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Status
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                      isOnlinePayment
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {isOnlinePayment ? `Paid via ${order.paymentMethod}` : "Cash on Delivery"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono text-slate-400 block">FoodDrop Security Seal</span>
                <span className="font-mono text-[10px] font-bold text-slate-600">
                  VERIFIED-POS-AUTH
                </span>
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-medium pt-2">
              For any queries, contact support@fooddrop.com • Thank you for ordering with us!
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
