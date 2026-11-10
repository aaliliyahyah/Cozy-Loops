import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BackButton } from '@/components/navigation/BackButton';
import { Card, CardHeader } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { TabHeader } from '@/components/layout/TabHeader';
import { StitchIllustration } from '../components/StitchIllustration';
import { Screen } from '@/components/layout/Screen';
import { useApp } from '@/providers/AppProvider';
import { stitches, stitchAbbreviation, stitchName } from '@/features/glossary/data/stitches';
import { theme } from '@/theme';

export default function StitchDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useApp();
  const stitch = stitches.find(stitch => stitch.id === id);
  const term = data.preferences.preferredTerminology;
  if (!stitch) return <Screen contentStyle={{ paddingTop: 0 }} header={<TabHeader title="Stitch unavailable" icon="book-open-variant" leading={<BackButton fallback="/(tabs)/glossary" />} />}><Copy>This stitch guide is unavailable.</Copy></Screen>;
  return <Screen contentStyle={{ paddingTop: 0 }} header={<TabHeader title={stitchName(stitch, term)} icon="book-open-variant" leading={<BackButton fallback="/(tabs)/glossary" />} />}>
    <StitchIllustration id={stitch.id} label={stitchName(stitch, term)} />
    <Card>
      <CardHeader><Heading>Description</Heading></CardHeader>
      <Copy style={styles.detail}>{stitchAbbreviation(stitch, term) || 'Technique'} · {term} terminology</Copy>
      <Copy>{stitch.explanation}</Copy>
    </Card>
    <Card>
      <CardHeader><Heading>Terminology</Heading></CardHeader>
      {stitch.ukName ? <>
        <Copy>US: {stitch.name} ({stitch.abbreviation})</Copy>
        <Copy>UK: {stitch.ukName} ({stitch.ukAbbreviation})</Copy>
      </> : <Copy style={styles.detail}>This technique uses the same name in US and UK terminology.</Copy>}
    </Card>
    <Card>
      <CardHeader><Heading>How to make it</Heading></CardHeader>
      <Copy style={styles.detail}>Steps use US stitch names where a specific stitch is mentioned.</Copy>
      {stitch.steps.map((step, index) => <View key={index} style={styles.step}>
        <View style={styles.number}><Copy style={styles.numberText}>{index + 1}</Copy></View>
        <View style={styles.body}><Copy style={styles.stepTitle}>Step {index + 1}</Copy><Copy>{step}</Copy></View>
      </View>)}
    </Card>
    <Card><CardHeader><Heading>What to look for</Heading></CardHeader><Copy>{stitch.result}</Copy></Card>
    <Card><CardHeader><Heading>About the illustration</Heading></CardHeader><Copy style={styles.detail}>The illustration is a stitch symbol reference. Follow the steps above for the technique.</Copy></Card>
  </Screen>;
}
const styles = StyleSheet.create({
  detail: { color: theme.colors.muted, fontSize: 14, lineHeight: 22 },
  step: { flexDirection: 'row', gap: 14, paddingTop: 12, borderTopWidth: 1, borderColor: theme.colors.line },
  number: { width: 36, height: 36, borderRadius: theme.radius.pill, backgroundColor: theme.colors.sage, justifyContent: 'center', alignItems: 'center' },
  numberText: { fontFamily: theme.fonts.bold },
  body: { flex: 1, gap: 6 },
  stepTitle: { fontFamily: theme.fonts.bold, color: theme.colors.navSelected },
});
