import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { type SessionData, SESSION_OPTIONS } from '@/lib/auth/session';
import { createServerClient } from '@/lib/supabase/server';

async function requireAuth(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, SESSION_OPTIONS);
  return session.isLoggedIn ? session : null;
}

export async function GET(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createServerClient();
  const { data } = await supabase.from('site_settings').select('*').single();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { instagram_username?: string; instagram_url?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { instagram_username, instagram_url } = body;
  if (!instagram_username || !instagram_url) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  // Validate URL
  try { new URL(instagram_url); } catch {
    return NextResponse.json({ error: 'URL Instagram tidak valid.' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('site_settings')
    .update({
      instagram_username: instagram_username.replace(/^@/, ''), // strip @ if entered
      instagram_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) return NextResponse.json({ error: 'Gagal menyimpan.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
