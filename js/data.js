'use strict';
const CROPS={
  carrot:{name:'แครอท',unit:'หัว',base:1,extra:[[3,.05],[2,.20]],seed:5,sell:12,days:2,eat:10,
    fact:'แครอทมีเบตาแคโรทีน ร่างกายเปลี่ยนเป็นวิตามิน A ซึ่งจำเป็นต่อการมองเห็น',
    power:'ตาไว',set2:'โอกาสคริติคอล +15%',set3:'ตีไม่พลาด และคริติคอลแรงขึ้น'},
  tomato:{name:'มะเขือเทศ',unit:'ผล',base:3,extra:[[6,.05],[5,.20],[4,.35]],seed:12,sell:10,days:3,eat:6,
    fact:'มะเขือเทศมีวิตามิน C ซึ่งร่างกายใช้สร้างคอลลาเจนและสมานแผล',
    power:'แผลหายไว',set2:'ฟื้น HP 2 ทุกเทิร์น',set3:'ฟื้น HP 4 ทุกเทิร์น'},
  pumpkin:{name:'ฟักทอง',unit:'ลูก',base:1,extra:[[3,.02],[2,.10]],seed:25,sell:70,days:4,eat:35,
    fact:'ฟักทองมีเบตาแคโรทีนและวิตามิน C ซึ่งมีส่วนช่วยระบบภูมิคุ้มกัน',
    power:'ภูมิคุ้มกันดี',set2:'ลดโอกาสติดสถานะ 50%',set3:'กันสถานะผิดปกติทั้งหมด'},
};
const CROP_IDS=['carrot','tomato','pumpkin'];
const SLOTS=['weapon','hat','shirt'];
const SLOT_NAME={weapon:'อาวุธ',hat:'หมวก',shirt:'เสื้อ'};
// Each piece: [name, main stat, bonus stats, required invested stat points].
const GEAR={
  carrot:{weapon:['ดาบแครอท',3,{spd:.5},{spd:1}],hat:['หมวกใบแครอท',6,{spd:.5},{}],shirt:['เสื้อแครอท',2,{sta:5},{}],cloth:'#e8862e'},
  tomato:{weapon:['ค้อนมะเขือเทศ',4,{hp:5},{atk:2}],hat:['หมวกมะเขือเทศ',9,{pw:2},{hp:1}],shirt:['เสื้อมะเขือเทศ',3,{hp:5},{def:1}],cloth:'#cf3f3a'},
  pumpkin:{weapon:['กระบองฟักทอง',5,{def:1},{atk:4}],hat:['หมวกฟักทอง',12,{def:1},{hp:2}],shirt:['เกราะฟักทอง',4,{hp:6},{def:3}],cloth:'#b9742a'},
};
const itemId=(crop,slot)=>crop+'_'+slot;
const itemCrop=id=>id.split('_')[0];
const itemSlot=id=>id.split('_')[1];
const itemName=id=>GEAR[itemCrop(id)][itemSlot(id)][0];
const MONSTERS={
  carrot:{name:'แครอทคลั่ง',hp:22,atk:7,def:1,spd:8,xp:8,gold:12},
  tomato:{name:'มะเขือเทศระเบิด',hp:20,atk:8,def:1,spd:5,xp:14,gold:28},
  pumpkin:{name:'ฟักทองยักษ์',hp:55,atk:11,def:4,spd:3,xp:30,gold:60},
};
const POINTS_PER_LEVEL=3;
const STATS={
  hp:{name:'HP สูงสุด',per:6},
  pw:{name:'MP',per:2},
  atk:{name:'STR (โจมตี)',per:1},
  def:{name:'ป้องกัน',per:1},
  spd:{name:'ความเร็ว',per:.5},
  sta:{name:'SP',per:5},
};
// Each stat unlocks a special ability at these invested point totals.
const PERKS={
  atk:[{at:5,name:'แรงบ้าคลั่ง',note:'ทำงาน 2 ช่องต่อ 1 SP'},{at:10,name:'คลั่งสุดขีด',note:'ทำงาน 3 ช่องต่อ 1 SP'},{at:20,name:'แรงช้างสาร',note:'ทำงาน 4 ช่องต่อ 1 SP'},{at:50,name:'เทพแห่งไร่',note:'ทำงาน 5 ช่องต่อ 1 SP'}],
  def:[{at:5,name:'กำบังสวน',note:'ถ้าแพ้ ผักรอบข้างเสียไม่เกิน 1 ต้น'},{at:10,name:'ป้อมปราการสวน',note:'ถ้าแพ้ ผักรอบข้างไม่เสียเลย'}],
  hp:[{at:5,name:'ฟื้นตัวไว',note:'สลบแล้วตื่นมา HP และ SP เต็ม'},{at:10,name:'ท้องเหล็ก',note:'กินผักฟื้น HP เพิ่ม 50%'}],
  pw:[{at:5,name:'สัมผัสธรรมชาติ',note:'ผักที่รดน้ำ 20% โตเพิ่มอีกวัน'},{at:10,name:'ลมหายใจผืนดิน',note:'ผักที่รดน้ำ 40% โตเพิ่มอีกวัน'}],
  spd:[{at:5,name:'เท้าไว',note:'เดินเร็วขึ้น และออกก่อนเสมอในเทิร์นแรก'},{at:10,name:'มือไว',note:'20% ทำงานโดยไม่ใช้ SP'}],
  sta:[{at:5,name:'มือเก๋า',note:'10% ได้ผลผลิตเพิ่ม 1'},{at:10,name:'เกษตรกรเซียน',note:'20% ได้ผลผลิตเพิ่ม 1'}],
};
// Speed points also add battle chances per point invested.
const SPD_DOUBLE_PER_POINT=.04,SPD_DODGE_PER_POINT=.03;
const STAT_SHORT={hp:'HP',pw:'MP',atk:'STR',def:'ป้องกัน',spd:'ความเร็ว',sta:'SP'};
const SLOT_MAIN={weapon:'atk',hat:'hp',shirt:'def'};
// Combat power is display-only: it never changes damage or unlocks anything.
const CP_WEIGHT={hp:1,atk:5,def:4,spd:3};
const RISK_LEVELS=[{min:1,name:'ง่าย',cls:'set'},{min:.7,name:'สูสี',cls:''},{min:0,name:'อันตราย',cls:'bad'}];
// Farm tools deal fixed damage from farming experience, so they work for every build.
const TOOLS={
  water:{name:'ถังน้ำ',el:'น้ำ',cost:4,price:0,act:'สาดน้ำใส่',col:'#7fb8e8'},
  fire:{name:'คบเพลิง',el:'ไฟ',cost:4,price:30,act:'ใช้คบเพลิงเผา',col:'#ff8a3c'},
  salt:{name:'ถุงเกลือ',el:'เกลือ',cost:4,price:40,act:'โรยเกลือใส่',col:'#f4f0e6'},
  dig:{name:'พลั่วขุดราก',el:'ขุดราก',cost:4,price:50,act:'ใช้พลั่วขุดราก',col:'#c9a673'},
};
const TOOL_BASE=6,TOOL_PER_FARM_LEVEL=2,HARVESTS_PER_FARM_LEVEL=25,MAX_FARM_LEVEL=10,TOOL_WEAK=1.5,TOOL_OLD_WEAK=.5;
const WEAKNESS={
  carrot:{normal:'water',reason:'แครอทเป็นพืชหัว รากเน่าง่ายเมื่อดินแฉะน้ำขัง',transcended:'fire'},
  tomato:{normal:'fire',reason:'มะเขือเทศไม่ทนร้อนจัด ดอกร่วงและติดผลยากเมื่ออากาศร้อนมาก',transcended:'salt'},
  pumpkin:{normal:'dig',reason:'ฟักทองมีระบบรากตื้น รากจึงเสียหายง่ายเมื่อถูกรบกวน',transcended:'water'},
};
const TRANSCEND_POWER=1.25;
const STAMINA_COST={plant:1,water:1,harvest:1};
const FOOD_STAMINA={carrot:2,tomato:1,pumpkin:6};
const GOLDEN_VEG={name:'ผักทอง',drop:.2,rareDrop:1};
// Weapon, fruit, and physical attack skills spend SP (stam). Recovery skills spend MP (pw).
const WEAPON_SKILLS={
  carrot:{name:'ฟันแสบตา',cost:4,mult:1,status:'blind',turns:3,chance:.8,note:'80% ทำให้ตาพร่า 3 เทิร์น ตีพลาดง่าย'},
  tomato:{name:'ทุบน้ำเปรี้ยว',cost:5,mult:1,status:'poison',turns:3,chance:1,note:'ทำให้ติดพิษ 3 เทิร์น เสีย HP ทุกเทิร์น'},
  pumpkin:{name:'ทุบหัวมึน',cost:6,mult:1.2,status:'stun',turns:1,chance:.5,note:'50% ทำให้มึนงง เสียเทิร์นถัดไป'},
};
const FOE_STATUS_TEXT={blind:'ตาพร่า',poison:'ติดพิษ',stun:'มึนงง'};
const FOE_BLIND_MISS=.4,FOE_POISON_DAMAGE=.08;
const RES_LABEL={stam:'SP',pw:'MP'};
const FRUITS={
  carrot:{name:'ผลปีศาจแครอท',skill:'ตาเหยี่ยว',res:'stam',cost:4,note:'ตีแรง 1.4 เท่า คริติคอลแน่นอน'},
  tomato:{name:'ผลปีศาจมะเขือเทศ',skill:'ระเบิดฉ่ำ',res:'stam',cost:5,note:'ตีแรง 3 เท่า เสีย HP 10%'},
  pumpkin:{name:'ผลปีศาจฟักทอง',skill:'เปลือกเหล็ก',res:'stam',cost:4,note:'ป้องกันและสะท้อน 1.5 เท่าของการโจมตีครั้งถัดไป'},
};
const SPR={
  carrot:{pal:{k:'#3a1a08',o:'#f28a2c',d:'#c9651a',l:'#ffb45e',g:'#3fa34d',h:'#2a7a3a',w:'#ffffff',e:'#1a0a04'},gold:{o:'#ffd34a',d:'#c99a1f',l:'#fff0a0',g:'#c4a8f5',h:'#8d6fd0'},rows:[
    ".....g..g..g....","......g.g.g.....","......gghgg.....",".......ggg......",".....kkkkkk.....","....kooooook....","....kloooodk....","....koweoweok...","....koooooodk...","....kookkkodk...",".....koooodk....",".....kloodk.....","......koodk.....","......kodk......",".......kk......."]},
  tomato:{pal:{k:'#3a0a0a',r:'#d9413f',d:'#a52d2c',l:'#ff8a7a',g:'#3fa34d',w:'#ffffff',e:'#1a0505'},gold:{r:'#ffd34a',d:'#c99a1f',l:'#fff0a0',g:'#c4a8f5'},rows:[
    "......g.gg......",".....ggggg......","....kkggggkk....","..kkrrrggrrrkk..",".krrlrrrrrrrrrk.",".krlrrrrrrrrrdk.","krrrwerrrrwerrdk","krrrrrrrrrrrrrdk","krrkwkwkwkwkrrdk","krrrkwkwkwkrrrdk",".krrrkkkkkrrrdk.",".krrrrrrrrrrddk.","..kkdddddddkk...","....kkkkkkkk...."]},
  pumpkin:{pal:{k:'#2e1505',o:'#e88a2a',d:'#b5621a',y:'#ffe15c',h:'#3f8a3a'},gold:{o:'#ffd34a',d:'#c99a1f',h:'#c4a8f5',y:'#ffffff'},rows:[
    ".......hh.......","......hhh.......","...kkkkhhkkkk...","..koodooodoook..",".koodoooodooodk.",".kodoooooooodok.","koodkkooookkdook","koodkykoookykdok","koodoooooooodok.","kodookokokokodok","koodookkkkkkodok",".koodoooooodook.","..kkddddddddkk..","....kkkkkkkk...."]},
};
const MAP=[
"TTTTTTTTTTTTTTTTTTTT",
"T.RRRRR.....aaaa...T",
"T.RRRRR.....aaaa...T",
"T.WWDWW.....cccc...T",
"T...,........,,....T",
"T...,,,,,,,,,,,....T",
"T..................T",
"T..................T",
"T.............b....T",
"T..o...............T",
"T..................T",
"T..................T",
"T~~~~..........MM..T",
"T~~~~..........MM..T",
"TTTTTTTTTTTTTTTTTTTT"];
const SOLID='TRWDacbo~M';
const PX=6,PY=6;

