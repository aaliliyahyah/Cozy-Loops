import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { theme } from '@/theme';
export function SettingsButton() {
  return <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push({ pathname: '/settings', params: { from: 'home' } })} style={({ pressed }) => [s.button, pressed && { opacity: 0.7 }]}><Icon name="settings-outline" size={27} color={theme.colors.text} /></Pressable>;
}
const s = StyleSheet.create({ button: { width: 46, height: 46, flexShrink: 0, borderRadius: 23, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.line, boxShadow: theme.shadow.card } });
