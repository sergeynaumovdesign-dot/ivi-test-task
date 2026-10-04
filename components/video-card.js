import { node, pressable } from './core.js';

const preview = new URL('../assets/video/trailer-preview.png', import.meta.url).href;
export const videoCardDefaults = {
  width: 200,
  title: 'Трейлер 2 (русский язык)',
  duration: '1 мин',
  imageSrc: preview,
  videoSrc: '',
};

export function createVideoCard(options = {}) {
  const p = { ...videoCardDefaults, ...options };
  const root = node('button', 'ivi-video-card');
  root.type = 'button';
  root.style.width = `${p.width}px`;
  const visual = node('div', 'ivi-video-card__visual');
  const img = node('img', 'ivi-video-card__image');
  img.src = p.imageSrc || preview;
  img.alt = '';
  img.addEventListener('error', () => { img.src = preview; }, { once: true });
  visual.append(img);
  const title = node('span', 'ivi-video-card__title ivi-text-medium-text-small', p.title);
  const duration = node('span', 'ivi-video-card__duration ivi-text-regular-text-small', p.duration);
  root.append(visual, title, duration);
  pressable(root, {
    down: () => root.classList.add('is-pressed'),
    up: () => root.classList.remove('is-pressed'),
    activate: () => p.onOpen?.({ title: p.title, imageSrc: img.src, videoSrc: p.videoSrc, startAt: 0 }),
  });
  return root;
}
