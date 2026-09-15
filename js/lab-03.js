
(()=>{
const $=s=>Lab.select(s);
const drug=$('#drug'),lf=$('#lf'),kf=$('#kf');
let active=false,paused=false,t=0,std=100,cur=100,met=0,showMet=false,last=performance.now(),sp=[],cp=[],mp=[];
const T=28;
function fractions(){return drug.value==='liver'?[.8,.2]:drug.value==='kidney'?[.2,.8]:[.5,.5]}
function updateControls(){
 $('#lfv').textContent=lf.value+'%'; $('#kfv').textContent=kf.value+'%';
 const [l,k]=fractions();
 $('#routeHint').innerHTML=`この薬の消失経路：<strong>肝臓 ${Math.round(l*100)}%</strong> ／ <strong>腎臓 ${Math.round(k*100)}%</strong>`;
 const lw=7+24*l*(lf.value/100), kw=7+24*k*(kf.value/100);
 $('#lp').setAttribute('stroke-width',lw); $('#kp').setAttribute('stroke-width',kw);
}
function x(v){return 60+Math.min(v/T,1)*730}
function y(v){return 260-Math.max(0,Math.min(100,v))/100*225}
function currentK(){const [l,k]=fractions();return .115*(l*(lf.value/100)+k*(kf.value/100))}
function render(){
 if(showMet){
   $('#metLine').setAttribute('visibility','visible'); $('#metText').setAttribute('visibility','visible');
   $('#metLine').setAttribute('points',mp.map(p=>`${x(p.t)},${y(p.v)}`).join(' '));
   $('#metText').textContent='代謝物 '+Math.round(met)+'%';
   $('#metWater').setAttribute('fill',`rgba(224,170,60,${Math.min(.35,met/100*.5)})`);
 }else{
   $('#metLine').setAttribute('visibility','hidden'); $('#metText').setAttribute('visibility','hidden');
   $('#metWater').setAttribute('fill','rgba(224,170,60,0)');
 }
 if(!cp.length)return;
 $('#stdLine').setAttribute('points',sp.map(p=>`${x(p.t)},${y(p.v)}`).join(' '));
 $('#curLine').setAttribute('points',cp.map(p=>`${x(p.t)},${y(p.v)}`).join(' '));
 const xx=x(t),yy=y(cur);
 $('#nowLine').setAttribute('x1',xx);$('#nowLine').setAttribute('x2',xx);$('#nowLine').setAttribute('visibility','visible');
 $('#dot').setAttribute('cx',xx);$('#dot').setAttribute('cy',yy);$('#dot').setAttribute('visibility','visible');
 $('#concText').textContent=Math.round(cur)+'%';
 $('#water').setAttribute('fill',`rgba(217,92,92,${Math.max(.03,cur/100*.72)})`);
 $('#stdNum').textContent=Math.round(std)+'%';$('#curNum').textContent=Math.round(cur)+'%';
 const d=Math.round(cur-std);$('#diffNum').textContent=(d>0?'+':'')+d+' pt';
}
function reset(){
 active=false;paused=false;t=0;std=cur=100;met=0;sp=[];cp=[];mp=[];
 $('#stdLine').setAttribute('points','');$('#curLine').setAttribute('points','');$('#metLine').setAttribute('points','');
 $('#nowLine').setAttribute('visibility','hidden');$('#dot').setAttribute('visibility','hidden');
 $('#metWater').setAttribute('fill','rgba(224,170,60,0)');$('#metText').textContent='代謝物 0%';$('#water').setAttribute('fill','rgba(217,92,92,0)');$('#concText').textContent='0%';
 $('#stdNum').textContent=$('#curNum').textContent=$('#diffNum').textContent='—';
 $('#status').textContent='待機中';$('#pause').disabled=true;$('#pause').textContent='一時停止';
 updateControls();
}
$('#dose').onclick=()=>{reset();active=true;std=cur=100;met=0;sp=[{t:0,v:100}];cp=[{t:0,v:100}];mp=[{t:0,v:0}];$('#status').textContent='実験中';$('#pause').disabled=false;last=performance.now();render()};
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'再開':'一時停止';$('#status').textContent=paused?'一時停止':'実験中';last=performance.now()};
$('#reset').onclick=reset;
[drug,lf,kf].forEach(el=>el.addEventListener('input',()=>{updateControls();reset()}));
function loop(now){
 const real=Math.min(.08,(now-last)/1000);last=now;
 if(active&&!paused){
  const dt=Math.min(real*2.7,T-t);t+=dt;
  const [lfrac,kfrac]=fractions(), liverCapacity=Number(lf.value)/100, kidneyCapacity=Number(kf.value)/100;
  const oldCur=cur;
  std*=Math.exp(-.115*dt);cur*=Math.exp(-currentK()*dt);
  const eliminated=Math.max(0,oldCur-cur);
  const weighted=lfrac*liverCapacity+kfrac*kidneyCapacity;
  const liverShare=weighted>0 ? (lfrac*liverCapacity)/weighted : 0;
  const formed=eliminated*liverShare;
  met = met*Math.exp(-.16*dt)+formed;
  sp.push({t,v:std});cp.push({t,v:cur});mp.push({t,v:met});
  if(t>=T){active=false;$('#status').textContent='終了';$('#pause').disabled=true}
  render();
 }
 requestAnimationFrame(loop);
}
$('#metToggle').onclick=()=>{
 showMet=!showMet;
 $('#metToggle').textContent=showMet?'ON':'OFF';
 $('#metToggle').setAttribute('aria-pressed',showMet?'true':'false');
 $('#metToggle').style.background=showMet?'#315b9a':'white';
 $('#metToggle').style.color=showMet?'white':'#172033';
 $('#metHint').style.display=showMet?'block':'none';
 render();
};
updateControls();requestAnimationFrame(loop);
})();

