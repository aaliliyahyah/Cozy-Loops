import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { Chip, IconButton } from '@/components/library/Controls';
import { libraryStyles } from '@/components/library/styles';
import { theme } from '@/theme';
import { router, usePreventRemove } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';
import { Field } from '@/components/ui/Field';
import { Photo } from '@/components/ui/Photo';
import { Screen } from '@/components/layout/Screen';
import { confirm } from '@/utils/confirm';
import { useApp } from '@/providers/AppProvider';
import { newId } from '@/utils/id';
import type { Pattern, PatternRow } from '@/types/cozy';

const blankRow = (): PatternRow => ({ id: newId(), rowNumber: 1, instructionText: '' });
function blankPattern(): Pattern {
  const now = new Date().toISOString();
  return { id: newId(), title: '', rowType: 'row', instructions: [blankRow()], status: 'draft', createdAt: now, updatedAt: now };
}
export function PatternEditorScreen({ id }: { id?: string }) {
  const { data, ready, change, saveStatus } = useApp();
  const existing = data.patterns.find(p => p.id === id);
  const [pattern, setPattern] = useState<Pattern>(() => existing ? JSON.parse(JSON.stringify(existing)) : blankPattern());
  const [dirty, setDirty] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [error, setError] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string>();
  const hydrated = useRef(!id || !!existing);
  useEffect(() => {
    if (ready && existing && !hydrated.current) { setPattern(JSON.parse(JSON.stringify(existing))); hydrated.current = true; }
  }, [ready, existing]);
  const disablePrevention = usePreventRemove(dirty, ({ repeat }) => {
    confirm('Discard unsaved changes?', 'Save your pattern or draft to keep these edits.', () => { setDirty(false); repeat(); }, true);
  });
  const edit = (patch: Partial<Pattern>) => { setPattern(p => ({ ...p, ...patch })); setDirty(true); };
  const rows = (instructions: PatternRow[]) => edit({ instructions: instructions.map((r, index) => ({ ...r, rowNumber: index + 1 })) });
  const updateRow = (index: number, patch: Partial<PatternRow>) => rows(pattern.instructions.map((r, i) => i === index ? { ...r, ...patch } : r));
  const save = (draft: boolean) => {
    if (!draft && (!pattern.title.trim() || !pattern.instructions.length || pattern.instructions.some(r => !r.instructionText.trim()) || pasting)) {
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
  return <Screen includeTopInset header={<View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Button title="Back" secondary icon="chevron-back" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/patterns')} /><IconButton icon="import" label="Paste or import pattern" selected={pasting} onPress={() => setPasting(v => !v)} /></View>} title={id ? 'Edit pattern' : 'Add pattern'} subtitle="Write it down, stitch it later.">
    <Field label="Pattern title (required)" value={pattern.title} onChangeText={title => edit({ title })} placeholder="e.g. Weekend granny square" />
    <Field label="Description (optional)" value={pattern.description || ''} onChangeText={description => edit({ description })} multiline />
    <Field label="Yarn type (optional)" value={pattern.yarnType || ''} onChangeText={yarnType => edit({ yarnType })} />
    <Field label="Yarn colors (optional)" value={pattern.yarnColors?.join(',') || ''} onChangeText={text => edit({ yarnColors: text.split(',') })} placeholder="e.g. Cream, Olive, Blush" />
    <Field label="Hook sizes (optional)" value={pattern.hookSizes?.join(',') ?? pattern.hookSize ?? ''} onChangeText={text => edit({ hookSizes: text.split(',') })} placeholder="e.g. 4 mm, 5 mm" />
    <Field label="Other tools (optional)" value={pattern.otherTools || ''} onChangeText={otherTools => edit({ otherTools })} placeholder="e.g. Scissors, stitch markers" />
    <Copy>Difficulty (optional)</Copy>
    <View style={libraryStyles.row}>{(['beginner', 'intermediate', 'advanced'] as const).map(difficulty => <Chip key={difficulty} selected={pattern.difficulty === difficulty} title={difficulty} onPress={() => edit({ difficulty: pattern.difficulty === difficulty ? undefined : difficulty })} />)}</View>
    <Photo uri={pattern.imageUri} /><Button title={photoBusy ? 'Reading photo...' : 'Choose photo (optional)'} disabled={photoBusy} secondary onPress={() => { void choosePhoto(); }} />
    {pattern.imageUri && <Button title="Remove photo" secondary onPress={() => edit({ imageUri: undefined })} />}
    <View style={libraryStyles.row}>{(['row', 'round'] as const).map(rowType => <Chip key={rowType} title={rowType === 'row' ? 'Rows' : 'Rounds'} selected={pattern.rowType === rowType} onPress={() => edit({ rowType })} />)}</View>
    <Heading>Instructions</Heading>
    <Button title={pasting ? 'Return to row editor' : 'Paste written instructions'} secondary onPress={() => setPasting(v => !v)} />
    {pasting && <Card><Field label="Paste instructions" multiline value={pattern.pastedText || ''} onChangeText={pastedText => edit({ pastedText })} /><Copy>Each nonempty line becomes one row. Review and correct the structure yourself.</Copy><Button title="Review pasted rows" onPress={() => {
      const lines = (pattern.pastedText || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      if (!lines.length) { setError('Paste some instructions first.'); return; }
      const apply = () => { rows(lines.map((instructionText, index) => ({ id: newId(), rowNumber: index + 1, instructionText }))); setPasting(false); setError(''); };
      if (pattern.instructions.some(r => r.instructionText.trim())) confirm('Replace current rows?', 'Your pasted lines will replace the rows currently in this editor.', apply); else apply();
    }} /></Card>}
    {pattern.instructions.map((row, index) => <Card key={row.id}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}><Copy style={{ fontFamily: theme.fonts.bold }}>{pattern.rowType === 'row' ? 'Row' : 'Round'} {index + 1}</Copy><IconButton icon="trash-can-outline" label={`Delete instruction ${index + 1}`} onPress={() => confirm('Remove this row?', 'This removes the instruction from this editor.', () => rows(pattern.instructions.filter((_, i) => i !== index)), true)} /></View>
      <Field label={`Part for ${index + 1} (optional)`} value={row.part || ''} onChangeText={part => updateRow(index, { part })} placeholder="e.g. Ears, body, border" />
      <Field label={`Instruction ${index + 1} (required)`} value={row.instructionText} multiline onChangeText={instructionText => updateRow(index, { instructionText })} />
      <Field label={`Expected stitches for ${index + 1} (optional)`} keyboardType="number-pad" value={row.expectedStitchCount === undefined ? '' : String(row.expectedStitchCount)} onChangeText={text => {
        if (!/^\d*$/.test(text) || (text && !Number.isSafeInteger(Number(text)))) return;
        updateRow(index, { expectedStitchCount: text ? Number(text) : undefined });
      }} />
      {!!pattern.yarnColors?.filter(v => v.trim()).length && <><Copy>Yarn color</Copy><View style={libraryStyles.row}><Chip title="Pattern default" selected={!row.yarnColor} onPress={() => updateRow(index, { yarnColor: undefined })} />{Array.from(new Set(pattern.yarnColors.map(v => v.trim()).filter(Boolean))).map(color => <Chip key={color} title={color} selected={row.yarnColor === color} onPress={() => updateRow(index, { yarnColor: color })} />)}</View></>}
      {!!(pattern.hookSizes?.length || pattern.hookSize) && <><Copy>Hook size</Copy><View style={libraryStyles.row}><Chip title="Pattern default" selected={!row.hookSize} onPress={() => updateRow(index, { hookSize: undefined })} />{Array.from(new Set((pattern.hookSizes || [pattern.hookSize || '']).map(v => v.trim()).filter(Boolean))).map(hook => <Chip key={hook} title={hook} selected={row.hookSize === hook} onPress={() => updateRow(index, { hookSize: hook })} />)}</View></>}
      <View style={libraryStyles.row}><IconButton icon="arrow-up" label={`Move instruction ${index + 1} up`} disabled={index === 0} onPress={() => { const next = [...pattern.instructions]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; rows(next); }} /><IconButton icon="arrow-down" label={`Move instruction ${index + 1} down`} disabled={index === pattern.instructions.length - 1} onPress={() => { const next = [...pattern.instructions]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; rows(next); }} /><IconButton icon="dots-horizontal" label={`More tools for instruction ${index + 1}`} selected={expandedRow === row.id} onPress={() => setExpandedRow(v => v === row.id ? undefined : row.id)} /></View>
      {expandedRow === row.id && <View style={{ gap: 10 }}>
      <Button title="Split at line breaks" secondary disabled={!row.instructionText.includes('\n')} onPress={() => rows(pattern.instructions.flatMap((r, i) => i === index ? r.instructionText.split(/\r?\n/).filter(s => s.trim()).map(instructionText => ({ ...blankRow(), instructionText, part: row.part, yarnColor: row.yarnColor, hookSize: row.hookSize })) : [r]))} />
      <Button title="Merge with next row" secondary disabled={index === pattern.instructions.length - 1} onPress={() => rows(pattern.instructions.flatMap((r, i) => i === index ? [{ ...r, instructionText: `${r.instructionText}\n${pattern.instructions[index + 1].instructionText}` }] : i === index + 1 ? [] : [r]))} />
      </View>}
    </Card>)}
    <Button title={`Add ${pattern.rowType}`} secondary onPress={() => rows([...pattern.instructions, blankRow()])} />
    {!!error && <Copy accessibilityRole="alert">{error}</Copy>}
    <Button title="Save pattern" disabled={photoBusy} onPress={() => save(false)} />
    <Button title="Save draft" secondary disabled={photoBusy} onPress={() => save(true)} />
    {!dirty && <Copy accessibilityLiveRegion="polite">{saveStatus === 'saved' ? 'All changes saved on this device.' : saveStatus === 'saving' ? 'Saving changes...' : 'Saving failed. Retry above.'}</Copy>}
    {!dirty && data.patterns.some(p => p.id === pattern.id) && <Button title="View saved pattern" secondary onPress={() => router.replace({ pathname: '/pattern/[id]', params: { id: pattern.id } })} />}
    {!id && !dirty && data.patterns.some(p => p.id === pattern.id) && <Button title="Start another pattern" secondary onPress={() => { setPattern(blankPattern()); setPasting(false); setError(''); }} />}
  </Screen>;
}
