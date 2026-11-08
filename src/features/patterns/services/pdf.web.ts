import type { DocumentPickerAsset } from 'expo-document-picker';
export const PDF_IMPORT_AVAILABLE = true;
export async function readPdf(asset: DocumentPickerAsset, onProgress?: (message: string) => void): Promise<string> {
  if (!asset.file) throw new Error('Could not read the selected PDF. Attach the file again.');
  onProgress?.('Opening PDF…');
  const { extractPdfBytes } = await import('./pdfText');
  return extractPdfBytes(new Uint8Array(await asset.file.arrayBuffer()), onProgress);
}
