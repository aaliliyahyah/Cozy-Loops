require('./register-typescript.cjs');
const {isUsable}=require('../../src/features/patterns/model/pattern.ts');
const {createProject,updateProgress} = require('../../src/features/projects/model/progress.ts');
function pattern() {
  const now = new Date().toISOString();
  return { id: 'pattern-1', title: 'Practice square', rowType: 'row', status: 'ready',
    instructions: ['6 sc', 'inc x 6', 'sc across'].map((instructionText, i) => ({ id: `row-${i}`, rowNumber: i + 1, instructionText })), createdAt: now, updatedAt: now };
}
const plus=p=>updateProgress(p,{type:'count',delta:1});
const complete=p=>updateProgress(p,{type:'completeRow'});
module.exports={pattern,plus,complete,createProject,updateProgress,isUsable};
