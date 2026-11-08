import type { PatternRow, RowType } from '@/types/cozy';
import { newId } from '../../../utils/id';

export const MAX_IMPORT_CHARACTERS = 200_000;
export const MAX_PDF_BYTES = 20 * 1024 * 1024;
export const MAX_PDF_PAGES = 100;
export interface PatternImport { rows: PatternRow[]; rowType?: RowType; skippedLines: number }
export function parsePatternImport(text: string): PatternImport {
  if (text.length > MAX_IMPORT_CHARACTERS) throw new Error('Use fewer than 200,000 characters.');
  const lines = text.replace(/\r\n?/g, '\n').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').replace(/\u00a0/g, ' ').split('\n').map((value, index) => ({ text: value.trim(), number: index + 1 })).filter(line => line.text);
  if (!lines.length) throw new Error('Enter some written instructions before importing.');
  const start = /^(Row|Round)\s+\d+\s*\|/i;
  if (!lines.some(line => start.test(line.text))) return { rows: lines.map((line, index) => ({ id: newId(), rowNumber: index + 1, instructionText: line.text })), skippedLines: 0 };
  const rows: PatternRow[] = [];
  const types = new Set<RowType>();
  let part: string | undefined;
  let pending: { text: string; number: number } | undefined;
  let skippedLines = 0;
  const incomplete = () => {
    const label = pending?.text.match(/^(?:Row|Round)\s+\d+/i)?.[0] || 'Instruction';
    return new Error(`${label} (line ${pending?.number}) is incomplete. Use: ${label} | instruction | total stitches. End with a whole number, or - if unknown.`);
  };
  for (const line of lines) {
    const heading = /^Part:\s*(.+)$/i.exec(line.text);
    if (heading) {
      if (pending) throw incomplete();
      part = heading[1].trim(); continue;
    }
    if (start.test(line.text)) {
      if (pending) throw incomplete();
      pending = { ...line };
    } else if (/^(?:Row|Round)\s+\d+\b/i.test(line.text)) {
      if (pending) throw incomplete();
      throw new Error(`Line ${line.number}: add the | dividers. Example: Row 1 | instruction | 6.`);
    } else if (pending) {
      pending.text += ` ${line.text}`;
    } else {
      // PDF titles, materials and notes outside numbered instructions are not rows.
      skippedLines++; continue;
    }
    const match = /^(Row|Round)\s+\d+\s*\|\s*([^|]+)\|\s*(\d+|-)\s*$/i.exec(pending.text);
    if (!match) continue; // PDF display lines can split both the instruction and its total.
    const count = match[3] === '-' ? undefined : Number(match[3]);
    if (count !== undefined && !Number.isSafeInteger(count)) throw new Error(`Line ${pending.number}: use a valid whole number for the stitch count.`);
    rows.push({ id: newId(), rowNumber: rows.length + 1, instructionText: match[2].trim(), expectedStitchCount: count, part });
    types.add(match[1].toLowerCase() as RowType);
    pending = undefined;
  }
  if (pending) throw incomplete();
  return { rows, rowType: types.size === 1 ? [...types][0] : undefined, skippedLines };
}
export function importedRows(text: string): PatternRow[] { return parsePatternImport(text).rows; }
export function duplicateRow(rows: PatternRow[], id: string): PatternRow[] {
  const index = rows.findIndex(row => row.id === id);
  if (index < 0) return rows;
  const next = [...rows]; next.splice(index + 1, 0, { ...rows[index], id: newId() });
  return next.map((row, i) => ({ ...row, rowNumber: i + 1 }));
}
