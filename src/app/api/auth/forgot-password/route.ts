import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase/server';

// Rate limit — reuse same pattern as login
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  record.count++;
  return record.count > MAX_ATTEMPTS;
}

// GET /api/auth/forgot-password?username=xxx — returns security question
export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan.' }, { status: 429 });
  }

  const username = request.nextUrl.searchParams.get('username')?.trim();
  if (!username) {
    return NextResponse.json({ error: 'Username wajib diisi.' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: admin } = await supabase
    .from('admin')
    .select('security_question')
    .eq('username', username)
    .single();

  // Always return same shape — don't reveal whether username exists
  return NextResponse.json({
    question: admin?.security_question ?? 'Apa nama hewan peliharaan pertamamu?',
  });
}

// POST /api/auth/forgot-password — verify answer + issue reset token
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan.' }, { status: 429 });
  }

  let body: { username?: string; answer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { username, answer } = body;
  if (!username || !answer) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: admin } = await supabase
    .from('admin')
    .select('id, security_answer_hash')
    .eq('username', username.trim())
    .single();

  const GENERIC = 'Jawaban tidak cocok.';

  if (!admin) {
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }

  const valid = await bcrypt.compare(answer.trim().toLowerCase(), admin.security_answer_hash);
  if (!valid) {
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }

  // Issue reset token
  const rawToken = crypto.randomUUID();
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing tokens for this admin
  await supabase.from('admin_reset_tokens').delete().eq('admin_id', admin.id);

  await supabase.from('admin_reset_tokens').insert({
    admin_id: admin.id,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  // Return token in response — user will use it on reset page
  // In a real app with email, we'd email this. V1: display it directly (security question flow).
  return NextResponse.json({ token: rawToken });
}
