import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const availableOrders = await prisma.order.findMany({
      where: {
        riderId: null, // যেসব অর্ডারে রাইডার এখনো খালি
        status: {
          in: ["PREPARING", "READY_FOR_PICKUP", "PENDING"],
        },
      },
      include: {
        restaurant: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(availableOrders, { status: 200 });
  } catch (error) {
    console.error("Error fetching available orders:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}