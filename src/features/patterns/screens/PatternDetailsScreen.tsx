import { View, StyleSheet } from 'react-native';
import { BackButton } from '@/components/navigation/BackButton';
import { IconButton } from '@/components/library/Controls';
import { theme } from '@/theme';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { Field } from '@/components/ui/Field';
import { Photo } from '@/components/ui/Photo';
import { Screen } from '@/components/layout/Screen';
import { confirm } from '@/utils/confirm';
import { useApp } from '@/providers/AppProvider';
import { createProject } from '@/features/projects/model/progress';
import { isUsable } from '@/features/patterns/model/pattern';
export default function PatternDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { data, change } = useApp();
  const p = data.patterns.find(p => p.id === id); const [name, setName] = useState(''); const [starting, setStarting] = useState(false);
  const [choose, setChoose] = useState(false);
  if (!p) return <Screen title="Pattern unavailable"><Copy>Return to your library to choose a pattern.</Copy></Screen>;
  const active = data.projects.filter(project => project.patternId === id && project.status === 'active');
  const start = () => {
    if (starting || !isUsable(p)) return;
    setStarting(true); const project = createProject(p); project.name = name.trim() || p.title;
    change(d => ({ ...d, projects: [...d.projects, project] }));
    router.replace({ pathname: '/(tabs)/count/[id]', params: { id: project.id } });
  };
  const groups = p.instructions.reduce<{ part: string; rows: typeof p.instructions }[]>((result, row) => {
    const part = row.part?.trim() || 'Instructions';
    if (result[result.length - 1]?.part === part) result[result.length - 1].rows.push(row);
    else result.push({ part, rows: [row] });
    return result;
  }, []);
  return <Screen includeTopInset header={<View style={styles.toolbar}><BackButton fallback="/(tabs)/patterns" /><View style={styles.actions}><IconButton icon="pencil-outline" label="Edit pattern" onPress={() => router.push({ pathname: '/pattern/edit/[id]', params: { id } })} /><IconButton icon="trash-can-outline" label="Delete pattern" onPress={() => confirm('Delete pattern?', 'Existing projects keep their own copy of these instructions.', () => { change(d => ({ ...d, patterns: d.patterns.filter(pattern => pattern.id !== id) })); router.replace('/(tabs)/patterns'); }, true)} /></View></View>}>
    <Photo uri={p.imageUri} />
    <View style={styles.actions}><Copy style={styles.badge}>{p.status === 'ready' ? 'Ready' : 'Draft'}</Copy></View>
    <Heading>{p.title || 'Untitled draft'}</Heading>
    {!!p.description && <Copy style={styles.muted}>{p.description}</Copy>}
    {p.status === 'draft' && <Copy>Save this draft as a ready pattern before starting.</Copy>}
    <Field label="Project name (optional)" value={name} onChangeText={setName} placeholder={p.title} />
    <Button title="Start project" olive disabled={!isUsable(p) || starting} onPress={() => active.length ? setChoose(true) : start()} />
    {choose && <Card><Heading>Continue or begin again?</Heading>{active.map(project => <Button key={project.id} title={`Resume ${project.name}`} secondary onPress={() => router.replace({ pathname: '/(tabs)/count/[id]', params: { id: project.id } })} />)}<Button title="Start another project" disabled={starting} onPress={start} /></Card>}
    <Heading>Materials and tools</Heading>
    <Card>{[['Yarn', p.yarnType], ['Colors', p.yarnColors?.join(', ')], ['Hook sizes', p.hookSizes?.join(', ') || p.hookSize], ['Other tools', p.otherTools]].map(([label, value]) => <View key={label} style={styles.material}><Copy style={styles.materialLabel}>{label}</Copy><Copy>{value || 'Not specified'}</Copy></View>)}</Card>
    <Heading>Written pattern</Heading><Copy style={styles.muted}>{p.instructions.length} {p.rowType}s</Copy>
    {groups.map((group, groupIndex) => <Card key={groupIndex}><Heading>{group.part}</Heading>{group.rows.map(row => <View key={row.id} style={styles.material}><Copy style={styles.rowLabel}>{p.rowType === 'round' ? 'Round' : 'Row'} {row.rowNumber}</Copy><Copy selectable>{row.instructionText || 'Empty instruction'}</Copy>{row.expectedStitchCount !== undefined && <Copy style={styles.muted}>Target: {row.expectedStitchCount} stitches</Copy>}{(row.yarnColor || row.hookSize) && <Copy style={styles.muted}>{[row.yarnColor && `Color: ${row.yarnColor}`, row.hookSize && `Hook: ${row.hookSize}`].filter(Boolean).join(' / ')}</Copy>}</View>)}</Card>)}
  </Screen>;
}
const styles = StyleSheet.create({ toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, actions: { flexDirection: 'row', gap: 8, alignItems: 'center' }, badge: { backgroundColor: theme.colors.sage, paddingHorizontal: 10, paddingVertical: 3, borderRadius: theme.radius.pill, fontSize: 12, fontFamily: theme.fonts.bold }, rose: { backgroundColor: theme.colors.rose }, muted: { color: theme.colors.muted, fontSize: 14 }, material: { gap: 5, paddingBottom: 10, borderBottomWidth: 1, borderColor: theme.colors.line }, materialLabel: { fontSize: 12, color: theme.colors.muted, fontFamily: theme.fonts.bold }, rowLabel: { color: theme.colors.primary, fontFamily: theme.fonts.bold } });
