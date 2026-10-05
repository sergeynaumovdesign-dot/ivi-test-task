import { ratingTone } from './tag.js';
import { node } from './core.js';
import { createButton } from './button.js';

export const ratingDefaults = {
  rating: 8.4,
  count: 36929,
  description: 'Интересный сюжет',
  width: 343,
  ownRating: null,
};

const compact = count => count >= 1000 ? `${Math.floor(count / 1000)}К` : String(count);
const countLabel = count => {
  const n = Math.abs(count) % 100, last = n % 10;
  return `${count.toLocaleString('ru-RU')} ${n >= 11 && n <= 14 ? 'оценок' : last === 1 ? 'оценка' : last >= 2 && last <= 4 ? 'оценки' : 'оценок'}`;
};
const scoreText = value => Number(value).toFixed(1);

export function createTitleRating(options = {}) {
  const p = { ...ratingDefaults, ...options };
  const root = node('span', 'ivi-title-rating ivi-text-regular-text-small');
  const score = Number(p.rating), count = Number(p.count);
  if (!Number.isFinite(score) || score <= 0 || !Number.isFinite(count) || count <= 0) { root.hidden = true; return root; }
  root.dataset.tone = ratingTone(score);
  root.append(node('b', 'ivi-text-bold-text-small', scoreText(score)));
  if(!p.scoreOnly)root.append(node('span', '', '·'), node('span', '', compact(count)));
  return root;
}

export function createRatingBlock(options = {}) {
  const p = { ...ratingDefaults, ...options };
  const root = node('div', 'ivi-rating-block');
  root.style.width = `${p.width}px`;
  const score = Number(p.rating), count = Number(p.count);
  const hasRating = Number.isFinite(score) && score > 0 && Number.isFinite(count) && count > 0;
  if (hasRating) root.dataset.tone = ratingTone(score);
  const info = node('div', 'ivi-rating-block__info');
  if (hasRating) {
    info.append(node('strong', 'ivi-rating-block__score ivi-text-bold-rating-large', scoreText(score)));
    const details = node('div', 'ivi-rating-block__details');
    if (p.description) details.append(node('span', 'ivi-rating-block__description ivi-text-medium-text-small', p.description));
    details.append(node('span', 'ivi-rating-block__count ivi-text-regular-text-small', countLabel(count)));
    info.append(details);
  } else info.append(node('strong', 'ivi-text-bold-h3', 'Нет оценок'));
  const makeAction = () => {
    const button = createButton({ type: 'Secondary', size: 'Small', content: 'Text', label: 'Оценить', caption: false, onPress: () => p.onRate?.() });
    button.classList.add('ivi-rating-block__action');
    return button;
  };
  let action = makeAction();
  root.setOwnRating = value => { p.ownRating = value; const next = makeAction(); action.replaceWith(next); action = next; };
  root.append(info, action);
  return root;
}
