import { Platform, StyleSheet, Switch, View } from 'react-native';
import { Card, CardHeader } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { Chip } from '@/components/library/Controls';
import { TabHeader } from '@/components/layout/TabHeader';
import { Screen } from '@/components/layout/Screen';
import { useApp } from '@/providers/AppProvider';
import { BackButton } from '@/components/navigation/BackButton';
import { theme } from '@/theme';

export function SettingsScreen() {
  const { data, change } = useApp();
  const term = data.preferences.preferredTerminology;
  return <Screen contentStyle={{ paddingTop: 0 }} header={<TabHeader title="Settings" icon="settings-outline" leading={<BackButton />} />}>
    <Card>
      <CardHeader><View style={styles.row}><Copy style={[styles.label, { flex: 1 }]}>Stitch feedback</Copy><Switch accessibilityLabel="Vibrate when counting stitches" disabled={Platform.OS === 'web'} value={data.preferences.hapticsEnabled} trackColor={{ false: theme.colors.line, true: theme.colors.primary }} onValueChange={hapticsEnabled => change(d => ({ ...d, preferences: { ...d.preferences, hapticsEnabled } }))} /></View></CardHeader>
      <Copy style={styles.detail}>{Platform.OS === 'web' ? 'Open the mobile app to use vibration while counting.' : 'A gentle vibration when you add or remove a stitch.'}</Copy>
    </Card>
    <Card>
      <CardHeader><Copy style={styles.label}>Glossary stitch names</Copy></CardHeader>
      <View style={[styles.row, { flexWrap: 'wrap' }]}>{(['US', 'UK'] as const).map(preferredTerminology => <Chip key={preferredTerminology} title={preferredTerminology === 'US' ? 'US terms' : 'UK terms'} selected={term === preferredTerminology} onPress={() => change(d => ({ ...d, preferences: { ...d.preferences, preferredTerminology } }))} />)}</View>
    </Card>
    <Card>
      <CardHeader><Heading>Your library</Heading></CardHeader>
      {[
        ['Patterns', data.patterns.filter(p => !p.deletedAt).length],
        ['Projects in progress', data.projects.filter(p => !p.deletedAt && p.status === 'active').length],
        ['Finished projects', data.projects.filter(p => !p.deletedAt && p.status === 'completed').length],
        ['Deleted items', data.patterns.filter(p => p.deletedAt).length + data.projects.filter(p => p.deletedAt).length],
      ].map(([label, count]) => <View key={label} style={styles.row}><Copy style={{ flex: 1 }}>{label}</Copy><Copy style={styles.number}>{count}</Copy></View>)}
      <Copy style={styles.detail}>Restore deleted items from the Deleted filter in Patterns or Projects.</Copy>
    </Card>
    <Card><CardHeader><Heading>About Cozy Loops</Heading></CardHeader><Copy>Your crochet patterns and progress, together in one place.</Copy><Copy style={styles.detail}>Your work and preferences are saved on this device. Cloud backup is not available.</Copy></Card>
  </Screen>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { flexShrink: 1, fontFamily: theme.fonts.bold, fontSize: 17, lineHeight: 26 },
  detail: { color: theme.colors.muted, fontSize: 14, lineHeight: 22 },
  number: { fontFamily: theme.fonts.bold, fontVariant: ['tabular-nums'] },
});
