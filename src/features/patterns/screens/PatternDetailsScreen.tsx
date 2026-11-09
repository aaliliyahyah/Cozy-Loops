import { View, StyleSheet } from 'react-native';
import { BackButton } from '@/components/navigation/BackButton';
import { IconButton } from '@/components/library/Controls';
import { deleteLibraryItems } from '@/features/library/deletion';
import { theme } from '@/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { Photo } from '@/components/ui/Photo';
import { Screen } from '@/components/layout/Screen';
import { TabHeader } from '@/components/layout/TabHeader';
import { confirm } from '@/utils/confirm';
import { useApp } from '@/providers/AppProvider';
import { displayTitle } from '@/utils/title';
import { WrittenPattern } from '../components/WrittenPattern';
import { StartProjectButton } from '../components/StartProjectButton';
export default function PatternDetailsScreen() {
  const { id, from = 'patterns' } = useLocalSearchParams<{ id: string; from?: string }>(); const { data, change } = useApp();
  const p = data.patterns.find(p => p.id === id && !p.deletedAt);
  if (!p) return <Screen title="Pattern unavailable"><Copy>Return to your library to choose a pattern.</Copy></Screen>;
  return <Screen contentStyle={styles.page} footer={<View style={styles.floating}><StartProjectButton patternId={id} from={from} /></View>} header={<TabHeader title={displayTitle(p.title)} icon="book-open-variant" leading={<BackButton fallback="/(tabs)/patterns" />} trailing={<View style={styles.actions}><IconButton icon="pencil-outline" label="Edit pattern" onPress={() => router.push({ pathname: '/pattern/edit/[id]', params: { id, from } })} /><IconButton icon="trash-can-outline" label="Delete pattern" onPress={() => confirm('Delete pattern?', 'This pattern will move to Deleted. Existing projects keep their own copy of these instructions.', () => { change(d => deleteLibraryItems(d, 'patterns', [id])); router.navigate({ pathname: '/(tabs)/patterns', params: { from: 'patterns' } }); }, true)} /></View>} />}>
    <View style={styles.photo}><Photo uri={p.imageUri} crop={p.photoCrop} fill /><View style={styles.photoActions}><Copy style={styles.badge}>{p.status === 'ready' ? 'Ready' : 'Draft'}</Copy><IconButton icon={p.favorite ? 'heart' : 'heart-outline'} label={`${p.favorite ? 'Remove' : 'Add'} ${displayTitle(p.title)} ${p.favorite ? 'from' : 'to'} favorites`} selected={!!p.favorite} onPress={() => change(d => ({ ...d, patterns: d.patterns.map(pattern => pattern.id === id ? { ...pattern, favorite: !pattern.favorite } : pattern) }))} /></View></View>
    {!!p.description?.trim() && <Card><Heading>Description</Heading><Copy style={styles.muted}>{p.description}</Copy></Card>}
    <Heading>Materials and tools</Heading>
    <Card>{[['Yarn', p.yarnType], ['Colors', p.yarnColors?.join(', ')], ['Hook sizes', p.hookSizes?.join(', ') || p.hookSize], ['Other tools', p.otherTools]].map(([label, value]) => <View key={label} style={styles.material}><Copy style={styles.materialLabel}>{label}</Copy><Copy>{value || 'Not specified'}</Copy></View>)}</Card>
    <WrittenPattern pattern={p} />
  </Screen>;
}
const styles = StyleSheet.create({ page: { paddingTop: 0, paddingBottom: 100 }, floating: { position: 'absolute', right: 20, bottom: 16 }, photo: { width: '100%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden' }, photoActions: { position: 'absolute', left: 8, right: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, actions: { flexDirection: 'row', gap: 8, alignItems: 'center' }, badge: { flexShrink: 0, backgroundColor: theme.colors.sage, paddingHorizontal: 10, paddingVertical: 3, borderRadius: theme.radius.pill, fontSize: 12, fontFamily: theme.fonts.bold }, rose: { backgroundColor: theme.colors.rose }, muted: { color: theme.colors.muted, fontSize: 14 }, material: { gap: 5, paddingBottom: 10, borderBottomWidth: 1, borderColor: theme.colors.line }, materialLabel: { fontSize: 12, color: theme.colors.muted, fontFamily: theme.fonts.bold } });
