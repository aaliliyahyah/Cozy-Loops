require('../helpers/register-typescript.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pattern,plus,complete,createProject,updateProgress,isUsable}=require('../helpers/fixtures.cjs');
const {emptyData,decodeData}=require('../../src/services/storage/repository.ts');
const {restartProject}=require('../../src/features/projects/model/progress.ts');
const {displayTitle}=require('../../src/utils/title.ts');

test('title fallback trims names and consistently displays untitled', () => {
  assert.equal(displayTitle(), 'untitled');
  assert.equal(displayTitle(''), 'untitled');
  assert.equal(displayTitle(' \t\n '), 'untitled');
  assert.equal(displayTitle('  Cozy basket  '), 'Cozy basket');
});

test('redo creates independent progress from the finished snapshot after library changes', () => {
  const source = pattern();
  let finished = createProject(source);
  for (let index = 0; index < finished.rows.length; index++) finished = complete(plus(finished));
  finished = updateProgress(finished, { type: 'finish' });
  finished.favorite = true;
  const before = structuredClone(finished);
  source.instructions[0].instructionText = 'Edited library instructions';
  source.deletedAt = new Date().toISOString();
  const restarted = restartProject(finished, '  Second basket  ');
  assert.equal(restarted.name, 'Second basket');
  assert.notEqual(restarted.id, finished.id);
  assert.equal(restarted.patternId, finished.patternId);
  assert.equal(restarted.status, 'active');
  assert.equal(restarted.currentRowIndex, 0);
  assert.deepEqual(restarted.rows, finished.rows.map(() => ({ count: 0, completed: false })));
  assert.deepEqual(restarted.patternSnapshot, finished.patternSnapshot);
  for (const field of ['completedAt', 'undo', 'undoHistory', 'deletedAt', 'favorite']) assert.equal(restarted[field], undefined);
  assert.ok(!Number.isNaN(Date.parse(restarted.createdAt)));
  assert.equal(restarted.updatedAt, restarted.createdAt);
  assert.deepEqual(finished, before);
  const decoded = decodeData(JSON.stringify({ ...emptyData(), projects: [finished, restarted] }));
  assert.deepEqual(decoded.projects[0], JSON.parse(JSON.stringify(finished)));
  assert.deepEqual(decoded.projects[1], restarted);
  restarted.patternSnapshot.instructions[0].instructionText = 'Independent copy';
  restarted.rows[0].count = 4;
  assert.deepEqual(finished, before);
});

test('redo requires a name and an available finished project with saved instructions', () => {
  const active = createProject(pattern());
  const finished = { ...active, status: 'completed', completedAt: new Date().toISOString() };
  for (const name of ['', ' \t\n ']) assert.throws(() => restartProject(finished, name), /project name/i);
  assert.throws(() => restartProject(active, 'Again'), /finished project/i);
  assert.throws(() => restartProject({ ...finished, deletedAt: new Date().toISOString() }, 'Again'), /finished project/i);
  assert.throws(() => restartProject({ ...finished, patternSnapshot: { ...finished.patternSnapshot, instructions: [] } }, 'Again'), /saved instructions/i);
  const legacy = { ...finished, name: '', patternSnapshot: { ...finished.patternSnapshot, title: '' } };
  const restarted = restartProject(legacy, 'Named project');
  assert.equal(restarted.name, 'Named project');
  assert.equal(restarted.patternSnapshot.title, '');
  assert.equal(displayTitle(restarted.patternSnapshot.title), 'untitled');
});

test('targets cap rapid increments, including a zero target', () => {
  const source = pattern(); source.instructions[0].expectedStitchCount = 3;
  let p = createProject(source); for (let i = 0; i < 100; i++) p = plus(p);
  assert.equal(p.rows[0].count, 3); assert.equal(plus(p), p);
  source.instructions[0].expectedStitchCount = 0;
  p = createProject(source); assert.equal(plus(p), p);
});

test('Undo restores only the latest move and remains exhausted after reload', () => {
  let p = plus(complete(plus(createProject(pattern()))));
  p = decodeData(JSON.stringify({ ...emptyData(), projects: [p] })).projects[0];
  p = updateProgress(p, { type: 'undo' });
  assert.equal(p.rows[1].count, 0);
  assert.equal(p.currentRowIndex, 1);
  assert.equal(p.rows[0].completed, true);
  assert.equal(updateProgress(p, { type: 'undo' }), p);
  p = decodeData(JSON.stringify({ ...emptyData(), projects: [p] })).projects[0];
  assert.equal(updateProgress(p, { type: 'undo' }), p);
});

test('only one undo snapshot is kept and legacy histories cannot be unwound repeatedly', () => {
  let p = createProject(pattern()); for (let i = 0; i < 130; i++) p = plus(p);
  assert.equal(p.undoHistory.length, 1);
  p = updateProgress(p, { type: 'undo' });
  assert.equal(p.rows[0].count, 129);
  assert.equal(updateProgress(p, { type: 'undo' }), p);
  p.undoHistory = [{ currentRowIndex: 1000, rows: [] }];
  assert.throws(() => decodeData(JSON.stringify({ ...emptyData(), projects: [p] })));
});

test('navigation keeps history intact and finishing clears it', () => {
  let p = plus(createProject(pattern()));
  const history = p.undoHistory;
  p = updateProgress(p, { type: 'navigate', index: 1 }); assert.equal(p.undoHistory, history);
  p = updateProgress(p, { type: 'navigate', index: 0 });
  p = complete(complete(complete(p)));
  p = updateProgress(p, { type: 'finish' }); assert.deepEqual(p.undoHistory, []);
});

test('1000 rapid count actions preserve every increment', () => {
  let p = createProject(pattern()); for (let i = 0; i < 1000; i++) p = plus(p);
  assert.equal(p.rows[0].count, 1000); assert.equal(p.undo.rows[0].count, 999);
});

test('zero decrement is a no-op and does not consume Undo', () => {
  let p = createProject(pattern()); assert.equal(updateProgress(p, { type: 'count', delta: -1 }), p);
  p = updateProgress(plus(p), { type: 'count', delta: -1 });
  const unchanged = updateProgress(p, { type: 'count', delta: -1 });
  assert.equal(unchanged, p); assert.equal(updateProgress(p, { type: 'undo' }).rows[0].count, 1);
});

test('row completion advances and Undo restores count, row and completion', () => {
  let p = plus(plus(createProject(pattern()))); p = complete(p);
  assert.equal(p.currentRowIndex, 1); assert.equal(p.rows[0].completed, true);
  p = updateProgress(p, { type: 'undo' });
  assert.equal(p.currentRowIndex, 0); assert.equal(p.rows[0].count, 2); assert.equal(p.rows[0].completed, false);
  assert.equal(p.undo, undefined);
});

test('returning to rows restores independent counts', () => {
  let p = complete(plus(createProject(pattern()))); p = plus(plus(p));
  p = updateProgress(p, { type: 'navigate', index: 0 }); assert.equal(p.rows[0].count, 1);
  p = updateProgress(p, { type: 'navigate', index: 1 }); assert.equal(p.rows[1].count, 2);
});

test('pattern changes cannot alter project snapshot; projects are independent', () => {
  const source = pattern(); const a = createProject(source); const b = createProject(source);
  source.instructions[0].instructionText = 'changed';
  assert.equal(a.patternSnapshot.instructions[0].instructionText, '6 sc');
  assert.notEqual(a.id, b.id); assert.equal(plus(a).rows[0].count, 1); assert.equal(b.rows[0].count, 0);
});

test('final row does not automatically finish; finish requires all rows', () => {
  let p = createProject(pattern()); assert.equal(updateProgress(p, { type: 'finish' }), p);
  p = complete(complete(complete(p))); assert.equal(p.status, 'active');
  p = updateProgress(p, { type: 'finish' }); assert.equal(p.status, 'completed'); assert.ok(p.completedAt);
  assert.equal(plus(p), p);
});

test('drafts and empty rows cannot start projects; totals are optional', () => {
  const p = pattern(); assert.equal(isUsable(p), true);
  assert.throws(() => createProject({ ...p, status: 'draft' }));
  p.instructions[0].instructionText = ''; assert.equal(isUsable(p), false);
});
