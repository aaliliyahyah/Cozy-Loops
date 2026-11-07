import type { PatternRow } from '@/types/cozy';
import { newId } from '../../../utils/id';

export const MAX_IMPORT_CHARACTERS = 200_000;
export const MAX_PDF_BYTES = 20 * 1024 * 1024;
export const MAX_PDF_PAGES = 100;
export function importedRows(text: string): PatternRow[] {
  if (text.length > MAX_IMPORT_CHARACTERS) throw new Error('Use fewer than 200,000 characters.');
  const lines = text.replace(/\r\n?/g, '\n').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').split('\n').map(line => line.trim()).filter(Boolean);
  if (!lines.length) throw new Error('Enter some written instructions before importing.');
  return lines.map((instructionText, index) => ({ id: newId(), rowNumber: index + 1, instructionText }));
}
export function duplicateRow(rows: PatternRow[], id: string): PatternRow[] {
  const index = rows.findIndex(row => row.id === id);
  if (index < 0) return rows;
  const next = [...rows]; next.splice(index + 1, 0, { ...rows[index], id: newId() });
  return next.map((row, i) => ({ ...row, rowNumber: i + 1 }));
}
