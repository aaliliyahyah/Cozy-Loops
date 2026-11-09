import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { LibraryScreen } from '@/components/library/LibraryScreen';
import { SearchBar } from '@/components/library/SearchBar';
import { StitchCard } from '../components/StitchCard';
import { useApp } from '@/providers/AppProvider';
import { stitches } from '@/features/glossary/data/stitches';
export function GlossaryScreen() {
  const [search, setSearch] = useState(''); const { data } = useApp();
  const { fromProject } = useLocalSearchParams<{ fromProject?: string }>();
  const term = data.preferences.preferredTerminology;
  const query = search.trim().toLowerCase();
  const matches = stitches.filter(s => [s.name, s.abbreviation, s.ukName, s.ukAbbreviation].filter(Boolean).join(' ').toLowerCase().includes(query));
  return <LibraryScreen title="Stitch glossary" subtitle={`Your offline reference / ${term} terminology`} items={matches} emptyTitle="No stitches found" emptyDetail="Try a name or abbreviation, such as chain or sc."
    controls={<>{fromProject && <Button title="Return to Work Mode" secondary onPress={() => router.back()} />}<SearchBar label="Search stitches" value={search} onChangeText={setSearch} /></>}
    renderItem={stitch => <StitchCard stitch={stitch} terminology={term} from="glossary" />} />;
}
