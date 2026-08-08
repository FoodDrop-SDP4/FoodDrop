import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, ownerName, email, password, phone, address } = body;

    if (!email || !password || !name || !ownerName) {
      return NextResponse.json({ message: 'Essential fields are missing!' }, { status: 400 });
    }

    // চেক করা ইমেইল অলরেডি আছে কি না
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered!' }, { status: 400 });
    }

    // পাসওয়ার্ড হাশ করা
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔒 Prisma Transaction: ইউজার এবং রেস্টুরেন্ট দুটোই একসাথে ক্রিয়েট হবে
    const result = await prisma.$transaction(async (tx) => {
      // ১. প্রথমে ইউজার ক্রিয়েট করা (Role: RESTAURANT_OWNER)
      const newUser = await tx.user.create({
        data: {
          name: ownerName,
          email,
          password: hashedPassword,
          phone: phone || '',
          role: 'RESTAURANT_OWNER',
        },
      });

      // ২. সাথে সাথেই তার আন্ডারে রেস্টুরেন্ট প্রোফাইল ক্রিয়েট করা
      const newRestaurant = await tx.restaurant.create({
        data: {
          name: name, 
          address: address || 'Dhaka, Bangladesh',
          ownerId: newUser.id, 
        },
      });

      return { newUser, newRestaurant };
    });

    return NextResponse.json(
      {
        message: 'Restaurant & Owner registered successfully!',
        user: { 
          id: result.newUser.id, 
          name: result.newUser.name, 
          email: result.newUser.email, 
          role: result.newUser.role 
        },
        restaurant: result.newRestaurant,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Restaurant Registration Error:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}