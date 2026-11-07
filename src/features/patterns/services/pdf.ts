import type { DocumentPickerAsset } from 'expo-document-picker';
import { getPageCount, extractText, isAvailable, isPasswordProtected } from 'expo-pdf-text-extract';
import { MAX_PDF_BYTES, MAX_PDF_PAGES, importedRows } from '../model/rows';
export const PDF_IMPORT_AVAILABLE = isAvailable();
export async function readPdf(asset: DocumentPickerAsset): Promise<string> {
  if (!isAvailable()) throw new Error('PDF import needs an installed development build. You can use Paste Text here.');
  if (!asset.size || asset.size > MAX_PDF_BYTES) throw new Error('Choose a PDF smaller than 20 MB.');
  if (await isPasswordProtected(asset.uri)) throw new Error('This PDF is locked. Choose an unlocked text PDF.');
  if (await getPageCount(asset.uri) > MAX_PDF_PAGES) throw new Error('Choose a PDF with no more than 100 pages.');
  const text = await extractText(asset.uri);
  if (!text.trim()) throw new Error('This PDF has no selectable text. Use a text PDF or paste its instructions.');
  importedRows(text);
  return text;
}
