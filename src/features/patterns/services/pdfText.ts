import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as worker from 'pdfjs-dist/legacy/build/pdf.worker.mjs';
import { MAX_PDF_BYTES, MAX_PDF_PAGES, MAX_IMPORT_CHARACTERS } from '../model/rows';

export async function extractPdfBytes(data: Uint8Array, onProgress?: (message: string) => void | Promise<void>): Promise<string> {
  if (!data.length || data.length > MAX_PDF_BYTES) throw new Error('Choose a nonempty PDF smaller than 20 MB.');
  if (new TextDecoder().decode(data.slice(0, 5)) !== '%PDF-') throw new Error('Choose a valid PDF file.');
  // Bundle the worker in the DOM runtime. This also works offline and inside Expo Go,
  // where a worker URL pointing to the native app's root is not available.
  (globalThis as typeof globalThis & { pdfjsWorker?: unknown }).pdfjsWorker = worker;
  const task = pdfjs.getDocument({ data, useSystemFonts: true, stopAtErrors: true });
  try {
    await onProgress?.('Opening PDF…');
    const document = await task.promise;
    if (document.numPages > MAX_PDF_PAGES) throw new Error('Choose a PDF with no more than 100 pages.');
    const lines: string[] = [];
    let characters = 0;
    for (let number = 1; number <= document.numPages; number++) {
      if (number === 1 || number % 5 === 0 || number === document.numPages) await onProgress?.(`Reading page ${number} of ${document.numPages}…`);
      const page = await document.getPage(number);
      const content = await page.getTextContent();
      let line = '';
      let lastY: number | undefined;
      for (const item of content.items) {
        if (!('str' in item)) continue;
        const y = item.transform[5];
        if (lastY !== undefined && Math.abs(y - lastY) > 3 && line.trim()) { lines.push(line.trim()); line = ''; }
        characters += item.str.length + 1;
        if (characters > MAX_IMPORT_CHARACTERS) throw new Error('This PDF contains too much text. Import a smaller section.');
        line += item.str + ' ';
        lastY = y;
        if (item.hasEOL) { if (line.trim()) lines.push(line.trim()); line = ''; lastY = undefined; }
      }
      if (line.trim()) lines.push(line.trim());
      page.cleanup();
    }
    const text = lines.join('\n');
    if (!text.trim()) throw new Error('This PDF has no selectable text. Use a text PDF or paste its instructions.');
    return text;
  } catch (error) {
    if (error instanceof Error && error.name === 'PasswordException') throw new Error('This PDF is locked. Choose an unlocked text PDF.');
    if (error instanceof Error && error.name === 'InvalidPDFException') throw new Error('This PDF could not be read. Choose a valid text PDF.');
    throw error;
  } finally { await task.destroy(); }
}
