'use strict';
let G=null,mode='title',fade=0,time=0,shake=0;
const P={x:4,y:5,fx:4,fy:5,dir:'down',moving:false,t:0,path:null,then:null};
let fxMap=[],floatsMap=[];
function newGame(){
  const plots=[];for(let i=0;i<36;i++)plots.push({c:null,g:0,w:false});
  return {day:1,gold:40,shards:0,lv:1,xp:0,hp:40,pw:10,seeds:{carrot:6,tomato:0,pumpkin:0},veg:{carrot:0,tomato:0,pumpkin:0},
    items:{},equip:{weapon:null,hat:null,shirt:null},fruits:{carrot:0,tomato:0,pumpkin:0},power:null,plots,land:0,sickle:0,can:0,harvests:0,pity:0,sel:'carrot',
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
    const b=newGame(),g={...b,...o,seeds:{...b.seeds,...o.seeds},veg:{...b.veg,...o.veg},equip:{...b.equip,...o.equip},seen:{...b.seen,...o.seen},fruits:{...b.fruits,...o.fruits}};
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
const eatHeal=k=>Math.max(CROPS[k].eat,Math.round(lowestAtk())+HEAL_BONUS);
const maxHP=()=>40+(G.lv-1)*8+gearBonus('hat');
const maxPW=()=>10+(G.lv-1);
const atkOf=()=>6+(G.lv-1)*1.5+G.sickle*2+gearBonus('weapon');
const defOf=()=>3+(G.lv-1)*.8+gearBonus('shirt');
const xpNext=()=>Math.floor(15*G.lv**1.5);

