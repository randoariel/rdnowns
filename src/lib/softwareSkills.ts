import fs from 'fs';
import path from 'path';
import { createServerClient } from '@/lib/supabase/server';

export interface SoftwareSkill {
  id: string;
  name: string;
  svg_content: string;
  sort_order: number;
  created_at: string;
}

const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'software_skills.json');

// Default initial skills (Premiere Pro, After Effects, DaVinci Resolve, Photoshop, CapCut, Blender)
const DEFAULT_SKILLS: SoftwareSkill[] = [
  {
    id: 'pr',
    name: 'Premiere Pro',
    svg_content: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#00005B"/>
      <path d="M13 14H21C24.5 14 27 16 27 19.5C27 23 24.5 25 21 25H17.5V34H13V14ZM17.5 21.5H20.5C22 21.5 23 20.7 23 19.5C23 18.3 22 17.5 20.5 17.5H17.5V21.5Z" fill="#EA77FF"/>
      <path d="M29 20H33V22.2C33.8 20.7 35.3 20 37 20C37.5 20 38 20.1 38.5 20.3V24.5C37.8 24.2 37.1 24.1 36.4 24.1C34.3 24.1 33 25.6 33 28V34H29V20Z" fill="#EA77FF"/>
    </svg>`,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ae',
    name: 'After Effects',
    svg_content: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#00005B"/>
      <path d="M12 34L19.5 14H23.5L31 34H26.8L25.2 29.5H17.8L16.2 34H12ZM18.9 26H24.1L21.5 18.5L18.9 26Z" fill="#9999FF"/>
      <path d="M32 27.5C32 23 35 20 39.5 20C43.5 20 46 22.8 46 27V28.5H35.8C36 30.5 37.5 31.8 39.5 31.8C41 31.8 42.2 31.1 42.8 30H46C45 32.5 42.5 34.2 39.5 34.2C35 34.2 32 31.5 32 27.5ZM42.2 26C42 24.3 41 23.2 39.5 23.2C38 23.2 36.8 24.3 36 26H42.2Z" fill="#9999FF"/>
    </svg>`,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'davinci',
    name: 'DaVinci Resolve',
    svg_content: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#18181B"/>
      <path d="M24 10L14 26H34L24 10Z" fill="#EF4444" opacity="0.9"/>
      <path d="M12 36L22 20L17 38L12 36Z" fill="#3B82F6" opacity="0.9"/>
      <path d="M36 36L26 20L31 38L36 36Z" fill="#F59E0B" opacity="0.9"/>
      <circle cx="24" cy="27" r="4" fill="#FFFFFF"/>
    </svg>`,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ps',
    name: 'Photoshop',
    svg_content: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#001E36"/>
      <path d="M13 14H21.5C25 14 27.5 16.2 27.5 19.8C27.5 23.4 25 25.6 21.5 25.6H17.5V34H13V14ZM17.5 21.8H21C22.6 21.8 23.5 21 23.5 19.8C23.5 18.6 22.6 17.8 21 17.8H17.5V21.8Z" fill="#31A8FF"/>
      <path d="M30 31.2C31 32 32.5 32.6 34.2 32.6C36.2 32.6 37.2 31.7 37.2 30.5C37.2 28 32 28.2 32 24.2C32 21.6 34.2 20 37.5 20C39.2 20 40.8 20.5 41.8 21.2L40.7 23.8C39.7 23.2 38.6 22.8 37.5 22.8C35.7 22.8 34.8 23.6 34.8 24.6C34.8 26.9 40 26.8 40 30.8C40 33.3 37.7 35 34.2 35C32.3 35 30.6 34.4 29.2 33.5L30 31.2Z" fill="#31A8FF"/>
    </svg>`,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'capcut',
    name: 'CapCut',
    svg_content: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#0A0A0A"/>
      <path d="M12 16L24 23L36 16V22L24 29L12 22V16Z" fill="#FFFFFF"/>
      <path d="M12 26L24 33L36 26V32L24 39L12 32V26Z" fill="#FFFFFF"/>
    </svg>`,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'blender',
    name: 'Blender',
    svg_content: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#202020"/>
      <circle cx="24" cy="27" r="10" fill="#EA7600"/>
      <circle cx="24" cy="27" r="5" fill="#2382C8"/>
      <path d="M24 11V19M16 14L21 21M32 14L27 21" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
];

function readLocalData(): SoftwareSkill[] {
  try {
    if (!fs.existsSync(LOCAL_DATA_FILE)) {
      fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(DEFAULT_SKILLS, null, 2), 'utf-8');
      return DEFAULT_SKILLS;
    }
    const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SKILLS;
  }
}

function writeLocalData(data: SoftwareSkill[]): void {
  try {
    const dir = path.dirname(LOCAL_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing local software_skills.json:', e);
  }
}

export async function getSoftwareSkills(): Promise<SoftwareSkill[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('software_skills')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data)) {
      return data;
    }
  } catch {
    // Supabase unavailable or table doesn't exist yet, fallback to local storage
  }

  return readLocalData();
}

export async function createSoftwareSkill(skill: { name: string; svg_content: string }): Promise<SoftwareSkill> {
  const newSkill: SoftwareSkill = {
    id: `skill_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: skill.name.trim() || 'Software',
    svg_content: skill.svg_content.trim(),
    sort_order: 99,
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('software_skills')
      .insert({
        name: newSkill.name,
        svg_content: newSkill.svg_content,
        sort_order: newSkill.sort_order,
      })
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch {
    // fallback
  }

  const items = readLocalData();
  newSkill.sort_order = items.length;
  items.push(newSkill);
  writeLocalData(items);
  return newSkill;
}

export async function deleteSoftwareSkill(id: string): Promise<boolean> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from('software_skills')
      .delete()
      .eq('id', id);

    if (!error) {
      // Also update local file
      const items = readLocalData().filter(i => i.id !== id);
      writeLocalData(items);
      return true;
    }
  } catch {
    // fallback
  }

  const items = readLocalData().filter(i => i.id !== id);
  writeLocalData(items);
  return true;
}

export async function reorderSoftwareSkills(orderedIds: string[]): Promise<boolean> {
  try {
    const supabase = createServerClient();
    const updates = orderedIds.map((id, sort_order) =>
      supabase.from('software_skills').update({ sort_order }).eq('id', id)
    );
    await Promise.all(updates);
  } catch {
    // fallback
  }

  const items = readLocalData();
  const sorted = orderedIds
    .map((id, index) => {
      const found = items.find(it => it.id === id);
      return found ? { ...found, sort_order: index } : null;
    })
    .filter(Boolean) as SoftwareSkill[];

  writeLocalData(sorted);
  return true;
}
