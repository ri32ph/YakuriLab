(() => {
  const M=window.NEPHRON_MODEL,$=id=>document.getElementById(id);
  let stage=0,adh=1,track='na',timer=null,running=false;
  const view=window.NephronSimulation.mount($('nephronView'),{onSegment:id=>{stop();stage=M.SEGMENTS.findIndex(s=>s.id===id);render();}});
  M.SEGMENTS.slice(0,-1).forEach((segment,index)=>{const b=document.createElement('button');b.type='button';b.textContent=segment.short;b.addEventListener('click',()=>{stop();stage=index;render();});$('segmentPicker').append(b)});
  function state(){return M.simulate({adh,drugClass:'none'})}
  function render(){const s=state(),current=s.stages[stage];view.render({stage,adh,track,running});$('adhOutput').textContent=adh?'ON':'OFF';$('adhMetric').textContent=adh?'ON':'OFF';$('urineVolume').textContent=s.urineVolume;$('urineConcentration').textContent=s.urineConcentration;$('nephronStatus').textContent=running?`${current.short}を観察中`:current.name;
    $('renalPrompt').textContent=current.id==='urine'?'尿になるのはどれ？':current.name;$('renalContext').textContent=current.id==='collecting'?(adh?'ADH ON：AQP2を介して水透過性が上がる方向です。':'ADH OFF：集合管の水再吸収が減り、尿量は増える方向です。'):current.detail;
    document.querySelectorAll('#segmentPicker button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===stage)));
  }
  function stop(){if(timer)clearInterval(timer);timer=null;running=false;render()}
  function start(){if(timer)clearInterval(timer);stage=0;running=true;render();timer=setInterval(()=>{if(stage>=M.SEGMENTS.length-1){stop();return}stage++;render()},900)}
  $('startNephron').addEventListener('click',start);$('pauseNephron').addEventListener('click',stop);$('resetNephron').addEventListener('click',()=>{stop();stage=0;adh=1;track='na';document.querySelectorAll('[data-adh]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.adh==='1')));document.querySelectorAll('[data-track]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.track==='na')));render()});
  document.querySelectorAll('[data-adh]').forEach(b=>b.addEventListener('click',()=>{adh=Number(b.dataset.adh);document.querySelectorAll('[data-adh]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()}));
  document.querySelectorAll('[data-track]').forEach(b=>b.addEventListener('click',()=>{track=b.dataset.track;document.querySelectorAll('[data-track]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()}));
  render();
})();
