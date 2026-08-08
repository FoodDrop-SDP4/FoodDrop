import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";

const bangladeshPhoneRegex = /^(01[3-9]\d{8})$/; // exactly 11 digits, starts with 013-019
const emailRegex = /^\S+@\S+\.\S+$/;
const nameNoDigitRegex = /^([^\d]*)$/;
const allowedVehicleTypes = ["Bicycle", "Motorcycle"] as const;
const OTP_TTL_MINUTES = 5;

function isValidBangladeshPhone(phone: string) {
  return bangladeshPhoneRegex.test(phone.trim());
}

function normalizeRole(role: unknown) {
  if (role === "CUSTOMER" || role === "RESTAURANT_OWNER" || role === "RIDER") {
    return role;
  }

  return null;
}

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
    const { name, email, password, phone, role, vehicleType, nid } = body;

    if (!name?.trim() || !email?.trim() || !password || !phone?.trim() || !role) {
      return NextResponse.json({ message: "All required registration fields must be provided." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole) {
      return NextResponse.json({ message: "Invalid role supplied." }, { status: 400 });
    }

    if (!isValidBangladeshPhone(normalizedPhone)) {
      return NextResponse.json(
        { message: "Mobile number must be a valid Bangladeshi number starting with 013-019 and containing 11 digits." },
        { status: 400 },
      );
    }

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    if (!nameNoDigitRegex.test(name.trim())) {
      return NextResponse.json({ message: "Name must not contain digits." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (normalizedRole === "CUSTOMER" || normalizedRole === "RIDER") {
      const riderVehicleType = typeof vehicleType === "string" ? vehicleType.trim() : "";
      const riderNid = typeof nid === "string" ? nid.trim() : "";

      if (normalizedRole === "RIDER") {
        if (!allowedVehicleTypes.includes(riderVehicleType as (typeof allowedVehicleTypes)[number])) {
          return NextResponse.json({ message: "Vehicle type must be either Bicycle or Motorcycle." }, { status: 400 });
        }

        if (!/^\d{10,}$/.test(riderNid)) {
          return NextResponse.json({ message: "Rider NID / License No must contain at least 10 digits." }, { status: 400 });
        }
      }

      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

      await ensurePendingRegistrationTable();

      const pendingRegistration = {
        id: randomUUID(),
      };

      await prisma.$executeRaw(Prisma.sql`
        DELETE FROM "PendingRegistration"
        WHERE "email" = ${normalizedEmail}
      `);

      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "PendingRegistration" (
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
        ) VALUES (
          ${pendingRegistration.id},
          ${name.trim()},
          ${normalizedEmail},
          ${hashedPassword},
          ${normalizedPhone},
          ${normalizedRole},
          ${normalizedRole === "RIDER" ? riderVehicleType : null},
          ${normalizedRole === "RIDER" ? riderNid : null},
          ${otpCode},
          ${otpExpiresAt}
        )
      `);

      return NextResponse.json(
        {
          message: "OTP generated for verification.",
          requiresOtp: true,
          verificationId: pendingRegistration.id,
          debugOtpCode: process.env.NODE_ENV === "production" ? undefined : otpCode,
        },
        { status: 202 },
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: normalizedPhone,
        role: normalizedRole,
        vehicleType: null,
        nid: null,
      },
    });

    return NextResponse.json(
      { message: "Registration successful!", user: newUser },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "Something went wrong while registering." }, { status: 500 });
  }
}