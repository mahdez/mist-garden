'use strict';
/* ---------- Crater art ---------- */
TILES.X=tile(P=>{speck(P,'#2b2240',['#352a4d','#221a33','#3f3360'],24,31);P(0,14,T,2,'#191226');P(3,3,6,1,'#4a3d63')});
TILES._=tile(P=>speck(P,'#8a7a66',['#7d6e5c','#978770','#6f6152'],16,37));
TILES.E=tile(P=>{speck(P,'#8a7a66',['#7d6e5c','#978770'],10,41);P(2,5,12,9,'#a98f5c');P(3,6,10,1,'#c4ab74');P(7,1,2,4,'#ffe29a');P(5,3,6,1,'#ffe29a')});
const ORE_ART=tile(P=>{speck(P,'#8a7a66',['#7d6e5c','#978770'],10,43);P(3,8,10,6,'#2b2240');P(5,4,3,6,'#c4a8f5');P(9,6,3,4,'#9a7fd6');P(6,5,1,2,'#f4eaff')});

/* ---------- Crater state ---------- */
function ensureCrater(){
  const old=G.crater||{};
  if(old.day===G.day)return G.crater;
  const foes={};
  for(const f of CRATER_FOES)foes[f.id]={kind:pick(unlockedCrops()),dead:false};
  G.crater={day:G.day,ores:{},foes,bossMist:old.bossMist||0,bossWins:old.bossWins||0};
  return G.crater;
}
const bossReady=()=>ensureCrater().bossMist<mist();
function craterThing(x,y){
  const c=ensureCrater();
  const ore=CRATER_ORES.find(o=>o.x===x&&o.y===y&&!c.ores[o.id]);if(ore)return{type:'ore',ore};
  const foe=CRATER_FOES.find(f=>f.x===x&&f.y===y&&!c.foes[f.id].dead);if(foe)return{type:'foe',foe,kind:c.foes[foe.id].kind};
  if(x===CRATER_BOSS.x&&y===CRATER_BOSS.y&&bossReady())return{type:'boss'};
  return null;
}
function craterDescribe(x,y){
  const t=craterThing(x,y);
  if(tileAt(x,y)==='E')return 'เดินเข้าไปเพื่อกลับฟาร์ม';
  if(!t)return null;
  if(t.type==='ore')return `Enter: ขุดแร่อุกกาบาต ใช้ SP ${ORE_COST}`;
  if(t.type==='foe')return `Enter: สู้${MONSTERS[t.kind].name} ก้าวข้าม`;
  return 'Enter: ท้าสู้ราชาอุกกาบาต';
}
function craterAct(x,y){
  const t=craterThing(x,y);if(!t)return;
  if(t.type==='ore')return mineOre(t.ore);
  if(t.type==='foe')return script(()=>craterFight(t.foe,t.kind));
  return script(bossFight);
}
function mineOre(o){
  if(!useStamina(ORE_COST))return;
  const c=ensureCrater();c.ores[o.id]=1;sfx.chest&&sfx.chest();sfx.harvest();burstMap(o.x,o.y,'#c4a8f5',14);
  const r=Math.random();
  if(r<.5){G.shards++;note('ขุดได้เศษอุกกาบาต 1 ชิ้น')}
  else if(r<.9){const g=Math.round(rand(20,60));G.gold+=g;note(`ขุดได้แร่ขายได้ ${g} G`)}
  else{G.golden++;note('โชคดี! ในแร่มีผักทองฝังอยู่ 1 ลูก')}
  renderStatus();mapHint();saveSoon();
}
async function enterCrater(){
  ensureCrater();
  setMsg(`หลุมอุกกาบาตเต็มไปด้วยแร่และมอนสเตอร์ก้าวข้าม ถ้าแพ้จะสลบและตื่นมาที่ฟาร์ม${bossReady()?' ลึกเข้าไปมีราชาอุกกาบาตรออยู่':''}`);
  if(!await choose([{label:'ลงไปในหลุม',value:1},{label:'ไว้ก่อน',value:0}]))return;
  await fadeTo(1,250);
  G.area='crater';Object.assign(P,{x:CRATER_ENTRY.x,y:CRATER_ENTRY.y,fx:CRATER_ENTRY.x,fy:CRATER_ENTRY.y,dir:'up',path:null,moving:false});
  G.x=P.x;G.y=P.y;renderStatus();save();
  await fadeTo(0,250);
  note('เข้ามาในหลุมอุกกาบาตแล้ว แร่กับมอนสเตอร์จะกลับมาใหม่ทุกวัน');
}
function placeOnFarm(){
  G.area='farm';Object.assign(P,{x:CRATER_EXIT.x,y:CRATER_EXIT.y,fx:CRATER_EXIT.x,fy:CRATER_EXIT.y,dir:'down',path:null,moving:false});
  G.x=P.x;G.y=P.y;
}
async function leaveCrater(){
  await fadeTo(1,250);placeOnFarm();save();await fadeTo(0,250);note('กลับมาที่ฟาร์มแล้ว');
}
async function craterLoss(){
  await say('หมดแรงในหลุมอุกกาบาต ตื่นขึ้นมาอีกทีที่ฟาร์มในเช้าวันถัดไป');
  placeOnFarm();
  await nextDay(perkTier('hp')>=1?1:.5);
}
async function craterFight(foe,kind){
  inFight=true;
  const res=await battle(kind,Math.random()<CRATER_RARE,true);
  inFight=false;
  if(res==='win'||res==='boom')ensureCrater().foes[foe.id].dead=true;
  if(res==='lose')await craterLoss();
  saveSoon();
}
async function bossFight(){
  inFight=true;
  const res=await battle('meteor',false,false);
  inFight=false;
  if(res==='lose')await craterLoss();
  saveSoon();
}
async function bossVictory(e){
  sfx.win();
  const c=ensureCrater(),first=!c.bossWins;
  c.bossWins++;c.bossMist=mist();
  G.gold+=e.gold;G.shards+=5;G.golden+=2;
  const up=gainXP(e.xp);
  const fruit=pick(CROP_IDS);G.fruits[fruit]++;
  if(first)G.points+=3;
  renderStatus();
  await say(`ปราบราชาอุกกาบาตได้! ได้ ${e.xp} EXP, ${e.gold} G, เศษอุกกาบาต 5, ผักทอง 2 และ${FRUITS[fruit].name}`,'ของดรอป');
  if(first)await say('ชนะครั้งแรก! ได้แต้มสถานะเพิ่ม 3 แต้ม','รางวัลพิเศษ');
  await say(`มันจะกลับมาอีกเมื่อหมอกหนาขึ้นถึงระดับ ${mist()+1}`,'หลุมอุกกาบาต');
  if(up){
    setMsg(`เลเวลอัปเป็น Lv ${G.lv}! ได้แต้มสถานะรวม ${G.points} แต้ม`);
    if(await choose([{label:'อัปสถานะเลย',value:1},{label:'ไว้ทีหลัง',value:0}]))await allocMenu();
  }
}
function renderCrater(){
  for(let y=0;y<15;y++)for(let x=0;x<20;x++)c.drawImage(TILES[CRATER_MAP[y][x]]||TILES._,x*T,y*T);
  const st=ensureCrater();
  for(const o of CRATER_ORES)if(!st.ores[o.id])c.drawImage(ORE_ART,o.x*T,o.y*T);
  for(const f of CRATER_FOES){
    const s=st.foes[f.id];if(s.dead)continue;
    c.drawImage(SPC[s.kind].n,f.x*T,f.y*T+Math.round(Math.sin(time*3+f.x)));
    c.fillStyle='#c4a8f5';for(let i=0;i<3;i++){const a=time*2+i*2.1;c.fillRect(f.x*T+7+Math.cos(a)*8|0,f.y*T+7+Math.sin(a)*8|0,2,2)}
  }
  if(bossReady())c.drawImage(SPC.meteor.n,CRATER_BOSS.x*T-4,CRATER_BOSS.y*T-6+Math.round(Math.sin(time*2)));
  drawActors();
  renderMist(Math.min(.4,.2+.025*mist()));
}

