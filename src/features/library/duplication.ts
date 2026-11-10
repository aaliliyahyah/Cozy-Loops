import type { CrochetProject, Pattern } from '@/types/cozy';
import { newId } from '../../utils/id';
import { numberRows } from '../patterns/model/rows';

export function duplicatePattern(source: Pattern): Pattern {
  const now = new Date().toISOString();
  const copy: Pattern = JSON.parse(JSON.stringify(source));
  return { ...copy, id: newId(), title: `${source.title.trim() || 'Untitled pattern'} (copy)`,
    instructions: numberRows(copy.instructions.map(row => ({ ...row, id: newId() }))),
    favorite: false, deletedAt: undefined, createdAt: now, updatedAt: now };
}

export function duplicateProject(source: CrochetProject): CrochetProject {
  const now = new Date().toISOString();
  const copy: CrochetProject = JSON.parse(JSON.stringify(source));
  return { ...copy, id: newId(), name: `${source.name.trim() || 'Untitled project'} (copy)`,
    patternSnapshot: { ...copy.patternSnapshot, instructions: numberRows(copy.patternSnapshot.instructions) },
    favorite: false, deletedAt: undefined, undo: undefined, undoHistory: [], createdAt: now, updatedAt: now };
}
