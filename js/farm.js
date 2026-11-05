'use strict';
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const inCrater=()=>G&&G.area==='crater';
const tileAt=(x,y)=>{const m=inCrater()?CRATER_MAP:MAP;return m[y]&&m[y][x]||null};
function blocked(x,y){
  const t=tileAt(x,y);
  if(inCrater())return !t||CRATER_SOLID.includes(t)||!!craterThing(x,y);
  return !t||SOLID.includes(t);
}
const facing=()=>{const[d,e]=DIRS[P.dir];return[P.x+d,P.y+e]};
function describe(x,y){
  if(inCrater())return craterDescribe(x,y);
  const t=tileAt(x,y),p=plotAt(x,y);
  if(p){
    if(!p.unlocked)return 'ที่ดินยังไม่ได้ซื้อ ซื้อเพิ่มได้ที่ร้าน';
    const s=G.plots[p.i];if(!s.c)return G.seeds[G.sel]>0?`Enter: ปลูก${CROPS[G.sel].name}`:`เมล็ด${CROPS[G.sel].name}หมด ซื้อได้ที่ร้าน`;
    const k=CROPS[s.c];
    if(s.mutant)return `Enter: กลับไปสู้${s.mutant==='rare'?`${k.name}ทองคำ`:MONSTERS[s.c].name}`;
    if(s.g>=k.days)return `Enter: เก็บเกี่ยว${k.name}`;
    return s.w?`${k.name} รดน้ำแล้ว อีก ${k.days-s.g} วันจะโต`:`Enter: รดน้ำ${k.name}`;
  }
  if(t==='D')return 'Enter: เข้านอน ไปวันถัดไป';
  if(t==='a'||t==='c')return 'Enter: ซื้อของที่ร้าน';
  if(t==='b')return 'Enter: ขายผัก';
  if(t==='M')return 'Enter: ลงไปในหลุมอุกกาบาต';
  if(t==='o')return 'Enter: ดูบ่อน้ำ';
  if(t==='~')return 'Enter: ดูแลบ่อปลา';
  return null;
}
function mapHint(){
  if(!G||mode!=='map')return;
  const[x,y]=facing(),d=describe(x,y);
  $('#who').textContent='';
  $('#hint').textContent=d||'คลิกช่องบนจอเพื่อเดินไปทำงาน หรือใช้ลูกศร · Enter ทำงาน · 1-9 เลือกเมล็ด · X เมนู';
}
function note(t){$('#msg').textContent=t}
function burstMap(x,y,col,n=8){for(let i=0;i<(CALM?3:n);i++){const a=rand(0,TAU),s=rand(10,40);fxMap.push({x:x*T+8,y:y*T+8,vx:Math.cos(a)*s,vy:Math.sin(a)*s-16,life:rand(.25,.5),col})}}
function act(x,y){
  if(mode!=='map')return;
  if(inCrater())return craterAct(x,y);
  const t=tileAt(x,y),p=plotAt(x,y);
  if(p){
    if(!p.unlocked){note('ที่ดินแปลงนี้ยังไม่ใช่ของเรา ซื้อเพิ่มได้ที่ร้าน');sfx.back();return}
    const s=G.plots[p.i];
    if(!s.c){
      if(G.seeds[G.sel]<=0){note(`เมล็ด${CROPS[G.sel].name}หมด ไปซื้อที่ร้านได้`);sfx.back();return}
      if(!useStamina(STAMINA_COST.plant))return;
      G.seeds[G.sel]--;s.c=G.sel;s.g=0;s.w=false;sfx.plant();burstMap(x,y,'#a4d96c',5);note(`ปลูก${CROPS[s.c].name}แล้ว อย่าลืมรดน้ำ`);extraWork('plant',x,y);renderSeeds();mapHint();saveSoon();return;
    }
    if(s.mutant)return harvest(p,x,y);
    if(s.g>=CROPS[s.c].days)return script(()=>harvestMenu(p,x,y));
    if(s.w){note(`${CROPS[s.c].name}รดน้ำแล้ว รอพรุ่งนี้`);return}
    if(!useStamina(STAMINA_COST.water))return;
    waterAt(p);sfx.water();extraWork('water',x,y);mapHint();saveSoon();return;
  }
  if(t==='D')return script(sleep);
  if(t==='a'||t==='c')return script(shop);
  if(t==='b')return script(sell);
  if(t==='M')return script(enterCrater);
  if(t==='o')return script(()=>say('น้ำในบ่อยังใสดี ที่นี่ปลอดภัยจากหมอกอยู่ แค่ยังไม่รู้ว่าจะอีกนานแค่ไหน'));
  if(t==='~')return script(pondMenu);
}
// STR perk: the same job carries on to the next plots in the direction the farmer faces, for no extra SP.
function extraWork(kind,x,y){
  const[dx,dy]=DIRS[P.dir],tier=perkTier('atk');
  let done=0;
  for(let i=1;i<=tier&&mode==='map';i++){
    const tx=x+dx*i,ty=y+dy*i,p=plotAt(tx,ty);
    if(!p||!p.unlocked)break;
    const s=G.plots[p.i];
    if(kind==='plant'){
      if(s.c||G.seeds[G.sel]<=0)break;
      G.seeds[G.sel]--;s.c=G.sel;s.g=0;s.w=false;burstMap(tx,ty,'#a4d96c',5);
    }else if(kind==='water'){
      if(!s.c||s.w||s.g>=CROPS[s.c].days)break;
      waterAt(p);
    }else{
      if(!s.c||s.g<CROPS[s.c].days)break;
      harvest(p,tx,ty);
    }
    done++;
  }
  if(done&&mode==='map')note(`แรงบ้าคลั่ง! ทำเพิ่มอีก ${done} ช่องโดยไม่ใช้ SP`);
}
function waterAt(p){
  const range=G.can?1:0;
  for(let b=p.b-range;b<=p.b+range;b++)for(let a=p.a-range;a<=p.a+range;a++){
    if(a<0||b<0||a>=landSize()||b>=landSize())continue;
    const s=G.plots[b*6+a];if(s.c&&s.g<CROPS[s.c].days&&!s.w){s.w=true;burstMap(PX+a,PY+b,'#7fb8e8',6)}
  }
  note(range?'รดน้ำรอบ ๆ เรียบร้อย':'รดน้ำเรียบร้อย');
}
function rollYield(kind){
  const bonus=Math.random()<[0,.1,.2][perkTier('sta')]?1:0;
  let r=Math.random();
  for(const[n,chance]of CROPS[kind].extra){if(r<chance)return n+bonus;r-=chance}
  return CROPS[kind].base+bonus;
}
// Plots ready to harvest, nearest to the chosen one first. Waiting monsters are fought separately.
function readyPlots(p){
  const list=[];
  for(let b=0;b<landSize();b++)for(let a=0;a<landSize();a++){
    const s=G.plots[b*6+a];
    if(s.c&&!s.mutant&&s.g>=CROPS[s.c].days)list.push({p:plotAt(PX+a,PY+b),x:PX+a,y:PY+b,dist:Math.abs(a-p.a)+Math.abs(b-p.b)});
  }
  return list.sort((u,v)=>u.dist-v.dist);
}
// One harvest action costs 1 SP. STR decides how many plots that action can reach.
const harvestCapacity=()=>1+perkTier('atk');
async function harvestMenu(p,x,y){
  const ready=readyPlots(p),max=Math.min(harvestCapacity(),ready.length);
  let count=1;
  if(max>1){
    if(G.stam<STAMINA_COST.harvest){useStamina(STAMINA_COST.harvest);return}
    setMsg(`STR เก็บได้สูงสุด ${harvestCapacity()} แปลงต่อครั้ง จะเก็บกี่แปลง? ยิ่งเยอะยิ่งเสี่ยงเจอมอนสเตอร์พร้อมกันหลายตัว`,`SP ${G.stam}/${maxStam()}`);
    const counts=Array.from({length:max},(_,i)=>i+1);
    count=await choose(counts.map(n=>({label:`${n} แปลง`,sub:`SP ${STAMINA_COST.harvest}`,value:n})),{cancel:true,start:Math.min(max,G.lastHarvest||1)-1});
    if(!count)return;
    G.lastHarvest=count;
  }
  if(!useStamina(STAMINA_COST.harvest))return;
  await harvestBatch(ready.slice(0,count));
}
function rollMutation(){
  const safe=G.harvests<2;
  const chance=safe?0:Math.min(.45,.10+.015*(mist()-1)+G.pity*.015);
  G.harvests++;
  if(Math.random()<chance){G.pity=0;return true}
  G.pity++;return false;
}
async function harvestBatch(list){
  const monsters=[],gained={};
  for(const t of list){
    const s=G.plots[t.p.i],kind=s.c;
    if(rollMutation()){monsters.push({p:t.p,kind,rare:Math.random()<.1,x:t.x,y:t.y});continue}
    const n=rollYield(kind);
    s.c=null;s.g=0;s.w=false;G.veg[kind]+=n;gained[kind]=(gained[kind]||0)+n;
    burstMap(t.x,t.y,'#ffcf6b',Math.min(24,8*n));
    if(n>1)floatsMap.push({x:t.x*T+8,y:t.y*T-2,n:'+'+n,t:0});
  }
  const kinds=Object.keys(gained);
  if(kinds.length){
    sfx.harvest();
    note(`เก็บได้ ${kinds.map(k=>`${CROPS[k].name} ${gained[k]} ${CROPS[k].unit}`).join(', ')}`);
    gainXP(list.length-monsters.length,true);renderStatus();mapHint();saveSoon();
  }
  if(monsters.length)await encounterGroup(monsters);
}
function harvest(p,x,y){
  const s=G.plots[p.i];
  if(s.mutant)return script(()=>encounterGroup([{p,kind:s.c,rare:s.mutant==='rare',x,y,trans:!!s.trans}]));
  return script(()=>harvestBatch([{p,x,y}]));
}
async function encounterGroup(list){
  for(const m of list)if(m.trans===undefined)m.trans=Math.random()<transcendChance();
  inFight=true;
  showPad(false);
  sfx.enc();shake=4;
  setMsg(list.length>1?`ผัก ${list.length} ต้นดิ้นอยู่ในดิน!`:`${CROPS[list[0].kind].name}ต้นนี้ดิ้นอยู่ในดิน!`);
  plotShake={i:list[0].p.i,t:.8};
  await wait(800);
  for(const m of list)G.plots[m.p.i]={c:null,g:0,w:false};
  const res=await battle(list.map(m=>({kind:m.kind,rare:m.rare,trans:m.trans})));
  inFight=false;
  if(res==='retreat'){
    // Revealed monsters stay in their plots, unchanged, until the player comes back.
    for(const m of list)G.plots[m.p.i]={c:m.kind,g:CROPS[m.kind].days,w:false,mutant:m.rare?'rare':'normal',trans:m.trans};
    note(list.length>1?`ถอยออกมาได้ มอนสเตอร์ ${list.length} ตัวยังรออยู่ในแปลง`:'ถอยออกมาได้ มอนสเตอร์ยังรออยู่ในแปลง');saveSoon();return;
  }
  if(res==='win'||res==='boom'){saveSoon();return}
  const near=new Set(),own=new Set(list.map(m=>m.p.i));
  for(const m of list)for(let b=m.p.b-1;b<=m.p.b+1;b++)for(let a=m.p.a-1;a<=m.p.a+1;a++){
    if(a<0||b<0||a>=6||b>=6||own.has(b*6+a))continue;
    if(G.plots[b*6+a].c)near.add(b*6+a);
  }
  const gone=[...near].sort(()=>Math.random()-.5).slice(0,[3,1,0][perkTier('def')]*list.length);
  gone.forEach(i=>{G.plots[i]={c:null,g:0,w:false}});
  await say(gone.length?`มอนสเตอร์ทำลายผักข้าง ๆ ไป ${gone.length} ต้น แล้วหายเข้าไปในหมอก เราสลบไปจนเช้า`:'มอนสเตอร์หายเข้าไปในหมอก เราสลบไปจนเช้า');
  await nextDay(perkTier('hp')>=1?1:.5);
  saveSoon();
}
let plotShake=null;
async function nextDay(hpRatio=1){
  await fadeTo(1,300);
  const L0=mist();
  G.day++;
  const growChance=[0,.2,.4][perkTier('pw')];
  for(const s of G.plots){
    if(s.c&&s.w&&s.g<CROPS[s.c].days){s.g++;if(s.g<CROPS[s.c].days&&Math.random()<growChance)s.g++}
    s.w=false;
  }
  growPond();
  G.hp=Math.max(1,Math.round(maxHP()*hpRatio));G.pw=maxPW();G.stam=Math.round(maxStam()*hpRatio);
  save();pushBackup({...G,x:P.x,y:P.y});renderStatus();
  await fadeTo(0,300);
  if(mist()>L0){const fresh=CROP_IDS.filter(k=>(CROPS[k].unlock||1)===mist()).map(k=>CROPS[k].name);await say(`หมอกหนาขึ้นเป็นระดับ ${mist()} ผักกลายพันธุ์ง่ายขึ้น และมอนสเตอร์ก็แรงขึ้น${fresh.length?` ร้านมีเมล็ด${fresh.join(' ')}ขายแล้ว`:''}`)}
}
async function sleep(){
  setMsg('เข้านอนเลยไหม? ผักที่รดน้ำแล้วจะโตขึ้นในวันพรุ่งนี้');
  const a=await choose([{label:'นอนเลย',value:1},{label:'ไว้ก่อน',value:0}]);
  if(a){await nextDay(1);note(`เช้าวันที่ ${G.day} แล้ว`)}
}
async function shop(){
  for(;;){
    setMsg('ร้านของชำริมทาง ซื้ออะไรดี?','เจ้าของร้าน');
    const list=[];
    for(const k of unlockedCrops()){const i=CROPS[k];
      list.push({label:`เมล็ด${i.name} (มี ${G.seeds[k]})`,sub:`${i.seed} G · โต ${i.days} วัน · ขาย ${i.sell} G`,value:{seed:k,n:1},disabled:G.gold<i.seed});
      list.push({label:`เมล็ด${i.name} × 5`,sub:`${i.seed*5} G`,value:{seed:k,n:5},disabled:G.gold<i.seed*5});}
    const skCost=60*(G.sickle+1),skS=G.sickle;
    list.push({label:`ลับเครื่องมือ ขั้น ${G.sickle+1}`,sub:`โจมตี +2 · ${skCost} G${skS?` · เศษ ${skS}`:''}`,value:{up:'sickle',g:skCost,s:skS},disabled:G.gold<skCost||G.shards<skS});
    if(!G.can)list.push({label:'บัวรดน้ำใบใหญ่',sub:'รดน้ำ 3×3 · 250 G · เศษ 2',value:{up:'can',g:250,s:2},disabled:G.gold<250||G.shards<2});
    if(G.land<2){const g=G.land?500:200;list.push({label:`ซื้อที่ดินเป็น ${5+G.land}×${5+G.land}`,sub:`${g} G`,value:{up:'land',g,s:0},disabled:G.gold<g})}
    for(const[id,t]of Object.entries(TOOLS))if(!G.tools[id])list.push({label:t.name,sub:`เครื่องมือต่อสู้ธาตุ${t.el} · ${t.price} G`,value:{tool:id,g:t.price},disabled:G.gold<t.price});
    if(spentPoints()>0)list.push({label:'ล้างแต้มสถานะ',sub:`เศษอุกกาบาต ${SHARD_COST.respec}`,value:{service:respecMenu},disabled:G.shards<SHARD_COST.respec});
    list.push({label:'หลอมอุปกรณ์',sub:`เพิ่ม 1 ขั้น · เศษอุกกาบาต ${SHARD_COST.reforge}`,value:{service:reforgeMenu},disabled:G.shards<SHARD_COST.reforge});
    const v=await choose(list,{cancel:true});
    if(!v)return;
    if(v.service){await v.service();continue}
    if(v.tool){G.gold-=v.g;G.tools[v.tool]=1}
    else if(v.seed){G.gold-=CROPS[v.seed].seed*v.n;G.seeds[v.seed]+=v.n}
    else{G.gold-=v.g;G.shards-=v.s;G[v.up]++}
    sfx.coin();renderStatus();saveSoon();
  }
}
async function sell(){
  for(;;){
    const total=CROP_IDS.reduce((a,k)=>a+G.veg[k]*CROPS[k].sell,0)+Object.keys(FISH).reduce((a,k)=>a+G.fish[k]*FISH[k].sell,0)+G.goldFish*GOLD_FISH_SELL;
    setMsg(total?`ผักและปลาในกระเป๋าขายได้รวม ${total} G`:'ยังไม่มีของให้ขาย ไปเก็บเกี่ยวหรือจับปลาก่อน');
    const list=[{label:'ขายทั้งหมด',sub:`${total} G`,value:'all',disabled:!total},...CROP_IDS.filter(k=>G.veg[k]>0).map(k=>({label:`${CROPS[k].name} × ${G.veg[k]}`,sub:`ลูกละ ${CROPS[k].sell} G`,value:k,disabled:!G.veg[k]})),...Object.keys(FISH).filter(k=>G.fish[k]>0).map(k=>({label:`${FISH[k].name} × ${G.fish[k]}`,sub:`ตัวละ ${FISH[k].sell} G`,value:k})),...(G.goldFish>0?[{label:`ปลาทอง × ${G.goldFish}`,sub:`ตัวละ ${GOLD_FISH_SELL} G`,value:'goldFish'}]:[])];
    const v=await choose(list,{cancel:true});
    if(!v)return;
    if(v==='all'){G.gold+=total;CROP_IDS.forEach(k=>G.veg[k]=0);for(const k in FISH)G.fish[k]=0;G.goldFish=0}else if(v==='goldFish'){G.gold+=GOLD_FISH_SELL;G.goldFish--}else if(FISH[v]){G.gold+=FISH[v].sell;G.fish[v]--}else{G.gold+=CROPS[v].sell;G.veg[v]--}
    sfx.coin();renderStatus();saveSoon();
  }
}
function gainXP(n,quiet){
  G.xp+=n;let up=false;
  while(G.xp>=xpNext()){G.xp-=xpNext();G.lv++;G.points+=POINTS_PER_LEVEL;up=true;G.hp=maxHP();G.pw=maxPW()}
  if(up){sfx.heal();if(quiet)note(`เลเวลอัปเป็น Lv ${G.lv}! ได้แต้มสถานะ อัปได้ที่ เมนู → สถานะ`)}
  return up;
}
function fieldMenu(){
  if(mode!=='map'||P.moving)return;
  script(async()=>{
    for(;;){
      setMsg('เมนู');
      const a=await choose([{label:'สถานะ',value:'stats'},{label:'ชุดและอาวุธ',value:'gear'},{label:'กินผัก',value:'eat'},{label:'ผลปีศาจ',value:'fruit'},{label:'สมุดผัก',value:'book'},{label:'สำรองเซฟ',value:'code'},{label:'เล่นต่อ',value:'close'}],{cols:2});
      if(a==='close')return;
      if(a==='stats')await statsMenu();
      if(a==='gear')await gearMenu();
      if(a==='eat')await eatMenu();
      if(a==='fruit')await fruitMenu();
      if(a==='book')await bookMenu();
      if(a==='code')await backupPanel();
    }
  });
}
async function backupPanel(){
  const box=$('#savecode'),code=exportCode();
  save();box.value=code;box.readOnly=true;box.hidden=false;
  setMsg('คัดลอกรหัสนี้เก็บไว้ในโน้ต ถ้าเซฟหายหรือย้ายเครื่อง ใส่รหัสนี้ที่หน้าแรกเพื่อเล่นต่อ');
  $('#hint').textContent='รหัสเก็บความคืบหน้าถึงตอนนี้ ควรสำรองใหม่หลังเล่นไปสักพัก';
  const v=await choose([{label:'คัดลอกรหัส',value:'copy',run(){
    const failed=()=>{box.focus();box.select();$('#hint').textContent='คัดลอกอัตโนมัติไม่ได้ เลือกข้อความให้แล้ว กด Ctrl+C หรือคัดลอกเอง'};
    try{navigator.clipboard.writeText(code).then(()=>{$('#hint').textContent='คัดลอกรหัสแล้ว เก็บไว้ในโน้ตได้เลย'},failed)}catch(e){failed()}
  }}],{cancel:true});
  if(v==='copy'){await choose([{label:'เรียบร้อย',value:1}]);}
  box.hidden=true;box.value='';
}
async function importPanel(){
  const box=$('#savecode');box.value='';box.readOnly=false;box.hidden=false;
  setMsg('วางรหัสเซฟในช่องนี้ แล้วกดโหลดเซฟ');
  box.focus({preventScroll:true});
  for(;;){
    const v=await choose([{label:'โหลดเซฟนี้',value:'load'}],{cancel:true});
    if(!v){box.hidden=true;box.value='';return null}
    const g=importCode(box.value);
    if(g){box.hidden=true;box.value='';return g}
    sfx.back();setMsg('รหัสนี้ใช้ไม่ได้ ตรวจว่าคัดลอกมาครบและขึ้นต้นด้วย MG1-');
  }
}
function eatList(){return [...(G.goldFish>0?[{label:`ปลาทอง × ${G.goldFish}`,sub:'ฟื้น HP และ MP เต็ม',value:'goldFish'}]:[]),...Object.keys(FISH).filter(k=>G.fish[k]>0).map(k=>({label:`${FISH[k].name} × ${G.fish[k]}`,sub:`HP +${FISH[k].hp} · MP +${FISH[k].mp}`,value:k})),...(G.golden>0?[{label:`${GOLDEN_VEG.name} × ${G.golden}`,sub:'ฟื้น HP MP SP เต็ม',value:'golden'}]:[]),...CROP_IDS.filter(k=>G.veg[k]>0).map(k=>({label:`${CROPS[k].name} × ${G.veg[k]}`,sub:`HP +${eatHeal(k)}`,value:k}))]}
const foodName=k=>k==='golden'?GOLDEN_VEG.name:k==='goldFish'?'ปลาทอง':FISH[k]?FISH[k].name:CROPS[k].name;
function eatVeg(k){
  if(k==='goldFish'){G.goldFish--;const v=maxHP()-G.hp;G.hp=maxHP();G.pw=maxPW();return v}
  if(FISH[k]){G.fish[k]--;const f=FISH[k],v=Math.min(f.hp,maxHP()-G.hp);G.hp+=v;G.pw=Math.min(maxPW(),G.pw+f.mp);return v}
  if(k==='golden'){G.golden--;const v=maxHP()-G.hp;G.hp=maxHP();G.pw=maxPW();G.stam=Math.max(G.stam,maxStam());return v}
  G.veg[k]--;const v=Math.min(eatHeal(k),maxHP()-G.hp);G.hp+=v;return v}
