import type { PatternRow } from '@/types/cozy';
import { newId } from '../../../utils/id';
import { numberRows, reorderRow } from './rows';

export interface PatternSection {
  id: string;
  name: string;
  start: number;
  rows: PatternRow[];
}
const partName = (row: PatternRow) => row.part?.trim() || '';

export function groupPatternRows(rows: PatternRow[]): PatternSection[] {
  const sections: PatternSection[] = [];
  rows.forEach((row, index) => {
    const previous = sections[sections.length - 1];
    if (previous && partName(previous.rows[0]) === partName(row)) previous.rows.push(row);
    else sections.push({ id: row.id, name: partName(row) || 'Instructions', start: index, rows: [row] });
  });
  return sections;
}

function validateName(rows: PatternRow[], name: string, sectionId?: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Enter a part name.');
  const sections = groupPatternRows(rows);
  const current = sections.find(section => section.id === sectionId);
  if (current?.name.toLowerCase() !== trimmed.toLowerCase() && sections.some(section => section.id !== sectionId && section.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('A part with this name already exists. Add rows to that part instead.');
  }
  return trimmed;
}

export function addPatternPart(rows: PatternRow[], name: string): PatternRow[] {
  const part = validateName(rows, name);
  return numberRows([...rows, { id: newId(), part, rowNumber: 1, instructionText: '' }]);
}

export function renamePatternPart(rows: PatternRow[], sectionId: string, name: string): PatternRow[] {
  const section = groupPatternRows(rows).find(section => section.id === sectionId);
  if (!section) throw new Error('This part is no longer available.');
  const part = validateName(rows, name, sectionId);
  const ids = new Set(section.rows.map(row => row.id));
  return numberRows(rows.map(row => ids.has(row.id) ? { ...row, part } : row));
}

export function appendPartRow(rows: PatternRow[], sectionId: string): PatternRow[] {
  const section = groupPatternRows(rows).find(section => section.id === sectionId);
  if (!section) return rows;
  const next = [...rows];
  next.splice(section.start + section.rows.length, 0, { id: newId(), part: section.rows[0].part, rowNumber: 1, instructionText: '' });
  return numberRows(next);
}

export function reorderRowInPart(rows: PatternRow[], id: string, destination: number): PatternRow[] {
  const section = groupPatternRows(rows).find(section => section.rows.some(row => row.id === id));
  if (!section || destination < section.start || destination >= section.start + section.rows.length) return rows;
  return reorderRow(rows, id, destination);
}

export function partSelectionState(rows: PatternRow[], selected: string[]): boolean | 'mixed' {
  const ids = new Set(selected);
  const count = rows.filter(row => ids.has(row.id)).length;
  return count === 0 ? false : count === rows.length ? true : 'mixed';
}

export function togglePartSelection(rows: PatternRow[], selected: string[]): string[] {
  const ids = new Set(rows.map(row => row.id));
  if (partSelectionState(rows, selected) === true) return selected.filter(id => !ids.has(id));
  return Array.from(new Set([...selected, ...ids]));
}
