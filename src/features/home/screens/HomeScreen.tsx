import { Icon } from '@/components/ui/Icon';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { Photo } from '@/components/ui/Photo';
import { Screen } from '@/components/layout/Screen';
import { useApp } from '@/providers/AppProvider';
import { homeProjects } from '../model/projects';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { theme } from '@/theme';
import type { Pattern } from '@/types/cozy';
import { stitches, stitchName, stitchAbbreviation } from '@/features/glossary/data/stitches';
import { libraryStyles } from '@/components/library/styles';

function SectionTitle({ title, label, onPress }: { title: string; label: string; onPress: () => void }) {
  return <View style={styles.section}>
    <View style={{ flex: 1 }}><Heading>{title}</Heading></View>
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.viewAll, pressed && { opacity: 0.6 }]}>
      <Copy style={styles.link}>View all</Copy><Icon name="chevron-forward" size={15} color={theme.colors.navSelected} />
    </Pressable>
  </View>;
}

function PatternCard({ pattern, width }: { pattern: Pattern; width: number }) {
  const draft = pattern.status === 'draft';
  return <Pressable accessibilityRole="button" accessibilityLabel={`${draft ? 'Edit draft' : 'View pattern'} ${pattern.title || 'Untitled draft'}`}
    onPress={() => router.push({ pathname: draft ? '/pattern/edit/[id]' : '/pattern/[id]', params: { id: pattern.id, from: 'home' } })}
    style={({ pressed }) => [styles.pattern, { width }, pressed && { opacity: 0.75 }]}>
    <Photo uri={pattern.imageUri} crop={pattern.photoCrop} size={width - 20} />
    <Copy numberOfLines={2} style={styles.patternTitle}>{pattern.title || 'Untitled draft'}</Copy>
    {draft && <Copy style={styles.draft}>Draft</Copy>}
    <Copy numberOfLines={2} style={styles.description}>{pattern.description?.trim() || `${pattern.instructions.length} ${pattern.rowType}s`}</Copy>
  </Pressable>;
}

export default function HomeScreen() {
  const { data } = useApp();
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, 650);
  const cardWidth = (pageWidth - 40 - 12) / 2;
  const featured = homeProjects(data.projects).find(project => project.status === 'active');
  const patterns = data.patterns.filter(p => !p.deletedAt).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return <Screen includeTopInset header={<HomeHeader width={pageWidth} />} contentStyle={{ gap: 14, paddingBottom: 24 }}>
    <SectionTitle title="My Projects" label="View all projects" onPress={() => router.navigate({ pathname: '/(tabs)/count', params: { from: 'home' } })} />
    {featured ? <ProjectCard project={featured} compact /> : <Card>
      <Copy>No project in progress.</Copy>
      <Button title="Start a project" icon="add" onPress={() => router.push({ pathname: '/(tabs)/patterns', params: { from: 'home' } })} />
    </Card>}
    <SectionTitle title="My Patterns" label="View all patterns" onPress={() => router.push({ pathname: '/(tabs)/patterns', params: { from: 'home' } })} />
    {patterns.length ? <View style={styles.shelf}>
      <FlatList horizontal data={patterns} keyExtractor={pattern => pattern.id} showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shelfContent} initialNumToRender={4} windowSize={3}
        renderItem={({ item }) => <PatternCard pattern={item} width={cardWidth} />} />
    </View> : <Card>
      <Copy>Save a pattern for your next make.</Copy>
      <Button title="Add pattern" icon="add" secondary onPress={() => router.push({ pathname: '/(tabs)/add', params: { from: 'home' } })} />
    </Card>}
    <SectionTitle title="Stitch glossary" label="View all stitches" onPress={() => router.push({ pathname: '/(tabs)/glossary', params: { from: 'home' } })} />
    <View style={styles.shelf}><FlatList horizontal data={stitches} keyExtractor={stitch => stitch.id} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfContent} initialNumToRender={4} windowSize={3} renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Open ${stitchName(item, data.preferences.preferredTerminology)} guide`} style={[styles.pattern, { width: cardWidth }]} onPress={() => router.push({ pathname: '/stitch/[id]', params: { id: item.id, from: 'home' } })}><Copy style={libraryStyles.abbreviation}>{stitchAbbreviation(item, data.preferences.preferredTerminology) || '↻'}</Copy><Copy style={styles.patternTitle}>{stitchName(item, data.preferences.preferredTerminology)}</Copy><Copy style={styles.description}>Written stitch guide</Copy></Pressable>} /></View>
  </Screen>;
}

const styles = StyleSheet.create({
  section: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewAll: { flexDirection: 'row', gap: 2, alignItems: 'center', minHeight: 44, justifyContent: 'center', paddingLeft: 6 },
  link: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.navSelected },
  shelf: { marginHorizontal: -20 },
  shelfContent: { gap: 12, paddingHorizontal: 20, paddingBottom: 4 },
  pattern: { padding: 9, borderRadius: 21, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, gap: 7 },
  patternTitle: { fontFamily: theme.fonts.bold, fontSize: 15, lineHeight: 21, marginTop: 3 },
  description: { fontSize: 13, lineHeight: 19, color: theme.colors.muted },
  draft: { alignSelf: 'flex-start', fontSize: 11, lineHeight: 17, fontFamily: theme.fonts.bold, color: theme.colors.text, backgroundColor: theme.colors.sand, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
});
