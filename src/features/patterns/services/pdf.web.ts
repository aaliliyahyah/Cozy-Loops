import type { DocumentPickerAsset } from 'expo-document-picker';
import { MAX_PDF_BYTES, MAX_PDF_PAGES, importedRows } from '../model/rows';
export const PDF_IMPORT_AVAILABLE = true;
export async function readPdf(asset: DocumentPickerAsset): Promise<string> {
  const file = asset.file;
  if (!file || !file.size || file.size > MAX_PDF_BYTES) throw new Error('Choose a nonempty PDF smaller than 20 MB.');
  const data = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder().decode(data.slice(0, 5)) !== '%PDF-') throw new Error('Choose a valid PDF file.');
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  const task = pdfjs.getDocument({ data, useSystemFonts: true, stopAtErrors: true });
  try {
    const document = await task.promise;
    if (document.numPages > MAX_PDF_PAGES) throw new Error('Choose a PDF with no more than 100 pages.');
    const lines: string[] = [];
    let characters = 0;
    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      const content = await page.getTextContent();
      let line = '';
      for (const item of content.items) {
        if ('str' in item) {
          characters += item.str.length + 1;
          if (characters > 200_000) throw new Error('This PDF contains too much text. Import a smaller section.');
          line += item.str + ' '; if (item.hasEOL) { lines.push(line.trim()); line = ''; }
        }
      }
      if (line.trim()) lines.push(line.trim());
    }
    const text = lines.join('\n');
    if (!text.trim()) throw new Error('This PDF has no selectable text. Use a text PDF or paste its instructions.');
    importedRows(text); return text;
  } catch (error) {
    if (error instanceof Error && error.name === 'PasswordException') throw new Error('This PDF is locked. Choose an unlocked text PDF.');
    if (error instanceof Error && error.name === 'InvalidPDFException') throw new Error('This PDF could not be read. Choose a valid text PDF.');
    throw error;
  } finally { await task.destroy(); }
}
