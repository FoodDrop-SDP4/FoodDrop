import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otpCode, newPassword } = body;

    if (!email || !otpCode || !newPassword) {
      return NextResponse.json(
        { message: "Email, OTP code, and new password are all required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 1. Verify OTP record
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
        { message: "Invalid or expired password reset session. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (resetRecord.otpCode !== cleanOtp) {
      return NextResponse.json(
        { message: "Invalid OTP code entered." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      return NextResponse.json(
        { message: "This OTP code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update User's password in database
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { password: hashedPassword },
    });

    // 4. Delete the used OTP record
    try {
      if ((prisma as any).passwordReset) {
        await (prisma as any).passwordReset.deleteMany({
          where: { email: cleanEmail },
        });
      } else {
        await prisma.$executeRawUnsafe(
          `DELETE FROM "PasswordReset" WHERE "email" = $1`,
          cleanEmail
        );
      }
    } catch (cleanupErr) {
      // Quiet fail cleanup
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your password has been reset successfully! You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
