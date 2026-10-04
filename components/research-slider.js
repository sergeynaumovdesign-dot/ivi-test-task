import {node} from './core.js';
import {createIconButton} from './button.js';

export function createResearchSlider({questions,total=28}) {
 const root=node('div','research-slider');
 root.setAttribute('role','region');
 root.setAttribute('aria-roledescription','слайдер');
 root.setAttribute('aria-label','Вопросы и результаты исследования');
 const viewport=node('div','research-slider__viewport');
 const slides=questions.map((question,i)=>{
  const slide=node('div','research-slider__slide');
  slide.setAttribute('role','group');
  slide.setAttribute('aria-label',`Вопрос ${i+1} из ${questions.length}`);
  slide.append(node('h3','research-slider__question',question.title));
  slide.append(node('p','research-slider__meta',`Ответы участников опроса · ${total} человек`));
  const bars=node('ul','research-bars');
  question.answers.forEach(([label,count])=>{
   const row=node('li');
   const track=node('span','research-track'),fill=node('span');
   track.setAttribute('aria-hidden','true');
   fill.style.width=`${count/total*100}%`;
   track.append(fill);
   row.append(node('span',null,label),track,node('span',null,`${count} из ${total}`));
   bars.append(row);
  });
  slide.append(bars);
  if(question.note)slide.append(node('p','example-note',question.note));
  viewport.append(slide);
  return slide;
 });
 let index=0,drag=null,scrollTimer;
 const controls=node('div','research-slider__controls');
 const previous=createIconButton({label:'Предыдущий вопрос',onPress:()=>go(index-1)});
 const next=createIconButton({label:'Следующий вопрос',onPress:()=>go(index+1)});
 next.classList.add('research-slider__next');
 const counter=node('span','research-slider__counter');
 counter.setAttribute('aria-live','polite');
 const dots=node('div','research-slider__dots');
 const dotButtons=questions.map((question,i)=>{
  const button=node('button','research-slider__dot');
  button.type='button';
  button.setAttribute('aria-label',`Вопрос ${i+1}: ${question.title}`);
  button.addEventListener('click',()=>go(i));
  dots.append(button);
  return button;
 });
 controls.append(previous,dots,counter,next);
 root.append(viewport,controls);
 function update(){
  previous.disabled=index===0;
  next.disabled=index===questions.length-1;
  counter.textContent=`${index+1} / ${questions.length}`;
  dotButtons.forEach((button,i)=>{button.setAttribute('aria-current',i===index?'true':'false');button.tabIndex=i===index?0:-1;});
  slides.forEach((slide,i)=>slide.setAttribute('aria-hidden',i===index?'false':'true'));
  viewport.style.height=`${slides[index].getBoundingClientRect().height}px`;
 }
 function go(value,smooth=true){
  clearTimeout(scrollTimer);
  index=Math.max(0,Math.min(questions.length-1,value));
  update();
  viewport.scrollTo({left:index*viewport.clientWidth,behavior:smooth&&!matchMedia('(prefers-reduced-motion: reduce)').matches?'smooth':'instant'});
 }
 viewport.addEventListener('scroll',()=>{
  if(drag||!viewport.clientWidth)return;
  clearTimeout(scrollTimer);
  scrollTimer=setTimeout(()=>{
   const value=Math.round(viewport.scrollLeft/viewport.clientWidth);
   if(value!==index){index=value;update();}
  },120);
 },{passive:true});
 viewport.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||e.button!==0)return;
  drag={id:e.pointerId,x:e.clientX,start:viewport.scrollLeft,index};
  viewport.setPointerCapture(e.pointerId);
  viewport.classList.add('is-dragging');
 });
 viewport.addEventListener('pointermove',e=>{
  if(!drag)return;
  viewport.scrollLeft=drag.start+drag.x-e.clientX;
 });
 function finish(e,cancelled=false){
  if(!drag)return;
  const gesture=drag;drag=null;
  viewport.classList.remove('is-dragging');
  if(viewport.hasPointerCapture(gesture.id))viewport.releasePointerCapture(gesture.id);
  const distance=gesture.x-e.clientX;
  go(cancelled?gesture.index:Math.abs(distance)>45?gesture.index+Math.sign(distance):gesture.index);
 }
 viewport.addEventListener('pointerup',e=>finish(e));
 viewport.addEventListener('pointercancel',e=>finish(e,true));
 viewport.addEventListener('lostpointercapture',e=>finish(e,true));
 root.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(index+(e.key==='ArrowRight'?1:-1));if(dotButtons.includes(e.target))dotButtons[index].focus();}
 });
 let lastWidth=0;
 const observer=new ResizeObserver(()=>{
  const width=viewport.clientWidth;
  if(width!==lastWidth){lastWidth=width;if(!drag)go(index,false);}
  else update();
 });
 observer.observe(viewport);
 slides.forEach(slide=>observer.observe(slide));
 update();
 return root;
}
