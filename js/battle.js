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
const aliveFoes=()=>bt.foes.filter(e=>e.hp>0);
async function pickTarget(){
  const list=aliveFoes();
  if(list.length===1){bt.e=list[0];return true}
  setMsg('เลือกเป้าหมาย');
  const t=await choose(list.map(e=>({label:e.name,sub:`HP ${e.hp}/${e.maxhp}`,value:e})),{cancel:true,start:Math.max(0,list.indexOf(bt.e)),onHover:i=>{bt.cursor=i&&i.value||null}});
  if(!t)return false;
  bt.e=t;return true;
}
function hurtEnemy(d,col){
  d=Math.max(1,Math.round(d));const e=bt.e;e.hp=Math.max(0,e.hp-d);bt.eflash=.22;bt.shake=2;pop('e',d);burst(e.px,e.py,col||'#fff',10);renderStatus();return d;
}
function hurtPlayer(d,col){
  bt.dodged=false;
  if(bt.e.status.blind>0&&Math.random()<FOE_BLIND_MISS){
    bt.dodged=true;sfx.miss();setMsg(`${bt.e.name}ตาพร่า ตีพลาด!`);renderStatus();return 0;
  }
  if(Math.random()<dodgeChance()){
    bt.dodged=true;sfx.miss();burst(pos('p').x,pos('p').y,'#d8f0ff',6);setMsg('หลบได้!');renderStatus();return 0;
  }
  d=Math.max(1,Math.round(d));
  if(bt.reflect){bt.reflect=false;hurtEnemy(d*bt.reflectMult,'#ffcf6b')}
  d=Math.max(1,Math.round(d*[1,.9,.8][setTier('broccoli')]));
  if(bt.guard)d=Math.max(1,Math.round(d/2));
  G.hp=Math.max(0,G.hp-d);bt.pflash=.22;bt.shake=CALM?0:4;pop('p',d);const p=pos('p');burst(p.x,p.y,col||'#fff',10);renderStatus();return d;
}
const resistText=()=>bt.dodged?'หลบได้!':'ภูมิคุ้มกันกันไว้ได้!';
function tryStatus(name,turns){
  if(bt.dodged)return false;
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
  const s=bt.status;bt.guard=false;bt.reflect=false;bt.active='p';
  if(!bt.e||bt.e.hp<=0)bt.e=aliveFoes()[0];
  renderStatus();
  const tomato=setCount('tomato');
  if(tomato>=2&&G.hp<maxHP()){const v=Math.min(tomato>=3?4:2,maxHP()-G.hp);G.hp+=v;pop('p','+'+v,'#7fd483');renderStatus();await wait(300)}
  const cure=[0,.5,1][setTier('ginger')];
  if(cure&&(s.poison>0||s.blind>0||s.stun)&&Math.random()<cure){s.poison=0;s.blind=0;s.stun=false;renderStatus();await log('ชุดขิงช่วยให้หายจากสถานะผิดปกติ',560)}
  if(s.poison>0){s.poison--;const d=Math.max(1,Math.round(maxHP()*.06));G.hp=Math.max(0,G.hp-d);bt.pflash=.22;pop('p',d,'#c98cff');renderStatus();await log('พิษเริ่มออกฤทธิ์',520);if(G.hp<=0)return}
  if(s.blind>0)s.blind--;
  if(s.stun){s.stun=false;renderStatus();await log('ยังมึนงงอยู่ ขยับไม่ได้',760);return}
  renderStatus();
  for(;;){
    setMsg('จะทำอะไรดี?',`เทิร์นที่ ${bt.round} · ${bt.first==='p'?'เราออกก่อน':'มอนสเตอร์ออกก่อน'}`);
    const cmd=await choose([{label:'โจมตี',value:'atk'},{label:'สกิล',value:'skill'},{label:'เครื่องมือ',value:'tool'},{label:'กินผัก',value:'eat',disabled:!eatList().length},{label:'ป้องกัน',value:'guard'}],{cols:2});
    if(cmd==='atk'){
      if(!await pickTarget())continue;
      bt.plunge=.25;const r=playerAttack(1);
      if(r.miss){sfx.miss();await log('ตีพลาด!',620);break}
      r.crit?sfx.crit():sfx.hit();setMsg(r.crit?'คริติคอล! โดนจุดสำคัญเต็ม ๆ':`โจมตี${bt.e.name}`);hurtEnemy(r.d);await wait(620);
      if(bt.e.hp>0&&Math.random()<[0,.2,.4][setTier('garlic')]){bt.e.status.poison=3;renderStatus();await log(`ชุดกระเทียมทำให้${bt.e.name}ติดพิษ!`,560)}
      if(bt.e.hp>0&&Math.random()<doubleChance()){
        bt.plunge=.25;const r2=playerAttack(1);
        if(r2.miss){sfx.miss();await log('โจมตีเบิ้ล แต่พลาด!',560)}
        else{sfx.hit();setMsg('เร็วจนโจมตีเบิ้ล!');hurtEnemy(r2.d);await wait(620)}
      }
      break;
    }
    if(cmd==='tool'){
      setMsg(`ใช้เครื่องมืออะไร? SP ${G.stam}/${maxStam()} · ระดับเกษตร ${farmLevel()}`);
      const k=await choose(Object.keys(G.tools).map(id=>({label:TOOLS[id].name,sub:`ธาตุ${TOOLS[id].el} · SP ${TOOLS[id].cost}`,value:id,disabled:G.stam<TOOLS[id].cost})),{cancel:true});
      if(!k)continue;
      if(!await pickTarget())continue;
      const t=TOOLS[k],e=bt.e,isWeak=e.weak===k,oldWeak=e.trans&&WEAKNESS[e.kind].normal===k;
      G.stam-=t.cost;bt.plunge=.25;isWeak?sfx.crit():sfx.hit();
      hurtEnemy(toolPower()*(isWeak?TOOL_WEAK:oldWeak?TOOL_OLD_WEAK:1),t.col);burst(e.px,e.py,t.col,18);
      if(isWeak){e.known=true;if(!e.trans){G.seen[e.kind]=G.seen[e.kind]||{n:0,rare:0};G.seen[e.kind].known=1}}
      renderStatus();
      await log(isWeak?`${t.act}${e.name}! โดนจุดอ่อน${t.el} แรงขึ้นมาก`:oldWeak?`${e.name}ไม่กลัว${t.el}อีกแล้ว แทบไม่สะดุ้ง`:`${t.act}${e.name}`,760);
      break;
    }
    if(cmd==='skill'){
      setMsg(`ใช้สกิลอะไร? SP ${G.stam}/${maxStam()} · MP ${G.pw}/${maxPW()}`);
      const sk=await choose([{label:'ฟันเต็มแรง',sub:'โจมตี 1.8 เท่า · SP 3',value:'slash',disabled:G.stam<3},{label:'ตั้งหลัก',sub:'ฟื้น HP 25% · MP 4',value:'rest',disabled:G.pw<4},...(G.equip.weapon?[(()=>{const w=WEAPON_SKILLS[itemCrop(G.equip.weapon)];return {label:w.name,sub:`${w.note} · SP ${w.cost}`,value:'weapon',disabled:G.stam<w.cost}})()]:[]),...(G.power?[{label:FRUITS[G.power].skill,sub:`${FRUITS[G.power].note} · ${RES_LABEL[FRUITS[G.power].res]} ${FRUITS[G.power].cost}`,value:'power',disabled:G[FRUITS[G.power].res]<FRUITS[G.power].cost}]:[])],{cancel:true});
      if(!sk)continue;
      const selfSkill=sk==='rest'||(sk==='power'&&['reflect','cure'].includes(FRUITS[G.power].type));
      if(!selfSkill&&!await pickTarget())continue;
      if(sk==='weapon'){
        const w=WEAPON_SKILLS[itemCrop(G.equip.weapon)];
        G.stam-=w.cost;renderStatus();bt.plunge=.25;const r=playerAttack(w.mult);
        if(r.miss){sfx.miss();await log(`${w.name}พลาด!`,620);break}
        sfx.crit();setMsg(`${w.name}!`);hurtEnemy(r.d,'#ffcf6b');await wait(420);
        if(bt.e.hp>0){
          if(Math.random()<w.chance){
            bt.e.status[w.status]=w.status==='stun'?true:w.turns;renderStatus();
            await log(`${bt.e.name}${FOE_STATUS_TEXT[w.status]}!`,640);
          }else await log(`${bt.e.name}ต้านไว้ได้`,560);
        }
        break;
      }
      if(sk==='power'){
        const f=FRUITS[G.power];G[f.res]-=f.cost;renderStatus();
        if(f.type==='reflect'){bt.guard=true;bt.reflect=true;bt.reflectMult=f.reflect||1.5;sfx.ok();renderStatus();await log(`${f.skill}! รับความเสียหายครึ่งเดียว และสะท้อนการโจมตีครั้งถัดไป`,760);break}
        if(f.type==='cure'){
          const v=Math.min(Math.round(maxHP()*f.heal),maxHP()-G.hp);G.hp+=v;bt.status.poison=0;bt.status.blind=0;bt.status.stun=false;sfx.heal();pop('p','+'+v,'#7fd483');renderStatus();
          await log(`${f.skill}! ฟื้น HP ${v} และสถานะผิดปกติหายไป`,700);break;
        }
        bt.plunge=.25;sfx.crit();
        if(f.type==='crit'){setMsg(`${f.skill}! เล็งเข้าจุดสำคัญ`);hurtEnemy(playerAttack(f.mult,true).d,'#ffcf6b');await wait(640);break}
        const r=playerAttack(f.mult);
        if(r.miss){await log(`${f.skill}พลาด!`,620);break}
        setMsg(`${f.skill}!`);const dealt=hurtEnemy(r.d,'#ff8a70');
        if(f.type==='blast'){G.hp=Math.max(1,G.hp-Math.round(maxHP()*.1));bt.pflash=.22;setMsg(`${f.skill}! ระเบิดใส่เต็ม ๆ แต่ตัวเองก็เจ็บ`)}
        if(f.type==='drain'){const v=Math.min(Math.round(dealt*f.drain),maxHP()-G.hp);G.hp+=v;pop('p','+'+v,'#7fd483');setMsg(`${f.skill}! ดูด HP กลับมา ${v}`)}
        renderStatus();await wait(620);
        if(f.type==='statusHit'&&bt.e.hp>0){
          if(Math.random()<f.chance){bt.e.status[f.status]=f.status==='stun'?true:f.turns;renderStatus();await log(`${bt.e.name}${FOE_STATUS_TEXT[f.status]}!`,620)}
          else await log(`${bt.e.name}ต้านไว้ได้`,520);
        }
        break;
      }
      if(sk==='slash'){
        G.stam-=3;renderStatus();bt.plunge=.25;const r=playerAttack(1.8);
        if(r.miss){sfx.miss();await log('ฟันพลาด!',620);break}
        sfx.crit();setMsg(r.crit?'ฟันเต็มแรงเข้าจุดสำคัญ!':'ฟันเต็มแรง!');hurtEnemy(r.d,'#ffcf6b');await wait(640);break;
      }
      G.pw-=4;const v=Math.min(Math.round(maxHP()*.25),maxHP()-G.hp);G.hp+=v;sfx.heal();pop('p','+'+v,'#7fd483');const p=pos('p');burst(p.x,p.y,'#7fd483',12);renderStatus();await log('ตั้งหลักหายใจลึก ๆ',620);break;
    }
    if(cmd==='eat'){
      setMsg(`กินอะไรดี? HP ${G.hp}/${maxHP()}`);
      const k=await choose(eatList(),{cancel:true});if(!k)continue;
      const v=eatVeg(k);sfx.heal();pop('p','+'+v,'#7fd483');const p=pos('p');burst(p.x,p.y,'#7fd483',12);renderStatus();await log(k==='golden'?`กิน${GOLDEN_VEG.name} ฟื้น HP MP SP เต็ม!`:FISH[k]||k==='goldFish'?`กิน${foodName(k)} ฟื้น HP และ MP`:`กิน${CROPS[k].name} ฟื้น HP ${v}`,620);break;
    }
    if(cmd==='guard'){bt.guard=true;G.pw=Math.min(maxPW(),G.pw+1);renderStatus();await log('ตั้งท่าป้องกัน รับความเสียหายครึ่งเดียว และได้ MP คืน 1',620);break}
  }
  bt.active=null;renderStatus();
}
async function enemyTurn(e){
  bt.e=e;bt.active='e';e.turns++;renderStatus();
  if(e.status.poison>0){
    e.status.poison--;hurtEnemy(e.maxhp*FOE_POISON_DAMAGE,'#c98cff');
    await log(`${e.name}โดนพิษกัดกิน`,560);
    if(e.hp<=0){bt.active=null;return}
  }
  if(e.status.blind>0)e.status.blind--;
  if(e.status.stun){
    e.status.stun=false;renderStatus();
    await log(`${e.name}มึนงง เสียเทิร์นนี้`,760);bt.active=null;return;
  }
  const hit=(mult=1)=>e.atk*mult*rand(.9,1.1)-defOf()/2;
  if(e.kind==='tomato'){
    if(e.charging){
      e.charging=false;sfx.boom();setMsg('ตูม! มะเขือเทศระเบิดกระจาย!');burst(e.px,e.py,'#d9413f',40);hurtPlayer(hit(2.6),'#ff8a7a');e.hp=0;e.boomed=true;renderStatus();await wait(1000);bt.active=null;return;
    }
    if(e.turns>=3||e.hp<e.maxhp*.5){e.charging=true;sfx.enc();await log(`${e.name}บวมเป่ง! ฆ่ามันให้ทันในเทิร์นนี้ หรือสั่งป้องกัน`,1200);bt.active=null;return}
    if(Math.random()<.35){setMsg(`${e.name}พ่นน้ำเปรี้ยว!`);sfx.hit();bt.elunge=.25;hurtPlayer(hit(.6),'#c98cff');const ok=tryStatus('poison',3);await log(ok?'ติดพิษ 3 เทิร์น!':resistText(),720);bt.active=null;return}
  }
  const ai=MONSTERS[e.kind].ai||{};
  if(ai.regen&&e.hp<e.maxhp){
    const v=Math.min(Math.round(e.maxhp*ai.regen),e.maxhp-e.hp);e.hp+=v;pop('e','+'+v,'#7fd483');renderStatus();
    await log(`${e.name}งอกใหม่ ฟื้น HP ${v}`,560);
  }
  if(ai.charge){
    if(e.charging){
      e.charging=false;setMsg(`${e.name}${ai.charge.slam}`);sfx.crit();bt.elunge=.3;hurtPlayer(hit(ai.charge.mult));
      if(ai.charge.stun&&!bt.guard&&G.hp>0){const ok=tryStatus('stun',true);await log(ok?'มึนงง เสียเทิร์นถัดไป!':resistText(),800)}else await wait(760);
      bt.active=null;return;
    }
    if(e.turns%3===0){e.charging=true;sfx.enc();await log(`${e.name}${ai.charge.warn}`,1200);bt.active=null;return}
  }
  let roll=Math.random();
  if(ai.double){
    if(roll<ai.double.chance){setMsg(`${e.name}${ai.double.text}`);bt.elunge=.25;sfx.hit();hurtPlayer(hit(.6));await wait(260);sfx.hit();bt.elunge=.25;hurtPlayer(hit(.6));await wait(520);bt.active=null;return}
    roll-=ai.double.chance;
  }
  if(ai.blind){
    if(roll<ai.blind.chance){setMsg(`${e.name}${ai.blind.text}`);bt.elunge=.25;hurtPlayer(hit(.4));const ok=tryStatus('blind',3);await log(ok?'ตาพร่า ตีพลาดง่ายขึ้น 3 เทิร์น!':resistText(),760);bt.active=null;return}
    roll-=ai.blind.chance;
  }
  if(ai.poison&&roll<ai.poison.chance){
    setMsg(`${e.name}${ai.poison.text}`);sfx.hit();bt.elunge=.25;hurtPlayer(hit(.6),'#c98cff');const ok=tryStatus('poison',3);await log(ok?'ติดพิษ 3 เทิร์น!':resistText(),720);bt.active=null;return;
  }
  bt.elunge=.25;sfx.hit();setMsg(`${e.name}โจมตี${bt.guard?' แต่กันไว้ได้':''}`);hurtPlayer(hit());await wait(620);bt.active=null;
}
function makeFoe(spec,slot,total){
  const{kind,rare,trans}=spec,L=mist(),m=MONSTERS[kind],sc=(1+.15*(L-1))*(rare?1.5:1)*(trans?TRANSCEND_POWER:1);
  return {kind,rare,trans,boss:!!m.boss,known:false,weak:WEAKNESS[kind][trans?'transcended':'normal'],name:(rare?`${(CROPS[kind]||FISH[kind]).name}ทองคำ`:m.name)+(trans?' ก้าวข้าม':''),maxhp:Math.round(m.hp*sc),hp:Math.round(m.hp*sc),atk:m.atk*sc,def:m.def*sc,spd:m.spd,xp:Math.round(m.xp*sc*(rare?2:1)),gold:Math.round(m.gold*sc*(rare?2:1)),slot,px:FOE_SLOTS[total][slot][0],py:FOE_SLOTS[total][slot][1],turns:0,charging:false,boomed:false,status:{blind:0,poison:0,stun:false}};
}
// Accepts one monster (kind, rare, trans) or a list of {kind, rare, trans}. At most MAX_FOES fight at once; the rest step in as others fall.
async function battle(kind,rare,trans=false){
  const specs=Array.isArray(kind)?kind:[{kind,rare,trans}];
  const shown=Math.min(MAX_FOES,specs.length);
  await fadeTo(1,160);
  const foes=specs.slice(0,shown).map((sp,i)=>makeFoe(sp,i,shown));
  const queue=specs.slice(shown).map(sp=>makeFoe(sp,0,shown));
  const all=[...foes,...queue];
  bt={e:foes[0],foes,queue,cursor:null,fx:[],floats:[],round:1,active:null,shake:0,eflash:0,pflash:0,elunge:0,plunge:0,guard:false,reflect:false,reflectMult:1.5,status:{poison:0,blind:0,stun:false}};
  mode='battle';renderSeeds();renderStatus();
  await fadeTo(0,160);
  const fastest=Math.max(...all.map(e=>e.spd));
  await log(all.length>1?`มอนสเตอร์ ${all.length} ตัวโผล่ออกมาจากดิน!`:all[0].rare?`ร่างหายาก! ${all[0].name}โผล่ออกมาจากดิน!`:`${all[0].name}โผล่ออกมาจากดิน!`,800);
  if(all.some(e=>e.trans))await log('มีตัวที่ดูดพลังอุกกาบาตจนก้าวข้ามจุดอ่อนเดิม! ต้องหาจุดอ่อนใหม่',1100);
  let res=null;
  const risk=riskOf(all);
  if(spdOf()>fastest){
    setMsg(`ความเสี่ยง: ${risk.name} (พลังรวม ${playerCP()} ต่อ ${totalCP(all)}) เราเร็วกว่า ถอยได้โดยไม่เสียอะไร และกลับมาสู้ตัวเดิมได้`);
    if(!await choose([{label:'สู้เลย',value:1},{label:'ถอยไปก่อน',value:0}]))res='retreat';
  }else await log(`เราไม่เร็วกว่ามอนสเตอร์ (ความเร็ว ${spdOf()} ต่อ ${fastest}) ถอยไม่ได้ ต้องสู้!`,1000);
  const reinforce=()=>{
    for(let i=0;i<bt.foes.length&&bt.queue.length;i++)if(bt.foes[i].hp<=0){
      const n=bt.queue.shift();Object.assign(n,{slot:i,px:bt.foes[i].px,py:bt.foes[i].py});bt.foes[i]=n;
    }
  };
  if(!res)outer:for(;;){
    const order=[{s:bt.round===1&&perkTier('spd')>=1?99:spdOf()+rand(0,4)},...aliveFoes().map(e=>({e,s:e.charging?-99:e.spd+rand(0,4)}))].sort((a,b)=>b.s-a.s);
    bt.first=order[0].e?'e':'p';
    for(const o of order){
      if(o.e&&o.e.hp<=0)continue;
      if(o.e)await enemyTurn(o.e);else await playerTurn();
      if(G.hp<=0){res='lose';break outer}
      if(!aliveFoes().length){
        reinforce();
        if(!aliveFoes().length){res=all.some(e=>!e.boomed)?'win':'boom';break outer}
        await log('มีมอนสเตอร์ตัวใหม่เข้ามาแทน!',700);
        continue outer;
      }
    }
    reinforce();
    bt.round++;
  }
  bt.active=null;
  const boomed=all.filter(e=>e.boomed&&e.hp<=0);
  if(res==='win'||res==='boom'){
    if(boomed.length){
      const g=boomed.reduce((a,e)=>a+Math.round(e.gold/2),0);G.gold+=g;renderStatus();
      await say(boomed.length>1?`มอนสเตอร์ ${boomed.length} ตัวระเบิดไปแล้ว ของดรอปกระจุยหมด เก็บได้แค่ทอง ${g} G`:`${boomed[0].name}ระเบิดไปแล้ว ของดรอปกระจุยหมด เก็บได้แค่ทอง ${g} G`);
    }
    const won=all.filter(e=>!e.boomed);
    if(won.length)await victory(won);
  }
  if(res==='lose')await say('หมดแรงแล้ว...');
  await fadeTo(1,160);
  bt=null;mode='script';renderStatus();
  await fadeTo(0,160);
  return res;
}
async function victory(list){
  if(list[0].boss)return bossVictory(list[0]);
  sfx.win();
  let xp=0,gold=0,shards=0;
  for(const e of list){
    xp+=e.xp;gold+=e.gold;
    G.seen[e.kind]=G.seen[e.kind]||{n:0,rare:0};
    G.seen[e.kind][e.rare?'rare':'n']++;
    shards+=(e.rare?2:Math.random()<.25?1:0)+(e.trans?1:0);
  }
  G.gold+=gold;G.shards+=shards;
  const up=gainXP(xp);renderStatus();
  await say(`ชนะแล้ว${list.length>1?` ${list.length} ตัว`:''}! ได้ ${xp} EXP และ ${gold} G${shards?` และเศษอุกกาบาต ${shards} ชิ้น`:''}`);
  if(up){
    setMsg(`เลเวลอัปเป็น Lv ${G.lv}! HP และ MP ฟื้นเต็ม ได้แต้มสถานะรวม ${G.points} แต้ม`);
    if(await choose([{label:'อัปสถานะเลย',value:1},{label:'ไว้ทีหลัง',value:0}]))await allocMenu();
  }
  for(const e of list)await foeDrops(e);
}
async function foeDrops(e){
  if(MONSTERS[e.kind].fish){
    G.fish[e.kind]++;if(e.rare)G.goldFish++;
    await say(`ได้${FISH[e.kind].name} 1 ตัว${e.rare?' และปลาทอง 1 ตัว':''} จากการปราบมอนปลา`,'ของดรอป');
    if(Math.random()<GOLDEN_VEG.drop){G.golden++;await say(`ได้รับ ${GOLDEN_VEG.name}! กินแล้วฟื้น HP MP SP เต็ม เก็บไว้ในเมนูกินผัก`,'ของดรอป')}
    return;
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
    const canWear=meetsReq(id);
    setMsg(`ได้รับ ${name}! ${itemInfo(id)} · ${reqText(id)}`,'ของดรอป');
    const a=await choose([{label:'ใส่เลย',sub:canWear?'':'สถานะยังไม่ถึง',value:1,disabled:!canWear},{label:'เก็บไว้ก่อน',value:0}]);
    if(a){G.equip[slot]=id;renderStatus()}
    const n=SLOTS.filter(s=>G.items[itemId(kind,s)]).length;
    if(n===2)await say(`รู้จักชุด${CROPS[kind].name}แล้ว ใส่ 2 ชิ้นได้โบนัส ${CROPS[kind].set2}`,'ชุดไอเทม');
    return;
  }
  if(G.items[id]<6){G.items[id]++;renderStatus();await say(`ได้ ${name} ซ้ำ นำมาหลอมเป็น +${G.items[id]-1} แล้ว`,'ของดรอป');return}
  G.gold+=20;renderStatus();await say(`${name} เต็มขั้นแล้ว ขายได้ 20 G`,'ของดรอป');
}

