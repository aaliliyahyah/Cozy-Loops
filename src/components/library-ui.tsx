import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useContext, type ReactNode } from 'react';
import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../contexts/AppContext';
import { theme } from '../theme';
import { Button, Card, Copy, Empty, Photo } from './cozy-ui';

export type CraftIcon = keyof typeof MaterialCommunityIcons.glyphMap;
export function IconButton({ icon, label, onPress, selected = false, disabled = false, floating = false }: { icon: CraftIcon; label: string; onPress: () => void; selected?: boolean; disabled?: boolean; floating?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.icon, selected && s.selected, floating && s.fab, (pressed || disabled) && s.dim]}><MaterialCommunityIcons name={icon} size={floating ? 28 : 22} color={selected ? theme.colors.onPrimary : theme.colors.text} /></Pressable>;
}
export function Chip({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [s.chip, selected && s.selected, pressed && s.dim]}><Copy style={[s.chipText, selected && s.selectedText]}>{title}</Copy></Pressable>;
}
export function SearchBar({ value, onChangeText, label, children }: { value: string; onChangeText: (text: string) => void; label: string; children?: ReactNode }) {
  return <View style={s.row}><View style={s.search}><MaterialCommunityIcons name="magnify" size={22} color={theme.colors.muted} /><TextInput accessibilityLabel={label} placeholder={label} placeholderTextColor={theme.colors.muted} value={value} onChangeText={onChangeText} style={s.input} autoCapitalize="none" returnKeyType="search" /></View>{children}</View>;
}
export function LibraryScreen<T extends { id: string }>({ title, subtitle, controls, items, renderItem, emptyTitle, emptyDetail, floating }: { title: string; subtitle: string; controls: ReactNode; items: T[]; renderItem: (item: T) => ReactNode; emptyTitle: string; emptyDetail: string; floating?: ReactNode }) {
  const { ready, loadError, reload, saveStatus, retrySave } = useApp();
  const tabHeight = useContext(BottomTabBarHeightContext);
  const header = <View style={s.header}><Copy accessibilityRole="header" style={s.title}>{title}</Copy><Copy style={s.subtitle}>{subtitle}</Copy><View style={s.controls}>{controls}</View>{saveStatus === 'error' && <Card><Copy accessibilityRole="alert">Changes could not be saved.</Copy><Button title="Retry saving" onPress={retrySave} /></Card>}</View>;
  return <SafeAreaView edges={tabHeight === undefined ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']} style={s.safe}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.safe}>
    {loadError ? <View style={s.header}><Copy accessibilityRole="alert">{loadError}</Copy><Button title="Try loading again" onPress={reload} /></View> : !ready ? <ActivityIndicator accessibilityLabel="Loading saved data" color={theme.colors.primary} /> : <FlatList data={items} numColumns={2} keyExtractor={item => item.id} renderItem={({ item }) => <View style={s.cell}>{renderItem(item)}</View>} ListHeaderComponent={header} ListEmptyComponent={<Empty title={emptyTitle} detail={emptyDetail} />} contentContainerStyle={s.list} columnWrapperStyle={s.gridRow} keyboardShouldPersistTaps="handled" initialNumToRender={8} windowSize={5} showsVerticalScrollIndicator={false} />}
    {ready && !loadError && floating && <View style={s.floating}>{floating}</View>}
  </KeyboardAvoidingView></SafeAreaView>;
}
export function LibraryCard({ title, description, uri, badge, onPress, label, accessory, children, art }: { title: string; description?: string; uri?: string; badge?: string; onPress: () => void; label: string; accessory?: ReactNode; children?: ReactNode; art?: ReactNode }) {
  return <View style={s.card}><Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => pressed && s.dim}>
    <View style={s.image}>{art || <Photo uri={uri} fill />}</View><View style={s.cardBody}>{badge && <Copy style={s.badge}>{badge}</Copy>}<Copy style={s.cardTitle} numberOfLines={2}>{title}</Copy>{description && <Copy style={s.description} numberOfLines={2}>{description}</Copy>}{children}</View>
  </Pressable>{accessory && <View style={s.accessory}>{accessory}</View>}</View>;
}
export const libraryStyles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, muted: { color: theme.colors.muted }, art: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.sage, gap: 8 }, abbreviation: { fontFamily: theme.fonts.heading, fontSize: 34, lineHeight: 44, color: theme.colors.primary } });
const s = StyleSheet.create({
  fab: { width: 56, height: 56, borderRadius: theme.radius.pill, boxShadow: theme.shadow.raised },
  safe: { flex: 1, backgroundColor: theme.colors.background },
  list: { width: '100%', maxWidth: 650, alignSelf: 'center', padding: 20, paddingBottom: 100, gap: 14 },
  header: { gap: 6, paddingBottom: 10 }, title: { fontFamily: theme.fonts.heading, fontSize: theme.type.title, lineHeight: 38 }, subtitle: { fontSize: theme.type.small, color: theme.colors.muted }, controls: { gap: 12, marginTop: 16 },
  gridRow: { gap: 12, alignItems: 'flex-start' }, cell: { width: '48%', flexGrow: 0, flexShrink: 1 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' }, search: { flex: 1, flexDirection: 'row', gap: 8, minHeight: 48, paddingHorizontal: 12, borderRadius: theme.radius.field, backgroundColor: theme.colors.paper, borderWidth: 1, borderColor: theme.colors.line, alignItems: 'center' }, input: { flex: 1, minWidth: 0, minHeight: 46, color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 14 },
  icon: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.field, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.paper }, chip: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 10, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, justifyContent: 'center' }, chipText: { fontFamily: theme.fonts.bold, fontSize: 13 }, selected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, selectedText: { color: theme.colors.onPrimary }, dim: { opacity: 0.6 },
  card: { borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, overflow: 'hidden' }, image: { width: '100%', aspectRatio: 1, overflow: 'hidden', backgroundColor: theme.colors.sand }, cardBody: { padding: 12, gap: 6 }, cardTitle: { fontFamily: theme.fonts.heading, fontSize: 16, lineHeight: 22 }, description: { fontSize: 12, lineHeight: 18, color: theme.colors.muted }, badge: { alignSelf: 'flex-start', backgroundColor: theme.colors.sage, paddingHorizontal: 8, borderRadius: theme.radius.pill, fontSize: 11, lineHeight: 20, fontFamily: theme.fonts.bold }, accessory: { position: 'absolute', right: 6, top: 6 }, floating: { position: 'absolute', right: 20, bottom: 16 },
});
