import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import bcrypt from 'bcryptjs';
import { type SessionData, SESSION_OPTIONS } from '@/lib/auth/session';
import { createServerClient } from '@/lib/supabase/server';

// Simple in-memory rate limiter — keyed by IP
// ponytail: in-memory resets on cold start. Use Redis/DB for production multi-instance.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  record.count++;
  if (record.count > MAX_ATTEMPTS) return true;

  return false;
}

function clearAttempts(ip: string) {
  attempts.delete(ip);
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' },
      { status: 429 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username dan password wajib diisi.' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data: admin } = await supabase
    .from('admin')
    .select('id, password_hash')
    .eq('username', username.trim())
    .single();

  // Generic error — don't reveal if username exists (PRD security req)
  const GENERIC_ERROR = 'Username atau password salah.';

  if (!admin) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  clearAttempts(ip);

  // Create session
  const response = NextResponse.json({ ok: true });
  const session = await getIronSession<SessionData>(request, response, SESSION_OPTIONS);
  session.adminId = admin.id;
  session.isLoggedIn = true;
  await session.save();

  return response;
}
