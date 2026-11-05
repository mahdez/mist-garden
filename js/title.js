'use strict';
async function titleScreen(){
  mode='title';G=null;bt=null;fade=0;renderStatus();showPad(false);
  setOver('<h1>สวนในหมอก</h1><p>ปลูกผัก เก็บเกี่ยว และลุ้นว่าต้นไหนจะลุกขึ้นมาสู้</p>');
  setMsg('เลือกเมนูเพื่อเริ่มเล่น');
  $('#hint').textContent='คีย์บอร์ด: ลูกศรเลื่อน · Enter เลือก · X กลับ';
  let s,v;
  const enter=g=>{setOver('');const upgraded=normalizeSave(g);G=g;const removed=removeUnmetGear();Object.assign(P,{x:g.x,y:g.y,fx:g.x,fy:g.y,path:null,moving:false});save();renderStatus();mode='map';renderSeeds();showPad(true);note(removed.length?`ถอด ${removed.join(', ')} เพราะสถานะยังไม่ถึง ลงแต้มแล้วใส่ใหม่ได้`:upgraded?`อัปเดตใหม่! ได้แต้มสถานะ ${g.points} แต้ม อัปได้ที่ เมนู → สถานะ`:'กลับมาที่ฟาร์มแล้ว');mapHint()};
  for(;;){
    s=loadSave();
    setMsg('เลือกเมนูเพื่อเริ่มเล่น');
    $('#hint').textContent='คีย์บอร์ด: ลูกศรเลื่อน · Enter เลือก · X กลับ';
    v=await choose([...(s?[{label:'เล่นต่อ',sub:`วันที่ ${s.day} · Lv ${s.lv} · ${s.gold} G`,value:'load'}]:[]),...(loadBackups().length?[{label:'กู้เซฟสำรอง',sub:`เก็บอัตโนมัติ ${loadBackups().length} ชุด`,value:'restore'}]:[]),{label:'ใส่รหัสเซฟ',sub:'โหลดเซฟที่สำรองไว้',value:'code'},{label:'เริ่มฟาร์มใหม่',value:'new'},{label:'เริ่มที่วันที่ 19',sub:'Lv 5 · 400 G · ไว้เล่นต่อเมื่อเซฟหาย',value:'mid'}]);
    if(v==='load')return enter(s);
    if(v==='code'){const g=await importPanel();if(g){if(s)pushBackup(s);return enter(g)}continue}
    if(v==='restore'){
      setMsg('เลือกเช้าที่จะกลับไป เซฟปัจจุบันจะถูกเก็บเป็นเซฟสำรองแทน');
      const b=await choose(loadBackups().map(g=>({label:`เช้าวันที่ ${g.day}`,sub:`Lv ${g.lv} · ${g.gold} G`,value:g})),{cancel:true});
      if(!b)continue;
      if(s)pushBackup(s);
      return enter(b);
    }
    if(s){
      setMsg(`เซฟวันที่ ${s.day} จะถูกทับ เริ่มใหม่จริงไหม?`);
      if(!await choose([{label:'ไม่ กลับไปก่อน',value:0},{label:'ทับเซฟเดิม',value:1}]))continue;
      pushBackup(s);
    }
    break;
  }
  setOver('');
  if(v==='mid'){
    const g=newGame();Object.assign(g,{points:12,day:19,lv:5,gold:400,land:1,harvests:40,seeds:{carrot:12,tomato:6,pumpkin:2}});
    G=g;g.hp=maxHP();g.pw=maxPW();g.stam=maxStam();return enter(g);
  }
  G=newGame();Object.assign(P,{x:4,y:5,fx:4,fy:5,dir:'down',path:null,moving:false});renderStatus();
  mode='script';
  await say('เราเป็นชาวนาธรรมดา ปลูกผักขายไปวัน ๆ จนคืนหนึ่งอุกกาบาตตกลงมาตามจุดต่าง ๆ ทั่วโลก');
  await say('หมอกสีม่วงจากอุกกาบาตปกคลุมไปทุกที่ ผักบางต้นกลายพันธุ์เป็นมอนสเตอร์ และไม่มีใครรู้ว่าเป็นต้นไหนจนกว่าจะเก็บเกี่ยว');
  await say('ถึงอย่างนั้นชีวิตก็ต้องไปต่อ ไปปลูกแครอทที่แปลงตรงกลาง รดน้ำ แล้วเข้าบ้านไปนอน');
  mode='map';renderSeeds();showPad(true);note('เริ่มจากคลิกที่ดินในแปลงเพื่อปลูกแครอท');mapHint();saveSoon();
}

