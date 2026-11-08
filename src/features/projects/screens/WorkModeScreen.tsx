import { useRef } from 'react';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/layout/Screen';
import { confirm } from '@/utils/confirm';
import { useApp } from '@/providers/AppProvider';
import { updateProgress, type ProgressAction } from '@/features/projects/model/progress';
import { BackButton } from '@/components/navigation/BackButton';
import { IconButton } from '@/components/library/Controls';
import { originTarget } from '@/components/navigation/origin';
import { theme } from '@/theme';

export function WorkModeScreen({ id, from }: { id: string; from?: string }) {
  const { data, change, saveStatus } = useApp();
  const lock = useRef(0);
  const backTarget = originTarget(from, '/(tabs)/count');
  const project = data.projects.find(p => p.id === id && !p.deletedAt);
  if (!project) return <Screen includeTopInset title="Project unavailable"><Copy>Choose a project from My Projects.</Copy><Button title="My projects" onPress={() => router.replace('/projects')} /></Screen>;
  if (project.status === 'completed') return <Screen includeTopInset title="This project is finished"><Button title="View finished project" onPress={() => router.replace({ pathname: '/project/complete/[id]', params: { id, from } })} /></Screen>;
  const index = project.currentRowIndex;
  const row = project.rows[index];
  const pattern = project.patternSnapshot;
  const instruction = pattern.instructions[index];
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
  return <Screen includeTopInset header={<View style={s.top}><BackButton target={backTarget} /><View style={s.context}><Heading>{project.name}</Heading><Copy style={s.muted}>{pattern.title}</Copy></View><Copy accessibilityLiveRegion="polite" style={s.save}>{saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save failed'}</Copy></View>}>
    <View style={s.rowNavigation}><IconButton icon="arrow-left" label={`Previous ${label.toLowerCase()}`} disabled={index === 0} onPress={() => act({ type: 'navigate', index: index - 1 })} /><Copy style={s.rowTitle}>{label} {instruction.rowNumber}</Copy><IconButton icon="arrow-right" label={`Next ${label.toLowerCase()}`} disabled={index === project.rows.length - 1} onPress={() => act({ type: 'navigate', index: index + 1 })} /></View>
    <Card><View style={s.rowContext}><Copy numberOfLines={2} style={s.part}>{instruction.part?.trim() || 'Instructions'}</Copy><Copy style={s.divider}>|</Copy><Copy style={s.rowTitle}>{label} {instruction.rowNumber}/{project.rows.length}</Copy></View>
      <View style={s.counts}><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.25} accessibilityLiveRegion="polite" accessibilityLabel={`${row.count} recorded stitches`} style={s.count}>{row.count}</Text>{instruction.expectedStitchCount !== undefined && <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} accessibilityLabel={`Target ${instruction.expectedStitchCount} stitches`} style={s.target}>/ {instruction.expectedStitchCount}</Text>}</View>
      <Copy style={s.caption}>stitches this {pattern.rowType}</Copy>
      {instruction.expectedStitchCount !== undefined && <Progress completed={row.count} total={instruction.expectedStitchCount} caption={false} unit="stitches recorded" />}

    <View style={s.actions}><IconButton icon="minus" label="Decrease recorded stitch count" disabled={row.count === 0} onPress={() => act({ type: 'count', delta: -1 })} /><Pressable accessibilityRole="button" accessibilityLabel="Increase recorded stitch count" accessibilityState={{ disabled: atTarget }} disabled={atTarget} onPress={() => act({ type: 'count', delta: 1 })} style={({ pressed }) => [s.plus, (atTarget || pressed) && s.dim]}><Copy style={s.plusText}>+1 Stitch</Copy></Pressable></View>
    </Card>
      <View style={s.actions}><View style={s.flex}><Button title="Undo" icon="arrow-undo-outline" secondary disabled={!canUndo} onPress={() => act({ type: 'undo' })} /></View><View style={s.flex}><Button title={row.completed ? `${label} done` : `Finish ${label.toLowerCase()}`} icon="checkmark" secondary disabled={row.completed} onPress={() => act({ type: 'completeRow' })} /></View></View>


    <Card><Heading>Written instruction</Heading><Copy selectable>{instruction.instructionText}</Copy>
      <View style={s.materials}><View style={s.flex}><Copy style={s.muted}>Yarn color</Copy><Copy>{instruction.yarnColor || pattern.yarnColors?.join(', ') || 'Not specified'}</Copy></View><View style={s.flex}><Copy style={s.muted}>Hook size</Copy><Copy>{instruction.hookSize || pattern.hookSizes?.join(', ') || pattern.hookSize || 'Not specified'}</Copy></View></View>
    </Card>
    <Progress completed={completed} total={project.rows.length} />
    <Button title="Finish project" disabled={completed !== project.rows.length} onPress={() => confirm('Finish your project?', 'Your completed project will stay in My Projects.', () => { act({ type: 'finish' }); router.push({ pathname: '/project/complete/[id]', params: { id, from } }); })} />
    {completed !== project.rows.length && <Copy style={s.caption}>Available once all rows are complete.</Copy>}
  </Screen>;
}
const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  summary: { flexDirection: 'row', gap: 12, alignItems: 'center' }, context: { flex: 1, gap: 4 },
  rowContext: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  divider: { color: theme.colors.muted, fontSize: 22, lineHeight: 30 },
  part: { flexShrink: 1, fontFamily: theme.fonts.bold, fontSize: 22, lineHeight: 30, color: theme.colors.terracotta, textAlign: 'center' },
  rowTitle: { fontFamily: theme.fonts.bold, fontSize: 20, lineHeight: 28, color: theme.colors.text, textAlign: 'center' },
  rowNavigation: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  counts: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 104 },
  count: { fontFamily: Platform.select({ android: 'sans-serif', ios: 'System', web: 'system-ui' }), color: theme.colors.text, fontWeight: '700', flexShrink: 1, textAlign: 'center', fontSize: 72, lineHeight: 96, fontVariant: ['tabular-nums'] },
  target: { color: theme.colors.muted, fontSize: 28, lineHeight: 40, flexShrink: 1, fontWeight: '600', fontVariant: ['tabular-nums'] },
  caption: { fontSize: 13, lineHeight: 20, textAlign: 'center', color: theme.colors.muted },
  plus: { flex: 1, minHeight: 66, borderRadius: theme.radius.card, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', padding: 16, boxShadow: theme.shadow.card },
  plusText: { fontFamily: theme.fonts.heading, fontSize: 26, lineHeight: 36, color: theme.colors.onPrimary },
  actions: { flexDirection: 'row', gap: 10 }, flex: { flex: 1 }, dim: { opacity: 0.5 },
  save: { fontSize: 12, color: theme.colors.navSelected }, muted: { color: theme.colors.muted, fontSize: 13 },
  materials: { flexDirection: 'row', gap: 16, paddingTop: 14, borderTopWidth: 1, borderColor: theme.colors.line },
});
