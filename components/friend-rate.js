import { createRatingTag, ratingTone } from './tag.js';
import { node, pressable } from './core.js';

const asset = name => new URL(`../assets/cover/${name}`, import.meta.url).href;
export const friendRateDefaults = {
  name: 'Саня',
  score: 10,
  avatar: asset('friend-avatar.png'),
  width: null,
};

export function createFriendRatingBadge(score) {
  const badge=createRatingTag(score);badge.classList.add('ivi-friend-rate__badge');return badge;
}

export function createFriendRate(options = {}) {
  const p = { ...friendRateDefaults, ...options };
  const root = node(p.onPress ? 'button' : 'div', 'ivi-friend-rate');
  if (p.width != null) root.style.width = `${p.width}px`;
  if (p.onPress) { root.type = 'button'; root.setAttribute('aria-label', `${p.name}: открыть оценки друзей`); pressable(root, { down: () => root.classList.add('is-pressed'), up: () => root.classList.remove('is-pressed'), activate: p.onPress }); }
  const score = Number(p.score);
  if (!p.name || !Number.isFinite(score) || score < 1 || score > 10) { root.hidden = true; return root; }
  const tone = ratingTone(score);
  root.dataset.tone = tone;
  const suffix = tone === 'positive' ? 'рекомендует' : 'поставил оценку';
  const avatar = node('img', 'ivi-friend-rate__avatar');
  avatar.src = p.avatar || asset('friend-placeholder.png');
  avatar.alt = '';
  avatar.addEventListener('error', () => { avatar.src = asset('friend-placeholder.png'); }, { once: true });
  const label = node('span', 'ivi-friend-rate__label ivi-text-medium-text-small');
  label.append(node('span', 'ivi-friend-rate__name', p.name), node('span', 'ivi-friend-rate__suffix', suffix));
  label.setAttribute('aria-label', `${p.name} ${suffix}`);
  const badge = createFriendRatingBadge(score);
  root.append(avatar, label, badge);
  return root;
}
