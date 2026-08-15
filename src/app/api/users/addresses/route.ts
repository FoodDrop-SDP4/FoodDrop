import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(addresses, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ message: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, label, address } = body;

    if (!userId || !address) {
      return NextResponse.json({ message: "UserId and Address are required" }, { status: 400 });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label: label || "Home",
        address,
      },
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error: any) {
    console.error("Prisma Address Create Error:", error);
    return NextResponse.json({ message: error?.message || "Failed to save address details" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Address ID is required" }, { status: 400 });
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Address deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting address:", error);
    return NextResponse.json({ message: error?.message || "Internal Server Error" }, { status: 500 });
  }
}