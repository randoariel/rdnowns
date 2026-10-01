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
  
  const formatted = (data ?? []).map((row) => {
    let resolvedCategory = row.category;
    let cleanTitle = row.title || '';

    // If category column is empty or fallback tag in title was used
    if (!resolvedCategory) {
      if (cleanTitle.startsWith('[GRAPHIC]')) {
        resolvedCategory = 'graphic';
        cleanTitle = cleanTitle.replace(/^\[GRAPHIC\]\s*/, '');
      } else if (cleanTitle.startsWith('[VIDEO]')) {
        resolvedCategory = 'video';
        cleanTitle = cleanTitle.replace(/^\[VIDEO\]\s*/, '');
      } else {
        resolvedCategory = 'video';
      }
    }

    return {
      id: row.id,
      thumbnail_url: row.thumbnail_url,
      thumbnail_path: row.thumbnail_path,
      project_url: row.project_url,
      title: cleanTitle,
      category: resolvedCategory,
      is_pinned: Boolean(row.is_pinned),
      sort_order: row.sort_order,
      is_published: row.is_published,
      created_at: row.created_at,
    };
  });

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
    category?: string;
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
    category = 'video',
    is_pinned = false, 
    sort_order = 0, 
    is_published = false 
  } = body;

  if (!thumbnail_url || !thumbnail_path || !project_url) {
    return NextResponse.json({ error: 'Thumbnail dan URL project wajib diisi.' }, { status: 400 });
  }

  // Sanitize project_url: ensure http/https protocol is attached if user only typed domain/link
  let sanitizedUrl = project_url.trim();
  if (!/^https?:\/\//i.test(sanitizedUrl)) {
    sanitizedUrl = `https://${sanitizedUrl}`;
  }

  // Basic URL validation
  try { 
    new URL(sanitizedUrl); 
  } catch {
    return NextResponse.json({ error: 'URL tidak valid. Masukkan link yang benar (contoh: https://instagram.com/...)' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Check pin limit if pinned (max 5 per category)
  if (is_pinned) {
    const { data: pinnedRows } = await supabase
      .from('portfolio_results')
      .select('id, title, category')
      .eq('is_pinned', true);
    
    const countForCat = (pinnedRows ?? []).filter((r) => {
      let cat = r.category;
      if (!cat) {
        if (r.title?.startsWith('[GRAPHIC]')) cat = 'graphic';
        else cat = 'video';
      }
      return cat === category;
    }).length;

    if (countForCat >= 5) {
      return NextResponse.json({ error: `Maksimal 5 item yang dapat di-pin untuk kategori ${category === 'graphic' ? 'Graphic Design' : 'Video Editor'}.` }, { status: 400 });
    }
  }

  // Attempt insert with category
  let insertPayload: Record<string, unknown> = {
    thumbnail_url,
    thumbnail_path,
    project_url: sanitizedUrl,
    title: title.trim(),
    category,
    is_pinned,
    sort_order,
    is_published,
  };

  let { data, error } = await supabase
    .from('portfolio_results')
    .insert(insertPayload)
    .select()
    .single();

  // Fallback if category column doesn't exist yet in Supabase schema:
  // prefix title with tag [GRAPHIC] / [VIDEO] so category is never lost or misidentified
  if (error && (error.message?.includes('category') || error.code === '42703')) {
    delete insertPayload.category;
    insertPayload.title = `[${category.toUpperCase()}] ${title.trim()}`;
    const retry = await supabase
      .from('portfolio_results')
      .insert(insertPayload)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

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
