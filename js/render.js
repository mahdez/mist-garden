'use strict';
function renderMist(strength){
  // chunky drifting lilac haze, thicker at higher mist levels
  for(let y=0;y<H;y+=8)for(let x=0;x<W;x+=8){
    const n=Math.sin(x*.035+time*.25)+Math.sin(y*.05-time*.18)+Math.sin((x+y)*.02+time*.11);
    const a=Math.round(clamp((n+1.6)/4,0,1)*5)/5*strength;
    if(a>0){c.fillStyle=`rgba(196,168,245,${a})`;c.fillRect(x,y,8,8)}
  }
}
function renderFarm(){
  const fr=Math.floor(time*2)%2;
  for(let y=0;y<15;y++)for(let x=0;x<20;x++){
    const ch=MAP[y][x];
    if(ch==='~')c.drawImage(WATER[fr],x*T,y*T);
    else if(ch==='M')c.drawImage(TILES['.'],x*T,y*T);
    else c.drawImage(TILES[ch]||TILES['.'],x*T,y*T);
  }
  c.drawImage(METEOR[fr],15*T,12*T);
  const size=G?landSize():4;
  for(let b=0;b<6;b++)for(let a=0;a<6;a++){
    const x=(PX+a)*T,y=(PY+b)*T;
    if(a>=size||b>=size){c.drawImage(LOCKED,x,y);continue}
    const s=G?G.plots[b*6+a]:{c:null,w:false};
    c.drawImage(DIRT[s.w?1:0],x,y);
    if(s.c){
      const days=CROPS[s.c].days,st=s.g>=days?3:s.g===0?(s.w?1:0):Math.min(2,1+s.g);
      let ox=0;if(plotShake&&plotShake.i===b*6+a)ox=Math.round(Math.sin(time*50)*2);
      c.drawImage(cropArt(s.c,st),x+ox,y);
    }
  }
  if(G){
    const k=P.moving?P.t:1,cx=(P.fx+(P.x-P.fx)*k)*T,cy=(P.fy+(P.y-P.fy)*k)*T;
    c.fillStyle='rgba(0,0,0,.3)';c.fillRect(cx+3,cy+14,10,2);
    c.drawImage(charSprite(look(),P.dir,P.moving?(Math.floor(time*8)%2)+1:0),Math.round(cx),Math.round(cy));
    if(mode==='map'&&!P.moving){const[fx,fy]=facing(),p=plotAt(fx,fy);if(p&&p.unlocked){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1;c.strokeRect(fx*T+.5,fy*T+.5,15,15)}}
  }
  fxMap=fxMap.filter(f=>(f.life-=1/60)>0);
  for(const f of fxMap){f.x+=f.vx/60;f.y+=f.vy/60;f.vy+=2;c.fillStyle=f.col;c.fillRect(f.x|0,f.y|0,2,2)}
  floatsMap=floatsMap.filter(f=>(f.t+=1/60)<1);
  for(const f of floatsMap)drawNum(f.n,f.x,f.y-Math.min(f.t,.4)*24,'#ffcf6b');
  renderMist(G?Math.min(.34,.13+.025*mist()):.3);
}
function renderBattle(dt){
  bt.shake=Math.max(0,bt.shake-dt*18);bt.eflash=Math.max(0,bt.eflash-dt);bt.pflash=Math.max(0,bt.pflash-dt);bt.elunge=Math.max(0,bt.elunge-dt);bt.plunge=Math.max(0,bt.plunge-dt);
  const sx=bt.shake>0?rand(-bt.shake,bt.shake):0;
  c.save();c.translate(Math.round(sx),0);
  c.drawImage(fieldBg(),0,0);
  const e=bt.e;
  if(e.hp>0){
    const set=SPC[e.kind],im=bt.eflash>0&&Math.floor(bt.eflash*30)%2===0?set.f:e.rare?set.r:set.n;
    const sc=e.kind==='pumpkin'?5:4,swell=e.charging&&e.kind==='tomato'?1:0,w=im.width*(sc+swell),h=im.height*(sc+swell);
    const bob=Math.round(Math.sin(time*3)*2),x=Math.round(e.px-w/2+(bt.elunge>0?14:0)+(e.charging?Math.sin(time*40):0)),y=Math.round(e.py-h/2+bob);
    c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x+w*.12|0,e.py+h/2-3|0,w*.76|0,5);
    c.drawImage(im,x,y,w,h);
    const bw=64,by=e.py+h/2+5|0,bx=e.px-bw/2|0;
    c.fillStyle='#120b06';c.fillRect(bx-1,by-1,bw+2,6);
    c.fillStyle=e.hp/e.maxhp<.3?'#ff8a70':'#7fd483';c.fillRect(bx,by,Math.ceil(bw*e.hp/e.maxhp),4);
    if(e.rare&&!CALM){c.fillStyle='#fff6c9';for(let i=0;i<4;i++){const a=time*2+i*1.6;c.fillRect(e.px+Math.cos(a)*42|0,e.py+Math.sin(a*1.3)*34|0,2,2)}}
  }
  const p=pos('p'),x=p.x-24-(bt.plunge>0?14:0),y=p.y-24;
  c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x+8,y+43,32,5);
  if(!(bt.pflash>0&&Math.floor(bt.pflash*30)%2===0))c.drawImage(charSprite(look(),'left',bt.active==='p'?(Math.floor(time*5)%2)+1:0),x,y,48,48);
  if(bt.guard){c.fillStyle='rgba(160,220,255,.6)';c.fillRect(x-5,y+8,3,30);c.fillRect(x-2,y+6,3,3);c.fillRect(x-2,y+37,3,3)}
  bt.fx=bt.fx.filter(f=>(f.life-=dt)>0);
  for(const f of bt.fx){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=90*dt;c.fillStyle=f.col;c.fillRect(f.x|0,f.y|0,f.z,f.z)}
  bt.floats=bt.floats.filter(f=>(f.t+=dt)<.85);
  for(const f of bt.floats)drawNum(f.n,f.x,f.y-Math.min(f.t,.3)*40,f.col);
  renderMist(G?Math.min(.2,.07+.015*mist()):.1);
  c.restore();
}
function findPath(tx,ty,adjacent){
  const k=(x,y)=>x+','+y,prev={[k(P.x,P.y)]:null},q=[[P.x,P.y]];
  const goal=adjacent?(x,y)=>Math.abs(x-tx)+Math.abs(y-ty)===1:(x,y)=>x===tx&&y===ty;
  while(q.length){
    const[x,y]=q.shift();
    if(goal(x,y)){const path=[];let cur=k(x,y);while(prev[cur]){path.unshift(prev[cur][1]);cur=prev[cur][0]}return path}
    for(const d in DIRS){const[a,b]=DIRS[d],nx=x+a,ny=y+b,nk=k(nx,ny);if(nk in prev||blocked(nx,ny))continue;prev[nk]=[k(x,y),d];q.push([nx,ny])}
  }
  return null;
}
function faceTo(x,y){const dx=x-P.x,dy=y-P.y;P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')}
function clickMap(x,y){
  if(mode!=='map'||!G)return;
  const interactive=plotAt(x,y)||blocked(x,y)&&describe(x,y);
  if(!interactive){const path=findPath(x,y,false);if(path){P.path=path;P.then=null}return}
  const path=findPath(x,y,true);if(!path)return;
  P.path=path;P.then=[x,y];
}
function update(dt){
  if(plotShake&&(plotShake.t-=dt)<=0)plotShake=null;
  if(mode!=='map'||!G)return;
  if(!P.moving){
    const d=held[held.length-1];
    if(d)P.path=null;
    if(P.path&&!P.path.length){const t=P.then;P.path=null;P.then=null;if(t){faceTo(t[0],t[1]);mapHint();act(t[0],t[1]);if(mode!=='map')return}}
    const nd=d||(P.path&&P.path.shift());
    if(nd){
      if(P.dir!==nd){P.dir=nd;mapHint()}
      const[dx,dy]=DIRS[nd],nx=P.x+dx,ny=P.y+dy;
      if(!blocked(nx,ny)){P.moving=true;P.t=0;P.fx=P.x;P.fy=P.y;P.x=nx;P.y=ny}else P.path=null;
    }
  }
  if(P.moving){
    P.t+=dt/.14;
    if(P.t>=1){P.moving=false;P.fx=P.x;P.fy=P.y;G.x=P.x;G.y=P.y;mapHint()}
  }
}
let last=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;time+=dt;
  update(dt);
  c.imageSmoothingEnabled=false;
  shake=Math.max(0,shake-dt*10);
  c.save();if(shake>0&&!CALM)c.translate(Math.round(rand(-shake,shake)),0);
  if(bt)renderBattle(dt);else renderFarm();
  c.restore();
  if(fade>0){c.fillStyle=`rgba(0,0,0,${fade})`;c.fillRect(0,0,W,H)}
}

