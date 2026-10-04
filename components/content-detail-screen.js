import { node } from './core.js';
import { createNavigationBar, createStatusBar } from './navigation.js';
import { createSeasonTabs } from './season-tabs.js';
import { createIconButton } from './button.js';
import { createContentCardCover, contentCoverDefaults } from './content-card-cover.js';
import { createTabsBlock, tabsBlockDefaults } from './tabs-block.js';
import { createSeries } from './series.js';
import { createMomentCard } from './moment-card.js';
import { createPersonCard } from './person-card.js';
import { createRatingBlock, ratingDefaults } from './rating-block.js';
import { createFeedbackSummary, feedbackSummaryDefaults } from './feedback-summary.js';
import { createFeedbackBlock, feedbackBlockDefaults } from './feedback-block.js';
import { createVideoCard, videoCardDefaults } from './video-card.js';
import { createTextBlock, textBlockDefaults } from './text-block.js';
import { createCompilationCard } from './compilation-card.js';
import { createPoster } from './poster.js';
import { createSectionTitle, createMargin, createRow } from './layout.js';

const asset = name => new URL(`../assets/${name}`, import.meta.url).href;

export const contentDetailScreenDefaults = {
  width: 375,
  variant: 'Serial',
  activeTab: 0,
  blocks: {
    cover: true,
    tabs: true,
    moments: true,
    friends: true,
    rating: true,
    feedbackSummary: true,
    feedback: true,
    people: true,
    videos: true,
    compilations: true,
    recommendations: true,
    details: true,
  },
  cover: { ...contentCoverDefaults },
  tabs: { ...tabsBlockDefaults, tabs: ['О сериале', 'Сезоны'] },
  momentTitles: ['Как думает убийца', 'Разговор с Ганнибалом'],
  friends: [
    { variant: 'Friend', name: 'Саня', subtitle: '', score: 10, imageSrc: asset('person/portrait.png') },
    { variant: 'Friend', name: 'Лена', subtitle: '', score: 8, imageSrc: asset('person/placeholder-1.png') },
  ],
  people: [
    { variant: 'Actor/Creator', name: 'Мадс Миккельсен', subtitle: 'Ганнибал Лектор' },
    { variant: 'Actor/Creator', name: 'Хью Дэнси', subtitle: 'Уилл Грэм' },
    { variant: 'Actor/Creator', name: 'Каролин Дхавернас', subtitle: 'Доктор Алана Блум' },
    { variant: 'Actor/Creator', name: 'Лоуренс Фишборн', subtitle: 'Джек Кроуфорд' },
    { variant: 'Actor/Creator', name: 'Майкл Питт', subtitle: 'Мейсон Верджер' },
  ],
  videos: [
    { ...videoCardDefaults, title: 'Трейлер 2 (русский язык)' },
    { ...videoCardDefaults, title: 'Трейлер сериала', imageSrc: asset('moment-screen/raw-2.png') },
  ],
  compilations: [
    { title: 'Зарубежные детективные сериалы', imageSrc: asset('foundations/183-56926-raw-0.png') },
    { title: 'Мрачные истории', imageSrc: asset('foundations/183-56926-raw-1.png') },
  ],
  recommendations: [
    { title: 'Ганнибал: Восхождение', imageSrc: asset('foundations/183-56468-raw-0.png') },
    { title: 'Охотник за разумом', imageSrc: asset('cover/poster.png') },
    { title: 'Настоящий детектив', imageSrc: asset('moment-screen/raw-3.png') },
  ],
  details: [
    ['Страны', 'США'],
    ['Язык', 'русский, английский'],
    ['Год производства', '2013'],
    ['Режиссёр', 'Брайан Фуллер'],
    ['Сценарий', 'Брайан Фуллер'],
    ['Возраст', '18+'],
    ['Субтитры', 'русские, английские'],
  ],
};

const section = (name, child) => {
  const root = node('section', `ivi-content-detail-screen__section ivi-content-detail-screen__section--${name}`);
  root.dataset.section = name;
  root.append(child);
  return root;
};

