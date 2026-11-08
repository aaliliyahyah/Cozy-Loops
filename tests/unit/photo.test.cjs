require('../helpers/register-typescript.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {photoLayout,movePhoto,zoomPhoto,validPhotoCrop}=require('../../src/features/patterns/model/photo.ts');
test('photo framing covers every preview size without exposing empty edges',()=>{
 for(const [width,height] of [[1200,600],[600,1200],[800,800]]) for(const zoom of [1,2,4]) for(const x of [-1,0,1]) for(const y of [-1,0,1]) for(const [viewW,viewH] of [[300,300],[340,190],[86,94]]) {
  const layout=photoLayout({width,height,zoom,x,y},viewW,viewH);
  assert.ok(layout.left<=0.0001 && layout.top<=0.0001);
  assert.ok(layout.left+layout.width>=viewW-0.0001);
  assert.ok(layout.top+layout.height>=viewH-0.0001);
 }
});
test('drag and zoom stay in bounds and do not change the source framing',()=>{
 const crop={width:1200,height:600,x:0,y:0,zoom:1};
 const moved=movePhoto(crop,10000,-10000,300);
 assert.equal(moved.x,-1); assert.equal(moved.y,0);
 assert.equal(zoomPhoto(crop,0).zoom,1); assert.equal(zoomPhoto(crop,9).zoom,4);
 assert.equal(crop.x,0);
 assert.equal(validPhotoCrop(crop),true);
 for(const change of [{width:0},{zoom:0},{zoom:5},{x:2},{y:NaN}]) assert.equal(validPhotoCrop({...crop,...change}),false);
});

test('two fingers zoom in and out while keeping their focal point fixed',()=>{
 const {gesturePhoto}=require('../../src/features/patterns/model/photo.ts');
 const crop={width:1000,height:1000,x:0,y:0,zoom:1};
 const start=[{x:50,y:150},{x:150,y:150}];
 const spread=[{x:0,y:150},{x:200,y:150}];
 const enlarged=gesturePhoto(crop,start,spread,300);
 assert.equal(enlarged.zoom,2);
 const layout=photoLayout(enlarged,300,300);
 const sourceX=1000/3;
 assert.ok(Math.abs(layout.left+sourceX*layout.width/1000-100)<0.0001);
 const reduced=gesturePhoto(enlarged,spread,start,300);
 assert.equal(reduced.zoom,1);
 assert.equal(reduced.x,0); assert.equal(reduced.y,0);
});
test('pinching and dragging respect bounds and changes in finger count',()=>{
 const {gesturePhoto}=require('../../src/features/patterns/model/photo.ts');
 const crop={width:1200,height:600,x:0,y:0,zoom:2};
 const before=[{x:100,y:100},{x:200,y:200}];
 const after=[{x:0,y:0},{x:900,y:900}];
 const enlarged=gesturePhoto(crop,before,after,300);
 assert.equal(enlarged.zoom,4);
 assert.ok(validPhotoCrop(enlarged));
 const panned=gesturePhoto(crop,[{x:100,y:100}],[{x:120,y:130}],300);
 const expected=movePhoto(crop,20,30,300);
 assert.ok(Math.abs(panned.x-expected.x)<1e-10);
 assert.ok(Math.abs(panned.y-expected.y)<1e-10);
 assert.equal(panned.zoom,expected.zoom);
 assert.equal(gesturePhoto(crop,before,[{x:100,y:100}],300),crop);
 assert.equal(gesturePhoto(crop,[],after,300),crop);
 assert.equal(gesturePhoto(crop,[{x:1,y:1},{x:1,y:1}],after,300),crop);
});
