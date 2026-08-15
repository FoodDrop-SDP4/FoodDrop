import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { createSessionToken, setSessionCookie } from "../../../../lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required!" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Look up user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password!" },
        { status: 401 }
      );
    }

    // Verify password via bcrypt
    let isPasswordValid = await bcrypt.compare(password, user.password).catch(() => false);

    // Auto-migrate legacy plaintext password if encountered
    if (!isPasswordValid && user.password === password) {
      isPasswordValid = true;
      const rehashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: rehashedPassword },
      });
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password!" },
        { status: 401 }
      );
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // 🔒 Create signed JWT session token
    const token = await createSessionToken(safeUser);

    // Return safe user data with HTTP-only cookie
    const response = NextResponse.json(
      {
        message: "Login successful!",
        user: safeUser,
      },
      { status: 200 }
    );

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}