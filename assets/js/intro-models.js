/* Normalized teaching models: equal fixed compartment volumes, no clinical units. */
(function(root){
 const models={
  absorption(t,ka=.8,dose=100){
   const ke=.18,gut=dose*Math.exp(-ka*t);
   const blood=Math.abs(ka-ke)<1e-8?dose*ka*t*Math.exp(-ke*t):dose*ka/(ka-ke)*(Math.exp(-ke*t)-Math.exp(-ka*t));
   return {left:gut,right:blood,eliminated:Math.max(0,dose-gut-blood)};
  },
  distribution(t,partition=1,speed=.2){
   const blood=100*(1/(1+partition)+partition/(1+partition)*Math.exp(-speed*(1+partition)*t));
   return {left:blood,right:100-blood,eliminated:0};
  }
 };
 root.IntroModels=Object.freeze(models);
 if(typeof module!=='undefined')module.exports=models;
})(typeof window==='undefined'?globalThis:window);
