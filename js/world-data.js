'use strict';
// Data for the meteor crater and the fish pond.
const CRATER_MAP=[
"XXXXXXXXXXXXXXXXXXXX",
"XXXXXXX______XXXXXXX",
"XXXXXX________XXXXXX",
"XXXXX___XX_____XXXXX",
"XX_____XXXX______XXX",
"XX___XXXXXXX___XXXXX",
"XX___XX__XXX_____XXX",
"XXX____________XXXXX",
"XXXXX_____XX______XX",
"XX______XXXXX_____XX",
"XX___XXXXXXXX___XXXX",
"XX______________XXXX",
"XXXXXXX_____XXXXXXXX",
"XXXXXXXXX_EXXXXXXXXX",
"XXXXXXXXXXXXXXXXXXXX"];
const CRATER_SOLID='X';
const CRATER_ENTRY={x:10,y:12};
const CRATER_EXIT={x:15,y:11};
const CRATER_ORES=[{id:'o1',x:3,y:4},{id:'o2',x:16,y:4},{id:'o3',x:3,y:10},{id:'o4',x:17,y:9},{id:'o5',x:13,y:2},{id:'o6',x:6,y:2}];
const CRATER_FOES=[{id:'f1',x:4,y:7},{id:'f2',x:15,y:6},{id:'f3',x:4,y:11},{id:'f4',x:16,y:9}];
const CRATER_BOSS={x:10,y:1};
const ORE_COST=1,CRATER_RARE=.15;
const MAX_FOES=6;
const FOE_SLOTS={1:[[92,122]],2:[[60,92],[125,158]],3:[[48,75],[128,122],[48,178]],4:[[48,72],[128,72],[48,172],[128,172]],5:[[40,72],[100,72],[160,72],[60,172],[130,172]],6:[[40,72],[100,72],[160,72],[40,172],[100,172],[160,172]]};
const SHARD_COST={respec:3,reforge:2};

const FISH={
  tilapia:{name:'ปลานิล',fry:8,sell:25,days:3,hp:10,mp:4,unlock:1},
  catfish:{name:'ปลาดุก',fry:15,sell:45,days:4,hp:15,mp:6,unlock:1},
  ruby:{name:'ปลาทับทิม',fry:30,sell:95,days:5,hp:20,mp:10,unlock:2},
};
// A rod catches one fish per action. Each net is one cast for 1 SP and catches a random number in its range.
const NETS=[
  {name:'แหทั่วไป',min:2,max:3,gold:100,shards:0},
  {name:'แหเส้นใยอย่างดี',min:3,max:4,gold:300,shards:0},
  {name:'แหใยอุกกาบาต',min:5,max:6,gold:800,shards:3},
];
const POND_SIZE=6,GOLD_FISH_CHANCE=.1,GOLD_FISH_SELL=150;

MONSTERS.meteor={name:'ราชาอุกกาบาต',hp:170,atk:15,def:6,spd:7,xp:150,gold:300,boss:true,
  ai:{regen:.02,poison:{chance:.25,text:'พ่นหมอกพิษจากอุกกาบาต!'},charge:{warn:'ดูดหมอกทั้งหลุมเข้าตัว! เทิร์นหน้าควรสั่งป้องกัน',slam:'ระเบิดพลังอุกกาบาต!',mult:1.8,stun:true}}};
WEAKNESS.meteor={normal:'salt',reason:'',transcended:'salt'};
SPR.meteor={pal:{c:'#c4a8f5',k:'#120c1e',a:'#3b3050',g:'#6d5a92',e:'#c4a8f5',y:'#f4eaff'},rows:[
  "........c..c..c.........","........cc.cc.cc........",".......cccccccccc.......",".......kkkkkkkkkk.......","......kaaaaaaaaaak......",".....kaagggggggaaak.....",".....kagkeeggeekgak.....",".....kagkyeggyekgak.....",".....kaaggggggggaak.....","......kaaegeegeaak......",".......kaaeeeeaak.......","....kkkkkaaaaaakkkkk....","...kaaaaakeeeekaaaaak...","..kaaggaakeyyekaaggaak..","..kagggaakeyyekaagggak..",".kaagkaaakeeeekaaakgaak.",".kagk.kaaaaaaaaaak.kgak.",".kak..kaagaaaagaak..kak.",".ee...kaaaagaaaaak...ee.",".y....kaaaaaaaaaak....y.","......kaagaaaagaak......",".....kaaaaaaaaaaaak.....","....kggaaeaagaaeaggk....","...kkkkkkkkkkkkkkkkkk..."]};

