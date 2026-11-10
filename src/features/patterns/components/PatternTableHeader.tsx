import { Pressable, StyleSheet, View } from 'react-native';
import { Copy } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';
import { theme } from '@/theme';
import type { RowType } from '@/types/cozy';

export function PatternTableHeader({ rowType, selecting = false, partName, checked = false, onToggleAll }: {
  rowType: RowType; selecting?: boolean; partName?: string; checked?: boolean | 'mixed'; onToggleAll?: () => void;
}) {
  return <View style={tableStyles.line}>
    {selecting && <Pressable accessibilityRole="checkbox" accessibilityLabel={`${checked === true ? 'Deselect' : 'Select'} all rows in ${partName}`} accessibilityState={{ checked }} aria-checked={checked} onPress={onToggleAll} style={tableStyles.selectionSlot}>
      <View style={[tableStyles.selectionCircle, checked !== false && tableStyles.checked]}>
        <Icon name={checked === 'mixed' ? 'minus' : 'select-all'} size={18} color={checked === false ? theme.colors.primary : theme.colors.onPrimary} />
      </View>
    </Pressable>}
    <View style={[tableStyles.data, { backgroundColor: theme.colors.sage }]}>
      <Copy style={tableStyles.number}>{rowType === 'round' ? 'Rnd' : 'Row'}</Copy>
      <Copy style={tableStyles.instruction}>Instruction</Copy>
      <Copy style={tableStyles.stitches}>Stitches</Copy>
    </View>
    {!selecting && <View style={tableStyles.actionSlot} />}
  </View>;
}

export const tableStyles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  content: { flex: 1, minWidth: 0 },
  data: { flex: 1, minWidth: 0, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, backgroundColor: theme.colors.sand, padding: 10 },
  number: { width: 30, color: theme.colors.navSelected, fontSize: 13 },
  instruction: { flex: 1, minWidth: 0, color: theme.colors.navSelected, fontSize: 14, borderLeftWidth: 1, borderColor: theme.colors.line, paddingLeft: 8 },
  stitches: { width: 49, textAlign: 'right', fontSize: 12, color: theme.colors.navSelected },
  selectionSlot: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  selectionCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: theme.colors.primary },
  actionSlot: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
