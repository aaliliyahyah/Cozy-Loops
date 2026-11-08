import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { originTarget } from '@/components/navigation/origin';
import { BackButton } from '@/components/navigation/BackButton';
import { IconButton } from '@/components/library/Controls';
import { TabHeader } from '@/components/layout/TabHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { Photo } from '@/components/ui/Photo';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/layout/Screen';
import { useApp } from '@/providers/AppProvider';
import { theme } from '@/theme';
import type { PatternRow } from '@/types/cozy';

export default function ProjectCompleteScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { data, change } = useApp();
  const project = data.projects.find(p => p.id === id && !p.deletedAt);
  const backTarget = originTarget(from, '/(tabs)/count');
  const header = <TabHeader title="Finished project" icon="yarn" leading={<BackButton target={backTarget} />} />;
  if (!project) return <Screen contentStyle={styles.page} header={header}><Card><Heading>Project unavailable</Heading><Copy>Choose a project from My Projects, or restore it from Deleted.</Copy></Card></Screen>;
  if (project.status !== 'completed') return <Screen contentStyle={styles.page} header={header}><Card><Heading>{project.name}</Heading><Copy>This project is still in progress.</Copy><Button title="Continue project" olive onPress={() => router.replace({ pathname: '/(tabs)/count/[id]', params: { id, from } })} /></Card></Screen>;
  const pattern = project.patternSnapshot;
  const label = pattern.rowType === 'round' ? 'Round' : 'Row';
  const completed = project.rows.filter(row => row.completed).length;
  const groups = pattern.instructions.reduce<{ part: string; rows: { instruction: PatternRow; count: number }[] }[]>((result, instruction, index) => {
    const part = instruction.part?.trim() || 'Instructions';
    const row = { instruction, count: project.rows[index].count };
    if (result[result.length - 1]?.part === part) result[result.length - 1].rows.push(row);
    else result.push({ part, rows: [row] });
    return result;
  }, []);
  return <Screen contentStyle={styles.page} header={header}>
    <Card style={styles.overview}>
      <View style={styles.photo}><Photo uri={pattern.imageUri} crop={pattern.photoCrop} fill /><View style={styles.favorite}><IconButton icon={project.favorite ? 'heart' : 'heart-outline'} label={`${project.favorite ? 'Remove' : 'Add'} ${project.name} ${project.favorite ? 'from' : 'to'} favorites`} selected={!!project.favorite} onPress={() => change(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p) }))} /></View></View>
      <View style={styles.summary}>
        <Copy style={styles.badge}>Finished</Copy>
        <Heading>{project.name}</Heading>
        <Copy style={styles.muted}>Pattern: {pattern.title}</Copy>
        {!!pattern.description && <Copy>{pattern.description}</Copy>}
        {!!project.completedAt && <Copy style={styles.muted}>Completed {new Date(project.completedAt).toLocaleDateString()}</Copy>}
        <Progress completed={completed} total={project.rows.length} />
      </View>
    </Card>
    <Heading>Your completed {pattern.rowType}s</Heading>
    {groups.map((group, index) => <Card key={index}>
      <Copy style={styles.part}>{group.part}</Copy>
      {group.rows.map(({ instruction, count }) => <View key={instruction.id} style={styles.instruction}>
        <View style={styles.rowHeader}><Copy style={styles.rowLabel}>{label} {instruction.rowNumber}</Copy><Copy style={styles.count}>{count} stitches recorded</Copy></View>
        <Copy selectable>{instruction.instructionText}</Copy>
        {(instruction.yarnColor || instruction.hookSize) && <Copy style={styles.muted}>{[instruction.yarnColor && `Color: ${instruction.yarnColor}`, instruction.hookSize && `Hook: ${instruction.hookSize}`].filter(Boolean).join(' / ')}</Copy>}
      </View>)}
    </Card>)}
  </Screen>;
}
const styles = StyleSheet.create({
  page: { paddingTop: 0, gap: 14 },
  overview: { padding: 10, gap: 0, overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden' },
  favorite: { position: 'absolute', right: 8, bottom: 8 },
  summary: { padding: 8, paddingTop: 16, gap: 10 },
  badge: { alignSelf: 'flex-start', backgroundColor: theme.colors.sage, color: theme.colors.text, paddingHorizontal: 10, paddingVertical: 3, borderRadius: theme.radius.pill, fontSize: 12, fontFamily: theme.fonts.bold },
  muted: { color: theme.colors.muted, fontSize: 14, lineHeight: 22 },
  part: { fontFamily: theme.fonts.bold, color: theme.colors.navSelected, fontSize: 18, lineHeight: 26 },
  instruction: { gap: 6, paddingTop: 12, borderTopWidth: 1, borderColor: theme.colors.line },
  rowHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowLabel: { color: theme.colors.navSelected, fontFamily: theme.fonts.bold },
  count: { color: theme.colors.muted, fontSize: 13, lineHeight: 22, fontVariant: ['tabular-nums'] },
});