async function eatMenu(){
  for(;;){
    const l=eatList();if(!l.length){setMsg('ไม่มีผักในกระเป๋า');await wait(800);return}
    setMsg(`กินอะไรดี? HP ${G.hp}/${maxHP()} · MP ${G.pw}/${maxPW()} · SP ${G.stam}/${maxStam()}`);
    const v=await choose(l.map(i=>FOOD_STAMINA[i.value]?{...i,sub:`${i.sub} · SP +${FOOD_STAMINA[i.value]}`}:i),{cancel:true});if(!v)return;
    eatVeg(v);if(FOOD_STAMINA[v])G.stam=Math.min(maxStam(),G.stam+FOOD_STAMINA[v]);sfx.heal();renderStatus();saveSoon();
  }
}
function perkNext(k){
  const n=PERKS[k].find(p=>G.stat[k]<p.at);
  if(k==='spd'&&!n)return `ลงแล้ว ${G.stat[k]} · เบิ้ล +4% หลบ +3% ต่อแต้ม`;
  if(k==='spd')return `ลงแล้ว ${G.stat[k]} · เบิ้ล +4% หลบ +3% · ครบ ${n.at}: ${n.note}`;
  return n?`ลงแล้ว ${G.stat[k]} · ครบ ${n.at}: ${n.note}`:`ลงแล้ว ${G.stat[k]} · ปลดล็อกครบแล้ว`;
}
async function allocMenu(){
  const before={...G.stat},points=G.points;
  for(;;){
    setMsg(G.points?`แต้มเหลือ ${G.points} แต้ม เลือกสถานะที่อยากเพิ่ม`:'ใช้แต้มครบแล้ว กดยืนยันเพื่อบันทึก',`อัปสถานะ`);
    const v=await choose([...Object.entries(STATS).map(([k,s])=>({label:`${s.name} +${s.per}`,sub:perkNext(k),value:k,disabled:G.points<=0})),{label:'ยืนยัน',sub:'เปลี่ยนภายหลังไม่ได้',value:'ok',disabled:G.points===points}],{cancel:true});
    if(v==='ok'){G.hp=Math.min(G.hp,maxHP());G.pw=Math.min(G.pw,maxPW());renderStatus();saveSoon();return}
    if(v===null){G.stat=before;G.points=points;renderStatus();return}
    const beforeHP=maxHP(),beforePW=maxPW(),beforeSta=maxStam();
    const tierBefore=perkTier(v);
    G.stat[v]++;G.points--;
    if(perkTier(v)>tierBefore){const u=PERKS[v][tierBefore];await say(`ปลดล็อก ${u.name}! ${u.note}`,'ความสามารถใหม่')}
    G.hp+=maxHP()-beforeHP;G.pw+=maxPW()-beforePW;G.stam+=maxStam()-beforeSta;
    sfx.ok();renderStatus();
  }
}
async function statsMenu(){
  for(;;){
  const sets=CROP_IDS.filter(k=>setCount(k)>=2).map(k=>`ชุด${CROPS[k].name} ${setCount(k)}/3`).join(', ')||'ยังไม่มี';
  const rows=[['พลังรวม',playerCP()],['ระดับเกษตร',`${farmLevel()} (เครื่องมือแรง ${toolPower()})`],['เลเวล',`${G.lv} (EXP ${G.xp}/${xpNext()})`],['HP',`${G.hp}/${maxHP()}`],['MP',`${G.pw}/${maxPW()}`],['SP',`${G.stam}/${maxStam()}`],
    ['โจมตี',Math.round(atkOf())],['ป้องกัน',Math.round(defOf())],['ความเร็ว',spdOf()],
    ['คริติคอล',`${Math.round(critChance()*100)}%`],['โจมตีเบิ้ล',`${Math.round(doubleChance()*100)}%`],['หลบการโจมตี',`${Math.round(dodgeChance()*100)}%`],['ความแม่นยำ',`${Math.round(hitChance()*100)}%`],
    ...Object.values(PERKS).flat().filter(p=>G.stat[Object.keys(PERKS).find(k=>PERKS[k].includes(p))]>=p.at).map(p=>[p.name,p.note]),
    ['โบนัสชุด',sets],['พลังผลปีศาจ',G.power?FRUITS[G.power].skill:'ยังไม่มี']];
  const box=$('#sheet');box.innerHTML='';
  for(const[k,v]of rows){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;box.append(dt,dd)}
  box.hidden=false;
  setMsg(G.points?`มีแต้มสถานะ ${G.points} แต้ม พร้อมอัป`:'เลเวลอัปแต่ละครั้งได้ 3 แต้ม ความเร็วสูงจะออกก่อนมอนสเตอร์ได้บ่อยขึ้น','สถานะชาวนา');
  const a=await choose([{label:'อัปสถานะ',sub:`${G.points} แต้ม`,value:'up',disabled:!G.points},{label:'กลับ',value:'back'}]);
  box.hidden=true;box.innerHTML='';
  if(a==='back')return;
  await allocMenu();
  }
}
async function fruitMenu(){
  const have=CROP_IDS.filter(k=>G.fruits[k]>0);
  if(!have.length){setMsg('ยังไม่มีผลปีศาจ ปราบมอนสเตอร์เพื่อรับผลปีศาจ');await wait(1100);return}
  setMsg(G.power?`พลังตอนนี้: ${FRUITS[G.power].skill} ถ้ากินผลใหม่ พลังเดิมจะหายไป`:'กินผลปีศาจเพื่อรับสกิลพิเศษ ใช้ได้ในการต่อสู้');
  const v=await choose(have.map(k=>({label:`${FRUITS[k].name} × ${G.fruits[k]}`,sub:G.power===k?'กินอยู่':`${FRUITS[k].skill}: ${FRUITS[k].note} · ${RES_LABEL[FRUITS[k].res]} ${FRUITS[k].cost}`,value:k,disabled:G.power===k})),{cancel:true});
  if(!v)return;
  G.fruits[v]--;G.power=v;sfx.heal();renderStatus();saveSoon();
  await say(`ได้พลังใหม่! ใช้สกิล ${FRUITS[v].skill} ได้ในเมนูสกิล จนกว่าจะกินผลปีศาจอื่น`);
}
async function gearMenu(){
  for(;;){
    setMsg(`โจมตี ${Math.round(atkOf())} · ป้องกัน ${Math.round(defOf())} · HP สูงสุด ${maxHP()}`);
    const slot=await choose(SLOTS.map(s=>({label:SLOT_NAME[s],sub:G.equip[s]?itemName(G.equip[s])+` +${(G.items[G.equip[s]]||1)-1}`:'ยังไม่ได้ใส่',value:s})),{cancel:true});
    if(!slot)return;
    const owned=Object.keys(G.items).filter(i=>itemSlot(i)===slot);
    if(!owned.length){setMsg('ยังไม่มีของในช่องนี้ ชนะมอนสเตอร์ผักเพื่อรับของ');await wait(1100);continue}
    setMsg(`เลือก${SLOT_NAME[slot]}ที่จะใส่`);
    const v=await choose([{label:'ถอดออก',value:'off',disabled:!G.equip[slot]},...owned.map(i=>({label:`${itemName(i)} +${G.items[i]-1}`,sub:`${itemInfo(i)} · ${meetsReq(i)?(G.equip[slot]===i?'ใส่อยู่':reqText(i)):`❌ ${reqText(i)}`}${slot==='weapon'?` · สกิล ${WEAPON_SKILLS[itemCrop(i)].name}`:` · ชุด${CROPS[itemCrop(i)].name}`}`,value:i,disabled:!meetsReq(i)||G.equip[slot]===i}))],{cancel:true});
    if(!v)continue;
    G.equip[slot]=v==='off'?null:v;G.hp=Math.min(G.hp,maxHP());G.pw=Math.min(G.pw,maxPW());G.stam=Math.min(G.stam,maxStam());sfx.ok();renderStatus();saveSoon();
  }
}
async function bookMenu(){
  for(;;){
    setMsg('สมุดผัก เลือกผักเพื่ออ่านข้อมูล');
    const k=await choose(unlockedCrops().map(k=>{const s=G.seen[k],own=SLOTS.filter(o=>G.items[itemId(k,o)]).length;return{label:CROPS[k].name,sub:`ชนะ ${s.n} · ร่างทอง ${s.rare} · ของ ${own}/3`,value:k}}),{cancel:true});
    if(!k)return;
    const i=CROPS[k],m=MONSTERS[k],s=G.seen[k];
    await say(i.fact,CROPS[k].name);
    await say(s.known?`แพ้${TOOLS[WEAKNESS[k].normal].el} เพราะ${WEAKNESS[k].reason}`:'ยังไม่รู้จุดอ่อน ลองใช้เครื่องมือต่าง ๆ ตอนสู้เพื่อค้นหา','จุดอ่อน');
    await say(`ในเกมขยายเกินจริงเป็นพลัง${i.power} ใส่ 2 ชิ้น: ${i.set2} · ใส่ 3 ชิ้น: ${i.set3}`,'พลังในเกม');
    await say(s.n||s.rare?`${m.name} ชนะแล้ว ${s.n} ครั้ง และร่างทอง ${s.rare} ครั้ง`:'ยังไม่เคยเอาชนะมอนสเตอร์จากผักชนิดนี้','บันทึกการต่อสู้');
  }
}
async function fadeTo(v,ms=220){const s=fade,t0=performance.now();for(;;){const k=Math.min(1,(performance.now()-t0)/ms);fade=s+(v-s)*k;if(k>=1)break;await wait(16)}}
function script(fn){if(mode!=='map')return;mode='script';showPad(false);held.length=0;P.path=null;renderSeeds();
  Promise.resolve().then(fn).catch(e=>console.error(e)).finally(()=>{if(mode==='script'){mode='map';showPad(true);renderSeeds();renderStatus();mapHint()}})}

