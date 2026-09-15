
(()=>{const $=q=>Lab.select(q),A=$('#a'),B=$('#b'),M=$('#mode');let active=false,paused=false,t=0,last=performance.now(),pa=[],pb=[],pt=[];const T=20,x=t=>60+t/T*730,y=v=>260-Math.min(v,130)/130*225;
function total(a,b){return M.value==='add'?Math.min(130,a+b):Math.min(130,a+b+0.006*a*b)}
function labels(){$('#av').textContent=A.value;$('#bv').textContent=B.value}
function bars(a,b,z){for(const [id,v] of [['#barA',a],['#barB',b],['#barT',z]]){let h=Math.min(v,130)/130*150;$(id).setAttribute('y',205-h);$(id).setAttribute('height',h)}$('#ma').textContent=Math.round(a);$('#mb').textContent=Math.round(b);$('#mt').textContent=Math.round(z)}
function reset(){active=paused=false;t=0;pa=[];pb=[];pt=[];['#la','#lb','#lt'].forEach(id=>$(id).setAttribute('points',''));bars(0,0,0);$('#status').textContent='待機中';$('#pause').disabled=true;$('#pause').textContent='一時停止'}
$('#start').onclick=()=>{reset();active=true;$('#pause').disabled=false;$('#status').textContent='作用中';last=performance.now();pa=[[x(0),y(0)]];pb=[[x(0),y(0)]];pt=[[x(0),y(0)]]};
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'再開':'一時停止';$('#status').textContent=paused?'一時停止':'作用中';last=performance.now()};
$('#reset').onclick=reset;[A,B].forEach(e=>e.oninput=labels);
function loop(n){let r=Math.min(.08,(n-last)/1000);last=n;if(active&&!paused){t=Math.min(T,t+r*2.5);let ramp=Math.min(1,t/3),a=+A.value*ramp,b=+B.value*ramp,z=total(a,b);bars(a,b,z);pa.push([x(t),y(a)]);pb.push([x(t),y(b)]);pt.push([x(t),y(z)]);$('#la').setAttribute('points',pa.map(q=>q.join(',')).join(' '));$('#lb').setAttribute('points',pb.map(q=>q.join(',')).join(' '));$('#lt').setAttribute('points',pt.map(q=>q.join(',')).join(' '));if(t>=T){active=false;$('#status').textContent='終了';$('#pause').disabled=true}}requestAnimationFrame(loop)}labels();requestAnimationFrame(loop)})();

