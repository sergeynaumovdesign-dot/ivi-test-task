import {createVideoPlayer} from './components/video-player.js';
import {titles} from './prototype-data.js';
import {createContentDetailScreen} from './components/content-detail-screen.js';
import {createMomentScreen,momentSwipeDuration,momentSwipeEasing} from './components/moment-screen.js';
import {createButton,createIconButton} from './components/button.js';
import {createNavigationBar,createStatusBar} from './components/navigation.js';
import {createProgressBar} from './components/progress-bar.js';
import {createIcon} from './components/icon.js';
import {node} from './components/core.js';
const phone=document.querySelector('#phone'),host=document.querySelector('#screen'),stack=document.querySelector('#screen-stack');
const systemStatusBar=createStatusBar({width:phone.clientWidth});systemStatusBar.id='phone-system-status';phone.append(systemStatusBar);
const prototypeParams=new URLSearchParams(location.search);
const silentPreview=prototypeParams.get('muted')==='1';
const state={key:'serial',personalized:true,activeTab:0,activeSeason:{serial:1,movie:1},blocks:{friends:true,moments:true,feedback:true},cover:{serial:{},movie:{}},tabScroll:{serial:[null,null],movie:[null,null]}};
const saved={serial:false,movie:false},ratings={serial:0,movie:0},media={serial:{moments:[]},movie:{moments:[]}};
const warmDock=node('div','moment-warm-dock');document.body.append(warmDock);
const warmVideos={serial:[],movie:[]};
function prepareMoment(key,index){
 const src=media[key].moments[index]||titles[key].moments[index]?.videoSrc;
 if(!src)return null;
 const previous=warmVideos[key][index];
 if(previous?.src===src)return previous;
 if(previous){previous.video.pause();previous.video.removeAttribute('src');previous.video.load();previous.video.remove();}
 const video=document.createElement('video');video.preload='auto';video.playsInline=true;video.muted=true;video.defaultMuted=true;video.volume=1;video.src=src;warmDock.append(video);
 const record={src,video,borrowed:false,ready:false};warmVideos[key][index]=record;
 const prime=()=>{
  if(record.borrowed||warmVideos[key][index]!==record)return;
  video.play().then(()=>{
   if(record.borrowed)return;
   let done=false;
   const finish=()=>{if(done||record.borrowed)return;done=true;video.pause();try{video.currentTime=0;}catch{}record.ready=true;};
   video.requestVideoFrameCallback?.(finish);
   setTimeout(finish,500);
  }).catch(()=>{});
 };
 if(video.readyState>=2)prime();else video.addEventListener('loadeddata',prime,{once:true});
 return record;
}
function acquireMomentVideo(key,video){const record=warmVideos[key].find(item=>item?.video===video);if(record)record.borrowed=true;}
function releaseMomentVideo(key,video){const record=warmVideos[key].find(item=>item?.video===video);if(!record)return;record.borrowed=false;video.pause();video.muted=true;video.style.opacity='';warmDock.append(video);}
let screen,toastTimer;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const swipeHintKey='ivi-prototype-trailer-swipe-hint-seen';
let swipeHintSeen=(()=>{try{return localStorage.getItem(swipeHintKey)==='1';}catch{return false;}})();
function rememberSwipeHint(){swipeHintSeen=true;try{localStorage.setItem(swipeHintKey,'1');}catch{}}
const momentSwipeHintKey=prototypeParams.get('embed')==='1'?'ivi-case-moment-swipe-hint-seen':'ivi-prototype-moment-swipe-hint-seen';
let momentSwipeHintSeen=(()=>{try{return localStorage.getItem(momentSwipeHintKey)==='1';}catch{return false;}})();
function showMomentSwipeHint(layer,view){
 if(momentSwipeHintSeen||swipeHintSeen||!layer.isConnected||stack.lastElementChild!==layer||!view.playSwipeHint())return;
 momentSwipeHintSeen=true;
 try{localStorage.setItem(momentSwipeHintKey,'1');}catch{}
}
function scheduleMomentSwipeHint(layer,view){
 if(momentSwipeHintSeen||swipeHintSeen)return;
 const openingIndex=view.getMomentIndex();
 clearTimeout(layer.momentSwipeHintTimer);
 layer.momentSwipeHintTimer=setTimeout(()=>{
  layer.momentSwipeHintTimer=null;
  if(!layer.closing&&!layer.backGesture&&view.getMomentIndex()===openingIndex)showMomentSwipeHint(layer,view);
 },1000);
}
function resetSwipeHints(){
 swipeHintSeen=false;
 momentSwipeHintSeen=false;
 try{localStorage.removeItem(swipeHintKey);localStorage.removeItem(momentSwipeHintKey);}catch{}
}
function toast(message){const el=document.querySelector('.phone-toast');clearTimeout(toastTimer);el.textContent=message;el.hidden=false;toastTimer=setTimeout(()=>el.hidden=true,2200);}
function current(){return titles[state.key];}
function editableCover(){return {...current().cover,...state.cover[state.key]};}
function statusSpace(){return parseFloat(getComputedStyle(phone).getPropertyValue('--phone-status-height'))||0;}
function navigationBottom(){return statusSpace()+45;}
function updateTopFade(){const fade=document.querySelector('#phone-top-fade');const tabs=screen?.querySelector('.ivi-tabs-block');const pinned=Boolean(tabs&&host.scrollTop>=tabPin(tabs)-1);const seasonTabs=pinned&&state.activeTab===1;fade.style.height=`${(pinned?(seasonTabs?232:180):100)-44+statusSpace()}px`;fade.classList.toggle('is-scrolled',host.scrollTop>0);fade.classList.toggle('is-season-tabs',seasonTabs);}
function tabPin(tabs){return Number(tabs.dataset.pin??Math.max(0,tabs.offsetTop-navigationBottom()));}
function onTabChange(index,tabs){const positions=state.tabScroll[state.key];const pin=tabPin(tabs);positions[state.activeTab]=Math.max(pin,host.scrollTop);state.activeTab=index;requestAnimationFrame(()=>{host.scrollTo({top:Math.max(pin,positions[index]??pin),behavior:'smooth'});updateTopFade();});}
function scrollToFriendRatings(section){
 if(!section)return;
 const tabs=screen.querySelector('.ivi-tabs-block');
 if(state.activeTab!==0&&tabs){state.tabScroll[state.key][state.activeTab]=Math.max(tabPin(tabs),host.scrollTop);state.activeTab=0;}
 requestAnimationFrame(()=>{
  const offset=navigationBottom()+(tabs?48:0);
  const top=host.scrollTop+section.getBoundingClientRect().top-host.getBoundingClientRect().top-offset;
  host.scrollTo({top:Math.max(0,top),behavior:reduced.matches?'instant':'smooth'});
 });
}
function onTabReselect(index,tabs){const pin=tabPin(tabs);state.tabScroll[state.key][index]=pin;host.scrollTo({top:pin,behavior:'smooth'});}
function syncCoverControls(){const cover=editableCover();document.querySelectorAll('[data-cover]').forEach(input=>{const field=input.dataset.cover;const value=field==='ordinary'?(state.cover[state.key].ordinary??current().ordinary):cover[field];input.value=Array.isArray(value)?value.join(', '):value??'';});document.querySelectorAll('[data-when]').forEach(label=>{label.hidden=label.dataset.when!==cover.mediaType;});document.querySelectorAll('[data-cover-file],#trailer-file').forEach(input=>input.value='');}
const momentCardMotion={duration:260,easing:'ease-in-out',fill:'both'};
function momentExpanded(){return{left:'0px',top:'0px',width:`${phone.clientWidth}px`,height:`${phone.clientHeight}px`,borderRadius:'0px'};}
function momentCardOrigin(card){
 if(!card)return null;
 const box=card.getBoundingClientRect(),base=phone.getBoundingClientRect();
 const zoom=base.width/phone.offsetWidth;
 const width=card.offsetWidth,height=card.offsetHeight;
 const x=(box.left+box.width/2-base.left)/zoom-width/2;
 const y=(box.top+box.height/2-base.top)/zoom-height/2;
 return{left:`${x}px`,top:`${y}px`,width:`${width}px`,height:`${height}px`,borderRadius:getComputedStyle(card).borderRadius};
}
function animateMomentCard(layer,closing,finish){
 const running=layer.momentEntryAnimation?.playState==='running';
 const style=getComputedStyle(layer);
 const currentFrame=running?Object.fromEntries(['left','top','width','height','borderRadius'].map(key=>[key,style[key]])):null;
 const cardOpacity=layer.cardSnapshot?getComputedStyle(layer.cardSnapshot).opacity:null;
 layer.momentEntryAnimation?.cancel();
 layer.cardAnimation?.cancel();
 const origin=momentCardOrigin(layer.originCard)||layer.momentOrigin;
 const expanded=momentExpanded();
 layer.style.setProperty('--moment-content-width',`${phone.clientWidth-24}px`);
 layer.classList.add('is-card-transition');
 if(closing){
  layer.querySelectorAll('.phone-layer__moment-close, .ivi-moment-screen__actions, .ivi-moment-screen__center, .ivi-moment-bottom__content').forEach(control=>{
   control.animate([{opacity:getComputedStyle(control).opacity},{opacity:0}],{duration:80,easing:'ease-out',fill:'forwards'});
  });
 }
 const openingControls='.phone-layer__moment-close, .ivi-moment-screen__actions, .ivi-moment-screen__center, .ivi-moment-bottom__content, .ivi-moment-bottom__name, .ivi-moment-bottom > .ivi-progress-bar';
 const textControls=[...layer.querySelectorAll(closing?'.ivi-moment-bottom__name, .ivi-moment-bottom > .ivi-progress-bar':openingControls)];
 const textOpacities=textControls.map(control=>getComputedStyle(control).opacity);
 layer.textAnimations?.forEach(animation=>animation.cancel());
 layer.textAnimations=textControls.map((control,index)=>control.animate(
  closing?[{opacity:textOpacities[index]},{opacity:0}]:[{opacity:0},{opacity:1}],
  {duration:closing?50:80,delay:closing?0:momentCardMotion.duration-80,easing:'ease-in-out',fill:'both'}
 ));
 // Release the completed fade instead of keeping the controls in an opacity
 // compositing group, which can prevent backdrop filters from sampling video.
 if(!closing)layer.textAnimations.forEach(animation=>animation.finished.then(()=>{
  if(!layer.closing&&layer.textAnimations.includes(animation))animation.cancel();
 },()=>{}));
 if(layer.originCard)layer.originCard.style.visibility='hidden';
 const motion={...momentCardMotion,duration:closing?180:momentCardMotion.duration,easing:closing?momentCardMotion.easing:'cubic-bezier(.2,.7,.2,1)'};
 const animation=layer.animate(closing?[currentFrame||expanded,origin]:[origin,expanded],motion);
 layer.momentEntryAnimation=animation;
 if(layer.cardSnapshot){
  layer.cardSnapshot.hidden=false;
  layer.cardAnimation=layer.cardSnapshot.animate(closing?
   [{opacity:running?cardOpacity:0},{opacity:0,offset:.45},{opacity:1}]:
   [{opacity:1},{opacity:0,offset:.55},{opacity:0}],motion);
 }
 animation.finished.then(()=>{
  if(layer.momentEntryAnimation!==animation)return;
  if(finish){finish();return;}
  if(layer.cardSnapshot)layer.cardSnapshot.hidden=true;
  layer.cardAnimation?.cancel();
  animation.cancel();layer.classList.remove('is-card-transition');
 },()=>{});
}
function closeLayer(animate=true){
 const layer=stack.lastElementChild;if(!layer||layer.closing)return;
 let done=false;
 const finish=()=>{if(done)return;done=true;layer.cleanup?.();layer.remove();if(layer.returnLayer){layer.returnAnimation?.cancel();layer.returnLayer.style.transform='';layer.returnLayer.resumeMedia?.();}if(!stack.children.length){host.inert=false;screen.resumePreview?.();}};
 if(!animate||reduced.matches){finish();return;}
 layer.closing=true;
 if(layer.returnLayer){
  const duration=240,opts={duration,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'};
  const outgoing=layer.animate([{transform:'translateY(0)'},{transform:`translateY(${phone.clientHeight}px)`}],opts);
  layer.returnAnimation=layer.returnLayer.animate([{transform:`translateY(${-phone.clientHeight}px)`},{transform:'translateY(0)'}],opts);
  outgoing.finished.then(finish,finish);setTimeout(finish,duration+60);
 }else if(layer.classList.contains('phone-layer__trailer')){
  const from=getComputedStyle(layer).transform;
  layer.trailerEntryAnimation?.cancel();
  layer.animate([{transform:from},{transform:`translateY(${phone.clientHeight}px)`}],{duration:160,easing:'ease-in',fill:'forwards'}).finished.then(finish,finish);
 }else if(layer.momentOrigin){
  animateMomentCard(layer,true,finish);
 }else{
  const duration=layer.classList.contains('phone-layer__video')?160:220;
  layer.animate([{transform:'translateX(0)',opacity:1},{transform:'translateX(100%)',opacity:.8}],{duration,easing:'ease-in',fill:'forwards'}).finished.then(finish,finish);
  setTimeout(finish,duration+60);
 }
}
function closeMomentToContent(){
 const layer=stack.lastElementChild;
 if(!layer?.classList.contains('phone-layer__moment')){closeLayer();return;}
 const trailer=[...stack.children].find(item=>item.classList.contains('phone-layer__trailer'));
 if(!trailer){closeLayer();return;}
 if(layer.closing)return;
 layer.closing=true;
 const finish=()=>{if(!layer.isConnected)return;layer.cleanup?.();layer.remove();trailer.cleanup?.();trailer.remove();host.inert=false;screen.resumePreview?.();};
 if(reduced.matches){finish();return;}
 trailer.style.visibility='hidden';
 if(layer.momentOrigin){animateMomentCard(layer,true,finish);return;}
 layer.animate([{transform:'none',opacity:1},{transform:'scale(.92)',opacity:0}],{duration:230,easing:'ease-out',fill:'forwards'}).finished.then(finish,finish);
}
function openLayer(child,origin,{moment=false,trailer=false,video=false,animateEntry=true}={}){screen.pausePreview?.();host.inert=true;const box=origin?.getBoundingClientRect(),base=phone.getBoundingClientRect();const layer=node('section',`phone-layer${moment?' phone-layer__moment':''}${trailer?' phone-layer__trailer':''}${video?' phone-layer__video':''}`);layer.append(child);stack.append(layer);if(moment||trailer){const close=node('button','ivi-icon-button phone-layer__moment-close');close.type='button';close.setAttribute('aria-label',moment?'Закрыть момент':'Закрыть трейлер');close.append(createIcon({name:'cross',size:16}));const dismiss=moment?closeMomentToContent:closeLayer;close.addEventListener('pointerup',event=>{event.stopPropagation();dismiss();});close.addEventListener('click',()=>dismiss());layer.append(close);}else{const back=node('div','phone-layer__back');back.append(createNavigationBar({width:phone.clientWidth,onBack:closeLayer}));layer.append(back);}layer.cleanup=()=>child.destroy?.();
 if(moment&&box){
  layer.originCard=origin;layer.momentOrigin=momentCardOrigin(origin);
  const snapshot=origin.cloneNode(true);snapshot.removeAttribute('id');snapshot.removeAttribute('aria-label');snapshot.setAttribute('aria-hidden','true');snapshot.inert=true;snapshot.classList.add('moment-card-snapshot');snapshot.hidden=true;const sourceTitle=origin.querySelector('.ivi-moment-card__title');
  const snapshotTitle=snapshot.querySelector('.ivi-moment-card__title');
  if(sourceTitle&&snapshotTitle)snapshotTitle.style.width=`${sourceTitle.offsetWidth}px`;
  layer.append(snapshot);layer.cardSnapshot=snapshot;
  const previousVisibility=origin.style.visibility,cleanup=layer.cleanup;
  layer.cleanup=()=>{if(layer.originCard)layer.originCard.style.visibility=previousVisibility;layer.momentEntryAnimation?.cancel();layer.cardAnimation?.cancel();layer.textAnimations?.forEach(animation=>animation.cancel());cleanup();};
 }
 if(!reduced.matches&&animateEntry){if(moment&&box)animateMomentCard(layer,false);else if(trailer)layer.trailerEntryAnimation=layer.animate([{transform:`translateY(${phone.clientHeight}px)`},{transform:'translateY(0)'}],{duration:200,easing:momentSwipeEasing,fill:'backwards'});else layer.animate([{transform:'translateX(100%)'},{transform:'translateX(0)'}],{duration:video?200:320,easing:'cubic-bezier(.2,.7,.2,1)'});}
 return layer;
}
function textScreen(title,text){const page=node('div','phone-layer__scroll');page.append(node('div','phone-status-space'),createNavigationBar(),node('h2','phone-layer__heading',title),node('p','phone-layer__text',text));openLayer(page);enableDrag(page);}
function rate(){const page=node('div','phone-layer__scroll');page.append(node('div','phone-status-space'),createNavigationBar(),node('h2','phone-layer__heading','Твоя оценка'));const choices=node('div','rating-choices');for(let i=1;i<=10;i++)choices.append(createButton({size:'Small',type:ratings[state.key]===i?'Primary':'Secondary',label:String(i),onPress:()=>{ratings[state.key]=i;screen.setRated(i);closeLayer();toast('Оценка сохранена');}}));page.append(choices);openLayer(page);}
function openVideo(data={},seconds=0,{deferPlay=false,animateEntry=true}={}){
 if(data.full){
  const uploaded=media[state.key].full;
  const page=createVideoPlayer({width:phone.clientWidth,title:data.title||current().title,episode:data.episode||(current().variant==='Serial'?'Сезон 1 серия 1':''),startAt:data.startAt??seconds,durationSeconds:data.durationSeconds||2520,videoSrc:uploaded||current().demoVideoSrc||current().moments[0]?.videoSrc,imageSrc:data.imageSrc||current().cover.posterImage,demo:!uploaded,muted:silentPreview||!uploaded});
  const layer=openLayer(page,null,{video:true,animateEntry});
  layer.pauseMedia=()=>page.setPlaying(false);layer.resumeMedia=()=>page.setPlaying(true);
  return {layer,page,video:page.querySelector('video')};
 }
 const trailer=!data.full;const page=node('div',`player${trailer?' player--trailer':''}`);let video;
 const src=data.videoSrc||media[state.key].trailer||current().cover.fullVideoSrc||current().cover.videoSrc;
 if(src){video=node('video');video.src=src;video.poster=data.imageSrc||current().cover.trailerImage;video.playsInline=true;video.muted=silentPreview;video.defaultMuted=silentPreview;video.controls=!trailer;video.addEventListener('loadedmetadata',()=>{video.currentTime=Math.min(seconds,video.duration||seconds);if(!deferPlay)video.play().catch(()=>{});},{once:true});page.append(video);}
 else{const poster=node('img');poster.src=data.imageSrc||current().cover.trailerImage;poster.alt='';page.append(poster);}
 let hintTimer,hint;
 if(trailer){
  if(current().moments.length&&!swipeHintSeen){
   hint=node('div','player__swipe-hint');hint.hidden=true;
   const gesture=node('img','player__swipe-icon');gesture.src=new URL('./assets/icons/swipe-up.svg',import.meta.url).href;gesture.alt='';
   hint.append(gesture,node('span','player__swipe-label',`Проведи вверх, чтобы посмотреть короткие фрагменты из ${current().variant==='Film'?'фильма':'сериала'}`));page.append(hint);
  }
 }
 page.destroy=()=>{clearTimeout(hintTimer);video?.pause();video?.removeAttribute('src');video?.load();};
 const layer=openLayer(page,null,{trailer,video:true,animateEntry});
 layer.pauseMedia=()=>video?.pause();
 if(trailer){
  layer.showSwipeHint=()=>{
   if(!hint||swipeHintSeen)return;
   hint.hidden=false;rememberSwipeHint();
   hintTimer=setTimeout(()=>hint.classList.add('is-hidden'),4500);
  };
  if(!deferPlay)layer.showSwipeHint();
  enableTrailerSwipe(layer,page,video);
 }
 return{layer,page,video};
}
function enableTrailerSwipe(trailerLayer,page,video){
 let gesture=null,suppressClick=false;
 const hint=page.querySelector('.player__swipe-hint');
 trailerLayer.resumeMedia=()=>{trailerLayer.showSwipeHint?.();video?.play().catch(()=>{});};
 page.addEventListener('pointerdown',event=>{if(event.button!==0||event.target.closest('button'))return;gesture={id:event.pointerId,x:event.clientX,y:event.clientY,time:performance.now(),offset:0,direction:0,moment:null};});
 page.addEventListener('pointermove',event=>{
  if(!gesture||event.pointerId!==gesture.id)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(!gesture.direction){
   if(Math.abs(dy)<10||Math.abs(dy)<Math.abs(dx)*1.2)return;
   gesture.direction=dy<0?-1:1;
   try{page.setPointerCapture(event.pointerId);}catch{}
   video?.pause();
   if(gesture.direction<0){
    if(!current().moments.length){gesture.direction=0;return;}
    hint?.classList.add('is-hidden');
    gesture.moment=openMoment({index:0,fromTrailer:trailerLayer,deferPlay:true});
   }
  }
  gesture.offset=gesture.direction<0?Math.max(-phone.clientHeight,Math.min(0,dy)):Math.max(0,Math.min(phone.clientHeight,dy));
  trailerLayer.style.transform=`translateY(${gesture.offset}px)`;
  if(gesture.moment)gesture.moment.layer.style.transform=`translateY(${phone.clientHeight+gesture.offset}px)`;
  event.preventDefault();
 });
 const end=event=>{
  if(!gesture||event.pointerId!==gesture.id)return;
  const currentGesture=gesture;gesture=null;if(!currentGesture.direction)return;
  suppressClick=true;setTimeout(()=>suppressClick=false,0);
  const up=currentGesture.direction<0;
  const distance=Math.abs(currentGesture.offset),velocity=distance/Math.max(1,performance.now()-currentGesture.time);
  const complete=event.type!=='pointercancel'&&(distance>120||(distance>35&&velocity>.6));
  const target=complete?(up?-phone.clientHeight:phone.clientHeight):0;
  const duration=reduced.matches?0:(!up&&complete?160:momentSwipeDuration(target-currentGesture.offset,phone.clientHeight));
  const moment=currentGesture.moment;let finished=false,animations=[];
  if(up&&complete)moment.view.play();
  const settle=()=>{
   if(finished)return;finished=true;animations.forEach(animation=>animation.cancel());
   if(up){
    if(complete){trailerLayer.style.transform=`translateY(${-phone.clientHeight}px)`;moment.layer.style.transform='';moment.view.play();scheduleMomentSwipeHint(moment.layer,moment.view);}
    else{trailerLayer.style.transform='';moment.layer.cleanup?.();moment.layer.remove();video?.play().catch(()=>{});}
   }else if(complete){trailerLayer.style.transform='';closeLayer(false);}
   else{trailerLayer.style.transform='';video?.play().catch(()=>{});}
  };
  if(!duration){settle();return;}
  const opts={duration,easing:momentSwipeEasing,fill:'forwards'};
  animations=[trailerLayer.animate([{transform:`translateY(${currentGesture.offset}px)`},{transform:`translateY(${target}px)`}],opts)];
  if(moment)animations.push(moment.layer.animate([{transform:`translateY(${phone.clientHeight+currentGesture.offset}px)`},{transform:`translateY(${phone.clientHeight+target}px)`}],opts));
  Promise.allSettled(animations.map(animation=>animation.finished)).then(settle);setTimeout(settle,duration+60);
 };
 page.addEventListener('pointerup',end);page.addEventListener('pointercancel',end);
 page.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation();return;}if(event.target===video){if(video.paused)video.play().catch(()=>{});else video.pause();}},true);
}
function beginMomentBack(layer,view){
 if(!layer||layer.backGesture||layer.closing)return false;
 let trailer=layer.returnLayer,created=false;
 if(!trailer?.isConnected){
  trailer=openVideo({},0,{deferPlay:true,animateEntry:false}).layer;
  stack.insertBefore(trailer,layer);
  created=true;
 }
 trailer.pauseMedia?.();
 trailer.style.transform=`translateY(${-phone.clientHeight}px)`;
 layer.backGesture={trailer,created,offset:0,wasPlaying:view.getState()==='Default',settling:false};
 view.setState('Paused');
 return true;
}
function moveMomentBack(layer,distance){
 const gesture=layer?.backGesture;if(!gesture||gesture.settling)return;
 gesture.offset=Math.max(0,Math.min(phone.clientHeight,distance));
 layer.style.transform=`translateY(${gesture.offset}px)`;
 gesture.trailer.style.transform=`translateY(${gesture.offset-phone.clientHeight}px)`;
}
function cancelMomentBack(layer,view){
 const gesture=layer?.backGesture;if(!gesture||gesture.settling)return;
 layer.backGesture=null;layer.style.transform='';
 if(gesture.created){gesture.trailer.cleanup?.();gesture.trailer.remove();}
 else gesture.trailer.style.transform=`translateY(${-phone.clientHeight}px)`;
 if(gesture.wasPlaying)view.setState('Default');
}
function endMomentBack(layer,view,commit){
 const gesture=layer?.backGesture;if(!gesture||gesture.settling)return;
 gesture.settling=true;
 const target=commit?phone.clientHeight:0,start=gesture.offset;
 const duration=reduced.matches?0:momentSwipeDuration(target-start,phone.clientHeight);
 let done=false,animations=[];
 const finish=()=>{
  if(done)return;done=true;animations.forEach(animation=>animation.cancel());layer.backGesture=null;
  if(commit){layer.cleanup?.();layer.remove();gesture.trailer.style.transform='';gesture.trailer.resumeMedia?.();}
  else{layer.style.transform='';if(gesture.created){gesture.trailer.cleanup?.();gesture.trailer.remove();}else gesture.trailer.style.transform=`translateY(${-phone.clientHeight}px)`;if(gesture.wasPlaying)view.setState('Default');}
 };
 if(!duration){finish();return;}
 const opts={duration,easing:momentSwipeEasing,fill:'forwards'};
 animations=[layer.animate([{transform:`translateY(${start}px)`},{transform:`translateY(${target}px)`}],opts),gesture.trailer.animate([{transform:`translateY(${start-phone.clientHeight}px)`},{transform:`translateY(${target-phone.clientHeight}px)`}],opts)];
 Promise.allSettled(animations.map(animation=>animation.finished)).then(finish);setTimeout(finish,duration+60);
}
function openMoment(data){
 const key=state.key,title=current();
 const moments=title.moments.map((m,i)=>({...m,videoSrc:media[key].moments[i]||m.videoSrc||'',preparedVideo:prepareMoment(key,i)?.video||null,contentTitle:title.title,contentType:title.variant,posterSrc:key==='serial'?new URL('./assets/moment-screen/raw-3.png',import.meta.url).href:title.cover.trailerImage,saved:saved[key],duration:m.duration||24,progress:0}));
 let layer;
 const view=createMomentScreen({width:phone.clientWidth,height:phone.clientHeight,moments,momentIndex:data.index??0,autoplay:false,demoPlayback:true,muted:silentPreview,
  onAcquireVideo:video=>acquireMomentVideo(key,video),onReleaseVideo:video=>releaseMomentVideo(key,video),
  onBackGestureStart:()=>beginMomentBack(layer,view),onBackGestureMove:distance=>moveMomentBack(layer,distance),onBackGestureEnd:commit=>endMomentBack(layer,view,commit),onBackGestureCancel:()=>cancelMomentBack(layer,view),
  onBackToTrailer:()=>{if(beginMomentBack(layer,view))endMomentBack(layer,view,true);},
  onOpenTitle:()=>closeMomentToContent(),onWatchFromStart:()=>{openVideo({title:title.title,episode:title.variant==='Serial'?'Сезон 1 серия 1':'',full:true,startAt:0});},onContinue:info=>{openVideo({title:title.title,episode:view.getMomentIndex()!=null?title.moments[view.getMomentIndex()]?.episode:'',full:true},info.seconds);},
  onSaveChange:value=>{saved[key]=value;screen.setSaved(value);toast(value?'Добавлено в избранное':'Удалено из избранного');},
  onShare:()=>navigator.clipboard?.writeText(location.href).then(()=>toast('Ссылка скопирована')).catch(()=>toast('Не удалось скопировать ссылку'))});
 const origin=data.card||screen.querySelectorAll('.ivi-moment-card')[data.index??0]||null;
 layer=openLayer(view,origin,{moment:true,animateEntry:!data.fromTrailer&&data.animateEntry!==false});
 layer.momentView=view;layer.originIndex=data.index??0;
 view.addEventListener('pointerdown',()=>{clearTimeout(layer.momentSwipeHintTimer);layer.momentSwipeHintTimer=null;},{once:true});
 const cleanup=layer.cleanup;
 layer.cleanup=()=>{clearTimeout(layer.momentSwipeHintTimer);cleanup();};
 if(data.fromTrailer){layer.style.transform=`translateY(${phone.clientHeight}px)`;layer.returnLayer=data.fromTrailer;}
 if(!data.deferPlay){
  view.play();
  scheduleMomentSwipeHint(layer,view);
 }
 return{layer,view};
}
function render({keepLayers=false}={}){
 const scroll=host.scrollTop;
 if(!keepLayers)while(stack.children.length){stack.lastElementChild.closing=false;closeLayer(false);}
 screen?.destroy();
 const title=current();
 const custom=editableCover();
 const cover={...custom,videoSrc:media[state.key].trailer||custom.videoSrc||'',fullVideoSrc:media[state.key].trailer||custom.fullVideoSrc||custom.videoSrc||'',saved:saved[state.key],rated:Boolean(ratings[state.key]),descriptionType:state.personalized?'AI':'Default',description:state.cover[state.key].ordinary??title.ordinary};
 const moments=title.moments.map((moment,index)=>({...moment,videoSrc:media[state.key].moments[index]||moment.videoSrc||''}));
 screen=createContentDetailScreen({...title,moments,width:phone.clientWidth,activeTab:state.activeTab,activeSeason:state.activeSeason[state.key],onSeasonChange:season=>state.activeSeason[state.key]=season,cover,blocks:state.blocks,feedbackSummary:{...title.summary,personalized:state.personalized},rating:{rating:cover.rating,count:cover.ratingCount,ownRating:ratings[state.key]},onTabChange,onTabReselect,onOpenFriendRatings:scrollToFriendRatings,onBack:()=>location.href='index.html',onOpenTrailer:openVideo,onOpenVideo:openVideo,onOpenMoment:openMoment,onWatch:()=>openVideo({title:cover.title,full:true}),onOpenSeries:data=>openVideo({...data,full:true}),onRate:rate,onSaveChange:value=>{saved[state.key]=value;toast(value?'Добавлено в избранное':'Удалено из избранного');},onDownload:()=>toast('Видео недоступно для скачивания в прототипе'),onShare:()=>{navigator.clipboard?.writeText(location.href).then(()=>toast('Ссылка скопирована')).catch(()=>toast('Не удалось скопировать ссылку'));},onOpenFeedback:review=>textScreen(review.author||'Отзыв',review.text),onOpenPerson:person=>textScreen(person.name,person.subtitle||''),onOpenCompilation:item=>textScreen(item.title,'Подборка'),onOpenRecommendation:()=>toast('Карточка этого фильма пока не добавлена в прототип')});
 screen.querySelector(':scope > .ivi-status-bar')?.replaceWith(node('div','phone-status-space'));
 host.replaceChildren(screen);host.scrollTop=0;const tabs=screen.querySelector('.ivi-tabs-block');if(tabs)tabs.dataset.pin=String(Math.max(0,tabs.offsetTop-navigationBottom()));host.scrollTop=scroll;updateTopFade();
 prepareMoment(state.key,0);
 if(title.moments.length>1)setTimeout(()=>prepareMoment(state.key,1),300);
 if(title.moments.length>2)setTimeout(()=>prepareMoment(state.key,2),700);
}
// Drag scrolling keeps native touch behavior and suppresses the click after a swipe.
function enableDrag(container){let drag,suppress=false;container.addEventListener('dragstart',e=>e.preventDefault());container.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('input,video,.ivi-progress-bar,.ivi-tab'))return;const horizontal=e.target.closest('.ivi-content-detail-screen__scroller,.ivi-tabs-block__row,.ivi-seasons');drag={x:e.clientX,y:e.clientY,horizontal,left:horizontal?.scrollLeft||0,top:container.scrollTop,target:e.target,moved:false};});container.addEventListener('pointermove',e=>{if(!drag||!e.buttons)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<7)return;if(!drag.moved){drag.moved=true;drag.axis=drag.horizontal&&Math.abs(dx)>Math.abs(dy)?'x':'y';}e.preventDefault();if(drag.axis==='x')drag.horizontal.scrollLeft=drag.left-dx;else container.scrollTop=drag.top-dy;});container.addEventListener('pointerup',()=>{suppress=Boolean(drag?.moved);drag=null;setTimeout(()=>suppress=false,0);});container.addEventListener('pointercancel',()=>drag=null);container.addEventListener('click',e=>{if(suppress){e.preventDefault();e.stopImmediatePropagation();}},true);}
document.querySelector('#title-select').addEventListener('change',e=>{state.key=e.target.value;state.activeTab=0;host.scrollTop=0;syncCoverControls();document.querySelectorAll('input[type=file]').forEach(x=>x.value='');render();});
document.querySelector('#personalized').addEventListener('change',e=>{state.personalized=e.target.checked;render();});
document.querySelectorAll('[data-block]').forEach(input=>input.addEventListener('change',()=>{state.blocks[input.dataset.block]=input.checked;render();}));
document.querySelector('#replay-swipe-hints').addEventListener('click',()=>{
 resetSwipeHints();
 document.querySelector('#swipe-hints-note').textContent='Готово. Закрой и снова открой трейлер или первый момент.';
});
document.querySelector('#trailer-file').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;if(media[state.key].trailer)URL.revokeObjectURL(media[state.key].trailer);media[state.key].trailer=URL.createObjectURL(file);render();});
document.querySelectorAll('[data-cover]').forEach(input=>input.addEventListener('input',()=>{const field=input.dataset.cover;let value=input.value;if(field==='ratingCount')value=Math.max(0,Math.floor(Number(value)||0));if(field==='friendScore')value=Math.max(1,Math.min(10,Math.round(Number(value)||1)));if(field==='genres')value=value.split(',').map(item=>item.trim()).filter(Boolean);state.cover[state.key][field]=value;if(field==='title')state.cover[state.key].titleLogo='';if(field==='mediaType')document.querySelectorAll('[data-when]').forEach(label=>{label.hidden=label.dataset.when!==value;});render();}));
document.querySelectorAll('[data-cover-file]').forEach(input=>input.addEventListener('change',()=>{const file=input.files[0];if(!file)return;const field=input.dataset.coverFile;const old=state.cover[state.key][field];if(old?.startsWith('blob:'))URL.revokeObjectURL(old);state.cover[state.key][field]=URL.createObjectURL(file);render();}));
document.querySelectorAll('[data-moment-file]').forEach(input=>input.addEventListener('change',()=>{const file=input.files[0];if(!file)return;const i=Number(input.dataset.momentFile);if(media[state.key].moments[i])URL.revokeObjectURL(media[state.key].moments[i]);media[state.key].moments[i]=URL.createObjectURL(file);render();}));
document.querySelector('#full-file').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;if(media[state.key].full)URL.revokeObjectURL(media[state.key].full);media[state.key].full=URL.createObjectURL(file);});
syncCoverControls();render();enableDrag(host);host.addEventListener('scroll',updateTopFade,{passive:true});
Promise.all([400,500,700].map(weight=>document.fonts.load(`${weight} 16px "IVI Sans AI SVG"`))).catch(()=>{});

