// File: src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import * as bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required!" }, { status: 400 });
    }

    if (!emailRegex.test(String(email).trim().toLowerCase())) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    // ডাটাবেজে ইউজার খোঁজা
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password!" }, { status: 401 });
    }

    // পাসওয়ার্ড ম্যাচ করা (bcrypt দিয়ে)
    const isPasswordValid = await bcrypt.compare(password, user.password).catch(() => false);

    // যদি bcrypt ম্যাচ না করে, তবে প্লেন টেক্সট চেক (ব্যাকওয়ার্ড কম্প্যাটিবিলিটির জন্য)
    const isDirectMatch = user.password === password;

    if (!isPasswordValid && !isDirectMatch) {
      return NextResponse.json({ message: "Invalid email or password!" }, { status: 401 });
    }

    // লগইন সাকসেসফুল হলে ইউজারের প্রয়োজনীয় ডাটা রিটার্ন করা
    return NextResponse.json(
      {
        message: "Login successful!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}