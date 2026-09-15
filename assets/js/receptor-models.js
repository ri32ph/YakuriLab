/* Dimensionless reversible competition; teaching response is NOT a clinical prediction. */
(function(root){
 function alpha1(agonist,antagonist){
  const a=Math.max(0,Number(agonist)),b=Math.max(0,Number(antagonist));
  const denominator=1+a/30+b/30;
  const on=a/30/denominator,blocked=b/30/denominator;
  return {on,blocked,free:1-on-blocked,contraction:on,diameter:1-.45*on};
 }
 root.ReceptorModels=Object.freeze({alpha1});
 if(typeof module!=='undefined')module.exports=root.ReceptorModels;
})(typeof window==='undefined'?globalThis:window);
