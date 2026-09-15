/* Teaching-only changes around baseline 1; no clinical calibration. */
(function(root){
 const competition=(a,b)=>{const aa=Math.max(0,a)/30,bb=Math.max(0,b)/30,den=1+aa+bb;return {on:aa/den,blocked:bb/den,free:1/den};};
 function state(kind,a,b){const f=competition(a,b),q=f.on;return {...f,response:q,rate:kind==='16'?1+.6*q:kind==='18'?1-.45*q:1,force:kind==='16'?1+.8*q:1,diameter:kind==='17'?1+.4*q:kind==='18'?1-.3*q:1,secretion:kind==='18'?1+.8*q:1};}
 root.AutonomicModels=Object.freeze({competition,state});if(typeof module!=='undefined')module.exports=root.AutonomicModels;
})(typeof window==='undefined'?globalThis:window);
