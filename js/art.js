'use strict';
function mk(w,h){const e=document.createElement('canvas');e.width=w;e.height=h;return e}
function seeded(s){return ()=>(s=(s*1664525+1013904223)>>>0)/4294967296}
function tile(fn){const e=mk(T,T),g=e.getContext('2d');fn((x,y,w,h,k)=>{g.fillStyle=k;g.fillRect(x,y,w,h)});return e}
function speck(P,base,cols,n,seed){P(0,0,T,T,base);const r=seeded(seed);for(let i=0;i<n;i++)P(r()*T|0,r()*T|0,1,1,cols[r()*cols.length|0])}
const grass=P=>speck(P,'#4c8a52',['#437c49','#589a5e','#3c7042'],16,7);
const TILES={
  '.':tile(grass),
  ',':tile(P=>speck(P,'#b59a63',['#a48a55','#c4ab74','#94794a'],14,11)),
  'T':tile(P=>{grass(P);P(6,11,4,5,'#54351f');P(2,2,12,9,'#22643e');P(1,4,14,6,'#22643e');P(4,0,8,3,'#22643e');P(3,2,7,3,'#318452');P(5,1,4,2,'#42a067');P(10,7,3,2,'#1b5433')}),
  'R':tile(P=>{P(0,0,T,T,'#8c5a35');for(let y=0;y<T;y+=4){P(0,y,T,1,'#6e4527');P(y%8?2:9,y+1,5,1,'#a87245')}}),
  'W':tile(P=>{P(0,0,T,T,'#d9c6a0');P(0,0,T,2,'#7a5636');P(0,14,T,2,'#7a5636');P(0,0,2,T,'#7a5636');P(14,0,2,T,'#7a5636');P(6,5,4,5,'#3d5a78');P(6,5,4,1,'#ffe29a')}),
  'D':tile(P=>{P(0,0,T,T,'#d9c6a0');P(0,0,T,2,'#7a5636');P(3,3,10,13,'#5a3820');P(4,4,8,12,'#7f5230');P(10,10,1,2,'#ffd65e')}),
  'a':tile(P=>{for(let x=0;x<T;x+=8){P(x,0,4,T,'#d9534a');P(x+4,0,4,T,'#f3e6cd')}P(0,14,T,2,'#00000030')}),
  'c':tile(P=>{P(0,0,T,T,'#8a6238');P(0,0,T,3,'#b3854e');P(0,8,T,1,'#6e4c2a');P(3,1,2,2,'#f28a2c');P(9,1,3,2,'#d9413f')}),
  'b':tile(P=>{grass(P);P(1,5,14,10,'#8a6238');P(1,5,14,2,'#b3854e');P(1,10,14,1,'#6e4c2a');P(7,3,2,4,'#ffcf6b')}),
  'o':tile(P=>{grass(P);P(3,5,10,10,'#7d8590');P(5,7,6,6,'#2f5d8a');P(5,7,6,1,'#7fb8e8');P(2,2,12,2,'#7a5636');P(3,4,1,3,'#54351f');P(12,4,1,3,'#54351f')}),
};
const WATER=[0,1].map(f=>tile(P=>{P(0,0,T,T,'#3572b0');P(2+f*3,4,5,1,'#7fb8e8');P(9-f*4,10,4,1,'#7fb8e8');P(1,13-f,3,1,'#4d8ccb')}));
const METEOR=[0,1].map(f=>{const e=mk(32,32),g=e.getContext('2d'),F=(x,y,w,h,k)=>{g.fillStyle=k;g.fillRect(x,y,w,h)},r=seeded(23),glow=f?'#e6d8ff':'#c4a8f5';
  F(2,22,28,8,'#5a4129');F(0,25,32,4,'#5a4129');F(8,5,16,24,'#3b3050');F(4,9,24,18,'#3b3050');F(2,14,28,10,'#3b3050');F(9,6,9,3,'#544670');F(5,10,7,4,'#544670');
  for(let i=0;i<46;i++)F(4+r()*24|0,7+r()*20|0,2,1,r()>.5?'#2b2240':'#4a3d63');
  F(15,9,2,5,glow);F(12,13,4,2,glow);F(11,15,2,6,glow);F(17,14,5,2,glow);F(21,15,2,5,glow);F(16,19,2,6,glow);
  return e});
