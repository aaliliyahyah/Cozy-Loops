import { useContext } from 'react';
import { View, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { FontReadyContext } from '@/theme/FontReadyContext';
import { Copy } from '@/components/ui/Typography';
import { theme } from '@/theme';

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const fontsReady = useContext(FontReadyContext);
  return <View style={{ gap: 6 }}><Copy style={styles.label}>{label}</Copy><TextInput accessibilityLabel={label}
    placeholderTextColor={theme.colors.muted} {...props} style={[styles.field, props.multiline && { minHeight: 110, textAlignVertical: 'top' }, props.style, !fontsReady && { fontFamily: 'System' }]} /></View>;
}

const styles = StyleSheet.create({
  label: { fontFamily: theme.fonts.bold, color: theme.colors.text, fontSize: 14 },
  field: { borderWidth: 1, borderColor: theme.colors.line, borderRadius: 16, padding: 14, minHeight: 52, backgroundColor: theme.colors.paper, color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 16 },
});
