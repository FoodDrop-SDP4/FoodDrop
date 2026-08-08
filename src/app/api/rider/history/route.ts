import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get("riderId");

    if (!riderId) {
      return NextResponse.json({ message: "Rider ID is required" }, { status: 400 });
    }

    // All Delivered Orders for History
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

    // Earnings calculation
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const todayOrders = completedOrders.filter((o) => new Date(o.updatedAt) >= startOfToday);
    const weekOrders = completedOrders.filter((o) => new Date(o.updatedAt) >= startOfWeek);

    const todayEarnings = todayOrders.reduce((sum, item) => sum + (item.deliveryFee || 60), 0);
    const weekEarnings = weekOrders.reduce((sum, item) => sum + (item.deliveryFee || 60), 0);
    const totalEarnings = completedOrders.reduce((sum, item) => sum + (item.deliveryFee || 60), 0);

    return NextResponse.json({
      orders: completedOrders,
      earnings: {
        today: todayEarnings,
        thisWeek: weekEarnings,
        total: totalEarnings,
        totalDeliveries: completedOrders.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching rider history:", error);
    return NextResponse.json({ message: error?.message || "Internal Server Error" }, { status: 500 });
  }
}