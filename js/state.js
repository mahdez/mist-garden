'use strict';
let G=null,mode='title',fade=0,time=0,shake=0;
const P={x:4,y:5,fx:4,fy:5,dir:'down',moving:false,t:0,path:null,then:null};
let fxMap=[],floatsMap=[];
function newGame(){
  const plots=[];for(let i=0;i<36;i++)plots.push({c:null,g:0,w:false});
  return {day:1,gold:40,shards:0,lv:1,xp:0,hp:40,pw:10,seeds:{carrot:6,tomato:0,pumpkin:0},veg:{carrot:0,tomato:0,pumpkin:0},
    stat:{hp:0,pw:0,atk:0,def:0,spd:0,sta:0},golden:0,points:0,stam:30,items:{},equip:{weapon:null,hat:null,shirt:null},fruits:{carrot:0,tomato:0,pumpkin:0},power:null,tools:{water:1},plots,land:0,sickle:0,can:0,harvests:0,pity:0,sel:'carrot',
    seen:{carrot:{n:0,rare:0},tomato:{n:0,rare:0},pumpkin:{n:0,rare:0}},x:4,y:5};
}
const SAVE='mist-garden-save-v1';
function save(){try{localStorage.setItem(SAVE,JSON.stringify({...G,x:P.x,y:P.y}))}catch(e){}}
// A fight is not saved until it ends, so quitting mid-fight cannot lose the crop or keep damage.
let inFight=false;
let saveT=0;function saveSoon(){clearTimeout(saveT);saveT=setTimeout(()=>{if(!inFight)save()},500)}
function flushSave(){clearTimeout(saveT);if(G&&!inFight)save()}
const BACKUPS=SAVE+'-backups',MAX_BACKUPS=3;
function loadBackups(){try{const l=JSON.parse(localStorage.getItem(BACKUPS));return Array.isArray(l)?l:[]}catch(e){return[]}}
function pushBackup(g){
  try{
    const copy=JSON.parse(JSON.stringify(g)),l=loadBackups().filter(b=>b.day!==copy.day);
    localStorage.setItem(BACKUPS,JSON.stringify([copy,...l].slice(0,MAX_BACKUPS)));
  }catch(e){}
}
function loadSave(){try{const s=localStorage.getItem(SAVE);return s?JSON.parse(s):null}catch(e){return null}}
const CODE_PREFIX='MG1-';
function exportCode(){return CODE_PREFIX+btoa(encodeURIComponent(JSON.stringify({...G,x:P.x,y:P.y})))}
function importCode(text){
  try{
    const t=text.replace(/\s+/g,'');if(!t.startsWith(CODE_PREFIX))return null;
    const o=JSON.parse(decodeURIComponent(atob(t.slice(CODE_PREFIX.length))));
    if(!Number.isFinite(o.day)||!Number.isFinite(o.lv)||!Number.isFinite(o.gold)||!Array.isArray(o.plots)||o.plots.length!==36)return null;
    const b=newGame(),g={...b,...o,stat:{...b.stat,...o.stat},points:o.points??(o.lv-1)*POINTS_PER_LEVEL,stam:o.stam,seeds:{...b.seeds,...o.seeds},veg:{...b.veg,...o.veg},equip:{...b.equip,...o.equip},seen:{...b.seen,...o.seen},fruits:{...b.fruits,...o.fruits}};
    if(blocked(g.x,g.y)){g.x=b.x;g.y=b.y}
    return g;
  }catch(e){return null}
}
const mist=()=>Math.min(9,1+Math.floor((G.day-1)/7));
const landSize=()=>4+G.land;
const plotAt=(x,y)=>{const a=x-PX,b=y-PY;return a>=0&&b>=0&&a<6&&b<6?{i:b*6+a,a,b,unlocked:a<landSize()&&b<landSize()}:null};
function gearBonus(slot){const id=G.equip[slot];if(!id)return 0;const base=GEAR[itemCrop(id)][slot][1],lv=G.items[id]||1;return base+(lv-1)*(slot==='hat'?3:1)}
function setCount(crop){return SLOTS.filter(s=>G.equip[s]&&itemCrop(G.equip[s])===crop).length}
// Food always heals at least the weakest monster's current attack + 5, so eating stays worth a turn as mist rises.
const HEAL_BONUS=5;
const lowestAtk=()=>Math.min(...Object.values(MONSTERS).map(m=>m.atk))*(1+.15*(mist()-1));
const eatHeal=k=>Math.round(Math.max(CROPS[k].eat,Math.round(lowestAtk())+HEAL_BONUS)*(perkTier('hp')>=2?1.5:1));
const perkTier=k=>PERKS[k].filter(p=>(G.stat&&G.stat[k]||0)>=p.at).length;
const statPts=k=>(G.stat&&G.stat[k]||0)*STATS[k].per;
const gearExtra=k=>SLOTS.reduce((sum,s)=>{const id=G.equip[s];return sum+(id&&GEAR[itemCrop(id)][s][2][k]||0)},0);
const gearDef=id=>GEAR[itemCrop(id)][itemSlot(id)];
const meetsReq=id=>Object.entries(gearDef(id)[3]).every(([k,v])=>(G.stat[k]||0)>=v);
function reqText(id){
  const r=Object.entries(gearDef(id)[3]);
  return r.length?`ต้องลง ${r.map(([k,v])=>`${STAT_SHORT[k]} ${v}`).join(', ')}`:'ใส่ได้เลย';
}
function itemInfo(id){
  const d=gearDef(id),slot=itemSlot(id),lv=(G.items[id]||1)-1,main=d[1]+lv*(slot==='hat'?3:1);
  const stats={[SLOT_MAIN[slot]]:main,...d[2]};
  if(d[2][SLOT_MAIN[slot]])stats[SLOT_MAIN[slot]]=main+d[2][SLOT_MAIN[slot]];
  return Object.entries(stats).map(([k,v])=>`${STAT_SHORT[k]} +${v}`).join(' · ');
}
// Worn gear must always meet its requirement, including gear from saves made before requirements existed.
function removeUnmetGear(){
  const off=[];
  for(const s of SLOTS){const id=G.equip[s];if(id&&!meetsReq(id)){off.push(itemName(id));G.equip[s]=null}}
  return off;
}
const maxHP=()=>40+(G.lv-1)*4+gearBonus('hat')+gearExtra('hp')+statPts('hp');
const maxPW=()=>10+(G.lv-1)+gearExtra('pw')+statPts('pw');
const maxStam=()=>30+(G.lv-1)*2+gearExtra('sta')+statPts('sta');
const atkOf=()=>6+(G.lv-1)*.5+G.sickle*2+gearBonus('weapon')+gearExtra('atk')+statPts('atk');
const defOf=()=>3+gearBonus('shirt')+gearExtra('def')+statPts('def');
const spdOf=()=>6+(G.lv-1)*.25+gearExtra('spd')+statPts('spd');
const doubleChance=()=>Math.min(.45,(G.stat&&G.stat.spd||0)*SPD_DOUBLE_PER_POINT);
const dodgeChance=()=>Math.min(.35,(G.stat&&G.stat.spd||0)*SPD_DODGE_PER_POINT);
const hitChance=()=>setCount('carrot')>=3?1:.92;
const critChance=()=>.08+(setCount('carrot')>=2?.15:0);
// Older saves grew stats automatically, so they receive the points for every level already gained.
function normalizeSave(g){
  const upgraded=g.points===undefined;
  g.stat={hp:0,pw:0,atk:0,def:0,spd:0,sta:0,...g.stat};
  if(upgraded)g.points=(g.lv-1)*POINTS_PER_LEVEL;
  if(g.stam===undefined)g.stam=30+(g.lv-1)*2;
  g.golden=g.golden||0;
  g.tools={water:1,...g.tools};
  return upgraded;
}
function useStamina(n){
  if(perkTier('spd')>=2&&Math.random()<.2){note('มือไว! งานนี้ไม่ใช้ SP');return true}
  if(G.stam<n){note('SP หมดแล้ว เข้าบ้านไปนอนเพื่อฟื้น หรือกินผักในเมนู');sfx.back();return false}
  G.stam-=n;renderStatus();return true;
}
const combatPower=(hp,atk,def,spd)=>Math.round(hp*CP_WEIGHT.hp+atk*CP_WEIGHT.atk+def*CP_WEIGHT.def+spd*CP_WEIGHT.spd);
const playerCP=()=>combatPower(maxHP(),atkOf(),defOf(),spdOf());
const foeCP=e=>combatPower(e.maxhp,e.atk,e.def,e.spd);
const riskOf=e=>RISK_LEVELS.find(r=>playerCP()/foeCP(e)>=r.min);
const farmLevel=()=>Math.min(MAX_FARM_LEVEL,1+Math.floor(G.harvests/HARVESTS_PER_FARM_LEVEL));
const toolPower=()=>TOOL_BASE+farmLevel()*TOOL_PER_FARM_LEVEL;
const transcendChance=()=>Math.min(.3,.05+.03*(mist()-1));
const xpNext=()=>Math.floor(15*G.lv**1.5);

