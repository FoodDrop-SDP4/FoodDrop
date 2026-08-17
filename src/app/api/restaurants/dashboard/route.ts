import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { parseItemDescription } from '../menu/route';

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
            rider: true,
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
              rider: true,
              orderItems: { include: { menuItem: true } },
            },
          },
        },
      });
    }

    // Format menu items to parse originalPrice and clean description
    const formattedMenuItems = restaurant.menuItems.map((item) => {
      const { cleanDescription, originalPrice } = parseItemDescription(item.description);
      return {
        ...item,
        description: cleanDescription,
        originalPrice,
      };
    });

    const totalRevenue = restaurant.orders
      .filter((o) => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrdersCount = restaurant.orders.filter(
      (o) => o.status === 'PENDING' || o.status === 'PREPARING'
    ).length;

    return NextResponse.json({
      ownerName: owner?.name || 'Owner',
      restaurant: {
        ...restaurant,
        menuItems: formattedMenuItems,
      },
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

// 🚀 রেস্টুরেন্ট প্রোফাইল নাম, এড্রেস ও কিচেন টাইপ আপডেট করার API
export async function PATCH(request: Request) {
  try {
    const { restaurantId, name, address, restaurantType } = await request.json();

    if (!restaurantId || !name || !address) {
      return NextResponse.json({ message: 'All fields are required!' }, { status: 400 });
    }

    const updateData: { name: string; address: string; restaurantType?: 'RESTAURANT' | 'HOMEMADE' } = {
      name,
      address,
    };

    if (restaurantType === 'HOMEMADE' || restaurantType === 'RESTAURANT') {
      updateData.restaurantType = restaurantType;
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: updateData,
    });

    return NextResponse.json({ message: 'Profile updated!', restaurant: updatedRestaurant }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update profile.' }, { status: 500 });
  }
}