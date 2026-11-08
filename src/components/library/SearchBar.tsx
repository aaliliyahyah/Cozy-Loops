import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { View, TextInput, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export function SearchBar({ value, onChangeText, label, children }: { value: string; onChangeText: (text: string) => void; label: string; children?: ReactNode }) {
  return <View style={s.row}><View style={s.search}><Icon name="magnify" size={22} color={theme.colors.muted} /><TextInput accessibilityLabel={label} placeholder={label} placeholderTextColor={theme.colors.muted} value={value} onChangeText={onChangeText} style={s.input} autoCapitalize="none" returnKeyType="search" /></View>{children}</View>;
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  search: { flex: 1, flexDirection: 'row', gap: 8, minHeight: 48, paddingHorizontal: 12, borderRadius: theme.radius.field, backgroundColor: theme.colors.paper, borderWidth: 1, borderColor: theme.colors.line, alignItems: 'center' },
  input: { flex: 1, minWidth: 0, minHeight: 46, color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 14 },
});
