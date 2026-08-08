import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

// Regex Validations
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[a-zA-Z\s.-]+$/; // শুধু লেটার, স্পেস, ডট ও হাইফেন
const bdPhoneRegex = /^(?:01[3-9]\d{8})$/; // ১১ ডিজিটের বিডি ফোন নাম্বার (013-019)

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role } = body;

    // ১. প্রয়োজনীয় ফিল্ড চেক
    if (!name?.trim() || !email?.trim() || !password || !phone?.trim() || !role) {
      return NextResponse.json({ message: 'All required fields must be provided.' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // ২. নাম ভ্যালিডেশন (নামের মধ্যে নম্বর থাকা যাবে না)
    if (!nameRegex.test(cleanName)) {
      return NextResponse.json({ message: 'Name can only contain alphabets and spaces. Numbers are not allowed!' }, { status: 400 });
    }

    // ৩. ইমেইল ফরম্যাট চেক
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ message: 'Please provide a valid email address.' }, { status: 400 });
    }

    // ৪. ফোন নাম্বার ফরম্যাট চেক
    if (!bdPhoneRegex.test(cleanPhone)) {
      return NextResponse.json({ 
        message: 'Phone number must be a valid 11-digit Bangladeshi number starting with 013-019.' 
      }, { status: 400 });
    }

    // ৫. পাসওয়ার্ড মিনিমাম লেন্থ
    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // ৬. রোলের সঠিকতা চেক
    if (!['CUSTOMER', 'RESTAURANT_OWNER', 'RIDER'].includes(role)) {
      return NextResponse.json({ message: 'Invalid user role specified.' }, { status: 400 });
    }

    // ৭. ইমেইল অলরেডি আছে কি না চেক
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'This email is already registered.' }, { status: 400 });
    }

    // ৮. পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await bcrypt.hash(password, 10);

    // ৯. ডাইরেক্ট ইউজার ক্রিয়েট করা (No OTP)
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        phone: cleanPhone,
        role: role,
      },
    });

    return NextResponse.json(
      {
        message: 'Registration successful!',
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}