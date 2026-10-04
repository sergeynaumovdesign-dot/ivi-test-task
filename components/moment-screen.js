import { createPoster } from './poster.js';
import { node, pressable } from './core.js';
import { createButton } from './button.js';
import { createProgressBar } from './progress-bar.js';

const asset = name => new URL(`../assets/moment-screen/${name}`, import.meta.url).href;
export const momentSwipeEasing = 'cubic-bezier(.25,.1,.25,1)';
export const momentSwipeDuration = (remaining, height) => Math.max(140, Math.min(240, 140 + Math.abs(remaining) / height * 100));
export const momentScreenDefaults = {
  width: 375,
  height: 812,
  state: 'Default',
  title: 'Как думает убийца',
  contentTitle: 'Ганнибал',
  episode: 'Сезон 1 серия 1',
  continuationTime: '04:11',
  continuationSeconds: 251,
  imageSrc: asset('raw-1.png'),
  posterSrc: asset('raw-3.png'),
  videoSrc: '',
  duration: 24,
  progress: .5,
  likes: 312,
  liked: false,
  saved: false,
  muted: false,
  moments: null,
  momentIndex: 0,
  autoplay: true,
  demoPlayback: false,
};

export function createMomentBottomSide(options = {}) {
  const p = { ...momentScreenDefaults, ...options };
  const root = node('div', 'ivi-moment-bottom');
  let currentTitle = p.title;
  const title = node('div', 'ivi-moment-bottom__name ivi-text-regular-text-small', currentTitle);
  title.classList.toggle('is-two-lines', Array.from(currentTitle).length > 32);
  const progress = createProgressBar({ width: p.width - 24, progress: p.progress, duration: p.duration, seekable: p.state !== 'Error', onSeek: p.onSeek, onSeekStart: p.onSeekStart, onSeekPreview: p.onSeekPreview, onSeekCancel: p.onSeekCancel });
  const content = node('div', 'ivi-moment-bottom__content');
  const open = node('button', 'ivi-moment-bottom__open');
  open.type = 'button';
  open.setAttribute('aria-label', `Открыть ${p.contentTitle}`);
  const poster = createPoster({ imageSrc:p.posterSrc, width:39, height:60, radius:8 });
  poster.classList.add('ivi-moment-bottom__poster');
  const names = node('span', 'ivi-moment-bottom__titles');
  names.append(node('strong', 'ivi-text-medium-text-small', p.contentTitle), node('span', 'ivi-text-regular-text-small', p.episode));
  open.append(poster, names);
  pressable(open, { down: () => open.classList.add('is-pressed'), up: () => open.classList.remove('is-pressed'), activate: () => p.onOpenTitle?.() });
  let saved = Boolean(p.saved), save;
  const drawSave = () => {
    const next = createButton({ type: 'Transparent', size: 'Big', content: 'Icon', icon: saved ? 'bookmark-fill' : 'bookmark', iconColor: saved ? 'var(--ivi-action-primary-default)' : '#fff', onPress: () => { saved = !saved; drawSave(); p.onSaveChange?.(saved); } });
    next.classList.add('ivi-moment-bottom__save');
    if (save) save.replaceWith(next);
    else content.append(next);
    save = next;
  };
  content.append(open);
  drawSave();
  root.append(title, progress, content);
  root.setProgress = value => progress.setProgress(value);
  root.setSaved = value => { saved = Boolean(value); drawSave(); };
  root.setRewinding = (active, value, duration) => {
    title.classList.toggle('is-rewinding', Boolean(active));
    progress.setRewinding(active);
    if (!active) { title.textContent = currentTitle; return; }
    const time = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
    title.replaceChildren(node('span', '', time(value * duration)), node('span', 'ivi-moment-bottom__total', ` | ${time(duration)}`));
  };
  root.setMoment = data => {
    currentTitle = data.title;
    title.textContent = currentTitle;
    title.classList.toggle('is-two-lines', Array.from(currentTitle).length > 32);
    title.classList.remove('is-rewinding');
    names.querySelector('strong').textContent = data.contentTitle;
    names.querySelector('span').textContent = data.episode;
    poster.setSource(data.posterSrc);
    open.setAttribute('aria-label', `Открыть ${data.contentTitle}`);
    progress.setProgress(0);
  };
  return root;
}

