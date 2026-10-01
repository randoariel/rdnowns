import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { type SessionData, SESSION_OPTIONS } from '@/lib/auth/session';
import { createServerClient } from '@/lib/supabase/server';

// 1. IP & Account Lockout Tracker
interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number;
}

const ipAttempts = new Map<string, AttemptRecord>();
const accountAttempts = new Map<string, AttemptRecord>();

const MAX_IP_ATTEMPTS = 5;
const MAX_ACCOUNT_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const WINDOW_DURATION_MS = 15 * 60 * 1000;  // 15 minutes window

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip')?.trim() ?? '127.0.0.1';
}

function checkAndIncrement(tracker: Map<string, AttemptRecord>, key: string, maxAttempts: number): { blocked: boolean; remainingMs?: number } {
  const now = Date.now();
  const record = tracker.get(key);

  if (!record) {
    tracker.set(key, { count: 1, firstAttemptAt: now, lockedUntil: 0 });
    return { blocked: false };
  }

  // Currently locked
  if (record.lockedUntil > now) {
    return { blocked: true, remainingMs: record.lockedUntil - now };
  }

  // Window expired, reset counter
  if (now - record.firstAttemptAt > WINDOW_DURATION_MS) {
    record.count = 1;
    record.firstAttemptAt = now;
    record.lockedUntil = 0;
    return { blocked: false };
  }

  record.count++;
  if (record.count >= maxAttempts) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    return { blocked: true, remainingMs: LOCKOUT_DURATION_MS };
  }

  return { blocked: false };
}

function resetAttempts(key: string, tracker: Map<string, AttemptRecord>) {
  tracker.delete(key);
}

// Dummy hash for constant-time comparison to prevent Timing Attacks / Username Enumeration
const DUMMY_HASH = '$2a$10$w8571Xm0a4mGvFv9qgG1A.kFpYm3zC.QxW9E3vGZ.jO1sQkC6u1uq';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // 1. Strict IP Rate Limiting & Lockout
  const ipStatus = checkAndIncrement(ipAttempts, ip, MAX_IP_ATTEMPTS);
  if (ipStatus.blocked) {
    const minutesLeft = Math.ceil((ipStatus.remainingMs || LOCKOUT_DURATION_MS) / 60000);
    return NextResponse.json(
      { error: `Terlalu banyak percobaan dari IP ini. Akses dikunci selama ${minutesLeft} menit.` },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((ipStatus.remainingMs || LOCKOUT_DURATION_MS) / 1000)),
        }
      }
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format data tidak valid.' }, { status: 400 });
  }

  const { username, password } = body;

  // 2. Strict Input Validation (anti-injection & anti-buffer abuse)
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.trim().length === 0 ||
    password.length === 0
  ) {
    return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
  }

  if (username.length > 64 || password.length > 128) {
    return NextResponse.json({ error: 'Panjang karakter melebihi batas yang diizinkan.' }, { status: 400 });
  }

  const sanitizedUsername = username.trim().toLowerCase();

  // 3. Account-specific Lockout Check (Anti-Brute Force on single account from rotating IPs)
  const acctStatus = checkAndIncrement(accountAttempts, sanitizedUsername, MAX_ACCOUNT_ATTEMPTS);
  if (acctStatus.blocked) {
    const minutesLeft = Math.ceil((acctStatus.remainingMs || LOCKOUT_DURATION_MS) / 60000);
    return NextResponse.json(
      { error: `Akun ini dikunci sementara karena terlalu banyak percobaan salah. Coba lagi dalam ${minutesLeft} menit.` },
      { status: 429 }
    );
  }

  const supabase = createServerClient();
  const { data: admin } = await supabase
    .from('admin')
    .select('id, username, password_hash')
    .eq('username', sanitizedUsername)
    .single();

  // 4. Constant-Time Password Verification (Mitigate Timing Attacks & Username Enumeration)
  const hashToCompare = admin?.password_hash || DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, hashToCompare);

  const GENERIC_ERROR = 'Username atau password tidak valid.';

  if (!admin || !isMatch) {
    // Artificial jitter to mitigate precise side-channel timing analysis (100ms - 250ms)
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.floor(Math.random() * 150)));
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  // 5. Successful Authentication: Reset counters
  resetAttempts(ip, ipAttempts);
  resetAttempts(sanitizedUsername, accountAttempts);

  // 6. Regenerate Session with Cryptographic Fingerprinting
  const response = NextResponse.json({ ok: true });
  const session = await getIronSession<SessionData>(request, response, SESSION_OPTIONS);
  
  // Bind session to user agent hash to prevent session hijacking
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const uaHash = crypto.createHash('sha256').update(userAgent).digest('hex').slice(0, 16);

  session.adminId = admin.id;
  session.isLoggedIn = true;
  session.fingerprint = uaHash;
  session.createdAt = Date.now();
  await session.save();

  return response;
}
