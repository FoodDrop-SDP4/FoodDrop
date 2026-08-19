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
          in: ["ACCEPTED_BY_RIDER", "PREPARING", "READY_FOR_PICKUP", "ON_THE_WAY", "ARRIVED"],
        },
      },
    });

    if (currentActiveOrdersCount >= 3) {
      return NextResponse.json(
        { message: "You have reached the maximum stacked limit of 3 orders! Please complete an active delivery first." },
        { status: 400 }
      );
    }

    // Check existing order state
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, riderId: true },
    });

    if (!existing || existing.riderId !== null) {
      return NextResponse.json(
        { message: "Sorry! This order has already been accepted by another rider." },
        { status: 409 }
      );
    }

    // 🔒 If kitchen has already cooked the food (READY_FOR_PICKUP), keep it as READY_FOR_PICKUP so rider can pick up immediately!
    const targetStatus = existing.status === "READY_FOR_PICKUP" ? "READY_FOR_PICKUP" : "ACCEPTED_BY_RIDER";

    // 🚀 Race Condition Lock: riderId must be null
    const updatedOrder = await prisma.order.updateMany({
      where: {
        id: orderId,
        riderId: null,
        status: {
          in: ["PREPARING", "READY_FOR_PICKUP", "ACCEPTED_BY_RIDER"],
        },
      },
      data: {
        riderId: riderId,
        status: targetStatus,
      },
    });

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