if(new URLSearchParams(location.search).has('video-debug'))import('./diagnostics/video-startup.js');

if(prototypeParams.get('start')==='moment'){
 requestAnimationFrame(()=>{
  const card=screen.querySelector('.ivi-moment-card');
  if(card)host.scrollTop+=card.getBoundingClientRect().top-phone.getBoundingClientRect().top-180;
  openMoment({index:0,animateEntry:false});
 });
}

// Keep running video screens in place when the browser viewport changes.
let phoneWidth=phone.clientWidth;
new ResizeObserver(()=>{
 const width=phone.clientWidth,height=phone.clientHeight;
 if(width!==phoneWidth){
  phoneWidth=width;
  render({keepLayers:true});
  host.inert=Boolean(stack.children.length);
  if(stack.children.length)screen.pausePreview?.();
  for(const layer of stack.children){
   if(layer.momentView){
    layer.originCard=screen.querySelectorAll('.ivi-moment-card')[layer.originIndex]||null;
    if(layer.originCard)layer.originCard.style.visibility='hidden';
   }
  }
 }
 for(const layer of stack.children){
  layer.momentView?.setSize({width,height});
  if(layer.returnLayer&&!layer.backGesture)layer.returnLayer.style.transform=`translateY(${-height}px)`;
 }
}).observe(phone);
