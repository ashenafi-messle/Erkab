import { query, queryOne } from '../../core/database/db';
import { NotFoundError } from '../../core/errors/AppError';

export interface ProgramModel {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  delivery: string;
  scholarship: boolean;
  image: string;
  imageAlt: string;
  summary: string;
  description: string;
  skills: string | string[];
  modules: string | string[];
  careerPaths: string | string[];
  prerequisites: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

function parseJsonArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((x) => String(x).trim()).filter(Boolean);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
      } catch {
        // Fall back to delimiter splitting
      }
    }
    return trimmed
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export class ProgramsService {
  public static async getAllPublished(): Promise<ProgramModel[]> {
    const rows = await query<ProgramModel>(
      `SELECT * FROM "public"."TrainingProgram" 
       WHERE "isPublished" = true 
       ORDER BY "createdAt" ASC, "id" ASC`
    );

    return rows.map((p) => ({
      ...p,
      skills: parseJsonArray(p.skills),
      modules: parseJsonArray(p.modules),
      careerPaths: parseJsonArray(p.careerPaths),
    }));
  }

  public static async getBySlug(identifier: string): Promise<ProgramModel> {
    const row = await queryOne<ProgramModel>(
      `SELECT * FROM "public"."TrainingProgram" 
       WHERE ("slug" = $1 OR "id" = $1) AND "isPublished" = true`,
      [identifier]
    );

    if (!row) {
      throw new NotFoundError(`Training program '${identifier}' not found`);
    }

    return {
      ...row,
      skills: parseJsonArray(row.skills),
      modules: parseJsonArray(row.modules),
      careerPaths: parseJsonArray(row.careerPaths),
    };
  }

  public static async getByIdOrSlug(identifier: string): Promise<ProgramModel | null> {
    const row = await queryOne<ProgramModel>(
      `SELECT * FROM "public"."TrainingProgram" 
       WHERE ("id" = $1 OR "slug" = $1) AND "isPublished" = true`,
      [identifier]
    );

    if (!row) return null;

    return {
      ...row,
      skills: parseJsonArray(row.skills),
      modules: parseJsonArray(row.modules),
      careerPaths: parseJsonArray(row.careerPaths),
    };
  }
}
