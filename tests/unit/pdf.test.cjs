require('../helpers/register-typescript.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {extractPdfBytes}=require('../../src/features/patterns/services/pdfText.ts');
function pdf() {
 const stream='BT /F1 12 Tf 50 750 Td (Chain 6) Tj 0 -20 Td (Work 6 sc) Tj ET';
 const objects=[
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
 ];
 let text='%PDF-1.4\n'; const offsets=[0];
 objects.forEach((object,i)=>{offsets.push(Buffer.byteLength(text));text+=`${i+1} 0 obj\n${object}\nendobj\n`;});
 const start=Buffer.byteLength(text);
 text+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset=>String(offset).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
 return new Uint8Array(Buffer.from(text));
}
test('bundled PDF parser extracts written instructions and preserves separate rows',async()=>{
 const text=await extractPdfBytes(pdf());
 assert.equal(text,'Chain 6\nWork 6 sc');
});
test('PDF parser rejects invalid and empty attachments',async()=>{
 await assert.rejects(extractPdfBytes(new Uint8Array()),/nonempty PDF/);
 await assert.rejects(extractPdfBytes(new TextEncoder().encode('not a PDF')),/valid PDF/);
});

test('PDF parser reports page progress',async()=>{
 const messages=[];
 await extractPdfBytes(pdf(),message=>{messages.push(message);});
 assert.ok(messages.includes('Opening PDF…'));
 assert.ok(messages.includes('Reading page 1 of 1…'));
});

test('native import extracts a multi-page document once and leaves formatting for review',async()=>{
 const Module=require('node:module');
 const original=Module._load;
 const calls=[];
 Module._load=function(name,...args){
  if(name==='expo-file-system') return {File:class {size=100;}};
  if(name==='expo-pdf-text-extract') return {
   isAvailable:()=>true,
   getPageCount:async()=>{calls.push('pages');return 30;},
   extractText:async()=>{calls.push('extract');return 'Row 1 | Work 6 sc | 6\nA page heading to review';},
  };
  return original.call(this,name,...args);
 };
 let readPdf;
 try { ({readPdf}=require('../../src/features/patterns/services/pdf.ts')); }
 finally {Module._load=original;}
 const messages=[];
 const text=await readPdf({uri:'file:///pattern.pdf',size:100},message=>messages.push(message));
 assert.match(text,/page heading/);
 assert.deepEqual(calls,['pages','extract']);
 assert.ok(messages.includes('Reading 30 pages…'));
 await assert.rejects(readPdf({uri:'file:///empty.pdf',size:0}),/smaller than/);
});

test('the granny square PDF imports its four wrapped rounds with correct totals',async()=>{
 const fs=require('node:fs');
 const path=require('node:path');
 const {parsePatternImport}=require('../../src/features/patterns/model/rows.ts');
 const bytes=new Uint8Array(fs.readFileSync(path.join(__dirname,'../fixtures/granny-square-import.pdf')));
 const extracted=await extractPdfBytes(bytes);
 const parsed=parsePatternImport(extracted);
 assert.equal(parsed.rowType,'round');
 assert.equal(parsed.rows.length,4);
 assert.deepEqual(parsed.rows.map(row=>row.expectedStitchCount),[12,24,36,48]);
 assert.deepEqual(parsed.rows.map(row=>row.rowNumber),[1,2,3,4]);
 assert.ok(parsed.rows[0].instructionText.includes('Pull ring closed and sl st'));
 assert.ok(parsed.rows[3].instructionText.includes('beginning ch 3.'));
 assert.ok(parsed.rows.every(row=>!row.instructionText.includes('\n')));
 assert.ok(parsed.skippedLines>0);
 const edited=parsePatternImport(extracted.replace('Make a magic ring.','Start with a magic ring.'));
 assert.ok(edited.rows[0].instructionText.startsWith('Start with a magic ring.'));
 assert.deepEqual(edited.rows.map(row=>row.expectedStitchCount),[12,24,36,48]);
});
