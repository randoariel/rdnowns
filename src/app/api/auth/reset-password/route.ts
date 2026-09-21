import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  let body: { token?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { token, newPassword } = body;
  if (!token || !newPassword) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'Password minimal 8 karakter.' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Find all valid (unused, not expired) tokens
  const { data: tokens } = await supabase
    .from('admin_reset_tokens')
    .select('id, admin_id, token_hash')
    .eq('used', false)
    .gt('expires_at', new Date().toISOString());

  if (!tokens || tokens.length === 0) {
    return NextResponse.json({ error: 'Token tidak valid atau sudah kedaluwarsa.' }, { status: 401 });
  }

  // Find matching token
  let matchedToken: (typeof tokens)[number] | null = null;
  for (const t of tokens) {
    if (await bcrypt.compare(token, t.token_hash)) {
      matchedToken = t;
      break;
    }
  }

  if (!matchedToken) {
    return NextResponse.json({ error: 'Token tidak valid atau sudah kedaluwarsa.' }, { status: 401 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password + mark token used — both in sequence
  await supabase
    .from('admin')
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .eq('id', matchedToken.admin_id);

  await supabase
    .from('admin_reset_tokens')
    .update({ used: true })
    .eq('id', matchedToken.id);

  return NextResponse.json({ ok: true });
}
