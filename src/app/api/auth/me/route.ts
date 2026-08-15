import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSessionUserFromRequest(request);

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        vehicleType: true,
        vehicleNumber: true,
        isOnline: true,
        rating: true,
        totalReviews: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ user: null, message: "Internal Server Error" }, { status: 500 });
  }
}
