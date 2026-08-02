import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import prisma from "@/src/lib/prisma";

const partnerSchema = z.object({
  businessName: z.string().trim().min(3, "Business name must be at least 3 characters."),
  businessType: z.enum(["Restaurant", "HomeCook", "Bakery"]),
  ownerFirstName: z.string().trim().min(2, "Owner first name is required."),
  ownerLastName: z.string().trim().min(2, "Owner last name is required."),
  email: z.string().trim().email("Please provide a valid email address."),
  phone: z.string().trim().regex(/^(\+8801|01)[3-9]\d{8}$/, "Use a valid Bangladeshi mobile number."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Use a strong password with uppercase, lowercase, number, and special character."
    ),
  tradeLicenseNumber: z.string().trim().min(5, "Trade license number is required."),
  tradeLicenseDocumentName: z.string().trim().optional().nullable(),
});

const businessTypeMap = {
  Restaurant: "RESTAURANT",
  HomeCook: "HOMECOOK",
  Bakery: "BAKERY",
} as const;

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { message: "Database is not configured yet. Add DATABASE_URL to your environment and run Prisma migrations." },
      { status: 503 }
    );
  }

  try {
    const json = await request.json();
    const result = partnerSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { message: "Validation failed.", errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;
    const normalizedEmail = data.email.toLowerCase();

    const existingPartner = await prisma.restaurantPartner.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingPartner) {
      return NextResponse.json(
        { message: "A restaurant partner already exists with this email address." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const partner = await prisma.restaurantPartner.create({
      data: {
        businessName: data.businessName,
        businessType: businessTypeMap[data.businessType],
        ownerFirstName: data.ownerFirstName,
        ownerLastName: data.ownerLastName,
        email: normalizedEmail,
        phone: data.phone,
        passwordHash,
        tradeLicenseNumber: data.tradeLicenseNumber,
        tradeLicenseDocumentName: data.tradeLicenseDocumentName?.trim() || null,
      },
      select: {
        id: true,
        businessName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Restaurant partner registered successfully.",
        partner,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create restaurant partner:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while creating the restaurant partner account.",
      },
      { status: 500 }
    );
  }
}
