(()=>{
 const $=s=>document.querySelector(s),kind=document.body.dataset.lab,A=$('#agonist'),B=$('#antag');let bound=false,motionPaused=false;const cells=[];
 for(let i=0;i<8;i++){const box=document.createElement('div');box.className='receptor';box.setAttribute('role','img');const molecule=document.createElement('span');molecule.className='molecule';const socket=document.createElement('span');socket.className='switch';const label=document.createElement('span');label.className='switch-label';const binding=document.createElement('span');binding.className='binding-label';box.append(molecule,socket,label,binding);$('#receptors').append(box);cells.push({box,label,binding});}
 const word=v=>v===0?'なし':v<25?'少ない':v<65?'中くらい':'多い';
 function render(){
  $('#aText').textContent=word(+A.value);$('#bText').textContent=word(+B.value);
  const s=AutonomicModels.state(kind,bound?+A.value:0,bound?+B.value:0),on=Math.round(s.on*8),blocked=Math.min(8-on,Math.round(s.blocked*8));
  cells.forEach(({box,label,binding},i)=>{const type=i<on?'on':i<on+blocked?'blocked':'free';box.className='receptor '+type;label.textContent=type==='on'?'ON':'OFF';binding.textContent=type==='on'?'作動薬':type==='blocked'?'拮抗薬':'未結合';box.setAttribute('aria-label',`受容体${i+1}：${binding.textContent}、${label.textContent}`);});
  $('#on').textContent=`${on} / 8`;$('#blocked').textContent=`${blocked} / 8`;$('#resp').textContent=Math.round(s.response*100)+'%';
  const keys=kind==='16'?['rate','force']:kind==='17'?['diameter']:['rate','diameter','secretion'];
  const directions={rate:['遅くなる','速くなる'],force:['弱くなる','強くなる'],diameter:['狭くなる','広がる'],secretion:['少なくなる','増える']};
  keys.forEach(k=>{$('#'+k+'Value').textContent=s[k].toFixed(2);$('#'+k+'Direction').textContent=s[k]===1?'基準':directions[k][s[k]>1?1:0];});
  const heart=$('#heart');if(heart){heart.style.animationPlayState=motionPaused?'paused':'running';heart.style.setProperty('--beat-duration',(1.2/s.rate).toFixed(3)+'s');heart.style.setProperty('--beat-scale',String(kind==='16'?1.08+.08*s.response:1.08));}
  const airway=$('#airway');if(airway)airway.setAttribute('r',58*s.diameter);const secretion=$('#secretionBar');if(secretion)secretion.style.width=(50*s.secretion)+'%';
  $('#effectText').textContent=s.response===0?'追加刺激のない基準の状態です。':kind==='16'?'β1刺激により、基準より心拍が速く、収縮力が強くなる方向に変化しています。':kind==='17'?'β2刺激により、平滑筋がゆるみ、気管支の内側が基準より広がっています。':'ムスカリン刺激により、心拍は遅く、気管支は狭く、唾液分泌は多くなる方向に変化しています。';
  $('#status').textContent=!bound?'結合前':+A.value===0&&+B.value===0?'薬なし：OFF':+A.value===0?'拮抗薬は結合してもOFF':+B.value>0?'作動薬と拮抗薬が競合':'作動薬が受容体を刺激';
  const baseline=[],current=[];for(let a=0;a<=100;a++){baseline.push(`${55+a/100*615},${235-AutonomicModels.state(kind,a,0).response*205}`);current.push(`${55+a/100*615},${235-AutonomicModels.state(kind,a,+B.value).response*205}`);}$('#baseCurve').setAttribute('points',baseline.join(' '));$('#curve').setAttribute('points',current.join(' '));$('#dot').setAttribute('cx',55+(+A.value)/100*615);$('#dot').setAttribute('cy',235-s.response*205);$('#dot').setAttribute('visibility',bound?'visible':'hidden');
 }
 const motion=$('#motionToggle');if(motion)motion.onclick=()=>{motionPaused=!motionPaused;motion.setAttribute('aria-pressed',String(motionPaused));motion.textContent=motionPaused?'模式図の動きを再開':'模式図の動きを止める';render();};
 A.oninput=render;B.oninput=render;$('#move').onclick=()=>{bound=true;render()};$('#reset').onclick=()=>{bound=false;motionPaused=false;if(motion){motion.setAttribute('aria-pressed','false');motion.textContent='模式図の動きを止める';}A.value='55';B.value='0';render()};render();
})();