const scroller = (name, children) => {
  const root = node('div', `ivi-content-detail-screen__scroller ivi-content-detail-screen__scroller--${name}`);
  root.append(...children);
  return root;
};

export function createContentDetailScreen(options = {}) {
  const p = {...contentDetailScreenDefaults,...options,blocks:{...contentDetailScreenDefaults.blocks,...options.blocks}};
  const root=node('div','ivi-content-detail-screen');root.style.width=p.width+'px';root.dataset.variant=p.variant;
  const disposables=[];
  const keep=component=>{disposables.push(component);return component;};
  root.append(createStatusBar({width:p.width}),createNavigationBar({width:p.width,onBack:p.onBack}),createMargin({value:8,width:p.width}));
  const cover=keep(createContentCardCover({...p.cover,width:p.width,type:p.variant,showFriend:p.blocks.friends,onOpenTrailer:p.onOpenTrailer,onWatch:p.onWatch,onSaveChange:p.onSaveChange,onRate:p.onRate,onDownload:p.onDownload,onShare:p.onShare}));
  root.append(cover,createMargin({value:32,width:p.width}));
  const about=node('div','ivi-content-detail-screen__content');
  const seasons=node('div','ivi-content-detail-screen__season-panel');seasons.hidden=p.activeTab!==1;
  if(p.variant==='Serial'){
    const tabGap=createMargin({value:20,width:p.width});
    about.hidden=p.activeTab===1;
    tabGap.style.height=`${p.activeTab===1?16:20}px`;
    const tabs=keep(createTabsBlock({width:p.width,tabs:['О сериале','Сезоны'],active:p.activeTab,onChange:index=>{p.onTabChange?.(index,tabs);about.hidden=index===1;seasons.hidden=index!==1;tabGap.style.height=`${index===1?16:20}px`;},onReselect:index=>p.onTabReselect?.(index,tabs)}));
    root.append(tabs,tabGap);
    const list=node('div','ivi-content-detail-screen__season-panel');
    const draw=season=>{
      [...list.children].forEach(x=>x.destroy?.());list.replaceChildren();
      const firstSeason=['Аперетив','Комплимент от шеф-повара','Крем-суп','Яйцо','Ракушки','Основное блюдо','Сорбет','Сыр'];
      const count=season===1?firstSeason.length:13;
      for(let i=1;i<=count;i++)list.append(createSeries({width:p.width,title:`${i}. ${season===1?firstSeason[i-1]:`Серия ${i}`}`,duration:i===1?'42 мин':'43 мин',imageSrc:season===1?p.seriesImages?.[i-1]:'',onWatch:()=>p.onOpenSeries?.({title:`Сезон ${season} серия ${i}`})}));
    };
    seasons.append(keep(createSeasonTabs({width:p.width,count:3,active:1,onChange:draw})),list);draw(1);
    disposables.push({destroy:()=>[...list.children].forEach(x=>x.destroy?.())});
  }
  const add=(name,child,gap=32)=>{if(about.children.length)about.append(createMargin({value:gap,width:p.width}));const block=section(name,child);about.append(block);};
  const group=(title,items,name,subtitle=false,rating=8.5)=>{
    const block=node('div','ivi-content-detail-screen__group');block.append(createSectionTitle({title,width:p.width,subtitle,rating}),scroller(name,items));return block;
  };
  if(p.blocks.moments)add('moments',group('Моменты',(p.moments||p.momentTitles.map(title=>({title}))).map((moment,index)=>keep(createMomentCard({...moment,videoSrc:moment.previewVideoSrc||moment.videoSrc,onOpen:data=>p.onOpenMoment?.({...data,index})}))),'moments'));
  if(p.blocks.friends)add('friends',group('Оценки друзей',p.friends.map(friend=>createPersonCard({...friend,subtitle:'',variant:'Friend'})),'friends',true,p.friends.reduce((a,b)=>a+Number(b.score),0)/p.friends.length));
  const ratingGroup=node('div','ivi-content-detail-screen__group');
  const rating=createRatingBlock({...p.rating,width:p.width,onRate:p.onRate});
  ratingGroup.append(createSectionTitle({title:p.variant==='Serial'?'Рейтинг сериала':'Рейтинг фильма',width:p.width}),rating);add('rating',ratingGroup);
  if(p.blocks.feedback){
    add('summary',keep(createFeedbackSummary({...p.feedbackSummary,width:p.width})),16);
    add('feedback',scroller('feedback',(p.reviews||[feedbackBlockDefaults]).map(review=>createFeedbackBlock({...review,width:p.width-32,onOpen:p.onOpenFeedback}))),8);
  }
  add('people',group('Актеры и создатели',p.people.map(person=>createPersonCard({...person,onOpen:p.onOpenPerson})),'people'));
  add('videos',group('Материалы сериала',p.videos.map(video=>{let card=createVideoCard({...video,onOpen:data=>p.onOpenVideo?.({...data,card})});return card;}),'videos'));
  add('compilations',group('Сериал в подборках',p.compilations.map(item=>createCompilationCard({...item,onOpen:()=>p.onOpenCompilation?.(item)})),'compilations'));
  add('recommendations',group(p.variant==='Serial'?'Если понравился «Ганнибал»':'Если понравилась «Обсессия»',p.recommendations.map(item=>createPoster({...item,onOpen:()=>p.onOpenRecommendation?.(item)})),'recommendations'));
  const details=node('div','ivi-content-detail-screen__group');
  details.append(createSectionTitle({title:p.variant==='Serial'?'Подробнее о сериале':'Подробнее о фильме',width:p.width}),keep(createTextBlock({width:p.width,text:p.detailText||p.cover.description,textStyle:'Text Small'})));
  const rows=node('div','ivi-content-detail-screen__details');
  const serialRows=[['Ограничения','18+','Tag'],['Страны','США'],['Длительность',p.cover.length],['Годы',p.cover.years],['Языки',['Русский','Английский']],['Субтитры',['Русский','Узбекские AI']],['Качество','Full HD','Tag']];
  const movieRows=[['Ограничения','18+','Tag'],['Страны','США'],['Длительность','1 ч 43 мин'],['Год','2025'],['Языки','Русский, английский, узбекский'],['Субтитры','Русский'],['Качество','Full HD','Tag']];
  (p.variant==='Serial'?serialRows:movieRows).forEach(([label,value,type])=>rows.append(createRow({label,value,type,width:p.width})));
  details.append(rows);add('details',details);
  root.append(about,seasons);
  root.setSaved=value=>cover.setSaved(value);
  root.setRated=value=>{cover.setRated(Boolean(value));rating.setOwnRating?.(value);};
  root.pausePreview=()=>cover.pausePreview();root.resumePreview=()=>cover.resumePreview();
  root.destroy=()=>disposables.forEach(x=>x.destroy?.());
  return root;
}

