import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/auth/check-setup — checks if admin exists
export async function GET() {
  const supabase = createServerClient();
  const { count, error } = await supabase
    .from('admin')
    .select('id', { count: 'exact', head: true });

  if (error) {
    return NextResponse.json({ error: 'Database check failed' }, { status: 500 });
  }

  const isSetupDone = (count ?? 0) > 0;
  return NextResponse.json({ isSetupDone });
}
