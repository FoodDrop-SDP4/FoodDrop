import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { createSessionToken, setSessionCookie } from "../../../../lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, vehicleType, vehicleNumber } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    // 🔒 Hash password securely with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const cleanVehicleType = vehicleType || "Bicycle";

    // Create Rider User
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password: hashedPassword,
        role: "RIDER",
        vehicleType: cleanVehicleType,
        vehicleNumber: cleanVehicleType === "Motorcycle" ? vehicleNumber?.trim() : null,
        isOnline: true,
        rating: 5.0,
        totalReviews: 0,
      },
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      vehicleType: user.vehicleType,
      vehicleNumber: user.vehicleNumber,
      isOnline: user.isOnline,
      rating: user.rating,
      totalReviews: user.totalReviews,
    };

    // 🔒 Create signed JWT session token
    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      { message: "Rider registered successfully", user: safeUser },
      { status: 201 }
    );

    setSessionCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Error registering rider:", error);
    return NextResponse.json({ message: error?.message || "Internal Server Error" }, { status: 500 });
  }
}