'use dom';

import { useEffect, useRef } from 'react';
import type { DOMProps } from 'expo/dom';
import { extractPdfBytes } from '../services/pdfText';

export default function PdfTextReader({ base64, onResult, onProgress, dom: _dom }: { base64: string; onProgress: (message: string) => Promise<void>; onResult: (text: string, error: string) => Promise<void>; dom?: DOMProps }) {
  const resultCallback = useRef(onResult);
  const progressCallback = useRef(onProgress);
  useEffect(() => { resultCallback.current = onResult; progressCallback.current = onProgress; }, [onResult, onProgress]);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const binary = atob(base64);
        const data = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index++) data[index] = binary.charCodeAt(index);
        const text = await extractPdfBytes(data, async message => { if (!cancelled) await progressCallback.current(message); });
        if (!cancelled) await resultCallback.current(text, '');
      } catch (error) {
        if (!cancelled) await resultCallback.current('', error instanceof Error ? error.message : 'Could not read this PDF.');
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [base64]);
  return <div aria-label="Reading PDF" />;
}
