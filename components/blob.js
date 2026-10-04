import { node } from './core.js';
export function createBlob({state='Default'}={}) {
 const root=node('span','ivi-blob');const image=node('img');image.alt='';root.append(image);
 root.setState=next=>{root.dataset.state=next;image.src=new URL(`../assets/progress/${next==='Rewinding'?'blob-rewinding':'blob'}.svg`,import.meta.url).href;};
 root.setState(state);return root;
}
