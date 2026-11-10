require('../helpers/register-typescript.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {deleteLibraryItems,restoreLibraryItems}=require('../../src/features/library/deletion.ts');
const pattern={id:'pattern-a',updatedAt:'2026-01-01T00:00:00Z',instructions:[{id:'row-a',instructionText:'6 sc',expectedStitchCount:6}]};
const snapshot=structuredClone(pattern);
const project={id:'project-a',updatedAt:'2026-01-01T00:00:00Z',patternId:pattern.id,patternSnapshot:snapshot,rows:[{count:3,completed:false}]};
const data={patterns:[pattern,{id:'pattern-b'}],projects:[project,{id:'project-b'}],preferences:{hapticsEnabled:true}};
test('deleted patterns remain recoverable without affecting their projects',()=>{
 const next=deleteLibraryItems(data,'patterns',['pattern-a']);
 assert.deepEqual(next.patterns.filter(p=>!p.deletedAt).map(p=>p.id),['pattern-b']);
 assert.equal(next.patterns.length,2);
 assert.ok(!Number.isNaN(Date.parse(next.patterns[0].deletedAt)));
 assert.equal(next.projects,data.projects);
 assert.deepEqual(next.projects[0].patternSnapshot.instructions,snapshot.instructions);
 assert.equal(next.projects[0].rows[0].count,3);
 assert.equal(data.patterns[0].deletedAt,undefined);
 const restored=restoreLibraryItems(next,'patterns',['pattern-a']);
 assert.equal(restored.patterns[0].deletedAt,undefined);
 assert.deepEqual(restored.patterns[0].instructions,pattern.instructions);
 assert.equal(restored.patterns[1],data.patterns[1]);
});
test('restoring a project recovers its saved progress and keeps source patterns',()=>{
 const next=deleteLibraryItems(data,'projects',['project-a','missing']);
 assert.deepEqual(next.projects.filter(p=>!p.deletedAt).map(p=>p.id),['project-b']);
 assert.equal(next.patterns,data.patterns);
 assert.equal(next.preferences,data.preferences);
 const restored=restoreLibraryItems(next,'projects',['project-a']);
 assert.equal(restored.projects[0].deletedAt,undefined);
 assert.equal(restored.projects[0].rows,project.rows);
 assert.equal(restored.projects[0].patternSnapshot,snapshot);
 assert.equal(next.projects[1],data.projects[1]);
 assert.equal(deleteLibraryItems(next,'projects',['project-a']).projects[0],next.projects[0]);
});

test('pattern duplication is independent with fresh IDs and normalized sections', () => {
 const {duplicatePattern}=require('../../src/features/library/duplication.ts');
 const {pattern:makePattern}=require('../helpers/fixtures.cjs');
 const source={...makePattern(),favorite:true,deletedAt:new Date().toISOString(),yarnColors:['Pink']};
 source.instructions[0].part='Ear'; source.instructions[1].part='Body'; source.instructions[2].part='Body';
 const copy=duplicatePattern(source);
 assert.notEqual(copy.id,source.id);
 assert.equal(copy.title,source.title+' (copy)');
 assert.equal(copy.status,'ready');
 assert.equal(copy.favorite,false); assert.equal(copy.deletedAt,undefined);
 assert.deepEqual(copy.instructions.map(row=>row.rowNumber),[1,1,2]);
 assert.ok(copy.instructions.every(row=>!source.instructions.some(original=>original.id===row.id)));
 copy.instructions[0].instructionText='changed'; copy.yarnColors[0]='Cream';
 assert.equal(source.instructions[0].instructionText,'6 sc'); assert.equal(source.yarnColors[0],'Pink');
 assert.equal(duplicatePattern({...source,status:'draft',title:''}).status,'draft');
});

test('project duplication retains active and finished progress without shared data or Undo', () => {
 const {duplicateProject}=require('../../src/features/library/duplication.ts');
 const {pattern:makePattern,createProject,plus,complete}=require('../helpers/fixtures.cjs');
 const active=complete(plus(createProject(makePattern())));
 for(const source of [active,{...active,status:'completed',completedAt:'2026-01-01T00:00:00Z'}]){
  const copy=duplicateProject({...source,favorite:true});
  assert.notEqual(copy.id,source.id); assert.equal(copy.name,source.name+' (copy)');
  assert.equal(copy.patternId,source.patternId); assert.equal(copy.status,source.status);
  assert.equal(copy.completedAt,source.completedAt); assert.equal(copy.currentRowIndex,source.currentRowIndex);
  assert.deepEqual(copy.rows,source.rows); assert.equal(copy.undo,undefined); assert.deepEqual(copy.undoHistory,[]);
  assert.equal(copy.favorite,false); assert.equal(copy.deletedAt,undefined);
  copy.rows[0].count=99; copy.patternSnapshot.instructions[0].instructionText='changed';
  assert.equal(source.rows[0].count,1); assert.equal(source.patternSnapshot.instructions[0].instructionText,'6 sc');
 }
});
