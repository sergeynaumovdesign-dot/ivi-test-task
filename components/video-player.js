import { node } from './core.js';
import { createButton } from './button.js';
import { createProgressBar } from './progress-bar.js';

const time = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

// A sample clip represents the episode in demo mode. Its clock is kept separate
// from the clip's timeline so continuation always shows the chosen episode offset.
export function createVideoPlayer(options = {}) {
  const p = { width: 375, title: '', episode: '', startAt: 0, durationSeconds: 2520, demo: true, muted: true, ...options };
  const root = node('section', 'ivi-video-player');
  let duration = Math.max(1, Number(p.durationSeconds) || 2520);
  let position = Math.max(0, Math.min(duration, Number(p.startAt) || 0));
  let playbackRequest = 0;
  let playing = true, seeking = false, destroyed = false, lastTick = performance.now();
  const abort = new AbortController();
  const media = node('div', 'ivi-video-player__media');
  const video = p.videoSrc ? node('video') : null;
  if (video) {
    video.src = p.videoSrc;
    video.playsInline = true;
    video.preload = 'auto';
    video.muted = p.muted;
    video.loop = p.demo;
    video.poster = p.imageSrc || '';
    media.append(video);
  } else if (p.imageSrc) {
    const image = node('img'); image.src = p.imageSrc; image.alt = ''; media.append(image);
  }
  const controls = node('div', 'ivi-video-player__controls');
  controls.append(node('h2', 'ivi-text-bold-h2', p.title));
  if (p.episode) controls.append(node('p', 'ivi-text-regular-text-small', p.episode));
  const timestamps = node('div', 'ivi-video-player__time ivi-text-regular-caption');
  const elapsed = node('span'), total = node('span'); timestamps.append(elapsed, total);
  const clamp = next => Math.max(0, Math.min(duration, Number(next) || 0));
  const progress = createProgressBar({ width: p.width - 32, duration, progress: position / duration,
    onSeekStart: () => { seeking = true; video?.pause(); },
    onSeekPreview: value => { elapsed.textContent = time(value * duration); },
    onSeek: ({ progress: value }) => { position = clamp(value * duration); seeking = false; if (video && !p.demo) video.currentTime = position; setPlaying(playing); paint(); },
    onSeekCancel: () => { seeking = false; setPlaying(playing); paint(); },
  });
  progress.setAttribute('aria-label', 'Позиция просмотра');
  progress.tabIndex = 0;
  progress.style.width = '100%';
  progress.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    position = clamp(event.key === 'Home' ? 0 : event.key === 'End' ? duration : position + (event.key === 'ArrowLeft' ? -10 : 10));
    if (video && !p.demo) video.currentTime = position;
    lastTick = performance.now(); paint();
  });
  const actions = node('div', 'ivi-video-player__actions');
  function paint() {
    root.dataset.playing = String(playing); root.dataset.position = String(position);
    if (!seeking) { elapsed.textContent = time(position); progress.setProgress(position / duration); }
    total.textContent = time(duration);
    progress.setAttribute('aria-valuetext', `${time(position)} из ${time(duration)}`);
  }
  function setPlaying(next) {
    if (destroyed) return;
    playing = Boolean(next);
    if (playing && position >= duration) { position = 0; if (video && !p.demo) video.currentTime = 0; }
    lastTick = performance.now();
    const request = ++playbackRequest;
    if (video) { if (playing && !seeking) video.play().catch(() => { if (!destroyed && request === playbackRequest) setPlaying(false); }); else video.pause(); }
    actions.replaceChildren(createButton({ size: 'Small', type: 'Secondary', caption: false, label: playing ? 'Пауза' : 'Продолжить', onPress: () => setPlaying(!playing) }));
    paint();
  }
  controls.append(timestamps, progress, actions);
  root.append(media, controls);
  video?.addEventListener('loadedmetadata', () => {
    if (!p.demo && Number.isFinite(video.duration)) { duration = video.duration; position = clamp(p.startAt); video.currentTime = position; }
    paint();
  }, { signal: abort.signal });
  video?.addEventListener('error', () => { setPlaying(false); controls.append(node('p', 'ivi-video-player__note', 'Не удалось загрузить видео')); }, { signal: abort.signal });
  video?.addEventListener('ended', () => { if (!p.demo) { position = duration; setPlaying(false); } }, { signal: abort.signal });
  const timer = setInterval(() => {
    const now = performance.now();
    if (playing && !seeking && !document.hidden) {
      if (p.demo) { if (!video || (!video.paused && video.readyState >= 2)) position = clamp(position + (now - lastTick) / 1000); }
      else if (video) position = video.currentTime;
      if (position >= duration) setPlaying(false);
      paint();
    }
    lastTick = now;
  }, 100);
  document.addEventListener('visibilitychange', () => { if (document.hidden) setPlaying(false); }, { signal: abort.signal });
  root.setPlaying = setPlaying;
  root.getPosition = () => position;
  root.destroy = () => { destroyed = true; clearInterval(timer); abort.abort(); video?.pause(); video?.removeAttribute('src'); video?.load(); };
  setPlaying(true);
  return root;
}
