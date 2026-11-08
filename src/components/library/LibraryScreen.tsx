import { useContext, type ReactNode } from 'react';
import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/providers/AppProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Copy } from '@/components/ui/Typography';
import { Empty } from '@/components/ui/EmptyState';
import { TabHeader } from '@/components/layout/TabHeader';
import { theme } from '@/theme';

export function LibraryScreen<T extends { id: string }>({ title, subtitle, controls, items, renderItem, emptyTitle, emptyDetail, floating }: { title: string; subtitle: string; controls: ReactNode; items: T[]; renderItem: (item: T) => ReactNode; emptyTitle: string; emptyDetail: string; floating?: ReactNode }) {
  const { ready, loadError, reload, saveStatus, retrySave } = useApp();
  const tabHeight = useContext(BottomTabBarHeightContext);
  const { width } = useWindowDimensions();
  const cellWidth = (Math.min(width, 650) - 52) / 2;
  const header = <View style={s.header}><TabHeader title={title} icon={title === 'Patterns' ? 'book-open-variant' : title === 'My Projects' ? 'yarn' : 'flower-tulip-outline'} /><View style={s.controls}>{controls}</View>{saveStatus === 'error' && <Card><Copy accessibilityRole="alert">Changes could not be saved.</Copy><Button title="Retry saving" onPress={retrySave} /></Card>}</View>;
  return <SafeAreaView edges={tabHeight === undefined ? ['left', 'right', 'bottom'] : ['left', 'right']} style={s.safe}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.safe}>
    {loadError ? <View style={s.header}><Copy accessibilityRole="alert">{loadError}</Copy><Button title="Try loading again" onPress={reload} /></View> : !ready ? <ActivityIndicator accessibilityLabel="Loading saved data" color={theme.colors.primary} /> : <FlatList data={items} numColumns={2} keyExtractor={item => item.id} renderItem={({ item }) => <View style={[s.cell, { width: cellWidth }]}>{renderItem(item)}</View>} ListHeaderComponent={header} ListEmptyComponent={<Empty title={emptyTitle} detail={emptyDetail} />} contentContainerStyle={s.list} columnWrapperStyle={s.gridRow} keyboardShouldPersistTaps="handled" initialNumToRender={8} windowSize={5} showsVerticalScrollIndicator={false} />}
    {ready && !loadError && floating && <View style={s.floating}>{floating}</View>}
  </KeyboardAvoidingView></SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { gap: 6, paddingBottom: 10 },
  title: { fontFamily: theme.fonts.heading, fontSize: theme.type.title, lineHeight: 38 },
  subtitle: { fontSize: theme.type.small, color: theme.colors.muted },
  controls: { gap: 12, marginTop: 16 },
  list: { width: '100%', maxWidth: 650, alignSelf: 'center', padding: 20, paddingTop: 0, paddingBottom: 100, gap: 14 },
  cell: { flexGrow: 0, flexShrink: 0 },
  gridRow: { gap: 12, alignItems: 'stretch' },
  floating: { position: 'absolute', right: 20, bottom: 16 },
});
