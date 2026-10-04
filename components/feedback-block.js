import { createIcon } from './icon.js';
import { node } from './core.js';

const asset = name => new URL(`../assets/feedback/${name}`, import.meta.url).href;
export const feedbackBlockDefaults = {
  width: 343,
  author: 'vladimir1975ch',
  text: 'Брайан Фуллер создал, а Мадс Миккельсен воплотил в сериале почти идеальный образ доктора. Профессионализм, интеллект, утонченность, вежливость, уравновешенность, прекрасная физическая форма. Но, к сожалению, психопат… Изобилие обезображенных трупов делает просмотр тяжеловатым, однако великолепная игра актеров и не простые повороты сюжета притягивают как магнит. Интересно, что во втором сезоне поведение и мотивы Ганнибала Лектера начинают вступать в противоречие с его диагнозом',
  date: '27 сентября 2015',
  likes: 32,
  reaction: null,
};

export function createFeedbackBlock(options = {}) {
  const p = { ...feedbackBlockDefaults, ...options };
  const root = node('article', 'ivi-feedback-block');
  root.style.width = `${p.width}px`;
  const author = node('div', 'ivi-feedback-block__author ivi-text-medium-text-small', p.author || 'Пользователь');
  const body = node('button', 'ivi-feedback-block__text');
  body.type = 'button';
  body.append(node('span', 'ivi-feedback-block__excerpt ivi-text-regular-text-small', p.text));
  body.addEventListener('click', () => p.onOpen?.({ author: p.author, text: p.text, date: p.date }));
  const footer = node('div', 'ivi-feedback-block__footer');
  footer.append(node('span', 'ivi-feedback-block__date ivi-text-regular-text-small', p.date || ''));
  const reactions = node('div', 'ivi-feedback-block__reactions');
  let reaction = p.reaction, likes = Number(p.likes) || 0;
  let pending = false;
  const buttons = {};
  function refresh() {
    for (const kind of ['like', 'dislike']) {
      const active = reaction === kind;
      const button = buttons[kind];
      button.querySelector('img').src = asset(`${kind}${active ? '-fill' : ''}.svg`);
      if (kind === 'like') button.querySelector('.ivi-feedback-block__count').textContent = likes ? String(likes) : '';
      button.setAttribute('aria-pressed', String(active));
    }
  }
  function react(kind) {
    if (pending) return;
    const before = { reaction, likes };
    const contribution = value => value === 'like' ? 1 : value === 'dislike' ? -1 : 0;
    const next = reaction === kind ? null : kind;
    likes = Math.max(0, likes + contribution(next) - contribution(reaction));
    reaction = next;
    refresh();
    try {
      const result = p.onReact?.(reaction, likes);
      if (result && typeof result.then === 'function') {
        pending = true;
        result.catch(error => { reaction = before.reaction; likes = before.likes; refresh(); p.onError?.(error); }).finally(() => { pending = false; });
      }
    } catch (error) { reaction = before.reaction; likes = before.likes; refresh(); p.onError?.(error); }
  }
  for (const kind of ['like', 'dislike']) {
    const button = node('button', 'ivi-feedback-block__reaction ivi-text-regular-text-small');
    button.type = 'button';
    button.dataset.kind = kind;
    button.setAttribute('aria-label', kind === 'like' ? 'Нравится' : 'Не нравится');
    button.append(createIcon({name:kind,size:16}));
    if (kind === 'like') button.append(node('span','ivi-feedback-block__count'));
    button.addEventListener('click', () => react(kind));
    let pressStarted = 0, pressTimer;
    button.addEventListener('pointerdown', event => { if (event.button !== 0) return; clearTimeout(pressTimer); pressStarted = performance.now(); button.classList.add('is-pressed'); });
    const release = () => { clearTimeout(pressTimer); pressTimer = setTimeout(() => button.classList.remove('is-pressed'), Math.max(0, 140 - (performance.now() - pressStarted))); };
    for (const name of ['pointerup', 'pointercancel', 'pointerleave']) button.addEventListener(name, release);
    buttons[kind] = button;
    reactions.append(button);
  }
  refresh();
  footer.append(reactions);
  root.append(author, body, footer);
  body.addEventListener('pointerdown', event => { if (event.button === 0) root.classList.add('is-pressed'); });
  for (const name of ['pointerup', 'pointercancel', 'pointerleave']) body.addEventListener(name, () => root.classList.remove('is-pressed'));
  root.getReaction = () => reaction;
  return root;
}