/* ---------- Meteor shard services ---------- */
const spentPoints=()=>Object.values(G.stat).reduce((a,b)=>a+b,0);
async function respecMenu(){
  setMsg(`ล้างแต้มสถานะทั้งหมด ${spentPoints()} แต้ม ใช้เศษอุกกาบาต ${SHARD_COST.respec} ชิ้น แล้วลงใหม่ได้ อุปกรณ์ที่สถานะไม่ถึงจะถูกถอด`);
  if(!await choose([{label:'ไว้ก่อน',value:0},{label:'ล้างแต้ม',value:1}]))return;
  G.shards-=SHARD_COST.respec;G.points+=spentPoints();
  for(const k in G.stat)G.stat[k]=0;
  const off=removeUnmetGear();
  G.hp=Math.min(G.hp,maxHP());G.pw=Math.min(G.pw,maxPW());G.stam=Math.min(G.stam,maxStam());
  sfx.heal();renderStatus();saveSoon();
  await say(`ได้แต้มคืน ${G.points} แต้ม${off.length?` ถอด ${off.join(', ')}`:''} ลงใหม่ได้ที่ เมนู → สถานะ`);
}
async function reforgeMenu(){
  const items=Object.keys(G.items).filter(id=>G.items[id]<6);
  if(!items.length){setMsg('ยังไม่มีอุปกรณ์ที่หลอมเพิ่มได้');await wait(900);return}
  setMsg(`หลอมอุปกรณ์เพิ่ม 1 ขั้น ใช้เศษอุกกาบาต ${SHARD_COST.reforge} ชิ้น`);
  const id=await choose(items.map(i=>({label:`${itemName(i)} +${G.items[i]-1}`,sub:itemInfo(i),value:i})),{cancel:true});
  if(!id)return;
  G.shards-=SHARD_COST.reforge;G.items[id]++;sfx.coin();renderStatus();saveSoon();
  await say(`${itemName(id)} เป็น +${G.items[id]-1} แล้ว ตอนนี้ ${itemInfo(id)}`);
}