export function createMomentScreen(options = {}) {
  const p = { ...momentScreenDefaults, ...options };
  const root = node('section', 'ivi-moment-screen');
  root.style.width = `${p.width}px`;
  root.style.height = `${p.height}px`;
  root.setAttribute('aria-label', 'Просмотр момента');
  const moments = (Array.isArray(p.moments) && p.moments.length ? p.moments : [p]).map(moment => ({ ...moment }));
  let index = Math.max(0, Math.min(moments.length - 1, p.momentIndex));
  let current = { ...p, ...moments[index] };
  let state = p.state, value = Math.max(0, Math.min(1, Number(current.progress) || 0));
  let liked = Boolean(current.liked), likes = Math.max(0, Number(current.likes) || 0), timer = null;
  const media = node('div', 'ivi-moment-screen__media');
  const shade = node('div', 'ivi-moment-screen__shade');
  const scrim = node('div', 'ivi-moment-screen__scrim');
  const hit = node('button', 'ivi-moment-screen__hit');
  hit.type = 'button';
  hit.setAttribute('aria-label', 'Пауза или воспроизведение');
  const center = node('div', 'ivi-moment-screen__center');
  const actions = node('div', 'ivi-moment-screen__actions');
  const bottom = createMomentBottomSide({ ...current, width: p.width, progress: value,
    onSeekStart: () => { rewindFrom = state; setState('Rewinding'); },
    onSeekPreview: next => bottom.setRewinding(true, next, Number(current.duration) || 0),
    onSeek: ({ progress: next }) => { value = next; if (video && Number.isFinite(video.duration)) video.currentTime = next * video.duration; setState(rewindFrom === 'Ended' && next < 1 ? 'Paused' : rewindFrom); p.onSeek?.(next); },
    onSeekCancel: () => setState(rewindFrom),
    onOpenTitle: () => { setState('Paused'); p.onOpenTitle?.(current); },
    onSaveChange: saved => {
      const titleId = current.contentId || current.contentTitle;
      moments.forEach(moment => { if ((moment.contentId || moment.contentTitle || p.contentTitle) === titleId) moment.saved = saved; });
      current.saved = saved;
      p.onSaveChange?.(saved, current);
    },
  });
  let video = null;
  let videoListeners = null;
  let borrowedVideo = false;
  let rewindFrom = 'Default';
  function drawMedia() {
    videoListeners?.abort();
    if (borrowedVideo && video) p.onReleaseVideo?.(video);
    media.replaceChildren();
    video = null;
    borrowedVideo = false;
    if (current.videoSrc) {
      borrowedVideo = Boolean(current.preparedVideo);
      video = current.preparedVideo || node('video', 'ivi-moment-screen__visual');
      if (borrowedVideo) p.onAcquireVideo?.(video);
      video.className = 'ivi-moment-screen__visual';
      if (video.src !== current.videoSrc) video.src = current.videoSrc;
      video.poster = current.imageSrc;
      video.playsInline = true;
      // Keep the still frame visible and audio silent until a decoded frame is painted.
      video.muted = true;
      video.defaultMuted = Boolean(p.muted);
      video.volume = 1;
      video.preload = 'auto';
      video.style.opacity = borrowedVideo && video.readyState >= 2 ? '1' : '0';
      videoListeners = new AbortController();
      const signal = videoListeners.signal;
      const activeVideo = video;
      const revealFrame = () => { if (video === activeVideo) { activeVideo.style.opacity = '1'; activeVideo.muted = Boolean(p.muted); } };
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(revealFrame);
      else video.addEventListener('playing', revealFrame, { once: true, signal });
      const poster = node('img', 'ivi-moment-screen__visual ivi-moment-screen__poster');
      poster.src = current.imageSrc;
      poster.alt = '';
      media.append(poster);
      video.addEventListener('timeupdate', () => { if (video.duration) { value = video.currentTime / video.duration; bottom.setProgress(value); } }, { signal });
      video.addEventListener('ended', () => setState('Ended'), { signal });
      video.addEventListener('waiting', () => { if (state === 'Default') setState('Loading'); }, { signal });
      video.addEventListener('playing', () => { if (state === 'Loading') setState('Default'); }, { signal });
      video.addEventListener('error', () => setState('Error'), { signal });
      media.append(video);
    } else {
      const image = node('img', 'ivi-moment-screen__visual');
      image.src = current.imageSrc;
      image.alt = '';
      image.addEventListener('error', () => setState('Error'), { once: true });
      media.append(image);
    }
  }
  function drawActions() {
    actions.replaceChildren();
    const like = createButton({ type: 'Transparent', size: 'Big', content: 'Icon', icon: liked ? 'heart-fill' : 'heart', iconColor: liked ? 'var(--ivi-action-primary-default)' : '#fff', textUnderIcon: true, iconText: String(likes), onPress: () => { liked = !liked; likes += liked ? 1 : -1; current.liked = liked; current.likes = likes; Object.assign(moments[index], { liked, likes }); drawActions(); p.onLikeChange?.(liked, current); } });
    const share = createButton({ type: 'Transparent', size: 'Big', content: 'Icon', icon: 'share-arrow', onPress: () => p.onShare?.(current) });
    actions.append(like, share);
  }
  function pauseTicker() { if (timer) clearInterval(timer); timer = null; video?.pause(); }
  function startTicker() {
    if (state !== 'Default') return;
    if (video) { video.play().catch(() => setState('Paused')); return; }
    if (!p.demoPlayback || timer) return;
    timer = setInterval(() => {
      if (!root.isConnected) { pauseTicker(); return; }
      value = Math.min(1, value + .1 / Math.max(1, Number(current.duration) || 24));
      bottom.setProgress(value);
      if (value >= 1) setState('Ended');
    }, 100);
  }
  function setState(next) {
    if (!['Default', 'Paused', 'Loading', 'Ended', 'Error', 'Rewinding'].includes(next)) return;
    if (state === next) return;
    state = next;
    root.dataset.state = state;
    bottom.setRewinding(next === 'Rewinding', value, Number(current.duration) || 0);
    if (next === 'Default') { if (root.isConnected) startTicker(); }
    else if (next === 'Loading') { if (timer) clearInterval(timer); timer = null; }
    else pauseTicker();
    center.replaceChildren();
    if (next === 'Paused') center.append(node('span', 'ivi-moment-screen__play'));
    if (next === 'Loading') center.append(node('span', 'ivi-moment-screen__spinner'));
    if (next === 'Ended') {
      value = 1; bottom.setProgress(1);
      const more = createButton({ type: 'Transparent', size: 'Big', content: 'Text', width: p.width - 24, label: 'Смотреть продолжение', caption: true, captionText: `${current.episode} | ${current.continuationTime}`, onPress: () => { pauseTicker(); p.onContinue?.({ ...current, seconds: current.continuationSeconds }); } });
      const repeat = createButton({ type: 'Transparent', size: 'Big', content: 'Text', label: 'Повторить момент', caption: false, width: p.width - 24, onPress: () => { value = 0; bottom.setProgress(0); if (video) video.currentTime = 0; setState('Default'); } });
      repeat.classList.add('ivi-moment-screen__repeat');
      center.append(more, repeat);
    }
    if (next === 'Error') {
      center.append(node('span', 'ivi-moment-screen__error ivi-text-medium-text-small', 'Не загрузилось. Попробуйте ещё раз'));
      center.append(createButton({ type: 'Secondary', size: 'Big', content: 'Text', label: 'Повторить', width: p.width - 32, caption: false, onPress: () => { p.onRetry?.(current); setState('Loading'); if (video) { video.load(); video.play().catch(() => setState('Error')); } else setTimeout(() => setState('Default'), 350); } }));
    }
    p.onStateChange?.(state);
  }
  function switchMoment(next) {
    cancelSwipeHint();
    if (next < 0) { p.onBackToTrailer?.(); return; }
    if (next >= moments.length) { root.classList.remove('is-bouncing'); void root.offsetWidth; root.classList.add('is-bouncing'); return; }
    pauseTicker(); index = next; current = { ...p, ...moments[index] }; value = 0; liked = Boolean(current.liked); likes = Number(current.likes) || 0;
    bottom.setMoment(current); bottom.setSaved(current.saved); drawMedia(); drawActions(); state = 'Paused'; setState('Default'); p.onMomentChange?.(index, current);
  }
  const page = node('div', 'ivi-moment-screen__page');
  let gesture = null, incoming = null, settling = false, settleTimer = null, handoffFrame = null, ignoreClick = false;
  let swipeHintAnimations = null;
  function clearIncoming() { incoming?.destroy(); incoming?.remove(); incoming = null; }
  function previewAt(next, direction) {
    clearIncoming();
    if (next < 0 || next >= moments.length) return;
    incoming = createMomentScreen({ ...p, ...moments[next], preparedVideo: null, videoSrc: '', width: p.width, height: p.height, progress: 0, state: 'Default', autoplay: false, moments: null,
      onStateChange: null, onMomentChange: null, onLikeChange: null, onSaveChange: null, onShare: null, onOpenTitle: null, onContinue: null });
    incoming.classList.add('ivi-moment-screen__incoming');
    incoming.style.transform = `translate3d(0,${direction * (root.clientHeight || p.height)}px,0)`;
    root.append(incoming);
  }
  function cancelSwipeHint() {
    if (!swipeHintAnimations) return;
    const animations = swipeHintAnimations;
    swipeHintAnimations = null;
    animations.forEach(animation => animation.cancel());
    clearIncoming();
  }
  function playSwipeHint() {
    if (swipeHintAnimations || gesture || settling || index >= moments.length - 1 || !root.isConnected || matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    previewAt(index + 1, -1);
    const height = root.clientHeight || p.height;
    const shift = 32;
    const rise = 320, hold = 1000, returnTime = 220;
    const duration = rise + hold + returnTime;
    const frames = (base) => [
      { transform: `translate3d(0,${base}px,0)`, offset: 0, easing: 'cubic-bezier(.2,.7,.2,1)' },
      { transform: `translate3d(0,${base-shift}px,0)`, offset: rise / duration },
      { transform: `translate3d(0,${base-shift}px,0)`, offset: (rise + hold) / duration, easing: 'cubic-bezier(.4,0,.6,1)' },
      { transform: `translate3d(0,${base}px,0)`, offset: 1 },
    ];
    const options = { duration };
    const animations = [page.animate(frames(0), options), incoming.animate(frames(height), options)];
    swipeHintAnimations = animations;
    Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (swipeHintAnimations !== animations) return;
      swipeHintAnimations = null;
      clearIncoming();
    });
    return true;
  }
  function setSlide(y) {
    const height = root.clientHeight || p.height;
    const distance = incoming ? Math.max(-height, Math.min(height, y)) : y * .22;
    page.style.transform = `translate3d(0,${distance}px,0)`;
    if (incoming) incoming.style.transform = `translate3d(0,${(gesture.direction < 0 ? height : -height) + distance}px,0)`;
  }
  function settle(commit, next, direction, boundaryBack = false) {
    if (settling) return;
    settling = true;
    const height = root.clientHeight || p.height;
    const start = new DOMMatrixReadOnly(getComputedStyle(page).transform).m42;
    const target = commit ? (direction < 0 ? -height : height) : 0;
    const duration = momentSwipeDuration(target - start, height);
    page.style.pointerEvents = 'none';
    // Resolve the drag position before enabling a transition. Without this read,
    // the browser can combine both writes and jump straight to the end position.
    void page.offsetHeight;
    page.style.transition = `transform ${duration}ms ${momentSwipeEasing}`;
    if (incoming) incoming.style.transition = `transform ${duration}ms ${momentSwipeEasing}`;
    const onEnd = event => { if (event.target === page && event.propertyName === 'transform') finish(); };
    const finish = () => {
      if (!settling) return;
      clearTimeout(settleTimer); settleTimer = null;
      page.removeEventListener('transitionend', onEnd);
      page.style.transition = 'none';
      page.style.transform = 'none';
      if (commit) {
        // The settled preview stays over the updated page for one paint, so
        // replacing the image and controls cannot flash between frames.
        switchMoment(next);
        handoffFrame = requestAnimationFrame(() => {
          handoffFrame = requestAnimationFrame(() => { clearIncoming(); handoffFrame = null; settling = false; page.style.pointerEvents = ''; });
        });
      } else { clearIncoming(); settling = false; page.style.pointerEvents = ''; }
      if (!commit && state === 'Default') startTicker();
      if (boundaryBack) p.onBackToTrailer?.();
    };
    page.addEventListener('transitionend', onEnd);
    settleTimer = setTimeout(finish, duration + 80);
    requestAnimationFrame(() => {
      if (!settling) return;
      page.style.transform = `translate3d(0,${target}px,0)`;
      if (incoming) incoming.style.transform = `translate3d(0,${commit ? 0 : (direction < 0 ? height : -height)}px,0)`;
    });
  }
  root.addEventListener('pointerdown', event => {
    cancelSwipeHint();
    if (settling || event.button !== 0 || event.target.closest('button:not(.ivi-moment-screen__hit),.ivi-progress-bar')) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, started: performance.now(), active: false, direction: 0, distance: 0 };
  });
  root.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId || settling) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.active && Math.abs(dy) > 4 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      gesture.active = true;
      pauseTicker();
      try { root.setPointerCapture(event.pointerId); } catch { /* Pointer ended between move and capture. */ }
    }
    if (!gesture.active) return;
    const direction = dy < 0 ? -1 : 1;
    if (direction !== gesture.direction) {
      if (gesture.boundary) { p.onBackGestureCancel?.(); gesture.boundary = false; }
      gesture.direction = direction;
      if (index === 0 && direction > 0 && p.onBackGestureStart) {
        clearIncoming();
        gesture.boundary = Boolean(p.onBackGestureStart());
      } else previewAt(index + (direction < 0 ? 1 : -1), direction);
    }
    gesture.distance = dy;
    if (gesture.boundary) { p.onBackGestureMove?.(Math.max(0, dy)); event.preventDefault(); }
    else setSlide(dy);
  });
  root.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const ended = gesture;
    if (!ended.active) { gesture = null; return; }
    if (!ended.boundary) setSlide(event.clientY - ended.y);
    gesture = null;
    ignoreClick = true;
    setTimeout(() => { ignoreClick = false; }, 0);
    const dy = event.clientY - ended.y;
    const enough = Math.abs(dy) > (root.clientHeight || p.height) * .18 || (Math.abs(dy) > 35 && Math.abs(dy) / Math.max(1, performance.now() - ended.started) > .65);
    if (ended.boundary) { p.onBackGestureEnd?.(Boolean(enough && dy > 0)); return; }
    const next = index + (ended.direction < 0 ? 1 : -1);
    settle(Boolean(incoming && enough), next, ended.direction, !incoming && next < 0 && enough);
  });
  root.addEventListener('pointercancel', () => {
    if (!gesture) return;
    const direction = gesture.direction;
    if (gesture.boundary) { p.onBackGestureCancel?.(); gesture = null; return; }
    gesture = null;
    if (direction) settle(false, index, direction);
  });
  hit.addEventListener('click', () => { if (ignoreClick) { ignoreClick = false; return; } if (state === 'Default') setState('Paused'); else if (state === 'Paused') setState('Default'); });
  const visibility = () => { if (document.hidden && state === 'Default') setState('Paused'); };
  document.addEventListener('visibilitychange', visibility);
  drawMedia(); drawActions();
  page.append(media, shade, scrim, hit, center, actions, bottom);
  root.append(page);
  root.dataset.state = state;
  const initial = state; state = ''; setState(initial);
  root.setState = setState;
  root.play = startTicker;
  root.getState = () => state;
  root.getMomentIndex = () => index;
  root.getMoments = () => moments.map(moment => ({ ...moment }));
  root.switchMoment = switchMoment;
  root.playSwipeHint = playSwipeHint;
  root.setMuted = muted => { p.muted = Boolean(muted); if (video) video.muted = p.muted; };
  root.destroy = () => { pauseTicker(); videoListeners?.abort(); if(borrowedVideo&&video)p.onReleaseVideo?.(video); clearTimeout(settleTimer); cancelAnimationFrame(handoffFrame); settling = false; cancelSwipeHint(); clearIncoming(); document.removeEventListener('visibilitychange', visibility); };
  if (p.autoplay && initial === 'Default') requestAnimationFrame(() => { if (root.isConnected) startTicker(); });
  return root;
}
