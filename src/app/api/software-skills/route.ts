import { NextResponse } from 'next/server';
import { getSoftwareSkills } from '@/lib/softwareSkills';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const skills = await getSoftwareSkills();
    return NextResponse.json(skills);
  } catch {
    return NextResponse.json([]);
  }
}
