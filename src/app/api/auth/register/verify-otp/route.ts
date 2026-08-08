import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

type PendingRegistrationRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "CUSTOMER" | "RESTAURANT_OWNER" | "RIDER";
  vehicleType: string | null;
  nid: string | null;
  otpCode: string;
  otpExpiresAt: Date;
};

async function ensurePendingRegistrationTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PendingRegistration" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "vehicleType" TEXT,
      "nid" TEXT,
      "otpCode" TEXT NOT NULL,
      "otpExpiresAt" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const verificationId = typeof body?.verificationId === "string" ? body.verificationId.trim() : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (!verificationId || !otp) {
      return NextResponse.json({ message: "Verification ID and OTP are required." }, { status: 400 });
    }

    await ensurePendingRegistrationTable();

    const pendingRegistrations = await prisma.$queryRaw<PendingRegistrationRow[]>(Prisma.sql`
      SELECT
        "id",
        "name",
        "email",
        "password",
        "phone",
        "role",
        "vehicleType",
        "nid",
        "otpCode",
        "otpExpiresAt"
      FROM "PendingRegistration"
      WHERE "id" = ${verificationId}
      LIMIT 1
    `);

    const pendingRegistration = pendingRegistrations[0];

    if (!pendingRegistration) {
      return NextResponse.json({ message: "OTP session not found or already used." }, { status: 404 });
    }

    if (pendingRegistration.otpExpiresAt.getTime() < Date.now()) {
      await prisma.$executeRaw(Prisma.sql`
        DELETE FROM "PendingRegistration"
        WHERE "id" = ${verificationId}
      `);
      return NextResponse.json({ message: "OTP has expired. Please request a new code." }, { status: 400 });
    }

    if (pendingRegistration.otpCode !== otp) {
      return NextResponse.json({ message: "Invalid OTP. Please try again." }, { status: 400 });
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: pendingRegistration.name,
          email: pendingRegistration.email,
          password: pendingRegistration.password,
          phone: pendingRegistration.phone,
          role: pendingRegistration.role,
          vehicleType: pendingRegistration.vehicleType,
          nid: pendingRegistration.nid,
        },
      });

      await tx.$executeRaw(Prisma.sql`
        DELETE FROM "PendingRegistration"
        WHERE "id" = ${verificationId}
      `);

      return createdUser;
    });

    const { password: _, ...safeUser } = newUser;

    return NextResponse.json(
      { message: "OTP verified successfully.", user: safeUser },
      { status: 201 },
    );
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json({ message: "Failed to verify OTP." }, { status: 500 });
  }
}