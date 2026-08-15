import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { createSessionToken, setSessionCookie } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';

// Regex Validations
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[a-zA-Z\s.-]+$/; // Letters, spaces, dots, hyphens
const bdPhoneRegex = /^(?:01[3-9]\d{8})$/; // 11-digit BD phone number

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role } = body;

    // 1. Required fields
    if (!name?.trim() || !email?.trim() || !password || !phone?.trim() || !role) {
      return NextResponse.json({ message: 'All required fields must be provided.' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // 2. Name validation
    if (!nameRegex.test(cleanName)) {
      return NextResponse.json({ message: 'Name can only contain alphabets and spaces. Numbers are not allowed!' }, { status: 400 });
    }

    // 3. Email format
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ message: 'Please provide a valid email address.' }, { status: 400 });
    }

    // 4. Phone format
    if (!bdPhoneRegex.test(cleanPhone)) {
      return NextResponse.json({ 
        message: 'Phone number must be a valid 11-digit Bangladeshi number starting with 013-019.' 
      }, { status: 400 });
    }

    // 5. Password length
    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // 6. Role validity
    if (!['CUSTOMER', 'RESTAURANT_OWNER', 'RIDER'].includes(role)) {
      return NextResponse.json({ message: 'Invalid user role specified.' }, { status: 400 });
    }

    // 7. Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'This email is already registered.' }, { status: 400 });
    }

    // 8. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 9. Create user
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        phone: cleanPhone,
        role: role,
      },
    });

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    // 🔒 Create signed JWT session token
    const token = await createSessionToken(safeUser);

    const response = NextResponse.json(
      {
        message: 'Registration successful!',
        user: safeUser,
      },
      { status: 201 }
    );

    setSessionCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}