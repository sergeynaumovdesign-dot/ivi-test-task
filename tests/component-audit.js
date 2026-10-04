import { extraComponents } from '../extra-components.js';
import { createSeries } from '../components/series.js';
import { createFeedbackBlock } from '../components/feedback-block.js';
import { createMomentScreen } from '../components/moment-screen.js';
import { createContentCardCover } from '../components/content-card-cover.js';
import { createProgressBar } from '../components/progress-bar.js';
import { createSeasonTabs } from '../components/season-tabs.js';
import { createTabsBlock } from '../components/tabs-block.js';
import { createPoster } from '../components/poster.js';
import { createFriendRate } from '../components/friend-rate.js';
import { createPersonCard } from '../components/person-card.js';
import { createContentDetailScreen } from '../components/content-detail-screen.js';
import { createVideoPlayer } from '../components/video-player.js';
import { createButton } from '../components/button.js';
import { titles } from '../prototype-data.js';
await document.fonts.ready;
await Promise.all([400,500,700].map(w=>document.fonts.load(`${w} 16px "IVI Sans AI SVG"`)));
const results=document.querySelector('#results'),fixtures=document.querySelector('#fixtures'),stage=document.querySelector('#test-stage');
const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
const assert=(condition,message)=>{if(!condition)throw Error(message);};
async function test(name,fn){const row=document.createElement('li');results.append(row);try{await fn();row.textContent='✓ '+name;row.className='pass';}catch(error){row.textContent='✗ '+name+': '+error.message;row.className='fail';}}
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
