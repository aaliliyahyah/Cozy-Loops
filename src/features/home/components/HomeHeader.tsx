import { Image, StyleSheet, View } from 'react-native';
import { Copy } from '@/components/ui/Typography';
import { SettingsButton } from '@/components/navigation/SettingsButton';
import { Gingham } from '@/components/ui/Gingham';
import { theme } from '@/theme';

export function HomeHeader(_props: { width: number }) {
  return <View style={styles.header}>
    <View style={styles.brand}>
      <Image source={require('@/assets/images/yarn-checklist-logo.png')} accessibilityLabel="Cozy Loops yarn and checklist logo" style={styles.mark} />
      <View style={styles.wordmark}><Copy accessibilityRole="header" style={styles.name}>Cozy Loops</Copy></View>
      <SettingsButton />
    </View>
    <View style={{ marginHorizontal: 20 }}><Gingham /></View>
  </View>;
}

const styles = StyleSheet.create({
  settings: { width: 46, height: 46, borderRadius: 23, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.line, boxShadow: theme.shadow.card },
  bow: { position: 'absolute', width: 52, height: 30, resizeMode: 'contain', alignSelf: 'center', top: 0 },
  header: { marginHorizontal: -20, marginTop: -12, marginBottom: -10 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 0, paddingBottom: 0 },
  mark: { width: 68, height: 68, resizeMode: 'contain', borderRadius: theme.radius.field },
  wordmark: { flex: 1 }, subtitle: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  name: { fontFamily: theme.fonts.brand, fontSize: 32, lineHeight: 36, color: theme.colors.navSelected },
  ribbon: { height: 34, overflow: 'hidden' },
  checks: { position: 'absolute', top: 8, left: -40, transform: [{ rotate: '-0.5deg' }] },
  checkRow: { flexDirection: 'row' },
});
