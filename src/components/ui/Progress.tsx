import { View, StyleSheet } from 'react-native';
import { Copy } from '@/components/ui/Typography';
import { theme } from '@/theme';

export function Progress({ completed, total, caption = true, unit = 'rows completed' }: { completed: number; total: number; caption?: boolean; unit?: string }) {
  const percent = total > 0 ? Math.max(0, Math.min(100, Math.round(completed / total * 100))) : 0;
  return <View style={{ gap: 6 }} accessibilityLabel={`${completed} of ${total} ${unit}`} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: completed }}>
    <View style={styles.row}><View style={styles.track}><View style={[styles.fill, { width: `${percent}%` }]} /></View><Copy style={{ fontSize: 15, fontFamily: theme.fonts.bold }}>{percent}%</Copy></View>
    {caption && <Copy style={{ fontSize: 14, color: theme.colors.muted }}>{completed} of {total} completed</Copy>}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  track: { height: 11, flex: 1, borderRadius: 8, backgroundColor: theme.colors.line, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 8 },
});
