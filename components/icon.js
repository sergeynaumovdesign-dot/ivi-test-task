import { node } from './core.js';
export const iconSources = {
 ai:null, cross:'foundations/cross.svg', back:'foundations/183-57891-icon-0.svg', mute:'cover/mute.svg', unmute:'cover/unmute.svg', warning:'foundations/243-71230-icon-0.svg',
 star12:'cover/star12.svg', lock:'series/lock.svg', like:'feedback/like.svg', 'like-fill':'feedback/like-fill.svg', dislike:'feedback/dislike.svg', 'dislike-fill':'feedback/dislike-fill.svg',
 bookmark:'icons/bookmark.svg', 'bookmark-fill':'icons/bookmark-fill.svg', download:'icons/download.svg', star:'icons/star.svg', 'star-fill':'icons/star-fill.svg', 'share-arrow':'icons/share-arrow.svg', heart:'icons/heart.svg','heart-fill':'icons/heart-fill.svg',
 wifi:'foundations/183-61217-icon-0.svg',signal:'foundations/183-61217-icon-1.svg',battery:'foundations/183-61217-icon-2.svg'
};
export function createIcon({name='back',size=null}={}) {
 size ??= ['bookmark','bookmark-fill','download','star','star-fill','share-arrow','heart','heart-fill'].includes(name)?20:['warning','star12','lock'].includes(name)?12:16;
 const root=node('span','ivi-icon'); root.style.width=`${size}px`;root.style.height=`${size}px`;root.setAttribute('aria-hidden','true');
 if(name==='ai'){root.textContent='\uE000';root.classList.add('ivi-icon--ai');root.style.fontSize=`${size}px`;return root;}
 const image=node('img');image.alt='';
 root.setIcon=value=>{root.dataset.icon=value;image.src=new URL(`../assets/${iconSources[value]||iconSources.back}`,import.meta.url).href;};
 root.append(image);root.setIcon(name);return root;
}
