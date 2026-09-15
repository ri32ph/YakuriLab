
(()=>{
const $=s=>Lab.select(s);
const D=$('#dep'), B=$('#block');
let active=false, induced=false, showMet=false;
let t=0, std=100, parent=100, metabolite=0, last=performance.now();
let sp=[], pp=[], mp=[];
const T=24, baseK=.12, metK=.16;
const x=t=>60+Math.min(t/T,1)*730, y=v=>260-Math.max(0,Math.min(v,100))/100*225;

function labels(){ $('#bv').textContent=B.value+'%'; }

function pathway(){
 const dep=Number(D.value), induction=Number(B.value)/100;
 const cyp=dep*(induced ? 1+induction : 1);
 const other=1-dep;
 return {cyp,other,total:cyp+other};
}
function parentK(){ return baseK*pathway().total; }
function cypFraction(){ const q=pathway(); return q.total>0?q.cyp/q.total:0; }

function reset(){
 active=false; induced=false; t=0; std=parent=100; metabolite=0; sp=[]; pp=[]; mp=[];
 $('#sl').setAttribute('points',''); $('#cl').setAttribute('points',''); $('#ml').setAttribute('points','');
 $('#bl').setAttribute('visibility','hidden'); $('#bt').setAttribute('visibility','hidden');
 $('#ct').textContent='0%'; $('#water').setAttribute('fill','rgba(217,92,92,0)');
 $('#metWater').setAttribute('fill','rgba(224,170,60,0)'); $('#metText').textContent='代謝物 0%';
 $('#std').textContent=$('#cur').textContent=$('#dif').textContent='—';
 $('#pipe').setAttribute('stroke-width','28'); $('#inhibit').disabled=true; $('#status').textContent='待機中';
}

function render(){
 if(!pp.length)return;
 $('#sl').setAttribute('points',sp.map(q=>q.join(',')).join(' '));
 $('#cl').setAttribute('points',pp.map(q=>q.join(',')).join(' '));
 $('#ct').textContent=Math.round(parent)+'%';
 $('#water').setAttribute('fill',`rgba(217,92,92,${parent/100*.72})`);
 $('#std').textContent=Math.round(std)+'%'; $('#cur').textContent=Math.round(parent)+'%';
 const diff=Math.round(parent-std); $('#dif').textContent=(diff>0?'+':'')+diff+' pt';
 if(showMet){
   $('#ml').setAttribute('visibility','visible'); $('#metText').setAttribute('visibility','visible');
   $('#ml').setAttribute('points',mp.map(q=>q.join(',')).join(' '));
   $('#metText').textContent='代謝物 '+Math.round(metabolite)+'%';
   $('#metWater').setAttribute('fill',`rgba(224,170,60,${Math.min(.34,metabolite/100*.48)})`);
 }else{
   $('#ml').setAttribute('visibility','hidden'); $('#metText').setAttribute('visibility','hidden');
   $('#metWater').setAttribute('fill','rgba(224,170,60,0)');
 }
}

$('#start').onclick=()=>{
 reset();active=true;sp=[[x(0),y(100)]];pp=[[x(0),y(100)]];mp=[[x(0),y(0)]];
 $('#inhibit').disabled=false;$('#status').textContent='通常代謝';last=performance.now();render();
};
$('#inhibit').onclick=()=>{
 if(!active||induced)return; induced=true;
 const xx=x(t);$('#bl').setAttribute('x1',xx);$('#bl').setAttribute('x2',xx);$('#bl').setAttribute('visibility','visible');
 $('#bt').setAttribute('x',xx);$('#bt').setAttribute('visibility','visible');
 const q=pathway();$('#pipe').setAttribute('stroke-width',Math.min(50,8+20*q.total));
 $('#status').textContent='CYP誘導中';
};
$('#metToggle').onclick=()=>{
 showMet=!showMet;$('#metToggle').textContent=showMet?'ON':'OFF';$('#metToggle').setAttribute('aria-pressed',showMet?'true':'false');
 $('#metToggle').style.background=showMet?'#315b9a':'white';$('#metToggle').style.color=showMet?'white':'#172033';
 $('#metHint').style.display=showMet?'block':'none';render();
};
$('#reset').onclick=reset;B.oninput=()=>{labels();reset()};D.onchange=()=>{reset()};

function loop(now){
 const real=Math.min(.08,(now-last)/1000);last=now;
 if(active){
  const dt=Math.min(real*2.6,T-t);t+=dt;
  std*=Math.exp(-baseK*dt);
  const oldParent=parent;
  parent*=Math.exp(-parentK()*dt);
  const eliminated=Math.max(0,oldParent-parent);
  const formed=eliminated*cypFraction();
  metabolite=metabolite*Math.exp(-metK*dt)+formed;
  sp.push([x(t),y(std)]);pp.push([x(t),y(parent)]);mp.push([x(t),y(metabolite)]);
  if(t>=T){active=false;$('#status').textContent='終了';$('#inhibit').disabled=true}
  render();
 }
 requestAnimationFrame(loop);
}
labels();requestAnimationFrame(loop);
})();

