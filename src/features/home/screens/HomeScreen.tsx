import { Empty } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Copy, Heading } from '@/components/ui/Typography';
import { CardActionsProvider } from '@/components/library/CardActions';
import { PatternCard } from '@/features/patterns/components/PatternCard';
import { Screen } from '@/components/layout/Screen';
import { useApp } from '@/providers/AppProvider';
import { homeProjects } from '../model/projects';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { theme } from '@/theme';
import { stitches } from '@/features/glossary/data/stitches';
import { StitchCard } from '@/features/glossary/components/StitchCard';

function SectionTitle({ title, label, onPress }: { title: string; label: string; onPress: () => void }) {
  return <View style={styles.section}>
    <View style={{ flex: 1 }}><Heading>{title}</Heading></View>
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.viewAll, pressed && { opacity: 0.6 }]}>
      <Copy style={styles.link}>View all</Copy><Icon name="chevron-forward" size={15} color={theme.colors.navSelected} />
    </Pressable>
  </View>;
}

export default function HomeScreen() {
  const { data } = useApp();
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, 650);
  const cardWidth = (pageWidth - 40 - 12) / 2;
  const featured = homeProjects(data.projects).find(project => project.status === 'active');
  const patterns = data.patterns.filter(p => !p.deletedAt).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return <CardActionsProvider><Screen includeTopInset header={<HomeHeader width={pageWidth} />} contentStyle={{ gap: 14, paddingBottom: 24 }}>
    <SectionTitle title="My Projects" label="View all projects" onPress={() => router.navigate({ pathname: '/(tabs)/count', params: { from: 'home' } })} />
    {featured ? <ProjectCard project={featured} compact /> : <Empty title="Your next make starts here" detail="A little progress, one stitch at a time.">
      <Button title="Start a project" icon="add" onPress={() => router.push({ pathname: '/(tabs)/patterns', params: { from: 'home' } })} />
    </Empty>}
    <SectionTitle title="My Patterns" label="View all patterns" onPress={() => router.push({ pathname: '/(tabs)/patterns', params: { from: 'home' } })} />
    {patterns.length ? <View style={styles.shelf}>
      <FlatList horizontal data={patterns} keyExtractor={pattern => pattern.id} showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shelfContent} initialNumToRender={4} windowSize={3}
        renderItem={({ item }) => <View style={{ width: cardWidth }}><PatternCard pattern={item} from="home" /></View>} />
    </View> : <Empty title="A little inspiration" detail="Save a pattern for your next make.">
      <Button title="Add pattern" icon="add" secondary onPress={() => router.push({ pathname: '/(tabs)/add', params: { from: 'home' } })} />
    </Empty>}
    <SectionTitle title="Stitch glossary" label="View all stitches" onPress={() => router.push({ pathname: '/(tabs)/glossary', params: { from: 'home' } })} />
    <View style={styles.shelf}><FlatList horizontal data={stitches} keyExtractor={stitch => stitch.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfContent} initialNumToRender={4} windowSize={3} renderItem={({ item }) => <View style={{ width: cardWidth }}><StitchCard stitch={item} terminology={data.preferences.preferredTerminology} from="home" /></View>} /></View>
  </Screen></CardActionsProvider>;
}

const styles = StyleSheet.create({
  section: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewAll: { flexDirection: 'row', gap: 2, alignItems: 'center', minHeight: 44, justifyContent: 'center', paddingLeft: 6 },
  link: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.navSelected },
  shelf: { marginHorizontal: -20 },
  shelfContent: { gap: 12, paddingHorizontal: 20, paddingBottom: 4 },
});
