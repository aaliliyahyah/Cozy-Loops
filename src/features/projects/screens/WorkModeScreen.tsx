import { ProjectMenu } from '@/features/library/ItemMenu';
import { rowContext } from '@/features/patterns/model/rows';
import { useRef } from 'react';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/layout/Screen';
import { TabHeader } from '@/components/layout/TabHeader';
import { confirm } from '@/utils/confirm';
import { useApp } from '@/providers/AppProvider';
import { updateProgress, type ProgressAction } from '@/features/projects/model/progress';
import { BackButton } from '@/components/navigation/BackButton';
import { IconButton } from '@/components/library/Controls';
import { originTarget } from '@/components/navigation/origin';
import { displayTitle } from '@/utils/title';
import { theme } from '@/theme';

export function WorkModeScreen({ id, from }: { id: string; from?: string }) {
  const { data, change } = useApp();
  const lock = useRef(0);
  const backTarget = originTarget(from, '/(tabs)/count');
  const project = data.projects.find(p => p.id === id && !p.deletedAt);
  if (!project) return <Screen includeTopInset title="Project unavailable"><Copy>Choose a project from My Projects.</Copy><Button title="My projects" onPress={() => router.replace('/projects')} /></Screen>;
  if (project.status === 'completed') return <Screen includeTopInset title="This project is finished"><Button title="View finished project" onPress={() => router.replace({ pathname: '/project/complete/[id]', params: { id, from } })} /></Screen>;
  const index = project.currentRowIndex;
  const row = project.rows[index];
  const pattern = project.patternSnapshot;
  const instruction = pattern.instructions[index];
  const context = rowContext(pattern.instructions, index);
  const atTarget = instruction.expectedStitchCount !== undefined && row.count >= instruction.expectedStitchCount;
  const canUndo = project.undoHistory ? project.undoHistory.length > 0 : !!project.undo;
  const label = pattern.rowType === 'round' ? 'Round' : 'Row';
  const completed = project.rows.filter(r => r.completed).length;
  const act = (action: ProgressAction) => {
    if (action.type === 'navigate' || action.type === 'completeRow') {
      if (Date.now() < lock.current) return;
      lock.current = Date.now() + 450;
    }
    change(d => {
      const original = d.projects.find(p => p.id === id && !p.deletedAt);
      if (!original) return d;
      const updated = updateProgress(original, action);
      return updated === original ? d : { ...d, projects: d.projects.map(p => p.id === id ? updated : p) };
    });
    if (action.type === 'count' && data.preferences.hapticsEnabled) void Haptics.selectionAsync().catch(() => {});
  };
  return <Screen contentStyle={s.page} header={<TabHeader title={displayTitle(project.name)} subtitle={displayTitle(pattern.title)} icon="yarn" leading={<BackButton target={backTarget} />} trailing={<ProjectMenu project={project} from={from} leaveAfterDelete />} />}>
    <Card><CardHeader><View style={s.rowContext}>
      <View style={s.rowNavigation}>
        <IconButton icon="chevron-back" style={s.rowNavigationButton} label={`Previous ${label.toLowerCase()}`} disabled={index === 0} onPress={() => act({ type: 'navigate', index: index - 1 })} />
        <Copy accessibilityLiveRegion="polite" style={s.rowTitle}>{context.part}: {label} {context.number} / {context.total}</Copy>
        <IconButton icon="chevron-forward" style={s.rowNavigationButton} label={`Next ${label.toLowerCase()}`} disabled={index === project.rows.length - 1} onPress={() => act({ type: 'navigate', index: index + 1 })} />
      </View>
    </View></CardHeader>
      <View style={s.counts}><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.25} accessibilityLiveRegion="polite" accessibilityLabel={`${row.count} recorded stitches`} style={s.count}>{row.count}</Text>{instruction.expectedStitchCount !== undefined && <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} accessibilityLabel={`Target ${instruction.expectedStitchCount} stitches`} style={s.target}>/ {instruction.expectedStitchCount}</Text>}</View>
      {instruction.expectedStitchCount !== undefined && <Progress completed={row.count} total={instruction.expectedStitchCount} caption={false} unit="stitches recorded" />}

    <View style={s.actions}><IconButton icon="minus" label="Decrease recorded stitch count" disabled={row.count === 0} onPress={() => act({ type: 'count', delta: -1 })} /><Pressable accessibilityRole="button" accessibilityLabel="Increase recorded stitch count" accessibilityState={{ disabled: atTarget }} disabled={atTarget} onPress={() => act({ type: 'count', delta: 1 })} style={({ pressed }) => [s.plus, (atTarget || pressed) && s.dim]}><Copy style={s.plusText}>+1 Stitch</Copy></Pressable></View>
    </Card>
      <View style={s.actions}><View style={s.flex}><Button title="Undo" icon="arrow-undo-outline" secondary disabled={!canUndo} onPress={() => act({ type: 'undo' })} /></View><View style={s.flex}><Button title={row.completed ? `${label} done` : `Finish ${label.toLowerCase()}`} icon="checkmark" secondary disabled={row.completed} onPress={() => act({ type: 'completeRow' })} /></View></View>


    <Card><CardHeader><Heading>Written instruction</Heading></CardHeader>{!!instruction.part?.trim() && <Copy style={s.part}>{instruction.part.trim()}</Copy>}<Copy selectable>{instruction.instructionText}</Copy>
      <View style={s.materials}><View style={s.flex}><Copy style={s.muted}>Yarn color</Copy><Copy>{instruction.yarnColor || pattern.yarnColors?.join(', ') || 'Not specified'}</Copy></View><View style={s.flex}><Copy style={s.muted}>Hook size</Copy><Copy>{instruction.hookSize || pattern.hookSizes?.join(', ') || pattern.hookSize || 'Not specified'}</Copy></View></View>
    </Card>
    <Progress completed={completed} total={project.rows.length} />
    <Button title="Finish project" disabled={completed !== project.rows.length} onPress={() => confirm('Finish your project?', 'Your completed project will stay in My Projects.', () => { act({ type: 'finish' }); router.push({ pathname: '/project/complete/[id]', params: { id, from } }); })} />
    {completed !== project.rows.length && <Copy style={s.caption}>Available once all rows are complete.</Copy>}
  </Screen>;
}
const s = StyleSheet.create({
  page: { paddingTop: 0 },
  rowContext: { alignItems: 'center', gap: 12 },
  part: { fontFamily: theme.fonts.bold, fontSize: 14, lineHeight: 20, color: theme.colors.terracotta },
  rowTitle: { flexShrink: 1, fontFamily: theme.fonts.bold, fontSize: 20, lineHeight: 28, color: theme.colors.text, textAlign: 'center' },
  rowNavigation: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  rowNavigationButton: { borderWidth: 0, backgroundColor: 'transparent' },
  counts: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 104 },
  count: { fontFamily: Platform.select({ android: 'sans-serif', ios: 'System', web: 'system-ui' }), color: theme.colors.text, fontWeight: '700', flexShrink: 1, textAlign: 'center', fontSize: 72, lineHeight: 96, fontVariant: ['tabular-nums'] },
  target: { color: theme.colors.muted, fontSize: 28, lineHeight: 40, flexShrink: 1, fontWeight: '600', fontVariant: ['tabular-nums'] },
  caption: { fontSize: 13, lineHeight: 20, textAlign: 'center', color: theme.colors.muted },
  plus: { flex: 1, minHeight: 66, borderRadius: theme.radius.card, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', padding: 16, boxShadow: theme.shadow.card },
  plusText: { fontFamily: theme.fonts.heading, fontSize: 26, lineHeight: 36, color: theme.colors.onPrimary },
  actions: { flexDirection: 'row', gap: 10 }, flex: { flex: 1 }, dim: { opacity: 0.5 },
  muted: { color: theme.colors.muted, fontSize: 13 },
  materials: { flexDirection: 'row', gap: 16, paddingTop: 14, borderTopWidth: 1, borderColor: theme.colors.line },
});
