import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, vehicleType, vehicleNumber, address } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    // 🔒 Hash password securely with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Rider User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword, // Hashed password saved
        role: "RIDER",
        vehicleType,
        vehicleNumber,
        isOnline: true,
      },
    });

    // 🛡️ Exclude password hash from the API response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ message: "Rider registered successfully", user: userWithoutPassword }, { status: 201 });
  } catch (error: any) {
    console.error("Error registering rider:", error);
    return NextResponse.json({ message: error?.message || "Internal Server Error" }, { status: 500 });
  }
}