import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { type SessionData, SESSION_OPTIONS } from '@/lib/auth/session';
import { 
  getSoftwareSkills, 
  createSoftwareSkill, 
  deleteSoftwareSkill, 
  reorderSoftwareSkills 
} from '@/lib/softwareSkills';

async function requireAuth(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, SESSION_OPTIONS);
  if (!session.isLoggedIn) return null;
  return session;
}

// GET /api/admin/software-skills — list all
export async function GET(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const skills = await getSoftwareSkills();
  return NextResponse.json(skills);
}

// POST /api/admin/software-skills — add new logo (SVG file upload or SVG raw code)
export async function POST(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';

  let name = '';
  let svgContent = '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    name = (formData.get('name') as string)?.trim() || '';
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File SVG tidak ditemukan.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      return NextResponse.json({ error: 'File harus berformat .svg' }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file SVG maksimal 2MB' }, { status: 400 });
    }

    svgContent = await file.text();
    if (!name) {
      name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    }
  } else {
    try {
      const body = await request.json();
      name = body.name?.trim() || '';
      svgContent = body.svg_content?.trim() || '';
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
  }

  // Basic sanitization/validation of SVG string
  if (!svgContent || !svgContent.includes('<svg')) {
    return NextResponse.json({ error: 'Konten SVG tidak valid.' }, { status: 400 });
  }

  // Ensure svg has appropriate attributes for 1:1 dock rendering if missing
  // Clean potential dangerous tags like script
  svgContent = svgContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  const newSkill = await createSoftwareSkill({ name: name || 'Software', svg_content: svgContent });
  return NextResponse.json(newSkill, { status: 201 });
}

// DELETE /api/admin/software-skills?id=...
export async function DELETE(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID tidak diberikan' }, { status: 400 });
  }

  await deleteSoftwareSkill(id);
  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/software-skills — reorder
export async function PATCH(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (Array.isArray(body.orderedIds)) {
      await reorderSoftwareSkills(body.orderedIds);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'orderedIds array required' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
