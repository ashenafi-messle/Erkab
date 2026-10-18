import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { PROGRAMS, Program } from '@/lib/constants/programs';

function getBaseApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return url.replace(/\/+$/, '');
}

export function resolveEndpoint(endpoint: string): string {
  const base = getBaseApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (base.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1')) {
    return `${base}${cleanEndpoint.slice('/api/v1'.length)}`;
  }
  return `${base}${cleanEndpoint}`;
}

export function mapBackendToProgram(item: any): Program {
  const parseArr = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((x) => String(x).trim()).filter(Boolean);
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
        } catch {
          // ignore
        }
      }
      return trimmed
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  return {
    id: item.id || `prog-${Math.random().toString(36).substring(2, 7)}`,
    slug: item.slug || item.id,
    title: item.title || 'Untitled Program',
    category: item.category || 'Software & Technology',
    duration: item.duration || 'Flexible Duration',
    delivery: item.delivery || 'In-Person & Lab',
    scholarship: Boolean(item.scholarship),
    image: item.image || '/images/programs/web-development.jpg',
    imageAlt: item.imageAlt || item.title || 'Erkab Training Program',
    summary: item.summary || item.description || '',
    description: item.description || item.summary || '',
    skills: parseArr(item.skills),
    modules: parseArr(item.modules),
    careerPaths: parseArr(item.careerPaths),
    prerequisites: item.prerequisites || 'Basic computer literacy and logical problem-solving aptitude.',
  };
}

export async function getPrograms(): Promise<Program[]> {
  try {
    const targetUrl = resolveEndpoint(API_ENDPOINTS.PROGRAMS.LIST);
    const res = await fetch(targetUrl, {
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[getPrograms] HTTP ${res.status} from ${targetUrl}, using static fallback`);
      return PROGRAMS;
    }
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map(mapBackendToProgram);
    }
    return PROGRAMS;
  } catch (err) {
    console.warn('[getPrograms] Failed to fetch dynamic programs from backend:', err);
    return PROGRAMS;
  }
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  try {
    const targetUrl = resolveEndpoint(API_ENDPOINTS.PROGRAMS.DETAIL(slug));
    const res = await fetch(targetUrl, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return mapBackendToProgram(json.data);
      }
    }
  } catch (err) {
    console.warn(`[getProgramBySlug] Failed to fetch program '${slug}' from backend:`, err);
  }

  // Fallback to static programs list if API unreachable or 404
  const found = PROGRAMS.find((p) => p.slug === slug || p.id === slug);
  return found || null;
}
