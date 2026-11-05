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
const POND_SIZE=6,GOLD_FISH_CHANCE=.1,GOLD_FISH_SELL=150;

MONSTERS.meteor={name:'ราชาอุกกาบาต',hp:170,atk:15,def:6,spd:7,xp:150,gold:300,boss:true,
  ai:{regen:.02,poison:{chance:.25,text:'พ่นหมอกพิษจากอุกกาบาต!'},charge:{warn:'ดูดหมอกทั้งหลุมเข้าตัว! เทิร์นหน้าควรสั่งป้องกัน',slam:'ระเบิดพลังอุกกาบาต!',mult:1.8,stun:true}}};
WEAKNESS.meteor={normal:'salt',reason:'',transcended:'salt'};
SPR.meteor={pal:{c:'#c4a8f5',k:'#120c1e',a:'#3b3050',g:'#6d5a92',e:'#c4a8f5',y:'#f4eaff'},rows:[
  "........c..c..c.........","........cc.cc.cc........",".......cccccccccc.......",".......kkkkkkkkkk.......","......kaaaaaaaaaak......",".....kaagggggggaaak.....",".....kagkeeggeekgak.....",".....kagkyeggyekgak.....",".....kaaggggggggaak.....","......kaaegeegeaak......",".......kaaeeeeaak.......","....kkkkkaaaaaakkkkk....","...kaaaaakeeeekaaaaak...","..kaaggaakeyyekaaggaak..","..kagggaakeyyekaagggak..",".kaagkaaakeeeekaaakgaak.",".kagk.kaaaaaaaaaak.kgak.",".kak..kaagaaaagaak..kak.",".ee...kaaaagaaaaak...ee.",".y....kaaaaaaaaaak....y.","......kaagaaaagaak......",".....kaaaaaaaaaaaak.....","....kggaaeaagaaeaggk....","...kkkkkkkkkkkkkkkkkk..."]};
