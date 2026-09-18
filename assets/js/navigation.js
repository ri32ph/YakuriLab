(() => {
  const current = document.body.dataset.lab;
  const list = window.LAB_CATALOG;
  const embedded = typeof location!=='undefined' && new URLSearchParams(location.search).get('embed') === '1';
  if(embedded){
    document.body.classList.add('embedded-lab');
    const style=document.createElement('style');
    style.textContent='.embedded-lab .lab-back,.embedded-lab .skip-link,.embedded-lab header,.embedded-lab .explain,.embedded-lab .model-note,.embedded-lab .lab-navigation{display:none!important}.embedded-lab .wrap{max-width:none;padding:8px}.embedded-lab main.sim{margin-top:0}.embedded-lab{background:#fff}';
    document.head.append(style);
  }
  const at = list.findIndex(lab => String(lab.id) === current);
  if(at>=0 && list[at].stableId)document.body.dataset.stableId=list[at].stableId;
  const nav = document.createElement('nav'); nav.className='lab-navigation';nav.setAttribute('aria-label','LAB間の移動');
  const link = (label, href) => {const a=document.createElement('a');a.textContent=label;a.href=href;nav.append(a);};
  if(at>0)link('← '+(list[at-1].label || String(list[at-1].id).padStart(2,'0'))+' '+list[at-1].title,list[at-1].href);
  link('ラボ一覧','index.html');
  if(at>=0 && at<list.length-1)link((list[at+1].label || String(list[at+1].id).padStart(2,'0'))+' '+list[at+1].title+' →',list[at+1].href);
  else if(current==='airway-resistance')link('41 気管支拡張薬（予定） →','index.html#roadmap');
  else if(current==='arrhythmia')link('36 ネフロンとNa⁺・水 →','pharmacology_lab_36_nephron.html');
  else if(['raas','antihypertensives','heart-failure','heart-failure-drugs','ischemic-heart-disease'].includes(current))link('次の循環LAB（予定）・一覧へ →','index.html#roadmap');
  else link(current==='18'?'全LABの一覧へ →':current>=15?'自律神経編の一覧・次のLAB →':'基礎編のまとめ・次のLAB →','index.html#next-labs');
  if(!embedded)document.querySelector('.wrap').append(nav);
  document.querySelectorAll('input,select').forEach(el=>{
    if(el.labels?.length)return;
    if(el.id==='emax'){el.setAttribute('aria-label','作動薬の種類');return;}
    const box=el.closest('.row') || el.parentElement;
    const label=box.querySelector('label') || box.previousElementSibling?.querySelector('label');
    if(label && el.id)label.htmlFor=el.id;
    else el.setAttribute('aria-label',el.id==='emax'?'作動薬の種類':el.id);
  });
  const toggle=document.querySelector('#metToggle');
  if(toggle){toggle.setAttribute('aria-label','代謝物を表示');if(!toggle.hasAttribute('aria-pressed'))toggle.setAttribute('aria-pressed','false');}
  document.querySelectorAll('.visual svg,.graph svg,.graphbox svg').forEach(svg=>{svg.setAttribute('role','img');svg.setAttribute('aria-label',svg.closest('.panel')?.querySelector('.pt,.panel-title')?.textContent || '薬理シミュレーション');});
})();
