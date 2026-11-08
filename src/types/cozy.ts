import type { PhotoCrop } from '@/features/patterns/model/photo';
export type RowType = 'row' | 'round';
export interface PatternRow {
  part?: string;
  yarnColor?: string;
  hookSize?: string;
  id: string;
  rowNumber: number;
  instructionText: string;
  expectedStitchCount?: number;
}
export interface Pattern {
  yarnColors?: string[];
  hookSizes?: string[];
  otherTools?: string;
  favorite?: boolean;
  id: string;
  title: string;
  description?: string;
  yarnType?: string;
  hookSize?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  imageUri?: string;
  photoCrop?: PhotoCrop;
  rowType: RowType;
  instructions: PatternRow[];
  pastedText?: string;
  status: 'draft' | 'ready';
  createdAt: string;
  updatedAt: string;
}
export interface RowProgress { count: number; completed: boolean }
export interface ProgressSnapshot { currentRowIndex: number; rows: RowProgress[] }
export interface CrochetProject extends ProgressSnapshot {
  favorite?: boolean;
  id: string;
  name: string;
  patternId: string;
  patternSnapshot: Pattern;
  status: 'active' | 'completed';
  undo?: ProgressSnapshot;
  undoHistory?: ProgressSnapshot[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
export interface UserPreferences {
  hapticsEnabled: boolean;
  preferredTerminology: 'US' | 'UK';
}
export interface AppData {
  version: 1;
  patterns: Pattern[];
  projects: CrochetProject[];
  preferences: UserPreferences;
}
