/* Schematic signal models. Time is deliberately stretched and dimensionless. */
(function(root){
 const threshold=50;
 function wave(age){
  if(age<0||age>=1)return -70;
  if(age<.2)return -70+110*age/.2;
  if(age<.55)return 40-110*(age-.2)/.35;
  if(age<.7)return -70-10*(age-.55)/.15;
  return -80+10*(age-.7)/.3;
 }
 function potential(t,strength=65,speed=1,segment=5){
  return strength>=threshold?wave(t-(1+segment*.8/speed)):-70;
 }
 function depolarization(t,strength=65){
  if(t<0||t>1)return -70;
  if(strength>=threshold)return wave(t);
  const peak=-70+strength*.4;
  return t<.35?-70+(peak+70)*t/.35:peak+(-70-peak)*(t-.35)/.65;
 }
 function synapse(t,release=100,clearance=.8){
  const age=Math.max(0,t-1),duration=Math.min(age,1);
  // Constant secretion for one teaching-time unit, then exponential removal.
  const amount=release/clearance*(1-Math.exp(-clearance*duration))*Math.exp(-clearance*Math.max(0,age-1));
  return {amount,response:100*amount/(amount+25),released:release*duration,removed:Math.max(0,release*duration-amount)};
 }
 root.NeuralModels=Object.freeze({threshold,wave,potential,depolarization,synapse});
 if(typeof module!=='undefined')module.exports=root.NeuralModels;
})(typeof window==='undefined'?globalThis:window);
