import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getIronSession } from 'iron-session';
import { type SessionData, SESSION_OPTIONS } from '@/lib/auth/session';
import { createServerClient } from '@/lib/supabase/server';
import { 
  getPricingFeaturesData, 
  saveDraftPricingFeatures, 
  publishPricingFeatures,
  DEFAULT_PRICING_FEATURES
} from '@/lib/pricingFeatures';

async function requireAuth(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, SESSION_OPTIONS);
  return session.isLoggedIn ? session : null;
}

// GET — returns all 3 packages with draft fields + features checklist for admin
export async function GET(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createServerClient();
  const { data } = await supabase
    .from('pricing_packages')
    .select('*')
    .order('package_number');

  const featuresData = await getPricingFeaturesData();

  const formatted = (data ?? []).map((pkg) => ({
    ...pkg,
    features: featuresData.live[pkg.package_number] ?? DEFAULT_PRICING_FEATURES[pkg.package_number] ?? [],
    draft_features: featuresData.draft[pkg.package_number] ?? featuresData.live[pkg.package_number] ?? DEFAULT_PRICING_FEATURES[pkg.package_number] ?? [],
  }));

  return NextResponse.json(formatted);
}

// PATCH — save draft for one or all packages + draft features checklist
export async function PATCH(request: NextRequest) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: Array<{
    id: string;
    package_number?: number;
    draft_name?: string;
    draft_price?: number;
    draft_description?: string;
    draft_estimated_time?: string;
    draft_features?: string[];
  }>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = createServerClient();
  const draftFeaturesMap: Record<number, string[]> = {};

  await Promise.all(
    body.map(({ id, package_number, draft_features, ...draft }) => {
      if (package_number && Array.isArray(draft_features)) {
        draftFeaturesMap[package_number] = draft_features;
      }
      return supabase
        .from('pricing_packages')
        .update({ ...draft, updated_at: new Date().toISOString() })
        .eq('id', id);
    })
  );

  if (Object.keys(draftFeaturesMap).length > 0) {
    await saveDraftPricingFeatures(draftFeaturesMap);
  }

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

  await publishPricingFeatures();

  revalidatePath('/');
  revalidatePath('/admin/pricing');

  return NextResponse.json({ ok: true });
}
