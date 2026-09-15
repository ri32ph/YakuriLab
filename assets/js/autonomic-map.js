(() => {
  'use strict';
  const model = window.AUTONOMIC_MAP;
  const $ = id => document.getElementById(id);
  const map = $('bodyMap');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let mode = 'baseline', selected = 'heart', paused = preference.matches;
  const buttons = new Map();
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  model.organs.forEach(organ => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'organ-button'; button.dataset.organ = organ.id;
    button.setAttribute('aria-controls', 'organDetail');
    const title = document.createElement('strong'); title.textContent = organ.title;
    const effect = document.createElement('span'); effect.className = 'effect';
    const receptor = document.createElement('span'); receptor.className = 'receptor-tag'; receptor.textContent = organ.receptors;
    button.append(title, effect, receptor);
    button.addEventListener('click', () => { selected = organ.id; renderDetail(); $('organDetail').focus({preventScroll:true}); $('organDetail').scrollIntoView({block:'nearest',behavior:'instant'}); });
    $('organButtons').append(button); buttons.set(organ.id, {button,effect,receptor});
  });
  // Transparent HTML hit targets let touch/keyboard users select the organ itself.
  const locations = {pupil:[44,6,12,8],saliva:[42,12,17,7],heart:[48,32,10,9],bronchi:[46,23,9,9],vessels:[38,40,8,12],gut:[44,49,14,13],bladder:[44,63,12,10]};
  model.organs.forEach(organ => {
    const hit = document.createElement('button'); hit.type='button'; hit.className='organ-hit'; hit.setAttribute('aria-label',organ.title+'：なぜこの変化が起きる？'); hit.setAttribute('aria-controls','organDetail');
    const [left,top,width,height]=locations[organ.id]; Object.assign(hit.style,{left:left+'%',top:top+'%',width:width+'%',height:height+'%'});
    hit.addEventListener('click',()=>buttons.get(organ.id).button.click()); $('organButtons').append(hit);
  });
  function renderDetail() {
    const organ = model.organs.find(o => o.id === selected), state = model.modes[mode];
    $('detailTitle').textContent = organ.title;
    $('detailEffect').textContent = state.labels[selected];
    $('detailNote').textContent = state.notes[selected];
    $('detailReceptor').textContent = '受容体：'+organ.receptors;
    $('detailWhy').textContent = organ.why;
    $('detailLinks').replaceChildren();
    organ.labs.forEach(key => {
      const lab = window.LAB_CATALOG.find(l => l.key === key);
      if (!lab) return;
      const a = document.createElement('a'); a.href = lab.href;
      a.textContent = 'LAB '+(lab.label || String(lab.id).padStart(2,'0'))+'｜'+lab.title+' →'; $('detailLinks').append(a);
    });
    buttons.forEach(({button},id)=>button.setAttribute('aria-pressed',String(id===selected)));
  }
  function renderMotion() {
    map.dataset.motion = paused ? 'paused' : 'running';
    $('mapMotion').textContent = paused ? 'アニメーションを開始' : 'アニメーションを停止';
    $('mapMotion').setAttribute('aria-pressed',String(!paused));
    $('motionNote').textContent = paused ? '動きは停止中です。臓器の大きさとラベルで比較できます。「開始」で拍動などを動かせます。' : '心臓の拍動・唾液の水滴・胃腸の蠕動を表示中です。';
  }
  function render() {
    const state=model.modes[mode], v=state.visual;
    map.dataset.mode=mode;
    $('mapStatus').textContent=state.title;
    $('modeContext').textContent = mode==='baseline' ? '各臓器は基準の状態です。神経の働きがゼロという意味ではありません。' : mode==='sym-up' ? '活動・緊張時に優位になる代表的な反応。すべての臓器の活動が上がるわけではありません。' : mode==='para-up' ? '休息・消化などに関わる代表的な反応。全身の血管が広く拡張するわけではありません。' : '選んだ神経がもともと担っている作用を弱めます。もう一方の神経を刺激する操作とは異なります。';
    modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    buttons.forEach(({button,effect,receptor},id)=>{effect.textContent=state.labels[id];receptor.hidden=!$('showReceptors').checked;button.setAttribute('aria-label',model.organs.find(o=>o.id===id).title+'：'+state.labels[id]+'。理由を表示');});
    document.querySelectorAll('.map-pupil').forEach(el=>el.setAttribute('r',v.pupil));
    $('airwayLine').setAttribute('stroke-width',String(v.airway*.55));
    $('vesselLumen').setAttribute('r',v.vessel);
    $('mapBladder').setAttribute('transform','scale('+v.bladder+')');
    $('urineFlow').style.display=v.voiding ? '' : 'none';
    map.style.setProperty('--beat',v.beat+'s'); map.style.setProperty('--strength',v.strength);
    map.style.setProperty('--saliva',v.saliva+'s');map.style.setProperty('--gut',v.gut+'s');
    renderDetail(); renderMotion();
  }
  modeButtons.forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;render();}));
  $('mapReset').addEventListener('click',()=>{mode='baseline';selected='heart';$('showReceptors').checked=false;paused=preference.matches;render();});
  $('showReceptors').addEventListener('change',render);
  $('mapMotion').addEventListener('click',()=>{paused=!paused;renderMotion();});
  preference.addEventListener('change',event=>{paused=event.matches;renderMotion();});
  render();
})();
