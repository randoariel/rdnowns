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

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

export async function POST(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `Ukuran file maksimal ${MAX_SIZE_MB}MB.` },
      { status: 400 }
    );
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createServerClient();
  const { error } = await supabase.storage
    .from('thumbnails')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: 'Upload gagal. Coba lagi.' }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(path);

  return NextResponse.json({ path, url: urlData.publicUrl }, { status: 201 });
}
