(()=>{
 const $=s=>document.querySelector(s),A=$('#agonist'),B=$('#antag');
 let bound=false;
 const receptors=[];
 for(let i=0;i<8;i++){
  const box=document.createElement('div');box.className='receptor';box.setAttribute('role','img');
  const molecule=document.createElement('span');molecule.className='molecule';
  const socket=document.createElement('span');socket.className='switch';
  const label=document.createElement('span');label.className='switch-label';
  const binding=document.createElement('span');binding.className='binding-label';
  box.append(molecule,socket,label,binding);$('#receptors').append(box);receptors.push({box,label,binding});
 }
 function amountLabel(v){return v===0?'なし':v<25?'少ない':v<65?'中くらい':'多い';}
 const point=(a,value)=>`${55+a/100*615},${235-value*205}`;
 function drawGraph(){
  const baseline=[],current=[];
  for(let a=0;a<=100;a++){baseline.push(point(a,ReceptorModels.alpha1(a,0).contraction));current.push(point(a,ReceptorModels.alpha1(a,+B.value).contraction));}
  $('#baseCurve').setAttribute('points',baseline.join(' '));$('#curve').setAttribute('points',current.join(' '));
  const s=ReceptorModels.alpha1(+A.value,+B.value);
  $('#dot').setAttribute('cx',55+(+A.value)/100*615);$('#dot').setAttribute('cy',235-s.contraction*205);$('#dot').setAttribute('visibility',bound?'visible':'hidden');
 }
 function render(){
  $('#aText').textContent=amountLabel(+A.value);$('#bText').textContent=amountLabel(+B.value);
  const s=ReceptorModels.alpha1(bound?+A.value:0,bound?+B.value:0);
  const nOn=Math.round(s.on*8),nBlocked=Math.min(8-nOn,Math.round(s.blocked*8));
  receptors.forEach(({box,label,binding},i)=>{
   const type=i<nOn?'on':i<nOn+nBlocked?'blocked':'free';box.className='receptor '+type;
   label.textContent=type==='on'?'ON':'OFF';binding.textContent=type==='on'?'作動薬':type==='blocked'?'拮抗薬':'未結合';
   box.setAttribute('aria-label',`受容体${i+1}：${binding.textContent}、${label.textContent}`);
  });
  $('#on').textContent=`${nOn} / 8`;$('#blocked').textContent=`${nBlocked} / 8`;$('#resp').textContent=Math.round(s.contraction*100)+'%';
  $('#lumen').setAttribute('r',72*s.diameter);
  $('#vesselState').textContent=s.contraction===0?'α1刺激による収縮なし':s.contraction<.35?'弱く収縮':s.contraction<.65?'収縮している':'強く収縮';
  $('#resistance').textContent=s.contraction===0?'このモデルでのα1刺激による収縮はありません。':'作動薬による収縮がないときより内側が狭くなり、血液が流れにくい方向に変わっています。';
  $('#pressureText').textContent=!bound?'まず作動薬を結合させてみよう。':s.contraction===0?'このモデルでは、α1刺激による血管抵抗の増加はありません。':'この収縮が末梢の細い動脈で起こると、心拍出量などが同じなら血圧を上げる方向に働きます。';
  $('#status').textContent=!bound?'結合前':+A.value===0&&+B.value===0?'薬なし：OFF':+A.value===0?'拮抗薬は結合してもOFF':+B.value>0?'作動薬と拮抗薬が競合':'作動薬が受容体を刺激';
  drawGraph();
 }
 A.oninput=render;B.oninput=render;
 $('#move').onclick=()=>{bound=true;render()};
 $('#reset').onclick=()=>{bound=false;A.value='55';B.value='0';render()};
 render();
})();
