import { episodeDescriptions } from './components/episode-data.js';
import { contentCoverDefaults } from './components/content-card-cover.js';
import { feedbackSummaryDefaults } from './components/feedback-summary.js';
import { feedbackBlockDefaults } from './components/feedback-block.js';
const image = file => new URL(`./assets/screens/${file}`, import.meta.url).href;
const video = file => new URL(`./assets/videos/${file}`, import.meta.url).href;
const people = (names, files) => names.map(([name, subtitle], i) => ({name, subtitle, imageSrc:image(files[i]), variant:'Actor/Creator'}));
const serial = {
  title:'Ганнибал', variant:'Serial', episodeDescriptions, demoVideoSrc:video('case-moment-original.mp4'),
  seriesImages:['06e8c.png','fdacb.png','a77a0.png','06e81.png','26ff4.png','f1e33.png','2a641.png','6ceee.png'].map(image),
  cover:{...contentCoverDefaults, titleLogo:image('eb673.png'),trailerImage:video('hannibal-trailer-still.png'),posterImage:image('c4f62.png'),videoSrc:video('hannibal-trailer-preview.mp4'),fullVideoSrc:video('hannibal-trailer-browser-cut.mp4'),friendAvatar:image('d5aec.png')},
  ordinary:'Аналитик ФБР с уникальным даром ищет неуловимого маньяка, который оказывается ближе, чем кажется',
  summary:{...feedbackSummaryDefaults},
  moments:[
    {title:'Уилл проживает убийство от лица преступника',imageSrc:video('hannibal-moment-1-browser-poster.jpg'),videoSrc:video('hannibal-moment-1-browser.mp4'),previewVideoSrc:video('hannibal-moment-1-browser-preview.mp4'),preview:'Video',duration:221.054,episode:'Сезон 1 серия 1',continuationSeconds:251},
    {title:'Уилл уверен, что Ганнибал ему неинтересен',imageSrc:video('hannibal-moment-2-browser-poster.jpg'),videoSrc:video('hannibal-moment-2-browser.mp4'),previewVideoSrc:video('hannibal-moment-2-browser-preview.mp4'),preview:'Video',duration:49.049,episode:'Сезон 1 серия 1',continuationSeconds:320},
    {title:'Уилл уверен, что Ганнибал ему неинтересен (9:16 AI)',imageSrc:video('hannibal-moment-3-browser-poster.jpg'),videoSrc:video('hannibal-moment-3-browser-v3.mp4'),previewVideoSrc:video('hannibal-moment-3-browser-preview-v2.mp4'),preview:'Video',duration:15.667,episode:'Сезон 1 серия 1',continuationSeconds:338},
  ],
  friends:[{name:'Саня',score:10,imageSrc:image('42d6b.png')},{name:'Наташа',score:7,imageSrc:image('50a52.png')}],
  people:people([['Мадс Миккельсен','Ганнибал Лектор'],['Хью Дэнси','Уилл Грэхэм'],['Каролина Давернас','Доктор Алана Блум'],['Гильермо Наварро','Режиссёр'],['Майкл Раймер','Режиссёр']],['08bd1.png','041e9.png','98121.png','0f5d7.png','55e04.png']),
  videos:[{title:'Трейлер 2 (русский язык)',duration:'1 мин',imageSrc:image('40108.png')},{title:'Трейлер',duration:'3 мин',imageSrc:image('f7ab2.png')}],
  compilations:[{title:'Зарубежные детективные сериалы',imageSrc:image('0c823.png')},{title:'Свой среди чужих',imageSrc:image('f959f.png')}],
  recommendations:['acdc9.png','4d473.png','6a945.png'].map((file,index)=>({title:`Рекомендация ${index+1}`,imageSrc:image(file)})),
  reviews:[
    {...feedbackBlockDefaults,author:'Алексей',text:'Больше всего зацепили разговоры Уилла и Ганнибала: внешне всё спокойно, но почти в каждой реплике чувствуется подвох. Миккельсен очень убедителен. Только сцены преступлений тяжёлые — смотреть за ужином я бы не советовал.',date:'2 октября 2026',likes:18},
    {...feedbackBlockDefaults,author:'Марина',text:'Первый сезон посмотрела быстро: нравится, как постепенно меняются отношения героев. Дальше темп показался медленнее, и некоторые диалоги слишком многозначительные. За атмосферу и актёров всё равно хочется продолжить.',date:'1 октября 2026',likes:7},
  ],
  detailText:'Лучший аналитик ФБР Уилл Грэм пытается поймать маньяка, всегда идущего на шаг впереди. Грэм обращается за помощью к гениальному психиатру Ганнибалу Лектеру, который подключается к делу против самого себя. Напряжённый психологический детектив Брайана Фуллера с Мадсом Миккельсеном, Хью Дэнси и Джиллиан Андерсон.\n\nБалтимор, штат Мэриленд. Консультант и преподаватель академии ФБР Уилл Грэм живёт с уникальным типом мышления, который позволяет ему примерять на себя психологию, мотивацию и логику других людей. Способность удивительной эмпатии помогает ему расследовать самые запутанные преступления. Однажды Уиллу поручают найти неуловимого маньяка, почти не оставляющего следов, и он знакомится с уважаемым психиатром Ганнибалом Лектором. Их сотрудничество перерастает в дружбу и приводит к прогрессу в расследовании, но Ганнибал умело скрывает от Грэма и его коллег опасные тайны. Чтобы узнать, как будут развиваться события, смотри онлайн на Иви «Ганнибал».',
};
const movie = {
  title:'Обсессия',variant:'Film',
  cover:{...contentCoverDefaults,title:'Обсессия',titleLogo:image('e0b17.png'),trailerImage:image('d971a.png'),posterImage:image('d971a.png'),friendAvatar:image('d5aec.png'),rating:'6.2',years:'2025',length:'1 ч 43 мин',genres:['Ужасы','Зарубежные'],primaryCaption:'',descriptionPrefix:'Беар влюблён в подругу Никки и загадывает, чтобы она любила его сильнее всех на свете. Желание исполняется буквально и их жизнь превращается в ад. Мрачная история, где за сбывшейся мечтой',descriptionPersonalized:' скрывается страшное — в твоём вкусе'},
  ordinary:'Беар влюблён в подругу Никки, но не может ей признаться. Когда он загадывает, чтобы Никки любила его сильнее всех на свете, желание неожиданно исполняется — и превращает их жизни в кошмар наяву.',
  summary:{personalizedText:'Тебе нравятся мрачные истории — и зрители здесь отмечают жуткие сцены, игру Никки и тревожное послевкусие. Несколько отзывов хвалят сочетание ужаса и юмора. Но впечатления разделились: есть претензии к диалогам и предсказуемому финалу.',generalText:'Зрители отмечают жуткие сцены, игру Никки и тревожное послевкусие. Несколько отзывов хвалят сочетание ужаса и юмора. Но впечатления разделились: есть претензии к диалогам и предсказуемому финалу.'},
  moments:[{title:'Беар загадывает желание',imageSrc:image('85944.png'),episode:'Обсессия',continuationSeconds:251},{title:'Беар ужинает с Никки',imageSrc:image('330df.png'),episode:'Обсессия',continuationSeconds:320}],
  friends:[{name:'Саня',score:10,imageSrc:image('42d6b.png')},{name:'Наташа',score:8,imageSrc:image('50a52.png')}],
  people:people([['Майкл Джонстон','Беар'],['Инде Наварретт','Никки'],['Купер Томлинсон','Иэн'],['Меган Лоулесс','Сара'],['Карри Баркер','Режиссёр']],['35ade.png','fb9cd.png','29805.png','792e2.png','52305.png']),
  videos:[{title:'Трейлер (дублированный)',duration:'2 мин',imageSrc:image('b5268.png')}],
  compilations:[{title:'Американские ужасы',imageSrc:image('26367.png')},{title:'Популярные фильмы ужасов',imageSrc:image('87da0.png')}],
  recommendations:['b142d.png','47340.png','66d49.png'].map((file,index)=>({title:`Рекомендация ${index+1}`,imageSrc:image(file)})),
  reviews:[
    {...feedbackBlockDefaults,author:'Ирина',text:'Понравилось, как романтическая завязка постепенно становится тревожной. Никки страшная именно в обычных бытовых сценах. После просмотра ещё долго думала о том, как желание быть любимым превращается в контроль.',date:'3 октября 2026',likes:12},
    {...feedbackBlockDefaults,author:'Денис',text:'Несколько сцен действительно напугали, а чёрный юмор оказался к месту. Но диалоги местами звучат искусственно, и ближе к финалу уже понимаешь, куда всё идёт. Для одного вечернего просмотра нормально.',date:'30 сентября 2026',likes:5},
  ],
  detailText:'Беар давно влюблён в подругу Никки, но никак не может признаться ей в чувствах. Когда он загадывает, чтобы Никки любила его сильнее всех на свете, желание исполняется намного эффективнее, чем он надеялся. Главный психологический хоррор года, ставший режиссёрским дебютом комика Карри Баркера.\n\nБеар Бейли работает в музыкальном магазине вместе с Никки, Иэном и Сарой. Он влюблён в Никки и готовится рассказать ей о своих чувствах, репетируя признание перед друзьями, но никак не может набраться смелости. Однажды в эзотерическом магазине он покупает для неё подарок – деревянную палочку «Ива одного желания», которая должна исполнять мечты. Когда Беар в очередной раз не может признаться девушке в любви, он сам использует волшебный артефакт и загадывает, чтобы Никки любила его больше всех на свете. Желание моментально исполняется, и Никки становится буквально одержима Беаром. Со временем оказывается, что огромная любовь может быть огромной проблемой, а жизни героев превращаются в настоящий кошмар. Чтобы узнать, как будут развиваться события, смотри онлайн на Иви «Обсессия».',
};
export const titles = {serial,movie};
