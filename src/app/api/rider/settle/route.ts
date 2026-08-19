import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const { riderId, amount, method, transactionId } = await request.json();

    if (!riderId || amount === undefined || amount === null) {
      return NextResponse.json(
        { message: "Rider ID and settlement amount are required!" },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { message: "Please provide a valid settlement amount (greater than 0)!" },
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

    // 🔒 1. Calculate actual current payable float from live database orders & settlements
    const allDeliveredOrders = await prisma.order.findMany({
      where: { riderId: riderId, status: "DELIVERED" },
    });
    const totalGrossCash = allDeliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalEarnings = allDeliveredOrders.reduce((sum, order) => sum + (order.deliveryFee || 60), 0);

    const existingSettlements = await prisma.settlement.findMany({
      where: { riderId: riderId },
    });
    const totalSettled = existingSettlements.reduce((sum, item) => sum + item.amount, 0);

    const currentPayableBalance = Math.max(0, totalGrossCash - totalEarnings - totalSettled);

    // ❌ Validation: If no payable balance exists (0 due)
    if (currentPayableBalance <= 0) {
      return NextResponse.json(
        { message: "আপনার কোনো প্রদেয় বকেয়া ক্যাশ নেই (Payable Balance: ৳0)। অতিরিক্ত টাকা ডিপোজিট করার প্রয়োজন নেই।" },
        { status: 400 }
      );
    }

    // ❌ Validation: Cannot deposit more than payable balance
    if (numAmount > currentPayableBalance) {
      return NextResponse.json(
        {
          message: `আপনি আপনার প্রদেয় বকেয়ার (৳${currentPayableBalance}) চেয়ে বেশি ডিপোজিট করতে পারবেন না! অনুগ্রহ করে সর্বোচ্চ ৳${currentPayableBalance} ডিপোজিট করুন।`,
        },
        { status: 400 }
      );
    }

    // 2. Save settlement record into PostgreSQL database
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
        remainingPayable: Math.max(0, currentPayableBalance - numAmount),
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
