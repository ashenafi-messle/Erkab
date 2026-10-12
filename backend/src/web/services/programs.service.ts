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

function parseJsonField(val: any): any {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

export class ProgramsService {
  public static async getAllPublished(): Promise<ProgramModel[]> {
    const rows = await query<ProgramModel>(
      `SELECT * FROM "public"."TrainingProgram" 
       WHERE "isPublished" = true 
       ORDER BY "id" ASC`
    );

    return rows.map((p) => ({
      ...p,
      skills: parseJsonField(p.skills),
      modules: parseJsonField(p.modules),
      careerPaths: parseJsonField(p.careerPaths),
    }));
  }

  public static async getBySlug(slug: string): Promise<ProgramModel> {
    const row = await queryOne<ProgramModel>(
      `SELECT * FROM "public"."TrainingProgram" 
       WHERE "slug" = $1 AND "isPublished" = true`,
      [slug]
    );

    if (!row) {
      throw new NotFoundError(`Training program with slug '${slug}' not found`);
    }

    return {
      ...row,
      skills: parseJsonField(row.skills),
      modules: parseJsonField(row.modules),
      careerPaths: parseJsonField(row.careerPaths),
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
      skills: parseJsonField(row.skills),
      modules: parseJsonField(row.modules),
      careerPaths: parseJsonField(row.careerPaths),
    };
  }
}
