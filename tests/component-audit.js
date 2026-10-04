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
const failed=results.querySelectorAll('.fail').length;document.title=failed?`${failed} ошибок`:`Проверки пройдены (${results.children.length})`;document.body.dataset.testResult=failed?'fail':'pass';
