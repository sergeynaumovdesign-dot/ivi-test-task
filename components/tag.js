import { node } from './core.js';
import { createIcon } from './icon.js';
export const ratingTone = value => value >= 8 ? 'positive' : value >= 5 ? 'neutral' : 'negative';
export function createTag({text='Full HD',icon=false,rounded=false,score=10}={}) {
 const root=node('span','ivi-tag ivi-text-medium-tag-label');
 root.dataset.rounded=String(rounded);
 if(rounded){root.dataset.tone=ratingTone(Number(score));root.append(createIcon({name:'star12',size:12}));}
 else if(icon)root.append(createIcon({name:typeof icon==='string'?icon:'warning',size:12}));
 root.append(node('span','ivi-tag__text',rounded?String(score):text));return root;
}
export const createRatingTag = score => createTag({rounded:true,score});
