import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useApp } from '@/providers/AppProvider';
import { Chip, IconButton } from '@/components/library/Controls';
import { LibraryScreen } from '@/components/library/LibraryScreen';
import { PatternCard } from '../components/PatternCard';
import { SearchBar } from '@/components/library/SearchBar';
import { libraryStyles } from '@/components/library/styles';
import { displayTitle } from '@/utils/title';
import { theme } from '@/theme';
export default function PatternsScreen() {
  const { data } = useApp();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(false);
  const [status, setStatus] = useState('all');
  const patterns = data.patterns.filter(p => displayTitle(p.title).toLowerCase().includes(search.trim().toLowerCase()) && (!favorites || p.favorite) && (status === 'deleted' ? !!p.deletedAt : !p.deletedAt && (status === 'all' || p.status === status))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return <LibraryScreen title="Patterns" subtitle="Your saved designs, ready to crochet." items={patterns} emptyTitle={status === 'deleted' ? 'No deleted patterns' : search || favorites || status !== 'all' ? 'No matching patterns' : 'A place for your patterns'} emptyDetail={status === 'deleted' ? 'Deleted patterns appear here. Tap one to restore it.' : 'Add a pattern with the plus button, or adjust your search and filters.'}
    floating={<IconButton icon="plus" label="Add pattern" floating style={{ borderColor: theme.colors.line }} onPress={() => router.push({ pathname: '/(tabs)/add', params: { from: 'patterns' } })} />}
    controls={<><SearchBar label="Search patterns" value={search} onChangeText={setSearch}><IconButton icon="heart-outline" label="Show favorites" selected={favorites} onPress={() => setFavorites(v => !v)} /></SearchBar>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={libraryStyles.row}>{['all', 'ready', 'draft', 'deleted'].map(v => <Chip key={v} title={v === 'all' ? 'All' : v === 'ready' ? 'Ready' : v === 'draft' ? 'Drafts' : `Deleted (${data.patterns.filter(p => p.deletedAt).length})`} selected={status === v} onPress={() => setStatus(v)} />)}</ScrollView>
</>}
    renderItem={p => <PatternCard pattern={p} from="patterns" />} />;
}
