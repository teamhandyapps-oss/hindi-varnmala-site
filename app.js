'use strict';
let data;
const getData=()=>data||(data=fetch('/data.json').then(r=>r.json()));
const status=document.querySelector('#audio-status');
let currentAudio,playToken=0;
function stop(){playToken++;currentAudio?.pause();if('speechSynthesis'in window)window.speechSynthesis.cancel();}
document.querySelector('#stop-sound')?.addEventListener('click',()=>{stop();status.textContent='Sound stopped.'});
document.querySelector('#sound-mode')?.addEventListener('change',()=>{stop();status.textContent='Select a letter to try this sound mode.'});
document.querySelectorAll('[data-letter]').forEach(btn=>btn.addEventListener('click',async()=>{
 stop();const token=playToken;document.querySelectorAll('.letter.selected').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');
 const mode=document.querySelector('#sound-mode').value,letter=btn.dataset.letter,word=btn.dataset.word;
 if(mode==='off'){status.textContent=`${letter} ${word}. Sound is off.`;return;}
 if(mode==='recorded'){
  try{const manifest=await fetch('/audio-manifest.json').then(r=>r.json());if(token!==playToken)return;const src=manifest[letter];if(!src||!src.startsWith('/audio/')){status.textContent=`Reviewed recording for ${letter} has not been added yet.`;return;}
   currentAudio=new Audio(src);await currentAudio.play();status.textContent=`Playing a reviewed recording for ${letter}.`;
  }catch{status.textContent='This recording could not be played. Try again or ask an adult to say the sound.';}return;
 }
 if(!('speechSynthesis'in window)){status.textContent='This browser does not offer speech. Please say the letter together.';return;}
 const voice=window.speechSynthesis.getVoices().find(v=>v.localService&&/^hi(?:[-_]|$)/i.test(v.lang));
 if(!voice){status.textContent='No local Hindi voice is available. No cloud voice will be used. Ask an adult to say the sound.';return;}
 const phrase=word?`${letter}। ${word}`:letter;const utterance=new SpeechSynthesisUtterance(phrase);utterance.lang='hi-IN';utterance.voice=voice;utterance.rate=.75;
 utterance.onerror=()=>{status.textContent='Device speech could not play. Ask an adult to say the sound.'};window.speechSynthesis.speak(utterance);status.textContent=`Device voice: ${letter} ${word}. Synthetic speech, not a recorded lesson.`;
}));
window.addEventListener('pagehide',stop);
const signs=[['','inherent अ'],['ा','आ'],['ि','इ'],['ी','ई'],['ु','उ'],['ू','ऊ'],['े','ए'],['ै','ऐ'],['ो','ओ'],['ौ','औ'],['ं','anusvar'],['ः','visarg']];
document.querySelector('#consonant')?.addEventListener('change',e=>{document.querySelectorAll('#bar-grid .syllable > span').forEach((el,i)=>{el.textContent=e.target.value+signs[i][0]})});
document.querySelector('#worksheet-letter')?.addEventListener('change',async e=>{const l=e.target.value,D=await getData();const item=[...D.swar,...D.vyanjan,...D.extra].find(x=>x[0]===l);document.querySelector('.practice-letter').replaceChildren(document.createTextNode(l+' '));const word=document.createElement('span');word.className='small hi';word.textContent=item?.[1]||'';document.querySelector('.practice-letter').append(word);document.querySelectorAll('.trace-row:not(.blank) span').forEach(el=>el.textContent=l)});
document.querySelector('#print-sheet')?.addEventListener('click',()=>window.print());
