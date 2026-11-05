'use strict';
// Crops added after the original three. Each one unlocks at a mist level.
Object.assign(CROPS,{
  spinach:{name:'ผักโขม',unit:'ต้น',base:1,extra:[[3,.05],[2,.20]],seed:6,sell:15,days:2,eat:10,unlock:1,
    fact:'ผักโขมมีธาตุเหล็ก ซึ่งร่างกายใช้สร้างเม็ดเลือดแดง',
    power:'เลือดแน่น',set2:'HP สูงสุด +15%',set3:'HP สูงสุด +30%'},
  chili:{name:'พริก',unit:'เม็ด',base:4,extra:[[8,.05],[7,.10],[6,.20],[5,.30]],seed:8,sell:5,days:3,eat:5,noFloor:true,unlock:2,
    fact:'พริกมีสารแคปไซซิน ซึ่งทำให้รู้สึกเผ็ดร้อน',
    power:'เลือดร้อน',set2:'โจมตี +10%',set3:'โจมตี +20%'},
  garlic:{name:'กระเทียม',unit:'หัว',base:1,extra:[[3,.05],[2,.20]],seed:15,sell:38,days:3,eat:18,unlock:2,
    fact:'กระเทียมมีสารอัลลิซิน ซึ่งมีฤทธิ์ต้านจุลชีพในงานวิจัย',
    power:'พิษกัดกิน',set2:'โจมตีปกติ 20% ทำให้ติดพิษ',set3:'โจมตีปกติ 40% ทำให้ติดพิษ'},
  sweetpotato:{name:'มันเทศ',unit:'หัว',base:2,extra:[[4,.10],[3,.30]],seed:14,sell:18,days:3,eat:12,unlock:3,
    fact:'มันเทศมีคาร์โบไฮเดรต ซึ่งเป็นแหล่งพลังงานของร่างกาย',
    power:'พลังเหลือล้น',set2:'SP สูงสุด +15',set3:'SP สูงสุด +30'},
  ginger:{name:'ขิง',unit:'แง่ง',base:1,extra:[[3,.05],[2,.20]],seed:18,sell:50,days:4,eat:22,unlock:3,
    fact:'ขิงมีงานวิจัยว่าช่วยบรรเทาอาการคลื่นไส้ได้',
    power:'หายไว',set2:'เริ่มเทิร์น 50% หายสถานะผิดปกติ',set3:'เริ่มเทิร์น หายสถานะผิดปกติเสมอ'},
  broccoli:{name:'บรอกโคลี',unit:'หัว',base:1,extra:[[3,.02],[2,.10]],seed:30,sell:90,days:4,eat:35,unlock:4,
    fact:'บรอกโคลีมีวิตามิน K ซึ่งร่างกายใช้ในกระบวนการแข็งตัวของเลือด',
    power:'แผลปิดไว',set2:'ความเสียหายที่ได้รับ -10%',set3:'ความเสียหายที่ได้รับ -20%'},
});
CROP_IDS.push('spinach','chili','garlic','sweetpotato','ginger','broccoli');
Object.assign(FOOD_STAMINA,{spinach:2,chili:1,garlic:3,sweetpotato:5,ginger:4,broccoli:6});

Object.assign(GEAR,{
  spinach:{weapon:['แส้ก้านผักโขม',3,{hp:4},{}],hat:['หมวกใบผักโขม',7,{def:1},{}],shirt:['เสื้อผักโขม',2,{hp:6},{hp:1}],cloth:'#3e8f4c',art:{hat:'#4fae56',hat2:'#2f7f3e',weapon:'#4fae56'}},
  chili:{weapon:['มีดพริกแดง',4,{spd:.5},{atk:1}],hat:['หมวกพริก',6,{spd:1},{spd:1}],shirt:['เสื้อพริก',2,{spd:.5},{spd:1}],cloth:'#c9302c',art:{hat:'#d9302c',hat2:'#3fa34d',weapon:'#e0352f'}},
  garlic:{weapon:['หอกกระเทียม',4,{def:1},{atk:2}],hat:['หมวกกระเทียม',9,{pw:2},{pw:1}],shirt:['เสื้อกระเทียม',3,{pw:2},{def:1}],cloth:'#e6dfcf',art:{hat:'#f0eadb',hat2:'#b9a9c9',weapon:'#f0eadb'}},
  sweetpotato:{weapon:['ค้อนมันเทศ',5,{sta:5},{atk:3}],hat:['หมวกมันเทศ',10,{sta:5},{sta:1}],shirt:['เสื้อมันเทศ',3,{sta:10},{sta:2}],cloth:'#8a4a8f',art:{hat:'#9a5aa0',hat2:'#6d3a72',weapon:'#9a5aa0'}},
  ginger:{weapon:['ดาบแง่งขิง',6,{spd:.5},{atk:4}],hat:['หมวกขิง',11,{spd:.5},{hp:3}],shirt:['เสื้อขิง',4,{hp:6},{def:3}],cloth:'#c9a35a',art:{hat:'#d9b36a',hat2:'#a07f3e',weapon:'#d9b36a'}},
  broccoli:{weapon:['ค้อนบรอกโคลี',7,{def:1},{atk:5}],hat:['หมวกบรอกโคลี',15,{def:1},{hp:4}],shirt:['เกราะบรอกโคลี',5,{hp:10},{def:5}],cloth:'#2f7f3e',art:{hat:'#2f8f46',hat2:'#1d5a2c',weapon:'#2f8f46'}},
});

