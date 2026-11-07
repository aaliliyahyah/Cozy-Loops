import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useApp } from '@/providers/AppProvider';
import { Progress } from '@/components/ui/Progress';
import { Chip } from '@/components/library/Controls';
import { LibraryCard } from '@/components/library/LibraryCard';
import { LibraryScreen } from '@/components/library/LibraryScreen';
import { SearchBar } from '@/components/library/SearchBar';
import { libraryStyles } from '@/components/library/styles';
export function ProjectsScreen() {
  const { data } = useApp();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'completed'>('active');
  const projects = data.projects.filter(p => p.status === status && p.name.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b) => (b.completedAt || b.updatedAt).localeCompare(a.completedAt || a.updatedAt));
  return <LibraryScreen title="My Projects" subtitle="A little progress, one stitch at a time." items={projects} emptyTitle={search ? 'No matching projects' : status === 'active' ? 'Your next make starts here' : 'Your finished makes'} emptyDetail={status === 'active' ? 'Start a project from a ready pattern in your Patterns library.' : 'Completed projects will appear here.'} controls={<><SearchBar label="Search projects" value={search} onChangeText={setSearch} /><View style={libraryStyles.row}><Chip title={`In progress (${data.projects.filter(p => p.status === 'active').length})`} selected={status === 'active'} onPress={() => setStatus('active')} /><Chip title={`Finished (${data.projects.filter(p => p.status === 'completed').length})`} selected={status === 'completed'} onPress={() => setStatus('completed')} /></View></>}
  renderItem={p => <LibraryCard title={p.name} description={p.patternSnapshot.description || `${p.patternSnapshot.rowType} ${p.currentRowIndex + 1} of ${p.rows.length}`} uri={p.patternSnapshot.imageUri} badge={p.status === 'completed' ? 'Finished' : 'In progress'} label={`${p.status === 'completed' ? 'View finished project' : 'Continue'} ${p.name}`} onPress={() => router.push({ pathname: p.status === 'completed' ? '/project/complete/[id]' : '/(tabs)/count/[id]', params: { id: p.id } })}><Progress completed={p.rows.filter(r=>r.completed).length} total={p.rows.length} caption={false} /></LibraryCard>} />;
}
