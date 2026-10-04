import {createButton} from './components/button.js';
import {createTitleDescription} from './components/title-description.js';
import {createFriendRate} from './components/friend-rate.js';
import {createFeedbackSummary,feedbackSummaryDefaults} from './components/feedback-summary.js';
const $=selector=>document.querySelector(selector);
const descriptions={mood:{type:'AI',prefix:'Аналитик ФБР ищет маньяка, который оказывается ближе, чем кажется. Мрачный детектив с тревогой в каждом разговоре — ',personalized:'в твоём вкусе'},similar:{type:'AI',prefix:'Аналитик ФБР ищет маньяка, который оказывается ближе, чем кажется. Если тебя увлёк «Настоящий детектив», ',personalized:'здесь тоже есть сложные герои и мрачное расследование'},actor:{type:'AI',prefix:'Аналитик ФБР ищет маньяка, который оказывается ближе, чем кажется. В роли обаятельного психиатра — ',personalized:'Мадс Миккельсен, который тебе нравится'},none:{type:'Default'}};
const signals=[['mood','атмосфера'],['similar','похожая история'],['actor','актёр']];
function drawDescription(){
 const ranked=signals.map(([key,label])=>{const input=$(`#confidence-${key}`);input.nextElementSibling.value=`${input.value}%`;return{key,label,value:Number(input.value)};}).sort((a,b)=>b.value-a.value);
 const best=ranked[0],key=best.value>50?best.key:'none';
 $('#description-demo').replaceChildren(createTitleDescription({...descriptions[key],width:$('#description-demo').clientWidth}));
 $('#description-note').textContent=key==='none'?'Ни один признак не выше 50% → обычное описание':`Выбран признак «${best.label}»: ${best.value}% — наибольшая уверенность.`;
}
signals.forEach(([key])=>$(`#confidence-${key}`).addEventListener('input',drawDescription));
$('#low-confidence').addEventListener('click',()=>{signals.forEach(([key],i)=>{$(`#confidence-${key}`).value=[40,30,20][i];});drawDescription();});
function drawFriend(){const score=Number($('#friend-score').value);$('#friend-demo').replaceChildren(createFriendRate({score}));$('#score-output').value=score;}
$('#friend-score').addEventListener('input',drawFriend);
let summary;
function drawSummary(stream=false){const personalized=$('#summary-personalized').checked;summary?.destroy();summary=createFeedbackSummary({width:$('#summary-demo').clientWidth,stream,personalized,letterDelay:14});$('#summary-demo').replaceChildren(summary);if(stream){summary.appendText(personalized?feedbackSummaryDefaults.personalizedText:feedbackSummaryDefaults.generalText);summary.finish();}}
$('#replay-summary').addEventListener('click',()=>drawSummary(true));
$('#summary-personalized').addEventListener('change',()=>drawSummary());
function drawButton(){
 const state=$('#button-state').value;
 $('#button-response').textContent=state==='Disabled'?'Кнопка недоступна':state==='Pressed'?'Состояние во время нажатия':'Нажми и удерживай кнопку';
 $('#button-demo').replaceChildren(createButton({type:$('#button-type').value,state,width:Math.min(280,$('#button-demo').parentElement.clientWidth-48),caption:false,onPress:()=>{$('#button-response').textContent='Нажатие сработало';}}));
}
$('#button-type').addEventListener('change',drawButton);
$('#button-state').addEventListener('change',drawButton);
drawButton();
drawDescription();drawFriend();drawSummary();
let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{drawDescription();drawSummary();drawButton();},150);});
const frame=document.querySelector('iframe');
let frameVisible=false;
const pausedVideos=new Set();
function updateFramePlayback(){
 const doc=frame.contentDocument;if(!doc)return;
 if(!frameVisible){doc.querySelectorAll('#screen-stack video').forEach(video=>{if(!video.paused){pausedVideos.add(video);video.pause();}});}
 else{pausedVideos.forEach(video=>{if(video.isConnected)video.play().catch(()=>{});});pausedVideos.clear();}
}
frame.addEventListener('load',updateFramePlayback);
new IntersectionObserver(entries=>{frameVisible=entries[0].isIntersecting;updateFramePlayback();},{threshold:0}).observe(frame);
const comparisonVideos=[...document.querySelectorAll('.media-pair video')];
const visibleVideos=new Set();
const mediaObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
 const video=entry.target;video.muted=true;
 if(entry.isIntersecting){visibleVideos.add(video);video.play().catch(()=>{});}
 else{visibleVideos.delete(video);video.pause();}
}),{threshold:.15});
comparisonVideos.forEach(video=>{video.muted=true;video.defaultMuted=true;mediaObserver.observe(video);});
document.addEventListener('visibilitychange',()=>comparisonVideos.forEach(video=>{if(document.hidden)video.pause();else if(visibleVideos.has(video))video.play().catch(()=>{});}));
