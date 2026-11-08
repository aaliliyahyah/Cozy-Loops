require('../helpers/register-typescript.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pattern,plus,complete,createProject,updateProgress}=require('../helpers/fixtures.cjs');
const {emptyData,decodeData,SerializedWriter}=require('../../src/services/storage/repository.ts');

test('legacy migration caps active counts and Undo without mutating original', () => {
  const { migrateData } = require('../../src/services/storage/repository.ts');
  const source = pattern(); source.instructions[0].expectedStitchCount = 2;
  const p = createProject(source); p.rows[0].count = 8;
  p.undo = { currentRowIndex: 0, rows: p.rows.map(r => ({ ...r })) };
  const migrated = migrateData({ ...emptyData(), projects: [p] }).projects[0];
  assert.equal(migrated.rows[0].count, 2); assert.equal(migrated.undoHistory[0].rows[0].count, 2);
  assert.equal(migrated.id, p.id); assert.equal(migrated.patternSnapshot.title, source.title);
  assert.doesNotThrow(() => decodeData(JSON.stringify({ ...emptyData(), projects: [migrated] })));
  assert.equal(p.rows[0].count, 8);
});

test('materials and favorites survive restart and stay isolated in project snapshots', () => {
  const source = { ...pattern(), yarnColors: ['Cream', 'Blush'], hookSizes: ['3 mm', '4 mm'], otherTools: 'Yarn needle', favorite: true };
  source.instructions[0] = { ...source.instructions[0], part: 'Ears', yarnColor: 'Blush', hookSize: '3 mm' };
  const p = createProject(source);
  source.yarnColors[0] = 'Olive'; source.instructions[0].part = 'Arms';
  const loaded = decodeData(JSON.stringify({ ...emptyData(), patterns: [source], projects: [p] }));
  assert.equal(loaded.patterns[0].favorite, true);
  assert.equal(loaded.projects[0].patternSnapshot.yarnColors[0], 'Cream');
  assert.equal(loaded.projects[0].patternSnapshot.instructions[0].part, 'Ears');
  for (const invalid of [{ yarnColors: [12] }, { hookSizes: '3 mm' }, { favorite: 'yes' }]) {
    assert.throws(() => decodeData(JSON.stringify({ ...emptyData(), patterns: [{ ...source, ...invalid }] })));
  }
});

test('restart restores row, count, snapshot, preferences and latest Undo', () => {
  const p = complete(plus(createProject(pattern())));
  const data = { ...emptyData(), projects: [p], patterns: [pattern()] };
  const loaded = decodeData(JSON.stringify(data)); assert.deepEqual(loaded, data);
  const undone = updateProgress(loaded.projects[0], { type: 'undo' });
  assert.equal(undone.currentRowIndex, 0); assert.equal(undone.rows[0].count, 1);
});

test('empty storage initializes; corruption and invalid progress are rejected', () => {
  assert.deepEqual(decodeData(null), emptyData()); assert.throws(() => decodeData('broken'));
  const p = createProject(pattern()); p.rows[0].count = -1;
  assert.throws(() => decodeData(JSON.stringify({ ...emptyData(), projects: [p] })));
  assert.throws(() => decodeData(JSON.stringify({ ...emptyData(), version: 99 })));
});

test('serialized saves never overlap and retain latest rapid count', async () => {
  let stored; let active = 0; let maxActive = 0;
  const writer = new SerializedWriter(async raw => {
    active++; maxActive = Math.max(maxActive, active);
    await new Promise(resolve => setTimeout(resolve, 1)); stored = raw; active--;
  });
  let p = createProject(pattern()); const writes = [];
  for (let i = 0; i < 80; i++) { p = plus(p); writes.push(writer.enqueue({ ...emptyData(), projects: [p] })); }
  await Promise.all(writes); assert.equal(maxActive, 1); assert.equal(decodeData(stored).projects[0].rows[0].count, 80);
});

test('failed write reports failure and a retry can persist latest state', async () => {
  let fail = true; let stored = null;
  const writer = new SerializedWriter(async raw => { if (fail) throw Error('disk full'); stored = raw; });
  await assert.rejects(writer.enqueue(emptyData())); assert.equal(stored, null);
  fail = false; const data = { ...emptyData(), projects: [plus(createProject(pattern()))] };
  await writer.enqueue(data); assert.deepEqual(decodeData(stored), data);
});

test('interrupted pending save retains last successfully saved progress', async () => {
  let stored; let release;
  const writer = new SerializedWriter(async raw => { stored = raw; });
  const first = { ...emptyData(), projects: [plus(createProject(pattern()))] };
  await writer.enqueue(first);
  const pending = new SerializedWriter(async raw => { await new Promise(resolve => { release = resolve; }); stored = raw; });
  const newer = { ...first, projects: [plus(first.projects[0])] };
  const promise = pending.enqueue(newer); await Promise.resolve(); await Promise.resolve();
  assert.equal(decodeData(stored).projects[0].rows[0].count, 1);
  release(); await promise; assert.equal(decodeData(stored).projects[0].rows[0].count, 2);
});

test('project favorites persist independently and legacy projects remain readable', () => {
  const source = pattern();
  const project = createProject(source);
  const load = value => decodeData(JSON.stringify({ ...emptyData(), patterns: [source], projects: [value] }));
  assert.equal(load(project).projects[0].favorite, undefined);
  const saved = load({ ...project, favorite: true });
  assert.equal(saved.projects[0].favorite, true);
  assert.equal(saved.patterns[0].favorite, source.favorite);
  assert.equal(load({ ...project, favorite: false }).projects[0].favorite, false);
  assert.throws(() => load({ ...project, favorite: 'yes' }));
});

test('photo framing survives restart and is copied into project snapshots',()=>{
 const source={...pattern(),imageUri:'file:///photo.jpg',photoCrop:{width:1200,height:600,x:-0.5,y:0.2,zoom:2}};
 const project=createProject(source);
 source.photoCrop.x=1;
 const loaded=decodeData(JSON.stringify({...emptyData(),patterns:[source],projects:[project]}));
 assert.equal(loaded.patterns[0].photoCrop.x,1);
 assert.equal(loaded.projects[0].patternSnapshot.photoCrop.x,-0.5);
 for(const photoCrop of [{...source.photoCrop,zoom:0},{...source.photoCrop,width:-1}]) assert.throws(()=>decodeData(JSON.stringify({...emptyData(),patterns:[{...source,photoCrop}]})));
});