export function createMomentHintScreen({ state = '1', width = 375, onBack, onContinue } = {}) {
  const root = node('section', `ivi-moment-hint-screen ivi-moment-hint-screen--${state}`);
  root.style.width = `${width}px`;
  const media = node('div', 'ivi-moment-hint-screen__media');
  const image = node('img');
  image.src = asset(state === '1' ? 'moment-screen/raw-1.png' : 'moment-screen/raw-2.png');
  image.alt = '';
  media.append(image, node('span', 'ivi-moment-hint-screen__shade'));
  const navigation = node('div', 'ivi-moment-hint-screen__navigation');
  navigation.append(createIconButton({ icon: 'back', label: 'Закрыть', size: 16, onPress: onBack }));
  const hint = node('div', 'ivi-moment-hint-screen__hint');
  hint.append(node('strong', '', state === '3' ? 'Смотри моменты' : 'Проведи вверх'), node('span', '', state === '3' ? 'Короткие фрагменты помогут выбрать, что смотреть дальше' : 'Смотри короткие фрагменты из сериала прямо в карточке'));
  root.append(media, navigation, hint);
  if (state === '3') {
    const action = node('button', 'ivi-moment-hint-screen__action', 'Начать');
    action.type = 'button'; action.addEventListener('click', () => onContinue?.());
    root.append(action);
  }
  return root;
}
