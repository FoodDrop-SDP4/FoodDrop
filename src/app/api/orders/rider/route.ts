import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET: Fetch Active & Available orders for Rider
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get("riderId");

    if (!riderId) {
      return NextResponse.json({ message: "Rider ID is required" }, { status: 400 });
    }

    // 1. Rider's Current Active Order
    const activeOrder = await prisma.order.findFirst({
      where: {
        riderId,
        status: { in: ["PREPARING", "READY_FOR_PICKUP", "ON_THE_WAY"] },
      },
      include: {
        customer: { select: { name: true, phone: true } },
        restaurant: { select: { name: true, address: true } },
        orderItems: { include: { menuItem: { select: { name: true, price: true } } } },
      },
    });

    // 2. Pending Orders available to accept
    const availableOrders = await prisma.order.findMany({
      where: {
        riderId: null,
        status: { in: ["PENDING", "PREPARING", "READY_FOR_PICKUP"] },
      },
      include: {
        restaurant: { select: { name: true, address: true } },
        orderItems: { include: { menuItem: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Today's Summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = await prisma.order.findMany({
      where: {
        riderId,
        status: "DELIVERED",
        updatedAt: { gte: today },
      },
    });

    return NextResponse.json({
      activeOrder,
      availableOrders,
      todaySummary: {
        count: completedToday.length,
        earnings: completedToday.reduce((sum, item) => sum + (item.deliveryFee || 60), 0),
      },
    });
  } catch (error: any) {
    console.error("Error fetching rider orders:", error);
    return NextResponse.json({ message: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Update Order Status (Accept, Picked Up, Delivered)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, riderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const updateData: any = { status };
    if (riderId) updateData.riderId = riderId;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ message: error?.message || "Internal Server Error" }, { status: 500 });
  }
}