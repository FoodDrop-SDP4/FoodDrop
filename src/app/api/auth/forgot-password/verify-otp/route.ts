import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otpCode } = body;

    if (!email || !otpCode) {
      return NextResponse.json(
        { message: "Email and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    // 1. Find OTP record in database
    let resetRecord: any = null;
    if ((prisma as any).passwordReset) {
      resetRecord = await (prisma as any).passwordReset.findUnique({
        where: { email: cleanEmail },
      });
    } else {
      const rows: any = await prisma.$queryRawUnsafe(
        `SELECT * FROM "PasswordReset" WHERE "email" = $1 LIMIT 1`,
        cleanEmail
      );
      resetRecord = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    }

    if (!resetRecord) {
      return NextResponse.json(
        { message: "No password reset request found for this email. Please request a new OTP." },
        { status: 400 }
      );
    }

    // 2. Check OTP match
    if (resetRecord.otpCode !== cleanOtp) {
      return NextResponse.json(
        { message: "Invalid OTP code entered. Please check and try again." },
        { status: 400 }
      );
    }

    // 3. Check expiration
    if (new Date() > new Date(resetRecord.expiresAt)) {
      return NextResponse.json(
        { message: "This OTP code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP Code verified successfully! You can now set your new password.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify reset OTP error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to verify OTP code." },
      { status: 500 }
    );
  }
}
