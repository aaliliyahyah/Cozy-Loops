import type { AppData } from '@/types/cozy';

export const STORAGE_KEY = 'cozy-stitch:data:v1';
export const emptyData = (): AppData => ({ version: 1, patterns: [], projects: [],
  preferences: { hapticsEnabled: true, preferredTerminology: 'US' } });
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const date = (v: unknown) => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const natural = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;
function validPattern(v: unknown): boolean {
  if (!object(v)) return false;
  return typeof v.id === 'string' && typeof v.title === 'string' &&
    ['row', 'round'].includes(String(v.rowType)) && ['draft', 'ready'].includes(String(v.status)) &&
    date(v.createdAt) && date(v.updatedAt) &&
    ['description', 'yarnType', 'hookSize', 'imageUri', 'pastedText', 'otherTools'].every(k => v[k] === undefined || typeof v[k] === 'string') &&
    ['yarnColors', 'hookSizes'].every(k => v[k] === undefined || (Array.isArray(v[k]) && v[k].every(item => typeof item === 'string'))) &&
    (v.favorite === undefined || typeof v.favorite === 'boolean') &&
    (v.difficulty === undefined || ['beginner', 'intermediate', 'advanced'].includes(String(v.difficulty))) &&
    Array.isArray(v.instructions) && v.instructions.every((r, i) => object(r) && typeof r.id === 'string' &&
      r.rowNumber === i + 1 && typeof r.instructionText === 'string' &&
      ['part', 'yarnColor', 'hookSize'].every(k => r[k] === undefined || typeof r[k] === 'string') &&
      (r.expectedStitchCount === undefined || natural(r.expectedStitchCount)));
}
function validProgress(v: unknown, length: number): boolean {
  return object(v) && natural(v.currentRowIndex) && v.currentRowIndex < length &&
    Array.isArray(v.rows) && v.rows.length === length && v.rows.every(r => object(r) && natural(r.count) && typeof r.completed === 'boolean');
}
export function decodeData(raw: string | null): AppData {
  if (raw === null) return emptyData();
  const v: unknown = JSON.parse(raw);
  if (!object(v) || v.version !== 1 || !Array.isArray(v.patterns) || !v.patterns.every(validPattern) ||
    !Array.isArray(v.projects) || !v.projects.every(p => {
      if (!object(p) || !validPattern(p.patternSnapshot) || !object(p.patternSnapshot) || !Array.isArray(p.patternSnapshot.instructions)) return false;
      const length = p.patternSnapshot.instructions.length;
      return typeof p.id === 'string' && typeof p.name === 'string' && typeof p.patternId === 'string' &&
        ['active', 'completed'].includes(String(p.status)) && date(p.createdAt) && date(p.updatedAt) &&
        (p.completedAt === undefined || date(p.completedAt)) && validProgress(p, length) &&
        (p.undo === undefined || validProgress(p.undo, length)) &&
        (p.undoHistory === undefined || (Array.isArray(p.undoHistory) && p.undoHistory.length <= 100 && p.undoHistory.every(snapshot => validProgress(snapshot, length))));
    }) || !object(v.preferences) || typeof v.preferences.hapticsEnabled !== 'boolean' ||
    !['US', 'UK'].includes(String(v.preferences.preferredTerminology))) throw new Error('Saved data could not be read safely. Your stored data has been kept.');
  return v as unknown as AppData;
}

// Additive migration keeps the existing storage key and never changes finished records.
export function migrateData(data: AppData): AppData {
  return { ...data, projects: data.projects.map(project => {
    if (project.status === 'completed') return project;
    const clamp = (snapshot: import('@/types/cozy').ProgressSnapshot) => ({
      ...snapshot, rows: snapshot.rows.map((row, index) => {
        const target = project.patternSnapshot.instructions[index].expectedStitchCount;
        return target === undefined ? row : { ...row, count: Math.min(row.count, target) };
      }),
    });
    return { ...project, ...clamp(project), undo: undefined,
      undoHistory: (project.undoHistory ?? (project.undo ? [project.undo] : [])).map(clamp) };
  }) };
}

// Only one write runs at a time. A slow older write cannot finish after a newer one.
export class SerializedWriter {
  private tail: Promise<void> = Promise.resolve();
  constructor(private write: (raw: string) => Promise<void>) {}
  enqueue(data: AppData): Promise<void> {
    const raw = JSON.stringify(data);
    const result = this.tail.catch(() => {}).then(() => this.write(raw));
    this.tail = result;
    return result;
  }
  flush() { return this.tail; }
}
