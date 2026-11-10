import type { ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) { return <View style={[styles.card, style]}>{children}</View>; }

export function CardHeader({ children }: { children: ReactNode }) {
  return <View style={styles.header}>{children}</View>;
}

const styles = StyleSheet.create({
  header: { paddingBottom: 12, borderBottomWidth: 1, borderColor: theme.colors.line },
  card: { borderRadius: theme.radius.card, backgroundColor: theme.colors.surface, padding: 18, gap: 14, borderWidth: 1, borderColor: theme.colors.line, boxShadow: '0px 2px 3px rgba(110, 68, 31, 0.08)' },
});
