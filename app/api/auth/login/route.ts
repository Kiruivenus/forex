import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { comparePassword, signToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, code: 'INVALID_INPUT', message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED' || user.status === 'LOCKED') {
      return NextResponse.json(
        { success: false, code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended or locked. Please contact support.' },
        { status: 403 }
      );
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Handle 2FA check if enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json({
        success: true,
        requires2FA: true,
        userId: user._id.toString(),
        message: '2FA verification code required.',
      });
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      requires2FA: false,
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
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, code: 'SERVER_ERROR', message: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
