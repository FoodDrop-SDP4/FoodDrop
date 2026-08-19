import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const { riderId, amount, method, transactionId } = await request.json();

    if (!riderId || !amount) {
      return NextResponse.json(
        { message: "Rider ID and settlement amount are required!" },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { message: "Please provide a valid settlement amount!" },
        { status: 400 }
      );
    }

    // Verify rider exists
    const rider = await prisma.user.findUnique({
      where: { id: riderId },
    });

    if (!rider || rider.role !== "RIDER") {
      return NextResponse.json(
        { message: "Rider not found or invalid account!" },
        { status: 404 }
      );
    }

    // Save settlement record into PostgreSQL database
    const settlement = await prisma.settlement.create({
      data: {
        riderId: riderId,
        amount: numAmount,
        method: method || "BKASH",
        transactionId: transactionId || "TXN" + Date.now().toString().slice(-8),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `৳${numAmount} cash settlement successfully deposited via ${method || "Digital Payment"}!`,
        settlement,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Settlement error:", error);
    return NextResponse.json(
      { message: "Failed to process settlement." },
      { status: 500 }
    );
  }
}
