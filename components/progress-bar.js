import { createBlob } from './blob.js';
import { node } from './core.js';

const asset = name => new URL(`../assets/progress/${name}`, import.meta.url).href;
const clamp = value => Math.max(0, Math.min(1, Number(value) || 0));
export const progressBarDefaults = {
  width: 343,
  progress: .5,
  duration: 60,
  seekable: true,
  paused: false,
  loading: false,
};

export function createProgressBar(options = {}) {
  const p = { ...progressBarDefaults, ...options };
  const root = node('div', 'ivi-progress-bar');
  root.style.width = `${p.width}px`;
  root.setAttribute('role', 'slider');
  root.setAttribute('aria-label', 'Позиция момента');
  const track = node('span', 'ivi-progress-bar__track');
  const fill = node('span', 'ivi-progress-bar__fill');
  const thumb = createBlob();thumb.classList.add('ivi-progress-bar__thumb');
  const hit = node('div', 'ivi-progress-bar__hit');
  root.append(track, fill, thumb, hit);
  let value = clamp(p.progress), start = value, pointerId = null, dragging = false, seekable = Boolean(p.seekable);
  function paint() {
    const x = `calc(${value * 100}% + ${4 - 8 * value}px)`;
    fill.style.width = x;
    thumb.style.left = x;
    root.dataset.position = value >= 1 ? 'Ended' : 'In progress';
    root.setAttribute('aria-valuenow', String(Math.round(value * 100)));
    root.setAttribute('aria-valuetext', `${Math.round(value * Number(p.duration || 0))} секунд`);
    root.setAttribute('aria-disabled', String(!seekable));
  }
  function position(clientX) {
    const box = root.getBoundingClientRect();
    return clamp((clientX - box.left - 4) / Math.max(1, box.width - 8));
  }
  function setDragging(next) {
    dragging = next;
    root.classList.toggle('is-dragging', next);
    thumb.setState(next ? 'Rewinding' : 'Default');
  }
  hit.addEventListener('pointerdown', event => {
    if (!seekable || event.button !== 0) return;
    pointerId = event.pointerId;
    start = value;
    hit.setPointerCapture(pointerId);
    const box = thumb.getBoundingClientRect();
    setDragging(event.clientX >= box.left - 12 && event.clientX <= box.right + 12);
    value = position(event.clientX);
    paint();
    p.onSeekStart?.({ progress: start, paused: p.paused });
    p.onSeekPreview?.(value);
  });
  hit.addEventListener('pointermove', event => {
    if (pointerId !== event.pointerId) return;
    if (!dragging) setDragging(true);
    value = position(event.clientX);
    paint();
    p.onSeekPreview?.(value);
  });
  hit.addEventListener('pointerup', event => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    value = position(event.clientX);
    paint();
    setDragging(false);
    p.onSeek?.({ progress: value, seconds: value * Number(p.duration || 0), paused: p.paused });
  });
  hit.addEventListener('pointercancel', event => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    value = start;
    paint();
    setDragging(false);
    p.onSeekCancel?.({ progress: start, paused: p.paused });
  });
  hit.addEventListener('lostpointercapture', () => {
    if (pointerId === null) return;
    pointerId = null;
    value = start;
    paint();
    setDragging(false);
    p.onSeekCancel?.({ progress: start, paused: p.paused });
  });
  root.setProgress = next => { if (pointerId === null) { value = clamp(next); paint(); } };
  root.getProgress = () => value;
  root.setSeekable = next => { seekable = Boolean(next); hit.style.pointerEvents = seekable ? '' : 'none'; paint(); };
  root.setRewinding = next => { if (pointerId === null) setDragging(Boolean(next)); };
  root.setSeekable(seekable);
  return root;
}
