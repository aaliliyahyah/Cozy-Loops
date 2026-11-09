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
import { displayTitle } from '@/utils/title';
import { WrittenPattern } from '@/features/patterns/components/WrittenPattern';
import { RestartProjectButton } from '../components/RestartProjectButton';

export default function ProjectCompleteScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { data, change } = useApp();
  const project = data.projects.find(p => p.id === id && !p.deletedAt);
  const backTarget = originTarget(from, '/(tabs)/count');
  const header = <TabHeader title={project ? displayTitle(project.name) : 'Finished project'} subtitle={project ? displayTitle(project.patternSnapshot.title) : undefined} icon="yarn" leading={<BackButton target={backTarget} />} />;
  if (!project) return <Screen contentStyle={styles.page} header={header}><Card><Heading>Project unavailable</Heading><Copy>Choose a project from My Projects, or restore it from Deleted.</Copy></Card></Screen>;
  if (project.status !== 'completed') return <Screen contentStyle={styles.page} header={header}><Card><Heading>{displayTitle(project.name)}</Heading><Copy>This project is still in progress.</Copy><Button title="Continue project" olive onPress={() => router.replace({ pathname: '/(tabs)/count/[id]', params: { id, from } })} /></Card></Screen>;
  const pattern = project.patternSnapshot;
  const completed = project.rows.filter(row => row.completed).length;
  return <Screen contentStyle={styles.page} header={header} footer={<View style={styles.floating}><RestartProjectButton projectId={project.id} from={from} /></View>}>
    <View style={styles.photo}>
      <Photo uri={pattern.imageUri} crop={pattern.photoCrop} fill />
      <View style={styles.photoActions}>
        <Copy style={styles.badge}>Finished</Copy>
        <IconButton icon={project.favorite ? 'heart' : 'heart-outline'} label={`${project.favorite ? 'Remove' : 'Add'} ${displayTitle(project.name)} ${project.favorite ? 'from' : 'to'} favorites`} selected={!!project.favorite} onPress={() => change(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p) }))} />
      </View>
    </View>
    {!!pattern.description?.trim() && <Card><Heading>Description</Heading><Copy style={styles.muted}>{pattern.description}</Copy></Card>}
    <Card>
      {!!project.completedAt && <Copy style={styles.muted}>Completed {new Date(project.completedAt).toLocaleDateString()}</Copy>}
      <Progress completed={completed} total={project.rows.length} />
    </Card>
    <WrittenPattern pattern={pattern} recordedCounts={project.rows.map(row => row.count)} />
  </Screen>;
}
const styles = StyleSheet.create({
  page: { paddingTop: 0, paddingBottom: 100 },
  floating: { position: 'absolute', right: 20, bottom: 16 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden' },
  photoActions: { position: 'absolute', left: 8, right: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  badge: { flexShrink: 0, backgroundColor: theme.colors.sage, color: theme.colors.text, paddingHorizontal: 10, paddingVertical: 3, borderRadius: theme.radius.pill, fontSize: 12, fontFamily: theme.fonts.bold },
  muted: { color: theme.colors.muted, fontSize: 14, lineHeight: 22 },
});
