(() => {
  function mount(container){
    container.classList.add('respiratory-component');
    container.innerHTML=`
      <div class="lung-stage" role="img" aria-label="呼吸に合わせて膨張・収縮する肺の模式図">
        <svg viewBox="0 0 240 190" aria-hidden="true">
          <path class="trachea" d="M120 12v49M120 55L89 83M120 55l31 28"/>
          <g class="lung-shape" data-role="lungs">
            <path d="M105 59C70 55 39 75 35 123c-3 35 18 53 52 49 24-3 29-18 29-45V72z"/>
            <path d="M135 59c35-4 66 16 70 64 3 35-18 53-52 49-24-3-29-18-29-45V72z"/>
          </g>
          <path class="diaphragm" d="M42 170 Q120 145 198 170"/>
        </svg>
        <span data-role="phase">吸気</span>
      </div>
      <div class="ventilation-readout">
        <div><span>1周期</span><strong data-role="cycle">5.0秒</strong></div>
        <div><span>吸気時間</span><strong data-role="insp">1.7秒</strong></div>
        <div><span>呼気時間</span><strong data-role="exp">3.3秒</strong></div>
        <div><span>残存空気量</span><strong data-role="trap">低い</strong></div>
      </div>
      <div class="trapping-meter"><i data-role="trapBar"></i></div>
      <p class="trapping-message" data-role="message"></p>
      <div class="volume-chart">
        <div class="chart-title"><strong>肺気量の相対変化</strong><span>時間 →</span></div>
        <svg viewBox="0 0 600 160" preserveAspectRatio="none" role="img" aria-label="時間0から右へ描く肺気量の履歴">
          <line x1="34" y1="12" x2="34" y2="140"/><line x1="34" y1="140" x2="590" y2="140"/>
          <text x="4" y="18">多い</text><text x="4" y="140">少ない</text><text x="34" y="155">0</text>
          <polyline data-role="history" points=""/>
          <circle data-role="point" cx="34" cy="110" r="4"/>
        </svg>
        <small>線は時間0から現在までを書き足します。右端で記録を停止します。</small>
      </div>`;
    const q=role=>container.querySelector(`[data-role="${role}"]`);
    const history=[];
    let elapsed=0,lastNow=null,lastState=null,motion=true,frame=0;
    const duration=30;
    function draw(now){
      if(lastNow===null)lastNow=now;
      if(motion)elapsed=Math.min(duration,elapsed+(now-lastNow)/1000);
      lastNow=now;
      if(lastState&&motion){
        const level=window.RESPIRATORY_MODEL.lungLevel(lastState,elapsed);
        const phase=elapsed%lastState.cycleTime;
        const inhaling=phase<=lastState.inspiratoryTime;
        q('phase').textContent=inhaling?'吸気｜肺が膨らむ':'呼気｜肺が縮む';
        q('lungs').style.transform=`scale(${(.82+level*.30).toFixed(3)})`;
        if(!history.length||elapsed-history[history.length-1][0]>.07)history.push([elapsed,level]);
        const points=history.map(([t,v])=>`${34+t/duration*556},${140-v*118}`).join(' ');
        q('history').setAttribute('points',points);
        const last=history[history.length-1];q('point').setAttribute('cx',String(34+last[0]/duration*556));q('point').setAttribute('cy',String(140-last[1]*118));
      }
      if(elapsed<duration)frame=requestAnimationFrame(draw);
    }
    function restart(){history.length=0;elapsed=0;lastNow=null;cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);}
    return {
      render(s,options={}){
        lastState=s;motion=options.motion!==false;
        container.dataset.motion=motion?'running':'paused';
        q('cycle').textContent=`${s.cycleTime.toFixed(1)}秒`;
        q('insp').textContent=`${s.inspiratoryTime.toFixed(1)}秒`;
        q('exp').textContent=`${s.expiratoryTime.toFixed(1)}秒`;
        q('trap').textContent=s.trappingLabel;
        q('trapBar').style.width=`${s.dynamicHyperinflation.toFixed(0)}%`;
        q('message').textContent=s.airTrapping>=8?'呼気時間が不足すると、空気が肺に残りやすくなります（エアトラッピング）。':'この条件では、呼気に使える時間が比較的保たれています。';
        if(!motion)q('phase').textContent='動きを停止中';
      },
      restart,
      destroy(){cancelAnimationFrame(frame);}
    };
  }
  window.RespiratorySimulation=Object.freeze({mount});
})();
