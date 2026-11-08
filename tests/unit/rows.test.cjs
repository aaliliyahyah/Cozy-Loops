require('../helpers/register-typescript.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {duplicateRow,importedRows,MAX_IMPORT_CHARACTERS}=require('../../src/features/patterns/model/rows.ts');
test('duplicate preserves details, inserts below source, and renumbers with a fresh id',()=>{
 const rows=[{id:'a',rowNumber:1,instructionText:'6 sc',expectedStitchCount:6,part:'Ears',yarnColor:'Blush',hookSize:'3 mm'},{id:'b',rowNumber:2,instructionText:'12 sc'}];
 const next=duplicateRow(rows,'a'); assert.equal(next.length,3); assert.notEqual(next[1].id,'a'); assert.deepEqual({...next[1],id:'a',rowNumber:1},rows[0]); assert.equal(next[2].rowNumber,3); assert.equal(rows.length,2);
});
test('import normalizes lines and validates empty and oversized text',()=>{
 const rows=importedRows('  Chain 3.\r\n\r\n Work 2 sc. '); assert.equal(rows.length,2); assert.equal(rows[1].rowNumber,2); assert.equal(rows[0].instructionText,'Chain 3.'); assert.throws(()=>importedRows('  ')); assert.throws(()=>importedRows('x'.repeat(MAX_IMPORT_CHARACTERS+1)));
});

test('moving rows preserves content and renumbers in both directions without mutating input', () => {
 const {moveRow}=require('../../src/features/patterns/model/rows.ts');
 const rows=[{id:'a',rowNumber:1,instructionText:'First',expectedStitchCount:6},{id:'b',rowNumber:2,instructionText:'Second'},{id:'c',rowNumber:3,instructionText:'Third'}];
 const moved=moveRow(rows,'b',-1);
 assert.deepEqual(moved.map(r=>r.id),['b','a','c']);
 assert.deepEqual(moved.map(r=>r.rowNumber),[1,2,3]);
 assert.equal(moved[1].expectedStitchCount,6);
 assert.deepEqual(moveRow(moved,'b',1),rows);
 assert.equal(moveRow(rows,'a',-1),rows);
 assert.equal(moveRow(rows,'c',1),rows);
 assert.equal(moveRow(rows,'missing',1),rows);
 assert.deepEqual(rows.map(r=>r.id),['a','b','c']);
});


test('dragging can reorder to any position and keeps row numbers and content together', () => {
 const {reorderRow}=require('../../src/features/patterns/model/rows.ts');
 const rows=Array.from({length:6},(_,i)=>({id:String(i),rowNumber:i+1,instructionText:'Row '+i,part:'Part '+i}));
 const next=reorderRow(rows,'0',5);
 assert.deepEqual(next.map(r=>r.id),['1','2','3','4','5','0']);
 assert.deepEqual(next.map(r=>r.rowNumber),[1,2,3,4,5,6]);
 assert.equal(next[5].part,'Part 0');
 assert.deepEqual(reorderRow(next,'0',0),rows);
 assert.equal(reorderRow(rows,'missing',2),rows);
 assert.equal(reorderRow(rows,'0',-1),rows);
 assert.equal(reorderRow(rows,'0',6),rows);
 assert.equal(reorderRow(rows,'0',0),rows);
});

test('structured import separates parts, instructions and stitch counts', () => {
 const rows=importedRows('Part: Body\nRow 1 | Work 6 sc. | 6\nRow 2 | Increase around. | 12\nPart: Ears\nRound 1 | Chain 4. | -');
 assert.equal(rows.length,3);
 assert.equal(rows[0].instructionText,'Work 6 sc.');
 assert.equal(rows[0].expectedStitchCount,6);
 assert.equal(rows[0].part,'Body');
 assert.equal(rows[2].part,'Ears');
 assert.equal(rows[2].rowNumber,3);
 assert.equal(rows[2].expectedStitchCount,undefined);
 assert.equal(importedRows('Row 1 | Work 6 sc. | 6\nA finishing note').length,1);
 assert.throws(()=>importedRows('Row 1 | Work 6 sc. | 999999999999999999'),/whole number/);
});


test('structured PDF rows join display lines and skip document titles and notes',()=>{
 const {parsePatternImport}=require('../../src/features/patterns/model/rows.ts');
 const parsed= parsePatternImport('Practice square\nMaterials: yarn\nPart: Body\nRound 1 | Make a magic ring and work\n6 single crochet stitches. |\n6\nRound 2 | Increase around. | 12\nFinishing\nWeave in ends.');
 assert.equal(parsed.rowType,'round');
 assert.equal(parsed.rows.length,2);
 assert.equal(parsed.rows[0].instructionText,'Make a magic ring and work 6 single crochet stitches.');
 assert.equal(parsed.rows[0].part,'Body');
 assert.equal(parsed.rows[0].expectedStitchCount,6);
 assert.equal(parsed.skippedLines,4);
});
test('an incomplete numbered instruction identifies the row and recovers after editing',()=>{
 const bad='Title\nRow 1 | Work 6 sc |\nRow 2 | Increase | 12';
 assert.throws(()=>importedRows(bad),/Row 1 \(line 2\) is incomplete/);
 const fixed=bad.replace('Work 6 sc |','Work 6 sc | 6');
 assert.equal(importedRows(fixed).length,2);
 assert.throws(()=>importedRows('Row 1 | Work 6 sc | 6\nRow 2 Increase | 12'),/Line 2: add the/);
 assert.throws(()=>importedRows('Row 1 | Work 6 sc | unknown'),/End with a whole number/);
});
