import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// 🚀 GET: রাইডারের বর্তমান অ্যাক্টিভ অর্ডার এবং আজকের সামারি ফেচ করা
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get("riderId");

    if (!riderId) {
      return NextResponse.json({ message: "Rider ID is required!" }, { status: 400 });
    }

    // ১. রাইডারের রানিং অ্যাক্টিভ অর্ডারটি ডাটাবেজ থেকে খোঁজা
    const activeOrder = await prisma.order.findFirst({
      where: {
        riderId: riderId,
        status: {
          // ⚠️ এই স্ট্যাটাসগুলোর যেকোনো ১টি থাকলে সেটি অ্যাক্টিভ অর্ডার হিসেবে স্ক্রিনে দেখাবে
          in: ["ACCEPTED_BY_RIDER", "PREPARING", "READY_FOR_PICKUP", "ON_THE_WAY"],
        },
      },
      include: {
        restaurant: true,
        customer: true, // কাস্টমারের নাম ও ফোন নাম্বার কল করার জন্য
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

    const todayEarnings = todaysOrders.reduce((sum, order) => sum + (order.deliveryFee || 60), 0);

    return NextResponse.json({
      activeOrder: activeOrder || null,
      todaySummary: {
        count: todaysOrders.length,
        earnings: todayEarnings,
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