import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScallopedGingham } from '@/components/ui/ScallopedGingham';
import { Icon } from '@/components/ui/Icon';
import { Copy } from '@/components/ui/Typography';
import { theme } from '@/theme';
export function TabHeader({ title, icon, leading, trailing }: { title: string; icon: string; leading?: ReactNode; trailing?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={{ gap: 8, paddingBottom: 4 }}><ScallopedGingham topFill={insets.top} /><View style={s.row}>{leading}<View style={s.center}><Copy accessibilityRole="header" style={s.title}>{title}</Copy><View accessible={false} style={s.iconBadge}><Icon name={icon} size={20} color={theme.colors.terracotta} /><View style={s.heart}><Icon name="heart" size={9} color={theme.colors.terracotta} fill={theme.colors.terracotta} /></View></View></View>{trailing}</View></View>;
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  center: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBadge: { flexShrink: 0, width: 34, height: 34, borderRadius: 12, backgroundColor: theme.colors.sand, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-7deg' }], borderWidth: 1, borderColor: theme.colors.line },
  heart: { position: 'absolute', right: -3, bottom: -2, backgroundColor: theme.colors.surface, padding: 2, borderRadius: 10 },
  title: { flexShrink: 1, fontFamily: theme.fonts.heading, fontSize: 26, lineHeight: 36 },
});
