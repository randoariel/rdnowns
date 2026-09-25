import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { type SessionData, SESSION_OPTIONS } from '@/lib/auth/session';
import { createServerClient } from '@/lib/supabase/server';

async function requireAuth(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, SESSION_OPTIONS);
  if (!session.isLoggedIn) return null;
  return session;
}

// GET /api/admin/results — list all (admin, includes unpublished)
export async function GET(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('portfolio_results')
    .select('*')
    .not('thumbnail_path', 'like', 'app_config/%')
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: 'Gagal memuat data.' }, { status: 500 });
  
  const formatted = (data ?? []).map((row) => ({
    id: row.id,
    thumbnail_url: row.thumbnail_url,
    thumbnail_path: row.thumbnail_path,
    project_url: row.project_url,
    title: row.title || '',
    is_pinned: row.is_pinned !== false,
    sort_order: row.sort_order,
    is_published: row.is_published,
    created_at: row.created_at,
  }));

  return NextResponse.json(formatted);
}

// POST /api/admin/results — create new result
export async function POST(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { 
    thumbnail_url?: string; 
    thumbnail_path?: string; 
    project_url?: string; 
    title?: string;
    is_pinned?: boolean;
    sort_order?: number; 
    is_published?: boolean 
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { 
    thumbnail_url, 
    thumbnail_path, 
    project_url, 
    title = '', 
    is_pinned = false, 
    sort_order = 0, 
    is_published = false 
  } = body;

  if (!thumbnail_url || !thumbnail_path || !project_url) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  // Basic URL validation
  try { new URL(project_url); } catch {
    return NextResponse.json({ error: 'URL tidak valid.' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Check pin limit if pinned
  if (is_pinned) {
    const { data: pinnedRows } = await supabase
      .from('portfolio_results')
      .select('id')
      .eq('is_pinned', true);
    if ((pinnedRows?.length ?? 0) >= 5) {
      return NextResponse.json({ error: 'Maksimal 5 item yang dapat di-pin / show off di Result.' }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from('portfolio_results')
    .insert({ 
      thumbnail_url, 
      thumbnail_path, 
      project_url, 
      title: title.trim(), 
      is_pinned, 
      sort_order, 
      is_published 
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Gagal menyimpan: ' + error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/admin/results — batch reorder
export async function PATCH(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { order: Array<{ id: string; sort_order: number }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = createServerClient();
  const updates = body.order.map(({ id, sort_order }) =>
    supabase
      .from('portfolio_results')
      .update({ sort_order, updated_at: new Date().toISOString() })
      .eq('id', id)
  );

  await Promise.all(updates);
  return NextResponse.json({ ok: true });
}
