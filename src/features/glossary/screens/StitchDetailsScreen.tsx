import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { Screen } from '@/components/layout/Screen';
import { useApp } from '@/providers/AppProvider';
import { stitches, stitchAbbreviation, stitchName } from '@/features/glossary/data/stitches';
import { theme } from '@/theme';
export default function StitchDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { data } = useApp();
  const stitch = stitches.find(s => s.id === id); const term = data.preferences.preferredTerminology;
  const back = () => router.canGoBack() ? router.back() : router.replace('/(tabs)/glossary');
  if (!stitch) return <Screen includeTopInset title="Stitch unavailable"><Button title="Back to glossary" onPress={back} /></Screen>;
  return <Screen includeTopInset header={<Button title="Back" secondary icon="chevron-back" onPress={back} />} title={stitchName(stitch, term)} subtitle={stitchAbbreviation(stitch, term)}>
    <Copy>{stitch.explanation}</Copy>
    {stitch.ukName ? <Card><Heading>Terminology</Heading><Copy>US: {stitch.name} ({stitch.abbreviation})</Copy><Copy>UK: {stitch.ukName} ({stitch.ukAbbreviation})</Copy></Card> : <Copy style={s.muted}>This technique uses the same name in US and UK terminology.</Copy>}
    <Heading>How to make it</Heading><Copy style={s.muted}>Steps use US stitch names where a specific stitch is mentioned.</Copy>
    {stitch.steps.map((step, index) => <View key={index} style={s.step}><View style={s.number}><Copy style={s.numberText}>{index + 1}</Copy></View><View style={s.body}><Copy style={s.stepTitle}>Step {index + 1}</Copy><Copy>{step}</Copy></View></View>)}
    <Card><Heading>What to look for</Heading><Copy>{stitch.result}</Copy></Card>
    <Copy style={s.muted}>Illustration pending. This guide currently provides written instructions.</Copy>
  </Screen>;
}
const s = StyleSheet.create({ muted: { color: theme.colors.muted, fontSize: 13 }, step: { flexDirection: 'row', gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderColor: theme.colors.line }, number: { width: 36, height: 36, borderRadius: theme.radius.pill, backgroundColor: theme.colors.sage, justifyContent: 'center', alignItems: 'center' }, numberText: { fontFamily: theme.fonts.bold }, body: { flex: 1, gap: 6 }, stepTitle: { fontFamily: theme.fonts.bold, color: theme.colors.primary } });
