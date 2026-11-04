'use strict';
function statusTags(){
  const out=[];
  for(const k of CROP_IDS){const n=setCount(k);if(n>=2)out.push(`<span class="set">ชุด${CROPS[k].name} ${n}/3: ${n===3?CROPS[k].set3:CROPS[k].set2}</span>`)}
  if(G.power)out.push(`<span>พลัง: ${FRUITS[G.power].skill}</span>`);
  if(bt){const s=bt.status;if(s.poison>0)out.push(`<span class="bad">ติดพิษ ${s.poison} เทิร์น</span>`);if(s.blind>0)out.push(`<span class="bad">ตาพร่า ${s.blind} เทิร์น</span>`);if(s.stun)out.push('<span class="bad">มึนงง</span>');if(bt.guard)out.push('<span>ป้องกัน</span>');if(bt.reflect)out.push('<span>สะท้อน</span>')}
  return out.join('');
}
function renderStatus(){
  if(!G){$('#status').innerHTML='';$('#info').textContent='';$('#seeds').innerHTML='';return}
  const mh=maxHP(),mp=maxPW();
  G.hp=Math.min(G.hp,mh);G.pw=Math.min(G.pw,mp);
  $('#status').innerHTML=`<div class="row"><b>ชาวนา Lv ${G.lv}</b><small>EXP ${G.xp}/${xpNext()}</small></div>
    <div class="row"><small>HP ${G.hp}/${mh}</small><small>พลัง ${G.pw}/${mp}</small></div>
    <div class="bar hp ${G.hp/mh<.3?'low':''}"><i style="width:${G.hp/mh*100}%"></i></div>
    <div class="bar pw"><i style="width:${G.pw/mp*100}%"></i></div>
    <div class="tags">${statusTags()}</div>`;
  $('#info').innerHTML=`วันที่ ${G.day} · <span class="m">หมอกระดับ ${mist()}</span> · <b>${G.gold} G</b> · เศษอุกกาบาต ${G.shards}`;
}
function renderSeeds(){
  const box=$('#seeds');
  if(!G||mode!=='map'){box.innerHTML='';return}
  box.innerHTML='';
  CROP_IDS.forEach(k=>{const b=document.createElement('button');b.type='button';b.textContent=`เมล็ด${CROPS[k].name} ${G.seeds[k]}`;
    if(G.sel===k)b.className='on';b.addEventListener('click',()=>{G.sel=k;sfx.move();renderSeeds();cv.focus({preventScroll:true})});box.appendChild(b)});
}
function setMsg(t,who=''){$('#msg').textContent=t;$('#who').textContent=who;$('#hint').textContent=''}
let UI=null;
function choose(items,o={}){
  return new Promise(res=>{
    const list=o.cancel?[...items,{label:'◂ กลับ',value:null}]:items;
    let sel=Math.max(0,list.findIndex(i=>!i.disabled));
    const box=$('#menu');box.innerHTML='';box.style.gridTemplateColumns=o.cols?`repeat(${o.cols},minmax(0,1fr))`:'';
    const paint=(s=true)=>{[...box.children].forEach((b,i)=>b.classList.toggle('sel',i===sel));if(s)box.children[sel]?.scrollIntoView({block:'nearest'})};
    const done=v=>{UI=null;box.innerHTML='';res(v)};
    const confirm=()=>{const it=list[sel];if(!it||it.disabled){sfx.back();return}sfx.ok();if(it.run)it.run();done(it.value)};
    list.forEach((it,i)=>{const b=document.createElement('button');b.type='button';
      b.innerHTML='<span></span>'+(it.sub?'<small></small>':'');b.firstChild.textContent=it.label;if(it.sub)b.lastChild.textContent=it.sub;
      if(it.disabled)b.setAttribute('aria-disabled','true');
      b.addEventListener('pointerenter',()=>{if(sel!==i&&!it.disabled){sel=i;paint(false)}});
      b.addEventListener('click',()=>{sel=i;confirm()});box.appendChild(b)});
    UI={move(dx,dy){const cols=o.cols||1,n=list.length;let s=sel;
        for(let k=0;k<n;k++){s=dy?(s+dy*cols+n*cols)%n:(s+dx+n)%n;if(!list[s].disabled)break}
        if(s!==sel){sel=s;sfx.move();paint()}},
      confirm,cancel(){if(o.cancel){sfx.back();done(null)}}};
    paint();
  });
}
async function say(text,who=''){setMsg(text,who);await choose([{label:'ถัดไป',value:1}])}
function setOver(html){$('#over').innerHTML=html}
function showPad(on){$('#pad').classList.toggle('show',on)}

