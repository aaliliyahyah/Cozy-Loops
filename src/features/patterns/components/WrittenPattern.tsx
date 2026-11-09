import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { theme } from '@/theme';
import type { Pattern, PatternRow } from '@/types/cozy';

export function WrittenPattern({ pattern, recordedCounts }: { pattern: Pattern; recordedCounts?: number[] }) {
  const groups = pattern.instructions.reduce<{ part: string; rows: { instruction: PatternRow; index: number }[] }[]>((result, instruction, index) => {
    const part = instruction.part?.trim() || 'Instructions';
    const row = { instruction, index };
    if (result[result.length - 1]?.part === part) result[result.length - 1].rows.push(row);
    else result.push({ part, rows: [row] });
    return result;
  }, []);
  const label = pattern.rowType === 'round' ? 'Round' : 'Row';
  return <>
    <View style={styles.heading}><Heading>Written pattern</Heading><Copy style={styles.muted}>{pattern.instructions.length} {pattern.rowType}{pattern.instructions.length === 1 ? '' : 's'}</Copy></View>
    {groups.map((group, groupIndex) => <Card key={groupIndex}>
      <Heading>{group.part}</Heading>
      {group.rows.map(({ instruction, index }) => <View key={instruction.id} style={styles.instruction}>
        <View style={styles.rowHeader}>
          <Copy style={styles.rowLabel}>{label} {instruction.rowNumber}</Copy>
          {recordedCounts?.[index] !== undefined && <Copy style={styles.count}>{recordedCounts[index]} stitches recorded</Copy>}
        </View>
        <Copy selectable>{instruction.instructionText || 'Empty instruction'}</Copy>
        {instruction.expectedStitchCount !== undefined && <Copy style={styles.muted}>Target: {instruction.expectedStitchCount} stitches</Copy>}
        {(instruction.yarnColor || instruction.hookSize) && <Copy style={styles.muted}>{[instruction.yarnColor && `Color: ${instruction.yarnColor}`, instruction.hookSize && `Hook: ${instruction.hookSize}`].filter(Boolean).join(' / ')}</Copy>}
      </View>)}
    </Card>)}
  </>;
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', columnGap: 12, rowGap: 4 },
  instruction: { gap: 6, paddingTop: 12, borderTopWidth: 1, borderColor: theme.colors.line },
  rowHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowLabel: { color: theme.colors.navSelected, fontFamily: theme.fonts.bold },
  muted: { color: theme.colors.muted, fontSize: 14, lineHeight: 22 },
  count: { color: theme.colors.muted, fontSize: 13, lineHeight: 22, fontVariant: ['tabular-nums'] },
});
