import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { riderId, latitude, longitude } = body;

    if (!riderId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing riderId, latitude, or longitude" }, { status: 400 });
    }

    const updatedRider = await prisma.user.update({
      where: { id: riderId, role: "RIDER" },
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    return NextResponse.json(
      { message: "Location updated successfully", rider: updatedRider },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating rider location:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
