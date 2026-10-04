import { node } from './core.js';
import { createIcon } from './icon.js';
import { createIconButton } from './button.js';
export function createNavigationBar({width=375,onBack}={}) {const root=node('nav','ivi-navigation-bar');root.style.width=`${width}px`;root.append(createIconButton({icon:'back',label:'Назад',size:16,onPress:onBack}));return root;}
export function createStatusBar({width=375,time='9:39'}={}) {
 const root=node('div','ivi-status-bar');root.style.width=`${width}px`;root.setAttribute('aria-hidden','true');root.append(node('span','ivi-status-bar__time',time));
 const signals=node('span','ivi-status-bar__signals');signals.append(createIcon({name:'signal',size:16}),createIcon({name:'wifi',size:15}),createIcon({name:'battery',size:23}));root.append(signals);return root;
}
