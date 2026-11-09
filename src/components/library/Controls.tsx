import { Icon } from '@/components/ui/Icon';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Copy } from '@/components/ui/Typography';
import { theme } from '@/theme';
export type CraftIcon = string;

export function IconButton({ icon, label, onPress, selected = false, disabled = false, floating = false, style, iconSize }: { icon: CraftIcon; label: string; onPress: () => void; selected?: boolean; disabled?: boolean; floating?: boolean; iconSize?: number; style?: StyleProp<ViewStyle> }) {
  const favorite = icon === 'heart' || icon === 'heart-outline';
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.icon, selected && !favorite && s.selected, floating && s.fab, style, (pressed || disabled) && s.dim]}><Icon name={icon} size={iconSize ?? (floating ? 28 : 22)} color={selected && favorite ? theme.colors.terracotta : selected ? theme.colors.onPrimary : theme.colors.text} fill={selected && favorite ? theme.colors.terracotta : 'none'} /></Pressable>;
}

export function Chip({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [s.chip, selected && s.selected, pressed && s.dim]}><Copy style={[s.chipText, selected && s.selectedText]}>{title}</Copy></Pressable>;
}

const s = StyleSheet.create({
  fab: { width: 56, height: 56, borderRadius: theme.radius.pill, boxShadow: theme.shadow.raised },
  icon: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.field, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.paper },
  selected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dim: { opacity: 0.6 },
  chip: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 10, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, justifyContent: 'center' },
  chipText: { fontFamily: theme.fonts.bold, fontSize: 13 },
  selectedText: { color: theme.colors.onPrimary },
});
