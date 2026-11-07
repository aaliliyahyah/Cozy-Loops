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
