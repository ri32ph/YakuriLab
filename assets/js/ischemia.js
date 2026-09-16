(() => {
 const $=s=>document.querySelector(s),M=window.ISCHEMIA_MODEL,view=window.CORONARY_HEART.mount($('#coronaryMap')),ids=['hr','contractility','narrowing','wall','oxygen'];
 let thrombus=false,drug='none',motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,running=false,tick=0,history=[],injury={burden:0,risk:false},everIschemia=false;
 const input=()=>Object.fromEntries([...ids.map(id=>[id,+$('#'+id).value]),['thrombus',thrombus],['drug',drug]]);
 const set=(values)=>{for(const [id,value]of Object.entries(values))$('#'+id).value=value;};
 function render(){
  const s=M.state(input());view.render(s,{motion});
  $('#hrValue').textContent=s.hr<35?'遅い方向':s.hr>35?'速い方向':'安静時';$('#contractilityValue').textContent=s.contractility<50?'弱い方向':s.contractility>50?'強い方向':'標準';$('#narrowingValue').textContent=s.narrowing>70?'通りにくい':s.narrowing>25?'予備能が小さい':'通りやすい';
  $('#condition').textContent=(thrombus?'血栓による急な冠血流低下の例。':s.narrowing>25?'冠血流を増やす余力が小さい条件。':'冠血流を増やす余力がある条件。')+' 運動・安静ボタンは冠動脈の条件を保ちます。';
  $('#symptoms').textContent=s.ischemia?'胸部の違和感や息切れなどにつながる可能性があります。':'今の条件では酸素供給が需要を満たしています。';
  $('#motion').textContent=motion?'拍動・血流を停止':'拍動・血流を開始';$('#motion').setAttribute('aria-pressed',String(motion));
  $('#drugPath').textContent=M.drugs[drug].path;$('#care').textContent=M.drugs[drug].care;
  const baseline=M.state({...input(),drug:'none'});$('#drugComparison').textContent=drug==='none'?'薬なしの状態です。':drug==='antiplatelet'?'需要・供給のバーは直ちに変えません。血栓形成を抑える作用点を表示しています。':`同じ条件の薬なしと比べ、需要は低下方向。${s.ischemia?'供給不足は残っています。':'このモデルでは供給が需要を満たしています。'}${baseline.ischemia&&!s.ischemia?' 臨床での症状消失や回復を保証する表示ではありません。':''}`;
  document.querySelectorAll('[data-drug]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.drug===drug)));
 }
 function historyRender(){
  for(const [key,id]of [['demand','demandLine'],['supply','supplyLine']])$('#'+id).setAttribute('points',history.map(p=>`${42+p.t/120*736},${140-Math.min(4.4,p[key])/4.4*128}`).join(' '));
  $('#clock').textContent=`学習時間 ${tick} / 120`;
  $('#record').textContent=tick===120?'記録終了':running?'記録を一時停止':history.length?'記録を再開':'記録を開始';$('#record').setAttribute('aria-pressed',String(running));$('#record').disabled=tick===120;$('#step').disabled=running||tick===120;
  $('#injury').textContent=!history.length?'記録を始めると、酸素不足の持続と心筋機能への影響を観察できます。':injury.risk?'強い酸素不足が持続：不可逆的な心筋傷害につながる可能性があります。供給が戻っても、既に生じた傷害が消えるとは限りません。心筋梗塞の診断を示す表示ではありません。':M.state(input()).ischemia?(injury.burden>.2?'酸素不足が続いている → ATP不足 → 心筋機能障害の方向。':'酸素不足を記録中。虚血が起きても、ただちに壊死とは限りません。'):everIschemia?'酸素不足が改善：短時間で改善した虚血では、心筋機能も回復する方向です。':'需要と供給のバランスを保って経過しています。';
 }
 function sample(){const s=M.state(input());history.push({t:tick,demand:s.demand,supply:s.supply});everIschemia ||= s.ischemia;if(tick>0)injury=M.advance(injury,s);historyRender();}
 function step(){if(tick>=120)return;if(!history.length)sample();tick++;sample();if(tick===120){running=false;historyRender();}}
 function clearHistory(){running=false;tick=0;history=[];injury={burden:0,risk:false};everIschemia=false;historyRender();}
 function update(){render();/* Historical points remain unchanged when controls move. */}
 ids.forEach(id=>$('#'+id).addEventListener('input',update));
 $('#exercise').onclick=()=>{set({hr:65,contractility:75});update();};$('#rest').onclick=()=>{set({hr:35,contractility:50});update();};
 $('#limited').onclick=()=>{thrombus=false;drug='none';set({hr:35,contractility:50,narrowing:55,wall:50,oxygen:100});update();};
 $('#acute').onclick=()=>{thrombus=true;drug='none';set({hr:35,contractility:50,narrowing:0,wall:50,oxygen:100});update();};
 $('#reset').onclick=()=>{thrombus=false;drug='none';set({hr:35,contractility:50,narrowing:0,wall:50,oxygen:100});clearHistory();update();};
 $('#motion').onclick=()=>{motion=!motion;render();};$('#clearHistory').onclick=clearHistory;$('#step').onclick=step;
 $('#record').onclick=()=>{running=!running;if(running&&!history.length)sample();historyRender();};
 for(const [id,data]of Object.entries(M.drugs)){const b=document.createElement('button');b.dataset.drug=id;b.textContent=data.name;b.onclick=()=>{drug=id;update();};$('#drugButtons').append(b);}
 // One append per teaching step. Background tabs pause instead of accumulating missed time.
 setInterval(()=>{if(running&&!document.hidden)step();},500);
 render();historyRender();
})();
