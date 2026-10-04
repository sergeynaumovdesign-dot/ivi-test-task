export const metrics = await fetch(new URL('../reference/figma-metrics.json',import.meta.url)).then(r=>r.json());
const outlines = await fetch(new URL('../reference/outlines.json',import.meta.url)).then(r=>r.json());
export const color = (paint) => paint?.length ? `rgba(${paint[0].join(',')})` : 'transparent';
export function node(tag,cls,text) {const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
// Figma's original smoothed outlines. Extend straight edges, never stretch corners.
function shapePath(source,w,h) {
 let command='',index=0;
 return source.path.replace(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g,token=>{
  if(/^[A-Za-z]$/.test(token)){command=token;index=0;return token;}
  const value=Number(token),axis=command==='H'?'x':command==='V'?'y':index++%2===0?'x':'y';
  const old=axis==='x'?source.w:source.h,next=axis==='x'?w:h;
  return String(value>old/2?value+next-old:value);
 });
}
export function shape(el,id,w,h) {
 const source=outlines.find(o=>o.id===id);
 el.style.clipPath=`path('${shapePath(source,w,h)}')`;
}
export function textStyle(el,t,bold=false) {
 Object.assign(el.style,{fontFamily:"'IVI Sans AI SVG'",fontWeight:bold?'700':'500',fontSize:`${t.z}px`,lineHeight:`${t.l}px`,letterSpacing:`${t.k/100}em`,color:color(t.c),opacity:t.o});
}
export function pressable(el,{down,up,activate}) {
 let start=null,cancelled=false;
 const outside=e=>{const r=el.getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;};
 el.addEventListener('pointerdown',e=>{if(el.disabled||e.button!==0)return;start=[e.clientX,e.clientY];cancelled=false;el.setPointerCapture(e.pointerId);down();});
 el.addEventListener('pointermove',e=>{if(!start)return;if(Math.hypot(e.clientX-start[0],e.clientY-start[1])>8||outside(e)){cancelled=true;up();}});
 el.addEventListener('pointerup',e=>{if(start&&outside(e))cancelled=true;start=null;up();});
 el.addEventListener('pointercancel',()=>{cancelled=true;start=null;up();});
 el.addEventListener('lostpointercapture',()=>{start=null;up();});
 el.addEventListener('click',e=>{if(cancelled||el.disabled){e.preventDefault();return;}activate?.(e);});
 el.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat&&!el.disabled)down();});
 el.addEventListener('keyup',up);el.addEventListener('blur',up);
}
