import { Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Copy } from '../../components/cozy-ui';
import { IconButton } from '../../components/library-ui';
import { theme } from '../../theme';

export function HomeHeader({ width }: { width: number }) {
  const columns = Math.ceil((width + 80) / 20);
  return <View style={styles.header}>
    <View style={styles.brand}>
      <Image source={require('../../../assets/images/cozy-logo.png')} accessibilityLabel="Cozy Loops yarn and checklist logo" style={styles.mark} />
      <View style={styles.wordmark}><Copy accessibilityRole="header" style={styles.name}>Cozy Loops</Copy><Copy style={styles.subtitle}>Your crochet companion</Copy></View>
      <IconButton icon="cog-outline" label="Settings" onPress={() => router.push('/settings')} />
    </View>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.ribbon}>
      <View style={styles.checks}>{[0, 1, 2, 3].map(row => <View key={row} style={styles.checkRow}>{Array.from({ length: columns }, (_, col) => <View key={col} style={{ width: 20, height: 20, backgroundColor: row % 2 && col % 2 ? theme.colors.sand : row % 2 || col % 2 ? theme.colors.sage : theme.colors.primary, opacity: row % 2 === 0 && col % 2 === 0 ? 0.7 : 1 }} />)}</View>)}</View>
      <View style={[styles.topCurve, { width: width + 100 }]} />
      <View style={[styles.bottomCurve, { width: width + 120 }]} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  header: { marginHorizontal: -20, marginTop: -12, marginBottom: -10 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 5 },
  mark: { width: 58, height: 58, resizeMode: 'contain', borderRadius: theme.radius.field },
  wordmark: { flex: 1 }, subtitle: { color: theme.colors.muted, fontSize: 11, lineHeight: 16 },
  name: { fontFamily: theme.fonts.brand, fontSize: 30, lineHeight: 40, color: theme.colors.primary },
  ribbon: { height: 48, overflow: 'hidden' },
  checks: { position: 'absolute', top: 5, left: -40, transform: [{ rotate: '-5deg' }] },
  checkRow: { flexDirection: 'row' },
  topCurve: { position: 'absolute', left: -55, top: -94, height: 110, borderRadius: 500, backgroundColor: theme.colors.background, transform: [{ rotate: '-5deg' }] },
  bottomCurve: { position: 'absolute', left: -25, top: 34, height: 100, borderRadius: 500, backgroundColor: theme.colors.background, transform: [{ rotate: '-5deg' }] },
});
