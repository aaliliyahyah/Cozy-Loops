import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, ScrollView, View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File } from 'expo-file-system';
import PdfTextReader from './PdfTextReader';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '@/components/ui/Button';
import { Copy } from '@/components/ui/Typography';
import { Field } from '@/components/ui/Field';
import { Chip, IconButton } from '@/components/library/Controls';
import { TabHeader } from '@/components/layout/TabHeader';
import { BackButton } from '@/components/navigation/BackButton';
import { theme } from '@/theme';
import { readPdf, PDF_IMPORT_AVAILABLE } from '../services/pdf';
import { parsePatternImport, MAX_PDF_BYTES } from '../model/rows';
export function ImportModal({ onCancel, onImport, replaceExisting = false }: { onCancel: () => void; onImport: (text: string) => void; replaceExisting?: boolean }) {
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const [text, setText] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [pdfJob, setPdfJob] = useState<{ token: number; base64: string } | null>(null);
  const [notice, setNotice] = useState('');
  const [progress, setProgress] = useState('');
  const preview = useMemo(() => {
    if (!text.trim()) return null;
    try { return parsePatternImport(text); } catch { return null; }
  }, [text]);
  const request = useRef(0); const closed = useRef(false);
  useEffect(() => { closed.current = false; return () => { closed.current = true; }; }, []);
  const cancel = () => { closed.current = true; request.current++; onCancel(); };
  const choose = async () => {
    const token = ++request.current; setError(''); setNotice(''); setProgress('Choose a PDF…'); setBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true, multiple: false });
      if (result.canceled) return;
      if (closed.current || token !== request.current) return;
      setProgress('Opening PDF…');
      if (Platform.OS !== 'web' && !PDF_IMPORT_AVAILABLE) {
        const file = new File(result.assets[0].uri);
        if (!file.size || file.size > MAX_PDF_BYTES) throw new Error('Choose a nonempty PDF smaller than 20 MB.');
        const base64 = await file.base64();
        if (!closed.current && token === request.current) setPdfJob({ token, base64 });
        return;
      }
      const value = await readPdf(result.assets[0], message => { if (!closed.current && token === request.current) setProgress(message); });
      if (!closed.current && token === request.current) { setText(current => [current.trim(), value.trim()].filter(Boolean).join('\n')); setNotice('PDF text added below. Check the instructions before importing.'); }
    } catch (e) { if (!closed.current && token === request.current) setError(e instanceof Error ? e.message : 'Could not read this PDF. Try an unlocked text PDF.'); }
    finally { if (!closed.current && token === request.current) setBusy(false); }
  };
  return <Modal animationType="none" onRequestClose={cancel}><SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: theme.colors.background }}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 12, width: '100%', maxWidth: 650, alignSelf: 'center' }}>
    <TabHeader title="Import Pattern" icon="import" leading={<BackButton onPress={cancel} />} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Chip title="Import pattern" selected={!showFormat} onPress={() => setShowFormat(false)} /><Chip title="Format instructions" selected={showFormat} onPress={() => setShowFormat(true)} /></View>
    {showFormat && <View style={{ gap: 16 }}>
      <View style={{ gap: 6 }}>
        <Copy style={{ fontFamily: theme.fonts.bold, fontSize: 22, lineHeight: 30 }}>Copy. Change. Import.</Copy>
        <Copy>Use this example. Replace the instructions and stitch totals with yours.</Copy>
      </View>
      <View style={{ gap: 8, padding: 14, borderRadius: 12, backgroundColor: theme.colors.sand }}>
        <Copy style={{ fontFamily: theme.fonts.bold }}>1. Start with this</Copy>
        <Copy selectable style={{ lineHeight: 30 }}>{'Row 1 | Make 6 single crochet stitches. | 6\nRow 2 | Increase in every stitch. | 12'}</Copy>
      </View>
      <View style={{ gap: 8 }}>
        <Copy style={{ fontFamily: theme.fonts.bold }}>2. Keep these three pieces</Copy>
        <Copy selectable style={{ color: theme.colors.navSelected, fontFamily: theme.fonts.bold }}>Row number | What to do | Total stitches</Copy>
        <Copy>The last number is how many stitches you should have when the row is done.</Copy>
        <Copy>{'Keep the | dividers. Put each row on its own line.'}</Copy>
      </View>
      <View style={{ gap: 6, padding: 14, borderRadius: 12, backgroundColor: theme.colors.sand }}>
        <Copy style={{ fontFamily: theme.fonts.bold }}>Quick tips</Copy>
        <Copy>{'• Don’t know the total? Use - instead.\n• Working in rounds? Write Round 1.\n• Have sections? Add Part: Body on its own line.'}</Copy>
      </View>
      <View style={{ gap: 6 }}>
        <Copy style={{ fontFamily: theme.fonts.bold }}>3. Check, then import</Copy>
        <Copy>Go back to Import pattern. Paste your text or attach a PDF, check the rows, then tap Import.</Copy>
        <Copy style={{ color: theme.colors.muted }}>PDF tip: use text you can highlight and copy, rather than a photo or scan. Wrapped instructions are joined automatically. Titles and notes outside numbered rows are skipped; put any finishing steps you want to track in a numbered row.</Copy>
      </View>
    </View>}
    <View style={{ display: showFormat ? 'none' : 'flex', gap: 12 }}>
    <View style={{ gap: 8, padding: 12, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}><Copy style={{ flex: 1, fontFamily: theme.fonts.bold }}>Attach PDF</Copy><IconButton icon="paperclip" label="Attach PDF to instructions" disabled={busy || !!pdfJob} onPress={() => { void choose(); }} /></View>
      <Field compact style={{ minHeight: 180, backgroundColor: theme.colors.sand }} label="Paste or edit your pattern" placeholder="Paste your pattern here, or attach a PDF above" multiline editable={!busy && !pdfJob} value={text} onChangeText={value => { setText(value); setError(''); }} />
    </View>
    {(busy || !!pdfJob) && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><ActivityIndicator accessibilityLabel="Reading PDF" color={theme.colors.primary} /><Copy accessibilityLiveRegion="polite">{progress || 'Reading PDF…'}</Copy></View>}
    {preview && <Copy accessibilityLiveRegion="polite">{preview.rows.length} {preview.rowType === 'round' ? 'rounds' : 'rows'} ready to import.{preview.skippedLines > 0 ? ' Titles and notes outside numbered instructions are skipped.' : ''}</Copy>}
    {!!notice && <Copy accessibilityLiveRegion="polite">{notice}</Copy>}
    {!!error && <Copy accessibilityRole="alert">{error}</Copy>}
    <View style={{ alignSelf: 'flex-end' }}><Button olive title="Import" disabled={busy || !!pdfJob || !text.trim()} onPress={() => { try { parsePatternImport(text); if (replaceExisting) setConfirmReplace(true); else onImport(text); } catch (e) { setError((e as Error).message); } }} /></View>
    </View>
    {pdfJob && <PdfTextReader base64={pdfJob.base64} dom={{ style: { width: 1, height: 1 } }} onProgress={async message => { if (!closed.current && pdfJob.token === request.current) setProgress(message); }} onResult={async (value, message) => {
      if (closed.current || pdfJob.token !== request.current) return;
      setPdfJob(null);
      if (message) setError(message);
      else { setText(current => [current.trim(), value.trim()].filter(Boolean).join('\n')); setNotice('PDF text added below. Check the instructions before importing.'); }
    }} />}
  </ScrollView></KeyboardAvoidingView>
    {confirmReplace && <ConfirmationDialog title="Replace current rows?" message="Imported instructions replace the current rows. Review before saving." actionLabel="Replace" onCancel={() => setConfirmReplace(false)} onConfirm={() => { setConfirmReplace(false); onImport(text); }} />}
  </SafeAreaView></Modal>;
}
