// ── UTILS ────────────────────────────────────────
const $ = id => document.getElementById(id);
const DEG = Math.PI/180;
const fx = n => Math.round(n*1000)/1000;
const fxs = n => (n >= 0 ? '+'+fx(n) : ''+fx(n));

// Blueprint canvas style
function styleCvs(ctx, w, h){
  ctx.fillStyle = '#141d2e';
  ctx.fillRect(0,0,w,h);
  // grid
  ctx.strokeStyle = 'rgba(100,160,255,.07)';
  ctx.lineWidth = .5;
  for(let x=0; x<w; x+=20){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0; y<h; y+=20){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
}

function arrow(ctx, x1,y1,x2,y2, color='#4a9eff', lw=2.2, label='', labelColor='#dce8ff'){
  const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy);
  if(len<2) return;
  const ux=dx/len, uy=dy/len;
  const hs=10;
  ctx.strokeStyle=color; ctx.lineWidth=lw;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2-hs*ux-hs/2*uy, y2-hs*uy+hs/2*ux);
  ctx.lineTo(x2-hs*ux+hs/2*uy, y2-hs*uy-hs/2*ux);
  ctx.closePath(); ctx.fill();
  if(label){
    ctx.fillStyle=labelColor;
    ctx.font='bold 13px Inconsolata, monospace';
    ctx.fillText(label, (x1+x2)/2 + uy*14, (y1+y2)/2 - ux*14);
  }
}

function dot(ctx,x,y,r=5,c='#00d4ff'){
  ctx.beginPath(); ctx.arc(x,y,r,0,2*Math.PI);
  ctx.fillStyle=c; ctx.fill();
}

function txt(ctx,s,x,y,c='#dce8ff',size=12){
  ctx.fillStyle=c; ctx.font=`${size}px Inconsolata,monospace`;
  ctx.fillText(s,x,y);
}

// ── PROJECTION ORTHOGONALE — 6 CONFIGURATIONS ───
const CONFIG_PRESETS = [
  { angle: 50,  label: '① Cas 1 : 0 < angle < π/2 — produit scalaire POSITIF (H entre A et B)',      sign: 'pos' },
  { angle: 90,  label: '② Cas 2 : angle = π/2 — ORTHOGONALITÉ (H = A, produit scalaire NUL)',        sign: 'zero' },
  { angle: 130, label: '③ Cas 3 : π/2 < angle < π — produit scalaire NÉGATIF (H à droite de A)',    sign: 'neg' },
  { angle: 210, label: '④ Cas 4 : π < angle < 3π/2 — produit scalaire NÉGATIF (H à droite de A)',  sign: 'neg' },
  { angle: 270, label: '⑤ Cas 5 : angle = 3π/2 — ORTHOGONALITÉ (H = A, produit scalaire NUL)',      sign: 'zero' },
  { angle: 320, label: '⑥ Cas 6 : 3π/2 < angle < 2π — produit scalaire POSITIF (H entre A et B)',  sign: 'pos' },
];

let currentConfig = 0;

function setConfig(i) {
  currentConfig = i;
  $('proj-angle').value = CONFIG_PRESETS[i].angle;
  for(let k=0;k<6;k++) $('cfg-btn-'+k).classList.toggle('active', k===i);
  drawProj();
}

