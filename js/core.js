'use strict';
const $=s=>document.querySelector(s);
const cv=$('#cv'),c=cv.getContext('2d');
const T=16,W=320,H=240,TAU=Math.PI*2;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const CALM=matchMedia('(prefers-reduced-motion: reduce)').matches;

