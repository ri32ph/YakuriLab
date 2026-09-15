const assert=require('node:assert/strict');const M=require('../assets/js/intro-models.js');
for(const ka of [.18,.2,.8,2])for(let t=0;t<=24;t+=.1){const s=M.absorption(t,ka);assert(Math.abs(s.left+s.right+s.eliminated-100)<1e-9);assert(Object.values(s).every(v=>v>=-1e-9&&v<=100+1e-9));}
function peak(ka){let best={v:0,t:0};for(let t=0;t<24;t+=.01){let v=M.absorption(t,ka).right;if(v>best.v)best={v,t};}return best;}
assert(peak(2).t<peak(.2).t);assert(peak(2).v>peak(.2).v);
for(const k of [.25,1,4])for(const speed of [.1,.2,.5])for(let t=0;t<=24;t+=.1){const s=M.distribution(t,k,speed);assert(Math.abs(s.left+s.right-100)<1e-10);assert(s.left>=0&&s.right>=0);}
assert(M.distribution(24,4).left<M.distribution(24,.25).left);
assert(Math.abs(M.distribution(1000,4,.1).left-20)<1e-9);assert(Math.abs(M.distribution(1000,4,.5).left-20)<1e-9);
assert(M.distribution(1,1,.5).left<M.distribution(1,1,.1).left);
console.log('PASS absorption mass balance, equal-rate case, peak direction; distribution conservation, partition and speed');
