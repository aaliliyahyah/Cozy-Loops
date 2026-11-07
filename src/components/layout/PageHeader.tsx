import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Copy } from '@/components/ui/Typography';
import { theme } from '@/theme';
export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return <View style={s.header}><View style={s.row}><View style={s.text}><Copy accessibilityRole="header" style={s.title}>{title}</Copy>{subtitle && <Copy style={s.subtitle}>{subtitle}</Copy>}</View>{children}</View></View>;
}
const s = StyleSheet.create({ header: { gap: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, text: { flex: 1, gap: 6 }, title: { fontFamily: theme.fonts.heading, fontSize: 28, lineHeight: 38 }, subtitle: { fontSize: 14, lineHeight: 21, color: theme.colors.muted } });
