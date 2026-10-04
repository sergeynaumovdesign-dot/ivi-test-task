import { extraComponents, extraState, resetExtra, referenceLayouts } from './extra-components.js';
import {createButton,buttonDefaults} from './components/button.js';
import {createSeasonTabs} from './components/season-tabs.js';
import {createTitleDescription,descriptionDefaults} from './components/title-description.js';
import {createFeedbackSummary,feedbackSummaryDefaults} from './components/feedback-summary.js';
import {createMomentCard,momentCardDefaults} from './components/moment-card.js';
import {createTabsBlock,tabsBlockDefaults} from './components/tabs-block.js';
import {createContentCardCover,contentCoverDefaults} from './components/content-card-cover.js';
import {createFriendRate,friendRateDefaults} from './components/friend-rate.js';
import {createButtonsBlock,buttonsBlockDefaults} from './components/buttons-block.js';
import {createTitleRating,createRatingBlock,ratingDefaults} from './components/rating-block.js';
import {createFeedbackBlock,feedbackBlockDefaults} from './components/feedback-block.js';
import {createVideoCard,videoCardDefaults} from './components/video-card.js';
import {createTextBlock,createReveal,textBlockDefaults,textBlockStyles} from './components/text-block.js';
import {createProgressBar,progressBarDefaults} from './components/progress-bar.js';
import {createPersonCard,personCardDefaults} from './components/person-card.js';
import {createSeries,createSeriesPreview,seriesDefaults} from './components/series.js';
import {createMomentScreen,createMomentBottomSide,momentScreenDefaults} from './components/moment-screen.js';
import {createContentDetailScreen,createMomentHintScreen,contentDetailScreenDefaults} from './components/content-detail-screen.js';
import {node} from './components/core.js';
await Promise.all([document.fonts.load('500 14px "IVI Sans AI SVG"'),document.fonts.load('400 14px "IVI Sans AI SVG"'),document.fonts.load('400 16px "IVI Sans AI SVG"'),document.fonts.load('700 14px "IVI Sans AI SVG"')]);
const sourceFiles=[...new Set(Object.values(extraComponents).map(item=>`components/${item.file}.js`)),'components/button.js','components/season-tabs.js','components/title-description.js','components/feedback-summary.js','components/moment-card.js','components/tabs-block.js','components/content-card-cover.js','components/friend-rate.js','components/buttons-block.js','components/rating-block.js','components/feedback-block.js','components/video-card.js','components/text-block.js','components/progress-bar.js','components/person-card.js','components/series.js','components/moment-screen.js','components/content-detail-screen.js','components/components.css','components/core.js','tokens.css'];
const sources=Object.fromEntries(await Promise.all(sourceFiles.map(async file=>[file,await fetch(file).then(r=>r.text())])));
let codeView='usage',currentCode='',copyTimer;
const $=s=>document.querySelector(s),types=['Primary','Secondary','Tertiary','Transparent'];
const routes=['button','seasons','description','feedback','moment','tabs','cover','friend','buttons','rating','review','video','textblock','progress','person','series','moment-screen',...Object.keys(extraComponents)];
let route=routes.includes(location.hash.slice(1))?location.hash.slice(1):'button',view='preview';
let button={...buttonDefaults},season={count:3,active:1,pressed:0,showHitAreas:false},description={...descriptionDefaults},feedback={...feedbackSummaryDefaults,mode:'Ready'},moment={...momentCardDefaults},tabs={...tabsBlockDefaults,tabs:[...tabsBlockDefaults.tabs]},cover={...contentCoverDefaults},friend={...friendRateDefaults},buttons={...buttonsBlockDefaults},rating={...ratingDefaults},review={...feedbackBlockDefaults},video={...videoCardDefaults},textBlock={...textBlockDefaults},progress={...progressBarDefaults},person={...personCardDefaults},series={...seriesDefaults},momentScreen={...momentScreenDefaults},contentScreen={...contentDetailScreenDefaults,blocks:{...contentDetailScreenDefaults.blocks}},screenScenario='Content',width=375;
let streamTimer=null,videoObjectUrl=null,coverAssetUrls={},libraryAssetUrls={},openedMomentCard=null,openedCover=null;
const labels={button:'Button',seasons:'Season Tab Block',description:'Title Description',feedback:'Feedback Summary Block',moment:'Moment Card',tabs:'Tab + Tabs Block',cover:'Content Card Cover',friend:'Friend Rate',buttons:'Buttons Block',rating:'Title Rating + Rating Block',review:'Feedback Block',video:'Video Card',textblock:'Text Block + Reveal',progress:'Progress Bar',person:'Person Card',series:'Series + SeriesPreview','moment-screen':'Moment Screen + MomentBottomSide','content-screen':'Content Screen + Scenarios'};
Object.assign(labels,Object.fromEntries(Object.entries(extraComponents).map(([key,item])=>[key,item.label])));
for(const [key,item] of Object.entries(extraComponents)){const button=node('button');button.dataset.route=key;button.textContent=item.label;$('.sidebar nav').append(button);}
function log(message){const target=$('#event-log');target.querySelector('.empty-event')?.remove();const row=node('div','event');row.append(node('time','',new Date().toLocaleTimeString('ru-RU')),node('span','',message));target.prepend(row);while(target.children.length>12)target.lastChild.remove();}
function rule(title,text){const r=node('div','rule');r.append(node('strong','',title));const p=node('p');p.innerHTML=text;r.append(p);return r;}
function control(label,type,key,values,value,change,note){const box=node('div','control'),title=node('label','control-label',label),input=node(type==='select'?'select':type==='textarea'?'textarea':'input');input.id=`control-${key}`;title.htmlFor=input.id;input.setAttribute('aria-label',label);if(type==='select')for(const val of values){const option=node('option','',val);option.value=val;input.append(option);}else if(type!=='textarea')input.type=type;
 if(type==='checkbox'){input.checked=value;title.className='check-control';title.append(input);box.append(title);}else{if(type!=='file')input.value=value;box.append(title,input);}if(type==='number'){input.min=1;input.max=100;}if(type==='file')input.accept='video/*';input.addEventListener(['text','range','textarea','number'].includes(type)?'input':'change',()=>change(type==='checkbox'?input.checked:type==='number'?Number(input.value):type==='file'?input.files?.[0]:input.value));if(note)box.append(node('p','control-note',note));$('#controls').append(box);return input;}
