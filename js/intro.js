(()=>{
 const $=s=>document.querySelector(s), absorption=document.body.dataset.lab==='01';
 const speed=$('#speed'), partition=$('#partition'),T=24;
 let t=0,active=false,paused=false,last=performance.now(),current=[],standard=[];
 const state=(time,baseline=false)=>absorption?IntroModels.absorption(time,baseline ? .8 : +speed.value):IntroModels.distribution(time,baseline?1:+partition.value,baseline ? .2 : +speed.value);
 const blood=s=>absorption?s.right:s.left;
 const xy=(time,value)=>[60+time/T*730,260-value/100*230];
 function labels(){const v=+speed.value,normal=absorption ? .8 : .2;$('#speedValue').textContent=v<normal?'ゆっくり':v>normal?'速い':'標準';if(partition)$('#partitionValue').textContent=+partition.value<1?'低い':+partition.value>1?'高い':'標準';}
 function particles(id,value,offset){const g=$(id);g.replaceChildren();for(let i=0;i<Math.round(value/5);i++){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',offset+20+(i*43+t*7)%225);c.setAttribute('cy',80+(i*31)%105);c.setAttribute('r',5);c.setAttribute('fill','#d95c5c');g.append(c);}}
 function render(){const s=state(t);$('#leftAmount').textContent=s.left.toFixed(1);$('#rightAmount').textContent=s.right.toFixed(1);$('#leftFill').setAttribute('fill',`rgba(217,92,92,${s.left/100*.35})`);$('#rightFill').setAttribute('fill',`rgba(217,92,92,${s.right/100*.35})`);particles('#leftParticles',s.left,35);particles('#rightParticles',s.right,460);$('#clock').textContent=t.toFixed(1);$('#bloodMetric').textContent=blood(s).toFixed(1);$('#totalMetric').textContent=(absorption?s.eliminated:s.left+s.right).toFixed(1);for(const [id,points]of [['#stdLine',standard],['#curLine',current]])$(id).setAttribute('points',points.map(q=>q.join(',')).join(' '));const [x,y]=xy(t,blood(s));$('#dot').setAttribute('cx',x);$('#dot').setAttribute('cy',y);$('#dot').setAttribute('visibility','visible');}
 function record(){current.push(xy(t,blood(state(t))));standard.push(xy(t,blood(state(t,true))));render();}
 function reset(){active=paused=false;t=0;current=[];standard=[];$('#stdLine').setAttribute('points','');$('#curLine').setAttribute('points','');$('#dot').setAttribute('visibility','hidden');for(const id of ['#leftAmount','#rightAmount'])$(id).textContent='0';for(const id of ['#leftParticles','#rightParticles'])$(id).replaceChildren();for(const id of ['#leftFill','#rightFill'])$(id).setAttribute('fill','#fff');$('#clock').textContent='0.0';$('#bloodMetric').textContent=$('#totalMetric').textContent='—';$('#status').textContent='待機中';$('#pause').disabled=true;$('#pause').textContent='一時停止';labels();}
 $('#start').onclick=()=>{reset();active=true;last=performance.now();$('#status').textContent='実験中';$('#pause').disabled=false;record();};$('#reset').onclick=reset;
 $('#pause').onclick=()=>{paused=!paused;last=performance.now();$('#pause').textContent=paused?'再開':'一時停止';$('#status').textContent=paused?'一時停止':'実験中';};[speed,partition].filter(Boolean).forEach(el=>el.addEventListener('input',reset));
 function frame(now){const dt=Math.max(0,Math.min(.08,(now-last)/1000))*2;last=now;if(active&&!paused){t=Math.min(T,t+dt);record();if(t===T){active=false;$('#status').textContent='終了';$('#pause').disabled=true;}}requestAnimationFrame(frame);}
 reset();requestAnimationFrame(frame);
})();
