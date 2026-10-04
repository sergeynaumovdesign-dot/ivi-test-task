import { node } from './core.js';
import { createTag } from './tag.js';
import { createTitleRating } from './rating-block.js';
export const titleBlockDefaults={width:343,title:'Ганнибал',titleLogo:new URL('../assets/cover/title-logo.png',import.meta.url).href,type:'Serial',rating:8.4,ratingCount:36929,years:'2013 – 2016',length:'3 сезона',country:'США',age:'18+',genres:['Детектив','Триллер']};
export function createTitleBlock(options={}) {
 const p={...titleBlockDefaults,...options};
  const titleBlock = node('div', 'ivi-content-cover__title-block');
  const logoSlot = node('div', 'ivi-content-cover__logo-slot');
  if (p.titleLogo) {
    const logo = node('img', 'ivi-content-cover__logo');
    logo.src = p.titleLogo;
    logo.alt = p.title;
    logoSlot.append(logo);
  } else logoSlot.append(node('strong', 'ivi-content-cover__title-text ivi-text-bold-h1', p.title));
  const facts = node('div', 'ivi-content-cover__facts');
  const metadata = node('div', 'ivi-content-cover__metadata ivi-text-regular-text-small');
  const rating = createTitleRating({ rating: p.rating, count: p.ratingCount });
  if (!rating.hidden) metadata.append(rating);
  for (const value of [p.years, p.length, p.country, p.age]) if (value) metadata.append(node('span', '', value));
  const genres = node('div', 'ivi-content-cover__genres');
  for (const genre of p.genres) genres.append(createTag({text:genre}));
  facts.append(metadata, genres);
  titleBlock.append(logoSlot, facts);
  titleBlock.style.width=`${p.width}px`;titleBlock.classList.add('ivi-title-block');return titleBlock;
}
