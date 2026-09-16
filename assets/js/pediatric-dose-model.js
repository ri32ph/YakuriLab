(() => {
  const KG_PER_LB = 0.453592;
  const ADULT_BSA = 1.73;

  const VON_HARNACK_TABLE = Object.freeze([
    { months: 216, ratio: 1, label: '成人' },
    { months: 90, ratio: 2 / 3, label: '7.5歳以上' },
    { months: 36, ratio: 1 / 3, label: '3歳以上' },
    { months: 12, ratio: 1 / 4, label: '1歳以上' },
    { months: 6, ratio: 1 / 5, label: '6か月以上' },
    { months: 3, ratio: 1 / 6, label: '3か月以上' },
    { months: 0, ratio: 1 / 8, label: '新生児〜3か月未満' }
  ]);

  const NAKAYAMA_TABLE = Object.freeze([
    { months: 216, ratio: 1, label: '成人' },
    { months: 144, ratio: 4 / 5, label: '12歳以上' },
    { months: 132, ratio: 3 / 4, label: '11歳以上' },
    { months: 120, ratio: 2 / 3, label: '10歳以上' },
    { months: 72, ratio: 1 / 2, label: '6歳以上' },
    { months: 36, ratio: 1 / 3, label: '3歳以上' },
    { months: 12, ratio: 1 / 4, label: '1歳以上' },
    { months: 6, ratio: 1 / 5, label: '6か月以上' },
    { months: 3, ratio: 1 / 6, label: '3か月以上' }
  ]);

  const SOURCES = Object.freeze({
    classical: {
      title: '古典的小児薬用量推算式の概説',
      note: 'Young、Clark、Augsberger、Crawford、von Harnackなどの式を扱う総説。',
      url: 'https://www.jstage.jst.go.jp/article/yakushi/130/4/130_4_613/_article'
    },
    mosteller: {
      title: 'Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/3657876/'
    },
    dubois: {
      title: 'Du Bois D, Du Bois EF. A formula to estimate the approximate surface area. 1916.',
      url: 'https://doi.org/10.1001/archinte.1916.00080130010002'
    },
    fujimoto: {
      title: 'Fujimoto S, Watanabe T. 日本人の体表面積に関する研究. 1967.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/6068449/'
    }
  });

  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const ratioDose = (ratio, adultDose) => ratio == null ? null : ratio * finite(adultDose);
  const tableEntry = (months, table) => table.find(entry => finite(months) >= entry.months) || null;

  function youngDose(ageYears, adultDose) {
    const age = Math.max(0, finite(ageYears));
    return ratioDose(age / (age + 12), adultDose);
  }
  function clarkDose(weightKg, adultDose) {
    return ratioDose(Math.max(0, finite(weightKg)) / KG_PER_LB / 150, adultDose);
  }
  function augsberger1Dose(weightKg, adultDose) {
    return ratioDose((Math.max(0, finite(weightKg)) * 1.5 + 10) / 100, adultDose);
  }
  function augsberger2Dose(ageYears, adultDose) {
    return ratioDose((Math.max(0, finite(ageYears)) * 4 + 20) / 100, adultDose);
  }
  function mostellerBSA(heightCm, weightKg) {
    return Math.sqrt(Math.max(0, finite(heightCm)) * Math.max(0, finite(weightKg)) / 3600);
  }
  function duboisBSA(heightCm, weightKg) {
    return 0.007184 * Math.pow(Math.max(0, finite(weightKg)), 0.425) * Math.pow(Math.max(0, finite(heightCm)), 0.725);
  }
  function fujimotoBSA(ageYears, heightCm, weightKg) {
    const age = Math.max(0, finite(ageYears));
    const h = Math.max(0, finite(heightCm));
    const w = Math.max(0, finite(weightKg));
    if (age < 1) return 0.009548 * Math.pow(w, 0.473) * Math.pow(h, 0.655);
    if (age < 6) return 0.038189 * Math.pow(w, 0.423) * Math.pow(h, 0.362);
    return 0.008883 * Math.pow(w, 0.444) * Math.pow(h, 0.663);
  }
  function crawfordDose(bsa, adultDose) {
    return ratioDose(Math.max(0, finite(bsa)) / ADULT_BSA, adultDose);
  }
  function friedDose(ageMonths, adultDose) {
    return ratioDose(Math.max(0, finite(ageMonths)) / 150, adultDose);
  }
  function lenartDose(ageYears, weightKg, adultDose) {
    return ratioDose((Math.max(0, finite(ageYears)) * 2 + Math.max(0, finite(weightKg)) + 12) / 100, adultDose);
  }
  function vonHarnack(ageMonths, adultDose, premature = false) {
    const entry = premature ? { ratio: 1 / 10, label: '未熟児（学習用区分）' } : tableEntry(ageMonths, VON_HARNACK_TABLE);
    return { ...entry, dose: ratioDose(entry?.ratio ?? null, adultDose) };
  }
  function nakayama(ageMonths, adultDose) {
    const entry = tableEntry(ageMonths, NAKAYAMA_TABLE);
    return entry ? { ...entry, dose: ratioDose(entry.ratio, adultDose) } : { ratio: null, label: '3か月未満は表の区分なし', dose: null };
  }
  function mgPerKgDaily(weightKg, mgPerKg = 10, maximum = 400, administrations = 3) {
    const calculated = Math.max(0, finite(weightKg)) * Math.max(0, finite(mgPerKg));
    const capped = Math.min(calculated, Math.max(0, finite(maximum, Infinity)));
    return { calculated, daily: capped, capped: capped < calculated, perDose: capped / Math.max(1, finite(administrations, 1)) };
  }
  function calculate(patient, options = {}) {
    const ageMonths = Math.max(0, finite(patient.ageYears) * 12 + finite(patient.extraMonths));
    const ageYears = ageMonths / 12;
    const adultDose = Math.max(0, finite(patient.adultDose));
    const weight = Math.max(0, finite(patient.weightKg));
    const height = Math.max(0, finite(patient.heightCm));
    const bsas = {
      mosteller: mostellerBSA(height, weight),
      dubois: duboisBSA(height, weight),
      fujimoto: fujimotoBSA(ageYears, height, weight)
    };
    const bsaMethod = ['mosteller', 'dubois', 'fujimoto'].includes(options.bsaMethod) ? options.bsaMethod : 'mosteller';
    const harnack = vonHarnack(ageMonths, adultDose, options.premature);
    const nak = nakayama(ageMonths, adultDose);
    const make = (id, name, category, dose, extra = {}) => ({ id, name, category, dose, ratio: dose == null || !adultDose ? null : dose / adultDose, ...extra });
    return {
      ageMonths, ageYears, adultDose, weight, height, bsas, bsaMethod,
      basic: [
        make('young', 'Young', '年齢', youngDose(ageYears, adultDose)),
        make('clark', 'Clark', '体重', clarkDose(weight, adultDose)),
        make('augsberger2', 'Augsberger II', '年齢', augsberger2Dose(ageYears, adultDose)),
        make('crawford', 'Crawford', '体表面積', crawfordDose(bsas[bsaMethod], adultDose), { bsa: bsas[bsaMethod] }),
        make('harnack', 'von Harnack', '換算表', harnack.dose, { bracket: harnack.label }),
        make('nakayama', '中山', '換算表', nak.dose, { bracket: nak.label })
      ],
      advanced: [
        make('augsberger1', 'Augsberger I', '体重', augsberger1Dose(weight, adultDose)),
        make('fried', 'Fried', '月齢', friedDose(ageMonths, adultDose)),
        make('lenart', 'Lenart', '年齢＋体重', lenartDose(ageYears, weight, adultDose))
      ],
      mgkg: mgPerKgDaily(weight, options.mgPerKg ?? 10, options.maximum ?? 400, options.administrations ?? 3)
    };
  }

  window.PEDIATRIC_DOSE_MODEL = Object.freeze({
    KG_PER_LB, ADULT_BSA, VON_HARNACK_TABLE, NAKAYAMA_TABLE, SOURCES,
    youngDose, clarkDose, augsberger1Dose, augsberger2Dose, mostellerBSA,
    duboisBSA, fujimotoBSA, crawfordDose, friedDose, lenartDose,
    vonHarnack, nakayama, mgPerKgDaily, calculate
  });
})();
