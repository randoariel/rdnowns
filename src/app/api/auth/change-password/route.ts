import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import bcrypt from 'bcryptjs';
import { type SessionData, SESSION_OPTIONS } from '@/lib/auth/session';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, SESSION_OPTIONS);

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Password minimal 8 karakter.' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: admin } = await supabase
    .from('admin')
    .select('password_hash')
    .eq('id', session.adminId)
    .single();

  if (!admin) {
    return NextResponse.json({ error: 'Admin tidak ditemukan.' }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Password saat ini salah.' }, { status: 401 });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await supabase
    .from('admin')
    .update({ password_hash: newHash, updated_at: new Date().toISOString() })
    .eq('id', session.adminId);

  return NextResponse.json({ ok: true });
}
