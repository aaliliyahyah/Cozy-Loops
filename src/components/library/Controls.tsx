import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet } from 'react-native';
import { Copy } from '@/components/ui/Typography';
import { theme } from '@/theme';
export type CraftIcon = keyof typeof MaterialCommunityIcons.glyphMap;

export function IconButton({ icon, label, onPress, selected = false, disabled = false, floating = false }: { icon: CraftIcon; label: string; onPress: () => void; selected?: boolean; disabled?: boolean; floating?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.icon, selected && s.selected, floating && s.fab, (pressed || disabled) && s.dim]}><MaterialCommunityIcons name={icon} size={floating ? 28 : 22} color={selected ? theme.colors.onPrimary : theme.colors.text} /></Pressable>;
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
