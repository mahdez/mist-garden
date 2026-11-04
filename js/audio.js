'use strict';
let ac=null,muted=false;
try{muted=localStorage.getItem('mg-mute')==='1'}catch(e){}
function tone(f,d=.08,type='square',v=.04,at=0){
  if(muted)return;
  try{
    ac=ac||new (window.AudioContext||window.webkitAudioContext)();
    if(ac.state==='suspended')ac.resume();
    const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+at;
    o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
    o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d);
  }catch(e){}
}
const sfx={
  move(){tone(520,.04)},ok(){tone(760,.06)},back(){tone(300,.07)},
  plant(){tone(420,.06,'triangle',.07);tone(560,.06,'triangle',.06,.05)},
  water(){[900,760,640].forEach((f,i)=>tone(f,.06,'sine',.05,i*.04))},
  harvest(){[600,800,1000].forEach((f,i)=>tone(f,.08,'triangle',.07,i*.05))},
  coin(){[880,1320].forEach((f,i)=>tone(f,.08,'square',.04,i*.07))},
  hit(){tone(140,.12,'sawtooth',.07)},crit(){tone(120,.2,'sawtooth',.09);tone(90,.2,'square',.05,.04)},
  miss(){tone(240,.1,'sine',.04)},heal(){[620,830,1040].forEach((f,i)=>tone(f,.14,'sine',.07,i*.07))},
  win(){[523,659,784,1047].forEach((f,i)=>tone(f,.16,'square',.05,i*.12))},
  enc(){[220,180,140,110].forEach((f,i)=>tone(f,.12,'sawtooth',.07,i*.08))},
  boom(){tone(70,.5,'sawtooth',.12);tone(50,.5,'square',.08,.05)},
};

