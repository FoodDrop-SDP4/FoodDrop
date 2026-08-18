import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get("riderId");

    if (!riderId) {
      return NextResponse.json({ message: "Rider ID is required" }, { status: 400 });
    }

    // 1. All Delivered Orders for History
    const completedOrders = await prisma.order.findMany({
      where: {
        riderId,
        status: "DELIVERED",
      },
      include: {
        restaurant: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 2. All Settlements (Deposits) made by this rider
    const settlements = await prisma.settlement.findMany({
      where: { riderId },
      orderBy: { createdAt: "desc" },
    });

    const totalSettledAmount = settlements.reduce((sum, item) => sum + item.amount, 0);

    // Earnings calculation
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const todayOrders = completedOrders.filter((o) => new Date(o.updatedAt) >= startOfToday);
    const weekOrders = completedOrders.filter((o) => new Date(o.updatedAt) >= startOfWeek);

    const todayEarnings = todayOrders.reduce((sum, item) => sum + (item.deliveryFee || 60), 0);
    const weekEarnings = weekOrders.reduce((sum, item) => sum + (item.deliveryFee || 60), 0);
    const totalEarnings = completedOrders.reduce((sum, item) => sum + (item.deliveryFee || 60), 0);

    // 💵 COD Cash in Hand Ledger Calculations (Subtracting settled deposits)
    const cashLimit = 5000; // Standard ৳5,000 maximum float limit
    const totalGrossCashCollected = completedOrders.reduce((sum, item) => sum + item.totalAmount, 0);
    const todayGrossCashCollected = todayOrders.reduce((sum, item) => sum + item.totalAmount, 0);

    // Net remaining cash held by rider
    const netCashInHand = Math.max(0, totalGrossCashCollected - totalSettledAmount);
    
    // Net remaining payable balance to platform (Cash In Hand - Rider Share - Settled)
    const netPayable = Math.max(0, totalGrossCashCollected - totalEarnings - totalSettledAmount);
    
    const limitUsagePercentage = Math.min(100, Math.round((netCashInHand / cashLimit) * 100));
    const isLimitExceeded = netCashInHand >= cashLimit;

    const cashLedger = {
      cashInHand: netCashInHand,
      totalCashCollected: totalGrossCashCollected,
      totalSettledAmount: totalSettledAmount,
      todayCashInHand: todayGrossCashCollected,
      riderEarnings: totalEarnings,
      payableBalance: netPayable,
      cashLimit: cashLimit,
      limitUsagePercentage: limitUsagePercentage,
      isLimitExceeded: isLimitExceeded,
      settlements: settlements,
    };

    return NextResponse.json({
      orders: completedOrders,
      settlements: settlements,
      earnings: {
        today: todayEarnings,
        thisWeek: weekEarnings,
        total: totalEarnings,
        totalDeliveries: completedOrders.length,
        cashLedger: cashLedger,
      },
      cashLedger: cashLedger,
    });
  } catch (error: any) {
    console.error("Error fetching rider history:", error);
    return NextResponse.json({ message: error?.message || "Internal Server Error" }, { status: 500 });
  }
}