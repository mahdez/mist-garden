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
const GEAR={
  carrot:{weapon:['ดาบแครอท',3],hat:['หมวกใบแครอท',6],shirt:['เสื้อแครอท',2],cloth:'#e8862e'},
  tomato:{weapon:['ค้อนมะเขือเทศ',4],hat:['หมวกมะเขือเทศ',9],shirt:['เสื้อมะเขือเทศ',3],cloth:'#cf3f3a'},
  pumpkin:{weapon:['กระบองฟักทอง',5],hat:['หมวกฟักทอง',12],shirt:['เกราะฟักทอง',4],cloth:'#b9742a'},
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
  atk:{name:'โจมตี',per:1},
  def:{name:'ป้องกัน',per:1},
  spd:{name:'ความเร็ว',per:.5},
  sta:{name:'SP',per:5},
};
const STAMINA_COST={plant:1,water:1,harvest:1};
const FOOD_STAMINA={carrot:2,tomato:1,pumpkin:6};
const GOLDEN_VEG={name:'ผักทอง',drop:.2,rareDrop:1};
const FRUITS={
  carrot:{name:'ผลปีศาจแครอท',skill:'ตาเหยี่ยว',pw:4,note:'ตีแรง 1.4 เท่า คริติคอลแน่นอน'},
  tomato:{name:'ผลปีศาจมะเขือเทศ',skill:'ระเบิดฉ่ำ',pw:5,note:'ตีแรง 3 เท่า เสีย HP 10%'},
  pumpkin:{name:'ผลปีศาจฟักทอง',skill:'เปลือกเหล็ก',pw:4,note:'ป้องกันและสะท้อน 1.5 เท่าของการโจมตีครั้งถัดไป'},
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

