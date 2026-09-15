(() => {
  const current = +document.body.dataset.lab;
  const list = window.LAB_CATALOG;
  const at = list.findIndex(lab => lab.id === current);
  const nav = document.createElement('nav'); nav.className='lab-navigation';nav.setAttribute('aria-label','LAB間の移動');
  const link = (label, href) => {const a=document.createElement('a');a.textContent=label;a.href=href;nav.append(a);};
  if(at>0)link('← '+String(list[at-1].id).padStart(2,'0')+' '+list[at-1].title,list[at-1].href);
  link('ラボ一覧','index.html');
  if(at<list.length-1)link(String(list[at+1].id).padStart(2,'0')+' '+list[at+1].title+' →',list[at+1].href);
  else link(current===18?'全LABの一覧へ →':current>=15?'自律神経編の一覧・次のLAB →':'基礎編のまとめ・次のLAB →','index.html#next-labs');
  document.querySelector('.wrap').append(nav);
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
