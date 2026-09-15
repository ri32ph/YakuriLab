/* Shared anatomy from LAB 29 and vessel/heart visual language from LAB 28.
   mount(container) -> render(state). All selectors are local: several maps can coexist. */
(function(root){
function mount(container){
container.innerHTML=`<div class="regulation-map"><div class="map-topic map-heart" data-area="heart"><strong>心臓</strong><span>心拍数 ＋ 収縮力</span><b>↓ 心拍出量 CO</b></div><div class="map-anatomy"><svg viewBox="0 0 330 370" role="img" aria-label="心臓・血管・腎臓・肝臓・副腎の人体模式図"><title>RAASに関わる臓器の人体模式図</title><desc>心臓は胸部、肝臓は右上腹部、腎臓は腹部の左右、副腎は腎臓の上にあります。反応の段階に応じて臓器が強調されます。</desc><circle class="body-outline" cx="165" cy="36" r="27"/><path class="body-outline" d="M144 64 L144 80 Q105 78 96 113 L70 216 Q65 234 80 235 L112 164 L111 260 L125 353 L152 353 L165 275 L178 353 L205 353 L219 260 L218 164 L250 235 Q265 234 260 216 L234 113 Q225 78 186 80 L186 64Z"/>
<g data-organ="vessels" class="organ"><path d="M171 129 V262 M171 170 L132 201 M171 170 L203 201 M171 125 L115 111 M171 125 L216 111" fill="none" stroke="#cc6a78" stroke-width="8"/><rect class="focus-ring" x="160" y="145" width="22" height="118" rx="10"/><path d="M181 250 H245" stroke="#667085"/><text x="246" y="255">血管</text></g>
<g data-organ="heart" class="organ"><path d="M178 116 C157 91 142 125 179 151 C217 123 196 94 178 116" fill="#d95c67"/><ellipse class="focus-ring" cx="179" cy="128" rx="31" ry="29"/><path d="M204 132 H247" stroke="#667085"/><text x="249" y="137">心臓</text></g>
<g data-organ="liver" class="organ"><path d="M112 157 Q137 147 167 160 Q153 180 117 184 Q103 182 112 157" fill="#b58067"/><ellipse class="focus-ring" cx="136" cy="168" rx="36" ry="24"/><path d="M108 165 H53" stroke="#667085"/><text x="20" y="169">肝臓</text></g>
<g data-organ="kidneys" class="organ"><path d="M132 195 C104 181 107 231 132 224 Q143 219 133 210 Q124 207 132 195 M200 195 C226 181 225 231 200 224 Q189 219 199 210 Q208 207 200 195" fill="#ae718c"/><ellipse class="focus-ring" cx="123" cy="209" rx="22" ry="27"/><ellipse class="focus-ring" cx="208" cy="209" rx="22" ry="27"/><path d="M110 219 H55" stroke="#667085"/><text x="20" y="224">腎臓</text></g>
<g data-organ="adrenals" class="organ"><path d="M111 190 L122 179 L137 190Z M193 190 L208 179 L220 190Z" fill="#dfb64c"/><rect class="focus-ring" x="107" y="175" width="34" height="18" rx="7"/><rect class="focus-ring" x="189" y="175" width="35" height="18" rx="7"/><path d="M221 183 H247" stroke="#667085"/><text x="249" y="188">副腎</text></g><text x="165" y="369" text-anchor="middle" fill="#667085" font-size="11">正面から見た模式図（臓器の重なりは省略）</text></svg></div><div class="map-topic map-vessels" data-area="vessels"><strong>血管</strong><span>血管径 → TPR</span><svg class="diameter" viewBox="0 0 180 32" role="img" aria-label="血管の内腔"><rect x="5" y="1" width="170" height="30" rx="13" fill="#d9919c"/><rect data-lumen x="8" y="7" width="164" height="18" rx="8" fill="white"/></svg></div><div class="map-topic map-kidneys" data-area="kidneys"><strong>腎臓・体液量</strong><span>Na⁺・水 → 循環血液量</span><div class="volume-track" aria-hidden="true"><i data-volume></i></div><b>↓ 一回拍出量・CO</b></div><div class="map-topic map-raas" data-area="raas"><strong>RAAS</strong><span>Ang II → 血管収縮</span><span>アルドステロン</span><b>↓ Na⁺・水分保持</b></div><div class="map-equation">血圧 ≒ <span data-co>心拍出量 CO</span> × <span data-tpr>血管抵抗 TPR</span></div></div>`;
return {render(s){
 const active=s.organs||[];
 container.querySelectorAll('[data-organ]').forEach(el=>el.classList.toggle('active',active.includes(el.dataset.organ)));
 container.querySelectorAll('[data-area]').forEach(el=>el.classList.toggle('selected',el.dataset.area==='raas'?s.directions.raas!==0:active.includes(el.dataset.area)));
 const lumen=container.querySelector('[data-lumen]');lumen.setAttribute('height',s.lumen);lumen.setAttribute('y',(32-s.lumen)/2);
 container.querySelector('[data-volume]').style.width=(s.volumeLevel*100)+'%';
 container.querySelector('[data-co]').textContent='心拍出量 CO'+(s.directions.co<0?' ↓':'');
 container.querySelector('[data-tpr]').textContent='血管抵抗 TPR'+(s.directions.tpr<0?' ↓':'');
 container.querySelector('[data-organ="heart"]').classList.toggle('slower',s.directions.hr<0);
}};
}
root.CIRCULATION_MAP={mount};
})(typeof window==='undefined'?globalThis:window);
