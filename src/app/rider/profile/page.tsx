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
  Trophy,
  Award,
  Zap,
  Flame,
  Gift,
  Target,
  Crown,
  Lock,
  Check,
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

  // Claimed Quest State
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({});

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
    const checkRiderAuth = () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        window.location.href = "/login?redirect=/rider/profile";
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        if (user.role !== "RIDER") {
          window.location.href = "/login?redirect=/rider/profile";
          return;
        }

        setRider(user);
        fetchHistory(user.id);

        // Load claimed quests from localStorage
        const savedQuests = localStorage.getItem(`rider_quests_${user.id}`);
        if (savedQuests) {
          try {
            setClaimedQuests(JSON.parse(savedQuests));
          } catch (e) {}
        }
      } catch (err) {
        window.location.href = "/login?redirect=/rider/profile";
      }
    };

    checkRiderAuth();

    window.addEventListener("user-state-change", checkRiderAuth);
    return () => {
      window.removeEventListener("user-state-change", checkRiderAuth);
    };
  }, []);

  // Claim Quest Reward
  const handleClaimQuest = (questId: string, rewardText: string) => {
    playDeliveryCompleteSound();
    triggerFireworks();
    const updated = { ...claimedQuests, [questId]: true };
    setClaimedQuests(updated);
    if (rider?.id) {
      localStorage.setItem(`rider_quests_${rider.id}`, JSON.stringify(updated));
    }
    alert(`🎉 Congratulations! You claimed ${rewardText}! Keep delivering!`);
  };

  // Handle Settlement Submission
  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rider?.id || !settleAmount) return;

    const numAmount = parseFloat(settleAmount);
    const payable = historyData?.cashLedger?.payableBalance || 0;

    if (payable <= 0) {
      alert("⚠️ আপনার কোনো প্রদেয় বকেয়া ক্যাশ নেই (Payable Balance: ৳0)। অতিরিক্ত টাকা ডিপোজিট করার প্রয়োজন নেই।");
      return;
    }

    if (numAmount > payable) {
      alert(`⚠️ আপনি আপনার প্রদেয় বকেয়ার (৳${payable}) চেয়ে বেশি ডিপোজিট করতে পারবেন না! অনুগ্রহ করে সর্বোচ্চ ৳${payable} ডিপোজিট করুন।`);
      return;
    }

    setIsSubmittingSettle(true);
    try {
      const res = await fetch("/api/rider/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderId: rider.id,
          amount: numAmount,
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

  const totalDeliveries = historyData?.earnings?.totalDeliveries || 0;
  const riderRating = rider?.rating || 5.0;

  // 🏆 Dynamic Tier System Calculation
  const currentTier =
    totalDeliveries >= 90 && riderRating >= 4.8
      ? {
          name: "Platinum Legend",
          tierLevel: "TIER 4",
          icon: "💎",
          badgeBg: "bg-cyan-100 text-cyan-900 border-cyan-300",
          gradient: "from-cyan-500 via-blue-600 to-indigo-700",
          bonus: "+৳15 Bonus per Delivery",
          min: 90,
          max: 150,
          nextTier: "Max Tier Reached",
          perk: "VIP Priority Dispatch & 24/7 Helpline",
        }
      : totalDeliveries >= 40
      ? {
          name: "Gold Partner",
          tierLevel: "TIER 3",
          icon: "🥇",
          badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
          gradient: "from-amber-400 via-orange-500 to-yellow-600",
          bonus: "+৳10 Bonus per Delivery",
          min: 40,
          max: 90,
          nextTier: "Platinum Legend (90 Trips & 4.8 Rating)",
          perk: "Priority Multi-Stack Order Opportunities",
        }
      : totalDeliveries >= 15
      ? {
          name: "Silver Partner",
          tierLevel: "TIER 2",
          icon: "🥈",
          badgeBg: "bg-slate-200 text-slate-900 border-slate-300",
          gradient: "from-slate-400 via-slate-500 to-zinc-600",
          bonus: "+৳5 Bonus per Delivery",
          min: 15,
          max: 40,
          nextTier: "Gold Partner (40 Trips)",
          perk: "Multi-Stack Batch Trips Unlocked",
        }
      : {
          name: "Bronze Starter",
          tierLevel: "TIER 1",
          icon: "🥉",
          badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
          gradient: "from-amber-700 to-amber-900",
          bonus: "Base Payout",
          min: 0,
          max: 15,
          nextTier: "Silver Partner (15 Trips for +৳5 Bonus)",
          perk: "Complete 15 deliveries to unlock Tier 2",
        };

  const tierProgress = Math.min(
    100,
    Math.max(0, Math.round(((totalDeliveries - currentTier.min) / (currentTier.max - currentTier.min)) * 100))
  );

  // 🎯 Today's Quests & Challenges
  const todayDeliveriesCount = historyData?.orders?.filter((o: Order) => {
    if (!o.updatedAt) return false;
    return new Date(o.updatedAt).toDateString() === new Date().toDateString();
  }).length || 0;

  const quests = [
    {
      id: "quest-1",
      title: "Daily Striker",
      description: "Complete 3 deliveries today",
      target: 3,
      current: Math.min(3, todayDeliveriesCount),
      reward: "+৳50 Cash Bonus",
      completed: todayDeliveriesCount >= 3,
    },
    {
      id: "quest-2",
      title: "Rush Hour Champion",
      description: "Complete 6 deliveries today",
      target: 6,
      current: Math.min(6, todayDeliveriesCount),
      reward: "+৳120 Cash Bonus",
      completed: todayDeliveriesCount >= 6,
    },
    {
      id: "quest-3",
      title: "5-Star Excellence",
      description: "Maintain a 4.8+ rating score",
      target: 4.8,
      current: riderRating,
      reward: "⭐ VIP Priority Dispatch",
      completed: riderRating >= 4.8,
    },
  ];

  // 🎖️ Achievement Badges
  const badges = [
    {
      id: "b1",
      name: "First Flight",
      icon: "🚀",
      desc: "Completed your first order",
      unlocked: totalDeliveries >= 1,
      req: "1 Trip",
    },
    {
      id: "b2",
      name: "Speed Striker",
      icon: "⚡",
      desc: "Rapid delivery within 20 mins",
      unlocked: totalDeliveries >= 5,
      req: "5 Trips",
    },
    {
      id: "b3",
      name: "5-Star Master",
      icon: "⭐",
      desc: "Achieved top customer rating",
      unlocked: riderRating >= 4.9 && totalDeliveries >= 5,
      req: "4.9+ Rating",
    },
    {
      id: "b4",
      name: "Multi-Stack Pro",
      icon: "📦",
      desc: "Delivered stacked batched orders",
      unlocked: totalDeliveries >= 10,
      req: "10 Trips",
    },
    {
      id: "b5",
      name: "Weekend Warrior",
      icon: "🔥",
      desc: "Active on weekend peak hours",
      unlocked: totalDeliveries >= 20,
      req: "20 Trips",
    },
    {
      id: "b6",
      name: "Night Owl",
      icon: "🌙",
      desc: "Delivered late night food cravings",
      unlocked: totalDeliveries >= 30,
      req: "30 Trips",
    },
  ];

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

        {/* 1. Rider Hero Card with Dynamic Tier Badge */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 font-black text-xl shadow-md shadow-orange-100 relative">
              <Bike className="h-8 w-8" />
              <span className="absolute -bottom-1 -right-1 text-sm">{currentTier.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{rider?.name}</h1>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${currentTier.badgeBg}`}>
                  {currentTier.icon} {currentTier.name}
                </span>
              </div>
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
            <p className="text-2xl font-black text-slate-900">{totalDeliveries} Orders</p>
          </div>
        </div>

        {/* 2. 🏆 RIDER GAMIFICATION HUB (Tier Progress & Perks) */}
        <div className="rounded-3xl border-2 border-purple-500/80 bg-white p-6 shadow-xl space-y-6 relative overflow-hidden">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1 text-xs font-black text-white shadow-sm">
                  <Trophy className="h-3.5 w-3.5 text-amber-300" />
                  Rider Tier & Rewards Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Deliver more trips to level up tiers and unlock extra cash bonuses!
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-purple-50 px-4 py-2 border border-purple-200">
              <span className="text-xs font-bold text-purple-700">Active Tier Perk:</span>
              <span className="text-xs font-black text-purple-900">{currentTier.bonus}</span>
            </div>
          </div>

          {/* Tier Progress Bar Card */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 space-y-3 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentTier.icon}</span>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {currentTier.tierLevel}
                  </span>
                  <h3 className="text-lg font-black text-white">{currentTier.name}</h3>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-purple-300">Next Target:</span>
                <p className="text-xs font-black text-white">{currentTier.nextTier}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Tier Progress</span>
                <span>{totalDeliveries} / {currentTier.max} Deliveries ({tierProgress}%)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5 pt-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Current Perks: {currentTier.perk}</span>
            </p>
          </div>

          {/* 🎯 Daily Quests & Missions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Target className="h-4 w-4 text-orange-600" />
                Today's Quests & Challenges
              </h3>
              <span className="text-[11px] font-bold text-slate-400">Resets daily at 12:00 AM</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {quests.map((quest) => {
                const isClaimed = claimedQuests[quest.id];
                const progressPct = Math.min(100, Math.round((quest.current / quest.target) * 100));

                return (
                  <div
                    key={quest.id}
                    className={`rounded-2xl p-4 border transition relative ${
                      quest.completed
                        ? "bg-emerald-50/70 border-emerald-300 shadow-sm"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-slate-900">{quest.title}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          quest.completed
                            ? "bg-emerald-200 text-emerald-900"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {quest.reward}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium mb-2.5">
                      {quest.description}
                    </p>

                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>Progress</span>
                        <span>{quest.current} / {quest.target}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            quest.completed ? "bg-emerald-500" : "bg-orange-500"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {quest.completed ? (
                      isClaimed ? (
                        <div className="w-full py-1.5 text-center text-xs font-bold text-emerald-700 bg-emerald-100 rounded-xl flex items-center justify-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Claimed ✓
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleClaimQuest(quest.id, quest.reward)}
                          className="w-full py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 animate-bounce"
                        >
                          <Gift className="h-3.5 w-3.5" /> Claim Reward! 🎁
                        </button>
                      )
                    ) : (
                      <div className="w-full py-1.5 text-center text-[11px] font-bold text-slate-400 bg-slate-100 rounded-xl">
                        In Progress
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🎖️ Achievement Badges Showcase */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Award className="h-4 w-4 text-purple-600" />
              Achievement Badges ({badges.filter((b) => b.unlocked).length}/{badges.length} Unlocked)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-2xl p-3 text-center border transition relative ${
                    badge.unlocked
                      ? "bg-white border-purple-300 shadow-sm hover:scale-105"
                      : "bg-slate-100/70 border-slate-200 opacity-60"
                  }`}
                >
                  <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-2xl mb-1.5 shadow-xs ${
                      badge.unlocked
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-200 text-slate-400 grayscale"
                    }`}
                  >
                    {badge.unlocked ? badge.icon : <Lock className="h-5 w-5 text-slate-400" />}
                  </div>
                  <h4 className="text-xs font-black text-slate-900 truncate">{badge.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                    {badge.unlocked ? badge.desc : `Req: ${badge.req}`}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3. 💵 COD Cash in Hand & Float Ledger (Fintech Section) */}
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
                if (cashLedger.payableBalance <= 0) {
                  alert("✓ চমৎকার! আপনার কোনো বকেয়া ক্যাশ নেই (All Cleared - ৳0 Due)। অতিরিক্ত জমা দেওয়ার প্রয়োজন নেই।");
                  return;
                }
                setSettleAmount(cashLedger.payableBalance.toString());
                setIsSettleModalOpen(true);
              }}
              className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition active:scale-95 cursor-pointer ${
                cashLedger.payableBalance > 0
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
              }`}
            >
              {cashLedger.payableBalance > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Deposit / Settle Cash</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>All Cleared (৳0 Due)</span>
                </>
              )}
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
                ৳{cashLedger.payableBalance} / ৳{cashLedger.cashLimit} ({cashLedger.limitUsagePercentage}%)
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

        {/* 4. Earnings Timeline Overview */}
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

        {/* 5. Delivery History with Filters */}
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

        {/* 6. Support Section */}
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

      {/* 7. 📱 Interactive Settlement Modal */}
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Settlement Amount (৳):</label>
                    <span className="text-[11px] font-bold text-emerald-700">
                      সর্বোচ্চ প্রদেয়: ৳{cashLedger.payableBalance}
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    max={cashLedger.payableBalance}
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                    placeholder={`সর্বোচ্চ ৳${cashLedger.payableBalance}`}
                  />
                  <p className="text-[10px] text-slate-400">
                    * আপনার বকেয়া ব্যালেন্সের চেয়ে বেশি ডিপোজিট করা যাবে না।
                  </p>
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