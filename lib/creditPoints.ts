import { Pool } from 'pg';

/**
 * Read-only bridge to the Credit Point Tracker's database (a separate Django app).
 * Students are matched by boarding number: ERP `Student.boardingNo` = tracker `students_student.student_id`.
 */
const url = process.env.CREDIT_POINTS_DATABASE_URL;
const globalForPool = globalThis as unknown as { creditPool?: Pool };
const pool = url
  ? (globalForPool.creditPool ??= new Pool({ connectionString: url, max: 3, connectionTimeoutMillis: 15_000, idleTimeoutMillis: 30_000 }))
  : null;

export const creditPointsEnabled = Boolean(pool);

export type CreditSummary = { total: number; positive: number; negative: number; entries: number };

/** Returns null when the tracker is not configured or has no student with this boarding number. */
export async function creditSummary(boardingNo: string): Promise<CreditSummary | null> {
  if (!pool) return null;
  const { rows } = await pool.query<{ found: boolean; positive: string; negative: string; entries: string }>(
    `SELECT COUNT(s.id) > 0 AS found,
            COALESCE(SUM(cp.value) FILTER (WHERE cp.value > 0), 0) AS positive,
            COALESCE(SUM(cp.value) FILTER (WHERE cp.value < 0), 0) AS negative,
            COUNT(cp.id) AS entries
       FROM students_student s
       LEFT JOIN credit_points_creditpoint cp ON cp.student_id = s.id
      WHERE LOWER(TRIM(s.student_id)) = LOWER(TRIM($1))`,
    [boardingNo],
  );
  const r = rows[0];
  if (!r?.found) return null;
  const positive = Number(r.positive), negative = Number(r.negative);
  return { total: positive + negative, positive, negative, entries: Number(r.entries) };
}
