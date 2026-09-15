(()=>{
 const $=s=>document.querySelector(s),isAxon=document.body.dataset.lab==='11',T=12,NS='http://www.w3.org/2000/svg';
 const inputs=isAxon?[$('#strength'),$('#speed')]:[$('#release'),$('#clearance')];
 let running=false,paused=false,t=0,last=performance.now(),current=[],standard=[];
 const nodes=[],receptors=[];
 function svg(tag,attrs){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
 if(isAxon){
  for(let i=0;i<6;i++){
   const x=75+122*i,circle=svg('circle',{cx:x,cy:95,r:31,fill:'#eef3f8',stroke:'#315b9a','stroke-width':4}),number=svg('text',{x,y:102,'text-anchor':'middle',class:'segment-label',fill:'#344054'}),label=svg('text',{x,y:159,'text-anchor':'middle',class:'segment-phase',fill:'#667085'});
   number.textContent=String(i+1);label.textContent='静止';$('#segments').append(circle,number,label);nodes.push({circle,label});
  }
 }else{
  for(let i=0;i<5;i++){const y=80+i*31,p=svg('path',{d:`M535 ${y-10} H519 Q506 ${y} 519 ${y+10} H535`,fill:'none',stroke:'#315b9a','stroke-width':5});const label=svg('text',{x:546,y:y+5,'font-size':13,fill:'#667085'});label.textContent='OFF';$('#synReceptors').append(p,label);receptors.push({p,label});}
 }
 const read=()=>inputs.map(e=>+e.value);
 const value=(time,baseline=false)=>{const [a,b]=read();return isAxon?NeuralModels.potential(time,a,baseline?1:b):NeuralModels.synapse(time,baseline?100:a,baseline ? .8 : b).response;};
 const point=(time,v)=>[60+time/T*730,isAxon?260-(v+90)/130*230:260-v/100*230];
 function labels(){const [a,b]=read();if(isAxon){$('#strengthValue').textContent=a+(a>=50?'（閾値以上）':'（閾値未満）');$('#speedValue').textContent=b===1?'標準':b<1?'ゆっくり':'速い';}else{$('#releaseValue').textContent=a;$('#clearanceValue').textContent=b===.8?'標準':b<.8?'ゆっくり':'速い';}}
 function diagram(started){
  const [a,b]=read();
  if(isAxon){
   nodes.forEach(({circle,label},i)=>{const age=t-(1+i*.8/b),firing=started&&a>=50&&age>=0&&age<1,phase=!firing?'静止':age<.2?'脱分極':age<.55?'再分極':'回復';circle.setAttribute('fill',firing?(age<.2?'#f2b1aa':'#dce8f6'):'#eef3f8');circle.setAttribute('stroke',firing&&age<.2?'#d95c5c':'#315b9a');label.textContent=phase;});
   $('#extra').textContent=!started?'—':t<1?'刺激前':a<50?'発生なし':'発生あり';
   $('#phase').textContent=!started?'開始ボタンを押してみよう。':t<1?'刺激を与える前の状態です。':a<50?'閾値未満：活動電位は発生せず、末端付近にも伝わりません。':t<1+4/b?'活動電位が、隣の位置で順に発生しています。':'末端付近まで伝わりました。グラフの到達時刻を標準と比べよう。';
  }else{
   const s=started?NeuralModels.synapse(t,a,b):{amount:0,response:0};$('#transmitters').replaceChildren();
   for(let i=0;i<Math.round(s.amount/5);i++){const c=svg('circle',{cx:280+(i*37+t*32)%211,cy:78+(i*47)%137,r:6,fill:'#e0aa3c'});$('#transmitters').append(c);}
   receptors.forEach(({p,label},i)=>{const on=i<Math.round(s.response/100*5);p.setAttribute('stroke',on?'#4f8a70':'#315b9a');label.textContent=on?'ON':'OFF';});
   $('#cellResponse').textContent=s.response<1?'反応なし':s.response<35?'弱い反応':'反応あり';$('#extra').textContent=started?s.amount.toFixed(1):'—';
   const releasing=started&&t>=1&&t<2;$('#calcium').textContent=releasing?(a>0?'Ca²⁺流入 → 放出':'Ca²⁺流入・放出0'):started&&t>=2?'1回の放出が終了':'Ca²⁺流入前';$('#releaseArrow').setAttribute('stroke',releasing&&a>0?'#e0aa3c':'#98a2b3');
   $('#phase').textContent=!started?'開始ボタンを押してみよう。':t<1?'電気信号が神経終末に向かっています。':t<2?(a===0?'信号は届きましたが、この条件では伝達物質を放出しません。':'Ca²⁺の流入をきっかけに伝達物質が放出され、受容体に結合します。'):a===0?'放出がないため、次の細胞の反応も起こりません。':'伝達物質が取り除かれるにつれて、受容体を介した反応が弱まります。';
  }
 }
 function record(){
  const v=value(t);current.push(point(t,v));standard.push(point(t,value(t,true)));
  $('#curLine').setAttribute('points',current.map(p=>p.join(',')).join(' '));$('#stdLine').setAttribute('points',standard.map(p=>p.join(',')).join(' '));const [x,y]=point(t,v);$('#dot').setAttribute('cx',x);$('#dot').setAttribute('cy',y);$('#dot').setAttribute('visibility','visible');$('#clock').textContent=t.toFixed(1);$('#value').textContent=isAxon?Math.round(v)+' mV':Math.round(v)+'%';diagram(true);
 }
 function reset(){running=paused=false;t=0;current=[];standard=[];for(const id of ['#curLine','#stdLine'])$(id).setAttribute('points','');$('#dot').setAttribute('visibility','hidden');$('#clock').textContent='0.0';$('#value').textContent='—';$('#status').textContent='待機中';$('#pause').disabled=true;$('#pause').textContent='一時停止';labels();diagram(false);}
 $('#start').onclick=()=>{reset();running=true;last=performance.now();$('#status').textContent='実験中';$('#pause').disabled=false;record();};$('#reset').onclick=reset;$('#pause').onclick=()=>{paused=!paused;last=performance.now();$('#pause').textContent=paused?'再開':'一時停止';$('#status').textContent=paused?'一時停止':'実験中';};inputs.forEach(e=>e.addEventListener('input',reset));
 function loop(now){const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;if(running&&!paused){t=Math.min(T,t+dt);record();if(t===T){running=false;$('#status').textContent='終了';$('#pause').disabled=true;}}requestAnimationFrame(loop);}
 reset();requestAnimationFrame(loop);
})();
