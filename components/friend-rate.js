import { createRatingTag } from './tag.js';
import { node } from './core.js';

const asset = name => new URL(`../assets/cover/${name}`, import.meta.url).href;
export const friendRateDefaults = {
  name: 'Саня',
  score: 10,
  avatar: asset('friend-avatar.png'),
  width: null,
};

function shortName(value) {
  const letters = Array.from(value);
  return letters.length > 10 ? `${letters.slice(0, 9).join('')}…` : value;
}

export function createFriendRatingBadge(score) {
  const badge=createRatingTag(score);badge.classList.add('ivi-friend-rate__badge');return badge;
}

export function createFriendRate(options = {}) {
  const p = { ...friendRateDefaults, ...options };
  const root = node('div', 'ivi-friend-rate');
  if (p.width != null) root.style.width = `${p.width}px`;
  const score = Number(p.score);
  if (!p.name || !Number.isFinite(score) || score < 1 || score > 10) { root.hidden = true; return root; }
  const tone = score >= 8 ? 'positive' : score >= 5 ? 'neutral' : 'negative';
  root.dataset.tone = tone;
  const visibleName = shortName(p.name);
  const suffix = tone === 'positive' ? 'рекомендует' : 'поставил оценку';
  const avatar = node('img', 'ivi-friend-rate__avatar');
  avatar.src = p.avatar || asset('friend-placeholder.png');
  avatar.alt = '';
  avatar.addEventListener('error', () => { avatar.src = asset('friend-placeholder.png'); }, { once: true });
  const label = node('span', 'ivi-friend-rate__label ivi-text-medium-text-small');
  label.append(node('span', 'ivi-friend-rate__name', visibleName), node('span', 'ivi-friend-rate__suffix', suffix));
  label.setAttribute('aria-label', `${p.name} ${suffix}`);
  const badge = createFriendRatingBadge(score);
  root.append(avatar, label, badge);
  return root;
}
