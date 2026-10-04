import { node, pressable } from './core.js';
export const posterDefaults={imageSrc:new URL('../assets/foundations/183-56468-raw-0.png',import.meta.url).href,title:'Ганнибал: Восхождение',width:160,height:246,radius:12};
export function createPoster(options={}) {
 const p={...posterDefaults,...options};const root=node(p.onOpen?'button':'span','ivi-poster');
 if(p.onOpen){root.type='button';root.setAttribute('aria-label',p.title);pressable(root,{down:()=>root.classList.add('is-pressed'),up:()=>root.classList.remove('is-pressed'),activate:()=>p.onOpen(p)});}
 Object.assign(root.style,{width:`${p.width}px`,height:`${p.height}px`,borderRadius:`${p.radius}px`});
 const image=node('img');image.alt='';image.addEventListener('error',()=>image.hidden=true);
 root.setSource=src=>{image.hidden=!src;if(src)image.src=src;else image.removeAttribute('src');};
 root.setSource(p.imageSrc);root.append(image);return root;
}
