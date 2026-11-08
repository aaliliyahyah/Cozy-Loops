import { Icon } from '@/components/ui/Icon';
import { Pressable, StyleSheet } from 'react-native';
import { Copy } from '@/components/ui/Typography';
import { theme } from '@/theme';

export function Button({ title, onPress, secondary, disabled, label, olive, icon }: {
  title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; label?: string; olive?: boolean; icon?: string;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label || title} accessibilityState={{ disabled: !!disabled }}
    disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, olive && { backgroundColor: theme.colors.primary }, secondary && styles.secondary, (pressed || disabled) && { opacity: disabled ? 0.45 : 0.75 }]}>
    {icon && <Icon name={icon} size={22} color={secondary ? theme.colors.text : olive ? theme.colors.onPrimary : theme.colors.paper} />}
    <Copy style={[styles.buttonText, olive && { color: theme.colors.onPrimary }, secondary && { color: theme.colors.text }]}>{title}</Copy>
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { minHeight: 50, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.terracotta, borderRadius: theme.radius.button, padding: 12, borderWidth: 1, borderColor: '#FFFFFF66', boxShadow: '0px 2px 3px rgba(110, 68, 31, 0.1)' },
  secondary: { backgroundColor: theme.colors.surface, borderColor: theme.colors.line },
  buttonText: { color: '#FFFAF1', fontFamily: theme.fonts.bold, textAlign: 'center', flexShrink: 1 },
});
