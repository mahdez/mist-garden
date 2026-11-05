'use strict';
const held=[];
const KEY={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'};
function doFacing(){if(mode!=='map'||P.moving)return;const[x,y]=facing();act(x,y)}
addEventListener('keydown',e=>{
  if(e.target.matches&&e.target.matches('textarea,input')&&e.key!=='Escape')return;
  const d=KEY[e.key],ok=e.key==='Enter'||e.key===' '||e.key==='z'||e.key==='Z',no=e.key==='Escape'||e.key==='x'||e.key==='X',num=['1','2','3','4','5','6','7','8','9'].indexOf(e.key);
  if(num>=0&&mode==='map'&&G){const k=unlockedCrops()[num];if(k){G.sel=k;sfx.move();renderSeeds();mapHint()}return}
  if(!(d||ok||no))return;
  if(e.target.closest&&e.target.closest('#foot,#seeds')&&ok)return;
  e.preventDefault();
  if(UI){
    if(e.repeat&&ok)return;
    if(d)UI.move(DIRS[d][0],DIRS[d][1]);else if(ok)UI.confirm();else UI.cancel();
    return;
  }
  if(d){if(!held.includes(d))held.push(d)}
  else if(!e.repeat){if(ok)doFacing();else fieldMenu()}
});
addEventListener('keyup',e=>{const d=KEY[e.key];if(d){const i=held.indexOf(d);if(i>=0)held.splice(i,1)}});
addEventListener('blur',()=>{held.length=0});
cv.addEventListener('pointerdown',e=>{
  cv.focus({preventScroll:true});
  const r=cv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*20),y=Math.floor((e.clientY-r.top)/r.height*15);
  clickMap(x,y);
});
document.querySelectorAll('#dpad button').forEach(b=>{
  const d=b.dataset.d,off=()=>{const i=held.indexOf(d);if(i>=0)held.splice(i,1)};
  b.addEventListener('pointerdown',e=>{e.preventDefault();held.length=0;held.push(d)});
  ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,off));
});
$('#btnAct').addEventListener('click',doFacing);
$('#btnMenu').addEventListener('click',fieldMenu);
function paintMute(){$('#mute').textContent=muted?'เสียง: ปิด':'เสียง: เปิด'}
$('#mute').addEventListener('click',()=>{muted=!muted;try{localStorage.setItem('mg-mute',muted?'1':'0')}catch(e){}paintMute();$('#mute').blur();sfx.ok()});
paintMute();
addEventListener('pagehide',flushSave);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushSave()});
