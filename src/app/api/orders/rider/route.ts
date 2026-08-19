import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🚀 GET: রাইডারের বর্তমান অ্যাক্টিভ অর্ডার এবং আজকের সামারি ফেচ করা
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get("riderId");

    if (!riderId) {
      return NextResponse.json({ message: "Rider ID is required!" }, { status: 400 });
    }

    // ১. রাইডারের সব রানিং অ্যাক্টিভ অর্ডার ডাটাবেজ থেকে খোঁজা (Stacked Orders Support)
    const activeOrders = await prisma.order.findMany({
      where: {
        riderId: riderId,
        status: {
          // ⚠️ এই স্ট্যাটাসগুলোর যেকোনো ১টি থাকলে সেটি অ্যাক্টিভ অর্ডার হিসেবে স্ক্রিনে দেখাবে
          in: ["ACCEPTED_BY_RIDER", "PREPARING", "READY_FOR_PICKUP", "ON_THE_WAY", "ARRIVED"],
        },
      },
      include: {
        restaurant: true,
        customer: true, // কাস্টমারের নাম ও ফোন নাম্বার কল করার জন্য
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // ২. আজকের আয় এবং মোট ডেলিভারি হিসাব করা
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysOrders = await prisma.order.findMany({
      where: {
        riderId: riderId,
        status: "DELIVERED",
        updatedAt: {
          gte: today,
        },
      },
    });

    const settlements = await prisma.settlement.findMany({
      where: { riderId: riderId },
    });
    const totalSettledAmount = settlements.reduce((sum, item) => sum + item.amount, 0);

    const todayEarnings = todaysOrders.reduce((sum, order) => sum + (order.deliveryFee || 60), 0);

    const allDeliveredOrders = await prisma.order.findMany({
      where: { riderId: riderId, status: "DELIVERED" },
    });
    const totalCashCollected = allDeliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalAllEarnings = allDeliveredOrders.reduce((sum, order) => sum + (order.deliveryFee || 60), 0);

    const currentCashInHand = Math.max(0, totalCashCollected - totalSettledAmount);
    const currentPayable = Math.max(0, totalCashCollected - totalAllEarnings - totalSettledAmount);

    return NextResponse.json({
      activeOrders: activeOrders || [],
      activeOrder: activeOrders.length > 0 ? activeOrders[0] : null,
      todaySummary: {
        count: todaysOrders.length,
        earnings: todayEarnings,
        cashInHand: currentCashInHand,
        payableBalance: currentPayable,
      },
    });
  } catch (error) {
    console.error("Error fetching rider active order:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// 🚀 PATCH: "Mark as Picked Up" বা "Mark as Delivered" বাটনে চাপলে স্ট্যাটাস আপডেট করা
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 🔒 রান্নার আগে রাইডার পিকআপ করতে পারবে না - ভ্যালিডেশন
    if (status === "ON_THE_WAY") {
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!existingOrder) {
        return NextResponse.json({ message: "Order not found!" }, { status: 404 });
      }

      if (existingOrder.status !== "READY_FOR_PICKUP") {
        return NextResponse.json(
          { message: "খাবার এখনও তৈরি হয়নি! রেস্টুরেন্ট 'Ready for Pickup' করার পর পিকআপ করতে পারবেন।" },
          { status: 400 }
        );
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status },
    });

    return NextResponse.json({ message: "Order status updated successfully!", order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}