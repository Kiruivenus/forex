import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'paloption_super_secure_jwt_secret_key_change_in_production_2026'
);

const SESSION_COOKIE_NAME = 'paloption_session';

const AUTH_PAGES = ['/', '/login', '/register'];
const PROTECTED_PAGES = [
  '/dashboard',
  '/deposit',
  '/withdraw',
  '/history',
  '/chat',
  '/verify-identity',
  '/settings',
  '/responsible-trading',
  '/admin',
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isValidSession = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isValidSession = true;
    } catch {
      isValidSession = false;
    }
  }

  // 1. If user is authenticated and visits landing, login, or register pages -> redirect to /dashboard
  if (isValidSession && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 2. If user is NOT authenticated and visits protected pages -> redirect to /login
  if (!isValidSession && PROTECTED_PAGES.some((page) => pathname.startsWith(page))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp).*)',
  ],
};
