import { node } from './core.js';
import { createIconButton } from './button.js';
const asset=name=>new URL(`../assets/cover/${name}`,import.meta.url).href;
export const headerDefaults={width:375,mediaType:'Trailer',trailerImage:asset('trailer.png'),posterImage:asset('poster.png'),videoSrc:'',title:'Ганнибал'};
export function createContentPageHeader(options={}) {
 const p={...headerDefaults,...options};
  const header = node('div', 'ivi-content-cover__header');
  const image = node('img', 'ivi-content-cover__image');
  const stillImage = p.mediaType === 'Poster' ? p.posterImage : p.trailerImage;
  if (stillImage) image.src = stillImage;
  else image.hidden = true;
  image.alt = '';
  const shade = node('div', 'ivi-content-cover__shade');
  const blur=node('div','ivi-content-cover__blur');
  for(let i=0;i<8;i++){const layer=node('span');const start=69.4654+(100-69.4654)*i/8,end=69.4654+(100-69.4654)*(i+1)/8;const radius=Math.sqrt(Math.pow(10*(i+1)/8,2)-Math.pow(10*i/8,2));layer.style.backdropFilter=`blur(${radius}px)`;layer.style.maskImage=`linear-gradient(to bottom,transparent ${start}%,#000 ${end}%)`;blur.append(layer);}
  header.append(image, blur, shade);
  let video;
  let observer;
  let visible = false;
  let muted = true;
  let suspended = false;
  let destroyed = false, hasFrame = false, frameRequest = null, frameGeneration = 0;
  const events = new AbortController();
  function cancelFrame() {
    frameGeneration++;
    if (frameRequest !== null) video?.cancelVideoFrameCallback?.(frameRequest);
    frameRequest = null;
  }
  function waitForPreview(resetFrame = false) {
    if (!video || destroyed) return;
    cancelFrame();
    if (resetFrame) { hasFrame = false; video.style.opacity = '0'; }
  }
  function previewReady() {
    if (!video || destroyed || video.readyState < 2 || video.seeking || frameRequest !== null) return;
    const activeVideo = video, generation = frameGeneration;
    const showFrame = () => {
      if (destroyed || video !== activeVideo || generation !== frameGeneration || activeVideo.seeking) return;
      frameRequest = null; hasFrame = true;
      if (visible && !suspended && !document.hidden) activeVideo.style.opacity = '1';
    };
    if (video.requestVideoFrameCallback) frameRequest = video.requestVideoFrameCallback(showFrame);
    else showFrame();
  }
  const mute = createIconButton({icon:'mute',label:'Включить звук',size:16,onPress:()=>{
    if(!video)return;muted=!muted;video.muted=muted;
    mute.setIcon(muted?'mute':'unmute',muted?'Включить звук':'Выключить звук');
    mute.setAttribute('aria-pressed',String(!muted));p.onMuteChange?.(muted);
  }});mute.classList.add('ivi-content-cover__mute');mute.setAttribute('aria-pressed','false');
  function stopPreview() { cancelFrame(); video?.pause(); }
  function suspendPreview() { suspended = true; stopPreview(); }
  function fallbackToPoster() {
    events.abort();
    stopPreview();
    observer?.disconnect();
    video?.remove();
    video = undefined;
    header.dataset.media = 'Poster';
    image.src = p.posterImage;
    image.hidden = false;
    mute.remove();
    header.querySelector('.ivi-content-cover__media-hit')?.remove();
  }
  if (p.mediaType === 'Trailer') {
    const hit = node('button', 'ivi-content-cover__media-hit');
    hit.type = 'button';
    hit.setAttribute('aria-label', 'Открыть трейлер');
    hit.addEventListener('click', () => { suspendPreview(); p.onOpenTrailer?.({ videoSrc: p.fullVideoSrc || p.videoSrc, imageSrc: image.src, title: p.title, card: header }); });
    header.append(hit);
    header.append(mute);
    if (p.videoSrc) {
      video = node('video', 'ivi-content-cover__video');
      // The poster stays underneath; reveal video only after a decoded frame.
      video.style.opacity = '0';
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      // Start muted playback without waiting for a percentage of the whole file.
      // Safari may limit preloading until playback has actually begun.
      video.addEventListener('canplay', () => { if (visible && !suspended && !document.hidden) video?.play().catch(() => {}); }, { signal: events.signal });
      for (const name of ['loadstart', 'emptied']) video.addEventListener(name, () => waitForPreview(true), { signal: events.signal });
      for (const name of ['waiting', 'seeking']) video.addEventListener(name, () => waitForPreview(), { signal: events.signal });
      for (const name of ['playing', 'seeked']) video.addEventListener(name, previewReady, { signal: events.signal });
      video.addEventListener('error', fallbackToPoster, { once: true, signal: events.signal });
      video.src = p.videoSrc;
      header.insertBefore(video, shade);
      observer = new IntersectionObserver(entries => {
        visible = entries[0].intersectionRatio >= .95;
        if (visible && !suspended && !document.hidden) { startPreview(); }
        else stopPreview();
      }, { threshold: [.95] });
      observer.observe(header);
      document.addEventListener('visibilitychange', visibilityChange);
    }
  }
  header.style.width=`${p.width}px`;header.dataset.media=p.mediaType;
  function startPreview() {
    if (!video) return;
    if (hasFrame) video.style.opacity = '1';
    video.play().catch(() => {});
  }
  header.pausePreview=suspendPreview;
  header.resumePreview=()=>{suspended=false;if(visible&&!document.hidden)startPreview();};
  function visibilityChange(){if(document.hidden)stopPreview();else if(visible&&!suspended&&header.isConnected)startPreview();}
  header.destroy=()=>{destroyed=true;cancelFrame();events.abort();observer?.disconnect();document.removeEventListener('visibilitychange',visibilityChange);stopPreview();};
  return header;
}
