// Opt-in instrumentation: ?video-debug=1. No effect in the normal prototype.
const observed=new WeakSet();
function inspect(){
 for(const video of document.querySelectorAll('.phone-layer video')){
  if(observed.has(video))continue;observed.add(video);
  const start=performance.now(),events=[],frames=[];
  const report=()=>video.dataset.startupTrace=JSON.stringify({events,frames});
  for(const name of ['play','playing','waiting','seeking','seeked','loadeddata','pause','stalled'])video.addEventListener(name,()=>{events.push([name,Math.round(performance.now()-start),Math.round(video.currentTime*1000),video.readyState]);report();});
  const frame=(now,meta)=>{frames.push([Math.round(now-start),Math.round(meta.mediaTime*1000)]);report();if(now-start<2500)video.requestVideoFrameCallback(frame);};
  video.requestVideoFrameCallback?.(frame);report();
 }
}
new MutationObserver(inspect).observe(document.body,{childList:true,subtree:true});inspect();