/* ---------- Fish pond ---------- */
const unlockedFish=()=>Object.keys(FISH).filter(k=>FISH[k].unlock<=mist());
const fishName=k=>k==='gold'?'ปลาทอง':FISH[k].name;
function growPond(){for(const f of G.pond){if(!f.mutant&&f.fed&&f.age<FISH[f.k].days)f.age++;f.fed=false}}
function fishMutates(){
  const c=FISH_MUTATION,safe=G.fishCaught<c.safeCatches;
  G.fishCaught++;
  return !safe&&Math.random()<Math.min(c.max,c.base+c.perMist*(mist()-1));
}
// Caught fish that mutated fight together. Retreating leaves them in the pond; losing lets them eat other fish.
async function fishEncounter(list){
  for(const m of list)if(m.trans===undefined)m.trans=Math.random()<transcendChance();
  inFight=true;showPad(false);sfx.enc();shake=4;
  setMsg(list.length>1?`น้ำในบ่อเดือดพล่าน ปลา ${list.length} ตัวกลายพันธุ์!`:`${FISH[list[0].k].name}ตัวนี้กลายพันธุ์!`,'บ่อปลา');
  await wait(800);
  for(const m of list){const i=G.pond.indexOf(m.fish);if(i>=0)G.pond.splice(i,1)}
  const res=await battle(list.map(m=>({kind:m.k,rare:m.rare,trans:m.trans})));
  inFight=false;
  if(res==='retreat'){
    for(const m of list)G.pond.push({k:m.k,age:FISH[m.k].days,fed:false,mutant:m.rare?'rare':'normal',trans:m.trans});
    setMsg('ถอยออกมาได้ มอนปลายังรออยู่ในบ่อ');saveSoon();return;
  }
  if(res==='lose'){
    const healthy=G.pond.filter(f=>!f.mutant).sort(()=>Math.random()-.5);
    const gone=healthy.slice(0,[3,1,0][perkTier('def')]*list.length);
    G.pond=G.pond.filter(f=>!gone.includes(f));
    await say(gone.length?`มอนปลากินปลาตัวอื่นในบ่อไป ${gone.length} ตัว แล้วหายไปในหมอก เราสลบไปจนเช้า`:'มอนปลาหายไปในหมอก เราสลบไปจนเช้า');
    await nextDay(perkTier('hp')>=1?1:.5);
  }
  saveSoon();
}
async function pondMenu(){
  for(;;){
    const waiting=G.pond.filter(f=>f.mutant),ready=G.pond.filter(f=>!f.mutant&&f.age>=FISH[f.k].days),hungry=G.pond.filter(f=>!f.mutant&&!f.fed&&f.age<FISH[f.k].days);
    setMsg(`บ่อมีปลา ${G.pond.length}/${POND_SIZE} ตัว · หิว ${hungry.length} · จับได้ ${ready.length}${waiting.length?` · มอนปลารออยู่ ${waiting.length}`:''}`,'บ่อปลา');
    const list=[
      ...(waiting.length?[{label:'สู้มอนปลาที่รออยู่',sub:`${waiting.length} ตัว`,value:'fight'}]:[]),
      {label:'ให้อาหารทั้งบ่อ',sub:'SP 1 · ปลาโตเมื่อได้กิน',value:'feed',disabled:!hungry.length},
      {label:'ตกด้วยคันเบ็ด',sub:'จับได้ 1 ตัว · SP 1',value:{rod:1},disabled:!ready.length},
      ...(G.net?[(()=>{const n=NETS[G.net-1];return {label:`หว่าน${n.name}`,sub:`จับได้ ${n.min}-${n.max} ตัว · SP 1`,value:{net:1},disabled:!ready.length}})()]:[]),
      ...unlockedFish().map(k=>({label:`ปล่อย${FISH[k].name}`,sub:`${FISH[k].fry} G · โต ${FISH[k].days} วัน · ขาย ${FISH[k].sell} G`,value:{fry:k},disabled:G.gold<FISH[k].fry||G.pond.length>=POND_SIZE})),
    ];
    const v=await choose(list,{cancel:true});
    if(!v)return;
    if(v==='fight'){
      await fishEncounter(waiting.map(f=>({k:f.k,fish:f,rare:f.mutant==='rare',trans:!!f.trans})));
      return;
    }
    if(v==='feed'){if(useStamina(1)){hungry.forEach(f=>f.fed=true);sfx.water();setMsg('ให้อาหารแล้ว')}}
    else if(v.rod||v.net){
      if(!useStamina(1)){await wait(700);continue}
      const net=v.net?NETS[G.net-1]:null,want=net?net.min+Math.floor(Math.random()*(net.max-net.min+1)):1;
      const caught=[...ready].sort(()=>Math.random()-.5).slice(0,want);
      let n=0,gold=0;const monsters=[];
      for(const f of caught){
        if(fishMutates()){monsters.push({k:f.k,fish:f,rare:Math.random()<FISH_MUTATION.rare});continue}
        G.pond.splice(G.pond.indexOf(f),1);n++;
        if(Math.random()<GOLD_FISH_CHANCE){G.goldFish++;gold++}else G.fish[f.k]++;
      }
      if(n){sfx.harvest();await say(`${net?`หว่าน${net.name}`:'ตกเบ็ด'} จับปลาได้ ${n} ตัว${gold?` เป็นปลาทอง ${gold} ตัว!`:''}`)}
      if(monsters.length){await fishEncounter(monsters);return}
    }else{G.gold-=FISH[v.fry].fry;G.pond.push({k:v.fry,age:0,fed:false});sfx.plant()}
    renderStatus();saveSoon();
  }
}
function renderPondFish(){
  if(!G||!G.pond)return;
  G.pond.forEach((f,i)=>{
    const x=1*T+6+i*9+Math.sin(time+i)*4,y=12*T+7+(i%2)*12+Math.cos(time*.8+i)*2,done=f.age>=FISH[f.k].days;
    c.fillStyle=f.mutant?(f.mutant==='rare'?'#ffd34a':'#c4a8f5'):done?'#ffcf6b':'#1f4f80';c.fillRect(x|0,y|0,done?5:4,2);c.fillRect((x+(done?5:4))|0,(y-1)|0,1,4);
  });
}
