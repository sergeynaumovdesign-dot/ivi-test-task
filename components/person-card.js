import { node, pressable } from './core.js';
import { createFriendRatingBadge } from './friend-rate.js';

const asset = name => new URL(`../assets/person/${name}`, import.meta.url).href;

export const personCardDefaults = {
  variant: 'Actor/Creator',
  name: 'Мадс Миккельсен',
  subtitle: 'Ганнибал Лектор',
  imageSrc: asset('portrait.png'),
  score: 10,
};

export function createPersonCard(options = {}) {
  const p = { ...personCardDefaults, ...options };
  const isFriend = p.variant === 'Friend';
  const score = Number(p.score);
  const card = node('button', 'ivi-person-card');
  card.type = 'button';
  card.dataset.variant = isFriend ? 'Friend' : 'Actor/Creator';
  if (isFriend && (!Number.isFinite(score) || score < 1 || score > 10)) {
    card.hidden = true;
    return card;
  }
  card.setAttribute('aria-label', [p.name, p.subtitle, isFriend ? `Оценка ${score}` : ''].filter(Boolean).join(', '));
  const photo = node('span', 'ivi-person-card__photo');
  const image = node('img', 'ivi-person-card__image');
  image.alt = '';
  image.src = p.imageSrc || asset('placeholder-2.png');
  image.addEventListener('error', () => { if (!image.src.endsWith('/placeholder-2.png')) image.src = asset('placeholder-2.png'); }, { once: true });
  photo.append(image);
  if (isFriend) {
    const badge = createFriendRatingBadge(score);
    badge.classList.add('ivi-person-card__badge');
    photo.append(badge);
  }
  const labels = node('span', 'ivi-person-card__labels');
  labels.append(node('span', 'ivi-person-card__name ivi-text-medium-caption', p.name || 'Без имени'));
  if (p.subtitle) labels.append(node('span', 'ivi-person-card__subtitle ivi-text-regular-caption', p.subtitle));
  card.append(photo, labels);
  pressable(card, {
    down: () => card.classList.add('is-pressed'),
    up: () => card.classList.remove('is-pressed'),
    activate: () => p.onOpen?.({ variant: card.dataset.variant, name: p.name, subtitle: p.subtitle, score: isFriend ? score : null }),
  });
  return card;
}
