'use strict';
let bt=null,BG=null;
function fieldBg(){
  if(BG)return BG;
  const e=mk(W,H),g=e.getContext('2d'),r=seeded(41);
  const F=(x,y,w,h,k)=>{g.fillStyle=k;g.fillRect(x,y,w,h)};
  F(0,0,W,H,'#6d5a92');F(0,30,W,30,'#7f6ba3');F(0,60,W,20,'#9483b3');
  for(let i=0;i<22;i++){const x=r()*W|0,w=16+r()*24|0,h=14+r()*24|0;F(x,86-h,w,h+2,'#4f6a58')}
  for(let x=4;x<W;x+=26){F(x,74,3,18,'#6d4f33');}F(0,78,W,2,'#8a6a45');F(0,85,W,2,'#8a6a45');
  F(0,92,W,148,'#6a4e32');for(let y=100;y<H;y+=14){F(0,y,W,2,'#5a4129');F(0,y+2,W,1,'#7c5c3a')}
  for(let i=0;i<220;i++)F(r()*W|0,92+r()*148|0,2,1,r()>.5?'#7c5c3a':'#533b25');
  for(let i=0;i<14;i++){const x=r()*W|0,y=100+r()*130|0;F(x,y,2,4,'#4fae56');F(x-2,y,2,2,'#4fae56');F(x+2,y-1,2,2,'#2f7f3e')}
  return BG=e;
}
const FARM_POS={x:250,y:128};
const pos=who=>who==='e'?{x:bt.e.px,y:bt.e.py}:{x:FARM_POS.x-(bt.active==='p'?12:0),y:FARM_POS.y};
function burst(x,y,col,n=14){if(CALM)n=5;for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(20,70);bt.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,life:rand(.3,.6),col,z:(rand(1,3)|0)||1})}}
function pop(who,n,col='#ffffff'){const p=pos(who);bt.floats.push({x:p.x,y:p.y-28,t:0,n,col})}
const log=async(t,ms=720)=>{setMsg(t);await wait(ms)};
function hurtEnemy(d,col){
  d=Math.max(1,Math.round(d));const e=bt.e;e.hp=Math.max(0,e.hp-d);bt.eflash=.22;bt.shake=2;pop('e',d);burst(e.px,e.py,col||'#fff',10);renderStatus();return d;
}
function hurtPlayer(d,col){
  d=Math.max(1,Math.round(d));
  if(bt.reflect){bt.reflect=false;hurtEnemy(d*1.5,'#ffcf6b')}
  if(bt.guard)d=Math.max(1,Math.round(d/2));
  G.hp=Math.max(0,G.hp-d);bt.pflash=.22;bt.shake=CALM?0:4;pop('p',d);const p=pos('p');burst(p.x,p.y,col||'#fff',10);renderStatus();return d;
}
function tryStatus(name,turns){
  const n=setCount('pumpkin');
  if(n>=3||(n===2&&Math.random()<.5)){return false}
  bt.status[name]=turns;renderStatus();return true;
}
function playerAttack(mult,sureCrit){
  const carrot=setCount('carrot');
  const hit=carrot>=3?1:bt.status.blind>0?.55:hitChance();
  if(!sureCrit&&Math.random()>hit)return{miss:true};
  const crit=sureCrit||Math.random()<critChance();
  const d=(atkOf()*mult*rand(.92,1.08)-bt.e.def/2)*(crit?(carrot>=3?2:1.6):1);
  return{d,crit};
}
async function playerTurn(){
  const s=bt.status;bt.guard=false;bt.reflect=false;bt.active='p';renderStatus();
  const tomato=setCount('tomato');
  if(tomato>=2&&G.hp<maxHP()){const v=Math.min(tomato>=3?4:2,maxHP()-G.hp);G.hp+=v;pop('p','+'+v,'#7fd483');renderStatus();await wait(300)}
  if(s.poison>0){s.poison--;const d=Math.max(1,Math.round(maxHP()*.06));G.hp=Math.max(0,G.hp-d);bt.pflash=.22;pop('p',d,'#c98cff');renderStatus();await log('พิษเริ่มออกฤทธิ์',520);if(G.hp<=0)return}
  if(s.blind>0)s.blind--;
  if(s.stun){s.stun=false;renderStatus();await log('ยังมึนงงอยู่ ขยับไม่ได้',760);return}
  renderStatus();
  for(;;){
    setMsg('จะทำอะไรดี?',`เทิร์นที่ ${bt.round} · ${bt.first==='p'?'เราออกก่อน':`${bt.e.name}ออกก่อน`}`);
    const cmd=await choose([{label:'โจมตี',value:'atk'},{label:'สกิล',value:'skill'},{label:'กินผัก',value:'eat',disabled:!eatList().length},{label:'ป้องกัน',value:'guard'},{label:'หนี',value:'flee'}],{cols:2});
    if(cmd==='atk'){
      bt.plunge=.25;const r=playerAttack(1);
      if(r.miss){sfx.miss();await log('ตีพลาด!',620);break}
      r.crit?sfx.crit():sfx.hit();setMsg(r.crit?'คริติคอล! โดนจุดสำคัญเต็ม ๆ':`โจมตี${bt.e.name}`);hurtEnemy(r.d);await wait(620);break;
    }
    if(cmd==='skill'){
      setMsg(`ใช้สกิลอะไร? MP ${G.pw}/${maxPW()}`);
      const sk=await choose([{label:'ฟันเต็มแรง',sub:'โจมตี 1.8 เท่า · MP 3',value:'slash',disabled:G.pw<3},{label:'ตั้งหลัก',sub:'ฟื้น HP 25% · MP 4',value:'rest',disabled:G.pw<4},...(G.power?[{label:FRUITS[G.power].skill,sub:`${FRUITS[G.power].note} · MP ${FRUITS[G.power].pw}`,value:'power',disabled:G.pw<FRUITS[G.power].pw}]:[])],{cancel:true});
      if(!sk)continue;
      if(sk==='power'){
        const f=FRUITS[G.power];G.pw-=f.pw;renderStatus();
        if(G.power==='pumpkin'){bt.guard=true;bt.reflect=true;sfx.ok();renderStatus();await log(`${f.skill}! รับความเสียหายครึ่งเดียว และสะท้อนการโจมตีครั้งถัดไป`,760);break}
        bt.plunge=.25;sfx.crit();
        if(G.power==='carrot'){setMsg(`${f.skill}! เล็งเข้าจุดสำคัญ`);hurtEnemy(playerAttack(1.4,true).d,'#ffcf6b');await wait(640);break}
        const r=playerAttack(3);
        if(r.miss){await log(`${f.skill}พลาด!`,620);break}
        setMsg(`${f.skill}! ระเบิดใส่เต็ม ๆ แต่ตัวเองก็เจ็บ`);hurtEnemy(r.d,'#ff8a70');
        G.hp=Math.max(1,G.hp-Math.round(maxHP()*.1));bt.pflash=.22;renderStatus();await wait(700);break;
      }
      if(sk==='slash'){
        G.pw-=3;renderStatus();bt.plunge=.25;const r=playerAttack(1.8);
        if(r.miss){sfx.miss();await log('ฟันพลาด!',620);break}
        sfx.crit();setMsg(r.crit?'ฟันเต็มแรงเข้าจุดสำคัญ!':'ฟันเต็มแรง!');hurtEnemy(r.d,'#ffcf6b');await wait(640);break;
      }
      G.pw-=4;const v=Math.min(Math.round(maxHP()*.25),maxHP()-G.hp);G.hp+=v;sfx.heal();pop('p','+'+v,'#7fd483');const p=pos('p');burst(p.x,p.y,'#7fd483',12);renderStatus();await log('ตั้งหลักหายใจลึก ๆ',620);break;
    }
    if(cmd==='eat'){
      setMsg(`กินอะไรดี? HP ${G.hp}/${maxHP()}`);
      const k=await choose(eatList(),{cancel:true});if(!k)continue;
      const v=eatVeg(k);sfx.heal();pop('p','+'+v,'#7fd483');const p=pos('p');burst(p.x,p.y,'#7fd483',12);renderStatus();await log(k==='golden'?`กิน${GOLDEN_VEG.name} ฟื้น HP MP SP เต็ม!`:`กิน${CROPS[k].name} ฟื้น HP ${v}`,620);break;
    }
    if(cmd==='guard'){bt.guard=true;G.pw=Math.min(maxPW(),G.pw+1);renderStatus();await log('ตั้งท่าป้องกัน รับความเสียหายครึ่งเดียว และได้ MP คืน 1',620);break}
    if(cmd==='flee'){
      if(Math.random()<.65){await log('หนีออกมาได้!',600);bt.fled=true;return}
      await log('หนีไม่พ้น!',600);break;
    }
  }
  bt.active=null;renderStatus();
}
async function enemyTurn(){
  const e=bt.e;bt.active='e';e.turns++;
  const hit=(mult=1)=>e.atk*mult*rand(.9,1.1)-defOf()/2;
  if(e.kind==='tomato'){
    if(e.charging){
      e.charging=false;sfx.boom();setMsg('ตูม! มะเขือเทศระเบิดกระจาย!');burst(e.px,e.py,'#d9413f',40);hurtPlayer(hit(2.6),'#ff8a7a');e.hp=0;bt.boom=true;await wait(1000);return;
    }
    if(e.turns>=3||e.hp<e.maxhp*.5){e.charging=true;sfx.enc();await log(`${e.name}บวมเป่ง! ฆ่ามันให้ทันในเทิร์นนี้ หรือสั่งป้องกัน`,1200);bt.active=null;return}
    if(Math.random()<.35){setMsg(`${e.name}พ่นน้ำเปรี้ยว!`);sfx.hit();bt.elunge=.25;hurtPlayer(hit(.6),'#c98cff');const ok=tryStatus('poison',3);await log(ok?'ติดพิษ 3 เทิร์น!':'ภูมิคุ้มกันกันพิษไว้ได้!',720);bt.active=null;return}
  }
  if(e.kind==='carrot'){
    const r=Math.random();
    if(r<.3){setMsg(`${e.name}ทิ่มรัว 2 ครั้ง!`);bt.elunge=.25;sfx.hit();hurtPlayer(hit(.6));await wait(260);sfx.hit();bt.elunge=.25;hurtPlayer(hit(.6));await wait(520);bt.active=null;return}
    if(r<.5){setMsg(`${e.name}สะบัดดินใส่หน้า!`);bt.elunge=.25;hurtPlayer(hit(.4));const ok=tryStatus('blind',3);await log(ok?'ตาพร่า ตีพลาดง่ายขึ้น 3 เทิร์น!':'ภูมิคุ้มกันกันไว้ได้!',760);bt.active=null;return}
  }
  if(e.kind==='pumpkin'){
    if(e.charging){
      e.charging=false;setMsg(`${e.name}ทุบลงมาเต็มแรง!`);sfx.crit();bt.elunge=.3;hurtPlayer(hit(1.6));
      if(!bt.guard&&G.hp>0){const ok=tryStatus('stun',true);await log(ok?'มึนงง เสียเทิร์นถัดไป!':'ภูมิคุ้มกันดี ไม่มึนงง!',800)}else await wait(760);
      bt.active=null;return;
    }
    if(e.turns%3===0){e.charging=true;sfx.enc();await log(`${e.name}ง้างตัวขึ้นสูง! เทิร์นหน้าควรสั่งป้องกัน`,1200);bt.active=null;return}
  }
  bt.elunge=.25;sfx.hit();setMsg(`${e.name}โจมตี${bt.guard?' แต่กันไว้ได้':''}`);hurtPlayer(hit());await wait(620);bt.active=null;
}
async function battle(kind,rare){
  const L=mist(),m=MONSTERS[kind],sc=(1+.15*(L-1))*(rare?1.5:1);
  await fadeTo(1,160);
  const e={kind,rare,name:(rare?`${CROPS[kind].name}ทองคำ`:m.name),maxhp:Math.round(m.hp*sc),hp:Math.round(m.hp*sc),atk:m.atk*sc,def:m.def*sc,spd:m.spd,xp:Math.round(m.xp*sc*(rare?2:1)),gold:Math.round(m.gold*sc*(rare?2:1)),px:92,py:122,turns:0,charging:false};
  bt={e,fx:[],floats:[],round:1,active:null,shake:0,eflash:0,pflash:0,elunge:0,plunge:0,fled:false,boom:false,guard:false,reflect:false,status:{poison:0,blind:0,stun:false}};
  mode='battle';renderSeeds();renderStatus();
  await fadeTo(0,160);
  await log(rare?`ร่างหายาก! ${e.name}โผล่ออกมาจากดิน!`:`${e.name}โผล่ออกมาจากดิน!`,800);
  let res=null;
  outer:for(;;){
    const order=[{w:'p',s:spdOf()+rand(0,4)},{w:'e',s:e.charging?-99:e.spd+rand(0,4)}].sort((a,b)=>b.s-a.s);
    bt.first=order[0].w;
    for(const o of order){
      if(o.w==='p')await playerTurn();else await enemyTurn();
      if(bt.fled){res='flee';break outer}
      if(G.hp<=0){res='lose';break outer}
      if(e.hp<=0){res=bt.boom?'boom':'win';break outer}
    }
    bt.round++;
  }
  bt.active=null;
  if(res==='win')await victory(e);
  if(res==='boom')await say(`${e.name}ระเบิดไปแล้ว ของดรอปกระจุยหมด เก็บได้แค่ทอง ${Math.round(e.gold/2)} G`),G.gold+=Math.round(e.gold/2),renderStatus();
  if(res==='lose')await say('หมดแรงแล้ว...');
  await fadeTo(1,160);
  bt=null;mode='script';renderStatus();
  await fadeTo(0,160);
  return res;
}
async function victory(e){
  sfx.win();
  G.gold+=e.gold;
  G.seen[e.kind][e.rare?'rare':'n']++;
  const shards=e.rare?2:Math.random()<.25?1:0;G.shards+=shards;
  const up=gainXP(e.xp);renderStatus();
  await say(`ชนะแล้ว! ได้ ${e.xp} EXP และ ${e.gold} G${shards?` และเศษอุกกาบาต ${shards} ชิ้น`:''}`);
  if(up){
    setMsg(`เลเวลอัปเป็น Lv ${G.lv}! HP และ MP ฟื้นเต็ม ได้แต้มสถานะรวม ${G.points} แต้ม`);
    if(await choose([{label:'อัปสถานะเลย',value:1},{label:'ไว้ทีหลัง',value:0}]))await allocMenu();
  }
  if(Math.random()<(e.rare?GOLDEN_VEG.rareDrop:GOLDEN_VEG.drop)){
    G.golden++;
    await say(`ได้รับ ${GOLDEN_VEG.name}! กินแล้วฟื้น HP MP SP เต็ม เก็บไว้ในเมนูกินผัก`,'ของดรอป');
  }
  // Rarer than gear: 15% (50% from golden forms), guaranteed by the 10th win in a row without one.
  G.fruitMiss=G.fruitMiss||{};
  const fruitMissed=G.fruitMiss[e.kind]||0;
  if(fruitMissed>=9||Math.random()<(e.rare?.5:.15)){
    G.fruitMiss[e.kind]=0;G.fruits[e.kind]++;
    await say(`ได้รับ ${FRUITS[e.kind].name}! ของหายาก กินได้ที่ เมนู → ผลปีศาจ`,'ของดรอป');
  }else G.fruitMiss[e.kind]=fruitMissed+1;
  // First win per crop always drops; after that 50%, guaranteed by the third win in a row without one.
  G.dropMiss=G.dropMiss||{};
  const missed=G.dropMiss[e.kind]||0,owned=SLOTS.some(s=>G.items[itemId(e.kind,s)]);
  const drop=e.rare||!owned||missed>=2||Math.random()<.5;
  G.dropMiss[e.kind]=drop?0:missed+1;
  if(drop)await dropItem(e.kind);
}
async function dropItem(kind){
  const missing=SLOTS.filter(s=>!G.items[itemId(kind,s)]);
  const slot=missing.length&&Math.random()<.7?pick(missing):pick(SLOTS);
  const id=itemId(kind,slot),name=itemName(id);
  sfx.coin();
  if(!G.items[id]){
    G.items[id]=1;
    setMsg(`ได้รับ ${name}!`,'ของดรอป');
    const a=await choose([{label:'ใส่เลย',value:1},{label:'เก็บไว้ก่อน',value:0}]);
    if(a){G.equip[slot]=id;renderStatus()}
    const n=SLOTS.filter(s=>G.items[itemId(kind,s)]).length;
    if(n===2)await say(`รู้จักชุด${CROPS[kind].name}แล้ว ใส่ 2 ชิ้นได้โบนัส ${CROPS[kind].set2}`,'ชุดไอเทม');
    return;
  }
  if(G.items[id]<6){G.items[id]++;renderStatus();await say(`ได้ ${name} ซ้ำ นำมาหลอมเป็น +${G.items[id]-1} แล้ว`,'ของดรอป');return}
  G.gold+=20;renderStatus();await say(`${name} เต็มขั้นแล้ว ขายได้ 20 G`,'ของดรอป');
}

