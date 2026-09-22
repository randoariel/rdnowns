import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json([]);
  }

  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('portfolio_results')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Gagal memuat data.' }, { status: 500 });
    }

    const sanitized = (data ?? []).map((row) => ({
      id: row.id,
      thumbnail_url: row.thumbnail_url,
      project_url: row.project_url,
      title: row.title || 'Untitled Project',
      is_pinned: row.is_pinned !== false, // default true if column not set
      sort_order: row.sort_order,
    }));

    return NextResponse.json(sanitized);
  } catch {
    return NextResponse.json([]);
  }
}
