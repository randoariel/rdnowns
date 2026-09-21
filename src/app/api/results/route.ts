import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const revalidate = 60; // cache 60s

export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('portfolio_results')
    .select('id, thumbnail_url, project_url')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Gagal memuat data.' }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
