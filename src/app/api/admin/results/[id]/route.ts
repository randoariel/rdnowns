import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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

  const allowed = ['thumbnail_url', 'thumbnail_path', 'project_url', 'title', 'category', 'is_pinned', 'sort_order', 'is_published'];
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const supabase = createServerClient();

  // Validate pin limit if setting is_pinned = true (max 5 per category)
  if (body.is_pinned === true) {
    // get current category of the item if not in body
    let targetCategory = body.category as string | undefined;
    if (!targetCategory) {
      const { data: currentItem } = await supabase
        .from('portfolio_results')
        .select('title, category')
        .eq('id', id)
        .single();
      if (currentItem?.category) {
        targetCategory = currentItem.category;
      } else if (currentItem?.title?.startsWith('[GRAPHIC]')) {
        targetCategory = 'graphic';
      } else {
        targetCategory = 'video';
      }
    }

    const { data: pinnedRows } = await supabase
      .from('portfolio_results')
      .select('id, title, category')
      .eq('is_pinned', true)
      .neq('id', id);
    
    const countForCat = (pinnedRows ?? []).filter((r) => {
      let cat = r.category;
      if (!cat) {
        if (r.title?.startsWith('[GRAPHIC]')) cat = 'graphic';
        else cat = 'video';
      }
      return cat === targetCategory;
    }).length;

    if (countForCat >= 5) {
      return NextResponse.json({ 
        error: `Maksimal 5 item yang dapat di-pin untuk kategori ${targetCategory === 'graphic' ? 'Graphic Design' : 'Video Editor'}.` 
      }, { status: 400 });
    }
  }

  let { error } = await supabase.from('portfolio_results').update(update).eq('id', id);

  if (error && (error.message?.includes('category') || error.code === '42703')) {
    const fallbackCategory = update.category as string;
    delete update.category;
    if (fallbackCategory && typeof update.title === 'string') {
      const clean = update.title.replace(/^\[(GRAPHIC|VIDEO)\]\s*/i, '');
      update.title = `[${fallbackCategory.toUpperCase()}] ${clean}`;
    }
    const retry = await supabase.from('portfolio_results').update(update).eq('id', id);
    error = retry.error;
  }

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

  revalidatePath('/');
  revalidatePath('/admin/results');

  return NextResponse.json({ ok: true });
}
