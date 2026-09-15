(() => {
  'use strict';
  const $=selector=>document.querySelector(selector),NS='http://www.w3.org/2000/svg',T=4;
  const strength=$('#strength'),channels=[],particles=[];let running=false,paused=false,t=0,last=performance.now(),history=[];
  function svg(tag,attrs){const el=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,value);return el}
  for(let i=0;i<6;i++){
    const x=105+i*108,channel=svg('rect',{x:x-15,y:105,width:30,height:72,rx:10,class:'channel'});$('#channels').append(channel);channels.push(channel);
    const particle=svg('g',{}),circle=svg('circle',{cx:x,cy:67,r:14,class:'na-particle'}),label=svg('text',{x,y:72,'text-anchor':'middle',fill:'white','font-size':11});label.textContent='Na';particle.append(circle,label);$('#sodium').append(particle);particles.push(particle);
  }
  function point(time,value){return [60+time/T*730,250-(value+90)/130*220]}
  function labels(){const value=+strength.value;$('#strengthValue').textContent=value+(value>=NeuralModels.threshold?'（閾値以上）':'（閾値未満）')}
  function render(started=false){
    const power=+strength.value,age=Math.max(0,t-1),voltage=started?NeuralModels.depolarization(age,power):-70,opens=started&&power>=NeuralModels.threshold&&age>=0&&age<.58,local=started&&power<NeuralModels.threshold&&age<1;
    const travel=opens?Math.min(1,age/.48):0;
    channels.forEach((channel,i)=>channel.setAttribute('class','channel '+((opens||local&&i===0)?'open':'')));
    particles.forEach((particle,i)=>{const active=opens&&i<Math.max(2,Math.round(power/17));particle.setAttribute('opacity',active?'1':'.18');particle.setAttribute('transform',`translate(0 ${active?Math.min(105,travel*105+i%2*5):0})`)});
    $('#charge').textContent=voltage>0?'+ + +':voltage>-55?'−  ±  +':'− − −';$('#voltage').textContent=Math.round(voltage);$('#channelState').textContent=opens?'開く':local?'一部が反応':'閉';$('#result').textContent=!started?'待機':power<NeuralModels.threshold?'閾値未満':age<.58?'脱分極':age<1?'再分極':'回復';
    $('#phase').textContent=!started?'「1回刺激する」を押してみよう。':t<1?'刺激が膜へ届く前です。':power<NeuralModels.threshold?'膜電位は少し変化しますが、閾値に達しないため活動電位は発生しません。':age<.22?'Na⁺チャネルが開き、Na⁺が細胞内へ流入しています。':age<.58?'内側が急速に正の方向へ変化しました。':age<1?'Na⁺流入が止まり、膜電位が戻る段階です。':'1回の変化が終了しました。';
  }
  function record(){const value=NeuralModels.depolarization(Math.max(0,t-1),+strength.value);history.push(point(t,value));$('#voltageLine').setAttribute('points',history.map(p=>p.join(',')).join(' '));const [x,y]=point(t,value);$('#dot').setAttribute('cx',x);$('#dot').setAttribute('cy',y);$('#dot').setAttribute('visibility','visible');render(true)}
  function reset(){running=paused=false;t=0;history=[];$('#voltageLine').setAttribute('points','');$('#dot').setAttribute('visibility','hidden');$('#status').textContent='待機中';$('#pause').disabled=true;$('#pause').textContent='一時停止';labels();render(false)}
  $('#start').onclick=()=>{reset();running=true;last=performance.now();$('#status').textContent='実験中';$('#pause').disabled=false;record()};$('#pause').onclick=()=>{paused=!paused;last=performance.now();$('#pause').textContent=paused?'再開':'一時停止';$('#status').textContent=paused?'一時停止':'実験中'};$('#reset').onclick=reset;strength.addEventListener('input',reset);
  function loop(now){const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;if(running&&!paused){t=Math.min(T,t+dt);record();if(t===T){running=false;$('#status').textContent='終了';$('#pause').disabled=true}}requestAnimationFrame(loop)}
  reset();requestAnimationFrame(loop);
})();
