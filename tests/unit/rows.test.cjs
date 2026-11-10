require('../helpers/register-typescript.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {duplicateRow,importedRows,MAX_IMPORT_CHARACTERS}=require('../../src/features/patterns/model/rows.ts');
test('duplicate preserves details, inserts below source, and renumbers with a fresh id',()=>{
 const rows=[{id:'a',rowNumber:1,instructionText:'6 sc',expectedStitchCount:6,part:'Ears',yarnColor:'Blush',hookSize:'3 mm'},{id:'b',rowNumber:2,instructionText:'12 sc'}];
 const next=duplicateRow(rows,'a'); assert.equal(next.length,3); assert.notEqual(next[1].id,'a'); assert.deepEqual({...next[1],id:'a',rowNumber:1},rows[0]); assert.equal(next[2].rowNumber,1); assert.equal(rows.length,2);
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
 const rows=Array.from({length:6},(_,i)=>({id:String(i),rowNumber:1,instructionText:'Row '+i,part:'Part '+i}));
 const next=reorderRow(rows,'0',5);
 assert.deepEqual(next.map(r=>r.id),['1','2','3','4','5','0']);
 assert.deepEqual(next.map(r=>r.rowNumber),[1,1,1,1,1,1]);
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
 assert.equal(rows[2].rowNumber,1);
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

test('numbering and context restart for each contiguous part, including unnamed sections', () => {
 const {numberRows,rowContext}=require('../../src/features/patterns/model/rows.ts');
 const rows=['Ear',' Ear ','Body','Body','Ear',undefined,''].map((part,index)=>({id:String(index),part,rowNumber:index+1,instructionText:'sc'}));
 const next=numberRows(rows);
 assert.deepEqual(next.map(row=>row.rowNumber),[1,2,1,2,1,1,2]);
 assert.deepEqual(rowContext(next,1),{part:'Ear',number:2,total:2});
 assert.deepEqual(rowContext(next,4),{part:'Ear',number:1,total:1});
 assert.deepEqual(rowContext(next,6),{part:'Instructions',number:2,total:2});
 assert.deepEqual(rows.map(row=>row.rowNumber),[1,2,3,4,5,6,7]);
 assert.deepEqual(numberRows(next),next);
});

test('adding, editing a part, removing, duplicating and moving rows renumber sections', () => {
 const {numberRows,reorderRow,duplicateRow}=require('../../src/features/patterns/model/rows.ts');
 const rows=numberRows(['Ear','Ear','Body','Body'].map((part,index)=>({id:String(index),part,rowNumber:99,instructionText:'sc'})));
 const added=numberRows([...rows,{id:'4',part:'Body',rowNumber:1,instructionText:'inc'}]);
 assert.deepEqual(added.map(row=>row.rowNumber),[1,2,1,2,3]);
 const edited=numberRows(added.map(row=>row.id==='2'?{...row,part:'Ear'}:row));
 assert.deepEqual(edited.map(row=>row.rowNumber),[1,2,3,1,2]);
 const removed=numberRows(edited.filter(row=>row.id!=='1'));
 assert.deepEqual(removed.map(row=>row.rowNumber),[1,2,1,2]);
 const copied=duplicateRow(removed,'2');
 assert.deepEqual(copied.map(row=>row.rowNumber),[1,2,3,1,2]);
 const moved=reorderRow(rows,'0',3);
 assert.deepEqual(moved.map(row=>row.id),['1','2','3','0']);
 assert.deepEqual(moved.map(row=>row.rowNumber),[1,1,2,1]);
 assert.equal(rows[1].rowNumber,2);
});

test('part tables preserve contiguous legacy sections and unnamed rows', () => {
 const {groupPatternRows}=require('../../src/features/patterns/model/parts.ts');
 const rows=[undefined,'','Ear','Ear','Body','Ear'].map((part,index)=>({id:String(index),rowNumber:1,part,instructionText:'sc'}));
 const sections=groupPatternRows(rows);
 assert.deepEqual(sections.map(section=>[section.name,section.start,section.rows.length]),[['Instructions',0,2],['Ear',2,2],['Body',4,1],['Ear',5,1]]);
 assert.deepEqual(sections.map(section=>section.id),['0','2','4','5']);
 assert.equal(sections[0].rows[0],rows[0]);
 assert.equal(groupPatternRows([]).length,0);
});

test('create and rename parts require distinct names without changing row identities', () => {
 const {addPatternPart,renamePatternPart,appendPartRow,groupPatternRows}=require('../../src/features/patterns/model/parts.ts');
 const ear=addPatternPart([],' Ear ');
 assert.equal(ear[0].part,'Ear'); assert.equal(ear[0].rowNumber,1); assert.equal(ear[0].instructionText,'');
 const withEarRows=appendPartRow(ear,ear[0].id);
 const rows=addPatternPart(withEarRows,'Body');
 assert.deepEqual(rows.map(row=>row.rowNumber),[1,2,1]);
 assert.throws(()=>addPatternPart(rows,' ear '),/already exists/);
 assert.throws(()=>addPatternPart(rows,' '),/Enter a part name/);
 assert.throws(()=>renamePatternPart(rows,ear[0].id,'body'),/already exists/);
 assert.throws(()=>renamePatternPart(rows,ear[0].id,''),/Enter a part name/);
 assert.throws(()=>renamePatternPart(rows,'missing','Head'),/no longer available/);
 const renamed=renamePatternPart(rows,ear[0].id,' Head ');
 assert.deepEqual(groupPatternRows(renamed).map(part=>part.name),['Head','Body']);
 assert.deepEqual(renamed.map(row=>row.id),rows.map(row=>row.id));
 assert.deepEqual(renamed.map(row=>row.rowNumber),[1,2,1]);
 assert.equal(rows[0].part,'Ear'); assert.equal(rows[1].part,'Ear');
});

test('table row insertion, duplication, deletion and reordering respect part boundaries', () => {
 const {addPatternPart,appendPartRow,reorderRowInPart,groupPatternRows}=require('../../src/features/patterns/model/parts.ts');
 const {numberRows,duplicateRow}=require('../../src/features/patterns/model/rows.ts');
 const first=addPatternPart([],'Ear');
 const both=addPatternPart(first,'Body');
 const rows=appendPartRow(both,first[0].id);
 assert.deepEqual(rows.map(row=>row.part),['Ear','Ear','Body']);
 assert.deepEqual(rows.map(row=>row.rowNumber),[1,2,1]);
 assert.notEqual(rows[0].id,rows[1].id);
 const copied=duplicateRow(rows,rows[0].id);
 assert.deepEqual(copied.map(row=>row.rowNumber),[1,2,3,1]);
 const reordered=reorderRowInPart(rows,rows[0].id,1);
 assert.deepEqual(reordered.map(row=>row.id),[rows[1].id,rows[0].id,rows[2].id]);
 assert.equal(reorderRowInPart(rows,rows[0].id,2),rows);
 assert.equal(reorderRowInPart(rows,rows[2].id,0),rows);
 assert.equal(appendPartRow(rows,'missing'),rows);
 const deleted=numberRows(rows.filter(row=>row.part!=='Ear'));
 assert.equal(groupPatternRows(deleted).length,1);
 assert.equal(deleted[0].part,'Body'); assert.equal(deleted[0].rowNumber,1);
 assert.equal(rows[0].part,'Ear');
});

test('part header selection handles mixed state and preserves other parts', () => {
 const {partSelectionState,togglePartSelection}=require('../../src/features/patterns/model/parts.ts');
 const ear=[{id:'ear-1'},{id:'ear-2'}]; const body=[{id:'body-1'},{id:'body-2'}];
 assert.equal(partSelectionState(ear,[]),false);
 assert.equal(partSelectionState(ear,['ear-1']), 'mixed');
 assert.equal(partSelectionState(ear,['ear-1','ear-2']),true);
 let selection=['body-1'];
 selection=togglePartSelection(ear,selection);
 assert.deepEqual(selection,['body-1','ear-1','ear-2']);
 selection=togglePartSelection(ear,selection);
 assert.deepEqual(selection,['body-1']);
 selection=togglePartSelection(body,selection);
 assert.deepEqual(selection,['body-1','body-2']);
 assert.deepEqual(togglePartSelection(ear,['ear-1','body-1']),['ear-1','body-1','ear-2']);
 assert.equal(partSelectionState([],selection),false);
 assert.deepEqual(togglePartSelection([],selection),selection);
 const original=['body-1'];togglePartSelection(ear,original);assert.deepEqual(original,['body-1']);
});
