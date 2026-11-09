import { newId } from '../../../utils/id';
import { isUsable } from '../../patterns/model/pattern';
import type { CrochetProject, Pattern, ProgressSnapshot } from '@/types/cozy';

export function createProject(pattern: Pattern): CrochetProject {
  if (!isUsable(pattern)) throw new Error('Add a title and usable instructions before starting.');
  return freshProject(pattern, pattern.title, pattern.id);
}

export function restartProject(project: CrochetProject, name: string): CrochetProject {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error('Enter a project name.');
  if (project.status !== 'completed' || project.deletedAt) throw new Error('Choose a finished project to start again.');
  if (!project.patternSnapshot.instructions.length) throw new Error('This project has no saved instructions.');
  return freshProject(project.patternSnapshot, trimmedName, project.patternId);
}

function freshProject(pattern: Pattern, name: string, patternId: string): CrochetProject {
  const now = new Date().toISOString();
  return {
    id: newId(), name, patternId,
    patternSnapshot: JSON.parse(JSON.stringify(pattern)),
    currentRowIndex: 0, rows: pattern.instructions.map(() => ({ count: 0, completed: false })),
    status: 'active', createdAt: now, updatedAt: now,
  };
}
export type ProgressAction = { type: 'count'; delta: 1 | -1 } | { type: 'completeRow' } |
  { type: 'navigate'; index: number } | { type: 'undo' } | { type: 'finish' };
export function updateProgress(project: CrochetProject, action: ProgressAction): CrochetProject {
  if (project.status === 'completed' || project.deletedAt) return project;
  const snapshot: ProgressSnapshot = {
    currentRowIndex: project.currentRowIndex, rows: project.rows.map(row => ({ ...row })),
  };
  const next = { ...project, rows: project.rows.map(row => ({ ...row })) };
  const history = project.undoHistory ?? (project.undo ? [project.undo] : []);
  const row = next.rows[next.currentRowIndex];
  switch (action.type) {
    case 'count':
      if (action.delta === 1 && project.patternSnapshot.instructions[next.currentRowIndex].expectedStitchCount !== undefined && row.count >= project.patternSnapshot.instructions[next.currentRowIndex].expectedStitchCount!) return project;
      if ((action.delta === -1 && row.count === 0) || (action.delta === 1 && row.count === Number.MAX_SAFE_INTEGER)) return project;
      row.count += action.delta;
      next.undo = snapshot;
      next.undoHistory = [snapshot];
      break;
    case 'completeRow':
      if (row.completed) return project;
      row.completed = true;
      next.currentRowIndex = Math.min(next.currentRowIndex + 1, next.rows.length - 1);
      next.undo = snapshot;
      next.undoHistory = [snapshot];
      break;
    case 'navigate':
      if (!Number.isInteger(action.index) || action.index < 0 || action.index >= next.rows.length || action.index === next.currentRowIndex) return project;
      next.currentRowIndex = action.index;
      break;
    case 'undo':
      if (!history.length) return project;
      next.currentRowIndex = history[history.length - 1].currentRowIndex;
      next.rows = history[history.length - 1].rows.map(r => ({ ...r }));
      next.undoHistory = [];
      next.undo = undefined;
      break;
    case 'finish':
      if (!next.rows.every(r => r.completed)) return project;
      next.status = 'completed';
      next.completedAt = new Date().toISOString();
      next.undo = undefined;
      next.undoHistory = [];
      break;
  }
  next.updatedAt = new Date().toISOString();
  return next;
}
