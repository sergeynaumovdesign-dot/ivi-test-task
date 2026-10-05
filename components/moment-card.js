import {pressable} from './core.js';

const defaultImage = new URL('../assets/moment-card.png', import.meta.url).href;
const visibleVideos = new Set();
let activeVideo = null;
function refreshPreview() {
  if (activeVideo && (!visibleVideos.has(activeVideo) || document.hidden)) {
    activeVideo.pause();
    activeVideo = null;
  }
  if (document.hidden || activeVideo) return;
  const next = visibleVideos.values().next().value;
  if (!next) return;
  activeVideo = next;
  next.play().catch(() => { next.classList.remove('is-playing'); if(activeVideo===next)activeVideo=null; });
}
export const momentCardDefaults = {
  title: 'Как думает убийца',
  imageSrc: defaultImage,
  preview: 'Photo',
  videoSrc: '',
  state: 'Default',
};

export function createMomentCard(options = {}) {
  const props = { ...momentCardDefaults, ...options };
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'ivi-moment-card';
  card.dataset.state = props.state;
  card.setAttribute('aria-label', `Открыть момент: ${props.title}`);

  const photo = document.createElement('img');
  photo.className = 'ivi-moment-card__photo';
  photo.src = props.imageSrc || defaultImage;
  photo.alt = '';
  const shade = document.createElement('span');
  shade.className = 'ivi-moment-card__shade';
  const title = document.createElement('span');
  title.className = 'ivi-moment-card__title ivi-text-regular-text-small';
  title.textContent = props.title;
  const visual = document.createElement('span');
  visual.className = 'ivi-moment-card__visual';
  visual.append(photo);
  card.append(visual);

  let video, observer;
  let fullyVisible = false, opened = false;
  const videoEnabled = props.preview === 'Video' && Boolean(props.videoSrc);
  if (videoEnabled) {
    video = document.createElement('video');
    video.className = 'ivi-moment-card__video';
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = props.videoSrc;
    video.addEventListener('playing', () => video.classList.add('is-playing'));
    video.addEventListener('pause', () => video.classList.remove('is-playing'));
    video.addEventListener('error', () => { video.classList.remove('is-playing'); video.pause(); });
    visual.append(video);
    const onVisibility = refreshPreview;
    observer = new IntersectionObserver(entries => {
      fullyVisible = entries[0]?.intersectionRatio >= .999;
      if (fullyVisible && !opened) visibleVideos.add(video);
      else visibleVideos.delete(video);
      refreshPreview();
    }, { threshold: [0, 1] });
    observer.observe(card);
    document.addEventListener('visibilitychange', onVisibility);
    card.resumePreview = () => { opened = false; if(fullyVisible)visibleVideos.add(video); refreshPreview(); };
    card.destroy = () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); visibleVideos.delete(video); video.pause(); if(activeVideo===video)activeVideo=null; refreshPreview(); };
  } else {
    card.destroy = () => {};
    card.resumePreview = () => {};
  }
  card.append(shade, title);
  pressable(card, {
    down: () => { card.dataset.state = 'Pressed'; },
    up: () => { card.dataset.state = props.state; },
    activate: () => { if(video){opened=true;visibleVideos.delete(video);video.pause();if(activeVideo===video)activeVideo=null;}props.onOpen?.({ title: props.title, imageSrc: photo.src, videoSrc: props.videoSrc, card }); },
  });
  return card;
}
