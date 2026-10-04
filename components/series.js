import { node, pressable } from './core.js';
import { createButton } from './button.js';
import { createTextBlock, textBlockDefaults } from './text-block.js';

export const seriesDefaults = {
  width: 375,
  title: 'Аперитив',
  duration: '42 мин',
  durationSeconds: 2520,
  state: 'Default',
  progress: .32,
  releaseDate: '3 октября',
  locked: false,
  description: textBlockDefaults.text,
  showDescription: true,
  imageSrc: '',
  titleCoverSrc: '',
};

export function createSeriesPreview(options = {}) {
  const p = { ...seriesDefaults, ...options };
  const state = ['Default', 'Started', 'Viewed', 'Unreleased'].includes(p.state) ? p.state : 'Default';
  const root = node('div', 'ivi-series-preview');
  root.dataset.state = state;
  const imageSrc = p.imageSrc || p.titleCoverSrc;
  if (imageSrc) {
    const image = node('img', 'ivi-series-preview__image');
    image.src = imageSrc;
    image.alt = '';
    image.addEventListener('error', () => { image.remove(); }, { once: true });
    root.append(image);
  }
  if (state === 'Started') {
    const track = node('span', 'ivi-series-preview__track');
    const fill = node('span', 'ivi-series-preview__fill');
    fill.style.width = `${Math.max(0, Math.min(1, Number(p.progress) || 0)) * 100}%`;
    root.append(track, fill);
  } else if (state === 'Viewed') root.append(node('span', 'ivi-series-preview__label ivi-text-regular-caption', 'Просмотрено'));
  else if (state === 'Unreleased') root.append(node('span', 'ivi-series-preview__release ivi-text-medium-caption', p.releaseDate || 'Скоро'));
  return root;
}

export function createSeries(options = {}) {
  const p = { ...seriesDefaults, ...options };
  const root = node('article', 'ivi-series');
  root.style.width = `${p.width}px`;
  const resize = () => {
    const scale = Math.min(1, (root.clientWidth || p.width) / 375);
    root.style.setProperty('--series-preview-width', `${152 * scale}px`);
    root.style.setProperty('--series-preview-height', `${85 * scale}px`);
  };
  resize();
  const observer = new ResizeObserver(resize); observer.observe(root);
  const row = node('div', 'ivi-series__row');
  row.setAttribute('role', 'button');
  row.setAttribute('aria-label', `${p.title}, ${p.duration}`);
  const unavailable = p.state === 'Unreleased' || p.state === 'Unavailable' || p.locked;
  row.setAttribute('aria-disabled', String(unavailable));
  const preview = createSeriesPreview({ ...p, state: p.state === 'Unavailable' ? 'Default' : p.state });
  const details = node('div', 'ivi-series__details');
  const title = node('span', 'ivi-series__title ivi-text-medium-text-small', p.title);
  if (p.locked) {
    const lock = node('img', 'ivi-series__lock');
    lock.src = new URL('../assets/series/lock.svg', import.meta.url).href;
    lock.alt = '';
    title.prepend(lock);
  }
  details.append(title, node('span', 'ivi-series__duration ivi-text-regular-text-small', p.duration));
  const download = createButton({ type: 'Tertiary', size: 'Big', content: 'Icon', icon: 'download', iconWidth: 48, state: unavailable ? 'Disabled' : 'Default', onPress: event => { event.stopPropagation(); p.onDownload?.({ title: p.title }); } });
  download.classList.add('ivi-series__download');
  download.addEventListener('pointerdown', event => event.stopPropagation());
  row.append(preview, details, download);
  root.append(row);
  if (p.showDescription && p.description?.trim()) {
    const text = createTextBlock({ text: p.description, width: p.width, onExpand: p.onExpand });
    text.classList.add('ivi-series__description');
    root.append(text);
    root.destroy = () => { observer.disconnect(); text.destroy?.(); };
  }
  root.destroy ||= () => observer.disconnect();
  pressable(row, {
    down: () => { if (!unavailable) row.classList.add('is-pressed'); },
    up: () => row.classList.remove('is-pressed'),
    activate: () => {
      if (unavailable) { p.onUnavailable?.({ title: p.title, state: p.state }); return; }
      p.onWatch?.({ title: p.title, startAt: p.state === 'Started' ? Math.max(0, Number.isFinite(Number(p.resumeAt)) ? Number(p.resumeAt) : p.progress * p.durationSeconds) : 0 });
    },
  });
  return root;
}
