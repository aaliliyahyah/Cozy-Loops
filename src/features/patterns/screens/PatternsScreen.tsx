import { router } from 'expo-router';
import { deleteLibraryItems, restoreLibraryItems } from '@/features/library/deletion';
import { confirm } from '@/utils/confirm';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useApp } from '@/providers/AppProvider';
import { Chip, IconButton } from '@/components/library/Controls';
import { LibraryCard } from '@/components/library/LibraryCard';
import { LibraryScreen } from '@/components/library/LibraryScreen';
import { SearchBar } from '@/components/library/SearchBar';
import { libraryStyles } from '@/components/library/styles';
export default function PatternsScreen() {
  const { data, change } = useApp();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(false);
  const [status, setStatus] = useState('all');
  const patterns = data.patterns.filter(p => p.title.toLowerCase().includes(search.trim().toLowerCase()) && (!favorites || p.favorite) && (status === 'deleted' ? !!p.deletedAt : !p.deletedAt && (status === 'all' || p.status === status))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return <LibraryScreen title="Patterns" subtitle="Your saved designs, ready to crochet." items={patterns} emptyTitle={status === 'deleted' ? 'No deleted patterns' : search || favorites || status !== 'all' ? 'No matching patterns' : 'A place for your patterns'} emptyDetail={status === 'deleted' ? 'Deleted patterns appear here. Tap one to restore it.' : 'Add a pattern with the plus button, or adjust your search and filters.'}
    floating={<IconButton icon="plus" label="Add pattern" selected floating onPress={() => router.push({ pathname: '/(tabs)/add', params: { from: 'patterns' } })} />}
    controls={<><SearchBar label="Search patterns" value={search} onChangeText={setSearch}><IconButton icon="heart-outline" label="Show favorites" selected={favorites} onPress={() => setFavorites(v => !v)} /></SearchBar>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={libraryStyles.row}>{['all', 'ready', 'draft', 'deleted'].map(v => <Chip key={v} title={v === 'all' ? 'All' : v === 'ready' ? 'Ready' : v === 'draft' ? 'Drafts' : `Deleted (${data.patterns.filter(p => p.deletedAt).length})`} selected={status === v} onPress={() => setStatus(v)} />)}</ScrollView>
</>}
    renderItem={p => <LibraryCard id={p.id} deleteLabel={`Delete ${p.title || 'Untitled draft'}`} onDelete={p.deletedAt ? undefined : () => confirm('Delete pattern?', 'This pattern will move to Deleted. Existing projects keep their instructions.', () => change(d => deleteLibraryItems(d, 'patterns', [p.id])), true)} title={p.title || 'Untitled draft'} uri={p.imageUri} crop={p.photoCrop} description={p.description || `${p.instructions.length} ${p.rowType}s`} badge={p.deletedAt ? 'Deleted' : p.status === 'ready' ? 'Ready' : 'Draft'} label={`${p.deletedAt ? 'Restore' : p.status === 'draft' ? 'Edit draft' : 'View pattern'} ${p.title || 'Untitled draft'}`} onPress={() => p.deletedAt ? confirm('Restore pattern?', 'This pattern will return to your library.', () => change(d => restoreLibraryItems(d, 'patterns', [p.id]))) : router.push({ pathname: p.status === 'draft' ? '/pattern/edit/[id]' : '/pattern/[id]', params: { id: p.id, from: 'patterns' } })} accessory={p.deletedAt ? <IconButton icon="arrow-undo-outline" label={`Restore ${p.title || 'Untitled draft'}`} onPress={() => change(d => restoreLibraryItems(d, 'patterns', [p.id]))} /> : <IconButton icon={p.favorite ? 'heart' : 'heart-outline'} label={`${p.favorite ? 'Remove' : 'Add'} ${p.title || 'Untitled draft'} ${p.favorite ? 'from' : 'to'} favorites`} selected={!!p.favorite} onPress={() => change(d => ({ ...d, patterns: d.patterns.map(pattern => pattern.id === p.id ? { ...pattern, favorite: !pattern.favorite } : pattern) }))} />} />} />;
}
