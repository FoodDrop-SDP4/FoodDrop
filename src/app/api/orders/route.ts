// File: src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // তোমার ফিক্স করা রিলেটিভ পাথ

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurantId, deliveryAddress, items, totalAmount } = body;

    // বেসিক ভ্যালিডেশন
    if (!restaurantId || !deliveryAddress || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'অর্ডার করার জন্য সব তথ্য দেওয়া হয়নি!' },
        { status: 400 }
      );
    }

    // 🚀 ফিক্স: ডাটাবেজ থেকে আসল একজন কাস্টমারকে খুঁজে বের করছি
    let realCustomer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
    });

    // যদি কোনো কাস্টমার না থাকে, তবে অটোমেটিক একটা ডেমো কাস্টমার বানিয়ে নেব
    if (!realCustomer) {
      realCustomer = await prisma.user.create({
        data: {
          name: 'Demo Customer',
          email: `customer_${Date.now()}@demo.com`, // ইউনিক ইমেইল
          password: 'password123',
          role: 'CUSTOMER',
          phone: '01711111111',
        },
      });
    }

    // 🚀 Prisma Nested Write: আসল কাস্টমার আইডি দিয়ে অর্ডার সেভ করা
    const newOrder = await prisma.order.create({
      data: {
        customerId: realCustomer.id, // আসল কাস্টমারের আইডি বসালাম
        restaurantId,
        deliveryAddress,
        totalAmount,
        status: 'PENDING',
        orderItems: {
          create: items.map((item: { menuItemId: string; quantity: number }) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItems: true, 
      },
    });

    return NextResponse.json(
      { message: 'অর্ডার সফলভাবে প্লেস করা হয়েছে!', order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order placement error:', error);
    return NextResponse.json(
      { message: 'সার্ভারে কোনো সমস্যা হয়েছে!' },
      { status: 500 }
    );
  }
}