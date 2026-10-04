import { createIcon } from './icon.js';
import {metrics,color,node,shape,textStyle,pressable} from './core.js';
export const buttonDefaults={type:'Primary',size:'Big',content:'Text',state:'Default',label:'Смотреть',caption:true,captionText:'Сезон 1 серия 1',textUnderIcon:false,iconText:'312',width:343,icon:'bookmark'};
const iconLabels={bookmark:'Добавить в избранное','bookmark-fill':'Убрать из избранного',download:'Скачать',star:'Оценить','star-fill':'Изменить оценку','share-arrow':'Поделиться',heart:'Нравится','heart-fill':'Убрать отметку «Нравится»'};
export function createButton(options={}) {
 const o={...buttonDefaults,...options};if(!Object.hasOwn(iconLabels,o.icon))o.icon='bookmark';const iconURL=new URL(`../assets/icons/${o.icon}.svg`,import.meta.url).href;if(o.size==='Small')o.content='Text';
 const find=state=>metrics.find(m=>m.name===`Type=${o.type}, Size=${o.size}, Content=${o.content}, State=${state}`);
 const base=find('Default');const button=node('button','ivi-button');button.type='button';button.disabled=o.state==='Disabled';button.setAttribute('aria-label',o.content==='Icon'?iconLabels[o.icon]:o.label);
 const face=node('span','ivi-button__face');button.append(face);
 function render(state){
  const m=find(state);button.dataset.state=state;button.dataset.figmaId=m.id;
  const small=o.size==='Small',icon=o.content==='Icon';
  let w=icon?(o.iconWidth?o.iconWidth*m.w/base.w:m.w):small?m.w:o.width*m.w/343;
  let h=m.h;
  const content=[];Object.assign(face.style,{background:color(m.fill),padding:`${m.p[0]}px ${m.p[1]}px`,gap:icon&&o.type==='Transparent'?`${state==='Pressed'?3.6:4}px`:'0px',backdropFilter:o.type==='Transparent'?`blur(${10*m.h/base.h}px)`:'none'});
  if(icon){const image=node('span','ivi-button__icon');const z=m.icon[0].w;const aspect=o.icon.startsWith('heart')?16.6787/19.9993:1;Object.assign(image.style,{width:`${z}px`,height:`${z*aspect}px`,opacity:m.icon[0].o,maskImage:`url('${iconURL}')`,background:o.iconColor|| (o.type==='Tertiary'?(state==='Pressed'?'#909090':'#e0e0e0'):'#fff')});content.push(image);
   if(o.type==='Transparent'&&o.textUnderIcon){const t=node('span','ivi-button__caption',o.iconText);textStyle(t,m.text[0]);t.style.height=`${m.text[0].h}px`;content.push(t);h+=m.text[0].h+(state==='Pressed'?3.6:4);}
  }else{
   const title=node('span','ivi-button__label',o.label);textStyle(title,m.text[0]);title.style.height=`${m.text[0].h}px`;content.push(title);
   if(!small&&o.caption){const caption=node('span','ivi-button__caption',o.captionText);textStyle(caption,m.text[1]);caption.style.height=`${m.text[1].h}px`;content.push(caption);}
  }
  // Retain the text and icon nodes so CSS can interpolate between states.
  content.forEach((next,index)=>{const current=face.children[index];if(current&&current.className===next.className){current.style.cssText=next.style.cssText;if(current.textContent!==next.textContent)current.textContent=next.textContent;}else if(current){current.replaceWith(next);}else{face.append(next);}});
  while(face.children.length>content.length)face.lastChild.remove();
  if(small){const label=face.querySelector('.ivi-button__label');w=Math.max(m.w,Math.ceil(label.scrollWidth)+m.p[1]*2+2);}
  // Figma corners: Big 16, Small 8; pressed text 15.2, icon 14.4 (Primary 15.2), Small 7.2.
  const radius=small
   ? state==='Pressed'&&o.type!=='Transparent'?7.2:8
   : state==='Pressed'?(icon&&o.type!=='Primary'?14.4:15.2):16;
  Object.assign(face.style,{width:`${w}px`,height:`${h}px`,borderRadius:`${radius}px`});
  const shapeID=small?(state==='Pressed'&&o.type!=='Transparent'?'306:29730':'217:68633'):icon?(state==='Pressed'?(o.type==='Transparent'?'306:29753':['Secondary','Tertiary'].includes(o.type)?'306:29739':'306:29801'):'217:68660'):(state==='Pressed'?'306:29801':'183:56676');
  shape(face,shapeID,w,h);
  // Keep the layout and hit target steady during press.
  const nominalW=small?(state==='Pressed'&&o.type!=='Transparent'?w/(m.w/base.w):w):icon?(o.iconWidth||48):o.width;
  Object.assign(button.style,{width:`${nominalW}px`,height:`${icon&&o.textUnderIcon&&o.type==='Transparent'?68:base.h}px`});
 }
 render(o.state);
 document.fonts.ready.then(()=>{if(button.isConnected)render(button.dataset.state);});
 pressable(button,{down:()=>render('Pressed'),up:()=>render(o.state),activate:o.onPress});
 return button;
}

export function createIconButton({icon='back',label='Назад',size=16,onPress}={}) {
 const root=node('button','ivi-icon-button');root.type='button';root.setAttribute('aria-label',label);const image=createIcon({name:icon,size});root.append(image);
 root.setIcon=(name,label)=>{image.setIcon(name);if(label)root.setAttribute('aria-label',label);};
 pressable(root,{down:()=>root.classList.add('is-pressed'),up:()=>root.classList.remove('is-pressed'),activate:onPress});return root;
}
