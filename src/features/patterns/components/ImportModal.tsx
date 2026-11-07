import { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '@/components/ui/Button';
import { Copy, Heading } from '@/components/ui/Typography';
import { Field } from '@/components/ui/Field';
import { Chip } from '@/components/library/Controls';
import { theme } from '@/theme';
import { readPdf, PDF_IMPORT_AVAILABLE } from '../services/pdf';
import { importedRows } from '../model/rows';
export function ImportModal({ onCancel, onImport }: { onCancel: () => void; onImport: (text: string) => void }) {
  const [method, setMethod] = useState<'pdf' | 'text'>('text');
  const [text, setText] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const request = useRef(0); const closed = useRef(false);
  useEffect(() => { closed.current = false; return () => { closed.current = true; }; }, []);
  const cancel = () => { closed.current = true; request.current++; onCancel(); };
  const choose = async () => {
    const token = ++request.current; setError(''); setNotice(''); setBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true, multiple: false });
      if (result.canceled) return;
      const value = await readPdf(result.assets[0]);
      if (!closed.current && token === request.current) { setText(value); setNotice('PDF text is ready. Review and edit the instructions before importing.'); }
    } catch (e) { if (!closed.current && token === request.current) setError(e instanceof Error ? e.message : 'Could not read this PDF. Try an unlocked text PDF.'); }
    finally { if (!closed.current && token === request.current) setBusy(false); }
  };
  return <Modal animationType="slide" onRequestClose={cancel}><SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 16 }}>
    <Heading>Import pattern</Heading><View style={{ flexDirection: 'row', gap: 8 }}><Chip title="Paste Text" selected={method === 'text'} onPress={() => { request.current++; setNotice(''); setError(''); setBusy(false); setMethod('text'); setText(''); }} /><Chip title="Import PDF" selected={method === 'pdf'} onPress={() => { request.current++; setNotice(''); setError(''); setBusy(false); setMethod('pdf'); setText(''); }} /></View>
    {method === 'pdf' && <><Copy>{PDF_IMPORT_AVAILABLE ? 'Choose a text PDF up to 20 MB and 100 pages. Scanned PDFs need their instructions pasted as text.' : 'PDF import needs an installed development build. Use Paste Text in Expo Go.'}</Copy><Button title="Choose PDF" disabled={busy || !PDF_IMPORT_AVAILABLE} onPress={() => { void choose(); }} /></>}
    {busy && <ActivityIndicator accessibilityLabel="Reading PDF" color={theme.colors.primary} />}
    {!!notice && <Copy accessibilityLiveRegion="polite">{notice}</Copy>}
    <Field label="Review imported instructions" placeholder="Paste or review your written instructions" multiline value={text} onChangeText={setText} />
    <Copy>Each nonempty reviewed line becomes one row. Correct PDF line breaks before importing. Your pattern is saved only when you choose Save.</Copy>
    {!!error && <Copy accessibilityRole="alert">{error}</Copy>}
    <Button title="Import" disabled={busy || !text.trim()} onPress={() => { try { importedRows(text); onImport(text); } catch (e) { setError((e as Error).message); } }} />
    <Button title="Cancel" secondary onPress={cancel} />
  </ScrollView></KeyboardAvoidingView></SafeAreaView></Modal>;
}
