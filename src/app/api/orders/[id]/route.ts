import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            vehicleNumber: true,
            rating: true,
            totalReviews: true,
            profilePic: true,
          },
        },
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching order by ID:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, riderId } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (riderId !== undefined) dataToUpdate.riderId = riderId;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: {
        restaurant: true,
        customer: true,
        rider: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Order updated successfully", order: updatedOrder },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
