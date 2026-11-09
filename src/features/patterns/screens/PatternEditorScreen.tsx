import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, Pressable, View, ScrollView, StyleSheet } from 'react-native';
import { Chip, IconButton } from '@/components/library/Controls';
import { libraryStyles } from '@/components/library/styles';
import { deleteLibraryItems } from '@/features/library/deletion';
import { originTarget } from '@/components/navigation/origin';
import { theme } from '@/theme';
import { router, usePreventRemove, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { Button } from '@/components/ui/Button';
import { TabHeader } from '@/components/layout/TabHeader';
import { Card } from '@/components/ui/Card';
import { Copy } from '@/components/ui/Typography';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { PhotoAdjuster } from '../components/PhotoAdjuster';
import { SwipeRow } from '../components/SwipeRow';
import { Photo } from '@/components/ui/Photo';
import { Screen } from '@/components/layout/Screen';
import { confirm } from '@/utils/confirm';
import { useApp } from '@/providers/AppProvider';
import { BackButton } from '@/components/navigation/BackButton';
import { UnsavedChangesDialog } from '../components/UnsavedChangesDialog';
import { ImportModal } from '../components/ImportModal';
import { duplicateRow, parsePatternImport, reorderRow } from '../model/rows';
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
  const existing = data.patterns.find(p => p.id === id && !p.deletedAt);
  const [pattern, setPattern] = useState<Pattern>(() => existing ? JSON.parse(JSON.stringify(existing)) : blankPattern());
  const [step, setStep] = useState<'details' | 'instructions'>('details');
  const [dirty, setDirty] = useState(false);
  const [exitAction, setExitAction] = useState<(() => void) | null>(null);
  const [pasting, setPasting] = useState(false);
  const [error, setError] = useState('');
  const [adjustingPhoto, setAdjustingPhoto] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | undefined>(undefined);
  const [editingRows, setEditingRows] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const rowViews = useRef(new Map<string, ComponentRef<typeof View>>());
  const drag = useRef<{ id: string; pageY: number; destination: number } | null>(null);
  const dragTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [dragging, setDragging] = useState<string>();
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef(0);
  const [dropTarget, setDropTarget] = useState<string>();
  useEffect(() => () => { if (dragTimer.current) clearInterval(dragTimer.current); }, []);
  const hydrated = useRef(!id || !!existing);
  useEffect(() => {
    if (ready && existing && !hydrated.current) { setPattern(JSON.parse(JSON.stringify(existing))); hydrated.current = true; }
  }, [ready, existing]);
  const disablePrevention = usePreventRemove(dirty, ({ repeat }) => {
    setExitAction(() => repeat);
  });
  const leave = () => {
    const go = () => router.navigate(originTarget(from === 'add' ? undefined : from, id ? '/(tabs)/patterns' : '/(tabs)'));
    if (dirty) setExitAction(() => go);
    else go();
  };
  const discardChanges = () => {
    const go = exitAction;
    setExitAction(null); setDirty(false); disablePrevention();
    setPattern(existing ? JSON.parse(JSON.stringify(existing)) : blankPattern());
    setStep('details'); setEditingRows(false); setSelectedRows([]); setExpandedRow(undefined); setError('');
    go?.();
  };
  const deletePattern = () => {
    const saved = data.patterns.some(item => item.id === pattern.id);
    confirm(saved ? 'Delete pattern?' : 'Discard this pattern?', saved ? 'This pattern will move to Deleted. Existing projects keep their instructions.' : 'This will discard the pattern you are creating.', () => {
      setDirty(false); disablePrevention();
      if (saved) change(current => deleteLibraryItems(current, 'patterns', [pattern.id]));
      if (!id) { setPattern(blankPattern()); setStep('details'); setEditingRows(false); setSelectedRows([]); }
      router.navigate({ pathname: '/(tabs)/patterns', params: { from: 'patterns' } });
    }, true);
  };
  const edit = (patch: Partial<Pattern>) => { setPattern(p => ({ ...p, ...patch })); setDirty(true); };
  const rows = (instructions: PatternRow[]) => edit({ instructions: instructions.map((r, index) => ({ ...r, rowNumber: index + 1 })) });
  const updateRow = (index: number, patch: Partial<PatternRow>) => rows(pattern.instructions.map((r, i) => i === index ? { ...r, ...patch } : r));
  const measureDrop = () => {
    const current = drag.current;
    if (!current) return;
    pattern.instructions.forEach((row, index) => rowViews.current.get(row.id)?.measureInWindow((_x, y, _width, height) => {
      if (drag.current === current && current.pageY >= y && current.pageY <= y + height) {
        current.destination = index; setDropTarget(row.id);
      }
    }));
  };
  const endDrag = (cancelled: boolean) => {
    if (dragTimer.current) clearInterval(dragTimer.current);
    const current = drag.current;
    if (current && !cancelled) {
      const pageY = current.pageY;
      Promise.all(pattern.instructions.map((row, index) => new Promise<number | undefined>(resolve => {
        const view = rowViews.current.get(row.id);
        if (!view) { resolve(undefined); return; }
        view.measureInWindow((_x, y, _width, height) => resolve(pageY >= y && pageY <= y + height ? index : undefined));
      }))).then(targets => {
        const destination = targets.find(value => value !== undefined);
        if (destination !== undefined) rows(reorderRow(pattern.instructions, current.id, destination));
      });
    }
    drag.current = null; setDragging(undefined); setDropTarget(undefined);
  };
  const beginDrag = (rowId: string, pageY: number) => {
    setExpandedRow(undefined);
    drag.current = { id: rowId, pageY, destination: pattern.instructions.findIndex(row => row.id === rowId) };
    dragStartY.current = pageY; setDragOffset(0);
    setDragging(rowId); setDropTarget(rowId);
    // Scroll near the viewport edges so rows can reach positions outside the screen.
    dragTimer.current = setInterval(() => {
      const current = drag.current;
      if (!current) return;
      scrollRef.current?.measureInWindow((_x, y, _width, height) => {
        if (drag.current !== current) return;
        const delta = current.pageY < y + 80 ? -18 : current.pageY > y + height - 80 ? 18 : 0;
        if (delta) scrollRef.current?.scrollTo({ y: Math.max(0, scrollOffset.current + delta), animated: false });
        measureDrop();
      });
    }, 40);
  };
  const scrollOffset = useRef(0);
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
    if (!id) { setPattern(blankPattern()); setStep('details'); setEditingRows(false); setSelectedRows([]); setExpandedRow(undefined); }
    router.navigate({ pathname: '/(tabs)/patterns', params: { from: 'patterns' } });
  };
  const choosePhoto = async () => {
    setPhotoBusy(true); setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, base64: Platform.OS === 'web' });
      if (!result.canceled) {
        const asset = result.assets[0];
        if (Platform.OS === 'web') {
          if (!asset.base64) throw new Error('Photo could not be read.');
          edit({ imageUri: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`, photoCrop: { width: asset.width, height: asset.height, x: 0, y: 0, zoom: 1 } });
        } else {
          const extension = asset.fileName?.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
          const destination = new File(Paths.document, `cozy-photo-${newId()}.${extension}`);
          new File(asset.uri).copy(destination);
          edit({ imageUri: destination.uri, photoCrop: { width: asset.width, height: asset.height, x: 0, y: 0, zoom: 1 } });
        }
        setAdjustingPhoto(true);
      }
    } catch { setError('Could not attach the photo. Please try again.'); }
    finally { setPhotoBusy(false); }
  };
  if (ready && id && !existing) return <Screen title="Pattern unavailable"><Copy>This pattern may have been deleted.</Copy><Button title="My patterns" onPress={() => router.replace('/(tabs)/patterns')} /></Screen>;
  return <Screen scrollRef={scrollRef} scrollEnabled={!dragging} onScrollOffset={offset => { scrollOffset.current = offset; }} contentStyle={{ paddingTop: 0, gap: 12, flexGrow: 1 }} header={<TabHeader title={id ? 'Edit Pattern' : 'Add Pattern'} icon="heart-plus" leading={<BackButton onPress={leave} />} trailing={<IconButton icon="import" label="Paste or import pattern" selected={pasting} onPress={() => setPasting(true)} />} />}>
    <Copy style={{ color: theme.colors.navSelected, fontFamily: theme.fonts.bold }}>{step === 'details' ? 'Pattern Details' : 'Pattern Instructions'}</Copy>
    {step === 'details' && <>
    <View style={styles.photoFrame}>
      <Pressable accessibilityRole="button" accessibilityLabel="Choose pattern photo" disabled={photoBusy} onPress={() => { void choosePhoto(); }} style={styles.photoButton}>{pattern.imageUri ? <Photo uri={pattern.imageUri} crop={pattern.photoCrop} fill /> : <><Icon name="plus" size={36} color={theme.colors.navSelected} /><Copy>Add pattern photo</Copy></>}</Pressable>
      {pattern.imageUri && <View style={styles.removePhoto}><IconButton icon="pencil-outline" label="Adjust pattern photo" disabled={photoBusy} onPress={() => setAdjustingPhoto(true)} /><IconButton icon="trash-can-outline" label="Remove pattern photo" disabled={photoBusy} onPress={() => edit({ imageUri: undefined, photoCrop: undefined })} /></View>}
    </View>

    {adjustingPhoto && pattern.imageUri && <PhotoAdjuster uri={pattern.imageUri} initialCrop={pattern.photoCrop} onCancel={() => setAdjustingPhoto(false)} onApply={photoCrop => { edit({ photoCrop }); setAdjustingPhoto(false); }} />}
    <Field compact label="Pattern Title" value={pattern.title} onChangeText={title => edit({ title })} placeholder="e.g. Granny square" />
    <Field compact label="Description" value={pattern.description || ''} onChangeText={description => edit({ description })} multiline />
    <Field compact label="Yarn type" value={pattern.yarnType || ''} onChangeText={yarnType => edit({ yarnType })} />
    <Field compact label="Yarn colors" value={pattern.yarnColors?.join(',') || ''} onChangeText={text => edit({ yarnColors: text.split(',') })} placeholder="e.g. Cream, Olive, Blush" />
    <Field compact label="Hook sizes" value={pattern.hookSizes?.join(',') ?? pattern.hookSize ?? ''} onChangeText={text => edit({ hookSizes: text.split(',') })} placeholder="e.g. 4 mm, 5 mm" />
    <Field compact label="Other tools" value={pattern.otherTools || ''} onChangeText={otherTools => edit({ otherTools })} placeholder="e.g. Scissors, stitch markers" />
    </>}
    {pasting && <ImportModal onCancel={() => setPasting(false)} onImport={text => {
      const apply = () => { const imported = parsePatternImport(text); edit({ instructions: imported.rows, rowType: imported.rowType ?? pattern.rowType }); setPasting(false); setStep('instructions'); setExpandedRow(undefined); setError(''); };
      if (pattern.instructions.some(row => row.instructionText.trim())) confirm('Replace current rows?', 'Imported instructions replace the current rows. Review before saving.', apply); else apply();
    }} />}
    {step === 'instructions' && <>
    <View style={styles.rowTools}>
      {editingRows && <IconButton icon="select-all" label="Select all rows" selected={pattern.instructions.length > 0 && selectedRows.length === pattern.instructions.length} onPress={() => setSelectedRows(selectedRows.length === pattern.instructions.length ? [] : pattern.instructions.map(r => r.id))} />}
      {editingRows && <IconButton icon="trash-can-outline" label="Delete selected rows" disabled={!selectedRows.length || !!dragging} onPress={() => confirm(`Delete ${selectedRows.length} ${selectedRows.length === 1 ? 'row' : 'rows'}?`, 'Selected instructions will be removed. Save the pattern to keep this change.', () => {
        rows(pattern.instructions.filter(row => !selectedRows.includes(row.id)));
        setSelectedRows([]); setExpandedRow(undefined);
      }, true)} />}
      <IconButton label={editingRows ? 'Finish editing rows' : 'Edit rows'} icon={editingRows ? 'checkmark' : 'pencil-outline'} onPress={() => { setEditingRows(v => !v); setSelectedRows([]); setExpandedRow(undefined); }} />
    </View>
    <View style={styles.tableHeader}><Copy style={styles.rowNumber}>Row</Copy><Copy style={{ flex: 1, color: theme.colors.navSelected }}>Instruction</Copy><Copy style={styles.stitches}>Stitches</Copy></View>
    {pattern.instructions.map((row, index) => <View key={row.id} collapsable={false} ref={view => { if (view) rowViews.current.set(row.id, view); else rowViews.current.delete(row.id); }} style={{ gap: 8, zIndex: dragging === row.id ? 10 : 0, borderWidth: dropTarget === row.id && dragging !== row.id ? 2 : 0, borderRadius: 10, borderColor: theme.colors.terracotta }}>
      {dragging === row.id && <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, backgroundColor: theme.colors.paper, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.terracotta, padding: 12, transform: [{ translateY: dragOffset }] }}><Copy numberOfLines={2}>{index + 1}. {row.instructionText || 'Add instructions'}</Copy></View>}
      <SwipeRow key={editingRows ? 'editing' : 'viewing'} enabled={editingRows} onDragStart={pageY => beginDrag(row.id, pageY)} onDragMove={pageY => { if (drag.current) { drag.current.pageY = pageY; setDragOffset(pageY - dragStartY.current); measureDrop(); } }} onDragEnd={endDrag} onDelete={() => {
        const ids = selectedRows.includes(row.id) ? selectedRows : [row.id];
        confirm('Delete rows?', 'Selected instructions will be removed.', () => { rows(pattern.instructions.filter(value => !ids.includes(value.id))); setSelectedRows([]); }, true);
      }} onDuplicate={() => {
        const ids = selectedRows.includes(row.id) ? selectedRows : [row.id];
        let next = pattern.instructions;
        for (const rowId of ids) next = duplicateRow(next, rowId);
        rows(next); setSelectedRows([]);
      }}>
      <View style={[styles.instructionRow, dragging === row.id && { opacity: 0.3 }]}>

        {editingRows && <>
          <Pressable accessibilityRole="checkbox" accessibilityLabel={`Select row ${index + 1}`} accessibilityState={{ checked: selectedRows.includes(row.id) }} onPress={() => setSelectedRows(current => current.includes(row.id) ? current.filter(value => value !== row.id) : [...current, row.id])} style={styles.selection}><View style={[styles.selectionCircle, selectedRows.includes(row.id) && { backgroundColor: theme.colors.primary }]}>{selectedRows.includes(row.id) && <Icon name="checkmark" size={16} color={theme.colors.onPrimary} />}</View></Pressable>
        </>}
        <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${pattern.rowType} ${index + 1}`} accessibilityState={{ expanded: expandedRow === row.id }} onPress={() => editingRows ? setSelectedRows(current => current.includes(row.id) ? current.filter(value => value !== row.id) : [...current, row.id]) : setExpandedRow(current => current === row.id ? undefined : row.id)} style={styles.rowSummary}>
          <Copy style={styles.rowNumber}>{index + 1}</Copy>
          <Copy numberOfLines={2} style={styles.instructionText}>{row.instructionText || 'Add instructions'}</Copy>
          <Copy style={styles.stitches}>{row.expectedStitchCount ?? '—'}</Copy>
        </Pressable>
      </View>
      </SwipeRow>
      {expandedRow === row.id && <Card style={{ padding: 12, gap: 10 }}>
        <Field compact label="Part" value={row.part || ''} onChangeText={part => updateRow(index, { part })} placeholder="e.g. Ears, body, border" />
        <Field compact label="Instruction (required)" value={row.instructionText} multiline onChangeText={instructionText => updateRow(index, { instructionText })} />
        <Field compact label="Expected stitches" keyboardType="number-pad" value={row.expectedStitchCount === undefined ? '' : String(row.expectedStitchCount)} onChangeText={text => {
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
    {step === 'details' ? <View style={styles.actions}><Button title="Next: Instructions" olive onPress={() => setStep('instructions')} /></View> : <View style={styles.saveActions}>
      <Button title="Save" icon="checkmark" olive disabled={photoBusy} onPress={() => save(false)} />
      <View style={styles.secondaryActions}>
        <View style={{ flex: 1 }}><Button title="Draft" icon="pencil-outline" secondary disabled={photoBusy} onPress={() => save(true)} /></View>
        <View style={{ flex: 1 }}><Button title="Delete" icon="trash-can-outline" destructive disabled={photoBusy} onPress={deletePattern} /></View>
      </View>
    </View>}

    {exitAction && <UnsavedChangesDialog busy={photoBusy} onCancel={() => setExitAction(null)} onDiscard={discardChanges} onSave={() => { setExitAction(null); save(pattern.status === 'draft'); }} />}
  </Screen>;
}

const styles = StyleSheet.create({
  tableHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: theme.colors.sage, borderRadius: 10 },
  instructionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowSummary: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, backgroundColor: theme.colors.sand, padding: 10 },
  rowNumber: { width: 30, color: theme.colors.navSelected, fontSize: 13 },
  instructionText: { flex: 1, color: theme.colors.navSelected, fontSize: 14, borderLeftWidth: 1, borderColor: theme.colors.line, paddingLeft: 8 },
  stitches: { width: 49, textAlign: 'right', fontSize: 12, color: theme.colors.navSelected },
  selection: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  selectionCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  rowTools: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  photoFrame: { width: '100%' },
  photoButton: { width: '100%', aspectRatio: 1, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.sand, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', gap: 8 },
  removePhoto: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 8 },
  actions: { alignItems: 'flex-end', marginTop: 16 },
  saveActions: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: theme.colors.line, gap: 10 },
  secondaryActions: { flexDirection: 'row', gap: 10 },
});
