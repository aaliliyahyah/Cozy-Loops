const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
// Compile only our pure TypeScript modules; no React Native runtime is needed.
Module._extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createProject, updateProgress, isUsable } = require('../src/features/projects/progress.ts');
const { emptyData, decodeData, SerializedWriter } = require('../src/services/repository.ts');
function pattern() {
  const now = new Date().toISOString();
  return { id: 'pattern-1', title: 'Practice square', rowType: 'row', status: 'ready',
    instructions: ['6 sc', 'inc x 6', 'sc across'].map((instructionText, i) => ({ id: `row-${i}`, rowNumber: i + 1, instructionText })), createdAt: now, updatedAt: now };
}
const plus = p => updateProgress(p, { type: 'count', delta: 1 });
const complete = p => updateProgress(p, { type: 'completeRow' });

test('targets cap rapid increments, including a zero target', () => {
  const source = pattern(); source.instructions[0].expectedStitchCount = 3;
  let p = createProject(source); for (let i = 0; i < 100; i++) p = plus(p);
  assert.equal(p.rows[0].count, 3); assert.equal(plus(p), p);
  source.instructions[0].expectedStitchCount = 0;
  p = createProject(source); assert.equal(plus(p), p);
});

test('repeated Undo crosses row completion and persists until exhausted', () => {
  let p = plus(complete(plus(createProject(pattern()))));
  p = decodeData(JSON.stringify({ ...emptyData(), projects: [p] })).projects[0];
  p = updateProgress(p, { type: 'undo' }); assert.equal(p.rows[1].count, 0);
  p = updateProgress(p, { type: 'undo' }); assert.equal(p.currentRowIndex, 0); assert.equal(p.rows[0].completed, false);
  p = updateProgress(p, { type: 'undo' }); assert.equal(p.rows[0].count, 0);
  assert.equal(updateProgress(p, { type: 'undo' }), p);
});

test('history is bounded and invalid histories are rejected', () => {
  let p = createProject(pattern()); for (let i = 0; i < 130; i++) p = plus(p);
  assert.equal(p.undoHistory.length, 100);
  for (let i = 0; i < 100; i++) p = updateProgress(p, { type: 'undo' });
  assert.equal(p.rows[0].count, 30);
  p.undoHistory = [{ currentRowIndex: 1000, rows: [] }];
  assert.throws(() => decodeData(JSON.stringify({ ...emptyData(), projects: [p] })));
});

test('legacy migration caps active counts and Undo without mutating original', () => {
  const { migrateData } = require('../src/services/repository.ts');
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
