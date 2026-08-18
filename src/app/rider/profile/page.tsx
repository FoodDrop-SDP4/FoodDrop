"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bike,
  User as UserIcon,
  Phone,
  MapPin,
  Star,
  DollarSign,
  Package,
  Calendar,
  HelpCircle,
  PhoneCall,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Wallet,
  ArrowUpRight,
  CreditCard,
  Building2,
  CheckCircle2,
  X,
  AlertTriangle,
  Receipt,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { User, Order, RiderHistoryResponse } from "../../../types";
import { triggerFireworks, triggerConfetti } from "../../../lib/confetti";
import { playKitchenBellSound, playDeliveryCompleteSound } from "../../../lib/sound";

export default function RiderProfilePage() {
  const router = useRouter();
  const [rider, setRider] = useState<User | null>(null);
  const [historyData, setHistoryData] = useState<RiderHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "TODAY" | "WEEK">("ALL");

  // Settlement Modal State
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState<string>("");
  const [settleMethod, setSettleMethod] = useState<"BKASH" | "NAGAD" | "OFFICE">("BKASH");
  const [transactionId, setTransactionId] = useState("");
  const [isSubmittingSettle, setIsSubmittingSettle] = useState(false);
  const [settleSuccessMsg, setSettleSuccessMsg] = useState<string | null>(null);

  const fetchHistory = (riderId: string) => {
    fetch(`/api/rider/history?riderId=${riderId}`)
      .then((res) => res.json())
      .then((data) => {
        setHistoryData(data);
        if (data?.cashLedger?.payableBalance) {
          setSettleAmount(data.cashLedger.payableBalance.toString());
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

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
    fetchHistory(user.id);
  }, [router]);

  // Handle Settlement Submission
  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rider?.id || !settleAmount) return;

    setIsSubmittingSettle(true);
    try {
      const res = await fetch("/api/rider/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderId: rider.id,
          amount: parseFloat(settleAmount),
          method: settleMethod,
          transactionId: transactionId || "TXN" + Date.now().toString().slice(-6),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        playDeliveryCompleteSound();
        triggerFireworks();
        setSettleSuccessMsg(data.message || "Settlement completed successfully!");
        setTimeout(() => {
          setIsSettleModalOpen(false);
          setSettleSuccessMsg(null);
          setTransactionId("");
          fetchHistory(rider.id);
        }, 2200);
      } else {
        alert("⚠️ " + (data.message || "Settlement failed. Please try again."));
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting settlement.");
    } finally {
      setIsSubmittingSettle(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  const cashLedger = historyData?.cashLedger || {
    cashInHand: 0,
    todayCashInHand: 0,
    riderEarnings: 0,
    payableBalance: 0,
    cashLimit: 5000,
    limitUsagePercentage: 0,
    isLimitExceeded: false,
  };

  const filteredOrders = historyData?.orders?.filter((order: Order) => {
    if (!order.updatedAt) return true;
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        
        <Link href="/rider" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Rider Dashboard
        </Link>

        {/* 1. Rider Profile Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 font-black text-xl shadow-md shadow-orange-100">
              <Bike className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{rider?.name}</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {rider?.vehicleType === "Motorcycle"
                  ? `🏍️ Motorcycle • ${rider?.vehicleNumber || "Verified Registration"}`
                  : rider?.vehicleType === "Bicycle"
                  ? "🚲 Bicycle Courier • Eco Partner"
                  : rider?.vehicleType === "Walking"
                  ? "🚶 Walker Courier • Local Partner"
                  : `${rider?.vehicleType || "Delivery Partner"}`}
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

        {/* 2. 💵 COD Cash in Hand & Float Ledger (Fintech Section) */}
        <div className="rounded-3xl border-2 border-emerald-500/80 bg-white p-6 shadow-xl space-y-6 relative overflow-hidden">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-black text-emerald-800">
                  <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                  COD Cash in Hand Ledger
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Live cash collection balance & company settlement status
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSettleAmount(cashLedger.payableBalance > 0 ? cashLedger.payableBalance.toString() : "500");
                setIsSettleModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Deposit / Settle Cash</span>
            </button>
          </div>

          {/* 3 Ledger Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            
            {/* 1. Cash in Hand */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">💵 Cash in Hand</span>
                <span className="text-[10px] font-black uppercase text-slate-400">Total Collected</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">৳{cashLedger.cashInHand}</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Today: <b>৳{cashLedger.todayCashInHand}</b>
              </p>
            </div>

            {/* 2. Rider Net Earnings */}
            <div className="rounded-2xl bg-orange-50/60 p-4 border border-orange-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-700">💰 My Net Earnings</span>
                <span className="text-[10px] font-black uppercase text-orange-600">Rider Fee</span>
              </div>
              <h3 className="text-2xl font-black text-orange-600">৳{cashLedger.riderEarnings}</h3>
              <p className="text-[11px] text-orange-600/80 font-medium">
                Retained from deliveries
              </p>
            </div>

            {/* 3. Payable to Platform */}
            <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">🏦 Payable to Platform</span>
                <span className="text-[10px] font-black uppercase text-emerald-600">To Deposit</span>
              </div>
              <h3 className="text-2xl font-black text-emerald-700">৳{cashLedger.payableBalance}</h3>
              <p className="text-[11px] text-emerald-600/80 font-medium">
                Cash in Hand − My Earnings
              </p>
            </div>

          </div>

          {/* Float Limit Progress Bar */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Rider Cash Float Safety Limit
              </span>
              <span className="font-black text-slate-900">
                ৳{cashLedger.cashInHand} / ৳{cashLedger.cashLimit} ({cashLedger.limitUsagePercentage}%)
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  cashLedger.limitUsagePercentage >= 80
                    ? "bg-red-500"
                    : cashLedger.limitUsagePercentage >= 50
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${cashLedger.limitUsagePercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Limit: ৳{cashLedger.cashLimit} max un-deposited cash</span>
              {cashLedger.limitUsagePercentage >= 80 ? (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> High float! Please deposit soon.
                </span>
              ) : (
                <span className="text-emerald-600 font-bold">✓ Safe Float Status</span>
              )}
            </div>
          </div>

          {/* Recent Deposits & Settlement Receipts */}
          {historyData?.settlements && historyData.settlements.length > 0 && (
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                Deposit Receipts & Settlement History ({historyData.settlements.length})
              </h4>
              <div className="space-y-2">
                {historyData.settlements.map((st: any) => (
                  <div key={st.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">
                        {st.method === "BKASH" ? "🌸 bKash Merchant" : st.method === "NAGAD" ? "🟠 Nagad Merchant" : "🏦 Office Cash Desk"}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(st.createdAt).toLocaleDateString()} at {new Date(st.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Txn: <b className="text-slate-600">{st.transactionId || "Direct"}</b>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-700">-৳{st.amount}</span>
                      <p className="text-[10px] font-bold text-emerald-600">Settled ✓</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 3. Earnings Timeline Overview */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600" /> Earnings History
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

        {/* 4. Delivery History with Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" /> Completed Delivery History
            </h2>

            <div className="flex gap-2">
              {(["ALL", "TODAY", "WEEK"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    filter === item
                      ? "bg-slate-900 text-white shadow-sm"
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
                    <h4 className="font-bold text-slate-900 text-sm">{order.restaurant?.name || "Restaurant"}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Order #{order.id.slice(0, 8)} • {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.deliveryAddress}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        Cash Collected: ৳{order.totalAmount}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-600 text-sm">+৳{order.deliveryFee || 60}</span>
                    <p className="text-[10px] font-bold text-slate-400">Rider Payout</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Support Section */}
        <div className="rounded-3xl border border-slate-200/80 bg-orange-50/50 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-orange-600" /> Need Help or Cash Settlement Assistance?
            </h3>
            <p className="text-xs text-slate-500 mt-1">Facing float issues, payment mismatch, or customer dispute?</p>
          </div>
          <a
            href="tel:01700000000"
            className="flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-orange-200 transition hover:bg-orange-700"
          >
            <PhoneCall className="h-4 w-4" /> Contact Rider Support
          </a>
        </div>

      </div>

      {/* 6. 📱 Interactive Settlement Modal */}
      {isSettleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 space-y-5 shadow-2xl border border-slate-100 relative">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Deposit / Settle Float</h3>
                  <p className="text-[11px] text-slate-400">Payable Balance: ৳{cashLedger.payableBalance}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettleModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {settleSuccessMsg ? (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="font-black text-slate-900 text-lg">Settlement Successful!</h4>
                <p className="text-xs text-emerald-700 font-medium max-w-xs mx-auto">
                  {settleSuccessMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSettleSubmit} className="space-y-4">
                
                {/* Method Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Select Settlement Method:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSettleMethod("BKASH")}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                        settleMethod === "BKASH"
                          ? "bg-pink-50 border-pink-500 text-pink-700 font-black ring-2 ring-pink-300"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <p className="text-xs font-black">bKash</p>
                      <span className="text-[10px] opacity-80">Merchant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettleMethod("NAGAD")}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                        settleMethod === "NAGAD"
                          ? "bg-orange-50 border-orange-500 text-orange-700 font-black ring-2 ring-orange-300"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <p className="text-xs font-black">Nagad</p>
                      <span className="text-[10px] opacity-80">Merchant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettleMethod("OFFICE")}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                        settleMethod === "OFFICE"
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-black ring-2 ring-blue-300"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <p className="text-xs font-black">Office</p>
                      <span className="text-[10px] opacity-80">Cash Desk</span>
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Settlement Amount (৳):</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                    placeholder="Enter amount to deposit"
                  />
                </div>

                {/* Transaction ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Transaction ID / Reference (Optional):</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                    placeholder="e.g. 9J28DA10K or Counter Receipt No"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSettle}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingSettle ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>Confirm Settlement of ৳{settleAmount || 0}</span>
                </button>

              </form>
            )}

          </div>
        </div>
      )}

    </main>
  );
}