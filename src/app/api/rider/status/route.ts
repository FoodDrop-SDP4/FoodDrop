import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { riderId, isOnline } = body;

    if (!riderId || typeof isOnline !== "boolean") {
      return NextResponse.json(
        { message: "Rider ID and online status are required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: riderId },
      data: { isOnline },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      { message: "Rider status updated successfully", user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating rider status:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
