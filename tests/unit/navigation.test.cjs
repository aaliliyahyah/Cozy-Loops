require('../helpers/register-typescript.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {originTarget}=require('../../src/components/navigation/origin.ts');
test('back destinations preserve the launching tab',()=>{
 for(const [origin,target] of Object.entries({home:'/(tabs)',patterns:'/(tabs)/patterns',add:'/(tabs)/add',projects:'/(tabs)/count',count:'/(tabs)/count',glossary:'/(tabs)/glossary'})) assert.equal(originTarget(origin),target);
 assert.equal(originTarget(['home','patterns']),'/(tabs)');
 assert.equal(originTarget(undefined,'/(tabs)/patterns'),'/(tabs)/patterns');
 assert.equal(originTarget('unknown','/(tabs)/glossary'),'/(tabs)/glossary');
});