const DIRT=[0,1].map(w=>tile(P=>{const b=w?'#4a3424':'#7c5c3a',l=w?'#5a4130':'#8e6d48',d=w?'#3b2a1c':'#6a4d30';P(0,0,T,T,b);for(let y=2;y<T;y+=5){P(1,y,14,1,d);P(1,y+1,14,1,l)}P(0,0,T,1,d);P(0,0,1,T,d)}));
const LOCKED=tile(P=>{grass(P);P(1,5,1,8,'#7a5636');P(14,5,1,8,'#7a5636');P(1,7,14,1,'#8e6a43');P(1,10,14,1,'#8e6a43')});
const CROPART={};
function cropArt(kind,stage){
  const k=kind+stage;if(CROPART[k])return CROPART[k];
  const leaf='#4fae56',dark='#2f7f3e';
  return CROPART[k]=tile(P=>{
    if(stage===0){P(7,9,2,2,'#e6d3a0');return}
    if(stage===1){P(7,8,2,5,leaf);P(5,7,3,2,leaf);P(8,6,3,2,dark);return}
    if(stage===2){
      P(7,5,2,8,dark);P(4,5,4,2,leaf);P(8,3,4,2,leaf);P(5,9,3,2,leaf);P(8,8,3,2,dark);
      if(kind==='pumpkin'){P(9,11,4,3,'#7fae3f')}
      return;
    }
    if(kind==='carrot'){P(4,1,2,6,leaf);P(7,0,2,7,dark);P(10,1,2,6,leaf);P(4,6,8,3,'#f28a2c');P(5,9,6,3,'#e87d22');P(6,12,4,2,'#c9651a');P(5,7,2,1,'#ffb45e')}
    if(kind==='tomato'){P(7,1,2,13,dark);P(3,3,10,2,leaf);P(3,8,10,2,leaf);[[3,5],[10,4],[9,10],[3,11]].forEach(([x,y])=>{P(x,y,4,4,'#d9413f');P(x+1,y,1,1,'#ff8a7a')})}
    if(kind==='spinach'){P(7,6,2,8,dark);P(2,3,5,4,leaf);P(9,2,5,5,leaf);P(4,8,3,3,dark);P(9,8,4,3,leaf);P(3,4,2,1,'#7fd483')}
    if(kind==='chili'){P(7,1,2,12,dark);P(3,3,10,2,leaf);[[3,5],[6,7],[10,5],[12,8]].forEach(([x,y])=>{P(x,y,2,5,'#d9302c');P(x,y,1,1,'#3fa34d')})}
    if(kind==='garlic'){P(6,0,1,7,leaf);P(9,1,1,6,leaf);P(4,7,8,6,'#f4efe2');P(3,9,10,3,'#f4efe2');P(7,7,1,6,'#b9a9c9');P(5,13,6,1,'#b9a9c9')}
    if(kind==='sweetpotato'){P(3,2,4,3,leaf);P(9,2,4,3,dark);P(7,3,2,5,dark);P(3,8,10,5,'#8a4a8f');P(5,7,6,7,'#8a4a8f');P(5,9,2,1,'#c08ac6')}
    if(kind==='ginger'){P(6,0,1,6,leaf);P(9,1,1,5,dark);P(3,6,10,6,'#c9a35a');P(1,8,3,3,'#c9a35a');P(12,9,3,3,'#c9a35a');P(5,12,4,2,'#a07f3e');P(5,7,2,1,'#e6cf94')}
    if(kind==='broccoli'){P(7,9,2,5,'#7fbf6a');P(3,3,10,6,'#2f8f46');P(2,5,12,3,'#2f8f46');P(5,1,6,3,'#2f8f46');P(4,4,2,1,'#7fd483');P(9,2,2,1,'#7fd483');P(11,6,2,1,'#7fd483')}
    if(kind==='pumpkin'){P(7,1,2,4,dark);P(3,2,5,2,leaf);P(2,5,12,9,'#e88a2a');P(1,7,14,5,'#e88a2a');for(const x of[4,7,10])P(x,5,1,9,'#b5621a');P(3,6,2,1,'#ffb45e')}
  });
}
function spriteFrom(def,alt,flash){
  const pal={...def.pal,...(alt||{})},w=Math.max(...def.rows.map(r=>r.length)),e=mk(w,def.rows.length),g=e.getContext('2d');
  def.rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(!pal[ch])return;g.fillStyle=flash?'#ffffff':pal[ch];g.fillRect(x,y,1,1)}));
  return e;
}
const SPC={};for(const k in SPR)SPC[k]={n:spriteFrom(SPR[k]),r:spriteFrom(SPR[k],SPR[k].gold),f:spriteFrom(SPR[k],null,true)};
const charCache={};
function look(){
  const id=s=>G&&G.equip[s]?itemCrop(G.equip[s]):null;
  return {shirt:id('shirt'),hat:id('hat'),weapon:id('weapon')};
}
function charSprite(l,dir,step){
  const key=[l.shirt,l.hat,l.weapon,dir,step].join();if(charCache[key])return charCache[key];
  const e=mk(T,T),g=e.getContext('2d');
  const P=(x,y,w,h,k)=>{g.fillStyle=k;g.fillRect(x,y,w,h)};
  const flip=dir==='right',d=flip?'left':dir,skin='#f0c39a',legs='#3b4f7a',hair='#5a3a22',cloth=l.shirt?GEAR[l.shirt].cloth:'#3f6ea8';
  P(4,9,8,4,cloth);
  if(!l.shirt){P(5,9,1,4,'#e8d9b0');P(10,9,1,4,'#e8d9b0')}
  if(l.shirt==='pumpkin'){P(6,9,1,4,'#8a5118');P(9,9,1,4,'#8a5118')}
  if(d==='down'||d==='up'){P(3,9,1,3,skin);P(12,9,1,3,skin);P(5,13,2,step===1?1:3,legs);P(9,13,2,step===2?1:3,legs)}
  else{P(7,9,2,3,skin);P(6,13,step===1?1:2,3,legs);P(9,13,step===2?1:2,3,legs)}
  P(4,2,8,7,skin);
  if(d==='up')P(4,1,8,7,hair);
  else{P(4,2,8,2,hair);if(d==='down'){P(6,5,1,2,'#222');P(9,5,1,2,'#222')}else{P(5,5,1,2,'#222');P(10,2,3,6,hair)}}
  if(!l.hat){P(2,3,12,1,'#e3c56c');P(4,1,8,2,'#d9b860');P(4,2,8,1,'#a8793a')}
  if(l.hat==='carrot'){P(4,2,8,2,'#f28a2c');P(3,3,10,1,'#c9651a');P(4,0,2,2,'#4fae56');P(7,0,2,2,'#2f7f3e');P(10,0,2,2,'#4fae56')}
  if(l.hat==='tomato'){P(3,1,10,3,'#d9413f');P(4,1,2,1,'#ff8a7a');P(5,0,6,2,'#3fa34d')}
  if(l.hat==='pumpkin'){P(2,0,12,5,'#e88a2a');for(const x of[5,8,11])P(x,0,1,5,'#b5621a');P(7,0,2,1,'#3f8a3a')}
  if(l.hat&&GEAR[l.hat].art){const a=GEAR[l.hat].art;P(3,1,10,3,a.hat);P(5,0,6,1,a.hat2);P(4,1,2,1,a.hat2)}
  if(d==='left'){
    if(!l.weapon){P(1,4,1,10,'#9c6b3a');P(0,3,3,2,'#bfc6cf')}
    if(l.weapon==='carrot'){P(1,2,2,9,'#f28a2c');P(1,1,1,1,'#ffb45e');P(0,11,4,1,'#3fa34d');P(1,12,2,2,'#3fa34d')}
    if(l.weapon==='tomato'){P(1,6,1,8,'#9c6b3a');P(0,2,4,4,'#d9413f');P(1,2,2,1,'#3fa34d')}
    if(l.weapon==='pumpkin'){P(1,7,1,7,'#7a4a20');P(0,2,4,5,'#e88a2a');P(1,2,1,5,'#b5621a')}
    if(l.weapon&&GEAR[l.weapon].art){P(1,7,1,7,'#7a4a20');P(0,2,3,5,GEAR[l.weapon].art.weapon)}
  }
  if(flip){const f=mk(T,T),h=f.getContext('2d');h.translate(T,0);h.scale(-1,1);h.drawImage(e,0,0);return charCache[key]=f}
  return charCache[key]=e;
}
const DIGITS={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111','+':'000010111010000'};
function drawNum(t,x,y,col,sc=2){
  t=String(t);const w=t.length*4*sc;x=Math.round(x-w/2);y=Math.round(y);
  for(const[ox,oy,k]of[[1,0,'#000'],[-1,0,'#000'],[0,1,'#000'],[0,-1,'#000'],[0,0,col]]){
    c.fillStyle=k;
    [...t].forEach((ch,i)=>{const m=DIGITS[ch];if(!m)return;for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(m[r*3+q]==='1')c.fillRect(x+i*4*sc+q*sc+ox,y+r*sc+oy,sc,sc)});
  }
}

