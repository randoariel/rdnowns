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

// PUT /api/admin/results/[id] — update
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Validate URL if provided
  if (body.project_url) {
    try { new URL(body.project_url as string); } catch {
      return NextResponse.json({ error: 'URL tidak valid.' }, { status: 400 });
    }
  }

  const allowed = ['thumbnail_url', 'thumbnail_path', 'project_url', 'title', 'is_pinned', 'sort_order', 'is_published'];
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const supabase = createServerClient();

  // Validate pin limit if setting is_pinned = true
  if (body.is_pinned === true) {
    const { data: pinnedRows } = await supabase
      .from('portfolio_results')
      .select('id')
      .eq('is_pinned', true)
      .neq('id', id);
    if ((pinnedRows?.length ?? 0) >= 5) {
      return NextResponse.json({ error: 'Maksimal 5 item yang dapat di-pin / show off di Result.' }, { status: 400 });
    }
  }

  const { error } = await supabase.from('portfolio_results').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: 'Gagal memperbarui: ' + error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/results/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServerClient();

  // Get thumbnail_path to delete from storage
  const { data: row } = await supabase
    .from('portfolio_results')
    .select('thumbnail_path')
    .eq('id', id)
    .single();

  if (row?.thumbnail_path) {
    await supabase.storage.from('thumbnails').remove([row.thumbnail_path]);
  }

  const { error } = await supabase.from('portfolio_results').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Gagal menghapus.' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
