import { router } from 'expo-router';
import { LibraryCard } from '@/components/library/LibraryCard';
import { IconButton } from '@/components/library/Controls';
import { useApp } from '@/providers/AppProvider';
import { deleteLibraryItems, restoreLibraryItems } from '@/features/library/deletion';
import { confirm } from '@/utils/confirm';
import { displayTitle } from '@/utils/title';
import type { Pattern } from '@/types/cozy';

export function PatternCard({ pattern: p, from }: { pattern: Pattern; from: 'home' | 'patterns' }) {
  const { change } = useApp();
  const title = displayTitle(p.title);
  return <LibraryCard
    id={p.id}
    title={title}
    uri={p.imageUri}
    crop={p.photoCrop}
    description={p.description || `${p.instructions.length} ${p.rowType}s`}
    badge={p.deletedAt ? 'Deleted' : p.status === 'ready' ? 'Ready' : 'Draft'}
    label={`${p.deletedAt ? 'Restore' : 'View pattern'} ${title}`}
    deleteLabel={`Delete ${title}`}
    onDelete={p.deletedAt ? undefined : () => change(d => deleteLibraryItems(d, 'patterns', [p.id]))}
    onPress={() => p.deletedAt
      ? confirm('Restore pattern?', 'This pattern will return to your library.', () => change(d => restoreLibraryItems(d, 'patterns', [p.id])))
      : router.push({ pathname: '/pattern/[id]', params: { id: p.id, from } })}
    accessory={p.deletedAt
      ? <IconButton icon="arrow-undo-outline" label={`Restore ${title}`} onPress={() => change(d => restoreLibraryItems(d, 'patterns', [p.id]))} />
      : <IconButton icon={p.favorite ? 'heart' : 'heart-outline'} label={`${p.favorite ? 'Remove' : 'Add'} ${title} ${p.favorite ? 'from' : 'to'} favorites`} selected={!!p.favorite} onPress={() => change(d => ({ ...d, patterns: d.patterns.map(pattern => pattern.id === p.id ? { ...pattern, favorite: !pattern.favorite } : pattern) }))} />}
  />;
}
