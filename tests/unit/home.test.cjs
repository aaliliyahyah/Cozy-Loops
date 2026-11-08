require('../helpers/register-typescript.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {homeProjects}=require('../../src/features/home/model/projects.ts');
test('home prioritizes recent active projects and excludes deleted items',()=>{
 const projects=[
  {id:'finished',status:'completed',updatedAt:'2026-11-10'},
  {id:'old',status:'active',updatedAt:'2026-10-01'},
  {id:'deleted',status:'active',updatedAt:'2026-11-12',deletedAt:'2026-11-12'},
  {id:'recent',status:'active',updatedAt:'2026-11-08'},
 ];
 assert.deepEqual(homeProjects(projects).map(p=>p.id),['recent','old','finished']);
 assert.equal(projects[0].id,'finished');
 assert.deepEqual(homeProjects([]),[]);
});
