import type { DocumentPickerAsset } from 'expo-document-picker';
import { File } from 'expo-file-system';
import { getPageCount, extractText, isAvailable } from 'expo-pdf-text-extract';
import { MAX_PDF_BYTES, MAX_PDF_PAGES, MAX_IMPORT_CHARACTERS } from '../model/rows';
export const PDF_IMPORT_AVAILABLE = isAvailable();
export async function readPdf(asset: DocumentPickerAsset, onProgress?: (message: string) => void): Promise<string> {
  if (!isAvailable()) throw new Error('PDF import needs an installed development build. You can use Paste Text here.');
  if (!(asset.size ?? new File(asset.uri).size) || (asset.size ?? new File(asset.uri).size) > MAX_PDF_BYTES) throw new Error('Choose a PDF smaller than 20 MB.');
  onProgress?.('Checking PDF…');
  const pageCount = await getPageCount(asset.uri);
  if (pageCount > MAX_PDF_PAGES) throw new Error('Choose a PDF with no more than 100 pages.');
  onProgress?.(`Reading ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}…`);
  // Extract the document once. Per-page extraction reopens and parses the entire
  // PDF for every page on Android, which gets increasingly slow for long files.
  const text = await extractText(asset.uri);
  if (text.length > MAX_IMPORT_CHARACTERS) throw new Error('This PDF contains too much text. Import a smaller section.');
  if (!text.trim()) throw new Error('This PDF has no selectable text. Use a text PDF or paste its instructions.');
  return text;
}
