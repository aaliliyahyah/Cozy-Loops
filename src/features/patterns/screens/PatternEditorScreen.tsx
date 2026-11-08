import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import { Chip, IconButton } from '@/components/library/Controls';
import { libraryStyles } from '@/components/library/styles';
import { theme } from '@/theme';
import { router, usePreventRemove, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { Button } from '@/components/ui/Button';
import { TabHeader } from '@/components/layout/TabHeader';
import { Card } from '@/components/ui/Card';
import { Copy } from '@/components/ui/Typography';
import { Field } from '@/components/ui/Field';
import { Photo } from '@/components/ui/Photo';
import { Screen } from '@/components/layout/Screen';
import { confirm } from '@/utils/confirm';
import { useApp } from '@/providers/AppProvider';
import { BackButton } from '@/components/navigation/BackButton';
import { ImportModal } from '../components/ImportModal';
import { duplicateRow, importedRows } from '../model/rows';
import { newId } from '@/utils/id';
import type { Pattern, PatternRow } from '@/types/cozy';

const blankRow = (): PatternRow => ({ id: newId(), rowNumber: 1, instructionText: '' });
function blankPattern(): Pattern {
  const now = new Date().toISOString();
  return { id: newId(), title: '', rowType: 'row', instructions: [blankRow()], status: 'draft', createdAt: now, updatedAt: now };
}
export function PatternEditorScreen({ id }: { id?: string }) {
  const { data, ready, change, saveStatus } = useApp();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const existing = data.patterns.find(p => p.id === id);
  const [pattern, setPattern] = useState<Pattern>(() => existing ? JSON.parse(JSON.stringify(existing)) : blankPattern());
  const [step, setStep] = useState<'details' | 'instructions'>('details');
  const [dirty, setDirty] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [error, setError] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | undefined>(undefined);
  const hydrated = useRef(!id || !!existing);
  useEffect(() => {
    if (ready && existing && !hydrated.current) { setPattern(JSON.parse(JSON.stringify(existing))); hydrated.current = true; }
  }, [ready, existing]);
  const disablePrevention = usePreventRemove(dirty, ({ repeat }) => {
    confirm('Discard unsaved changes?', 'Save your pattern or draft to keep these edits.', () => { setDirty(false); repeat(); }, true);
  });
  const leave = () => {
    const go = () => { setDirty(false); disablePrevention(); router.navigate(from === 'home' ? '/(tabs)' : '/(tabs)/patterns'); };
    if (dirty) confirm('Discard unsaved changes?', 'Save your pattern or draft to keep these edits.', go, true);
    else go();
  };
  const edit = (patch: Partial<Pattern>) => { setPattern(p => ({ ...p, ...patch })); setDirty(true); };
  const rows = (instructions: PatternRow[]) => edit({ instructions: instructions.map((r, index) => ({ ...r, rowNumber: index + 1 })) });
  const updateRow = (index: number, patch: Partial<PatternRow>) => rows(pattern.instructions.map((r, i) => i === index ? { ...r, ...patch } : r));
  const save = (draft: boolean) => {
    if (!draft && (!pattern.title.trim() || !pattern.instructions.length || pattern.instructions.some(r => !r.instructionText.trim()) || pasting)) {
      setStep(!pattern.title.trim() ? 'details' : 'instructions');
      setExpandedRow(pattern.instructions.find(row => !row.instructionText.trim())?.id);
      setError('Add a title, review pasted text, and fill in every row before saving a ready pattern. You can save an incomplete draft.'); return;
    }
    const saved: Pattern = { ...pattern, title: pattern.title.trim(), hookSize: pattern.hookSizes === undefined ? pattern.hookSize : undefined, yarnColors: pattern.yarnColors?.map(v => v.trim()).filter(Boolean), hookSizes: pattern.hookSizes?.map(v => v.trim()).filter(Boolean), status: draft ? 'draft' : 'ready', updatedAt: new Date().toISOString() };
    change(d => ({ ...d, patterns: d.patterns.some(p => p.id === saved.id) ? d.patterns.map(p => p.id === saved.id ? saved : p) : [...d.patterns, saved] }));
    setPattern(saved); setDirty(false); setError('');
    disablePrevention();
    // Stay in the editor until the storage queue confirms the write.
  };
  const choosePhoto = async () => {
    setPhotoBusy(true); setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, base64: Platform.OS === 'web' });
      if (!result.canceled) {
        const asset = result.assets[0];
        if (Platform.OS === 'web') {
          if (!asset.base64) throw new Error('Photo could not be read.');
          edit({ imageUri: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` });
        } else {
          const extension = asset.fileName?.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
          const destination = new File(Paths.document, `cozy-photo-${newId()}.${extension}`);
          new File(asset.uri).copy(destination);
          edit({ imageUri: destination.uri });
        }
      }
    } catch { setError('Could not attach the photo. Please try again.'); }
    finally { setPhotoBusy(false); }
  };
  if (ready && id && !existing) return <Screen title="Pattern unavailable"><Copy>This pattern may have been deleted.</Copy><Button title="My patterns" onPress={() => router.replace('/(tabs)/patterns')} /></Screen>;
  return <Screen contentStyle={{ paddingTop: 0, gap: 12, flexGrow: 1 }} footer={<View style={styles.footer}>{step === 'details' ? <View style={{ marginLeft: 'auto' }}><Button title="Next: Instructions" olive onPress={() => setStep('instructions')} /></View> : <><Button title="Save Draft" secondary disabled={photoBusy} onPress={() => save(true)} /><Button title="Save Pattern" olive disabled={photoBusy} onPress={() => save(false)} /></>}</View>} header={<TabHeader title={id ? 'Edit Pattern' : 'Add Pattern'} icon="heart-plus" leading={<BackButton onPress={() => step === 'instructions' ? setStep('details') : leave()} />} trailing={<IconButton icon="import" label="Paste or import pattern" selected={pasting} onPress={() => setPasting(true)} />} />}>
    <Copy style={{ color: theme.colors.primary, fontFamily: theme.fonts.bold }}>{step === 'details' ? 'Pattern Details' : 'Pattern Instructions'}</Copy>
    {step === 'details' && <>
    <View style={styles.photoTitle}><Pressable accessibilityRole="button" accessibilityLabel="Choose pattern photo" disabled={photoBusy} onPress={() => { void choosePhoto(); }} style={styles.photoButton}>{pattern.imageUri ? <Photo uri={pattern.imageUri} size={66} /> : <Copy style={{ fontSize: 26 }}>+</Copy>}</Pressable><View style={{ flex: 1 }}><Field compact label="Pattern Title" value={pattern.title} onChangeText={title => edit({ title })} placeholder="e.g. Granny square" /></View></View>
    <Field compact label="Description (optional)" value={pattern.description || ''} onChangeText={description => edit({ description })} multiline />
    <Field compact label="Yarn type (optional)" value={pattern.yarnType || ''} onChangeText={yarnType => edit({ yarnType })} />
    <Field compact label="Yarn colors (optional)" value={pattern.yarnColors?.join(',') || ''} onChangeText={text => edit({ yarnColors: text.split(',') })} placeholder="e.g. Cream, Olive, Blush" />
    <Field compact label="Hook sizes (optional)" value={pattern.hookSizes?.join(',') ?? pattern.hookSize ?? ''} onChangeText={text => edit({ hookSizes: text.split(',') })} placeholder="e.g. 4 mm, 5 mm" />
    <Field compact label="Other tools (optional)" value={pattern.otherTools || ''} onChangeText={otherTools => edit({ otherTools })} placeholder="e.g. Scissors, stitch markers" />
    {pattern.imageUri && <Button title="Remove photo" secondary onPress={() => edit({ imageUri: undefined })} />}
    </>}
    {pasting && <ImportModal onCancel={() => setPasting(false)} onImport={text => {
      const apply = () => { rows(importedRows(text)); setPasting(false); setStep('instructions'); setExpandedRow(undefined); setError(''); };
      if (pattern.instructions.some(row => row.instructionText.trim())) confirm('Replace current rows?', 'Imported instructions replace the current rows. Review before saving.', apply); else apply();
    }} />}
    {step === 'instructions' && <>
    <View style={styles.tableHeader}><Copy style={styles.rowNumber}>Row</Copy><Copy style={{ flex: 1 }}>Instruction</Copy><Copy style={styles.stitches}>Stitches</Copy></View>
    {pattern.instructions.map((row, index) => <View key={row.id} style={{ gap: 8 }}>
      <View style={styles.instructionRow}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${pattern.rowType} ${index + 1}`} accessibilityState={{ expanded: expandedRow === row.id }} onPress={() => setExpandedRow(current => current === row.id ? undefined : row.id)} style={styles.rowSummary}>
          <Copy style={styles.rowNumber}>{index + 1}</Copy>
          <Copy numberOfLines={2} style={styles.instructionText}>{row.instructionText || 'Add instructions'}</Copy>
          <Copy style={styles.stitches}>{row.expectedStitchCount ?? '—'}</Copy>
        </Pressable>
        <IconButton icon="trash-can-outline" label={`Delete instruction ${index + 1}`} onPress={() => confirm('Remove this row?', 'This removes the instruction from this editor.', () => rows(pattern.instructions.filter((_, i) => i !== index)), true)} />
        <IconButton icon="copy" label={`Duplicate instruction ${index + 1}`} onPress={() => { const next = duplicateRow(pattern.instructions, row.id); rows(next); setExpandedRow(next[index + 1].id); }} />
      </View>
      {expandedRow === row.id && <Card style={{ padding: 12, gap: 10 }}>
        <Field compact label={`Part for ${index + 1} (optional)`} value={row.part || ''} onChangeText={part => updateRow(index, { part })} placeholder="e.g. Ears, body, border" />
        <Field compact label={`Instruction ${index + 1} (required)`} value={row.instructionText} multiline onChangeText={instructionText => updateRow(index, { instructionText })} />
        <Field compact label={`Expected stitches for ${index + 1} (optional)`} keyboardType="number-pad" value={row.expectedStitchCount === undefined ? '' : String(row.expectedStitchCount)} onChangeText={text => {
          if (!/^\d*$/.test(text) || (text && !Number.isSafeInteger(Number(text)))) return;
          updateRow(index, { expectedStitchCount: text ? Number(text) : undefined });
        }} />
        {!!pattern.yarnColors?.filter(v => v.trim()).length && <><Copy>Yarn color</Copy><View style={libraryStyles.row}><Chip title="Pattern default" selected={!row.yarnColor} onPress={() => updateRow(index, { yarnColor: undefined })} />{Array.from(new Set(pattern.yarnColors.map(v => v.trim()).filter(Boolean))).map(color => <Chip key={color} title={color} selected={row.yarnColor === color} onPress={() => updateRow(index, { yarnColor: color })} />)}</View></>}
        {!!(pattern.hookSizes?.length || pattern.hookSize) && <><Copy>Hook size</Copy><View style={libraryStyles.row}><Chip title="Pattern default" selected={!row.hookSize} onPress={() => updateRow(index, { hookSize: undefined })} />{Array.from(new Set((pattern.hookSizes || [pattern.hookSize || '']).map(v => v.trim()).filter(Boolean))).map(hook => <Chip key={hook} title={hook} selected={row.hookSize === hook} onPress={() => updateRow(index, { hookSize: hook })} />)}</View></>}
        <Button title="Done" onPress={() => setExpandedRow(undefined)} />
      </Card>}
    </View>)}
    <View style={{ alignSelf: 'flex-end', marginTop: 'auto' }}><IconButton icon="plus" label={`Add ${pattern.rowType}`} floating onPress={() => { const row = blankRow(); rows([...pattern.instructions, row]); setExpandedRow(row.id); }} /></View>
    </>}
    {!!error && <Copy accessibilityRole="alert">{error}</Copy>}
    {!dirty && data.patterns.some(p => p.id === pattern.id) && <Copy accessibilityLiveRegion="polite" style={{ color: theme.colors.navSelected }}>{saveStatus === 'saved' ? 'All changes saved on this device.' : saveStatus === 'saving' ? 'Saving changes...' : 'Saving failed. Retry above.'}</Copy>}
    {!dirty && data.patterns.some(p => p.id === pattern.id) && <Button title="View saved pattern" secondary onPress={() => router.replace({ pathname: '/pattern/[id]', params: { id: pattern.id } })} />}
    {!id && !dirty && data.patterns.some(p => p.id === pattern.id) && <Button title="Start another pattern" secondary onPress={() => { const next = blankPattern(); setPattern(next); setStep('details'); setExpandedRow(undefined); setPasting(false); setError(''); }} />}
  </Screen>;
}

const styles = StyleSheet.create({
  tableHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, marginRight: 92, backgroundColor: theme.colors.sage, borderRadius: 10 },
  instructionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowSummary: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, backgroundColor: theme.colors.sand, padding: 10 },
  rowNumber: { width: 30, color: theme.colors.primary, fontSize: 13 },
  instructionText: { flex: 1, fontSize: 14, borderLeftWidth: 1, borderColor: theme.colors.line, paddingLeft: 8 },
  stitches: { width: 49, textAlign: 'right', fontSize: 12, color: theme.colors.primary },
  photoTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photoButton: { width: 66, height: 76, borderRadius: 16, backgroundColor: theme.colors.sand, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, gap: 12, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.line },
});
