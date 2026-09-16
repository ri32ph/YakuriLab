(() => {
 const $=s=>document.querySelector(s),M=window.RHYTHM_MODEL,V=window.CARDIAC_ELECTRICAL_VIEW,engine=M.create(),heart=V.mountHeart($('#electricalHeart')),ecg=V.mountECG($('#ecgView')),ap=V.mountAP($('#cellAP'));
 let mode='normal',drug='none',weak=0,cell='ventricle',running=false,started=false,last=performance.now(),accumulator=0,s=engine.snapshot();
 const read=()=>({speed:+$('#sinusSpeed').value,av:+$('#avSpeed').value,weak,drug,mode});
 const explanations={normal:'正常な洞結節からの刺激生成・伝導。まず1周を見て、電気と収縮の順序を確かめよう。',reentry:'電気が回り込んで、回復した組織を再び興奮させる例。右の模式回路もSTARTと同期して進みます。特定の不整脈の回路を再現する図ではありません。',af:'心房は橙、心室は青。心房の有効な収縮がなくなり、P波は規則的に現れません。AV結節を通る一部の刺激によるQRSは不規則です。',vt:'心室を起点とする速い興奮が続く例。正常の順序と異なり、充満・有効な拍出に影響し得ます。薬の効果を予測するモードではありません。',vf:'心室の電気活動が無秩序となり、有効な拍出が失われる例。規則的なQRS・収縮としては描きません。薬の効果を予測するモードではありません。'};
 function controls(){
  $('#sinusValue').textContent=+$('#sinusSpeed').value===50?'標準':+$('#sinusSpeed').value<50?'遅い方向':'速い方向';$('#avValue').textContent=+$('#avSpeed').value===50?'標準':+$('#avSpeed').value<50?'遅い方向':'速い方向';
  $('#sinusSpeed').disabled=mode!=='normal';$('#avSpeed').disabled=!['normal','af'].includes(mode);$('#weaken').disabled=mode!=='normal';$('#ectopic').disabled=!started||mode!=='normal'||s.t>=46||s.ectopicPending;
  $('#weakState').textContent=['通常の伝導。操作ごとに「遅延 → 一部途絶 → 通常」と切り替わります。','AV伝導が遅れる条件：次の刺激からPRが延長する方向。','一部が途絶する条件：2回に1回、心室まで伝わらない例。細分類は示しません。'][weak];
  $('#pause').disabled=!started||s.t>=48;$('#pause').textContent=running?'一時停止':'再開';$('#step').disabled=running||s.t>=48;$('#runState').textContent=s.t>=48?'記録終了':running?'実験中':started?'一時停止':'待機中';$('#clock').textContent=`学習時間 ${s.t.toFixed(1)} / 48`;
  $('#modeExplanation').textContent=explanations[mode];document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  const drugAllowed=['normal','af'].includes(mode);document.querySelectorAll('[data-drug]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.drug===drug));b.disabled=!drugAllowed&&b.dataset.drug!=='none';});
  $('#drugExplanation').textContent=M.drugs[drug].text;$('#care').textContent=M.drugs[drug].care;$('#drugLimits').textContent=drugAllowed?'作用方向の比較です。薬効群内の差・用量・疾患による反応を予測せず、不整脈の消失も自動生成しません。':'このモードは病態観察用です。薬の作用方向は「正常な伝導に戻す」で比較してください。';
  $('#ventricleCell').setAttribute('aria-pressed',String(cell==='ventricle'));$('#nodeCell').setAttribute('aria-pressed',String(cell==='node'));
 }
 function render(){heart.render(s,started);ap.render(s,cell,started);$('#hrMetric').textContent=started?s.circulation.hr:'—';$('#svMetric').textContent=started?s.circulation.sv:'—';$('#coMetric').textContent=started?s.circulation.co:'—';$('#fillingNote').textContent=started?s.circulation.fill+'。HRだけでCOは決まりません。SVは一回拍出量です。':'速いほど拍出が増えるとは限りません。心室に血液を満たす時間も重要です。';controls();}
 function restart(run=false){running=run;started=run;accumulator=0;last=performance.now();s=engine.reset(read());ecg.reset();$('#ectopicNote').textContent='心室の別の場所から、予定外の刺激を1回入れます。';if(run)ecg.append(s);render();}
 function advance(dt=.025){started=true;s=engine.step(dt,read());ecg.append(s);if(s.t>=48)running=false;}
 $('#start').onclick=()=>restart(true);$('#pause').onclick=()=>{running=!running;last=performance.now();accumulator=0;render();};$('#step').onclick=()=>{if(!started){started=true;ecg.append(s);}for(let i=0;i<4&&s.t<48;i++)advance();render();};
 $('#reset').onclick=()=>{mode='normal';drug='none';weak=0;cell='ventricle';$('#sinusSpeed').value=$('#avSpeed').value=50;$('#settingsNote').textContent='時間・波形・作用量は学習用の模式表示です。';restart(false);};
 const changed=()=>{if(!started)s=engine.reset(read());$('#settingsNote').textContent=started?'変更は次の刺激から反映します。過去の波形は保ちます。':'現在の条件でSTARTを押してください。';render();};
 $('#sinusSpeed').addEventListener('input',changed);$('#avSpeed').addEventListener('input',changed);$('#weaken').onclick=()=>{weak=(weak+1)%3;changed();};
 $('#ectopic').onclick=()=>{if(engine.ectopic()){$('#ectopicNote').textContent='異所性刺激を予約しました。心室が再び興奮できる時期に1回発生します。';s=engine.snapshot();render();}};
 $('#zoom').onclick=()=>{$('#cellDetails').open=true;$('#cellDetails').scrollIntoView({behavior:'auto',block:'start'});};
 $('#ventricleCell').onclick=()=>{cell='ventricle';render();};$('#nodeCell').onclick=()=>{cell='node';render();};
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;drug='none';weak=0;$('#settingsNote').textContent='モードを切り替え、記録を消しました。STARTで観察を始めます。';restart(false);});
 for(const [id,d]of Object.entries(M.drugs)){const b=document.createElement('button');b.dataset.drug=id;b.textContent=d.name;b.onclick=()=>{drug=id;cell=['beta','ca'].includes(id)?'node':'ventricle';$('#cellDetails').open=true;changed();};$('#drugButtons').append(b);}
 // Fixed steps keep waveform history deterministic; suspended tabs never catch up in a burst.
 function frame(now){const dt=Math.min(.1,(now-last)/1000);last=now;if(running&&!document.hidden){accumulator+=dt;while(accumulator>=.025&&s.t<48){advance();accumulator-=.025;}render();}requestAnimationFrame(frame);}
 restart(false);requestAnimationFrame(frame);
})();
