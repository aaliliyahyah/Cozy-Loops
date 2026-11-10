import { memo } from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/library/Controls';
import { libraryStyles } from '@/components/library/styles';
import { Card } from '@/components/ui/Card';
import { Copy } from '@/components/ui/Typography';
import { Field } from '@/components/ui/Field';
import type { PatternRow } from '@/types/cozy';

export const EditableRowFields = memo(function EditableRowFields({ row, yarnColors, hookSizes, hookSize, onChange }: {
  row: PatternRow; yarnColors?: string[]; hookSizes?: string[]; hookSize?: string;
  onChange: (id: string, patch: Partial<PatternRow>) => void;
}) {
  const colors = Array.from(new Set(yarnColors?.map(value => value.trim()).filter(Boolean)));
  const hooks = Array.from(new Set((hookSizes ?? [hookSize ?? '']).map(value => value.trim()).filter(Boolean)));
  const update = (patch: Partial<PatternRow>) => onChange(row.id, patch);
  return <Card style={{ padding: 12, gap: 10 }}>
    <Field compact label="Instruction (required)" value={row.instructionText} multiline onChangeText={instructionText => update({ instructionText })} />
    <Field compact label="Expected stitches" keyboardType="number-pad" value={row.expectedStitchCount === undefined ? '' : String(row.expectedStitchCount)} onChangeText={text => {
      if (!/^\d*$/.test(text) || (text && !Number.isSafeInteger(Number(text)))) return;
      update({ expectedStitchCount: text ? Number(text) : undefined });
    }} />
    {!!colors.length && <><Copy>Yarn color</Copy><View style={libraryStyles.row}>
      <Chip title="Pattern default" selected={!row.yarnColor} onPress={() => update({ yarnColor: undefined })} />
      {colors.map(color => <Chip key={color} title={color} selected={row.yarnColor === color} onPress={() => update({ yarnColor: color })} />)}
    </View></>}
    {!!hooks.length && <><Copy>Hook size</Copy><View style={libraryStyles.row}>
      <Chip title="Pattern default" selected={!row.hookSize} onPress={() => update({ hookSize: undefined })} />
      {hooks.map(hook => <Chip key={hook} title={hook} selected={row.hookSize === hook} onPress={() => update({ hookSize: hook })} />)}
    </View></>}
  </Card>;
});
