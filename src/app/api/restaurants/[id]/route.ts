import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

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
        reviews: true, // 🚀 রেস্টুরেন্টের রিয়েল রিভিউ ডাটা অন্তর্ভুক্ত করা হলো
      },
    });

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found!" }, { status: 404 });
    }

    return NextResponse.json(restaurant, { status: 200 });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(fallbackRestaurant, { status: 200 });
  }
}