import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase/server';

// POST /api/auth/setup — first-run admin creation
// Blocked after admin row exists
export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  // Check if admin already exists — if yes, setup is locked
  const { count } = await supabase
    .from('admin')
    .select('id', { count: 'exact', head: true });

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Setup sudah selesai. Admin sudah ada.' },
      { status: 403 }
    );
  }

  let body: {
    username?: string;
    password?: string;
    securityQuestion?: string;
    securityAnswer?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { username, password, securityQuestion, securityAnswer } = body;

  if (!username || !password || !securityQuestion || !securityAnswer) {
    return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password minimal 8 karakter.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const answerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);

  const { error } = await supabase.from('admin').insert({
    username: username.trim(),
    password_hash: passwordHash,
    security_question: securityQuestion.trim(),
    security_answer_hash: answerHash,
  });

  if (error) {
    return NextResponse.json({ error: 'Gagal membuat admin.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
