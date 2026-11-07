import type { Pattern } from '@/types/cozy';

export const isUsable = (p: Pattern) => p.status === 'ready' && !!p.title.trim() &&
  p.instructions.length > 0 && p.instructions.every(r => !!r.instructionText.trim());
