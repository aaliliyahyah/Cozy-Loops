import { useContext, type ReactNode, type ComponentRef, type RefObject } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { useApp } from '@/providers/AppProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Copy } from '@/components/ui/Typography';
import { Gingham } from '@/components/ui/Gingham';
import { PageHeader } from './PageHeader';
import { theme } from '@/theme';

export function Screen({ title, subtitle, children, footer, scrollRef, onScrollOffset, scrollEnabled = true, decoration = false, header, includeTopInset = false, contentStyle }: { title?: string; subtitle?: string; children: ReactNode; footer?: ReactNode; scrollRef?: RefObject<ComponentRef<typeof ScrollView> | null>; scrollEnabled?: boolean; onScrollOffset?: (offset: number) => void; decoration?: boolean; header?: ReactNode; includeTopInset?: boolean; contentStyle?: StyleProp<ViewStyle> }) {
  const { ready, loadError, reload, saveStatus, retrySave } = useApp();
  const tabHeight = useContext(BottomTabBarHeightContext);
  const edges: ('top' | 'left' | 'right' | 'bottom')[] = ['left', 'right'];
  if (includeTopInset) edges.push('top');
  if (tabHeight === undefined) edges.push('bottom');
  return <SafeAreaView style={styles.safe} edges={edges}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView ref={scrollRef} scrollEnabled={scrollEnabled} onScroll={event => onScrollOffset?.(event.nativeEvent.contentOffset.y)} scrollEventThrottle={16} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.page, contentStyle]}>
      {header}
      {decoration && <Gingham />}
      {title && <PageHeader title={title} subtitle={subtitle}>{decoration && <Image source={require('@/assets/images/crochet-daisy.png')} accessible={false} style={{ width: 80, height: 88, resizeMode: 'contain' }} />}</PageHeader>}
      {loadError ? <Card><Copy accessibilityRole="alert">{loadError}</Copy><Button title="Try loading again" onPress={reload} /></Card> : !ready ? <ActivityIndicator accessibilityLabel="Loading saved crochet data" color={theme.colors.primary} /> : <>
        {saveStatus === 'error' && <Card><Copy accessibilityRole="alert">Changes are on this screen but could not be saved. Keep the app open and retry.</Copy><Button title="Retry saving" onPress={retrySave} /></Card>}
        {children}
      </>}
    </ScrollView>{ready && !loadError && footer}</KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  page: { padding: 20, paddingBottom: 32, gap: 20, width: '100%', maxWidth: 650, alignSelf: 'center' },
});
