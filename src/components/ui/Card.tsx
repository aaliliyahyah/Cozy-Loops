import type { ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) { return <View style={[styles.card, style]}>{children}</View>; }

const styles = StyleSheet.create({
  card: { borderRadius: theme.radius.card, backgroundColor: theme.colors.surface, padding: 18, gap: 14, borderWidth: 1, borderColor: theme.colors.line, boxShadow: '0px 2px 3px rgba(110, 68, 31, 0.08)' },
});
