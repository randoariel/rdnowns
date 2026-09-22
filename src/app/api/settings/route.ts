import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { instagram_username: 'rdn_riifin_cam', instagram_url: 'https://instagram.com/rdn_riifin_cam' }
    );
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('instagram_username, instagram_url')
      .single();

    if (error) {
      return NextResponse.json(
        { instagram_username: 'rdn_riifin_cam', instagram_url: 'https://instagram.com/rdn_riifin_cam' }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { instagram_username: 'rdn_riifin_cam', instagram_url: 'https://instagram.com/rdn_riifin_cam' }
    );
  }
}
