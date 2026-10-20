const section=document.querySelector('.fbadges');
if(section){
 const clip=section.querySelector('.fbadges-clip'),track=section.querySelector('.fbadges-track'),toggle=section.querySelector('.fbadges-toggle');
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const items=[...track.children];
  for(const item of items){const copy=item.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.setAttribute('tabindex','-1');copy.dataset.duplicate='';track.append(copy)}
  clip.classList.add('is-moving');
 }
 toggle.addEventListener('click',()=>{const paused=section.classList.toggle('is-paused');toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'Resume scrolling':'Pause scrolling'});
}
