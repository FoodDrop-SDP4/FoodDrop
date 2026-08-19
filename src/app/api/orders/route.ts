import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId,
      restaurantId,
      deliveryAddress,
      phone,
      paymentMethod,
      transactionId,
      items,
      totalAmount,
      deliveryFee,
    } = body;

    // Basic Validation
    if (
      !restaurantId ||
      !deliveryAddress ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { message: "Missing required order details (restaurant, address, or items)." },
        { status: 400 }
      );
    }

    // 1. Identify & Verify Customer
    let targetCustomerId = customerId;
    if (targetCustomerId) {
      const existingCustomer = await prisma.user.findUnique({
        where: { id: targetCustomerId },
      });
      if (!existingCustomer) {
        targetCustomerId = null;
      }
    }

    // Fallback if no valid customerId was provided
    if (!targetCustomerId) {
      let defaultCustomer = await prisma.user.findFirst({
        where: { role: "CUSTOMER" },
      });

      if (!defaultCustomer) {
        defaultCustomer = await prisma.user.create({
          data: {
            name: "Demo Customer",
            email: `customer_${Date.now()}@demo.com`,
            password: "password123",
            role: "CUSTOMER",
            phone: phone ? String(phone).trim() : "01711111111",
          },
        });
      }
      targetCustomerId = defaultCustomer.id;
    }

    // 🚀 If phone number is given at checkout, sync it immediately to the customer user profile
    if (phone && targetCustomerId) {
      try {
        await prisma.user.update({
          where: { id: targetCustomerId },
          data: { phone: String(phone).trim() },
        });
      } catch (err) {
        console.error("Failed to sync customer phone:", err);
      }
    }

    const calculatedDeliveryFee =
      typeof deliveryFee === "number" ? deliveryFee : 60;
    const finalTotalAmount =
      typeof totalAmount === "number" ? totalAmount : 0;

    // 2. Create Order with Items
    const newOrder = await prisma.order.create({
      data: {
        customerId: targetCustomerId,
        restaurantId,
        deliveryAddress,
        deliveryFee: calculatedDeliveryFee,
        totalAmount: finalTotalAmount,
        status: "PENDING",
        orderItems: {
          create: items.map(
            (item: { menuItemId: string; quantity: number }) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
            })
          ),
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        restaurant: {
          select: { name: true, address: true },
        },
        customer: {
          select: { name: true, phone: true, email: true },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Order placed successfully!",
        order: {
          ...newOrder,
          paymentMethod: paymentMethod || "CASH_ON_DELIVERY",
          transactionId: transactionId || undefined,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order placement error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to place order." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const where: any = {};
    if (userId) {
      where.customerId = userId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        restaurant: true,
        rider: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}