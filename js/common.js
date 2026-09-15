/* Shared helpers. Classic scripts keep the site usable directly from disk. */
window.Lab = Object.freeze({
  select: selector => document.querySelector(selector),
  decay: (amount, dt, halfLife) => amount * Math.pow(0.5, dt / halfLife),
  points: values => values.map(point => point.join(',')).join(' ')
});
