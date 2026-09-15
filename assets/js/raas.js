(() => {
  const $=id=>document.getElementById(id), model=window.RAAS_MODEL;
  const pathway=window.RAAS_PATHWAY.mount($('raasPathway'));
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let stage=0,timer=null,running=false;
  function stop(){clearTimeout(timer);timer=null;running=false;}
  function render(){
    const s=model.state($('bloodVolume').value,stage,$('raasEnabled').checked);
    pathway.render(s);
    const suppressed=s.volume>50&&s.enabled;
    const arrow=on=>on?'↑':s.volume>50&&s.enabled?'↓':'→';
    $('volumeMetric').textContent=s.low?(s.supported?'↓ ／ 保持で↑方向':'↓'):s.volume>50?'↑':'→';
    $('reninMetric').textContent=arrow(s.renin);$('angMetric').textContent=arrow(s.angiotensin);$('aldoMetric').textContent=arrow(s.aldosterone);
    $('resistanceMetric').textContent=arrow(s.resistance>0);$('retentionMetric').textContent=arrow(s.retention>0);
    $('pressureMetric').textContent=s.low?(s.resistance>0?'低下に対して↑方向':'低下方向'):s.volume>50?'上昇方向':'標準付近';
    $('compareVolume').textContent=s.volumeLabel;
    $('raasMode').textContent=s.enabled?'ON':'OFF';
    $('volumeOut').textContent=s.volumeLabel;
    $('bloodVolume').setAttribute('aria-valuetext',s.volumeLabel);
    $('status').textContent=!s.enabled?'RAAS OFF':s.low?'血液量低下への反応':s.volume>50?'追加の活性化なし':'標準状態';
    $('stageCount').textContent=s.low?(s.enabled?`${stage+1} / 8`:'比較：OFF'):'準備';
    $('stageTitle').textContent=s.title;$('stageText').textContent=s.text;
    for(const id of ['heart','kidneys','liver','adrenals','vessels'])$(id).classList.toggle('active',s.organs.includes(id));
    document.querySelectorAll('.sequence li').forEach((el,i)=>{el.classList.toggle('done',s.low&&s.enabled&&i<=stage);if(s.low&&s.enabled&&i===stage)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    $('molecules').textContent=s.aldosterone?'レニン → Ang I → Ang II → アルドステロン':s.angiotensin?'Ang I → ACE → Ang II':s.renin&&stage>=3?'レニン → Ang I':s.renin&&stage>=2?'肝臓 → アンジオテンシノーゲン':s.renin?'腎臓 → レニン放出↑':'';
    $('vascularEffect').classList.toggle('active',s.resistance>0);
    $('retentionEffect').classList.toggle('active',s.retention>0);
    $('vascularText').textContent=s.resistance>0?'収縮 → 血管抵抗↑':suppressed?'収縮が弱まる → 抵抗↓方向':'基準の太さ';
    const height=18-10*s.resistance+(suppressed?4:0);$('lumen').setAttribute('height',height);$('lumen').setAttribute('y',(32-height)/2);
    $('retentionText').textContent=s.retention>0?'Na⁺・水の保持↑':suppressed?'Na⁺・水の保持↓方向':'Na⁺・水の保持：基準';
    $('waterText').textContent=s.retention>0?'尿へ失う量↓方向 → 体内に保つ':'尿への排泄と体内への保持';
    $('outcome').textContent=s.supported?'血管収縮 ＋ Na⁺・水の保持 → 血圧・循環血液量を維持する方向へ':s.low?'出発点：循環血液量↓ → 心拍出量・血圧↓方向':'血液量を変え、体の反応を観察しよう。';
    $('pause').disabled=!s.low||!s.enabled||stage===7;$('pause').textContent=running?'一時停止':'自動で進む';
    $('next').disabled=!s.low||!s.enabled||stage===7;$('replay').disabled=!s.low||!s.enabled;
    $('playStatus').textContent=!s.enabled?'RAAS OFF：補正を外した仮想比較です。':!s.low?'血液量を減らすと、反応が順番に表示されます。':stage===7?'観察完了。標準に戻すと条件をリセットできます。':running?'因果関係を順番に再生中（実際の経過時間ではありません）。':'停止中。「1段階進む」で自分のペースで観察できます。';
  }
  function schedule(){timer=setTimeout(()=>{stage++;if(stage>=7)stop();render();if(running)schedule();},2600);}
  function start(){stop();if($('raasEnabled').checked&&Number($('bloodVolume').value)<50&&stage<7){running=true;schedule();}render();}
  function changed(){stop();stage=0;if(!media.matches)start();else render();}
  $('bloodVolume').addEventListener('input',changed);
  $('raasEnabled').addEventListener('change',changed);
  $('reduceVolume').addEventListener('click',()=>{$('bloodVolume').value=20;changed();});
  $('reset').addEventListener('click',()=>{$('bloodVolume').value=50;$('raasEnabled').checked=true;changed();});
  $('pause').addEventListener('click',()=>{if(running){stop();render();}else start();});
  $('next').addEventListener('click',()=>{stop();stage=Math.min(7,stage+1);render();});
  $('replay').addEventListener('click',changed);
  media.addEventListener('change',e=>{if(e.matches){stop();render();}});
  render();
})();
