import { PatternTableHeader, tableStyles } from '../components/PatternTableHeader';
import { EditableRowFields } from '../components/EditableRowFields';
import { PartNameDialog } from '../components/PartNameDialog';
import { addPatternPart, appendPartRow, groupPatternRows, renamePatternPart, reorderRowInPart, partSelectionState, togglePartSelection } from '../model/parts';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, Pressable, View, ScrollView, StyleSheet } from 'react-native';
import { IconButton } from '@/components/library/Controls';
import { deleteLibraryItems } from '@/features/library/deletion';
import { originTarget } from '@/components/navigation/origin';
import { theme } from '@/theme';
import { router, usePreventRemove, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { Button } from '@/components/ui/Button';
import { TabHeader } from '@/components/layout/TabHeader';
import { Copy, Heading } from '@/components/ui/Typography';
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
import { duplicateRow, numberRows, parsePatternImport } from '../model/rows';
import { newId } from '@/utils/id';
import type { Pattern, PatternRow } from '@/types/cozy';

function blankPattern(): Pattern {
  const now = new Date().toISOString();
  return { id: newId(), title: '', rowType: 'row', instructions: [], status: 'draft', createdAt: now, updatedAt: now };
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
  const [selectingRows, setSelectingRows] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string>();
  const [partDialog, setPartDialog] = useState<{ sectionId?: string; name?: string } | null>(null);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const rowViews = useRef(new Map<string, ComponentRef<typeof View>>());
  const drag = useRef<{ id: string; pageY: number; destination: number; rowIds: string[] } | null>(null);
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
    setStep('details'); setSelectingRows(false); setSelectedRows([]); setExpandedRow(undefined); setPartDialog(null); setError('');
    go?.();
  };
  const deletePattern = () => {
    const saved = data.patterns.some(item => item.id === pattern.id);
    confirm(saved ? 'Delete pattern?' : 'Discard this pattern?', saved ? 'This pattern will move to Deleted. Existing projects keep their instructions.' : 'This will discard the pattern you are creating.', () => {
      setDirty(false); disablePrevention();
      if (saved) change(current => deleteLibraryItems(current, 'patterns', [pattern.id]));
      if (!id) { setPattern(blankPattern()); setStep('details'); setSelectingRows(false); setSelectedRows([]); setExpandedRow(undefined); setPartDialog(null); }
      router.navigate({ pathname: '/(tabs)/patterns', params: { from: 'patterns' } });
    }, true);
  };
  const edit = (patch: Partial<Pattern>) => { setPattern(p => ({ ...p, ...patch })); setDirty(true); };
  const rows = (instructions: PatternRow[]) => edit({ instructions: numberRows(instructions) });
  const updateRow = useCallback((rowId: string, patch: Partial<PatternRow>) => {
    setPattern(current => ({ ...current, instructions: numberRows(current.instructions.map(row => row.id === rowId ? { ...row, ...patch } : row)) }));
    setDirty(true);
  }, []);
  const measureDrop = () => {
    const current = drag.current;
    if (!current) return;
    pattern.instructions.forEach((row, index) => current.rowIds.includes(row.id) && rowViews.current.get(row.id)?.measureInWindow((_x, y, _width, height) => {
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
        const view = current.rowIds.includes(row.id) ? rowViews.current.get(row.id) : undefined;
        if (!view) { resolve(undefined); return; }
        view.measureInWindow((_x, y, _width, height) => resolve(pageY >= y && pageY <= y + height ? index : undefined));
      }))).then(targets => {
        const destination = targets.find(value => value !== undefined);
        if (destination !== undefined) rows(reorderRowInPart(pattern.instructions, current.id, destination));
      });
    }
    drag.current = null; setDragging(undefined); setDropTarget(undefined);
  };
  const beginDrag = (rowId: string, pageY: number) => {
    const section = groupPatternRows(pattern.instructions).find(section => section.rows.some(row => row.id === rowId));
    if (!section) return;
    drag.current = { id: rowId, pageY, destination: pattern.instructions.findIndex(row => row.id === rowId), rowIds: section.rows.map(row => row.id) };
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
      setError('Add a title and at least one part, review imported text, and fill in every row before saving a ready pattern. You can save an incomplete draft.'); return;
    }
    const saved: Pattern = { ...pattern, title: pattern.title.trim(), hookSize: pattern.hookSizes === undefined ? pattern.hookSize : undefined, yarnColors: pattern.yarnColors?.map(v => v.trim()).filter(Boolean), hookSizes: pattern.hookSizes?.map(v => v.trim()).filter(Boolean), status: draft ? 'draft' : 'ready', updatedAt: new Date().toISOString() };
    change(d => ({ ...d, patterns: d.patterns.some(p => p.id === saved.id) ? d.patterns.map(p => p.id === saved.id ? saved : p) : [...d.patterns, saved] }));
    setPattern(saved); setDirty(false); setError('');
    disablePrevention();
    if (!id) { setPattern(blankPattern()); setStep('details'); setSelectingRows(false); setSelectedRows([]); setExpandedRow(undefined); setPartDialog(null); }
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
  return <Screen scrollRef={scrollRef} scrollEnabled={!dragging} onScrollOffset={offset => { scrollOffset.current = offset; }} contentStyle={{ paddingTop: 0, gap: 12, flexGrow: 1 }} header={<TabHeader title={id ? 'Edit Pattern' : 'Add Pattern'} icon="heart-plus" leading={<BackButton onPress={leave} />} trailing={<IconButton icon="import" label="Paste or import pattern" selected={pasting} disabled={photoBusy} onPress={() => setPasting(true)} />} />}>
    <View style={styles.instructionHeading}>
      <Copy style={{ flex: 1, color: theme.colors.navSelected, fontFamily: theme.fonts.bold }}>{step === 'details' ? 'Pattern Details' : 'Pattern Instructions'}</Copy>
      {step === 'instructions' && <>
        <IconButton icon="select-all" label={selectingRows ? 'Finish selecting rows' : 'Select rows'} selected={selectingRows} disabled={!pattern.instructions.length && !selectingRows} onPress={() => { setSelectingRows(value => !value); setSelectedRows([]); setExpandedRow(undefined); }} />
        {selectingRows && <IconButton icon="trash-can-outline" label="Delete selected rows" disabled={!selectedRows.length} onPress={() => confirm(`Delete ${selectedRows.length} ${selectedRows.length === 1 ? 'row' : 'rows'}?`, 'Selected instructions will be removed. Save the pattern to keep this change.', () => {
          rows(pattern.instructions.filter(row => !selectedRows.includes(row.id))); setSelectedRows([]); setExpandedRow(undefined);
        }, true)} />}
      </>}
    </View>
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
    {pasting && <ImportModal replaceExisting={pattern.instructions.some(row => row.instructionText.trim())} onCancel={() => setPasting(false)} onImport={text => {
      const imported = parsePatternImport(text); edit({ instructions: numberRows(imported.rows), rowType: imported.rowType ?? pattern.rowType }); setPasting(false); setStep('instructions'); setSelectedRows([]); setExpandedRow(undefined); setSelectingRows(false); setError('');
    }} />}
    {step === 'instructions' && <>
      {!pattern.instructions.length && <PatternTableHeader rowType={pattern.rowType} />}
      {groupPatternRows(pattern.instructions).map(section => <View key={section.id} style={styles.partTable}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Rename part ${section.name}`} disabled={selectingRows || !!dragging} onPress={() => setPartDialog({ sectionId: section.id, name: section.name })}>
          <Heading>{section.name}</Heading>
        </Pressable>
        <PatternTableHeader rowType={pattern.rowType} selecting={selectingRows} partName={section.name} checked={partSelectionState(section.rows, selectedRows)} onToggleAll={() => setSelectedRows(current => togglePartSelection(section.rows, current))} />
        {section.rows.map((row, index) => <View key={row.id} collapsable={false} ref={view => { if (view) rowViews.current.set(row.id, view); else rowViews.current.delete(row.id); }} style={{ gap: 8, zIndex: dragging === row.id ? 10 : 0, borderWidth: dropTarget === row.id && dragging !== row.id ? 2 : 0, borderRadius: 10, borderColor: theme.colors.terracotta }}>
          {dragging === row.id && <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, backgroundColor: theme.colors.paper, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.terracotta, padding: 12, transform: [{ translateY: dragOffset }] }}><Copy numberOfLines={2}>{row.rowNumber}. {row.instructionText || 'Add instructions'}</Copy></View>}
          <View style={tableStyles.line}><View style={tableStyles.content}>
          <SwipeRow enabled={!selectingRows && (!dragging || dragging === row.id)} onDragStart={pageY => beginDrag(row.id, pageY)} onDragMove={pageY => { if (drag.current) { drag.current.pageY = pageY; setDragOffset(pageY - dragStartY.current); measureDrop(); } }} onDragEnd={endDrag}
            onDelete={() => confirm(`Delete ${pattern.rowType} ${row.rowNumber}?`, 'This instruction will be removed. Save the pattern to keep this change.', () => {
              rows(pattern.instructions.filter(value => value.id !== row.id));
              if (expandedRow === row.id) setExpandedRow(undefined);
            }, true)}
            onDuplicate={() => rows(duplicateRow(pattern.instructions, row.id))}>
            <View style={[tableStyles.line, dragging === row.id && { opacity: 0.3 }]}>
              {selectingRows && <Pressable accessibilityRole="checkbox" accessibilityLabel={`Select ${section.name} ${pattern.rowType} ${row.rowNumber}`} accessibilityState={{ checked: selectedRows.includes(row.id) }} aria-checked={selectedRows.includes(row.id)} onPress={() => setSelectedRows(current => current.includes(row.id) ? current.filter(value => value !== row.id) : [...current, row.id])} style={tableStyles.selectionSlot}>
                <View style={[tableStyles.selectionCircle, selectedRows.includes(row.id) && { backgroundColor: theme.colors.primary }]}>{selectedRows.includes(row.id) && <Icon name="checkmark" size={16} color={theme.colors.onPrimary} />}</View>
              </Pressable>}
              <Pressable accessibilityRole="button" accessibilityLabel={`${selectingRows ? 'Toggle selection for' : 'Edit'} ${section.name} ${pattern.rowType} ${row.rowNumber}`} accessibilityState={{ expanded: expandedRow === row.id }} aria-expanded={!selectingRows && expandedRow === row.id} onPress={() => selectingRows
                ? setSelectedRows(current => current.includes(row.id) ? current.filter(value => value !== row.id) : [...current, row.id])
                : setExpandedRow(current => current === row.id ? undefined : row.id)} style={tableStyles.data}>
                <Copy style={tableStyles.number}>{row.rowNumber}</Copy>
                <Copy numberOfLines={2} style={tableStyles.instruction}>{row.instructionText || 'Add instructions'}</Copy>
                <Copy style={tableStyles.stitches}>{row.expectedStitchCount ?? '—'}</Copy>
              </Pressable>
            </View>
          </SwipeRow>
          </View>{!selectingRows && <View style={tableStyles.actionSlot}>{index === section.rows.length - 1 && <IconButton icon="plus" label={`Add ${pattern.rowType} to ${section.name}`} style={styles.rowPlus} onPress={() => rows(appendPartRow(pattern.instructions, section.id))} />}</View>}</View>
          {!selectingRows && expandedRow === row.id && <EditableRowFields row={row} yarnColors={pattern.yarnColors} hookSizes={pattern.hookSizes} hookSize={pattern.hookSize} onChange={updateRow} />}
        </View>)}
      </View>)}
      {!selectingRows && <View style={{ alignSelf: 'flex-end' }}><IconButton icon="plus" label="Add part" floating onPress={() => setPartDialog({})} /></View>}
    </>}
    {partDialog && <PartNameDialog initialName={partDialog.name} onCancel={() => setPartDialog(null)} onSubmit={name => {
      const next = partDialog.sectionId ? renamePatternPart(pattern.instructions, partDialog.sectionId, name) : addPatternPart(pattern.instructions, name);
      rows(next); setPartDialog(null);
    }} />}
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
  partTable: { gap: 8, marginTop: 8 },
  instructionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  rowPlus: { borderWidth: 0, backgroundColor: 'transparent' },
  photoFrame: { width: '100%' },
  photoButton: { width: '100%', aspectRatio: 1, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.sand, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', gap: 8 },
  removePhoto: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 8 },
  actions: { alignItems: 'flex-end', marginTop: 16 },
  saveActions: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: theme.colors.line, gap: 10 },
  secondaryActions: { flexDirection: 'row', gap: 10 },
});
