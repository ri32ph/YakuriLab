(() => {
  const COLORS={airway:'#2f78a8',oropharynx:'#d95c5c',exhaled:'#8a6aa2',device:'#d59a30'};
  function mount(container){
    container.classList.add('inhaler-route');container.innerHTML=`<div class="device-shape" data-role="device"><i></i><b data-role="deviceLabel">pMDI</b></div><div class="route-arrow">→</div><div class="head-route"><div class="mouth">口腔</div><div class="pharynx">咽頭</div><div class="trachea">気管</div><div class="bronchi"><i></i><i></i><b>気管支</b></div></div><div class="particle-layer" data-role="particles"></div><div class="outcome-legend"><span><i style="background:${COLORS.oropharynx}"></i>口腔・咽頭</span><span><i style="background:${COLORS.airway}"></i>気道</span><span><i style="background:${COLORS.exhaled}"></i>呼気排出</span><span><i style="background:${COLORS.device}"></i>残留・損失</span></div>`;
    const q=r=>container.querySelector(`[data-role="${r}"]`);let timer=0;
    function particles(s){const keys=[];Object.entries(s.outcomes).forEach(([k,v])=>{for(let i=0;i<Math.max(1,Math.round(v/5));i++)keys.push(k)});return keys.sort(()=>.5-Math.random()).map((k,i)=>`<i class="particle ${k}" style="--i:${i};--y:${(i%5-2)*14}px;--color:${COLORS[k]}"></i>`).join('');}
    return {render(s){q('deviceLabel').textContent=s.deviceInfo.label;container.dataset.device=s.device;container.dataset.flow=s.flow<35?'low':s.flow>68?'high':'middle';},play(s){clearTimeout(timer);q('particles').innerHTML='';void q('particles').offsetWidth;q('particles').innerHTML=particles(s);container.classList.remove('playing');void container.offsetWidth;container.classList.add('playing');timer=setTimeout(()=>container.classList.remove('playing'),2600);},destroy(){clearTimeout(timer)}};
  }
  window.InhalerDepositionView=Object.freeze({mount});
})();
