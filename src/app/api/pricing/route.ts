import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const revalidate = 60;

export async function GET() {
  const supabase = createServerClient();

  const { data: packages, error: pkgErr } = await supabase
    .from('pricing_packages')
    .select('id, package_number, name, price, description, estimated_time')
    .eq('is_published', true)
    .order('package_number', { ascending: true });

  const { data: settings, error: settingsErr } = await supabase
    .from('site_settings')
    .select('instagram_username, instagram_url')
    .single();

  if (pkgErr || settingsErr) {
    return NextResponse.json({ error: 'Gagal memuat data.' }, { status: 500 });
  }

  return NextResponse.json({
    packages: packages ?? [],
    instagram: settings ?? { instagram_username: 'rdn_riifin_cam', instagram_url: 'https://instagram.com/rdn_riifin_cam' },
  });
}
