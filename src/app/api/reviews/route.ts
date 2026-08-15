import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

// GET: Fetch reviews for a restaurant or menu item
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const menuItemId = searchParams.get("menuItemId");

    const whereCondition: Prisma.ReviewWhereInput = {};
    if (restaurantId) whereCondition.restaurantId = restaurantId;
    if (menuItemId) whereCondition.menuItemId = menuItemId;

    const reviews = await prisma.review.findMany({
      where: whereCondition,
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ message: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add a new review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, restaurantId, menuItemId, rating, comment } = body;

    if (!userId || !restaurantId || !rating) {
      return NextResponse.json({ message: "UserId, RestaurantId and Rating are required" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        restaurantId,
        menuItemId: menuItemId || null,
        rating: Number(rating),
        comment,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json({ message: error?.message || "Internal Server Error" }, { status: 500 });
  }
}