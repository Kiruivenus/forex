import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import { hashPassword, signToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, country } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, code: 'INVALID_INPUT', message: 'All required fields must be provided.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, code: 'EMAIL_EXISTS', message: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: 'USER',
      country: country || 'Kenya',
      isVerified: false,
      status: 'ACTIVE',
    });

    // Create user wallet with $0 default balance
    await Wallet.create({
      userId: user._id,
      availableBalance: 0.0,
      lockedBalance: 0.0,
      currency: 'USD',
    });

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { success: false, code: 'SERVER_ERROR', message: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}
