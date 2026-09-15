(() => {
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const emax=(dose,max=1,ec50=30)=>max*dose/(ec50+dose);
  const pk=(time,absorption=1,metabolism=1,kidney=1)=>{
    const input=.22+.78*clamp(absorption); const elimination=.055*(.55*clamp(metabolism,.1,2)+.45*clamp(kidney,.1,2));
    return input*(Math.exp(-elimination*time)-Math.exp(-.9*time))/Math.max(.05,.9-elimination);
  };
  const membrane=(kLeak,pump)=>{
    const gradient=pump?1:.58;const negative=clamp(.18+.72*(kLeak/100)*gradient);
    return {gradient,negative,excitability:clamp(1-negative*.72)};
  };
  const beta3=(agonist,antagonist)=>{
    const a=agonist/30,b=antagonist/30,den=1+a+b,on=a/den,blocked=b/den;
    return {on,blocked,free:1-on-blocked,relaxation:on,capacity:1+.35*on};
  };
  window.EXPANSION_MODELS={clamp,emax,pk,membrane,beta3};
})();