// Fish can mutate in the mist too. They reveal themselves when caught, like crops at harvest.
Object.assign(MONSTERS,{
  tilapia:{name:'ปลานิลคลั่ง',fish:true,hp:24,atk:8,def:1,spd:6,xp:10,gold:18,ai:{blind:{chance:.25,text:'สาดน้ำขุ่นเข้าตา!'}}},
  catfish:{name:'ปลาดุกเงี่ยงพิษ',fish:true,hp:36,atk:10,def:2,spd:5,xp:18,gold:30,ai:{poison:{chance:.3,text:'แทงเงี่ยงพิษ!'}}},
  ruby:{name:'ปลาทับทิมอาละวาด',fish:true,hp:50,atk:12,def:3,spd:7,xp:30,gold:60,ai:{double:{chance:.25,text:'ฟาดหางรัว 2 ครั้ง!'},blind:{chance:.2,text:'สาดน้ำขุ่นเข้าตา!'}}},
});
Object.assign(WEAKNESS,{
  tilapia:{normal:'fire',reason:'น้ำที่ร้อนจัดมีออกซิเจนน้อย ปลาจึงอ่อนแรง',transcended:'dig'},
  catfish:{normal:'salt',reason:'ปลาดุกไม่มีเกล็ด ผิวจึงไวต่อน้ำที่เค็มจัด',transcended:'fire'},
  ruby:{normal:'fire',reason:'น้ำที่ร้อนจัดมีออกซิเจนน้อย ปลาจึงอ่อนแรง',transcended:'salt'},
});
const FISH_MUTATION={safeCatches:2,base:.08,perMist:.015,max:.4,rare:.1};
Object.assign(SPR,{
  tilapia:{pal:{k:'#17222c',b:'#6f8fa8',l:'#b9d2e4',d:'#44627a',e:'#ff5a5a',w:'#ffffff'},gold:{b:'#ffd34a',l:'#fff0a0',d:'#c99a1f'},rows:[
    "......kkkk......","....kkbbbbkk....","k..kbbllbbbbk...","kk.kblbbbbwebk..","kbkkbbbbbbbebbk.","kbbbbbbbbbbbkkk.","kbbbdbdbdbbbbbk.","kbkkdddddbbkkkk.","kk..kkddddbbbk..","k.....kkkkkkk..."]},
  catfish:{pal:{k:'#120e0a',b:'#4a3f33',l:'#7a6a55',d:'#2f271f',e:'#ffe15c',w:'#ffffff',y:'#c9a35a'},gold:{b:'#ffd34a',l:'#fff0a0',d:'#c99a1f',y:'#c4a8f5'},rows:[
    "......kkk.......","k...kkbbbkk.....","kk.kbbbbbbbkkk..","kbkbbllbbbbwek..","kbbbbbbbbbbbekky","kbbbbbbbbbbbbkyy","kbkdddddddbbbkkk","kk.kkdddddbbk.yy","k....kkkkkkk..y."]},
  ruby:{pal:{k:'#3a0a14',r:'#d9414f',l:'#ff9aa0',d:'#a52d38',e:'#fff6c9',w:'#ffffff'},gold:{r:'#ffd34a',l:'#fff0a0',d:'#c99a1f'},rows:[
    ".....kkkkkk.....","...kkrrrrrrkk...","k.krrllrrrrrrk..","kkkrlrrrrrwerrk.","krkrrrrrrrrerrk.","krrrrrrrrrrrrkkk","krkrrdrdrdrrrrrk","kkkrrdddddrrkkk.","k..kkrrrddrrrk..",".....kkkkkkkk..."]},
});

