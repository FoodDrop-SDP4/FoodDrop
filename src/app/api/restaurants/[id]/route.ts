import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { parseItemDescription } from "../../../../lib/menu";

const fallbackRestaurant = {
  id: "fallback-restaurant",
  name: "FoodDrop Restaurant",
  address: "Dhaka, Bangladesh",
  isOnline: true,
  ownerId: "fallback-owner",
  createdAt: new Date().toISOString(),
  menuItems: [],
  reviews: [],
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: true,
        reviews: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found!" }, { status: 404 });
    }

    const formattedMenuItems = restaurant.menuItems.map((item) => {
      const { cleanDescription, originalPrice } = parseItemDescription(item.description);
      return {
        ...item,
        description: cleanDescription,
        originalPrice: (item as any).originalPrice || originalPrice,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          restaurantType: restaurant.restaurantType,
        },
      };
    });

    return NextResponse.json(
      {
        ...restaurant,
        menuItems: formattedMenuItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(fallbackRestaurant, { status: 200 });
  }
}