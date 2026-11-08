import type { AppData } from '@/types/cozy';
export type LibraryCollection = 'patterns' | 'projects';
function changeDeletion(data: AppData, collection: LibraryCollection, ids: readonly string[], deleting: boolean): AppData {
  const selected = new Set(ids);
  const now = new Date().toISOString();
  const update = <T extends { id: string; deletedAt?: string; updatedAt: string }>(item: T): T => {
    if (!selected.has(item.id) || !!item.deletedAt === deleting) return item;
    return { ...item, deletedAt: deleting ? now : undefined, updatedAt: now };
  };
  if (collection === 'patterns') return { ...data, patterns: data.patterns.map(update) };
  return { ...data, projects: data.projects.map(update) };
}
export function deleteLibraryItems(data: AppData, collection: LibraryCollection, ids: readonly string[]): AppData {
  return changeDeletion(data, collection, ids, true);
}
export function restoreLibraryItems(data: AppData, collection: LibraryCollection, ids: readonly string[]): AppData {
  return changeDeletion(data, collection, ids, false);
}