Object.assign(WEAPON_SKILLS,{
  spinach:{name:'ฟาดก้านแสบตา',cost:3,mult:.9,status:'blind',turns:2,chance:.7,note:'70% ทำให้ตาพร่า 2 เทิร์น'},
  chili:{name:'แทงพริกเผ็ด',cost:4,mult:1,status:'poison',turns:2,chance:1,note:'ทำให้ติดพิษ 2 เทิร์น'},
  garlic:{name:'แทงกลิ่นฉุน',cost:4,mult:1,status:'poison',turns:3,chance:.8,note:'80% ทำให้ติดพิษ 3 เทิร์น'},
  sweetpotato:{name:'ทุบหัวโต',cost:7,mult:1.3,status:'stun',turns:1,chance:.6,note:'60% ทำให้มึนงง เสียเทิร์นถัดไป'},
  ginger:{name:'ฟันเผ็ดร้อน',cost:5,mult:1.1,status:'blind',turns:3,chance:.9,note:'90% ทำให้ตาพร่า 3 เทิร์น'},
  broccoli:{name:'ทุบสะเทือน',cost:7,mult:1.4,status:'stun',turns:1,chance:.5,note:'50% ทำให้มึนงง เสียเทิร์นถัดไป'},
});

Object.assign(FRUITS.carrot,{type:'crit',mult:1.4});
Object.assign(FRUITS.tomato,{type:'blast',mult:3});
Object.assign(FRUITS.pumpkin,{type:'reflect'});
Object.assign(FRUITS,{
  spinach:{name:'ผลปีศาจผักโขม',skill:'ดูดเลือด',res:'stam',cost:4,type:'drain',mult:1.2,drain:.5,note:'ตีแรง 1.2 เท่า ฟื้น HP ครึ่งหนึ่งของความเสียหาย'},
  chili:{name:'ผลปีศาจพริก',skill:'เปลวเผ็ด',res:'stam',cost:5,type:'statusHit',mult:1.8,status:'poison',turns:3,chance:1,note:'ตีแรง 1.8 เท่า และทำให้ติดพิษ 3 เทิร์น'},
  garlic:{name:'ผลปีศาจกระเทียม',skill:'หมอกฉุน',res:'stam',cost:4,type:'statusHit',mult:1,status:'blind',turns:4,chance:1,note:'ตีแรงปกติ และทำให้ตาพร่า 4 เทิร์น'},
  sweetpotato:{name:'ผลปีศาจมันเทศ',skill:'กลิ้งบดขยี้',res:'stam',cost:6,type:'statusHit',mult:1.6,status:'stun',turns:1,chance:.5,note:'ตีแรง 1.6 เท่า 50% ทำให้มึนงง'},
  ginger:{name:'ผลปีศาจขิง',skill:'ขับพิษ',res:'stam',cost:4,type:'cure',heal:.3,note:'ฟื้น HP 30% และล้างสถานะผิดปกติ'},
  broccoli:{name:'ผลปีศาจบรอกโคลี',skill:'ป่าคุ้มกัน',res:'stam',cost:5,type:'reflect',reflect:2,note:'ป้องกันและสะท้อน 2 เท่าของการโจมตีครั้งถัดไป'},
});

// Monster behaviour is data: chances are per turn, and a charge attack lands on the next turn.
MONSTERS.carrot.ai={double:{chance:.3,text:'ทิ่มรัว 2 ครั้ง!'},blind:{chance:.2,text:'สะบัดดินใส่หน้า!'}};
MONSTERS.pumpkin.ai={charge:{warn:'ง้างตัวขึ้นสูง! เทิร์นหน้าควรสั่งป้องกัน',slam:'ทุบลงมาเต็มแรง!',mult:1.6,stun:true}};
Object.assign(MONSTERS,{
  spinach:{name:'ผักโขมงอกใหม่',hp:26,atk:7,def:1,spd:5,xp:10,gold:16,ai:{regen:.08}},
  chili:{name:'พริกเดือด',hp:20,atk:10,def:1,spd:9,xp:14,gold:16,ai:{poison:{chance:.3,text:'พ่นผงพริกแสบ!'}}},
  garlic:{name:'กระเทียมฉุน',hp:32,atk:8,def:3,spd:4,xp:16,gold:24,ai:{blind:{chance:.3,text:'ปล่อยกลิ่นฉุนแสบตา!'}}},
  sweetpotato:{name:'มันเทศกลิ้ง',hp:60,atk:10,def:3,spd:2,xp:26,gold:36,ai:{charge:{warn:'กลิ้งถอยไปตั้งหลัก! เทิร์นหน้าควรสั่งป้องกัน',slam:'กลิ้งทับเต็มแรง!',mult:1.6,stun:false}}},
  ginger:{name:'ขิงโกรธ',hp:38,atk:12,def:2,spd:7,xp:24,gold:40,ai:{double:{chance:.3,text:'รัวแง่ง 2 ครั้ง!'}}},
  broccoli:{name:'บรอกโคลีป่า',hp:80,atk:14,def:6,spd:6,xp:40,gold:90,ai:{regen:.05,charge:{warn:'ยกกิ่งทั้งต้นขึ้นสูง! เทิร์นหน้าควรสั่งป้องกัน',slam:'โถมทับทั้งต้น!',mult:1.6,stun:true}}},
});

