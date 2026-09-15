/* Exact event stepping: decay up to a dose, record trough, then record peak. */
window.Lab = Object.freeze({...Lab, startRepeatedDose({steady = false} = {}) {
  const $ = Lab.select, H = $('#half'), I = $('#int'), D = $('#dosev');
  const T = 60;
  let active = false, paused = false, t = 0, amount = 0, next = 0, count = 0;
  let last = performance.now(), history = [];
  const ratio = () => Math.pow(.5, +I.value / +H.value);
  const peak = () => +D.value / (1 - ratio());
  const maxY = () => Math.max(200, peak() * 1.25);
  const xy = (time, value) => [60 + time / T * 730, 260 - value / maxY() * 225];
  function labels() {
    $('#hv').textContent = H.value + '時間';
    $('#iv').textContent = I.value + '時間';
    $('#dv').textContent = D.value;
    if (steady) {
      const band = $('#steadyBand');
      band.setAttribute('y', xy(0, peak())[1]);
      band.setAttribute('height', (peak() - peak() * ratio()) / maxY() * 225);
    }
  }
  function record() { history.push(xy(t, amount)); }
  function dose() {
    amount += +D.value; count++;
    const mark = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const x = xy(t, 0)[0];
    Object.entries({x1:x,x2:x,y1:30,y2:260,stroke:'#dbe2ea','stroke-dasharray':'3 6'}).forEach(([k,v])=>mark.setAttribute(k,v));
    $('#marks').append(mark); record();
  }
  function render() {
    $('#line').setAttribute('points', Lab.points(history));
    const point = xy(t, amount);
    $('#dot').setAttribute('cx', point[0]); $('#dot').setAttribute('cy', point[1]);
    $('#dot').setAttribute('visibility', 'visible');
    $('#ct').textContent = Math.round(amount);
    $('#water').setAttribute('fill', `rgba(217,92,92,${Math.min(.75,amount/maxY()*.75)})`);
    $('#count').textContent = count + '回'; $('#clock').textContent = t.toFixed(1) + '時間';
    // Compare with the steady-state value at the SAME phase of the dosing interval.
    $('#now').textContent = steady ? Math.round((1 - Math.pow(ratio(), count)) * 100) + '%' : Math.round(amount);
  }
  function reset() {
    active = paused = false; t = amount = next = count = 0; history = [];
    $('#line').setAttribute('points',''); $('#marks').replaceChildren();
    $('#ct').textContent = '0'; $('#water').setAttribute('fill','rgba(217,92,92,0)');
    $('#count').textContent='0回'; $('#clock').textContent='0.0時間'; $('#now').textContent='—';
    $('#dot').setAttribute('visibility','hidden'); $('#pause').disabled=true;
    $('#pause').textContent='一時停止'; $('#status').textContent='待機中'; labels();
  }
  $('#start').onclick = () => {reset();active=true;dose();next=+I.value;$('#pause').disabled=false;$('#status').textContent='実験中';last=performance.now();render();};
  $('#pause').onclick = () => {paused=!paused;$('#pause').textContent=paused?'再開':'一時停止';$('#status').textContent=paused?'一時停止':'実験中';last=performance.now();};
  $('#reset').onclick=reset;
  [H,I,D].forEach(el=>el.oninput=reset);
  function loop(now) {
    const dt=Math.min(.08,(now-last)/1000)*4; last=now;
    if(active&&!paused) {
      const end=Math.min(T,t+dt);
      while(next<=end) {
        amount=Lab.decay(amount,next-t,+H.value);t=next;record();dose();next+=+I.value;
      }
      amount=Lab.decay(amount,end-t,+H.value);t=end;record();render();
      if(t>=T){active=false;$('#status').textContent='終了';$('#pause').disabled=true;}
    }
    requestAnimationFrame(loop);
  }
  reset();requestAnimationFrame(loop);
}});
