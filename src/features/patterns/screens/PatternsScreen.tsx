import { router } from 'expo-router';
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
  const patterns = data.patterns.filter(p => p.title.toLowerCase().includes(search.trim().toLowerCase()) && (!favorites || p.favorite) && (status === 'all' || p.status === status)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return <LibraryScreen title="Patterns" subtitle="Your saved designs, ready to crochet." items={patterns} emptyTitle={search || favorites || status !== 'all' ? 'No matching patterns' : 'A place for your patterns'} emptyDetail="Add a pattern with the plus button, or adjust your search and filters."
    floating={<IconButton icon="plus" label="Add pattern" selected floating onPress={() => router.push({ pathname: '/(tabs)/add', params: { from: 'patterns' } })} />}
    controls={<><SearchBar label="Search patterns" value={search} onChangeText={setSearch}><IconButton icon="heart-outline" label="Show favorites" selected={favorites} onPress={() => setFavorites(v => !v)} /></SearchBar>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={libraryStyles.row}>{['all', 'ready', 'draft'].map(v => <Chip key={v} title={v === 'all' ? 'All patterns' : v === 'ready' ? 'Ready' : 'Drafts'} selected={status === v} onPress={() => setStatus(v)} />)}</ScrollView>
</>}
    renderItem={p => <LibraryCard title={p.title || 'Untitled draft'} uri={p.imageUri} description={p.description || `${p.instructions.length} ${p.rowType}s`} badge={p.status === 'ready' ? 'Ready' : 'Draft'} label={`${p.status === 'draft' ? 'Edit draft' : 'View pattern'} ${p.title || 'Untitled draft'}`} onPress={() => router.push({ pathname: p.status === 'draft' ? '/pattern/edit/[id]' : '/pattern/[id]', params: { id: p.id } })} accessory={<IconButton icon={p.favorite ? 'heart' : 'heart-outline'} label={`${p.favorite ? 'Remove' : 'Add'} ${p.title || 'Untitled draft'} ${p.favorite ? 'from' : 'to'} favorites`} selected={!!p.favorite} onPress={() => change(d => ({ ...d, patterns: d.patterns.map(pattern => pattern.id === p.id ? { ...pattern, favorite: !pattern.favorite } : pattern) }))} />} />} />;
}
