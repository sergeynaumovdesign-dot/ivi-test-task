import { extraComponents } from '../extra-components.js';
import { createSeries } from '../components/series.js';
import { createFeedbackBlock } from '../components/feedback-block.js';
import { createMomentScreen } from '../components/moment-screen.js';
import { createContentCardCover } from '../components/content-card-cover.js';
import { createContentPageHeader } from '../components/content-page-header.js';
import { createProgressBar } from '../components/progress-bar.js';
import { createSeasonTabs } from '../components/season-tabs.js';
import { createTabsBlock } from '../components/tabs-block.js';
import { createPoster } from '../components/poster.js';
import { createFriendRate } from '../components/friend-rate.js';
import { createPersonCard } from '../components/person-card.js';
import { createContentDetailScreen } from '../components/content-detail-screen.js';
import { createVideoPlayer, createVideoLoadingIndicator } from '../components/video-player.js';
import { createButton } from '../components/button.js';
import { titles } from '../prototype-data.js';
await document.fonts.ready;
await Promise.all([400,500,700].map(w=>document.fonts.load(`${w} 16px "IVI Sans AI SVG"`)));
const results=document.querySelector('#results'),fixtures=document.querySelector('#fixtures'),stage=document.querySelector('#test-stage');
const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
const assert=(condition,message)=>{if(!condition)throw Error(message);};
async function test(name,fn){const row=document.createElement('li');results.append(row);try{await fn();row.textContent='✓ '+name;row.className='pass';}catch(error){row.textContent='✗ '+name+': '+error.message;row.className='fail';}}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
await test('Трейлер: быстрый первый кадр не показывает лоадер; медленная загрузка соблюдает 300/500',async()=>{
 const video=document.createElement('video');let readyState=0,seeking=false,next=0;const frames=new Map();
 Object.defineProperties(video,{readyState:{get:()=>readyState},seeking:{get:()=>seeking}});
 video.requestVideoFrameCallback=fn=>{frames.set(++next,fn);return next;};video.cancelVideoFrameCallback=id=>frames.delete(id);
 const loading=createVideoLoadingIndicator(video);stage.append(video,loading);
 try{
  assert(loading.hidden&&video.style.visibility==='hidden','Первые 300 мс не должно быть ни постера, ни лоадера');
  video.dispatchEvent(new Event('playing'));assert(loading.hidden,'playing без кадра не должен показывать видео');
  readyState=2;video.dispatchEvent(new Event('playing'));assert(video.style.visibility==='hidden','Видео ждёт отрисовки кадра');
  [...frames.values()].at(-1)();assert(loading.hidden&&video.style.visibility!=='hidden','Быстрый кадр должен появиться без лоадера');
  await wait(330);assert(loading.hidden,'Отменённый таймер не должен показывать лоадер');
  video.dispatchEvent(new Event('waiting'));assert(loading.hidden&&video.style.visibility!=='hidden','Короткая буферизация не должна скрывать уже показанный кадр');
  await wait(200);assert(loading.hidden,'Лоадер не должен появляться раньше 300 мс');
  await wait(130);assert(!loading.hidden,'После 300 мс должен появиться лоадер');
  video.dispatchEvent(new Event('playing'));const stale=[...frames.values()].at(-1);
  seeking=true;video.dispatchEvent(new Event('seeking'));stale();assert(!loading.hidden,'Старый кадр не должен скрыть лоадер после перемотки');
  seeking=false;video.dispatchEvent(new Event('seeked'));[...frames.values()].at(-1)();
  assert(!loading.hidden&&video.style.visibility!=='hidden','Готовое видео запускается, но лоадер остаётся минимум 500 мс');
  await wait(200);assert(!loading.hidden,'Лоадер исчез раньше минимальных 500 мс');
  await wait(330);assert(loading.hidden,'Лоадер не исчез после готового кадра и 500 мс');
 }finally{loading.destroy();video.remove();}
});
await test('Трейлер: первый кадр появляется вместе с исчезновением лоадера, без вспышки',async()=>{
 const video=document.createElement('video');let reveal;
 Object.defineProperty(video,'readyState',{get:()=>2});video.requestVideoFrameCallback=fn=>{reveal=fn;return 1;};video.cancelVideoFrameCallback=()=>{};
 const loading=createVideoLoadingIndicator(video);stage.append(video,loading);
 try{
  await wait(330);assert(!loading.hidden,'Долгая загрузка должна показать лоадер');
  video.dispatchEvent(new Event('playing'));reveal();
  assert(video.style.visibility==='hidden','Видео не должно вспыхнуть под ещё видимым лоадером');
  await wait(200);assert(!loading.hidden&&video.style.visibility==='hidden','Первый кадр появился раньше завершения минимального показа');
  await wait(330);assert(loading.hidden&&video.style.visibility!=='hidden','Видео и лоадер должны переключиться одновременно');
  video.dispatchEvent(new Event('waiting'));assert(video.style.visibility!=='hidden','Короткое ожидание скрыло последний кадр');
  video.dispatchEvent(new Event('playing'));reveal();await wait(330);
  assert(loading.hidden&&video.style.visibility!=='hidden','Короткое ожидание вызвало мигание');
  video.dispatchEvent(new Event('seeking'));assert(video.style.visibility!=='hidden','Перемотка должна удерживать последний кадр');
 }finally{loading.destroy();video.remove();}
});
await test('Трейлер: возврат удерживает сохранённый кадр до показа восстановленного видео',async()=>{
 const video=document.createElement('video'),snapshot=document.createElement('canvas'),controller=new AbortController();let reveal,presentations=0;
 Object.defineProperty(video,'readyState',{get:()=>2});video.requestVideoFrameCallback=fn=>{reveal=fn;return 1;};video.cancelVideoFrameCallback=()=>{};
 const loading=createVideoLoadingIndicator(video,{signal:controller.signal,onReady:()=>{presentations++;snapshot.remove();}});stage.append(snapshot,video,loading);
 try{
  assert(snapshot.isConnected&&video.style.visibility==='hidden','До готового трейлера должен оставаться сохранённый кадр');
  await wait(330);video.dispatchEvent(new Event('playing'));reveal();
  assert(snapshot.isConnected&&!loading.hidden,'Кадр удалён до завершения минимального показа лоадера');
  await wait(530);assert(!snapshot.isConnected&&loading.hidden&&video.style.visibility!=='hidden'&&presentations===1,'Сохранённый кадр и видео должны заменяться одновременно');
  video.dispatchEvent(new Event('waiting'));video.dispatchEvent(new Event('playing'));reveal();
  assert(presentations===1,'Короткая буферизация повторила передачу кадра');
 }finally{controller.abort();video.remove();snapshot.remove();}
 const cancelledVideo=document.createElement('video'),cancelled=new AbortController();let stale;
 Object.defineProperty(cancelledVideo,'readyState',{get:()=>2});cancelledVideo.requestVideoFrameCallback=fn=>{stale=fn;return 1;};cancelledVideo.cancelVideoFrameCallback=()=>{};
 createVideoLoadingIndicator(cancelledVideo,{signal:cancelled.signal,onReady:()=>{throw Error('Устаревший плеер не должен удалять сохранённый кадр');}});
 cancelledVideo.dispatchEvent(new Event('playing'));cancelled.abort();stale();
});
await test('Моменты: лоадер соблюдает 300/500 и отменяется при смене экрана',async()=>{
 const view=createMomentScreen({autoplay:false});stage.append(view);
 const loading=view.querySelector('.ivi-moment-screen__loading');
 try{
  view.setState('Loading');assert(loading.hidden,'Лоадер не должен появляться сразу');
  view.setState('Default');await wait(330);assert(loading.hidden,'Быстрая загрузка показала лоадер');
  view.setState('Loading');await wait(200);assert(loading.hidden,'Лоадер появился раньше 300 мс');
  await wait(130);assert(!loading.hidden,'Медленная загрузка не показала лоадер');
  view.setState('Default');await wait(200);assert(!loading.hidden,'Лоадер не выдержал минимум 500 мс');
  // A new wait while the loader is visible must cancel its pending hide.
  view.setState('Loading');await wait(330);assert(!loading.hidden,'Повторная буферизация скрыла лоадер');
  view.setState('Default');assert(loading.hidden,'После 500 мс готовый момент должен сразу скрыть лоадер');
  view.setState('Loading');view.setState('Paused');await wait(330);assert(loading.hidden,'Лоадер появился поверх пользовательской паузы');
  view.setState('Loading');view.destroy();await wait(330);assert(loading.hidden,'Лоадер появился после закрытия');
 }finally{view.destroy();view.remove();}
});
await test('Трейлер: передача плеера отменяет лоадер и его отложенные события',()=>{
 const video=document.createElement('video'),controller=new AbortController();let reveal;
 Object.defineProperty(video,'readyState',{get:()=>2});video.requestVideoFrameCallback=fn=>{reveal=fn;return 1;};video.cancelVideoFrameCallback=()=>{};
 const loading=createVideoLoadingIndicator(video,{signal:controller.signal});stage.append(video,loading);
 video.dispatchEvent(new Event('playing'));controller.abort();reveal();video.dispatchEvent(new Event('waiting'));
 assert(!loading.isConnected&&video.style.visibility==='','После передачи плеера старый лоадер не должен менять видимость');
 const returned=createVideoLoadingIndicator(video);stage.append(returned);assert(returned.hidden&&video.style.visibility==='hidden','После возврата трейлер ждёт свой кадр без мгновенного лоадера');
 video.dispatchEvent(new Event('error'));assert(returned.textContent.includes('Не удалось загрузить'),'Ошибка не должна оставлять бесконечный лоадер');
 returned.destroy();video.remove();
});
await test('Трейлер: новый файл используется только для полноэкранного просмотра',()=>{
 assert(titles.serial.cover.fullVideoSrc.endsWith('hannibal-trailer-browser-cut.mp4'),'Полноэкранный трейлер не заменён');
 assert(titles.serial.cover.videoSrc.endsWith('hannibal-trailer-preview.mp4'),'Видеопревью должно остаться прежним');
});
function previewFixture() {
 const originalCreate=document.createElement.bind(document),OriginalObserver=window.IntersectionObserver;
 let readyState=0,notify,reveal,source='';
 const video=originalCreate('video');
 Object.defineProperties(video,{readyState:{get:()=>readyState},src:{get:()=>source,set:value=>{source=value;}}});
 video.play=()=>Promise.resolve();video.pause=()=>{};
 video.requestVideoFrameCallback=fn=>{reveal=fn;return 1;};video.cancelVideoFrameCallback=()=>{};
 let header;
 try{
  document.createElement=(name,...args)=>name==='video'?video:originalCreate(name,...args);
  window.IntersectionObserver=class{constructor(callback){notify=callback;}observe(){}disconnect(){}};
  header=createContentPageHeader({...titles.serial.cover});
 }finally{document.createElement=originalCreate;window.IntersectionObserver=OriginalObserver;}
 stage.append(header);notify([{intersectionRatio:1}]);
 const queueReady=()=>{readyState=2;video.dispatchEvent(new Event('playing'));return reveal;};
 return {header,video,image:header.querySelector('.ivi-content-cover__image'),queueReady,ready(){queueReady()();},visible(next){notify([{intersectionRatio:next?1:0}]);},destroy(){header.destroy();header.remove();}};
}
await test('Превью трейлера: готовый первый кадр плавно появляется без обязательной задержки',async()=>{
 const f=previewFixture();
 try{
  assert(!f.image.hidden&&f.video.style.opacity==='0','До первого кадра должен быть виден постер');
  assert(!f.video.hasAttribute('poster'),'Нативный постер не должен перекрывать плавное появление');
  const reveal=f.queueReady();assert(f.video.style.opacity==='0','playing без отрисованного кадра не должен скрывать постер');
  reveal();assert(!f.image.hidden&&f.video.style.opacity==='1','Готовое видео должно появляться сразу, а постер оставаться под ним');
  assert(getComputedStyle(f.video).transitionProperty==='opacity','Появление видео должно анимировать прозрачность');
  await wait(200);assert(!f.image.hidden&&f.video.style.opacity==='1','Постер должен оставаться под видео после появления');
 }finally{f.destroy();}
});
await test('Превью трейлера: загрузка и перемотка сохраняют последний показанный кадр',async()=>{
 const f=previewFixture();
 try{
  await wait(330);assert(!f.image.hidden&&f.video.style.opacity==='0','До готового кадра должен оставаться постер');
  f.ready();assert(!f.image.hidden&&f.video.style.opacity==='1','Готовый кадр не должен ждать таймер');
  f.video.dispatchEvent(new Event('waiting'));await wait(330);
  assert(f.video.style.opacity==='1','Буферизация не должна возвращать постер поверх последнего кадра');
  f.video.dispatchEvent(new Event('seeking'));assert(f.video.style.opacity==='1','Перемотка должна сохранять последний кадр');
  f.ready();assert(f.video.style.opacity==='1','Возобновление не должно повторять появление видео');
  f.video.dispatchEvent(new Event('emptied'));assert(!f.image.hidden&&f.video.style.opacity==='0','Смена источника должна возвращать постер до нового кадра');
 }finally{f.destroy();}
});
await test('Превью трейлера: возврат сохраняет кадр, закрытие отменяет устаревшее появление',async()=>{
 const f=previewFixture();
 try{
  const stale=f.queueReady();f.header.pausePreview();stale();
  assert(!f.image.hidden&&f.video.style.opacity==='0','Кадр не должен появляться под открытым плеером');
  f.header.resumePreview();f.ready();assert(f.video.style.opacity==='1','Возврат должен запускать готовое превью без задержки');
  f.header.pausePreview();f.header.resumePreview();assert(f.video.style.opacity==='1','Возврат из трейлера не должен заново показывать постер');
  f.visible(false);f.visible(true);assert(f.video.style.opacity==='1','Повторное попадание в область просмотра должно сохранять кадр');
  f.video.dispatchEvent(new Event('emptied'));const destroyedFrame=f.queueReady();f.header.destroy();destroyedFrame();
  assert(f.video.style.opacity==='0','Устаревший кадр не должен появляться после удаления компонента');
 }finally{f.destroy();}
 const poster=createContentPageHeader({mediaType:'Poster'});
 assert(!poster.querySelector('.ivi-content-cover__image').hidden,'Статический режим Poster должен показывать изображение сразу');poster.destroy();
});
await test('Превью трейлера: малый буфер не блокирует запуск; открытый плеер останавливает превью',()=>{
 const OriginalObserver=window.IntersectionObserver;
 let header;
 try{
  window.IntersectionObserver=class{constructor(callback){this.callback=callback;}observe(){this.callback([{intersectionRatio:1}]);}disconnect(){}};
  header=createContentPageHeader({...titles.serial.cover});
  const video=header.querySelector('video');
  let plays=0;video.play=()=>{plays++;return Promise.resolve();};video.pause=()=>{};
  Object.defineProperties(video,{duration:{get:()=>100},buffered:{get:()=>({length:1,end:()=>1})}});
  video.dispatchEvent(new Event('canplay'));
  assert(plays===1,'Превью должно запускаться при готовом первом кадре и буфере 1%');
  assert(video.defaultMuted&&video.playsInline&&video.autoplay,'Начальный режим Safari: muted, playsinline, autoplay');
  header.pausePreview();video.dispatchEvent(new Event('canplay'));
  assert(plays===1,'Загрузка не должна возобновлять превью под открытым плеером');
  header.resumePreview();assert(plays===2,'Возврат возобновляет превью');
 }finally{header?.destroy();window.IntersectionObserver=OriginalObserver;}
});
for(const [key,item] of Object.entries(extraComponents)){
 await test(`${item.label}: все варианты и изображения`,async()=>{
  const box=document.createElement('section');box.className='fixture';box.id=key;const title=document.createElement('h2');title.textContent=item.label;box.append(title);
  for(const props of item.variants){const component=item.factory({...item.defaults,...props});box.append(component);}
  fixtures.append(box);await frame();
  for(const img of box.querySelectorAll('img')){if(!img.getAttribute('src'))continue;await img.decode();assert(img.naturalWidth>0,'Изображение не загрузилось');}
  assert(box.querySelector('[class^="ivi-"]'),'Компонент пуст');
 });
}
await test('Series: пропорции 320/375 и верхний предел 152 × 85',async()=>{
 for(const width of [320,375,390,430]){const card=createSeries({width,showDescription:false});stage.append(card);await frame();const p=card.querySelector('.ivi-series-preview').getBoundingClientRect();const ratio=Math.min(1,width/375);assert(Math.abs(p.width-152*ratio)<.1,`ширина ${p.width}`);assert(Math.abs(p.height-85*ratio)<.1,`высота ${p.height}`);card.destroy();card.remove();}
});
await test('Series: начатая серия продолжает с сохранённой позиции',()=>{
 let position;const c=createSeries({state:'Started',durationSeconds:2520,progress:.32,onWatch:data=>position=data.startAt});stage.append(c);c.querySelector('.ivi-series__row').click();assert(Math.abs(position-806.4)<.1,`Получено ${position}`);c.destroy();c.remove();
});
await test('Season Tab: Pressed сохраняет номер сезона',()=>{
 const c=createSeasonTabs({count:3,active:1,pressed:3});stage.append(c);
 const tabs=[...c.querySelectorAll('.ivi-season')];assert(tabs[2].dataset.state==='Pressed','Третий сезон не Pressed');assert(tabs[2].querySelector('.ivi-season__face').textContent==='3','Номер сезона обрезан');c.remove();
});
await test('Poster: размер не зависит от ширины экрана',()=>{
 for(const width of [320,375,430]){const item=createPoster({width:160,height:246});item.style.setProperty('--screen-width',`${width}px`);stage.append(item);const box=item.getBoundingClientRect();assert(box.width===160&&box.height===246,`Размер ${box.width}×${box.height}`);item.remove();}
});
await test('Tabs Block: высота 32 и индикатор внутри блока',()=>{
 const tabs=createTabsBlock({tabs:['О сериале','Сезоны'],width:375});stage.append(tabs);const root=tabs.getBoundingClientRect(),indicator=tabs.querySelector('.ivi-tabs-block__indicator').getBoundingClientRect();assert(Math.abs(root.height-32)<.1,'Высота Tabs Block');assert(indicator.bottom<=root.bottom+.1&&indicator.top>=root.top-.1,'Индикатор вышел из блока');tabs.remove();
});
await test('Feedback: дизлайк, отмена, лайк, смена реакции',()=>{
 const c=createFeedbackBlock({likes:32});stage.append(c);const count=()=>c.querySelector('.ivi-feedback-block__count').textContent;
 const like=c.querySelector('[data-kind="like"]'),dislike=c.querySelector('[data-kind="dislike"]');dislike.click();assert(count()==='31','Дизлайк');dislike.click();assert(count()==='32','Отмена');like.click();assert(count()==='33','Лайк');dislike.click();assert(count()==='31','Смена реакции');c.remove();
});
await test('Feedback: ошибка возвращает прежнее число и реакцию',async()=>{
 const c=createFeedbackBlock({likes:32,onReact:()=>Promise.reject(Error('test'))});stage.append(c);c.querySelector('[data-kind="dislike"]').click();await frame();assert(c.querySelector('.ivi-feedback-block__count').textContent==='32','Счётчик не восстановился');assert(c.getReaction()===null,'Реакция не восстановилась');c.remove();
});
await test('Moment: реакции сохраняются при переключении и возврате',()=>{
 const c=createMomentScreen({state:'Paused',autoplay:false,moments:[{title:'Первый',likes:32},{title:'Второй',likes:10}]});stage.append(c);
 c.querySelector('[aria-label="Нравится"]').click();c.querySelector('[aria-label="Добавить в избранное"]').click();c.switchMoment(1);assert(c.querySelector('[aria-label="Убрать из избранного"]'),'Избранное одного тайтла не общее');c.switchMoment(0);assert(c.querySelector('[aria-label="Убрать отметку «Нравится»"]'),'Лайк сбросился');assert(c.querySelector('[aria-label="Убрать из избранного"]'),'Избранное сбросилось');c.destroy();c.remove();
});
await test('Moment: Ended = 100%; статичное превью не движется',async()=>{
 const c=createMomentScreen({state:'Ended',autoplay:false});stage.append(c);assert(c.querySelector('[role="slider"]').getAttribute('aria-valuenow')==='100','Не конец');c.setState('Default');const before=c.querySelector('[role="slider"]').getAttribute('aria-valuenow');await new Promise(r=>setTimeout(r,250));assert(before===c.querySelector('[role="slider"]').getAttribute('aria-valuenow'),'Фальшивое воспроизведение');c.destroy();c.remove();
});
await test('Moment: первый кадр не переключает звук после запуска',async()=>{
 const video=document.createElement('video');let reveal,playing=false,muted=true;const audioChanges=[];
 Object.defineProperty(video,'muted',{get:()=>muted,set:value=>{muted=value;audioChanges.push({value,playing});}});
 Object.defineProperty(video,'paused',{get:()=>!playing});
 video.requestVideoFrameCallback=callback=>{reveal=callback;};
 video.play=()=>{assert(!video.muted,'Открытие по нажатию должно сразу запрашивать звук');playing=true;return Promise.resolve();};
 video.pause=()=>{playing=false;};
 const view=createMomentScreen({videoSrc:titles.serial.moments[0].videoSrc,preparedVideo:video,autoplay:false,muted:false});stage.append(view);
 try{view.play();await Promise.resolve();reveal();assert(!audioChanges.some(change=>change.playing),'Звук изменился из асинхронного показа кадра');assert(video.style.opacity==='1','Кадр не появился');}
 finally{view.destroy();view.remove();}
});
await test('Moment: запрет звукового автозапуска запускает видео без звука',async()=>{
 const video=document.createElement('video');let plays=0,playing=false;
 Object.defineProperty(video,'paused',{get:()=>!playing});video.pause=()=>{playing=false;};
 video.play=()=>{plays++;if(!video.muted)return Promise.reject(new DOMException('Autoplay denied','NotAllowedError'));playing=true;video.dispatchEvent(new Event('playing'));return Promise.resolve();};
 const view=createMomentScreen({videoSrc:titles.serial.moments[0].videoSrc,preparedVideo:video,autoplay:false,muted:false});stage.append(view);
 try{view.play();video.dispatchEvent(new Event('waiting'));await Promise.resolve();await Promise.resolve();assert(plays===2&&playing&&video.muted,'Видео не запущено после отказа Safari');assert(view.getState()==='Default','Экран остался в состоянии загрузки');}
 finally{view.destroy();view.remove();}
});
await test('Moment: отложенный отказ не возобновляет видео после паузы или закрытия',async()=>{
 for(const close of [false,true]){
  const video=document.createElement('video');let rejectPlay,plays=0;
  video.pause=()=>{};video.play=()=>{plays++;return new Promise((resolve,reject)=>{rejectPlay=reject;});};
  const view=createMomentScreen({videoSrc:titles.serial.moments[0].videoSrc,preparedVideo:video,autoplay:false});stage.append(view);
  try{view.play();if(close)view.destroy();else view.setState('Paused');rejectPlay(new DOMException('Autoplay denied','NotAllowedError'));await Promise.resolve();await Promise.resolve();assert(plays===1,'Отложенный отказ повторно запустил остановленное видео');if(!close)assert(view.getState()==='Paused','Пользовательская пауза сброшена');}
  finally{view.destroy();view.remove();}
 }
});
await test('Moment: повторный отказ автозапуска не вызывает бесконечные попытки',async()=>{
 const video=document.createElement('video');let plays=0;
 video.pause=()=>{};video.play=()=>{plays++;return Promise.reject(new DOMException('Autoplay denied','NotAllowedError'));};
 const view=createMomentScreen({videoSrc:titles.serial.moments[0].videoSrc,preparedVideo:video,autoplay:false});stage.append(view);
 try{view.play();await Promise.resolve();await Promise.resolve();await Promise.resolve();assert(plays===2&&view.getState()==='Paused','Отказ должен остановить попытки и отобразить паузу');}
 finally{view.destroy();view.remove();}
});
await test('Moment: свайп запускает звук в жесте и передаёт тот же видеоплеер после анимации',async()=>{
 for(const muted of [false,true]){
  let inGesture=false,plays=0,playing=false,pauses=0,acquired=0;
  const nextVideo=document.createElement('video');
  Object.defineProperty(nextVideo,'paused',{get:()=>!playing});
  nextVideo.pause=()=>{pauses++;playing=false;};
  nextVideo.play=()=>{plays++;assert(inGesture,'play() вызван после завершения жеста');assert(nextVideo.muted===muted,'Звук не соответствует настройке');playing=true;return Promise.resolve();};
  const moments=[{...titles.serial.moments[0],videoSrc:''},{...titles.serial.moments[1],preparedVideo:nextVideo}];
  const view=createMomentScreen({moments,autoplay:false,muted,onAcquireVideo:v=>{if(v===nextVideo)acquired++;}});stage.append(view);
  try{
   view.dispatchEvent(new PointerEvent('pointerdown',{button:0,pointerId:22,clientX:100,clientY:650,bubbles:true}));
   view.dispatchEvent(new PointerEvent('pointermove',{pointerId:22,clientX:100,clientY:220,bubbles:true}));
   inGesture=true;view.dispatchEvent(new PointerEvent('pointerup',{pointerId:22,clientX:100,clientY:220,bubbles:true}));inGesture=false;
   assert(plays===1&&playing,'Следующее видео не запущено непосредственно в свайпе');
   const previewMedia=view.querySelector('.ivi-moment-screen__incoming .ivi-moment-screen__media');
   assert(Math.abs(nextVideo.getBoundingClientRect().top-previewMedia.getBoundingClientRect().top)<1,'Видео находится за нижним краем следующего экрана');
   const transition=view.querySelector('.ivi-moment-screen__page');
   transition.dispatchEvent(new TransitionEvent('transitionend',{propertyName:'transform',bubbles:true}));await frame();
   assert(view.getMomentIndex()===1,'Момент не переключился');
   assert(view.querySelector('.ivi-moment-screen__media > video')===nextVideo,'Создан другой видеоплеер без разрешения на звук');
   assert(plays===1&&pauses===1&&acquired===1&&playing,'Передача прервала воспроизведение или запросила звук повторно');
  }finally{view.destroy();view.remove();}
 }
});
await test('Moment: закрытие во время перехода останавливает подготовленное видео',async()=>{
 const nextVideo=document.createElement('video');let playing=false,released=0;
 nextVideo.pause=()=>{playing=false;};nextVideo.play=()=>{playing=true;return Promise.resolve();};
 const view=createMomentScreen({moments:[{...titles.serial.moments[0],videoSrc:''},{...titles.serial.moments[1],preparedVideo:nextVideo}],autoplay:false,onReleaseVideo:v=>{if(v===nextVideo)released++;}});stage.append(view);
 try{
  view.dispatchEvent(new PointerEvent('pointerdown',{button:0,pointerId:23,clientX:100,clientY:650,bubbles:true}));
  view.dispatchEvent(new PointerEvent('pointermove',{pointerId:23,clientX:100,clientY:220,bubbles:true}));
  view.dispatchEvent(new PointerEvent('pointerup',{pointerId:23,clientX:100,clientY:220,bubbles:true}));
  assert(playing,'Свайп не запустил видео');view.destroy();await frame();assert(!playing&&released===1,'Видео продолжает играть после закрытия');
 }finally{view.remove();}
});
await test('Moment: свайп сохраняет видеоплеер с уже разрешённым звуком',async()=>{
 let playing=false,plays=0,pauses=0,acquired=0,released=0;
 const player=document.createElement('video'),unused=document.createElement('video');
 Object.defineProperty(player,'paused',{get:()=>!playing});
 player.play=()=>{plays++;assert(!player.muted,'Звук выключился');playing=true;return Promise.resolve();};
 player.pause=()=>{pauses++;playing=false;};unused.play=()=>{throw Error('Использован новый плеер без разрешения на звук');};
 const view=createMomentScreen({moments:[{...titles.serial.moments[0],preparedVideo:player},{...titles.serial.moments[1],preparedVideo:unused}],autoplay:false,onAcquireVideo:()=>acquired++,onReleaseVideo:()=>released++});stage.append(view);
 try{
  view.play();
  view.dispatchEvent(new PointerEvent('pointerdown',{button:0,pointerId:24,clientX:100,clientY:650,bubbles:true}));
  view.dispatchEvent(new PointerEvent('pointermove',{pointerId:24,clientX:100,clientY:220,bubbles:true}));
  view.dispatchEvent(new PointerEvent('pointerup',{pointerId:24,clientX:100,clientY:220,bubbles:true}));const beforeHandoff=pauses;
  view.querySelector('.ivi-moment-screen__page').dispatchEvent(new TransitionEvent('transitionend',{propertyName:'transform',bubbles:true}));await frame();
  assert(view.querySelector('.ivi-moment-screen__media > video')===player,'Разрешённый плеер заменён');
  assert(player.src===titles.serial.moments[1].videoSrc,'Источник не переключился');
  assert(playing&&plays===2&&pauses===beforeHandoff&&acquired===1&&released===0,'Передача прервала звуковое воспроизведение');
 }finally{view.destroy();view.remove();}
 assert(released===1,'Плеер не освобождён при закрытии');
});
await test('Moment: touchend повторяет запуск со звуком при отказе pointerup',async()=>{
 const player=document.createElement('video');let touch=false,playing=false,plays=0;
 Object.defineProperty(player,'paused',{get:()=>!playing});player.pause=()=>{playing=false;};
 player.play=()=>{plays++;assert(!player.muted,'Попытка запуска стала беззвучной');if(!touch)return Promise.reject(new DOMException('Needs touchend','NotAllowedError'));playing=true;return Promise.resolve();};
 const view=createMomentScreen({moments:[{...titles.serial.moments[0],videoSrc:''},{...titles.serial.moments[1],preparedVideo:player}],autoplay:false});stage.append(view);
 try{
  view.dispatchEvent(new PointerEvent('pointerdown',{button:0,pointerId:25,clientX:100,clientY:650,bubbles:true}));
  view.dispatchEvent(new PointerEvent('pointermove',{pointerId:25,clientX:100,clientY:220,bubbles:true}));
  view.dispatchEvent(new PointerEvent('pointerup',{pointerId:25,clientX:100,clientY:220,bubbles:true}));await Promise.resolve();
  touch=true;view.dispatchEvent(new Event('touchend',{bubbles:true}));touch=false;
  view.querySelector('.ivi-moment-screen__page').dispatchEvent(new TransitionEvent('transitionend',{propertyName:'transform',bubbles:true}));await frame();
  assert(plays===2&&playing&&!player.muted&&view.getMomentIndex()===1,'touchend не восстановил звуковой запуск');
 }finally{view.destroy();view.remove();}
});
await test('Moment: открытие подготовленного ролика сбрасывает прежнюю позицию на ноль',()=>{
 const player=document.createElement('video');let position=2.29,playedAt;
 Object.defineProperties(player,{readyState:{get:()=>2},currentTime:{get:()=>position,set:value=>{position=value;}}});
 player.pause=()=>{};player.play=()=>{playedAt=position;return Promise.resolve();};
 const view=createMomentScreen({...titles.serial.moments[2],preparedVideo:player,autoplay:false});stage.append(view);
 try{view.play();assert(playedAt===0,'Подготовленный ролик продолжился с прежнего времени');}
 finally{view.destroy();view.remove();}
});
await test('Moment: плеер трейлера сохраняется между моментами и возвращается владельцу',async()=>{
 for(const closeDuringSwipe of [false,true]){
  const warm=document.createElement('video'),trailer=document.createElement('video');let playing=false,released=0,warmReleased=0;
  warm.pause=()=>{};Object.defineProperty(trailer,'paused',{get:()=>!playing});
  trailer.pause=()=>{playing=false;};trailer.play=()=>{assert(!trailer.muted,'Звук трейлера потерян');playing=true;return Promise.resolve();};
  const view=createMomentScreen({moments:[{...titles.serial.moments[0],preparedVideo:warm},titles.serial.moments[1]],autoplay:false,onReleaseVideo:video=>{if(video===warm)warmReleased++;else throw Error('Внешний плеер передан в кэш моментов');}});stage.append(view);
  try{
   assert(view.useVideo(trailer,video=>{assert(video===trailer,'Возвращён другой плеер');released++;}), 'Плеер трейлера не принят');view.play();
   assert(warmReleased===1&&playing&&view.querySelector('video')===trailer,'Передача не сохранила разрешённый плеер');
   view.dispatchEvent(new PointerEvent('pointerdown',{button:0,pointerId:26,clientX:100,clientY:650,bubbles:true}));
   view.dispatchEvent(new PointerEvent('pointermove',{pointerId:26,clientX:100,clientY:220,bubbles:true}));
   view.dispatchEvent(new PointerEvent('pointerup',{pointerId:26,clientX:100,clientY:220,bubbles:true}));
   if(!closeDuringSwipe){view.querySelector('.ivi-moment-screen__page').dispatchEvent(new TransitionEvent('transitionend',{propertyName:'transform',bubbles:true}));await frame();assert(playing&&view.querySelector('video')===trailer,'Свайп заменил плеер трейлера');}
   view.destroy();assert(!playing&&released===1,'Внешний плеер не освобождён ровно один раз');
  }finally{view.remove();}
 }
});
await test('Составные компоненты используют общие примитивы',()=>{
 const cover=createContentCardCover();assert(cover.querySelector('.ivi-title-block .ivi-tag'),'Title Block / Tag');assert(cover.querySelector('.ivi-content-cover__header .ivi-icon-button'),'Header / Icon Button');assert(cover.querySelectorAll('.ivi-buttons-block .ivi-button').length===5,'Buttons Block / Button');assert(createProgressBar().querySelector('.ivi-blob'),'Progress / Blob');assert(createSeasonTabs().querySelectorAll('.ivi-season').length===3,'Seasons / Season Tab');assert(createFriendRate().querySelector('.ivi-tag'),'Friend / Tag');assert(createPersonCard({variant:'Friend'}).querySelector('.ivi-tag'),'Person / Tag');cover.destroy();
});
await test('Content Screen: один переключатель скрывает отзывы и саммари',async()=>{
 const screen=createContentDetailScreen({blocks:{feedback:false}});stage.append(screen);await frame();
 assert(screen.querySelector('.ivi-content-cover'),'Обложка не собрана');
 assert(screen.querySelector('.ivi-moment-card'),'Моменты не собраны');
 assert(!screen.querySelector('.ivi-feedback-summary'),'Саммари отображается при скрытых отзывах');
 assert(screen.querySelector('.ivi-content-detail-screen__section--videos'),'Блок видео не собран');
 assert(!screen.querySelector('.ivi-feedback-block'),'Выключенный блок отзывов отображается');
 screen.destroy();screen.remove();
});
await test('Content Screen: выбранный сезон и переключение списка',()=>{
 let selected;const screen=createContentDetailScreen({activeTab:1,activeSeason:3,onSeasonChange:season=>selected=season});stage.append(screen);
 assert(screen.querySelector('.ivi-season[aria-selected="true"]').getAttribute('aria-label')==='Сезон 3','Начальный сезон сброшен');
 assert(screen.querySelector('.ivi-series__row').textContent.includes('Серия 1'),'Показан список другого сезона');
 screen.querySelectorAll('.ivi-season')[0].click();assert(selected===1,'Смена сезона не передана экрану');
 assert(screen.querySelector('.ivi-series__row').textContent.includes('Аперитив'),'Список не обновлён');screen.destroy();screen.remove();
});
await test('Content Screen: подписи фильма и отступы под табами',()=>{
 const film=createContentDetailScreen({variant:'Film'});stage.append(film);
 assert(film.textContent.includes('Материалы фильма')&&film.textContent.includes('Фильм в подборках'),'Остались подписи сериала');film.destroy();film.remove();
 const serial=createContentDetailScreen();stage.append(serial);const tabs=serial.querySelector('.ivi-tabs-block');
 assert(getComputedStyle(tabs.nextElementSibling).paddingTop==='20px','Нет отступа 20 под табами');
 assert(getComputedStyle(serial.querySelector(':scope > .ivi-content-detail-screen__season-panel')).paddingTop==='20px','Нет отступа 20 у сезонов');serial.destroy();serial.remove();
});
await test('Friend Rate: длинное имя на 320 px, неизменные подпись и оценка',async()=>{
 for(const score of [7,8,10]){
  const friend=createFriendRate({name:'Александр Александрович Миккельсен',score,width:320});stage.append(friend);await frame();
  const name=friend.querySelector('.ivi-friend-rate__name'),suffix=friend.querySelector('.ivi-friend-rate__suffix'),badge=friend.querySelector('.ivi-tag');
  assert(name.textContent==='Александр Александрович Миккельсен','Имя обрезано по числу символов');
  assert(name.scrollWidth>name.clientWidth,'Не включилось сокращение по ширине');
  assert(suffix.clientWidth>=suffix.scrollWidth,'Подпись обрезана');
  assert(badge.getBoundingClientRect().right<=friend.getBoundingClientRect().right,'Оценка вышла за границы');
  assert(suffix.textContent===(score>=8?'рекомендует':'поставил оценку'),'Граница 8 обработана неверно');friend.remove();
 }
});
await test('Friend Rate: переход с вкладки сезонов к оценкам друзей',()=>{
 let target;const screen=createContentDetailScreen({activeTab:1,onOpenFriendRatings:section=>target=section});stage.append(screen);
 screen.querySelector('.ivi-friend-rate').click();assert(target?.dataset.section==='friends','Нет целевого блока');
 assert(!screen.querySelector('.ivi-content-detail-screen__content').hidden,'Оценки скрыты во вкладке');
 assert(screen.querySelector('[role="tab"][aria-selected="true"]').textContent==='О сериале','Вкладка не обновлена');screen.destroy();screen.remove();
});
await test('Button: состояния используют семантические токены',()=>{
 const container=document.createElement('div');container.style.setProperty('--ivi-action-primary-default','rgb(1, 2, 3)');container.style.setProperty('--ivi-action-primary-disabled','rgb(4, 5, 6)');stage.append(container);
 for(const state of ['Default','Disabled']){const button=createButton({state});container.append(button);assert(getComputedStyle(button.querySelector('.ivi-button__face')).backgroundColor===(state==='Default'?'rgb(1, 2, 3)':'rgb(4, 5, 6)'),'Цвет взят из выгрузки метрик вместо токена');}container.remove();
});
await test('Плеер: позиция начала, пауза и продолжение',async()=>{
 const player=createVideoPlayer({title:'Ганнибал',episode:'Сезон 1 серия 1',startAt:251});stage.append(player);
 assert(player.querySelector('.ivi-video-player__time').textContent.startsWith('4:11'),'Позиция начала потеряна');
 player.querySelector('.ivi-button').click();const paused=player.getPosition();await new Promise(r=>setTimeout(r,220));
 assert(player.getPosition()===paused,'Позиция движется на паузе');assert(player.dataset.playing==='false','Пауза не отражена');
 player.querySelector('.ivi-button').click();await new Promise(r=>setTimeout(r,220));assert(player.getPosition()>paused,'Продолжение не работает');player.destroy();player.remove();
});
await test('Момент: перемотка в конец и продолжение с позиции серии',()=>{
 let continuation;const moment=createMomentScreen({...titles.serial.moments[0],videoSrc:'',state:'Paused',onContinue:data=>continuation=data});stage.append(moment);
 const bar=moment.querySelector('.ivi-progress-bar'),hit=bar.querySelector('.ivi-progress-bar__hit'),box=bar.getBoundingClientRect();
 hit.setPointerCapture=()=>{}; // Synthetic pointers have no browser capture session.
 hit.dispatchEvent(new PointerEvent('pointerdown',{button:0,pointerId:11,clientX:box.right-4,clientY:box.top+8,bubbles:true}));
 hit.dispatchEvent(new PointerEvent('pointerup',{button:0,pointerId:11,clientX:box.right-4,clientY:box.top+8,bubbles:true}));
 assert(moment.getState()==='Ended','Перемотка в конец не завершила момент');
 moment.querySelector('.ivi-moment-screen__center button[aria-label="Смотреть продолжение"]').click();
 assert(continuation?.seconds===251&&continuation.episode==='Сезон 1 серия 1','Позиция или серия потеряна');moment.destroy();moment.remove();
});
await test('Моменты: время в кнопке совпадает с позицией продолжения после переключения',()=>{
 for(const title of Object.values(titles)){
  let continuation;
  const moments=title.moments.map(moment=>({...moment,videoSrc:''}));
  const view=createMomentScreen({moments,state:'Ended',autoplay:false,onContinue:data=>continuation=data});stage.append(view);
  moments.forEach((moment,index)=>{
   if(index){view.switchMoment(index);view.setState('Ended');}
   const button=view.querySelector('button[aria-label="Смотреть продолжение"]');
   const caption=button.querySelector('.ivi-button__caption').textContent;
   const [,minutes,seconds]=caption.match(/\| (\d+):(\d+)$/)||[];
   button.click();
   assert(continuation.seconds===moment.continuationSeconds,'Переход потерял позицию момента');
   assert(Number(minutes)*60+Number(seconds)===continuation.seconds,'Время в кнопке расходится с переходом');
   const player=createVideoPlayer({startAt:continuation.seconds,title:moment.contentTitle,episode:continuation.episode});
   player.setPlaying(false);assert(player.getPosition()===continuation.seconds,'Плеер открыл другую позицию');player.destroy();
  });
  view.destroy();view.remove();
 }
});
await test('Демо-контент: разные серии и отзывы',()=>{
 for(const season of titles.serial.episodeDescriptions)assert(new Set(season).size===season.length,'Повторяются описания серий');
 for(const title of Object.values(titles)){assert(new Set(title.reviews.map(x=>x.text)).size===title.reviews.length,'Повторяются отзывы');assert(title.reviews.every(x=>!x.text.includes('Материалы фильма')),'Посторонний заголовок в отзыве');}
});
await test('Завершённый момент: просмотр с начала, продолжение и повтор',()=>{
 for(const contentType of ['Serial','Film']){
  let start,continued;
  const view=createMomentScreen({state:'Ended',contentType,autoplay:false,videoSrc:'',onWatchFromStart:data=>start=data.seconds,onContinue:data=>continued=data.seconds});stage.append(view);
  const actions=[...view.querySelector('.ivi-moment-screen__center').querySelectorAll('button')];
  assert(actions.length===3,'Нет трёх действий');
  assert(actions[0].textContent===`Смотреть ${contentType==='Film'?'фильм':'сериал'} с начала`,'Не учтён тип тайтла');
  actions[0].click();assert(start===0,'Просмотр не начинается с нуля');assert(view.getState()==='Ended','Просмотр с начала сбрасывает завершённый момент');
  actions[1].click();assert(continued===251,'Продолжение потеряло позицию');assert(view.getState()==='Ended','Продолжение сбрасывает завершённый момент');
  actions[2].click();assert(view.getState()==='Default','Повтор не запускает момент');
  view.destroy();view.remove();
 }
});
const failed=results.querySelectorAll('.fail').length;document.title=failed?`${failed} ошибок`:`Проверки пройдены (${results.children.length})`;document.body.dataset.testResult=failed?'fail':'pass';
