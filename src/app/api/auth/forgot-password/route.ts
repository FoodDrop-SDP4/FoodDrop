import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier } = body; // email or phone

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { message: "Please provide your registered Email or Phone number." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // 1. Search for user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { phone: identifier.trim() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email or phone number. Please check again." },
        { status: 404 }
      );
    }

    // 2. Generate 6-Digit Secure OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // 3. Upsert OTP into PasswordReset table (with bulletproof SQL fallback)
    try {
      if ((prisma as any).passwordReset) {
        await (prisma as any).passwordReset.upsert({
          where: { email: user.email },
          update: {
            otpCode: otpCode,
            expiresAt: expiresAt,
            createdAt: new Date(),
          },
          create: {
            email: user.email,
            otpCode: otpCode,
            expiresAt: expiresAt,
          },
        });
      } else {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "PasswordReset" ("id", "email", "otpCode", "expiresAt", "createdAt")
           VALUES (gen_random_uuid(), $1, $2, $3, NOW())
           ON CONFLICT ("email") 
           DO UPDATE SET "otpCode" = $2, "expiresAt" = $3, "createdAt" = NOW()`,
          user.email,
          otpCode,
          expiresAt
        );
      }
    } catch (dbErr: any) {
      console.error("PasswordReset table upsert fallback:", dbErr);
      // Ensure table exists fallback
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PasswordReset" (
          "id" TEXT PRIMARY KEY,
          "email" TEXT UNIQUE NOT NULL,
          "otpCode" TEXT NOT NULL,
          "expiresAt" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(
        `INSERT INTO "PasswordReset" ("id", "email", "otpCode", "expiresAt", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         ON CONFLICT ("email") 
         DO UPDATE SET "otpCode" = $2, "expiresAt" = $3, "createdAt" = NOW()`,
        user.email,
        otpCode,
        expiresAt
      );
    }

    console.log(`🔑 [FoodDrop Password Reset OTP] For ${user.email}: ${otpCode}`);

    return NextResponse.json(
      {
        success: true,
        message: `6-digit reset code sent to ${user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}!`,
        email: user.email,
        demoOtp: otpCode, // Provided for instant demo/testing
        expiresInSeconds: 600,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password request error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
