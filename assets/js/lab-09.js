
(()=>{
const $=q=>Lab.select(q),DEP=$('#renalDep'),R=$('#renal'),MR=$('#metRenal');
let active=false,paused=false,showMet=false,t=0,std=100,parent=100,met=0,last=performance.now();
let sp=[],pp=[],mp=[]; const T=28,baseK=.115;
const x=t=>60+Math.min(t/T,1)*730,y=v=>260-Math.max(0,Math.min(v,100))/100*225;
function dep(){return Number(DEP.value)}
function update(){
 $('#renalV').textContent=R.value+'%';$('#metRenalV').textContent=MR.value+'%';
 $('#routeHint').innerHTML=`この薬の消失のうち、<strong>腎排泄 ${Math.round(dep()*100)}%</strong> ／ その他 ${Math.round((1-dep())*100)}% とする学習モデル。`;
 $('#kp').setAttribute('stroke-width',7+26*dep()*(R.value/100));$('#lp').setAttribute('stroke-width',7+20*(1-dep()));
}
function parentK(){return baseK*((1-dep())+dep()*(R.value/100))}
function metK(){
 const renalDep=Number(MR.value)/100, renalCap=Number(R.value)/100;
 return .14*((1-renalDep)+renalDep*renalCap);
}
function render(){
 if(!pp.length)return;
 $('#stdLine').setAttribute('points',sp.map(p=>`${x(p.t)},${y(p.v)}`).join(' '));
 $('#curLine').setAttribute('points',pp.map(p=>`${x(p.t)},${y(p.v)}`).join(' '));
 let xx=x(t),yy=y(parent);$('#nowLine').setAttribute('x1',xx);$('#nowLine').setAttribute('x2',xx);$('#nowLine').setAttribute('visibility','visible');
 $('#dot').setAttribute('cx',xx);$('#dot').setAttribute('cy',yy);$('#dot').setAttribute('visibility','visible');
 $('#concText').textContent=Math.round(parent)+'%';$('#water').setAttribute('fill',`rgba(217,92,92,${parent/100*.72})`);
 $('#stdNum').textContent=Math.round(std)+'%';$('#curNum').textContent=Math.round(parent)+'%';
 let d=Math.round(parent-std);$('#diffNum').textContent=(d>0?'+':'')+d+' pt';
 if(showMet){
  $('#metLine').setAttribute('visibility','visible');$('#metText').setAttribute('visibility','visible');
  $('#metLine').setAttribute('points',mp.map(p=>`${x(p.t)},${y(p.v)}`).join(' '));
  $('#metText').textContent='代謝物 '+Math.round(met)+'%';
  $('#metWater').setAttribute('fill',`rgba(224,170,60,${Math.min(.34,met/100*.5)})`);
 }else{
  $('#metLine').setAttribute('visibility','hidden');$('#metText').setAttribute('visibility','hidden');$('#metWater').setAttribute('fill','rgba(224,170,60,0)');
 }
}
function reset(){
 active=paused=false;t=0;std=parent=100;met=0;sp=[];pp=[];mp=[];
 $('#stdLine').setAttribute('points','');$('#curLine').setAttribute('points','');$('#metLine').setAttribute('points','');
 $('#nowLine').setAttribute('visibility','hidden');$('#dot').setAttribute('visibility','hidden');
 $('#water').setAttribute('fill','rgba(217,92,92,0)');$('#metWater').setAttribute('fill','rgba(224,170,60,0)');
 $('#concText').textContent='0%';$('#metText').textContent='代謝物 0%';
 $('#stdNum').textContent=$('#curNum').textContent=$('#diffNum').textContent='—';$('#status').textContent='待機中';
 $('#pause').disabled=true;$('#pause').textContent='一時停止';update();
}
$('#dose').onclick=()=>{reset();active=true;sp=[{t:0,v:100}];pp=[{t:0,v:100}];mp=[{t:0,v:0}];$('#status').textContent='実験中';$('#pause').disabled=false;last=performance.now();render()};
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'再開':'一時停止';$('#status').textContent=paused?'一時停止':'実験中';last=performance.now()};
$('#reset').onclick=reset;
$('#metToggle').onclick=()=>{
 showMet=!showMet;$('#metToggle').textContent=showMet?'ON':'OFF';$('#metToggle').setAttribute('aria-pressed',showMet?'true':'false');
 $('#metToggle').style.background=showMet?'#315b9a':'white';$('#metToggle').style.color=showMet?'white':'#172033';
 $('#metControls').style.display=showMet?'block':'none';render();
};
[DEP,R,MR].forEach(e=>e.oninput=()=>{update();reset()});
function loop(n){
 let real=Math.min(.08,(n-last)/1000);last=n;
 if(active&&!paused){
  let dt=Math.min(real*2.7,T-t);t+=dt;std*=Math.exp(-baseK*dt);
  const oldParent=parent;parent*=Math.exp(-parentK()*dt);
  // 学習モデル: 親薬物の一部が「その他の消失」側で代謝物になる
  const metabolized=Math.max(0,oldParent-parent)*(parentK()>0 ? baseK*(1-dep())/parentK() : 0);
  met=met*Math.exp(-metK()*dt)+metabolized*.75;
  sp.push({t,v:std});pp.push({t,v:parent});mp.push({t,v:met});
  if(t>=T){active=false;$('#status').textContent='終了';$('#pause').disabled=true}render();
 }
 requestAnimationFrame(loop);
}
update();requestAnimationFrame(loop);
})();

