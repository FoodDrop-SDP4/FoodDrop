import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { createSessionToken, setSessionCookie } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, ownerName, email, password, phone, address } = body;

    if (!email || !password || !name || !ownerName) {
      return NextResponse.json({ message: 'Essential fields are missing!' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered!' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔒 Prisma Transaction: Create User (Owner) & Restaurant profile
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: ownerName.trim(),
          email: cleanEmail,
          password: hashedPassword,
          phone: phone?.trim() || '',
          role: 'RESTAURANT_OWNER',
        },
      });

      const newRestaurant = await tx.restaurant.create({
        data: {
          name: name.trim(), 
          address: address?.trim() || 'Dhaka, Bangladesh',
          ownerId: newUser.id, 
        },
      });

      return { newUser, newRestaurant };
    });

    const safeUser = {
      id: result.newUser.id, 
      name: result.newUser.name, 
      email: result.newUser.email, 
      role: result.newUser.role,
    };

    // 🔒 Create signed JWT session token
    const token = await createSessionToken(safeUser);

    const response = NextResponse.json(
      {
        message: 'Restaurant & Owner registered successfully!',
        user: safeUser,
        restaurant: result.newRestaurant,
      },
      { status: 201 }
    );

    setSessionCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Restaurant Registration Error:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}