import { createContentPageHeader } from './content-page-header.js';
import { createTitleBlock } from './title-block.js';
import { createButtonsBlock } from './buttons-block.js';
import { createFriendRate } from './friend-rate.js';
import { createTitleDescription } from './title-description.js';
import { node } from './core.js';

const asset = name => new URL(`../assets/cover/${name}`, import.meta.url).href;
export const contentCoverDefaults = {
  width: 375,
  title: 'Ганнибал',
  titleLogo: asset('title-logo.png'),
  type: 'Serial',
  mediaType: 'Trailer',
  trailerImage: asset('trailer.png'),
  posterImage: asset('poster.png'),
  videoSrc: '',
  rating: '8.4',
  ratingCount: 36929,
  years: '2013 – 2016',
  length: '3 сезона',
  country: 'США',
  age: '18+',
  genres: ['Детектив', 'Триллер'],
  friendName: 'Саня',
  friendNameDative: 'Сане',
  friendScore: '10',
  friendAvatar: asset('friend-avatar.png'),
  descriptionType: 'AI',
  description: 'Аналитик ФБР всё ближе к разгадке серии убийств и всё дальше от мысли, что убийца может быть рядом. Здесь даже спокойный разговор оставляет ту вязкую тревогу, которую ты любишь',
  descriptionPrefix: 'Аналитик ФБР всё ближе к разгадке серии убийств и всё дальше от мысли, что убийца может быть рядом. Здесь даже спокойный разговор оставляет ту вязкую тревогу, ',
  descriptionPersonalized: 'которую ты любишь',
  primaryLabel: 'Смотреть',
  primaryCaption: 'Сезон 1 серия 1',
  saved: false,
  rated: false,
};

export function createContentCardCover(options = {}) {
  const p = { ...contentCoverDefaults, ...options };
  const root = node('section', 'ivi-content-cover');
  root.style.width = `${p.width}px`;
  root.dataset.media = p.mediaType;
  const header=createContentPageHeader({...p,onOpenTrailer:data=>p.onOpenTrailer?.({...data,card:data.card||header})});
  const body=node('div','ivi-content-cover__body');
  body.append(createTitleBlock({...p,width:p.width}));
  const friend = createFriendRate({ name: p.friendName, score: p.friendScore, avatar: p.friendAvatar, width: p.width, onPress: p.onFriendPress });
  if (p.showFriend !== false && !friend.hidden) body.append(friend);
  const lower = node('div', 'ivi-content-cover__lower');
  lower.append(createTitleDescription({
    type: p.descriptionType,
    width: p.width,
    text: p.description,
    prefix: p.descriptionPrefix,
    personalized: p.descriptionPersonalized,
    canPersonalize: p.descriptionType === 'AI',
  }));
  const actions = createButtonsBlock({ width: p.width, label: p.primaryLabel, caption: p.primaryCaption, saved: p.saved, rated: p.rated, onWatch: p.onWatch, onSaveChange: p.onSaveChange, onRate: p.onRate, onDownload: p.onDownload, onShare: p.onShare });
  root.setRated = value => actions.setRated?.(value);
  root.setSaved = value => actions.setSaved?.(value);
  lower.append(actions);
  body.append(lower);
  root.append(header, body);
  root.pausePreview=()=>header.pausePreview();root.resumePreview=()=>header.resumePreview();root.destroy=()=>header.destroy();
  return root;
}
