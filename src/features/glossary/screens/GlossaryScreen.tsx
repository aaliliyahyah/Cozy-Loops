import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { LibraryCard } from '@/components/library/LibraryCard';
import { LibraryScreen } from '@/components/library/LibraryScreen';
import { SearchBar } from '@/components/library/SearchBar';
import { StitchIllustration } from '../components/StitchIllustration';
import { useApp } from '@/providers/AppProvider';
import { stitches, stitchAbbreviation, stitchName } from '@/features/glossary/data/stitches';
export function GlossaryScreen() {
  const [search, setSearch] = useState(''); const { data } = useApp();
  const { fromProject } = useLocalSearchParams<{ fromProject?: string }>();
  const term = data.preferences.preferredTerminology;
  const query = search.trim().toLowerCase();
  const matches = stitches.filter(s => [s.name, s.abbreviation, s.ukName, s.ukAbbreviation].filter(Boolean).join(' ').toLowerCase().includes(query));
  return <LibraryScreen title="Stitch glossary" subtitle={`Your offline reference / ${term} terminology`} items={matches} emptyTitle="No stitches found" emptyDetail="Try a name or abbreviation, such as chain or sc."
    controls={<>{fromProject && <Button title="Return to Work Mode" secondary onPress={() => router.back()} />}<SearchBar label="Search stitches" value={search} onChangeText={setSearch} /></>}
    renderItem={stitch => <LibraryCard title={stitchName(stitch, term)} description={stitch.explanation} badge={stitchAbbreviation(stitch, term) || 'Technique'} label={`Open ${stitchName(stitch, term)} guide`} onPress={() => router.push({ pathname: '/stitch/[id]', params: { id: stitch.id, from: 'glossary' } })} art={<StitchIllustration compact id={stitch.id} label={stitchName(stitch, term)} />} />} />;
}
