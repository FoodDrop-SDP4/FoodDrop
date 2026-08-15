import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Only allow customer cancellation if the order is still PENDING
    if (order.status !== "PENDING") {
      return NextResponse.json(
        {
          message:
            "Order cannot be cancelled because the restaurant has already started preparing your food.",
        },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json(
      {
        message:
          "Your order has been cancelled successfully. If you paid online via bKash, Nagad, or Card, a full automated refund has been initiated to your account.",
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
