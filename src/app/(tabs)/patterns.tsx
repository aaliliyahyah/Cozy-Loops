import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useApp } from '../../contexts/AppContext';
import { Chip, IconButton, LibraryCard, LibraryScreen, SearchBar, libraryStyles } from '../../components/library-ui';
export default function Patterns() {
  const { data, change } = useApp();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(false);
  const [favorites, setFavorites] = useState(false);
  const [status, setStatus] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const patterns = data.patterns.filter(p => p.title.toLowerCase().includes(search.trim().toLowerCase()) && (!favorites || p.favorite) && (status === 'all' || p.status === status) && (difficulty === 'all' || p.difficulty === difficulty)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return <LibraryScreen title="Patterns" subtitle="Your saved designs, ready to crochet." items={patterns} emptyTitle={search || favorites || status !== 'all' || difficulty !== 'all' ? 'No matching patterns' : 'A place for your patterns'} emptyDetail="Add a pattern with the plus button, or adjust your search and filters."
    floating={<IconButton icon="plus" label="Add pattern" selected floating onPress={() => router.push('/(tabs)/add')} />}
    controls={<><SearchBar label="Search patterns" value={search} onChangeText={setSearch}><IconButton icon="tune-variant" label="Filter patterns" selected={filters} onPress={() => setFilters(v => !v)} /><IconButton icon="heart-outline" label="Show favorites" selected={favorites} onPress={() => setFavorites(v => !v)} /></SearchBar>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={libraryStyles.row}>{['all', 'ready', 'draft'].map(v => <Chip key={v} title={v === 'all' ? 'All patterns' : v === 'ready' ? 'Ready' : 'Drafts'} selected={status === v} onPress={() => setStatus(v)} />)}</ScrollView>
      {filters && <View style={libraryStyles.row}>{['all', 'beginner', 'intermediate', 'advanced'].map(v => <Chip key={v} title={v === 'all' ? 'Any difficulty' : v[0].toUpperCase() + v.slice(1)} selected={difficulty === v} onPress={() => setDifficulty(v)} />)}</View>}</>}
    renderItem={p => <LibraryCard title={p.title || 'Untitled draft'} uri={p.imageUri} description={p.description || `${p.instructions.length} ${p.rowType}s`} badge={p.status === 'ready' ? 'Ready' : 'Draft'} label={`${p.status === 'draft' ? 'Edit draft' : 'View pattern'} ${p.title || 'Untitled draft'}`} onPress={() => router.push({ pathname: p.status === 'draft' ? '/pattern/edit/[id]' : '/pattern/[id]', params: { id: p.id } })} accessory={<IconButton icon={p.favorite ? 'heart' : 'heart-outline'} label={`${p.favorite ? 'Remove' : 'Add'} ${p.title || 'Untitled draft'} ${p.favorite ? 'from' : 'to'} favorites`} selected={!!p.favorite} onPress={() => change(d => ({ ...d, patterns: d.patterns.map(pattern => pattern.id === p.id ? { ...pattern, favorite: !pattern.favorite } : pattern) }))} />} />} />;
}