Object.assign(WEAKNESS,{
  spinach:{normal:'fire',reason:'ผักโขมชอบอากาศเย็น ถ้าร้อนจัดจะแทงช่อดอกเร็ว',transcended:'dig'},
  chili:{normal:'water',reason:'รากพริกไม่ทนน้ำขัง',transcended:'salt'},
  garlic:{normal:'salt',reason:'กระเทียมไม่ค่อยทนดินเค็ม',transcended:'water'},
  sweetpotato:{normal:'dig',reason:'หัวมันเทศอยู่ใต้ดิน จึงเสียหายง่ายเมื่อถูกขุดกระทบ',transcended:'fire'},
  ginger:{normal:'water',reason:'เหง้าขิงเน่าง่ายเมื่อดินแฉะน้ำขัง',transcended:'dig'},
  broccoli:{normal:'fire',reason:'บรอกโคลีชอบอากาศเย็น ถ้าร้อนจัดดอกจะบานเร็ว',transcended:'water'},
});

Object.assign(SPR,{
  spinach:{pal:{g:'#3e9a50',l:'#7fd483',k:'#10301a',w:'#ffffff',m:'#14401f',s:'#2a7040'},gold:{g:'#ffd34a',l:'#fff0a0',s:'#c99a1f'},rows:[
    ".....gg..gg.....","....gllggllg....","...gllggggllg...","..gglgggggglgg..","..ggkkggggkkgg..","..ggkwggggkwgg..","...ggggmmgggg...","....ggmmmmgg....",".....gggggg.....","......sggs......","......ssss......",".....ss..ss.....","....ss....ss...."]},
  chili:{pal:{g:'#3fa34d',r:'#d9302c',l:'#ff8a7a',w:'#ffffff',e:'#1a0505',k:'#5a0f0f'},gold:{r:'#ffd34a',l:'#fff0a0',g:'#c4a8f5'},rows:[
    "..........gg....",".........ggg....",".......rrrgg....","......rrrrrr....",".....rrlrrrrr...","....rrrrwerrr...","....rrrrrrrr....","...rrrwerrrr....","...rrrrrrrr.....","..rrrkkkrr......","..rrrrrrr.......",".rrrrrr.........",".rrrr...........","..r............."]},
  garlic:{pal:{p:'#a891b8',w:'#f4efe2',k:'#1a1420',e:'#ff5a5a',m:'#5a4a66'},gold:{w:'#ffd34a',p:'#c99a1f'},rows:[
    ".......pp.......",".......pp.......","......pwwp......","....ppwwwwpp....","...pwwwwwwwwp...","..pwwwkwwkwwwp..","..pwwwewwewwwp..","..pwwwwwwwwwwp..","..pwwmmmmmmwwp..","...pwwwwwwwwp...","....ppwwwwpp....","....p.pppp.p....","...p..p..p..p..."]},
  sweetpotato:{pal:{g:'#3fa34d',p:'#8a4a8f',l:'#c08ac6',k:'#20102a',e:'#ffffff'},gold:{p:'#ffd34a',l:'#fff0a0',g:'#c4a8f5'},rows:[
    "....ggg.gg......",".....ggg........","....ppppppp.....","..pppllppppppp..",".pplllppppppppp.","ppppkepppkepppp.","ppppppppppppppp.","pppkpkpkpkpkppp.",".pppkkkkkkkppp..","..pppppppppp....","....pppppp......"]},
  ginger:{pal:{t:'#a07f3e',l:'#dcc083',k:'#2a1c08',e:'#ff5a2a',m:'#5a3f12'},gold:{t:'#c99a1f',l:'#ffd34a'},rows:[
    "....tt....tt....","...tllt..tllt...","...tllttttllt...","....tllllllt....","..ttlklllklltt..",".tllleklleklllt.",".tllllllllllllt.","..ttlmmmmmmltt..","....tllllllt....","...tlltllltllt..","..tllt.tllt.tllt","..ttt...ttt..tt."]},
  broccoli:{pal:{g:'#2f8f46',l:'#7fd483',k:'#0d2a14',e:'#ffffff',m:'#123d1d',s:'#7fbf6a'},gold:{g:'#ffd34a',l:'#fff0a0',s:'#c99a1f'},rows:[
    "....gggggggg....","..gglggggglggg..",".gggggllggggggg.",".gglggggggglggg.","..ggkeggkegggg..","..gggggggggggg..","...ggmmmmmmgg...",".....ssssss.....",".....ssssss.....","....ssssssss....","....sss..sss....","....ss....ss...."]},
});
