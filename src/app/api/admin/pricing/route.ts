import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { type SessionData, SESSION_OPTIONS } from '@/lib/auth/session';
import { createServerClient } from '@/lib/supabase/server';

async function requireAuth(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, SESSION_OPTIONS);
  return session.isLoggedIn ? session : null;
}

// GET — returns all 3 packages with draft fields for admin
export async function GET(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createServerClient();
  const { data } = await supabase
    .from('pricing_packages')
    .select('*')
    .order('package_number');
  return NextResponse.json(data ?? []);
}

// PATCH — save draft for one or all packages
export async function PATCH(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: Array<{
    id: string;
    draft_name?: string;
    draft_price?: number;
    draft_description?: string;
    draft_estimated_time?: string;
  }>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = createServerClient();
  await Promise.all(
    body.map(({ id, ...draft }) =>
      supabase.from('pricing_packages').update({ ...draft, updated_at: new Date().toISOString() }).eq('id', id)
    )
  );
  return NextResponse.json({ ok: true });
}

// POST — publish: copy draft → live fields
export async function POST(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: { ids: string[] };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: pkgs } = await supabase
    .from('pricing_packages')
    .select('id, draft_name, draft_price, draft_description, draft_estimated_time, name, price, description, estimated_time')
    .in('id', body.ids);

  if (!pkgs) return NextResponse.json({ error: 'Gagal memuat data.' }, { status: 500 });

  await Promise.all(
    pkgs.map((pkg) =>
      supabase.from('pricing_packages').update({
        name: pkg.draft_name ?? pkg.name,
        price: pkg.draft_price ?? pkg.price,
        description: pkg.draft_description ?? pkg.description,
        estimated_time: pkg.draft_estimated_time ?? pkg.estimated_time,
        draft_name: null,
        draft_price: null,
        draft_description: null,
        draft_estimated_time: null,
        is_published: true,
        updated_at: new Date().toISOString(),
      }).eq('id', pkg.id)
    )
  );

  return NextResponse.json({ ok: true });
}