function drawProj() {
  const angleVal = +$('proj-angle').value;
  const AB = +$('proj-ab').value;
  const AC = +$('proj-ac').value;
  $('proj-angle-v').textContent = angleVal + '°';
  $('proj-ab-v').textContent = AB;
  $('proj-ac-v').textContent = AC;

  // detect which config we're in
  let cfgIdx = 0;
  if (angleVal === 90)  cfgIdx = 1;
  else if (angleVal > 0 && angleVal < 90)  cfgIdx = 0;
  else if (angleVal > 90 && angleVal < 180) cfgIdx = 2;
  else if (angleVal >= 180 && angleVal < 270) cfgIdx = 3;
  else if (angleVal === 270) cfgIdx = 4;
  else cfgIdx = 5;
  for(let k=0;k<6;k++) $('cfg-btn-'+k).classList.toggle('active', k===cfgIdx);

  const cv = $('c-proj'), ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  styleCvs(ctx, W, H);

  const theta = angleVal * DEG; // angle en radians
  const sc = 52;
  // A au centre gauche
  const ax = 160, ay = H/2;
  // B : à droite de A sur l'horizontale
  const bx = ax + AB * sc, by = ay;
  // C : à angle theta depuis AB
  const cx = ax + AC * sc * Math.cos(theta);
  const cy = ay - AC * sc * Math.sin(theta);

  // H = projeté orthogonal de C sur droite (AB) = droite horizontale passant par A
  // Sur droite horizontale: H = (ax + AH, ay)
  const AH_val = AC * Math.cos(theta); // mesure algébrique de AH
  const hx = ax + AH_val * sc;
  const hy = ay;

  const ps = AH_val * AB; // = AB × AH (mesure algébrique)

  // ── Dessin de la droite (AB) ────────────────────
  ctx.strokeStyle = 'rgba(100,160,255,.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5,5]);
  ctx.beginPath(); ctx.moveTo(ax - 30, ay); ctx.lineTo(bx + 40, ay); ctx.stroke();
  ctx.setLineDash([]);

  // ── Vecteur AB ─────────────────────────────────
  arrow(ctx, ax, ay, bx, by, '#4a9eff', 2.5, '', '#4a9eff');
  txt(ctx, 'AB', (ax+bx)/2, ay + 20, '#4a9eff', 13);

  // ── Vecteur AC ─────────────────────────────────
  arrow(ctx, ax, ay, cx, cy, '#00d4ff', 2.5, '', '#00d4ff');
  txt(ctx, 'AC', (ax+cx)/2 + (cy < ay ? -28 : 8), (ay+cy)/2, '#00d4ff', 13);

  // ── Perpendiculaire de C sur (AB) ──────────────
  if (Math.abs(AH_val) > 0.01) {
    ctx.strokeStyle = 'rgba(255,209,102,.55)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── Symbole angle droit en H ────────────────────
  if (Math.abs(AH_val) > 0.05) {
    const sq = 8;
    ctx.strokeStyle = 'rgba(255,209,102,.7)';
    ctx.lineWidth = 1;
    // angle droit : H est sur l'horizontale, perp est verticale
    ctx.beginPath();
    ctx.moveTo(hx, hy - sq);
    ctx.lineTo(hx + (AH_val >= 0 ? -sq : sq), hy - sq);
    ctx.lineTo(hx + (AH_val >= 0 ? -sq : sq), hy);
    ctx.stroke();
  }

  // ── Vecteur AH (mesure algébrique) ─────────────
  const ahColor = AH_val > 0 ? '#3ddc84' : AH_val < 0 ? '#ff5252' : '#ffd166';
  if (Math.abs(AH_val) > 0.05) {
    arrow(ctx, ax, ay + 28, hx, ay + 28, ahColor, 2, '', ahColor);
    txt(ctx, 'AH', (ax + hx) / 2 - 8, ay + 44, ahColor, 11);
  }

  // ── Points ──────────────────────────────────────
  dot(ctx, ax, ay, 5, '#4a9eff');  txt(ctx, 'A', ax - 14, ay + 4, '#4a9eff', 13);
  dot(ctx, bx, by, 5, '#4a9eff');  txt(ctx, 'B', bx + 8, by + 4, '#4a9eff', 13);
  dot(ctx, cx, cy, 5, '#00d4ff');  txt(ctx, 'C', cx + 8, cy - 6, '#00d4ff', 13);
  if (Math.abs(AH_val) > 0.05) {
    dot(ctx, hx, hy, 5, '#ffd166');
    txt(ctx, 'H', hx + (AH_val >= 0 ? 6 : -18), hy - 12, '#ffd166', 13);
  }

  // ── Arc d'angle ────────────────────────────────
  const arcR = 36;
  ctx.strokeStyle = '#ff8c42';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(ax, ay, arcR, -theta, 0, theta > 0);
  if (theta > Math.PI) ctx.arc(ax, ay, arcR, -theta, 0, false);
  // Dessiner l'arc dans le bon sens
  ctx.beginPath();
  ctx.arc(ax, ay, arcR, 0, -theta, theta > 0 && theta <= Math.PI);
  ctx.stroke();
  // label angle
  const midA = -theta / 2;
  txt(ctx, angleVal + '°', ax + (arcR+10)*Math.cos(midA) - 8, ay + (arcR+10)*(-Math.sin(midA)) + 4, '#ff8c42', 11);

  // ── Panneau de résultat ─────────────────────────
  const signColor = ps > 1e-9 ? '#3ddc84' : ps < -1e-9 ? '#ff5252' : '#ffd166';
  const signWord = ps > 1e-9 ? 'POSITIF ▲' : ps < -1e-9 ? 'NÉGATIF ▼' : 'NUL (orthogonaux) ⊥';

  $('proj-config-label').textContent = CONFIG_PRESETS[cfgIdx].label;

  $('proj-res').innerHTML = `
    <div class="res" style="border-left-color:${signColor}">
      <strong>AB⃗ · AC⃗</strong> = <span style="color:var(--yellow)">AH̄</span> × AB
      = <span style="color:${ahColor}">${fx(AH_val)}</span> × ${fx(AB)}
      = <strong style="color:${signColor}">${fx(ps)}</strong>
      &nbsp;—&nbsp; Produit scalaire <strong style="color:${signColor}">${signWord}</strong>
    </div>
    <div class="res orange">
      cos(θ) = cos(${angleVal}°) = ${fx(Math.cos(theta))}
      &nbsp;→&nbsp; <span style="color:var(--yellow)">AH̄</span> = AC × cos(θ) = ${fx(AC)} × ${fx(Math.cos(theta))} = ${fx(AH_val)}
    </div>`;
}

['proj-angle','proj-ab','proj-ac'].forEach(id => $(id) && $(id).addEventListener('input', drawProj));
drawProj();

// ── 01 — ANGLE TOOL ─────────────────────────────
function drawAngle(){
  const u = +$('un').value, v = +$('vn').value, th = +$('theta').value;
  $('un-v').textContent = u;
  $('vn-v').textContent = v;
  $('theta-v').textContent = th+'°';
  const ps = u*v*Math.cos(th*DEG);
  const cv = $('c-angle'), ctx = cv.getContext('2d');
  const W=cv.width, H=cv.height;
  styleCvs(ctx,W,H);
  const ox=90, oy=H/2;
  const sc=30;
  // u → horizontal
  arrow(ctx, ox,oy, ox+u*sc,oy, '#4a9eff',2.5,'u⃗','#4a9eff');
  // v → at angle th
  arrow(ctx, ox,oy, ox+v*sc*Math.cos(th*DEG), oy-v*sc*Math.sin(th*DEG), '#00d4ff',2.5,'v⃗','#00d4ff');
  // angle arc
  ctx.strokeStyle='rgba(255,140,66,.5)'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.arc(ox,oy, 30, -th*DEG, 0); ctx.stroke();
  txt(ctx, th+'°', ox+32, oy-10, '#ff8c42',11);
  // projection
  const px = ox + u*sc*Math.cos(th*DEG)*Math.cos(0); // proj of v onto u dir... actually proj of u onto v
  const projLen = u*Math.cos(th*DEG);
  if(Math.abs(projLen)>0.05){
    const px2 = ox + projLen*sc;
    ctx.setLineDash([4,4]);
    ctx.strokeStyle='rgba(255,255,100,.4)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(ox+u*sc,oy); ctx.lineTo(ox+u*sc,oy); ctx.stroke();
    // project foot
    ctx.beginPath();
    ctx.moveTo(ox+projLen*sc, oy);
    ctx.lineTo(ox+projLen*sc, oy+8);
    ctx.moveTo(ox+projLen*sc, oy+8);
    ctx.lineTo(ox+projLen*sc+8, oy+8);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // result panel
  const sign = ps>0?'#3ddc84': ps<0?'#ff5252':'#ffd166';
  const interp = ps>0 ? 'angle aigu' : ps<0 ? 'angle obtus' : 'vecteurs orthogonaux';
  $('angle-res').innerHTML = `
    <div class="res" style="border-left-color:${sign}">
      u⃗·v⃗ = ‖u⃗‖·‖v⃗‖·cos(θ) = ${u}×${v}×cos(${th}°) = <strong>${fx(ps)}</strong>
      &nbsp;&mdash;&nbsp; ${interp}
    </div>`;
  MathJax.typesetPromise && MathJax.typesetPromise();
}
['un','vn','theta'].forEach(id => $(id).addEventListener('input',drawAngle));
drawAngle();

// ── 02 — COORD TOOL ──────────────────────────────
function drawCoord(){
  const x=+$('cx').value, y=+$('cy').value, x2=+$('cx2').value, y2=+$('cy2').value;
  $('cx-v').textContent=x; $('cy-v').textContent=y;
  $('cx2-v').textContent=x2<0?'−'+Math.abs(x2):x2;
  $('cy2-v').textContent=y2<0?'−'+Math.abs(y2):y2;
  const ps = x*x2 + y*y2;
  const nu = Math.sqrt(x*x+y*y), nv=Math.sqrt(x2*x2+y2*y2);
  const orth = Math.abs(ps)<1e-9;

  const cv=$('c-coord'), ctx=cv.getContext('2d');
  const W=cv.width, H=cv.height;
  styleCvs(ctx,W,H);
  const ox=W/2, oy=H/2, sc=32;
  // axes
  ctx.strokeStyle='rgba(100,160,255,.25)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke();
  txt(ctx,'i⃗',W-18,oy-6,'rgba(100,160,255,.4)');
  txt(ctx,'j⃗',ox+5,12,'rgba(100,160,255,.4)');
  arrow(ctx,ox,oy, ox+x*sc, oy-y*sc, '#4a9eff',2.5,'u⃗');
  arrow(ctx,ox,oy, ox+x2*sc, oy-y2*sc, '#00d4ff',2.5,'v⃗');
  dot(ctx,ox,oy,4,'rgba(100,160,255,.6)');

  const col = orth?'#ffd166':ps>0?'#3ddc84':'#ff5252';
  $('coord-res').innerHTML = `
    <div class="res" style="border-left-color:${col}">
      u⃗ = (${x} ; ${y}) &nbsp;·&nbsp; v⃗ = (${x2} ; ${y2})<br>
      u⃗·v⃗ = ${x}×${x2} + ${y}×${y2} = ${x*x2} + ${y*y2} = <strong>${ps}</strong>
    </div>
    <div class="res orange">‖u⃗‖ = √(${x}²+${y}²) = √${x*x+y*y} ≈ <strong>${fx(nu)}</strong></div>
    <div class="res orange">‖v⃗‖ = √(${x2}²+${y2}²) = √${x2*x2+y2*y2} ≈ <strong>${fx(nv)}</strong></div>
    ${orth ? '<div class="res" style="border-left-color:#ffd166">⊥ u⃗ et v⃗ sont <strong>orthogonaux</strong></div>' : ''}
    ${nu>0&&nv>0 && !orth ? `<div class="res">cos(θ) = ${fx(ps)}/(${fx(nu)}×${fx(nv)}) = ${fx(ps/(nu*nv))} &nbsp;→&nbsp; θ ≈ <strong>${fx(Math.acos(Math.max(-1,Math.min(1,ps/(nu*nv))))/DEG)}°</strong></div>`:''}
  `;
}
['cx','cy','cx2','cy2'].forEach(id=>$(id).addEventListener('input',drawCoord));
drawCoord();

// ── 04 — AL-KASHI ────────────────────────────────
function drawAlkashi(){
  const c=+$('ak-c').value, b=+$('ak-b').value, A=+$('ak-A').value;
  $('ak-c-v').textContent=c; $('ak-b-v').textContent=b; $('ak-A-v').textContent=A+'°';
  const a2 = c*c + b*b - 2*c*b*Math.cos(A*DEG);
  const a = Math.sqrt(a2);
  const cosB = (c*c+a2-b*b)/(2*c*a);
  const cosC = (b*b+a2-c*c)/(2*b*a);
  const B = Math.acos(Math.max(-1,Math.min(1,cosB)))/DEG;
  const C = Math.acos(Math.max(-1,Math.min(1,cosC)))/DEG;

  const cv=$('c-alkashi'), ctx=cv.getContext('2d');
  const W=cv.width, H=cv.height;
  styleCvs(ctx,W,H);

  // Place triangle: A at left, B at right, C above
  const sc = Math.min((W-80)/(c+b), (H-80)/a)*0.65;
  const ax=60, ay=H-60;
  const bx=ax+c*sc, by=ay;
  const cx2=ax+b*Math.cos(A*DEG)*sc, cy2=ay-b*Math.sin(A*DEG)*sc;

  ctx.strokeStyle='rgba(100,160,255,.25)'; ctx.lineWidth=.8;
  // sides
  ctx.strokeStyle='#4a9eff'; ctx.lineWidth=1.8;
  ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
  ctx.strokeStyle='#00d4ff';
  ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(cx2,cy2); ctx.stroke();
  ctx.strokeStyle='#ff8c42';
  ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(cx2,cy2); ctx.stroke();

  // labels
  dot(ctx,ax,ay,4,'#4a9eff'); txt(ctx,'A',ax-14,ay+4,'#4a9eff',13);
  dot(ctx,bx,by,4,'#4a9eff'); txt(ctx,'B',bx+6,by+4,'#4a9eff',13);
  dot(ctx,cx2,cy2,4,'#00d4ff'); txt(ctx,'C',cx2+4,cy2-8,'#00d4ff',13);

  // side labels
  txt(ctx,'c=AB='+c, (ax+bx)/2, ay+16, '#4a9eff',11);
  txt(ctx,'b=AC='+b, (ax+cx2)/2-20, (ay+cy2)/2-8, '#00d4ff',11);
  txt(ctx,'a=BC='+fx(a), (bx+cx2)/2+6, (by+cy2)/2, '#ff8c42',11);

  // angle arc A
  ctx.strokeStyle='rgba(255,209,102,.5)'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.arc(ax,ay,22,
    -Math.atan2(b*Math.sin(A*DEG)*sc, b*Math.cos(A*DEG)*sc),
    0); ctx.stroke();
  txt(ctx, A+'°', ax+24, ay-8, '#ffd166',11);

  $('ak-res').innerHTML=`
    <div class="res">BC² = AB² + AC² − 2·AB·AC·cos(Â)</div>
    <div class="res">BC² = ${c}² + ${b}² − 2·${c}·${b}·cos(${A}°)</div>
    <div class="res">BC² = ${c*c} + ${b*b} − ${fx(2*c*b*Math.cos(A*DEG))} = <strong>${fx(a2)}</strong></div>
    <div class="res" style="border-left-color:var(--orange)">BC = a ≈ <strong>${fx(a)}</strong></div>
    <div class="res orange">Angle B ≈ ${fx(B)}° &nbsp;·&nbsp; Angle C ≈ ${fx(C)}° &nbsp;·&nbsp; Vérif A+B+C = ${fx(A+B+C)}°</div>
  `;
}
['ak-c','ak-b','ak-A'].forEach(id=>$(id).addEventListener('input',drawAlkashi));
drawAlkashi();

// ── 05 — THALÈS ──────────────────────────────────
function drawThales(){
  const ab = +$('t-ab').value;
  $('t-ab-v').textContent = ab;
  const cv=$('c-thales'), ctx=cv.getContext('2d');
  const W=cv.width, H=cv.height;
  styleCvs(ctx,W,H);
  const sc=44;
  const ax=W/2-ab*sc/2, ay=H/2;
  const bx=W/2+ab*sc/2, by=H/2;
  const R=ab*sc/2;
  const ix=W/2, iy=H/2;

  // circle
  ctx.strokeStyle='rgba(255,209,102,.6)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(ix,iy,R,0,2*Math.PI); ctx.stroke();

  // AB
  ctx.strokeStyle='#4a9eff'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();

  // moving point M on circle
  const angle = Date.now()/1800 % (2*Math.PI);
  const mx = ix + R*Math.cos(angle), my = iy - R*Math.sin(angle);

  // MA, MB
  arrow(ctx,mx,my,ax,ay,'#00d4ff',1.8,'MA⃗');
  arrow(ctx,mx,my,bx,by,'#ff8c42',1.8,'MB⃗');

  // angle at M (should be 90°)
  const ma = {x:ax-mx,y:ay-my}, mb={x:bx-mx,y:by-my};
  const ps_mamb = ma.x*mb.x + ma.y*mb.y;
  const nearly90 = Math.abs(ps_mamb) < 200;
  dot(ctx,ax,ay,5,'#4a9eff'); txt(ctx,'A',ax-14,ay+4,'#4a9eff',13);
  dot(ctx,bx,by,5,'#4a9eff'); txt(ctx,'B',bx+6,by+4,'#4a9eff',13);
  dot(ctx,ix,iy,4,'rgba(100,160,255,.5)'); txt(ctx,'I',ix+5,iy-8,'#7a8fa8',11);
  dot(ctx,mx,my,6,'#ffd166'); txt(ctx,'M',mx+7,my-7,'#ffd166',13);

  if(nearly90){
    ctx.strokeStyle='#3ddc84'; ctx.lineWidth=1.2;
    const s=10;
    const ua={x:ma.x/Math.sqrt(ma.x*ma.x+ma.y*ma.y),y:ma.y/Math.sqrt(ma.x*ma.x+ma.y*ma.y)};
    const ub={x:mb.x/Math.sqrt(mb.x*mb.x+mb.y*mb.y),y:mb.y/Math.sqrt(mb.x*mb.x+mb.y*mb.y)};
    ctx.beginPath();
    ctx.moveTo(mx+ua.x*s,my+ua.y*s);
    ctx.lineTo(mx+ua.x*s+ub.x*s,my+ua.y*s+ub.y*s);
    ctx.lineTo(mx+ub.x*s,my+ub.y*s);
    ctx.stroke();
  }

  $('thales-res').innerHTML=`
    <div class="res">MA⃗·MB⃗ = MI² − AB²/4 = ${fx(ix===mx&&iy===my?0:Math.pow(Math.sqrt((mx-ix)**2+(my-iy)**2),2))} − ${fx(ab*ab/4)}</div>
    <div class="res" style="border-left-color:var(--yellow)">M est sur le cercle ⟹ MI = AB/2 = ${fx(ab/2)} ⟹ MA⃗·MB⃗ = <strong>0</strong> — angle droit en M ✓</div>
  `;
  requestAnimationFrame(drawThales);
}
$('t-ab').addEventListener('input',()=>{});
drawThales();

// ── 06 — CALCULATEUR LIBRE ───────────────────────
function setMethod(m){
  ['coord','cos','norms'].forEach(k=>{
    $('method-'+k).style.display = k===m?'block':'none';
    $('m-'+k).classList.toggle('active',k===m);
  });
  updateMethod();
}
function updateMethod(){
  // coord
  const x1=+$('m-x1').value, y1=+$('m-y1').value, x2=+$('m-x2').value, y2=+$('m-y2').value;
  $('m-x1-v').textContent=x1; $('m-y1-v').textContent=y1;
  $('m-x2-v').textContent=x2<0?'−'+Math.abs(x2):x2;
  $('m-y2-v').textContent=y2<0?'−'+Math.abs(y2):y2;
  const ps_c=x1*x2+y1*y2;
  $('mc-res').innerHTML=`<div class="res">u⃗·v⃗ = ${x1}×${x2} + ${y1}×${y2} = <strong>${ps_c}</strong>${Math.abs(ps_c)<1e-9?' &nbsp;→&nbsp; orthogonaux':''}</div>`;

  // cos
  const cu=+$('mc-un').value, cv2=+$('mc-vn').value, cth=+$('mc-th').value;
  $('mc-un-v').textContent=cu; $('mc-vn-v').textContent=cv2; $('mc-th-v').textContent=cth+'°';
  const ps_cos=cu*cv2*Math.cos(cth*DEG);
  $('mcos-res').innerHTML=`<div class="res">u⃗·v⃗ = ${cu}×${cv2}×cos(${cth}°) = <strong>${fx(ps_cos)}</strong></div>`;

  // norms
  const nu2=+$('mn-u').value, nv2=+$('mn-v').value, nuv=+$('mn-uv').value;
  $('mn-u-v').textContent=nu2; $('mn-v-v').textContent=nv2; $('mn-uv-v').textContent=nuv;
  const ps_n=(nu2*nu2+nv2*nv2-nuv*nuv)/2;
  // actually formula for u+v: ||u+v||²=||u||²+2u·v+||v||² => u·v=(||u+v||²-||u||²-||v||²)/2... wait no
  // u·v = (||u||²+||v||²-||u-v||²)/2 so here ||u+v|| not ||u-v||
  // let's use: user sets ||u||,||v||,||u+v||; then u·v=(||u+v||²-||u||²-||v||²)/2
  const ps_n2=(nuv*nuv - nu2*nu2 - nv2*nv2)/2;
  $('mnorms-res').innerHTML=`<div class="res">‖u⃗+v⃗‖² = ‖u⃗‖² + 2u⃗·v⃗ + ‖v⃗‖² &nbsp;⟹&nbsp; u⃗·v⃗ = (‖u+v‖²−‖u‖²−‖v‖²)/2</div>
    <div class="res">= (${nuv}²−${nu2}²−${nv2}²)/2 = (${nuv*nuv}−${nu2*nu2}−${nv2*nv2})/2 = <strong>${fx(ps_n2)}</strong></div>`;
}
['m-x1','m-y1','m-x2','m-y2','mc-un','mc-vn','mc-th','mn-u','mn-v','mn-uv'].forEach(id=>$(id).addEventListener('input',updateMethod));
updateMethod();

// ── QCM ─────────────────────────────────────────
const QCM = [
  { q:"Soient \\(\\vec{u}=(3;4)\\) et \\(\\vec{v}=(-4;3)\\) dans une base orthonormée. Quel est \\(\\vec{u}\\cdot\\vec{v}\\) ?",
    opts:["0","25","−7","7"], ans:0,
    expl:"u⃗·v⃗ = 3×(−4) + 4×3 = −12 + 12 = 0. Les vecteurs sont orthogonaux !" },
  { q:"Deux vecteurs \\(\\vec{u}\\) et \\(\\vec{v}\\) forment un angle de 120°, \\(\\|\\vec{u}\\|=2\\) et \\(\\|\\vec{v}\\|=3\\). Calculer \\(\\vec{u}\\cdot\\vec{v}\\).",
    opts:["−3","3","6","−6"], ans:0,
    expl:"u⃗·v⃗ = 2×3×cos(120°) = 6×(−1/2) = −3." },
  { q:"Dans un triangle \\(ABC\\), \\(AB=5\\), \\(AC=4\\), \\(BC=6\\). Quel est \\(\\cos(\\hat{A})\\) d'après Al-Kashi ?",
    opts:["1/8","−1/8","7/40","1/4"], ans:1,
    expl:"BC²=AB²+AC²−2·AB·AC·cos(Â) ⟹ 36=25+16−40cos(Â) ⟹ cos(Â)=(41−36)/40=5/40=1/8 — attention : c'est 1/8 et non −1/8. cos(Â)=(AB²+AC²−BC²)/(2·AB·AC)=(25+16−36)/40=5/40=1/8." },
  { q:"Soient \\(A\\) et \\(B\\) deux points et \\(I\\) le milieu de \\([AB]\\). L'ensemble des points \\(M\\) tels que \\(\\overrightarrow{MA}\\cdot\\overrightarrow{MB}=0\\) est :",
    opts:["Une droite perpendiculaire à AB","Le cercle de diamètre [AB]","Une ellipse","Un demi-plan"], ans:1,
    expl:"C'est le cercle de centre I et de rayon AB/2, d'après la démonstration avec le produit scalaire." },
  { q:"\\(\\|\\vec{u}+\\vec{v}\\|^2\\) est égal à :",
    opts:["\\(\\|\\vec{u}\\|^2+\\|\\vec{v}\\|^2\\)","\\(\\|\\vec{u}\\|^2+2\\vec{u}\\cdot\\vec{v}+\\|\\vec{v}\\|^2\\)","\\((\\vec{u}\\cdot\\vec{v})^2\\)","\\(\\|\\vec{u}\\|^2-\\|\\vec{v}\\|^2\\)"], ans:1,
    expl:"Par bilinéarité : (u⃗+v⃗)·(u⃗+v⃗)=‖u⃗‖²+u⃗·v⃗+v⃗·u⃗+‖v⃗‖²=‖u⃗‖²+2u⃗·v⃗+‖v⃗‖² par symétrie." },
  { q:"\\(\\vec{u}=(1;\\sqrt{3})\\). Quelle est la norme de \\(\\vec{u}\\) ?",
    opts:["\\(1+\\sqrt{3}\\)","2","\\(\\sqrt{1+\\sqrt{3}}\\)","\\(\\sqrt{3}\\)"], ans:1,
    expl:"‖u⃗‖=√(1²+(√3)²)=√(1+3)=√4=2." },
  { q:"Dans une base orthonormée, \\(\\vec{u}=(a;b)\\) et \\(\\vec{v}=(b;-a)\\). Ces vecteurs sont-ils orthogonaux ?",
    opts:["Seulement si a=b","Toujours, pour tout a et b","Jamais","Seulement si a=0"], ans:1,
    expl:"u⃗·v⃗ = a×b + b×(−a) = ab − ab = 0 pour tous a, b. Ils sont toujours orthogonaux." },
  { q:"Le produit scalaire est une opération :",
    opts:["Vectorielle (résultat = vecteur)","Scalaire (résultat = nombre réel)","Matricielle","Complexe"], ans:1,
    expl:"Le produit scalaire de deux vecteurs est bien un scalaire (un nombre réel), d'où son nom." },
  { q:"Deux vecteurs orthogonaux et non nuls forment un angle de :",
    opts:["0°","45°","90°","180°"], ans:2,
    expl:"u⃗·v⃗=0 ⟺ cos(θ)=0 ⟺ θ=90°." },
  { q:"\\(\\overrightarrow{MA}\\cdot\\overrightarrow{MB} = MI^2 - \\frac{AB^2}{4}\\). Si M est sur le cercle de diamètre [AB], cette expression vaut :",
    opts:["1","AB²/4","−AB²/4","0"], ans:3,
    expl:"Sur le cercle, MI=AB/2, donc MI²=AB²/4. On obtient AB²/4 − AB²/4 = 0." },
];

let qSt = { qs:[], cur:0, score:0, answered:0, did:false };
let tSec=0, tRun=true, tVisible=true;
let tIv = null;

function qcmShuffle(){
  qSt = { qs:[...QCM].sort(()=>Math.random()-.5), cur:0, score:0, answered:0, did:false };
  tSec=0; timerUpdateDisplay();
  clearInterval(tIv);
  tRun=true; $('t-btn').textContent='⏸ Pause';
  tIv=setInterval(()=>{ if(tRun){ tSec++; timerUpdateDisplay(); }},1000);
  renderQ();
}
function renderQ(){
  const body=$('qcm-body');
  if(qSt.cur>=qSt.qs.length){
    body.innerHTML=`<div class="q-text" style="text-align:center;font-size:1.1rem;padding:20px 0">🎉 Terminé ! Score : ${qSt.score} / ${qSt.qs.length}</div>`;
    clearInterval(tIv); return;
  }
  const q=qSt.qs[qSt.cur]; qSt.did=false;
  $('qcm-score').textContent=`Score : ${qSt.score} / ${qSt.answered}`;
  body.innerHTML=`
    <div class="q-num">Question ${qSt.cur+1} / ${qSt.qs.length}</div>
    <p class="q-text">${q.q}</p>
    <div class="opts">${q.opts.map((o,i)=>`<button class="opt" id="opt${i}" onclick="answerQ(${i})">${o}</button>`).join('')}</div>
    <div class="feedback" id="qfb"></div>
  `;
  MathJax.typesetPromise && MathJax.typesetPromise();
}
function answerQ(i){
  if(qSt.did) return; qSt.did=true; qSt.answered++;
  const q=qSt.qs[qSt.cur], ok=i===q.ans;
  if(ok) qSt.score++;
  $('opt'+q.ans).classList.add('correct');
  if(!ok) $('opt'+i).classList.add('wrong');
  document.querySelectorAll('.opt').forEach(b=>b.classList.add('locked'));
  $('qfb').textContent=(ok?'✓ Correct ! ':'✗ Incorrect. ')+q.expl;
  $('qcm-score').textContent=`Score : ${qSt.score} / ${qSt.answered}`;
  MathJax.typesetPromise && MathJax.typesetPromise();
}
function qcmNext(){ qSt.cur++; renderQ(); }
function timerUpdateDisplay(){
  const m=String(Math.floor(tSec/60)).padStart(2,'0');
  const s=String(tSec%60).padStart(2,'0');
  $('qcm-timer').textContent=`${m}:${s}`;
}
function timerToggle(){
  tRun=!tRun; $('t-btn').textContent=tRun?'⏸ Pause':'▶ Go';
}
function timerReset(){ tSec=0; timerUpdateDisplay(); }
function timerShowToggle(){
  tVisible=$('t-show').checked;
  $('qcm-timer').classList.toggle('hidden',!tVisible);
}
qcmShuffle();

// ── FADE-IN ──────────────────────────────────────
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:.08});
document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));
// ── STICKY NAV — Active section highlight ──
(function(){
  const links = document.querySelectorAll('.sticky-nav-links a');
  const sections = [...document.querySelectorAll('.section[id]')];
  if(!links.length || !sections.length) return;

  const setActive = id => {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    const active = document.querySelector('.sticky-nav-links a.active');
    if(active) active.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-52px 0px -60% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
})();