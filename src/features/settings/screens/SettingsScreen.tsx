import { Switch, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { Screen } from '@/components/layout/Screen';
import { useApp } from '@/providers/AppProvider';
import { theme } from '@/theme';
export function SettingsScreen() {
  const { data, change } = useApp();
  return <Screen title="Make yourself comfortable">
    <Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}><Copy style={{ flex: 1, fontFamily: theme.fonts.bold }}>Counting haptics</Copy><Switch accessibilityLabel="Counting haptics" value={data.preferences.hapticsEnabled} trackColor={{ false: theme.colors.line, true: theme.colors.primary }} onValueChange={hapticsEnabled => change(d => ({ ...d, preferences: { ...d.preferences, hapticsEnabled } }))} /></View><Copy>Gentle feedback when you record a stitch.</Copy></Card>
    <Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}><Copy style={{ flex: 1, fontFamily: theme.fonts.bold }}>Use UK glossary terminology</Copy><Switch accessibilityLabel="Use UK glossary terminology" value={data.preferences.preferredTerminology === 'UK'} trackColor={{ false: theme.colors.line, true: theme.colors.primary }} onValueChange={uk => change(d => ({ ...d, preferences: { ...d.preferences, preferredTerminology: uk ? 'UK' : 'US' } }))} /></View><Copy>Changes glossary names. Your written patterns stay as you entered them.</Copy></Card>
    <Card><Heading>About Cozy Loops</Heading><Copy>Your cozy crochet companion. Track the progress you record, one stitch at a time.</Copy><Copy>Your patterns, photos, and projects are stored on this device. Local storage is not a cloud backup. Removing the app or clearing its data can remove your work.</Copy></Card>
  </Screen>;
}
