import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'paloption_super_secure_jwt_secret_key_change_in_production_2026'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name: string;
}

export const SESSION_COOKIE_NAME = 'paloption_session';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function verifyApiAuth(req: NextRequest, requiredRole?: 'USER' | 'ADMIN'): Promise<{
  authenticated: boolean;
  user: JWTPayload | null;
  error?: string;
  status?: number;
}> {
  // Check Authorization header or cookie
  const authHeader = req.headers.get('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    const cookieHeader = req.cookies.get(SESSION_COOKIE_NAME);
    token = cookieHeader?.value || null;
  }

  if (!token) {
    return { authenticated: false, user: null, error: 'Unauthorized: Session missing', status: 401 };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { authenticated: false, user: null, error: 'Unauthorized: Session expired or invalid', status: 401 };
  }

  if (requiredRole && payload.role !== requiredRole && payload.role !== 'ADMIN') {
    return { authenticated: false, user: payload, error: 'Forbidden: Insufficient privileges', status: 403 };
  }

  return { authenticated: true, user: payload };
}
