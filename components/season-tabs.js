import {node,shape,pressable} from './core.js';
export function createSeasonTab({number=1,state='Inactive',onPress}={}) {
 const b=node('button','ivi-season');b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-label',`Сезон ${number}`);b.append(node('span','ivi-season__face'));
 let current=state;
 function paint(b,index,state){
  const pressed=state==='Pressed';const face=b.firstChild;face.textContent=String(index);
  b.setAttribute('aria-selected',String(state==='Active'));b.dataset.state=state;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font="700 14px 'IVI Sans AI SVG'";
  const padding=pressed?7.2:8;const w=Math.max(pressed?28.8:32,Math.ceil(ctx.measureText(String(index)).width+String(index).length*.14)+padding*2);const h=pressed?28.8:36;
  Object.assign(face.style,{fontFamily:"'IVI Sans AI SVG'",fontWeight:'700',fontSize:'14px',lineHeight:'20px',letterSpacing:'.01em',color:state==='Active'?'var(--ivi-text-secondary)':'var(--ivi-text-inactive)',background:state==='Active'?'var(--ivi-background-elevated)':pressed?'var(--ivi-background-surface)':'transparent',width:`${w}px`,minWidth:`${w}px`,height:`${h}px`,padding:`0 ${padding}px`,transform:'none'});
  b.style.width=`${Math.max(32,w)}px`;shape(face,'183:56839',w,h);
 }
 b.setState=value=>{current=value;paint(b,number,current);};b.setState(state);
 pressable(b,{down:()=>paint(b,number,'Pressed'),up:()=>paint(b,number,current),activate:()=>onPress?.(number)});return b;
}

export function createSeasonTabs({count=3,active=1,pressed=null,onChange,onReselect,showHitAreas=false}={}) {
 count=Math.max(1,Math.min(100,Math.floor(count)));active=Math.max(1,Math.min(count,active));
 const block=node('div','ivi-seasons');block.setAttribute('role','tablist');block.setAttribute('aria-label','Сезоны');block.classList.toggle('show-hit-areas',showHitAreas);
 const row=node('div','ivi-seasons__row');block.append(row);const buttons=[];
 function normal(i){return i===pressed?'Pressed':i===active?'Active':'Inactive';}
 for(let i=1;i<=count;i++){
  const b=createSeasonTab({number:i,state:normal(i),onPress:()=>{if(i===active){onReselect?.(i);return;}active=i;buttons.forEach((x,j)=>x.setState(normal(j+1)));onChange?.(i);}});
  row.append(b);buttons.push(b);
 }
 // Native touch scrolling; mouse dragging makes long rows convenient on desktop too.
 let drag=null;block.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')drag={x:e.clientX,left:block.scrollLeft};});block.addEventListener('pointermove',e=>{if(drag&&e.buttons===1)block.scrollLeft=drag.left+drag.x-e.clientX;});for(const event of ['pointerup','pointercancel'])block.addEventListener(event,()=>drag=null);
 block.addEventListener('wheel',e=>{if(block.scrollWidth>block.clientWidth&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){block.scrollLeft+=e.deltaY;e.preventDefault();}},{passive:false});
 return block;
}
