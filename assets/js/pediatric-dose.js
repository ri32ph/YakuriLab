(() => {
  const M = window.PEDIATRIC_DOSE_MODEL;
  const $ = id => document.getElementById(id);
  const controls = {
    age: { range: $('ageRange'), number: $('ageNumber') },
    weight: { range: $('weightRange'), number: $('weightNumber') },
    height: { range: $('heightRange'), number: $('heightNumber') },
    adult: { range: $('adultRange'), number: $('adultNumber') }
  };
  let selected = 'young';
  let comparison = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));
  const fmt = (value, digits = 0) => value == null || !Number.isFinite(value) ? '—' : value.toLocaleString('ja-JP', { maximumFractionDigits: digits, minimumFractionDigits: digits });
  const categoryClass = category => ({ '年齢': 'age', '月齢': 'age', '体重': 'weight', '体表面積': 'bsa', '年齢＋体重': 'combo', '換算表': 'table' }[category] || 'age');
  const patient = () => ({
    ageYears: Number(controls.age.number.value), extraMonths: Number($('monthNumber').value),
    weightKg: Number(controls.weight.number.value), heightCm: Number(controls.height.number.value),
    adultDose: Number(controls.adult.number.value)
  });
  const options = () => ({ bsaMethod: $('bsaMethod').value, premature: $('premature').checked, mgPerKg: 10, maximum: 400, administrations: 3 });

  function sync(key, source) {
    const pair = controls[key];
    const min = Number(source.min), max = Number(source.max);
    const value = clamp(source.value, min, max);
    pair.range.value = value; pair.number.value = value;
    render();
  }

  function resultRow(item) {
    const percent = item.ratio == null ? null : item.ratio * 100;
    const detail = item.bracket ? item.bracket : `${item.category}を使う`;
    return `<button type="button" class="result-row" data-method="${item.id}" data-category="${categoryClass(item.category)}" aria-pressed="${selected === item.id}">
      <span class="result-name"><strong>${item.name}</strong><small>${detail}</small></span>
      <strong class="result-dose">${item.dose == null ? '—' : `${fmt(item.dose)} mg`}</strong>
      <span class="result-bar" aria-hidden="true"><i style="width:${Math.min(100, Math.max(0, percent || 0))}%"></i></span>
      <span class="result-percent">${percent == null ? '区分なし' : `${fmt(percent)}%`}</span>
    </button>`;
  }

  function stepsFor(id, state) {
    const age = state.ageYears, w = state.weight, h = state.height, adult = state.adultDose;
    const item = [...state.basic, ...state.advanced].find(x => x.id === id) || state.basic[0];
    const bsaName = { mosteller: 'Mosteller', dubois: 'Du Bois', fujimoto: '藤本' }[state.bsaMethod];
    const entries = {
      young: [`年齢 ${fmt(age, 2)}歳`, `${fmt(age, 2)} ÷ (${fmt(age, 2)}＋12)`, `割合 ${fmt(item.ratio * 100, 1)}%`, `${fmt(adult)} × ${fmt(item.ratio, 3)}`, `推算量 ${fmt(item.dose)} mg`],
      clark: [`${fmt(w, 1)} kg`, `${fmt(w / M.KG_PER_LB, 1)} lb`, `${fmt(w / M.KG_PER_LB, 1)} ÷ 150`, `割合 ${fmt(item.ratio * 100, 1)}%`, `推算量 ${fmt(item.dose)} mg`],
      augsberger2: [`年齢 ${fmt(age, 2)}歳`, `${fmt(age, 2)} × 4 ＋ 20`, `割合 ${fmt(item.ratio * 100, 1)}%`, `推算量 ${fmt(item.dose)} mg`],
      crawford: [`身長 ${fmt(h)} cm ＋ 体重 ${fmt(w, 1)} kg`, `${bsaName}式`, `BSA ${fmt(item.bsa, 3)} m²`, `${fmt(item.bsa, 3)} ÷ 1.73`, `推算量 ${fmt(item.dose)} mg`],
      harnack: [`年齢区分：${item.bracket}`, `成人量の ${item.ratio == null ? '—' : fmt(item.ratio * 100, 1) + '%'}`, `区分間の補間なし`, `推算量 ${item.dose == null ? '—' : fmt(item.dose) + ' mg'}`],
      nakayama: [`年齢区分：${item.bracket}`, `成人量の ${item.ratio == null ? '—' : fmt(item.ratio * 100, 1) + '%'}`, `区分間の補間なし`, `推算量 ${item.dose == null ? '—' : fmt(item.dose) + ' mg'}`],
      augsberger1: [`体重 ${fmt(w, 1)} kg`, `(${fmt(w, 1)} × 1.5 ＋ 10) ÷ 100`, `割合 ${fmt(item.ratio * 100, 1)}%`, `推算量 ${fmt(item.dose)} mg`],
      fried: [`月齢 ${fmt(state.ageMonths)}か月`, `${fmt(state.ageMonths)} ÷ 150`, `割合 ${fmt(item.ratio * 100, 1)}%`, `推算量 ${fmt(item.dose)} mg`],
      lenart: [`年齢 ${fmt(age, 2)}歳 ＋ 体重 ${fmt(w, 1)} kg`, `(${fmt(age, 2)} × 2 ＋ ${fmt(w, 1)} ＋ 12) ÷ 100`, `割合 ${fmt(item.ratio * 100, 1)}%`, `推算量 ${fmt(item.dose)} mg`]
    };
    return { item, steps: entries[item.id] || [] };
  }

  function renderMethod(state) {
    const { item, steps } = stepsFor(selected, state);
    $('methodTitle').textContent = `${item.name}${item.category === '換算表' ? '換算表' : '式'}の計算`;
    $('methodCategory').textContent = item.category;
    $('methodCategory').className = `category ${categoryClass(item.category)}`;
    $('calculationSteps').innerHTML = steps.map((step, index) => `<span${index === steps.length - 1 ? ' class="final-step"' : ''}>${step}</span>${index < steps.length - 1 ? '<b>→</b>' : ''}`).join('');
    const source = item.id === 'crawford' ? M.SOURCES[state.bsaMethod] : M.SOURCES.classical;
    $('sourceDetail').innerHTML = `<strong>${source.title}</strong><p>${source.note || '原著情報を確認できます。'}</p><a href="${source.url}" target="_blank" rel="noreferrer">資料を開く ↗</a>`;
    const showBsa = item.id === 'crawford';
    $('bsaVisual').hidden = !showBsa;
    if (showBsa) {
      $('bsaValue').textContent = `BSA ${fmt(item.bsa, 3)} m²`;
      const heightScale = clamp(state.height / 115, .7, 1.35);
      const widthScale = clamp(Math.sqrt(state.weight / 20), .7, 1.45);
      $('childFigure').style.transform = `scale(${widthScale},${heightScale})`;
    }
  }

  function renderAdvanced(state) {
    const labels = { mosteller: 'Mosteller', dubois: 'Du Bois', fujimoto: '藤本' };
    $('bsaComparison').innerHTML = Object.entries(state.bsas).map(([id, value]) => `<div><span>${labels[id]}${id === state.bsaMethod ? '（選択中）' : ''}</span><strong>${fmt(value, 3)} m²</strong></div>`).join('');
    $('advancedResults').innerHTML = state.advanced.map(item => `<div><span>${item.name} <small>${item.category}</small></span><strong>${fmt(item.dose)} mg · ${fmt(item.ratio * 100)}%</strong></div>`).join('');
  }

  function renderMgKg(state) {
    const m = state.mgkg;
    $('mgkgFlow').innerHTML = `<div><span>${fmt(state.weight, 1)} kg × 10 mg/kg/日</span><strong>${fmt(m.calculated)} mg/日</strong>${m.capped ? `<span>↓ 最大量を適用</span><strong class="cap">${fmt(m.daily)} mg/日</strong>` : ''}<span>↓ 3回に分ける</span><b>1回あたり約 ${fmt(m.perDose, 1)} mg</b></div>`;
    const weights = [10, 20, 30, 40, 50];
    $('mgkgBars').innerHTML = weights.map(weight => {
      const value = M.mgPerKgDaily(weight, 10, 400, 3);
      return `<div class="mgkg-row${Math.abs(weight - state.weight) < 1 ? ' current' : ''}"><span>${weight} kg</span><span class="mgkg-track"><i style="width:${value.daily / 4}%"></i></span><strong>${fmt(value.daily)} mg/日${value.capped ? ' 上限' : ''}</strong></div>`;
    }).join('');
  }

  function compareCard(label, p, state) {
    const by = id => state.basic.find(x => x.id === id);
    return `<div class="patient-card"><h3>${label}｜${p.ageYears}歳・${p.weightKg} kg・${p.heightCm} cm</h3><ul><li>Young（年齢）：${fmt(by('young').dose)} mg</li><li>Clark（体重）：${fmt(by('clark').dose)} mg</li><li>Crawford（BSA）：${fmt(by('crawford').dose)} mg</li></ul></div>`;
  }

  function renderComparison() {
    const box = $('patientComparison');
    if (!comparison) { box.hidden = true; return; }
    const common = { adultDose: Number(controls.adult.number.value), extraMonths: 0 };
    let a, b, conclusion;
    if (comparison === 'sameAge') {
      a = { ...common, ageYears: 6, weightKg: 15, heightCm: 105 };
      b = { ...common, ageYears: 6, weightKg: 30, heightCm: 130 };
      conclusion = '年齢式は同じ値、体重式・BSA式は異なる値になります。年齢が同じでも体格は同じとは限りません。';
    } else {
      a = { ...common, ageYears: 3, weightKg: 20, heightCm: 95 };
      b = { ...common, ageYears: 9, weightKg: 20, heightCm: 132 };
      conclusion = '体重式は同じ値、年齢式は異なる値になります。同じ体重でも発達段階は同じとは限りません。';
    }
    const sa = M.calculate(a, options()), sb = M.calculate(b, options());
    box.hidden = false;
    box.innerHTML = compareCard('A', a, sa) + compareCard('B', b, sb) + `<div class="comparison-conclusion">${conclusion}</div>`;
  }

  function renderSources() {
    $('allSources').innerHTML = Object.values(M.SOURCES).map(source => `<p><a href="${source.url}" target="_blank" rel="noreferrer">${source.title} ↗</a>${source.note ? `<br><span class="small">${source.note}</span>` : ''}</p>`).join('');
  }

  function render() {
    const state = M.calculate(patient(), options());
    $('ageOutput').textContent = `${controls.age.number.value}歳${$('monthNumber').value}か月`;
    $('weightOutput').textContent = `${fmt(state.weight, 1)} kg`;
    $('heightOutput').textContent = `${fmt(state.height)} cm`;
    $('adultOutput').textContent = `${fmt(state.adultDose)} mg`;
    $('patientChip').textContent = `${controls.age.number.value}歳${$('monthNumber').value}か月・${fmt(state.weight, 1)} kg・${fmt(state.height)} cm`;
    $('adultReference').textContent = `${fmt(state.adultDose)} mg`;
    $('resultList').innerHTML = state.basic.map(resultRow).join('');
    const doses = state.basic.map(x => x.dose).filter(Number.isFinite);
    const range = Math.max(...doses) - Math.min(...doses);
    $('spreadNote').textContent = `同じ子どもでも、この条件では最大と最小の推算値に約 ${fmt(range)} mg の差があります。式が見ている情報を確かめよう。`;
    renderMethod(state); renderAdvanced(state); renderMgKg(state); renderComparison();
  }

  Object.entries(controls).forEach(([key, pair]) => {
    pair.range.addEventListener('input', () => sync(key, pair.range));
    pair.number.addEventListener('input', () => sync(key, pair.number));
  });
  $('monthNumber').addEventListener('input', event => { event.target.value = clamp(event.target.value, 0, 11); render(); });
  $('bsaMethod').addEventListener('change', render);
  $('premature').addEventListener('change', render);
  $('resultList').addEventListener('click', event => {
    const row = event.target.closest('[data-method]'); if (!row) return;
    selected = row.dataset.method; render();
  });
  $('sourceButton').addEventListener('click', () => {
    const hidden = !$('sourceDetail').hidden;
    $('sourceDetail').hidden = hidden; $('sourceButton').setAttribute('aria-expanded', String(!hidden));
  });
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    const preset = button.dataset.preset;
    comparison = ['sameAge', 'sameWeight'].includes(preset) ? preset : null;
    if (preset === 'age') { controls.age.number.value = controls.age.number.value === '10' ? 4 : 10; controls.age.range.value = controls.age.number.value; $('presetMessage').textContent = '体重・身長を固定しました。年齢を使わない式は動きません。'; }
    if (preset === 'weight') { controls.weight.number.value = controls.weight.number.value === '35' ? 15 : 35; controls.weight.range.value = controls.weight.number.value; $('presetMessage').textContent = '年齢・身長を固定しました。年齢だけを使う式は動きません。'; }
    if (preset === 'height') { controls.height.number.value = controls.height.number.value === '140' ? 95 : 140; controls.height.range.value = controls.height.number.value; $('presetMessage').textContent = '年齢・体重を固定しました。主にBSAを使う式が動きます。'; }
    if (preset === 'sameAge') $('presetMessage').textContent = '下の比較欄で、6歳のAとBを比べています。';
    if (preset === 'sameWeight') $('presetMessage').textContent = '下の比較欄で、同じ20 kgのAとBを比べています。';
    render(); if (comparison) $('patientComparison').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }));
  $('reset').addEventListener('click', () => {
    const defaults = { age: 6, weight: 20, height: 115, adult: 500 };
    Object.entries(defaults).forEach(([key, value]) => { controls[key].range.value = value; controls[key].number.value = value; });
    $('monthNumber').value = 0; $('bsaMethod').value = 'mosteller'; $('premature').checked = false;
    comparison = null; selected = 'young'; $('presetMessage').textContent = 'どの式が動き、どの式が動かないかを見てみよう。'; render();
  });

  renderSources(); render();
})();
