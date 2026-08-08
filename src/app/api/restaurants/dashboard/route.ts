import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    if (!ownerId) {
      return NextResponse.json({ message: 'Owner ID is required!' }, { status: 400 });
    }

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    let restaurant = await prisma.restaurant.findFirst({
      where: { ownerId },
      include: {
        menuItems: true,
        orders: {
          include: {
            customer: true,
            orderItems: { include: { menuItem: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: 'My Restaurant',
          address: 'Location pending',
          ownerId,
        },
        include: {
          menuItems: true,
          orders: {
            include: {
              customer: true,
              orderItems: { include: { menuItem: true } },
            },
          },
        },
      });
    }

    const totalRevenue = restaurant.orders
      .filter((o) => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrdersCount = restaurant.orders.filter(
      (o) => o.status === 'PENDING' || o.status === 'PREPARING'
    ).length;

    return NextResponse.json({
      ownerName: owner?.name || 'Owner',
      restaurant,
      stats: {
        totalRevenue,
        totalOrders: restaurant.orders.length,
        pendingOrdersCount,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// 🚀 রেস্টুরেন্ট প্রোফাইল নাম ও এড্রেস আপডেট করার API
export async function PATCH(request: Request) {
  try {
    const { restaurantId, name, address } = await request.json();

    if (!restaurantId || !name || !address) {
      return NextResponse.json({ message: 'All fields are required!' }, { status: 400 });
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { name, address },
    });

    return NextResponse.json({ message: 'Profile updated!', restaurant: updatedRestaurant }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update profile.' }, { status: 500 });
  }
}