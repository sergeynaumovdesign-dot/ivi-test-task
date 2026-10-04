import { node, pressable } from './core.js';
import { createPoster } from './poster.js';
export const compilationDefaults={title:'Зарубежные детективные сериалы',imageSrc:new URL('../assets/foundations/183-56926-raw-0.png',import.meta.url).href};
export function createCompilationCard(options={}) {
 const p={...compilationDefaults,...options};const root=node('button','ivi-compilation-card');root.type='button';root.setAttribute('aria-label',p.title);
 root.append(createPoster({imageSrc:p.imageSrc,width:228,height:292,radius:12}),node('span','ivi-compilation-card__title ivi-text-bold-h3',p.title));
 pressable(root,{down:()=>root.classList.add('is-pressed'),up:()=>root.classList.remove('is-pressed'),activate:()=>p.onOpen?.(p)});return root;
}
