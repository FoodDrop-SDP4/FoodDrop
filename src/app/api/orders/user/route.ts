import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: userId },
      include: {
        restaurant: {
          select: { name: true },
        },
        orderItems: {
          include: {
            menuItem: {
              select: { name: true, price: true, imageUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json({ message: error?.message || "Internal Server Error" }, { status: 500 });
  }
}