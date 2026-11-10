import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Copy, Heading } from '@/components/ui/Typography';
import { theme } from '@/theme';

export function Empty({ title, detail, children }: { title: string; detail: string; children?: ReactNode }) {
  return <View style={styles.empty}>
    <View accessible={false} style={styles.icon}><Icon name="flower-tulip-outline" size={44} color={theme.colors.terracotta} /></View>
    <Heading style={styles.text}>{title}</Heading>
    <Copy style={[styles.text, { color: theme.colors.muted }]}>{detail}</Copy>
    {children && <View style={styles.actions}>{children}</View>}
  </View>;
}
const styles = StyleSheet.create({
  empty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16, gap: 12 },
  icon: { width: 84, height: 84, borderRadius: 42, backgroundColor: theme.colors.rose, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  text: { textAlign: 'center', maxWidth: 340 },
  actions: { alignSelf: 'center', marginTop: 4, gap: 10 },
});