function coverFile(label,key,field,accept){const input=control(label,'file',key,null,null,file=>{if(!file)return;if(coverAssetUrls[field])URL.revokeObjectURL(coverAssetUrls[field]);coverAssetUrls[field]=URL.createObjectURL(file);cover[field]=coverAssetUrls[field];if(field==='videoSrc')cover.trailerImage='';renderPreview();});input.accept=accept;return input;}
function libraryFile(label,key,object,field,accept){const input=control(label,'file',key,null,null,file=>{if(!file)return;if(libraryAssetUrls[key])URL.revokeObjectURL(libraryAssetUrls[key]);libraryAssetUrls[key]=URL.createObjectURL(file);object[field]=libraryAssetUrls[key];renderPreview();});input.accept=accept;return input;}
function controls(){const target=$('#controls');target.replaceChildren();
 if(route==='content-screen'){
  control('Сценарий','select','screen-scenario',['Content','Moment hint 1','Moment hint 2','Moment hint 3','Moment'],screenScenario,v=>{screenScenario=v;controls();renderPreview();});
  if(screenScenario==='Content'){
   control('Вариант тайтла','select','screen-variant',['Serial','Movie'],contentScreen.variant,v=>{contentScreen.variant=v;renderPreview();});
   const blockLabels={cover:'Обложка тайтла',tabs:'Вкладки',moments:'Моменты',friends:'Друзья смотрят',rating:'Рейтинг',feedbackSummary:'Саммари отзывов',feedback:'Отзывы',people:'Актёры и создатели',videos:'Видео',compilations:'Подборки',recommendations:'Рекомендации',details:'Подробнее'};
   for(const [key,label] of Object.entries(blockLabels)) control(label,'checkbox',`screen-block-${key}`,null,contentScreen.blocks[key],value=>{contentScreen.blocks[key]=value;renderPreview();});
  }
 }else if(extraComponents[route]){
  const item=extraComponents[route],state=extraState[route];
  for(const f of item.fields){
   if(route==='tag'&&((state.rounded&&['text','icon'].includes(f.key))||(!state.rounded&&f.key==='score')))continue;
   if(route==='content-header'&&((state.mediaType==='Trailer'&&f.key==='posterImage')||(state.mediaType==='Poster'&&f.key==='videoSrc')))continue;
   if(['file','video'].includes(f.type)){libraryFile(f.label,`${route}-${f.key}`,state,f.key,f.type==='video'?'video/*':'image/*');continue;}
   const input=control(f.label,f.type,`${route}-${f.key}`,f.options,state[f.key],value=>{state[f.key]=value;if(route==='title-info'&&f.key==='title')state.titleLogo='';if(route==='title-info'&&f.key==='type')state.length=value==='Movie'?'1 ч 14 мин':'3 сезона';if(['select','checkbox'].includes(f.type))controls();renderPreview();});
   if(f.type==='number'){input.min=0;input.removeAttribute('max');if(['rating','score'].includes(f.key)){input.max=10;input.step=f.key==='score'?1:.1;}}
  }
 }else if(route==='button'){
  control('Вариант','select','type',types,button.type,v=>{button.type=v;controls();renderPreview();});
  control('Размер','select','size',['Big','Small'],button.size,v=>{button.size=v;if(v==='Small')button.content='Text';controls();renderPreview();});
  if(button.size==='Big')control('Содержимое','select','content',['Text','Icon'],button.content,v=>{button.content=v;controls();renderPreview();});
  if(button.content==='Icon')control('Иконка','select','icon',['bookmark','download','star','share-arrow'],button.icon,v=>{button.icon=v;renderPreview();});
  control('Состояние','select','state',['Default','Pressed','Disabled'],button.state,v=>{button.state=v;renderPreview();});
  if(button.content==='Text')control('Текст кнопки','text','label',null,button.label,v=>{button.label=v;renderPreview();});
  if(button.size==='Big'&&button.content==='Text'){control('Подпись','checkbox','caption',null,button.caption,v=>{button.caption=v;controls();renderPreview();});if(button.caption)control('Текст подписи','text','captionText',null,button.captionText,v=>{button.captionText=v;renderPreview();});}
  if(button.content==='Icon'&&button.type==='Transparent'){control('Текст под иконкой','checkbox','textUnderIcon',null,button.textUnderIcon,v=>{button.textUnderIcon=v;controls();renderPreview();});if(button.textUnderIcon)control('Значение','text','iconText',null,button.iconText,v=>{button.iconText=v;renderPreview();});}
 }else if(route==='seasons'){
  control('Количество сезонов','number','count',null,season.count,v=>{season.count=Math.max(1,Math.min(100,Math.floor(v)||1));season.active=Math.min(season.active,season.count);controls();renderPreview();});
  control('Активный сезон','select','active',Array.from({length:season.count},(_,i)=>i+1),season.active,v=>{season.active=Number(v);renderPreview();});
  control('Зафиксировать Pressed','select','pressed',['Нет',...Array.from({length:season.count},(_,i)=>i+1)],season.pressed||'Нет',v=>{season.pressed=v==='Нет'?0:Number(v);renderPreview();});
  control('Показать области нажатия','checkbox','hitAreas',null,season.showHitAreas,v=>{season.showHitAreas=v;renderPreview();},'Видимая вкладка — 32 × 36 pt, область нажатия — не меньше 44 pt.');
 }else if(route==='description'){
  control('Вариант','select','description-type',['Default','AI'],description.type,v=>{description.type=v;controls();renderPreview();});
  if(description.type==='AI'){
   control('Есть причина для персонализации','checkbox','description-eligible',null,description.canPersonalize,v=>{description.canPersonalize=v;renderPreview();},'Если данных недостаточно, показывается обычное описание.');
   control('Основа описания','textarea','description-prefix',null,description.prefix,v=>{description.prefix=v;renderPreview();});
   control('Персональная часть','textarea','description-personalized',null,description.personalized,v=>{description.personalized=v;renderPreview();});
  }
  control('Обычное описание','textarea','description-text',null,description.text,v=>{description.text=v;renderPreview();},'Используется для Default и как запасной вариант для AI.');
 }else if(route==='feedback'){
  control('Вид саммари','select','feedback-personalized',['Персонализированное','Обычное'],feedback.personalized?'Персонализированное':'Обычное',v=>{feedback.personalized=v==='Персонализированное';controls();renderPreview();});
  control('Показ','select','feedback-mode',['Ready','Loading'],feedback.mode,v=>{feedback.mode=v;renderPreview();},'Loading имитирует поступление текста частями; готовое саммари появляется сразу.');
  if(feedback.personalized)control('Персонализированный текст','textarea','feedback-personalized-text',null,feedback.personalizedText,v=>{feedback.personalizedText=v;renderPreview();});
  else control('Обычный текст','textarea','feedback-general-text',null,feedback.generalText,v=>{feedback.generalText=v;renderPreview();});
 }else if(route==='moment'){
  control('Название момента','textarea','moment-title',null,moment.title,v=>{moment.title=v;renderPreview();});
  control('Превью','select','moment-preview',['Photo','Video'],moment.preview,v=>{moment.preview=v;controls();renderPreview();});
  if(moment.preview==='Video')control('Видео с устройства','file','moment-file',null,null,file=>{if(videoObjectUrl)URL.revokeObjectURL(videoObjectUrl);videoObjectUrl=file?URL.createObjectURL(file):null;moment.videoSrc=videoObjectUrl||'';renderPreview();},'Видео без звука повторяется, только пока карточка полностью видна. Без файла остаётся фото.');
  control('Состояние','select','moment-state',['Default','Pressed'],moment.state,v=>{moment.state=v;renderPreview();});
 }else if(route==='tabs'){
  const editor=node('div','control tab-editor');editor.append(node('label','control-label','Вкладки'));
  const list=node('div','tab-editor__list');editor.append(list);
  const activeBox=node('div','control');const activeLabel=node('label','control-label','Активная вкладка');const activeSelect=node('select');activeSelect.id='control-tabs-active';activeLabel.htmlFor=activeSelect.id;activeBox.append(activeLabel,activeSelect);
  const updateOptions=()=>{activeSelect.replaceChildren();tabs.tabs.forEach((label,i)=>{const option=node('option','',label.trim()||`Таб ${i+1}`);option.value=String(i);activeSelect.append(option);});activeSelect.value=String(tabs.active);};
  tabs.tabs.forEach((label,i)=>{const row=node('div','tab-editor__row');const input=node('input');input.type='text';input.value=label;input.placeholder=`Таб ${i+1}`;input.setAttribute('aria-label',`Название вкладки ${i+1}`);input.dataset.index=String(i);input.addEventListener('input',()=>{tabs.tabs[i]=input.value;updateOptions();renderPreview();});const remove=node('button','tab-editor__remove','×');remove.type='button';remove.disabled=tabs.tabs.length===1;remove.setAttribute('aria-label',`Удалить вкладку ${i+1}`);remove.addEventListener('click',()=>{tabs.tabs.splice(i,1);tabs.active=Math.max(0,Math.min(tabs.active,tabs.tabs.length-1));controls();renderPreview();});row.append(input,remove);list.append(row);});
  const add=node('button','tab-editor__add','+ Добавить вкладку');add.type='button';add.addEventListener('click',()=>{tabs.tabs.push(`Таб ${tabs.tabs.length+1}`);controls();renderPreview();document.querySelector(`.tab-editor__row input[data-index="${tabs.tabs.length-1}"]`)?.focus();});editor.append(add);target.append(editor);updateOptions();activeSelect.addEventListener('change',()=>{tabs.active=Number(activeSelect.value);renderPreview();});target.append(activeBox);
 }else if(route==='cover'){
  control('Тайтл','select','cover-kind',['Serial','Movie'],cover.type,v=>{cover.type=v;cover.years=v==='Movie'?'2013':'2013 – 2016';cover.length=v==='Movie'?'1 ч 54 мин':'3 сезона';cover.primaryCaption=v==='Movie'?'':'Сезон 1 серия 1';controls();renderPreview();});
  control('Обложка','select','cover-media',['Trailer','Poster'],cover.mediaType,v=>{cover.mediaType=v;controls();renderPreview();});
  if(cover.mediaType==='Trailer')coverFile('Трейлер','cover-video','videoSrc','video/*');
  else coverFile('Постер','cover-poster-image','posterImage','image/*');
  control('Название','text','cover-title',null,cover.title,v=>{cover.title=v;cover.titleLogo='';renderPreview();},'При редактировании название показывается текстом. Можно загрузить свой постер с названием ниже.');
  coverFile('Постер с названием','cover-title-logo','titleLogo','image/*');
  control('Рейтинг Иви','text','cover-rating',null,cover.rating,v=>{cover.rating=v;renderPreview();});
  const count=control('Число оценок','number','cover-rating-count',null,cover.ratingCount,v=>{cover.ratingCount=Math.max(0,Math.floor(v)||0);renderPreview();});count.min=0;count.removeAttribute('max');
  control('Год / годы','text','cover-years',null,cover.years,v=>{cover.years=v;renderPreview();});
  control(cover.type==='Movie'?'Длительность':'Сезоны','text','cover-length',null,cover.length,v=>{cover.length=v;renderPreview();});
  control('Страна','text','cover-country',null,cover.country,v=>{cover.country=v;renderPreview();});
  control('Возраст','text','cover-age',null,cover.age,v=>{cover.age=v;renderPreview();});
  control('Жанры · через запятую','text','cover-genres',null,cover.genres.join(', '),v=>{cover.genres=v.split(',').map(x=>x.trim()).filter(Boolean);renderPreview();});
  control('Друг рекомендует','checkbox','cover-friend',null,Boolean(cover.friendName),v=>{cover.friendName=v?'Саня':'';controls();renderPreview();});
  if(cover.friendName){control('Имя друга','text','cover-friend-name',null,cover.friendName,v=>{cover.friendName=v;renderPreview();});const score=control('Оценка друга · 1–10','number','cover-friend-score',null,cover.friendScore,v=>{cover.friendScore=Math.max(1,Math.min(10,Math.round(v)||1));renderPreview();});score.max=10;coverFile('Аватар друга','cover-friend-avatar','friendAvatar','image/*');}
  control('Описание','select','cover-description-type',['AI','Default'],cover.descriptionType,v=>{cover.descriptionType=v;controls();renderPreview();});
  if(cover.descriptionType==='AI'){
   control('Основа описания','textarea','cover-description-prefix',null,cover.descriptionPrefix,v=>{cover.descriptionPrefix=v;renderPreview();});
   control('Персональная часть','textarea','cover-description-personalized',null,cover.descriptionPersonalized,v=>{cover.descriptionPersonalized=v;renderPreview();});
  }else control('Обычное описание','textarea','cover-description',null,cover.description,v=>{cover.description=v;renderPreview();});
  control('Текст главной кнопки','text','cover-primary-label',null,cover.primaryLabel,v=>{cover.primaryLabel=v;renderPreview();});
  control('Подпись кнопки','text','cover-primary-caption',null,cover.primaryCaption,v=>{cover.primaryCaption=v;renderPreview();});
  control('В избранном','checkbox','cover-saved',null,cover.saved,v=>{cover.saved=v;renderPreview();});
 }else if(route==='friend'){
  control('Имя друга','text','friend-name',null,friend.name,v=>{friend.name=v;renderPreview();});
  const score=control('Оценка · 1–10','number','friend-score',null,friend.score,v=>{friend.score=Math.max(1,Math.min(10,Math.round(v)||1));renderPreview();});score.max=10;
  libraryFile('Аватар','friend-avatar',friend,'avatar','image/*');
 }else if(route==='buttons'){
  control('Текст главной кнопки','text','buttons-label',null,buttons.label,v=>{buttons.label=v;renderPreview();});
  control('Подпись','text','buttons-caption',null,buttons.caption,v=>{buttons.caption=v;renderPreview();});
  control('Показать дополнительные кнопки','checkbox','buttons-secondary',null,buttons.showSecondary,v=>{buttons.showSecondary=v;renderPreview();});
  control('В избранном','checkbox','buttons-saved',null,buttons.saved,v=>{buttons.saved=v;renderPreview();});
  control('Оценено','checkbox','buttons-rated',null,buttons.rated,v=>{buttons.rated=v;renderPreview();});
 }else if(route==='rating'){
  const value=control('Рейтинг Иви','number','rating-value',null,rating.rating,v=>{rating.rating=v;renderPreview();});value.step=.1;value.max=10;
  const count=control('Количество оценок','number','rating-count',null,rating.count,v=>{rating.count=Math.max(0,Math.floor(v)||0);renderPreview();});count.min=0;count.removeAttribute('max');
  control('Короткая характеристика','text','rating-description',null,rating.description,v=>{rating.description=v;renderPreview();});
  control('Моя оценка','select','rating-own',['Нет',...Array.from({length:10},(_,i)=>String(i+1))],rating.ownRating||'Нет',v=>{rating.ownRating=v==='Нет'?null:Number(v);renderPreview();});
 }else if(route==='review'){
  control('Автор','text','review-author',null,review.author,v=>{review.author=v;renderPreview();});
  control('Текст отзыва','textarea','review-text',null,review.text,v=>{review.text=v;renderPreview();});
  control('Дата','text','review-date',null,review.date,v=>{review.date=v;renderPreview();});
  control('Лайки','number','review-likes',null,review.likes,v=>{review.likes=Math.max(0,Math.floor(v)||0);renderPreview();});
  control('Моя реакция','select','review-reaction',['Нет','Нравится','Не нравится'],review.reaction==='like'?'Нравится':review.reaction==='dislike'?'Не нравится':'Нет',v=>{review.reaction=v==='Нравится'?'like':v==='Не нравится'?'dislike':null;renderPreview();});
  control('Имитировать ошибку сохранения','checkbox','review-fail',null,Boolean(review.failSave),v=>{review.failSave=v;renderPreview();});
 }else if(route==='video'){
  control('Название','textarea','video-title',null,video.title,v=>{video.title=v;renderPreview();});
  control('Длительность','text','video-duration',null,video.duration,v=>{video.duration=v;renderPreview();});
  libraryFile('Изображение','video-image',video,'imageSrc','image/*');
  libraryFile('Видео для просмотра','video-file',video,'videoSrc','video/*');
 }else if(route==='textblock'){
  control('Текст','textarea','textblock-text',null,textBlock.text,v=>{textBlock.text=v;renderPreview();});
  control('Текстовый стиль','select','textblock-style',Object.keys(textBlockStyles),textBlock.textStyle,v=>{textBlock.textStyle=v;renderPreview();});
 }else if(route==='progress'){
  control('Позиция · %','range','progress-value',null,Math.round(progress.progress*100),v=>{progress.progress=Number(v)/100;renderPreview();});
  control('Длительность · сек','number','progress-duration',null,progress.duration,v=>{progress.duration=Math.max(1,Math.floor(v)||1);renderPreview();});
  control('Можно перематывать','checkbox','progress-seekable',null,progress.seekable,v=>{progress.seekable=v;renderPreview();});
 }else if(route==='person'){
  control('Вариант','select','person-variant',['Actor/Creator','Friend'],person.variant,v=>{person.variant=v;if(v==='Friend'&&person.subtitle===personCardDefaults.subtitle)person.subtitle='';else if(v==='Actor/Creator'&&!person.subtitle)person.subtitle=personCardDefaults.subtitle;controls();renderPreview();});
  control('Имя','text','person-name',null,person.name,v=>{person.name=v;renderPreview();});
  control('Подпись','text','person-subtitle',null,person.subtitle,v=>{person.subtitle=v;renderPreview();});
  if(person.variant==='Friend'){const score=control('Оценка · 1–10','number','person-score',null,person.score,v=>{person.score=v;renderPreview();});score.max=10;}
  libraryFile('Фото','person-image',person,'imageSrc','image/*');
 }else if(route==='series'){
  control('Состояние серии','select','series-state',['Default','Started','Viewed','Unreleased','Unavailable'],series.state,v=>{series.state=v;controls();renderPreview();});
  control('Название серии','text','series-title',null,series.title,v=>{series.title=v;renderPreview();});
  control('Длительность · сек','number','series-duration-seconds',null,series.durationSeconds,v=>{series.durationSeconds=Math.max(1,v);series.duration=`${Math.round(series.durationSeconds/60)} мин`;renderPreview();}).removeAttribute('max');
  if(series.state==='Started')control('Просмотрено · %','range','series-progress',null,Math.round(series.progress*100),v=>{series.progress=Number(v)/100;renderPreview();});
  if(series.state==='Unreleased')control('Дата выхода','text','series-release',null,series.releaseDate,v=>{series.releaseDate=v;renderPreview();});
  control('Описание','checkbox','series-show-description',null,series.showDescription,v=>{series.showDescription=v;controls();renderPreview();});
  if(series.showDescription)control('Текст описания','textarea','series-description',null,series.description,v=>{series.description=v;renderPreview();});
  control('Недоступна по подписке','checkbox','series-locked',null,series.locked,v=>{series.locked=v;renderPreview();});
  libraryFile('Обложка серии','series-image',series,'imageSrc','image/*');
  libraryFile('Запасная обложка тайтла','series-cover',series,'titleCoverSrc','image/*');
 }else if(route==='moment-screen'){
  control('Состояние','select','moment-screen-state',['Default','Paused','Loading','Rewinding','Ended','Error'],momentScreen.state,v=>{momentScreen.state=v;renderPreview();});
  control('Название момента','text','moment-screen-title',null,momentScreen.title,v=>{momentScreen.title=v;renderPreview();});
  control('Название тайтла','text','moment-screen-content',null,momentScreen.contentTitle,v=>{momentScreen.contentTitle=v;renderPreview();});
  control('Серия','text','moment-screen-episode',null,momentScreen.episode,v=>{momentScreen.episode=v;renderPreview();});
  control('Лайки','number','moment-screen-likes',null,momentScreen.likes,v=>{momentScreen.likes=Math.max(0,v);renderPreview();});
  control('Отмечено «Нравится»','checkbox','moment-screen-liked',null,momentScreen.liked,v=>{momentScreen.liked=v;renderPreview();});
  control('В избранном','checkbox','moment-screen-saved',null,momentScreen.saved,v=>{momentScreen.saved=v;renderPreview();});
  control('Без звука','checkbox','moment-screen-muted',null,momentScreen.muted,v=>{momentScreen.muted=v;$('.stage .ivi-moment-screen')?.setMuted(v);});
  control('Демо без видео','checkbox','moment-demo',null,momentScreen.demoPlayback,v=>{momentScreen.demoPlayback=v;renderPreview();},'Только для проверки: прогресс движется поверх неподвижного кадра.');
  libraryFile('Видео момента','moment-screen-video',momentScreen,'videoSrc','video/*');
  libraryFile('Постер тайтла','moment-screen-poster',momentScreen,'posterSrc','image/*');
 }
 if(route!=='moment'&&route!=='content-screen')control('Ширина экрана','select','width',[320,375,390,430],width,v=>{width=Number(v);renderPreview();});
}
function makeButton(opts={}){return createButton({...button,width:width-32,onPress:()=>log(`Button → нажатие · ${button.type} / ${button.size} / ${button.content}`),...opts});}
function makeCover(opts={}){let instance;instance=createContentCardCover({...cover,width,onOpenTrailer:openTrailer,onWatch:()=>log(`Content Card Cover → ${cover.primaryLabel.toLowerCase()}`),onSaveChange:saved=>{cover.saved=saved;$('#control-cover-saved').checked=saved;log(`Content Card Cover → ${saved?'добавлено в избранное':'убрано из избранного'}`);},onRate:()=>{instance.setRated(true);log('Content Card Cover → открыт выбор оценки');},onDownload:()=>log('Content Card Cover → открыт сценарий скачивания'),onShare:()=>log('Content Card Cover → открыто системное меню отправки'),onMuteChange:muted=>log(`Content Card Cover → звук ${muted?'выключен':'включён'}`),...opts});return instance;}
function makeButtons(opts={}){return createButtonsBlock({...buttons,width,onWatch:()=>log('Buttons Block → просмотр'),onSaveChange:saved=>{buttons.saved=saved;const input=$('#control-buttons-saved');if(input)input.checked=saved;log(`Buttons Block → ${saved?'добавлено':'убрано'} из избранного`);},onRate:()=>{buttons.rated=true;const input=$('#control-buttons-rated');if(input)input.checked=true;$('.stage .ivi-buttons-block')?.setRated(true);log('Buttons Block → оценить');},onDownload:()=>log('Buttons Block → скачать'),onShare:()=>log('Buttons Block → поделиться'),...opts});}
function makeRating(opts={}){return createRatingBlock({...rating,width:Math.min(width-32,343),onRate:()=>{$('#rating-dialog').showModal();log('Rating Block → открыт выбор оценки');},...opts});}
function makeReview(opts={}){return createFeedbackBlock({...review,width:Math.min(width-32,343),onOpen:data=>{const dialog=$('#review-dialog');$('#review-dialog-author').textContent=data.author||'Пользователь';$('#review-dialog-text').textContent=data.text;$('#review-dialog-date').textContent=data.date||'';dialog.showModal();log('Feedback Block → открыт полный отзыв');},onReact:(reaction,likes)=>{log(`Feedback Block → ${reaction||'реакция отменена'}`);if(review.failSave)return Promise.reject(new Error('Сохранение не удалось'));review.reaction=reaction;review.likes=likes;const selected=$('#control-review-reaction');if(selected)selected.value=reaction==='like'?'Нравится':reaction==='dislike'?'Не нравится':'Нет';const count=$('#control-review-likes');if(count)count.value=likes;},onError:()=>log('Feedback Block → не удалось сохранить реакцию'),...opts});}
function makeVideo(opts={}){return createVideoCard({...video,onOpen:openVideo,...opts});}
function makeTextBlock(opts={}){return createTextBlock({...textBlock,width,onExpand:()=>log('Text Block → текст раскрыт'),...opts});}
function makeProgress(opts={}){return createProgressBar({...progress,width:width-32,onSeekPreview:value=>{const input=$('#control-progress-value');if(input)input.value=String(Math.round(value*100));},onSeek:({progress:value,seconds})=>{progress.progress=value;log(`Progress Bar → ${Math.round(seconds)} с`);renderCode();},onSeekCancel:({progress:value})=>{const input=$('#control-progress-value');if(input)input.value=String(Math.round(value*100));log('Progress Bar → перемотка отменена');},...opts});}
function makePerson(opts={}){return createPersonCard({...person,onOpen:data=>log(`Person Card → открыть ${data.variant==='Friend'?'друга':'актёра'} ${data.name}`),...opts});}
function makeSeries(opts={}){return createSeries({...series,width,onWatch:data=>log(`Series → смотреть «${data.title}» с ${Math.round(data.startAt)} с`),onDownload:data=>log(`Series → скачать «${data.title}»`),onUnavailable:data=>log(`Series → «${data.title}» недоступна`),onExpand:()=>log('Series → описание раскрыто'),...opts});}
let momentSession=null,momentSessionIndex=0;
function makeMomentScreen(opts={}){
 const demo=[{...momentScreen},{...momentScreen,title:'Разговор с Ганнибалом',imageSrc:new URL('./assets/cover/trailer.png',import.meta.url).href,videoSrc:'',progress:0,likes:84},{...momentScreen,title:'Неожиданная находка',imageSrc:new URL('./assets/video/trailer-preview.png',import.meta.url).href,videoSrc:'',progress:0,likes:219}];
 if(!momentSession)momentSession=demo;
 const fieldKeys=['title','contentTitle','episode','videoSrc','posterSrc','likes','liked','saved'];
 const current=momentSession[momentSessionIndex];for(const key of fieldKeys)current[key]=momentScreen[key];
 let screen;
 const capture=()=>{momentSession=screen.getMoments();momentSessionIndex=screen.getMomentIndex();};
 const sync=data=>{Object.assign(momentScreen,data);for(const [id,key] of [['moment-screen-liked','liked'],['moment-screen-saved','saved']]){const input=$(`#control-${id}`);if(input)input.checked=momentScreen[key];}const count=$('#control-moment-screen-likes');if(count)count.value=momentScreen.likes;renderCode();};
 screen=createMomentScreen({...momentScreen,width,height:Math.round(812*width/375),moments:momentSession,momentIndex:momentSessionIndex,
 onStateChange:state=>log(`Moment Screen → ${state}`),
 onMomentChange:(i,data)=>{capture();sync(data);controls();log(`Moment Screen → момент ${i+1}: ${data.title}`);},
 onBackToTrailer:()=>log('Moment Screen → вернуться к трейлеру'),
 onLikeChange:(liked,data)=>{capture();sync({liked,likes:data.likes});log(`Moment Screen → ${liked?'нравится':'отмена лайка'}`);},
 onSaveChange:saved=>{capture();sync({saved});log(`Moment Screen → ${saved?'в избранном':'удалено из избранного'}`);},
 onShare:()=>log('Moment Screen → системное меню отправки'),onOpenTitle:()=>log('Moment Screen → карточка тайтла'),onContinue:data=>log(`Moment Screen → полная серия с ${data.seconds} с`),onRetry:()=>log('Moment Screen → повторная загрузка'),...opts});
 return screen;
}
function makeContentScreen(opts={}){
 const screen=createContentDetailScreen({...contentScreen,width:375,onBack:()=>log('Content Screen → назад'),onWatch:()=>log('Content Screen → просмотр'),onSaveChange:saved=>log(`Content Screen → ${saved?'добавлено':'убрано'} из избранного`),onRate:()=>{$('#rating-dialog').showModal();log('Content Screen → оценка');},onDownload:()=>log('Content Screen → скачать'),onShare:()=>log('Content Screen → поделиться'),onOpenTrailer:openTrailer,onOpenMoment:data=>openMoment(data),onOpenVideo:openVideo,onOpenSeries:data=>log(`Content Screen → смотреть ${data.title}`),onOpenPerson:data=>log(`Content Screen → открыть ${data.name}`),onOpenFriend:data=>log(`Content Screen → открыть друга ${data.name}`),onOpenRecommendation:data=>log(`Content Screen → рекомендация ${data.title}`),onOpenCompilation:data=>log(`Content Screen → подборка ${data.title}`),onOpenFeedback:data=>{if(data)log('Content Screen → полный отзыв');},onReactFeedback:reaction=>log(`Content Screen → реакция ${reaction||'отменена'}`),...opts});
 return screen;
}
function stage(cls='stage'){const s=node('div',cls);return s;}
function renderPreview(){renderCode();clearInterval(streamTimer);const target=$('#preview');target.querySelectorAll('[class]').forEach(card=>card.destroy?.());target.replaceChildren();const footer=$('#preview-footer');footer.replaceChildren();
 if(route==='content-screen'){
  const s=stage('stage content-screen-stage');
  const canvas=node('div','preview-canvas');
  canvas.style.width='375px';
  if(screenScenario==='Content') canvas.append(makeContentScreen());
  else if(screenScenario==='Moment') canvas.append(makeMomentScreen({width:375,height:812}));
  else canvas.append(createMomentHintScreen({state:screenScenario.replace('Moment hint ','')||'1',width:375,onBack:()=>log('Moment Hint → назад'),onContinue:()=>{screenScenario='Moment';controls();renderPreview();}}));
  s.append(canvas);target.append(s);
  footer.append(node('span','',screenScenario==='Content'?'Полная карточка · блоки настраиваются справа':'Сценарий просмотра момента'),node('strong','',screenScenario));
  return;
 }
 if(extraComponents[route]){
  const item=extraComponents[route],state=extraState[route],s=stage(view==='preview'?'stage':'states-stage');
  const make=(props={})=>item.factory({...state,...(route!=='poster'&&'width' in item.defaults?{width:item.defaults.width===343?width-32:width}:{}),...props,onOpen:()=>log(`${item.label} → открыть`),onBack:()=>log('Navigation Bar → назад'),onOpenTrailer:openTrailer});
  if(view==='compare'){
   const row=node('div','new-compare-row'),left=node('div','new-compare-item'),right=node('div','new-compare-item'),ref=node('img');
   ref.src=`reference/new-${item.id.replace(':','-')}.png`;ref.alt='Оригинал из Figma';
   left.append(node('label','','FIGMA · Оригинал'),ref);right.append(node('label','','КОД · Тот же вариант'));
   const layout=referenceLayouts[route];
   if(layout){const canvas=node('div','new-reference-canvas');Object.assign(canvas.style,{width:`${layout.width}px`,height:`${layout.height}px`});for(const {x,y,...props} of layout.items){const live=item.factory({...item.defaults,...props});Object.assign(live.style,{position:'absolute',left:`${x}px`,top:`${y}px`});canvas.append(live);}right.append(canvas);}
   else right.append(item.factory({...item.defaults}));
   row.append(left,right);s.append(row);target.append(s);footer.append(node('span','','Сравнение исходных параметров Figma и кода'));return;
  }
  if(view==='preview')s.append(make());else for(const [i,props] of item.variants.entries()){const group=node('div','extra-example');group.append(node('label','',props.name||props.state||`Вариант ${i+1}`),make(props));s.append(group);}
  target.append(s);footer.append(node('span','',item.label));return;
 }
 if(view==='compare'){renderComparison(target);footer.append(node('span','','Экспорт Figma @2× и код при масштабе 1×'),node('strong','','Эталонные параметры'));return;}
 if(view==='states'){
  const s=stage('states-stage');
  if(route==='button'){for(const state of ['Default','Pressed','Disabled']){const row=node('div','state-row');row.append(node('label','',state),makeButton({state,width:Math.min(width-32,343)}));s.append(row);}}
  else if(route==='seasons'){for(const state of ['Active','Inactive','Pressed']){const row=node('div','state-row');row.append(node('label','',state));const tabs=createSeasonTabs({count:state==='Inactive'?2:1,active:state==='Inactive'?2:1,pressed:state==='Pressed'?1:null});tabs.style.width='120px';if(state==='Inactive')tabs.querySelectorAll('.ivi-season')[1].style.visibility='hidden';row.append(tabs);s.append(row);}}
  else if(route==='description'){for(const [label,props] of [['Default',{type:'Default'}],['AI',{type:'AI',canPersonalize:true}],['Без причины',{type:'AI',canPersonalize:false}],['Длинный текст',{type:'Default',text:'Аналитик ФБР с уникальным даром ищет неуловимого маньяка, который оказывается ближе, чем кажется. Чтобы разобраться в сложном деле, он обращается за помощью к психиатру Ганнибалу Лектеру. Их разговоры постепенно выходят за рамки расследования, а доверие к собеседнику становится всё труднее отличить от опасной зависимости.'}]]){const group=node('div','description-state');group.append(node('label','',label),createTitleDescription({...description,...props,width:Math.min(width,375)}));s.append(group);}}
  else if(route==='feedback'){for(const [label,props] of [['Готовое',{stream:false}],['Раскрытое',{stream:false}],['Загрузка',{stream:true}]]){const group=node('div','description-state');const block=createFeedbackSummary({...feedback,...props,width:Math.min(width,343)});group.append(node('label','',label),block);s.append(group);if(label==='Раскрытое')queueMicrotask(()=>block.expand());if(label==='Загрузка')queueMicrotask(()=>block.appendText((feedback.personalized?feedback.personalizedText:feedback.generalText).slice(0,54)));}}
  else if(route==='moment'){for(const [label,props] of [['Default',{state:'Default'}],['Pressed',{state:'Pressed'}],['Длинное название',{title:'Что замечает Уилл на месте преступления, когда все остальные уже уверены, что нашли ответ'}],['Видео без файла',{preview:'Video',videoSrc:''}]]){const group=node('div','moment-state');group.append(node('label','',label),createMomentCard({...moment,...props,onOpen:openMoment}));s.append(group);}}
  else if(route==='tabs'){for(const [label,props] of [['Active / Inactive',{tabs:['О сериале','Сезоны'],active:0}],['Длинное название',{tabs:['О сериале очень длинное название','Сезоны'],active:0}],['Горизонтальный скролл',{tabs:['О сериале','Сезоны','Актёры','Отзывы','Похожие','Ещё'],active:4}]]){const group=node('div','description-state');group.append(node('label','',label),createTabsBlock({...props,width:Math.min(width,375)}));s.append(group);}}
  else if(route==='cover'){for(const [label,props] of [['Трейлер и друг',{}],['Постер без друга',{mediaType:'Poster',friendName:''}],['Длинный текст',{mediaType:'Poster',friendName:'',descriptionType:'Default',description:cover.description+' '.repeat(1)+cover.description}]]){const group=node('div','cover-state');group.append(node('label','',label),makeCover({...props,width:375,videoSrc:''}));s.append(group);}}
  else if(route==='friend'){for(const [label,score] of [['Рекомендует',10],['Поставил оценку',6],['Поставил оценку',3]]){const group=node('div','description-state');group.append(node('label','',label),createFriendRate({...friend,score}));s.append(group);}}
  else if(route==='buttons'){for(const [label,props] of [['Обычно',{}],['В избранном',{saved:true}],['Без дополнительных',{showSecondary:false}]]){const group=node('div','description-state');group.append(node('label','',label),makeButtons({...props,width:Math.min(width,375)}));s.append(group);}}
  else if(route==='rating'){for(const [label,props] of [['Есть оценки',{}],['Нет оценок',{rating:0,count:0}],['Оценено мной',{ownRating:9}]]){const group=node('div','description-state');group.append(node('label','',label),createRatingBlock({...rating,...props,width:343}));s.append(group);}}
  else if(route==='review'){for(const [label,props] of [['Обычно',{}],['Лайк',{reaction:'like'}],['Длинный отзыв',{text:review.text.repeat(3)}]]){const group=node('div','description-state');group.append(node('label','',label),makeReview({...props,width:343}));s.append(group);}}
  else if(route==='video'){for(const [label,props] of [['Обычно',{}],['Длинное название',{title:'Трейлер фильма с очень длинным названием, которое не помещается в две строки'}]]){const group=node('div','description-state');group.append(node('label','',label),makeVideo(props));s.append(group);}}
  else if(route==='textblock'){for(const [label,props] of [['До трёх строк',{text:'Короткий текст о фильме.'}],['С «ещё»',{}],['Длинное слово',{text:'Оченьдлинноеназваниебезпробелов'.repeat(12)}]]){const group=node('div','description-state');group.append(node('label','',label),makeTextBlock({...props,width:375}));s.append(group);}}
  else if(route==='progress'){for(const [label,props] of [['Начало',{progress:0}],['В процессе',{progress:.5}],['Конец',{progress:1}],['Без перемотки',{progress:.5,seekable:false}]]){const group=node('div','description-state');group.append(node('label','',label),makeProgress({...props,width:width-32}));s.append(group);}}
  else if(route==='person'){for(const [label,props] of [['Актёр / создатель',{}],['Друг с оценкой',{variant:'Friend',name:'Саня',subtitle:''}],['Длинное имя',{name:'Александр Александрович Миккельсен',subtitle:'Роль с длинным названием'}],['Без фото',{imageSrc:''}]]){const group=node('div','description-state');group.append(node('label','',label),makePerson(props));s.append(group);}}
  else if(route==='series'){for(const [label,props] of [['Не начата',{state:'Default'}],['Начата',{state:'Started'}],['Просмотрена',{state:'Viewed'}],['Не вышла',{state:'Unreleased'}],['Без обложки',{imageSrc:'',titleCoverSrc:''}],['Длинное название',{title:'Очень длинное название серии, которое не помещается в две строки и должно обрезаться'}]]){const group=node('div','description-state');group.append(node('label','',label),makeSeries({...props,width:375}));s.append(group);}}
  else if(route==='moment-screen'){for(const state of ['Default','Paused','Loading','Rewinding','Ended','Error']){const group=node('div','description-state');group.append(node('label','',state),makeMomentScreen({state,autoplay:false,width:375,height:812}));s.append(group);}}
  target.append(s);footer.append(node('span','','Состояния текущего варианта рядом'),node('strong','','Без анимации'));return;
 }
 const s=stage(route==='seasons'?'stage season-stage':route==='tabs'?'stage tabs-stage':route==='cover'?'stage cover-stage':'stage'),canvas=node('div','preview-canvas');canvas.style.width=`${width}px`;
 if(route==='button'){const b=makeButton();canvas.append(b,node('div','measurement',`${button.size==='Big'?(button.content==='Icon'?48:width-32):'Hug'} × ${button.size==='Big'?48:28} pt`));s.append(canvas);footer.append(node('span','',`${button.type} / ${button.size} / ${button.content}`),node('strong','',button.state));}
 else if(route==='seasons'){
  const tabs=createSeasonTabs({...season,onChange:i=>{season.active=i;$('#control-active').value=i;renderCode();log(`Season Tab → выбран сезон ${i}`);},onReselect:i=>log(`Season Tab → повторно нажат сезон ${i}`)});canvas.append(tabs);s.append(canvas);
  footer.append(node('span','','Нажатие · выбор · горизонтальный скролл'),node('strong','',`${season.count} сезона / сезонов`));
 }else if(route==='description'){canvas.append(createTitleDescription({...description,width}));s.append(canvas);footer.append(node('span','',`${description.type} · 16/22 pt`),node('strong','',description.type==='AI'&&description.canPersonalize&&description.personalized.trim()?'AI':'Default'));}
 else if(route==='feedback'){const block=createFeedbackSummary({...feedback,width:Math.min(width-32,343),stream:feedback.mode==='Loading',onExpand:()=>log('Feedback Summary → текст раскрыт')});canvas.append(block);s.append(canvas);if(feedback.mode==='Loading')startFeedbackStream(block);footer.append(node('span','','3 строки · раскрытие внутри карточки'),node('strong','',feedback.mode));}
 else if(route==='moment'){canvas.append(createMomentCard({...moment,onOpen:openMoment}));s.append(canvas);footer.append(node('span','','200 × 300 pt · название до 3 строк'),node('strong','',moment.preview));}
 else if(route==='tabs'){const block=createTabsBlock({...tabs,width,onChange:(i,label)=>{tabs.active=i;$('#control-tabs-active').value=String(i);renderCode();log(`Tabs Block → выбран раздел «${label}»`);},onReselect:(i,label)=>log(`Tabs Block → повторно нажат раздел «${label}»`)});canvas.append(block);s.append(canvas);footer.append(node('span','','32 pt · область нажатия 44 pt'),node('strong','',`${tabs.tabs.length} вкладок`));}
 else if(route==='cover'){canvas.append(makeCover());s.append(canvas);footer.append(node('span','','Трейлер / постер · данные · описание · действия'),node('strong','',cover.type));}
 else if(route==='friend'){canvas.append(createFriendRate({...friend,width:null}));s.append(canvas);footer.append(node('span','','Оценка друга · 1–10'),node('strong','',`Оценка ${friend.score}`));}
 else if(route==='buttons'){canvas.append(makeButtons());s.append(canvas);footer.append(node('span','','Главная кнопка и четыре действия'),node('strong','',buttons.showSecondary?'5 кнопок':'1 кнопка'));}
 else if(route==='rating'){canvas.append(createTitleRating(rating),makeRating());s.append(canvas);footer.append(node('span','','Рейтинг в заголовке и полный блок'),node('strong','',rating.count?`${rating.count} оценок`:'Нет оценок'));}
 else if(route==='review'){canvas.append(makeReview());s.append(canvas);footer.append(node('span','','Полный отзыв · реакции'),node('strong','',review.reaction||'Нет реакции'));}
 else if(route==='video'){canvas.append(makeVideo());s.append(canvas);footer.append(node('span','','Превью · название · длительность'),node('strong','','200 × 163 pt'));}
 else if(route==='textblock'){canvas.append(makeTextBlock());s.append(canvas);footer.append(node('span','','До 3 строк · раскрытие в блоке'),node('strong','',textBlock.text.trim()?'Текст':'Пусто'));}
 else if(route==='progress'){canvas.append(makeProgress());s.append(canvas);footer.append(node('span','','Линия 2 pt · ползунок 8 pt · область 32 pt'),node('strong','',`${Math.round(progress.progress*100)}%`));}
 else if(route==='person'){canvas.append(makePerson());s.append(canvas);footer.append(node('span','','Фото 72 × 72 pt · имя до двух строк'),node('strong','',person.variant));}
 else if(route==='series'){canvas.append(makeSeries());s.append(canvas);footer.append(node('span','','Превью до 152 × 85 pt · уменьшается вместе с экраном'),node('strong','',series.state));}
 else if(route==='moment-screen'){canvas.append(makeMomentScreen());s.append(canvas);footer.append(node('span','','Пауза · свайп вверх/вниз · лайк · избранное · продолжение'),node('strong','',momentScreen.state));}
 target.append(s);
}
function startFeedbackStream(block){
 block.appendText(feedback.personalized?feedback.personalizedText:feedback.generalText);
 block.finish();
 const check=()=>{
  if(!block.isConnected)return;
  if(block.dataset.state==='Loading')requestAnimationFrame(check);
  else log('Feedback Summary → саммари готово');
 };
 requestAnimationFrame(check);
}
function openMoment({title,imageSrc,videoSrc,card}){
 log(`Moment Card → открыт момент «${title}»`);
 openedMomentCard=card;
 const dialog=$('#moment-dialog'),media=$('#moment-dialog-media');media.replaceChildren();
 dialog.dataset.kind='moment-screen';
 media.append(createMomentScreen({...momentScreenDefaults,title,imageSrc,videoSrc,width:375,height:812,progress:0,onContinue:data=>log(`Moment Screen → полная серия с ${data.seconds} с`),onOpenTitle:()=>log('Moment Screen → карточка тайтла'),onShare:()=>log('Moment Screen → поделиться'),onSaveChange:saved=>log(`Moment Screen → ${saved?'добавлено':'удалено'} из избранного`)}));
 $('#moment-dialog-title').textContent=title;
 dialog.showModal();
}
function openTrailer({title,imageSrc,videoSrc,card}){
 log(`Content Card Cover → открыт трейлер «${title}»`);
 openedCover=card;
 const dialog=$('#moment-dialog'),media=$('#moment-dialog-media');media.replaceChildren();dialog.dataset.kind='media';
 const visual=videoSrc?node('video','moment-dialog__visual'):node('img','moment-dialog__visual');
 visual.src=videoSrc||imageSrc;
 if(videoSrc){visual.controls=true;visual.playsInline=true;visual.muted=false;visual.currentTime=0;}
 media.append(visual);$('#moment-dialog-title').textContent=`Трейлер · ${title}`;
 dialog.showModal();if(videoSrc)visual.play().catch(()=>{});
}
function openVideo({title,imageSrc,videoSrc}){
 log(`Video Card → открыт ролик «${title}»`);
 const dialog=$('#moment-dialog'),media=$('#moment-dialog-media');media.replaceChildren();dialog.dataset.kind='media';
 const visual=node(videoSrc?'video':'img','moment-dialog__visual');visual.src=videoSrc||imageSrc;
 if(videoSrc){visual.controls=true;visual.playsInline=true;visual.currentTime=0;}
 media.append(visual);$('#moment-dialog-title').textContent=title;dialog.showModal();if(videoSrc)visual.play().catch(()=>{});
}
function renderComparison(target){const s=node('div','compare-stage');let source,live,w,h;
 if(route==='button'){source=button.size==='Small'?'217-68633':button.content==='Icon'?'217-68660':'183-56676';w=button.size==='Small'?92:button.content==='Icon'?48:343;h=button.size==='Small'?28:48;live=createButton({...buttonDefaults,size:button.size,content:button.content});}
 else if(route==='seasons'){source='297-10915';w=375;h=32;live=createSeasonTabs();live.style.paddingTop='0';live.style.paddingBottom='0';}
 else if(route==='description'){source=description.type==='AI'?'275-71929':'275-71924';w=375;h=110;const raw='Аналитик ФБР всё ближе к разгадке серии \u2028убийств и всё дальше от мысли, что убийца   может быть рядом. Здесь даже спокойный разговор оставляет ту вязкую тревогу, ';live=createTitleDescription({type:description.type,text:raw+'которую ты любишь',prefix:raw,personalized:'которую ты любишь',canPersonalize:true});}
 else if(route==='feedback'){source='feedback-summary';w=343;h=112;live=createFeedbackSummary();}
 else if(route==='moment'){source='moment-card';w=200;h=300;live=createMomentCard();}
 else if(route==='tabs'){source='tabs-block';w=375;h=32;live=createTabsBlock();}
  else if(route==='cover'){source='content-card-cover';w=415;h=611;const wrap=node('div','cover-compare-wrap');wrap.append(createContentCardCover());live=wrap;}
  else if(route==='friend'){source='friend-rate';w=246;h=24;live=createFriendRate();}
  else if(route==='buttons'){source='buttons-block';w=375;h=104;live=createButtonsBlock();}
  else if(route==='rating'){source='rating-block';w=343;h=64;live=createRatingBlock();}
  else if(route==='review'){source='feedback-block';w=343;h=172;live=createFeedbackBlock();}
  else if(route==='video'){source='video-card';w=200;h=163;live=createVideoCard();}
  else if(route==='textblock'){source='text-block';w=375;h=60;live=createTextBlock();}
  else if(route==='progress'){source='progress-in-progress';w=343;h=16;live=createProgressBar();}
  else if(route==='person'){source='person-card';w=136;h=352;const wrap=node('div','person-compare-wrap');wrap.append(createPersonCard(),createPersonCard({variant:'Friend',name:'Мадс Миккельсен',subtitle:'Ганнибал Лектор'}));live=wrap;}
  else if(route==='series'){source='series';w=415;h=386;const wrap=node('div','series-compare-wrap');wrap.append(createSeries(),createSeries());live=wrap;}
  else{source={'Default':'moment-screen','Paused':'moment-paused','Loading':'moment-loading','Rewinding':'moment-rewinding','Ended':'moment-ended','Error':'moment-error'}[momentScreen.state]||'moment-screen';w=375;h=812;live=createMomentScreen({state:momentScreen.state,autoplay:false});}
 const first=node('div','compare-item');first.append(node('label','','FIGMA · Оригинал'));const image=node('img');image.src=`reference/${source}.png`;image.width=w;image.height=h;image.alt='Эталон из Figma';first.append(image);
 const second=node('div','compare-item');second.append(node('label','','КОД · Живой компонент'),live);s.append(first,second);target.append(s,node('div','compare-note',route==='description'?'Оба варианта используют исходный текст и ширину 375 pt из Figma.':route==='feedback'?'Готовое персонализированное саммари, 343 × 112 pt.':route==='moment'?'Исходное превью из Figma и название момента, 200 × 300 pt.':'Сравнение использует исходные тексты, размеры и состояние Default. Для Button — вариант Primary. Настройки доступны в предпросмотре.'));
}
function render(){
 document.title=`${labels[route]} · Иви Lab`;
 $('#title').textContent=$('#breadcrumb').textContent=labels[route];
 $('#component-index').textContent=`${String(routes.indexOf(route)+1).padStart(2,'0')} / ${String(routes.length).padStart(2,'0')}`;
 $('#description').textContent={button:'Действия в карточке контента. Четыре варианта, два размера, три состояния.',seasons:'Выбор сезона. Активная вкладка, нажатие и прокрутка длинного списка.',description:'Обычное и персонализированное описание тайтла.',feedback:'Короткое саммари отзывов: раскрытие и постепенная загрузка текста.',moment:'Короткий фрагмент: фото или видео, название и переход к просмотру.',tabs:'Переключение разделов карточки и горизонтальная прокрутка вкладок.',cover:'Верх карточки: трейлер или постер, сведения, описание и действия.',friend:'Оценка друга с цветом и текстом по диапазону оценки.',buttons:'Главная кнопка просмотра и действия с тайтлом.',rating:'Короткий рейтинг в шапке и подробный блок оценки.',review:'Отзыв пользователя: текст, дата и реакции.',video:'Карточка видео с превью, названием и длительностью.',textblock:'Текст до трёх строк и раскрытие через отдельный Reveal.',progress:'Позиция воспроизведения и перемотка момента.',person:'Актёр или друг: фото, имя, роль и оценка друга.',series:'Карточка серии: прогресс просмотра, доступность, описание и скачивание.','moment-screen':'Полноэкранный момент: просмотр, действия и переход к полной серии.','content-screen':'Полная карточка тайтла и сценарии просмотра. Секции можно включать и выключать справа.'}[route];
 $('#figma-link').href=`https://www.figma.com/design/JinDFmMxkLYtBfR8Az3EYL/Untitled?node-id=${{button:'183-56687',seasons:'297-10915',description:'275-71928',feedback:'183-60440',moment:'183-56867',tabs:'340-33464',cover:'340-33547',friend:'183-59879',buttons:'281-72203',rating:'183-60311',review:'183-60688',video:'183-59388',textblock:'350-34219',progress:'350-34302',person:'183-59032',series:'331-32831','moment-screen':'297-20744','content-screen':'297-15880'}[route]}`;
 document.querySelectorAll('[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===route));
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b.dataset.view===view));
 $('.events').hidden=route==='description';controls();renderPreview();
 const rules=$('#rules');rules.replaceChildren();
 if(extraComponents[route]){const item=extraComponents[route];$('#description').textContent=item.description;$('#figma-link').href=`https://www.figma.com/design/JinDFmMxkLYtBfR8Az3EYL/Untitled?node-id=${item.id.replace(':','-')}`;for(const [title,text] of item.rules)rules.append(rule(title,text));$('.details-heading span').textContent='По макету';return;}
 $('.details-heading span').textContent='Из спецификации';
 if(route==='content-screen')rules.append(rule('Состав','Экран собирается из обложки, вкладок, моментов, оценок, отзывов, людей, видео, подборок, рекомендаций и сведений. Каждый раздел использует компонент библиотеки.'),rule('Настройка','Справа можно включить или выключить любой блок. Экран пересобирается сразу, а отступы остаются последовательными.'),rule('Сценарии','В селекторе доступны полная карточка, три подсказки перед моментами и экран просмотра момента. Нажатия открывают связанные сценарии прототипа.'));
 else if(route==='button')rules.append(rule('Варианты и размеры','<code>Primary</code>, Secondary, Tertiary, Transparent. Big — 48 pt; Small — 28 pt и ширина по тексту.'),rule('Нажатие и недоступность','<code>Pressed</code> действует при удержании. Отмена жеста возвращает исходный вид. Disabled не вызывает действие.'));
 else if(route==='seasons')rules.append(rule('Выбор сезона','Нажатие на другую вкладку меняет <code>Active</code>. Одновременно выбран только один сезон.'),rule('Повторное нажатие','Нажатие на активную вкладку вызывает отдельное событие: экран может вернуться к началу сезона.'),rule('Длинный список','Сезоны прокручиваются горизонтально. Свайп не выбирает сезон. Двузначные номера сохраняются целиком.'));
 else if(route==='description')rules.append(rule('Выбор варианта','<code>Default</code> — когда нет данных о вкусах или подходящей причины. <code>AI</code> — когда причина есть.'),rule('Длина','Ожидается до 250 символов. Жёсткого ограничения нет: текст показывается целиком, высота зависит от количества строк.'),rule('Выделение','В AI подсвечена финальная персональная часть, за ней — значок AI. В Default подсветки и значка нет.'));
 else if(route==='feedback')rules.append(rule('Содержание','Если известны вкусы пользователя, саммари начинается со связи с ними. Персонализация не меняет смысл отзывов.'),rule('Раскрытие','После 3 строк появляется <code>ещё</code>. Нажатие плавно увеличивает высоту карточки и показывает текст целиком.'),rule('Загрузка','Заголовок виден сразу. Текст появляется по буквам без лоадера; под первые 3 строки оставлено место.'));
 else if(route==='moment')rules.append(rule('Превью','Фото или видео без звука. Видео повторяется, пока карточка полностью видна; при ошибке остаётся фото.'),rule('Название','До 3 строк. Длинный текст обрезается многоточием; полное название видно после открытия момента.'),rule('Нажатие','Карточка уменьшается на 5% от центра. После отпускания открывается момент с начала; свайп отменяет действие.'));
 else if(route==='tabs')rules.append(rule('Выбор','Одновременно активна одна вкладка. Нажатие переключает содержимое, повторное нажатие прокручивает его к началу.'),rule('Размер','Визуальная высота 32 pt, область нажатия не меньше 44 pt. Название до 20 символов.'),rule('Прокрутка','Когда вкладки не помещаются, ряд листается горизонтально. Активная вкладка видна целиком. Свайп не выбирает раздел.'));
 else if(route==='cover')rules.append(rule('Медиа','Трейлер начинается без звука. Кнопка переключает звук, нажатие по кадру открывает трейлер. При ошибке видео остаётся постер.'),rule('Содержимое','Для сериала — сезоны, для фильма — длительность. Рейтинг собран из <code>Title Rating</code>; оценка друга может отсутствовать.'),rule('Кнопки','Просмотр, избранное, скачивание, оценка и отправка ссылки. Здесь используются <code>Friend Rate</code> и <code>Buttons Block</code>.'));
 else if(route==='friend')rules.append(rule('Оценка','<code>8–10</code> — «имя рекомендует», зелёный. <code>5–7</code> — «имя поставил оценку», серый. <code>1–4</code> — «имя поставил оценку», красный.'),rule('Данные','Если нет оценки, блок скрыт. Без аватара показана заглушка. Сокращается только имя; текст оценки виден целиком.'),rule('Нажатие','Блок не открывает другой экран и не вызывает действие.'));
 else if(route==='buttons')rules.append(rule('Состав','Главная кнопка и четыре действия. Все кнопки используют компонент <code>Button</code>.'),rule('Активные состояния','Сохранённый тайтл и поставленная оценка обозначены красной брендовой иконкой. Состояния можно задать извне.'),rule('Остальные действия','Просмотр, скачивание, оценка и отправка вызывают отдельные действия приложения.'));
 else if(route==='rating')rules.append(rule('Отображение','В шапке — рейтинг и короткое число оценок. В блоке — характеристика и полное число. <code>8–10</code> — зелёный, <code>5–7</code> — серый, ниже 5 — красный.'),rule('Нет оценок','Короткий рейтинг скрыт. Большой блок показывает «Нет оценок», кнопку оценки можно нажать.'),rule('Моя оценка','Кнопка собрана из <code>Button</code> и имеет Pressed. После сохранения «Оценить» меняется на «Изменить»; отмена ничего не меняет.'));
 else if(route==='review')rules.append(rule('Текст','До четырёх строк; длинное слово переносится. Высота карточки зависит от текста. Нажатие открывает полный отзыв.'),rule('Реакции','Область нажатия — 44×44 pt. При нажатии иконка уменьшается на 10%, карточка не меняется. Счётчик есть только у лайка.'),rule('Нажатие и ошибка','При удержании текста карточка уменьшается на 5%. Ошибка сохранения возвращает прежнюю реакцию и число лайков.'));
 else if(route==='video')rules.append(rule('Превью','В списке показано неподвижное изображение. Нажатие открывает ролик с начала.'),rule('Название','До двух строк, дальше многоточие. При длинном названии карточка растёт по высоте.'),rule('Нажатие','При удержании карточка плавно уменьшается на 5%; отмена жеста возвращает размер.'));
 else if(route==='textblock')rules.append(rule('Три строки','Если текст не помещается, справа внизу появляется <code>Reveal</code>. Длина проверяется по строкам при текущей ширине и выбранном текстовом стиле.'),rule('Раскрытие','«Ещё» раскрывает весь текст внутри блока и исчезает. Свернуть нельзя; страница сама не прокручивается.'),rule('Стиль и края','Используется IVI Sans AI SVG; можно менять его текстовый стиль. Пустой текст скрывает блок; длинное слово переносится.'));
 else if(route==='person')rules.append(rule('Актёр и друг','Имя занимает не более двух строк, подпись — одну. Если фото нет, показана заглушка. Оценка друга берётся из общего компонента рейтинга.'),rule('Друг без оценки','Карточка друга не показывается, пока нет оценки. У актёра или создателя оценка не нужна.'),rule('Нажатие','Карточка уменьшается на 5% и открывает страницу актёра или друга.'));
 else if(route==='series')rules.append(rule('Просмотр','Не начата — с начала, начата — с сохранённой позиции, просмотрена — снова с начала. Нажатие на строку уменьшает её на 5%; описание остаётся на месте.'),rule('Превью','Превью уменьшается пропорционально экрану до 375 и не увеличивается выше 152 × 85. Начата — линия прогресса, просмотрена — подпись, не вышла — дата или «Скоро». Если кадра нет, можно использовать обложку тайтла.'),rule('Недоступность','Не вышедшую или недоступную серию нельзя запустить. Скачивание и раскрытие описания не запускают просмотр.'));
 else if(route==='moment-screen')rules.append(rule('Просмотр','Нажатие по экрану ставит на паузу или продолжает. При свайпе соседний момент движется за пальцем; после отпускания открывается или возвращается назад.'),rule('Действия','Лайк меняет иконку и счётчик. Сохранение добавляет тайтл в избранное. Нажатие на постер и подписи уменьшает блок на 5% и открывает карточку.'),rule('Конец и ошибка','Прозрачная кнопка продолжает полную серию с указанной позиции. Также можно повторить момент или загрузить его заново после ошибки.'));
 else rules.append(rule('Позиция','Линия 2 pt, ползунок 8 pt, область взаимодействия 32×32 pt. В конце линия заполнена.'),rule('Перемотка','Нажатие выбирает точку. При перетаскивании ползунок увеличивается и остаётся в пределах шкалы.'),rule('Пауза и отмена','После перемотки пауза сохраняется. Прерванный системой жест возвращает исходную позицию.'));
}
for(const b of document.querySelectorAll('[data-route]'))b.addEventListener('click',()=>{location.hash=b.dataset.route;});window.addEventListener('hashchange',()=>{route=routes.includes(location.hash.slice(1))?location.hash.slice(1):'button';view='preview';render();});for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>{view=b.dataset.view;render();});$('#reset').addEventListener('click',()=>{resetExtra();clearInterval(streamTimer);if(videoObjectUrl)URL.revokeObjectURL(videoObjectUrl);Object.values(coverAssetUrls).forEach(url=>URL.revokeObjectURL(url));Object.values(libraryAssetUrls).forEach(url=>URL.revokeObjectURL(url));videoObjectUrl=null;coverAssetUrls={};libraryAssetUrls={};button={...buttonDefaults};season={count:3,active:1,pressed:0,showHitAreas:false};description={...descriptionDefaults};feedback={...feedbackSummaryDefaults,mode:'Ready'};moment={...momentCardDefaults};tabs={...tabsBlockDefaults,tabs:[...tabsBlockDefaults.tabs]};cover={...contentCoverDefaults};friend={...friendRateDefaults};buttons={...buttonsBlockDefaults};rating={...ratingDefaults};review={...feedbackBlockDefaults};video={...videoCardDefaults};textBlock={...textBlockDefaults};progress={...progressBarDefaults};person={...personCardDefaults};series={...seriesDefaults};momentScreen={...momentScreenDefaults};momentSession=null;momentSessionIndex=0;width=375;render();});$('#clear-events').addEventListener('click',()=>{$('#event-log').replaceChildren(node('p','empty-event','Нажми на компонент — здесь появится результат действия.'));});$('#close-moment').addEventListener('click',()=>$('#moment-dialog').close());$('#moment-dialog').addEventListener('close',()=>{$('#moment-dialog-media .ivi-moment-screen')?.destroy();$('#moment-dialog-media video')?.pause();$('#moment-dialog-media').replaceChildren();openedMomentCard?.resumePreview();openedCover?.resumePreview();openedMomentCard=openedCover=null;});$('#close-review').addEventListener('click',()=>$('#review-dialog').close());$('#close-rating').addEventListener('click',()=>$('#rating-dialog').close());document.querySelectorAll('[data-score]').forEach(b=>b.addEventListener('click',()=>{rating.ownRating=Number(b.dataset.score);$('#rating-dialog').close();render();log(`Rating Block → сохранена оценка ${rating.ownRating}`);}));
// Screen settings are reset with the shared lab reset action as well.
$('#reset').addEventListener('click',()=>{contentScreen={...contentDetailScreenDefaults,blocks:{...contentDetailScreenDefaults.blocks}};screenScenario='Content';});
function usageCode(){
 const imports=`<link rel="stylesheet" href="components/components.css">\n<div id="component"></div>\n\n<script type="module">`;
 const fonts=`  await Promise.all([\n    document.fonts.load('500 14px "IVI Sans AI SVG"'),\n    document.fonts.load('400 14px "IVI Sans AI SVG"'),\n    document.fonts.load('400 16px "IVI Sans AI SVG"'),\n    document.fonts.load('700 14px "IVI Sans AI SVG"'),\n  ]);`;
 let props,name,file,callbacks;
 if(extraComponents[route]){const item=extraComponents[route];name=item.factory.name;file=item.file;props={...extraState[route]};if('width' in props)props.width=item.defaults.width===343?width-32:width;for(const key of Object.keys(props))if(typeof props[key]==='string'&&props[key].startsWith('blob:'))props[key]='path/to/asset';callbacks='';}
 else if(route==='button'){
  name='createButton';file='button';props={type:button.type,size:button.size,content:button.content,state:button.state};
  if(button.content==='Text'){props.label=button.label;if(button.size==='Big'){props.caption=button.caption;if(button.caption)props.captionText=button.captionText;props.width=width-32;}}
  else{props.icon=button.icon;if(button.type==='Transparent'){props.textUnderIcon=button.textUnderIcon;if(button.textUnderIcon)props.iconText=button.iconText;}}
  callbacks=`    onPress: () => console.log('Нажатие на кнопку'),`;
 }else if(route==='seasons'){
  name='createSeasonTabs';file='season-tabs';props={count:season.count,active:season.active};if(season.pressed)props.pressed=season.pressed;if(season.showHitAreas)props.showHitAreas=true;
  callbacks=`    onChange: season => console.log('Выбран сезон', season),\n    onReselect: season => console.log('К началу сезона', season),`;
 }else if(route==='description'){
  name='createTitleDescription';file='title-description';props={...description,width};callbacks='';
 }else if(route==='feedback'){
  name='createFeedbackSummary';file='feedback-summary';props={personalized:feedback.personalized,personalizedText:feedback.personalizedText,generalText:feedback.generalText,stream:feedback.mode==='Loading',width:Math.min(width-32,343)};callbacks='';
 }else if(route==='moment'){
  name='createMomentCard';file='moment-card';props={title:moment.title,preview:moment.preview,state:moment.state};if(moment.preview==='Video')props.videoSrc=moment.videoSrc?'path/to/moment.mp4':'';callbacks=`    onOpen: moment => console.log('Открыть момент', moment),`;
 }else if(route==='tabs'){
  name='createTabsBlock';file='tabs-block';props={tabs:tabs.tabs,active:tabs.active,width};callbacks=`    onChange: (index, label) => console.log('Показать раздел', label),\n    onReselect: (index, label) => console.log('К началу раздела', label),`;
 }else if(route==='cover'){
  name='createContentCardCover';file='content-card-cover';props={width,title:cover.title,titleLogo:cover.titleLogo?'path/to/title-logo.png':'',type:cover.type,mediaType:cover.mediaType,trailerImage:'path/to/trailer-frame.png',posterImage:'path/to/poster.png',videoSrc:cover.videoSrc?'path/to/trailer.mp4':'',rating:cover.rating,ratingCount:cover.ratingCount,years:cover.years,length:cover.length,country:cover.country,age:cover.age,genres:cover.genres,friendName:cover.friendName,friendNameDative:cover.friendNameDative,friendScore:cover.friendScore,friendAvatar:'path/to/avatar.png',descriptionType:cover.descriptionType,description:cover.description,descriptionPrefix:cover.descriptionPrefix,descriptionPersonalized:cover.descriptionPersonalized,primaryLabel:cover.primaryLabel,primaryCaption:cover.primaryCaption,saved:cover.saved};callbacks=`    onWatch: () => console.log('Открыть просмотр'),\n    onSaveChange: saved => console.log('В избранном:', saved),\n    onOpenTrailer: trailer => console.log('Открыть трейлер', trailer),\n    onRate: () => console.log('Открыть выбор оценки'),\n    onShare: () => console.log('Открыть меню отправки'),\n    onDownload: () => console.log('Открыть скачивание'),`;
 }else if(route==='friend'){
  name='createFriendRate';file='friend-rate';props={name:friend.name,score:friend.score,avatar:friend.avatar.startsWith('blob:')?'path/to/avatar.png':friend.avatar};callbacks='';
 }else if(route==='buttons'){
  name='createButtonsBlock';file='buttons-block';props={width,label:buttons.label,caption:buttons.caption,showSecondary:buttons.showSecondary,saved:buttons.saved,rated:buttons.rated};callbacks=`    onWatch: () => console.log('Смотреть'),\n    onSaveChange: saved => console.log('Избранное:', saved),\n    onRate: () => console.log('Оценить'),\n    onDownload: () => console.log('Скачать'),\n    onShare: () => console.log('Поделиться'),`;
 }else if(route==='rating'){
  name='createRatingBlock';file='rating-block';props={rating:rating.rating,count:rating.count,description:rating.description,ownRating:rating.ownRating,width:Math.min(width-32,343)};callbacks=`    onRate: () => console.log('Открыть выбор оценки'),`;
 }else if(route==='review'){
  name='createFeedbackBlock';file='feedback-block';props={author:review.author,text:review.text,date:review.date,likes:review.likes,reaction:review.reaction,width:Math.min(width-32,343)};callbacks=`    onOpen: review => console.log('Полный отзыв', review),\n    onReact: reaction => console.log('Реакция', reaction),`;
 }else if(route==='video'){
  name='createVideoCard';file='video-card';props={title:video.title,duration:video.duration,imageSrc:video.imageSrc.startsWith('blob:')?'path/to/preview.png':video.imageSrc,videoSrc:video.videoSrc?'path/to/video.mp4':'',width:video.width};callbacks=`    onOpen: video => console.log('Открыть видео с начала', video),`;
 }else if(route==='textblock'){
  name='createTextBlock';file='text-block';props={width,text:textBlock.text,textStyle:textBlock.textStyle};callbacks=`    onExpand: () => console.log('Текст раскрыт'),`;
 }else if(route==='person'){
  name='createPersonCard';file='person-card';props={variant:person.variant,name:person.name,subtitle:person.subtitle,score:person.score,imageSrc:person.imageSrc.startsWith('blob:')?'path/to/photo.png':person.imageSrc};callbacks=`    onOpen: person => console.log('Открыть страницу', person),`;
 }else if(route==='series'){
  name='createSeries';file='series';props={width,title:series.title,duration:series.duration,durationSeconds:series.durationSeconds,state:series.state,progress:series.progress,releaseDate:series.releaseDate,locked:series.locked,showDescription:series.showDescription,description:series.description,imageSrc:series.imageSrc?'path/to/episode-cover.png':'',titleCoverSrc:series.titleCoverSrc?'path/to/title-cover.png':''};callbacks=`    onWatch: ({ startAt }) => console.log('Смотреть с', startAt),\n    onDownload: () => console.log('Скачать серию'),`;
 }else if(route==='moment-screen'){
  name='createMomentScreen';file='moment-screen';props={width,height:Math.round(812*width/375),state:momentScreen.state,title:momentScreen.title,contentTitle:momentScreen.contentTitle,episode:momentScreen.episode,posterSrc:'path/to/title-poster.png',videoSrc:momentScreen.videoSrc?'path/to/moment.mp4':'',demoPlayback:momentScreen.demoPlayback,likes:momentScreen.likes,liked:momentScreen.liked,saved:momentScreen.saved};callbacks=`    onContinue: ({ seconds }) => console.log('Полная серия с', seconds),\n    onOpenTitle: () => console.log('Карточка тайтла'),\n    onShare: () => console.log('Поделиться'),`;
 }else if(route==='content-screen'){
  name='createContentDetailScreen';file='content-detail-screen';props={width:375,variant:contentScreen.variant,blocks:contentScreen.blocks};callbacks=`    onOpenMoment: data => console.log('Открыть момент', data),\n    onOpenVideo: data => console.log('Открыть видео', data),\n    onOpenPerson: data => console.log('Открыть персону', data),`;
 }else{
  name='createProgressBar';file='progress-bar';props={width:width-32,progress:progress.progress,duration:progress.duration,seekable:progress.seekable};callbacks=`    onSeek: ({ progress, seconds }) => console.log('Позиция', seconds),\n    onSeekCancel: () => console.log('Перемотка отменена'),`;
 }
 const lines=Object.entries(props).map(([k,v])=>`    ${k}: ${JSON.stringify(v).replaceAll('<','\\u003c')},`).join('\n');
 const continuation=route==='feedback'&&feedback.mode==='Loading'?"\n  // Добавленные части выводятся по буквам: component.appendText(chunk);\n  // После последней части: component.finish();":'';
 const ratingExtra=route==='rating'?`\n  const titleRating = createTitleRating({ rating: ${rating.rating}, count: ${rating.count} });\n  document.querySelector('#component').append(titleRating);`:'';
 return `${imports}\n  import { ${route==='rating'?'createTitleRating, ':''}${name} } from './components/${file}.js';\n\n${fonts}\n\n  const component = ${name}({\n${lines}\n${callbacks}\n  });${ratingExtra}\n  document.querySelector('#component').append(component);${continuation}\n</script>`;
}
function renderCode(){
 const path=codeView==='javascript'&&extraComponents[route]?`components/${extraComponents[route].file}.js`:codeView==='javascript'?`components/${{button:'button',seasons:'season-tabs',description:'title-description',feedback:'feedback-summary',moment:'moment-card',tabs:'tabs-block',cover:'content-card-cover',friend:'friend-rate',buttons:'buttons-block',rating:'rating-block',review:'feedback-block',video:'video-card',textblock:'text-block',progress:'progress-bar',person:'person-card',series:'series','moment-screen':'moment-screen','content-screen':'content-detail-screen'}[route]}.js`:codeView==='css'?'components/components.css':codeView==='tokens'?'tokens.css':codeView==='shared'?'components/core.js':'Пример · HTML + JavaScript';
 currentCode=codeView==='usage'?usageCode():sources[path];$('#code-file').textContent=path;$('#code-content code').textContent=currentCode;
 document.querySelectorAll('[data-code]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.code===codeView)));
 clearTimeout(copyTimer);$('#copy-code').textContent='Копировать';
}
for(const b of document.querySelectorAll('[data-code]'))b.addEventListener('click',()=>{codeView=b.dataset.code;renderCode();$('#code-content').scrollTop=0;});
$('#copy-code').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(currentCode);$('#copy-code').textContent='Скопировано';}
 catch{const range=document.createRange();range.selectNodeContents($('#code-content code'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('#copy-code').textContent='Текст выделен — ⌘C / Ctrl+C';}
 clearTimeout(copyTimer);copyTimer=setTimeout(()=>$('#copy-code').textContent='Копировать',2500);
});
render();window.__lab={createButton,createSeasonTabs,createTitleDescription,createFeedbackSummary,createMomentCard,createTabsBlock,createContentCardCover,createFriendRate,createButtonsBlock,createTitleRating,createRatingBlock,createFeedbackBlock,createVideoCard,createTextBlock,createReveal,createProgressBar,createPersonCard,createSeries,createSeriesPreview,createMomentScreen,createMomentBottomSide,createContentDetailScreen,createMomentHintScreen};
