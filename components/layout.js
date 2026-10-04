import { node } from './core.js';
import { createTag } from './tag.js';
import { createTitleRating } from './rating-block.js';
export function createMargin({value=16,width=375}={}) {const root=node('div','ivi-margin');root.style.height=`${value}px`;root.style.width=`${width}px`;root.setAttribute('aria-hidden','true');return root;}
export function createSubtitleBlock({rating=8.5,label='средняя оценка',showRating=true,width=343}={}) {
 const root=node('div','ivi-subtitle-block ivi-text-regular-text-small');root.style.width=`${width}px`;
 if(showRating)root.append(createTitleRating({rating,count:1,scoreOnly:true}));root.append(node('span','',label));return root;
}
export function createSectionTitle({title='Подробнее о сериале',subtitle=false,rating=8.5,label='средняя оценка',width=375}={}) {
 const root=node('div','ivi-section-title');root.style.width=`${width}px`;root.append(node('h2','ivi-text-bold-h2',title));
 if(subtitle)root.append(createMargin({value:4,width:width-32}),createSubtitleBlock({rating,label,width:width-32}));return root;
}
export function createRow({label='Страны',value='США',type='Text',icon=false,width=343}={}) {
 const root=node('div','ivi-info-row ivi-text-regular-text-small');root.style.width=`${width}px`;root.append(node('span','ivi-info-row__label',label));
 const values=node('div','ivi-info-row__value');for(const text of (Array.isArray(value)?value:[value||'—'])) values.append(type==='Tag'?createTag({text,icon}):node('span','',text));root.append(values);return root;
}
