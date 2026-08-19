import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const { orderId, riderId } = await request.json();

    if (!orderId || !riderId) {
      return NextResponse.json(
        { message: "Order ID and Rider ID are required!" },
        { status: 400 }
      );
    }

    // 🚀 Check active order stack limit (Max 3 orders at a time)
    const currentActiveOrdersCount = await prisma.order.count({
      where: {
        riderId: riderId,
        status: {
          in: ["ACCEPTED_BY_RIDER", "PREPARING", "READY_FOR_PICKUP", "ON_THE_WAY"],
        },
      },
    });

    if (currentActiveOrdersCount >= 3) {
      return NextResponse.json(
        { message: "You have reached the maximum stacked limit of 3 orders! Please complete an active delivery first." },
        { status: 400 }
      );
    }

    // 🚀 Race Condition Lock: riderId অবশ্যই null হতে হবে!
    const updatedOrder = await prisma.order.updateMany({
      where: {
        id: orderId,
        riderId: null, // Ensure order hasn't been claimed yet
        status: {
          in: ["PREPARING", "READY_FOR_PICKUP"],
        },
      },
      data: {
        riderId: riderId,
        status: "ACCEPTED_BY_RIDER", // 👈 তোমার schema.prisma এর সাথে অবিকল মিল রাখা হয়েছে
      },
    });

    // ❌ যদি update count 0 হয়, তারমানে অন্য কোনো রাইডার ১ মিলিসেকেন্ড আগে এটি এক্সেপ্ট করে ফেলেছে!
    if (updatedOrder.count === 0) {
      return NextResponse.json(
        { message: "Sorry! This order has already been accepted by another rider." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Order accepted successfully! Get ready to deliver." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error accepting order:", error);
    return NextResponse.json(
      { message: "Failed to accept order." },
      { status: 500 }
    );
  }
}