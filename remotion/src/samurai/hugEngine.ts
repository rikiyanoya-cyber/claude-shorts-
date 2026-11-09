// @ts-nocheck
// Samurai Stillness episode engine (SVG strings), shared by the Remotion compositions.
// House style of #3/#4 (indigo stage, bone tube figures, gold glow) + the episode file ep05_hug.ts.
export function makeHugEpisode(EP) {
// ===== Samurai Stillness #3 v4 "Discipline vs Motivation" — indigo stage, split screen, filled mountains + trail =====
const W=1080,H=1920,END=14.0;
const BONE='#F2ECDC',RIM='#5A6694',DULL='#7d86ad',GOLD1='#C9A227',GOLD2='#E8C766',FACE='#1a1d36';
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,u)=>a+(b-a)*u,ramp=(t,a,b)=>cl((t-a)/(b-a));
const io=x=>{x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;},ein=x=>{x=cl(x);return x*x*x;},eout=x=>{x=cl(x);return 1-Math.pow(1-x,3);};
const back=x=>{x=cl(x);const c=2.2;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
const bump=x=>x<0||x>1?0:Math.sin(Math.PI*x);
const f=v=>(+v).toFixed(1);
const hex=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),mixC=(a,b,u)=>{const A=hex(a),B=hex(b);return '#'+A.map((v,i)=>Math.round(lerp(v,B[i],u)).toString(16).padStart(2,'0')).join('');};
function keys(t,K){if(t<=K[0][0])return K[0][1];for(let i=0;i<K.length-1;i++){const [a,va]=K[i],[b,vb]=K[i+1];if(t<=b)return lerp(va,vb,(K[i+1][2]||io)((t-a)/(b-a)));}return K[K.length-1][1];}

const DEFS=`<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#20264A"/><stop offset="1" stop-color="#12152C"/></linearGradient>
<linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#323b6c"/><stop offset="1" stop-color="#232a50"/></linearGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .95  0 0 0 0 .93  0 0 0 0 .86  0 0 0 1 0"/></filter>
<filter id="wob" filterUnits="userSpaceOnUse" x="-50" y="0" width="1180" height="1920"><feTurbulence type="fractalNoise" baseFrequency=".02 .035" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="soft" x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="18"/></filter>
<filter id="bigglow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="40"/></filter>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${GOLD1}"/><stop offset="1" stop-color="${GOLD2}"/></linearGradient>
<radialGradient id="lamp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe7a0" stop-opacity=".55"/><stop offset=".5" stop-color="#ffd76a" stop-opacity=".18"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient>
</defs>`;
const J=['head','neck','sh','eL','hL','eR','hR','hip','kL','fL','kR','fR'];
const mixP=(a,b,u)=>{const o={};for(const k of J)o[k]=[lerp(a[k][0],b[k][0],u),lerp(a[k][1],b[k][1],u)];return o;};
const cp=o=>JSON.parse(JSON.stringify(o));
function face(x,y,dir,ex,col=FACE){const ox=10*dir;let s='';const e1=[x+ox-15,y-4],e2=[x+ox+15,y-4],m=[x+ox,y+18];
 if(ex==='sleepy')s+=`<path d="M${e1[0]-8} ${e1[1]} q8 5 16 0 M${e2[0]-8} ${e2[1]} q8 5 16 0" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${m[0]-7} ${m[1]} h14" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`;
 else if(ex==='serious')s+=`<circle cx="${e1[0]}" cy="${e1[1]}" r="5.5" fill="${col}"/><circle cx="${e2[0]}" cy="${e2[1]}" r="5.5" fill="${col}"/><path d="M${m[0]-6} ${m[1]} h12" stroke="${col}" stroke-width="4.5" stroke-linecap="round"/>`;
 else if(ex==='desperate')s+=`<circle cx="${e1[0]}" cy="${e1[1]-2}" r="8" fill="${col}"/><circle cx="${e2[0]}" cy="${e2[1]-2}" r="8" fill="${col}"/><ellipse cx="${m[0]}" cy="${m[1]+2}" rx="8" ry="10" fill="${col}"/>`;
 else if(ex==='dizzy'){const sp=(cx,cy)=>{let d='';for(let i=0;i<=24;i++){const a=i/24*Math.PI*4,r=1+i*.38;d+=(i?'L':'M')+f(cx+Math.cos(a)*r)+' '+f(cy+Math.sin(a)*r);}return `<path d="${d}" stroke="${col}" stroke-width="3" fill="none"/>`;};s+=sp(e1[0],e1[1])+sp(e2[0],e2[1])+`<path d="M${m[0]-8} ${m[1]+2} q4 -6 8 0 q4 6 8 0" stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round"/>`;}
 else if(ex==='smile')s+=`<path d="M${e1[0]-7} ${e1[1]+2} q7 -9 14 0 M${e2[0]-7} ${e2[1]+2} q7 -9 14 0" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${m[0]-12} ${m[1]-4} q12 14 24 0" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
 return s;}
// figure: tubes + big round head with a face; dir mirrors the pose; paint can be a colour or a gradient id
function figure(x,y,p,o={}){const dir=o.dir||1,rot=o.rot||0;const T=q=>{const qx=q[0]*dir,c=Math.cos(rot),s=Math.sin(rot);return [x+qx*c-q[1]*s,y+qx*s+q[1]*c];};
 const q={};for(const k of J)q[k]=T(p[k]);const seg=(...k)=>'M'+k.map(n=>f(q[n][0])+' '+f(q[n][1])).join(' L');const paint=o.paint||BONE;
 let g=`<g stroke="${paint}" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="${seg('neck','hip')}"/><path d="${seg('sh','eL','hL')}"/><path d="${seg('sh','eR','hR')}"/><path d="${seg('hip','kL','fL')}"/><path d="${seg('hip','kR','fR')}"/></g><circle cx="${f(q.head[0])}" cy="${f(q.head[1])}" r="44" fill="${paint}"/>`;
 if(o.face)g+=face(q.head[0],q.head[1],o.faceDir||dir,o.face);
 return g;}
const shadow=(x,y,rx,o=.4)=>`<ellipse cx="${f(x)}" cy="${f(y+4)}" rx="${f(rx)}" ry="12" fill="#000" opacity="${o}" filter="url(#soft)"/>`;
const P={
 STAND:{head:[0,-184],neck:[0,-136],sh:[0,-126],eL:[-18,-92],hL:[-26,-60],eR:[18,-92],hR:[26,-60],hip:[0,-64],kL:[-10,-32],fL:[-16,0],kR:[10,-32],fR:[16,0]},
 STEPUP:{head:[12,-186],neck:[8,-138],sh:[7,-128],eL:[-10,-98],hL:[-24,-68],eR:[26,-98],hR:[40,-74],hip:[0,-64],kL:[-10,-32],fL:[-16,0],kR:[26,-54],fR:[42,-26]},
 SIT:{head:[18,-160],neck:[6,-114],sh:[4,-106],eL:[30,-88],hL:[48,-76],eR:[34,-114],hR:[30,-140],hip:[-6,-56],kL:[38,-58],fL:[40,0],kR:[44,-54],fR:[48,0]},
 BURST:{head:[0,-198],neck:[0,-148],sh:[0,-138],eL:[-34,-172],hL:[-50,-208],eR:[34,-172],hR:[50,-208],hip:[0,-72],kL:[-12,-36],fL:[-18,0],kR:[12,-36],fR:[18,0]},
 TIRED:{head:[36,-128],neck:[26,-94],sh:[24,-86],eL:[10,-60],hL:[4,-30],eR:[34,-58],hR:[38,-28],hip:[0,-52],kL:[-12,-26],fL:[-20,0],kR:[16,-26],fR:[24,0]},
 LIE:{head:[-100,-30],neck:[-58,-24],sh:[-50,-24],eL:[-30,-60],hL:[-12,-76],eR:[-26,6],hR:[-2,12],hip:[24,-20],kL:[58,-36],fL:[92,-24],kR:[62,-8],fR:[98,-4]},
 GRAB:{head:[-6,-186],neck:[-4,-138],sh:[-3,-128],eL:[10,-158],hL:[24,-188],eR:[-24,-104],hR:[-46,-130],hip:[2,-64],kL:[-8,-32],fL:[-16,0],kR:[14,-32],fR:[20,0]}};
// walk cycle: legs alternate, arms swing, body leans forward and bobs on every step
function walk(ph,amp,lean){const s=Math.sin(ph)*amp,c=Math.cos(ph),o=cp(P.STAND);
 o.kL=[-6-18*s,-34];o.fL=[-10-30*s,-Math.max(0,c)*14*amp];o.kR=[6+18*s,-34];o.fR=[10+30*s,-Math.max(0,-c)*14*amp];
 o.eL=[-10+20*s,-94];o.hL=[-12+34*s,-62];o.eR=[10-20*s,-94];o.hR=[12-34*s,-62];
 for(const k of ['head','neck','sh','eL','hL','eR','hR'])o[k][0]+=lean;o.hip[0]+=lean*.3;
 const bob=-Math.abs(Math.sin(ph))*8*amp;for(const k of ['head','neck','sh','eL','hL','eR','hR','hip'])o[k][1]+=bob;return o;}

// ===== Samurai Stillness #5 "THE HUG" — indigo stage, split screen. Driven by window.EP (ep05_hug.json) =====
// Gold only for the right's charging battery and the final light. The left never gets gold.

const RED = '#E5484D', BLUE = '#7fb8ff';
const S = EP.scenes;
const FLOOR = 1600, K = 1.8;                     // figures are drawn 1.8x the #3 size
const face0 = face;
face = function (x, y, dir, ex, col = FACE) {
  const ox = 10 * dir, e1 = [x + ox - 15, y - 4], e2 = [x + ox + 15, y - 4], m = [x + ox, y + 18];
  if (ex === 'normal') return face0(x, y, dir, 'serious', col);
  if (ex === 'tired') return `<path d="M${e1[0] - 8} ${e1[1] + 1} h16 M${e2[0] - 8} ${e2[1] + 1} h16" stroke="${col}" stroke-width="5" stroke-linecap="round"/><path d="M${m[0] - 7} ${m[1] + 2} q7 -4 14 0" stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  if (ex === 'limit') return `<path d="M${e1[0] - 8} ${e1[1] - 3} l16 5 M${e2[0] + 8} ${e2[1] - 3} l-16 5" stroke="${col}" stroke-width="5" stroke-linecap="round"/><path d="M${m[0] - 9} ${m[1] + 5} q9 -9 18 0" stroke="${col}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  if (ex === 'blank') return `<circle cx="${e1[0]}" cy="${e1[1]}" r="4.5" fill="${col}"/><circle cx="${e2[0]}" cy="${e2[1]}" r="4.5" fill="${col}"/><path d="M${m[0] - 6} ${m[1] + 2} h12" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`;
  if (ex === 'closed') return `<path d="M${e1[0] - 8} ${e1[1]} q8 4 16 0 M${e2[0] - 8} ${e2[1]} q8 4 16 0" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${m[0] - 9} ${m[1] - 2} q9 8 18 0" stroke="${col}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  return face0(x, y, dir, ex, col);
};
const sw = (t, a, b) => io(ramp(t, a, b));
const at = (K_, t) => { let v = K_[0][1]; for (const [a, x] of K_) if (t >= a) v = x; return v; };
const batL = t => at(EP.battery.left, t), batR = t => at(EP.battery.right, t);
const changes = side => EP.battery[side].slice(1).map(x => x[0]);

// ---------- poses (feet at [0,0]) ----------
const Pz = {
  STAND: P.STAND,
  BAGSTAND: { ...P.STAND, eR: [20, -94], hR: [30, -58] },
  SLUMP: { head: [26, -150], neck: [18, -114], sh: [16, -106], eL: [6, -76], hL: [2, -44], eR: [24, -74], hR: [28, -42], hip: [0, -60], kL: [-8, -30], fL: [-14, 0], kR: [10, -30], fR: [16, 0] },
  SIT: { head: [-6, -156], neck: [-8, -110], sh: [-8, -100], eL: [16, -76], hL: [36, -62], eR: [20, -72], hR: [42, -58], hip: [-12, -50], kL: [36, -54], fL: [40, 0], kR: [42, -50], fR: [46, 0] },
  SITPH: { head: [2, -150], neck: [-4, -108], sh: [-4, -98], eL: [22, -84], hL: [34, -116], eR: [20, -72], hR: [42, -58], hip: [-12, -50], kL: [36, -54], fL: [40, 0], kR: [42, -50], fR: [46, 0] },
  SINK: { head: [-20, -120], neck: [-16, -86], sh: [-14, -78], eL: [4, -56], hL: [20, -40], eR: [8, -52], hR: [26, -38], hip: [-10, -40], kL: [40, -44], fL: [50, 0], kR: [46, -40], fR: [56, 0] },
  HUG: { head: [14, -184], neck: [10, -136], sh: [8, -126], eL: [40, -120], hL: [56, -112], eR: [36, -104], hR: [54, -96], hip: [0, -64], kL: [-6, -32], fL: [-12, 0], kR: [10, -32], fR: [14, 0] },
  SITSIDE: { head: [8, -158], neck: [2, -110], sh: [2, -100], eL: [28, -84], hL: [44, -96], eR: [20, -72], hR: [42, -58], hip: [-12, -50], kL: [36, -54], fL: [40, 0], kR: [42, -50], fR: [46, 0] },
};
const LIESOFA = { head: [-120, -40], neck: [-84, -34], sh: [-76, -34], eL: [-50, -24], hL: [-20, -18], eR: [-50, -30], hR: [-20, -30], hip: [0, -30], kL: [50, -38], fL: [92, -30], kR: [50, -30], fR: [94, -24] };
let GID = 0;
const glowOf = t => t < EP.battery.chargeFrom ? 0 : batR(t) / 100;
function man(x, y, pose, o = {}) {
  const dir = o.dir || 1, KK = K * (o.k || 1), gl = o.glow || 0, t = o.t || 0;
  let paint = o.paint || BONE, pre = '';
  if (gl > 0) {
    const id = 'gs' + (GID++), base = mixC(BONE, GOLD2, gl), deep = mixC('#e2d6b6', GOLD1, gl), period = lerp(2.6, 1.1, gl), ph = ((t % period) / period) * 1.8 - .4;
    pre = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(x - 120)}" y1="${f(y - 260)}" x2="${f(x + 120)}" y2="${f(y + 20)}"><stop offset="0" stop-color="${deep}"/><stop offset="${f(cl(ph - .12))}" stop-color="${base}"/><stop offset="${f(cl(ph))}" stop-color="${mixC(base, '#ffffff', .25 + .5 * gl)}"/><stop offset="${f(cl(ph + .12))}" stop-color="${base}"/><stop offset="1" stop-color="${deep}"/></linearGradient>`;
    pre += `<g transform="translate(${f(x)} ${f(y)}) scale(${f(KK)}) translate(${f(-x)} ${f(-y)})"><g opacity="${f(.25 + .5 * gl)}" filter="url(#glow)">` + figure(x, y, pose, { dir, paint: GOLD2 }) + `</g></g>`;
    paint = `url(#${id})`;
  }
  let s = `<g transform="translate(${f(x)} ${f(y)}) scale(${f(KK)}) translate(${f(-x)} ${f(-y)})">` + `<g filter="url(#wob)">` + figure(x, y, pose, { dir, face: o.face, paint }) + `</g>`;
  if (o.bun) { const hx = x + pose.head[0] * dir, hy = y + pose.head[1]; s += `<circle cx="${f(hx - 30 * dir)}" cy="${f(hy - 30)}" r="20" fill="${paint}"/><path d="M${f(hx - 18 * dir)} ${f(hy - 30)} l${f(-8 * dir)} 6" stroke="#6d79a8" stroke-width="5" stroke-linecap="round"/>`; }
  if (o.bag) { const hx = x + pose.hR[0] * dir, hy = y + pose.hR[1]; s += `<g filter="url(#wob)"><rect x="${f(hx - 22)}" y="${f(hy + o.bagDrop)}" width="44" height="34" rx="6" fill="#6d79a8" stroke="#3a4478" stroke-width="3"/><path d="M${f(hx - 10)} ${f(hy + o.bagDrop)} q10 -14 20 0" stroke="#3a4478" stroke-width="4" fill="none"/></g>`; }
  s += `</g>`;
  if (gl > 0) { const cx = x + pose.head[0] * KK * dir * .5, cy = y - 110 * KK;
    for (let i = 0; i < Math.round(gl * 8); i++) { const a = i * 2.4 + t * .8, r = 150 + 40 * Math.sin(t * 2 + i), sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r * 1.1, k = .5 + .5 * Math.sin(t * 5 + i);
      s += `<path d="M${f(sx)} ${f(sy - 12 * k)} L${f(sx + 3)} ${f(sy)} L${f(sx)} ${f(sy + 12 * k)} L${f(sx - 3)} ${f(sy)}Z M${f(sx - 12 * k)} ${f(sy)} L${f(sx)} ${f(sy + 3)} L${f(sx + 12 * k)} ${f(sy)} L${f(sx)} ${f(sy - 3)}Z" fill="#fff4c8" opacity="${f(.85 * k)}"/>`; } }
  return pre + s;
}
const shadowK = (x, rx = 46) => `<ellipse cx="${f(x)}" cy="${FLOOR + 6}" rx="${f(rx * K)}" ry="16" fill="#000" opacity=".4" filter="url(#soft)"/>`;

// ---------- backdrops (local x 0..540) ----------
function ground(ox) { return `<rect x="${ox}" y="${FLOOR}" width="540" height="${H - FLOOR}" fill="#161b3a"/><path d="M${ox} ${FLOOR} h540" stroke="${RIM}" stroke-width="3" opacity=".6"/>`; }
function morning(ox, t) {   // home front: wall with the front door they leave from, a pale morning sky
  return `<rect x="${ox}" y="700" width="540" height="${FLOOR - 700}" fill="#2a3262"/>` +
    `<g filter="url(#wob)"><rect x="${ox}" y="1040" width="250" height="${FLOOR - 1040}" fill="#323b6c"/><path d="M${ox - 10} 1050 L${ox + 125} 960 L${ox + 260} 1050Z" fill="#283058"/><rect x="${ox + 70}" y="1250" width="110" height="${FLOOR - 1250}" rx="6" fill="#1d2347" stroke="${RIM}" stroke-width="5"/></g>` +
    `<circle cx="${ox + 420}" cy="820" r="54" fill="${BONE}" opacity=".55"/><circle cx="${ox + 420}" cy="820" r="90" fill="${BONE}" opacity=".08"/>`;
}
function evening(ox, t) {   // the way home: city silhouettes, a street lamp
  let s = `<g filter="url(#wob)">`;
  for (let i = 0; i < 9; i++) { const x = ox + i * 82 - 20, h = 260 + ((i * 97) % 200); s += `<rect x="${x}" y="${FLOOR - h}" width="76" height="${h}" fill="#283058"/>`;
    for (let r = 0; r < 4; r++) if ((i + r) % 3) s += `<rect x="${x + 16 + (r % 2) * 28}" y="${FLOOR - h + 24 + r * 46}" width="14" height="18" fill="#3d4680"/>`; }
  s += `</g><g filter="url(#wob)"><rect x="${ox + 560}" y="1220" width="12" height="380" fill="#3a4478"/><path d="M${ox + 566} 1222 q-40 -14 -60 6" stroke="#3a4478" stroke-width="10" fill="none"/></g><circle cx="${ox + 506}" cy="1236" r="12" fill="${BONE}" opacity=".85"/><path d="M${ox + 506} 1240 L${ox + 450} ${FLOOR} L${ox + 562} ${FLOOR}Z" fill="${BONE}" opacity=".06"/>`;
  s += `<circle cx="${ox + 120}" cy="820" r="30" fill="${BONE}" opacity=".6"/><circle cx="${ox + 132}" cy="812" r="28" fill="#1e244a"/>`;
  return s;
}
function doorScene(ox, t, open, lightIn) {   // the front door (right of the figure); open: 0..1
  let s = `<rect x="${ox}" y="760" width="540" height="${FLOOR - 760}" fill="#262d5c"/>`;
  s += `<g filter="url(#wob)"><rect x="${ox + 330}" y="1150" width="170" height="${FLOOR - 1150}" fill="${lightIn > 0 ? mixC('#0a0c18', '#4d4a52', lightIn) : '#0a0c18'}"/>`;
  s += `<path d="M${ox + 330} 1150 L${f(ox + 330 + 170 * (1 - open))} ${f(1150 + 30 * open)} L${f(ox + 330 + 170 * (1 - open))} ${f(FLOOR - 30 * open)} L${ox + 330} ${FLOOR}Z" fill="#3a4478" stroke="${RIM}" stroke-width="5"/>`;
  s += `<circle cx="${f(ox + 330 + 150 * (1 - open))}" cy="1390" r="9" fill="${BONE}" opacity="${f(1 - open)}"/><rect x="${ox + 320}" y="1138" width="190" height="16" fill="#323b6c"/></g>`;
  if (lightIn > 0) s += `<path d="M${ox + 330} 1150 L${ox + 500} 1150 L${ox + 540} ${FLOOR} L${ox + 200} ${FLOOR}Z" fill="${BONE}" opacity="${f(.07 * lightIn)}"/>`;
  return s;
}
function room(ox, t, dark) {   // living room with a sofa
  let s = `<rect x="${ox}" y="720" width="540" height="${FLOOR - 720}" fill="${dark ? '#151a36' : '#262d5c'}"/>`;
  s += `<g filter="url(#wob)"><rect x="${ox + 300}" y="880" width="170" height="210" rx="6" fill="${dark ? '#0d1128' : '#1d2350'}" stroke="${dark ? '#262c52' : RIM}" stroke-width="8"/><path d="M${ox + 385} 880 v210 M${ox + 300} 985 h170" stroke="${dark ? '#262c52' : RIM}" stroke-width="6"/></g>`;
  s += `<g filter="url(#wob)"><rect x="${ox + 40}" y="1430" width="460" height="120" rx="26" fill="${dark ? '#262c52' : '#3a4478'}"/><rect x="${ox + 40}" y="1330" width="460" height="110" rx="26" fill="${dark ? '#20264a' : '#323b6c'}"/><rect x="${ox + 20}" y="1380" width="60" height="170" rx="24" fill="${dark ? '#2a3058' : '#414c86'}"/><rect x="${ox + 460}" y="1380" width="60" height="170" rx="24" fill="${dark ? '#2a3058' : '#414c86'}"/>` +
    `<rect x="${ox + 70}" y="1550" width="20" height="50" fill="#121630"/><rect x="${ox + 450}" y="1550" width="20" height="50" fill="#121630"/></g>`;
  return s;
}

// ---------- the battery (above the head) ----------
function battery(cx, cy, pct, t, side) {
  const gold = side === 'R' && t >= EP.battery.chargeFrom;
  const col = gold ? 'url(#gold)' : pct <= 20 ? RED : BONE;
  const pops = changes(side === 'L' ? 'left' : 'right'); let pop = 0; for (const a of pops) pop = Math.max(pop, bump((t - a) / .3));
  const blink = pct === 3 ? (Math.sin(t * Math.PI * 4) > 0 ? 1 : .25) : 1;
  // fill: springs past the new level, then settles (jump, then fill smoothly)
  let lv = pct; const last = pops.filter(a => t >= a).pop();
  if (gold && last != null) { const u = t - last, prev = at(EP.battery.right, last - .01); lv = pct + (prev < pct ? (pct - prev) * -Math.exp(-u * 5) * Math.cos(u * 9) * .5 : 0); lv = cl(lv, 0, 100); }
  const w = 230, h = 112, inner = (w - 28) * lv / 100;
  let s = `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(1 + .12 * pop)})">`;
  if (pop > 0) s += `<rect x="${-w / 2 - 14}" y="${-h / 2 - 14}" width="${w + 28}" height="${h + 28}" rx="30" fill="${gold ? GOLD2 : pct <= 20 ? RED : BONE}" opacity="${f(.45 * pop)}" filter="url(#glow)"/>`;
  if (gold) s += `<rect x="${-w / 2 - 6}" y="${-h / 2 - 6}" width="${w + 12}" height="${h + 12}" rx="26" fill="${GOLD2}" opacity="${f(.18 + .08 * Math.sin(t * 2.2))}" filter="url(#glow)"/>`;
  s += `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="22" fill="#12152C" stroke="${pct === 0 ? BONE : (gold ? GOLD2 : pct <= 20 ? RED : BONE)}" stroke-width="9" opacity="${f(pct === 0 ? .55 : 1)}"/><rect x="${w / 2 + 2}" y="-20" width="16" height="40" rx="5" fill="${pct === 0 ? '#5d6488' : (gold ? GOLD2 : pct <= 20 ? RED : BONE)}"/>`;
  if (inner > 0) s += `<rect x="${-w / 2 + 14}" y="${-h / 2 + 14}" width="${f(Math.max(6, inner))}" height="${h - 28}" rx="10" fill="${col}" opacity="${f(blink)}"/>`;
  s += `</g>`;
  const tc = gold ? GOLD2 : pct <= 20 ? RED : BONE;
  s += `<g transform="translate(${f(cx)} ${f(cy + 160)}) scale(${f(1 + .25 * pop)})"><text x="0" y="0" font-family="NS" font-weight="900" font-size="96" fill="${tc}" text-anchor="middle" opacity="${f(pct === 3 ? .55 + .45 * blink : 1)}">${pct}%</text></g>`;
  return s;
}

// ---------- one half ----------
// scene boundaries per side (the left goes inside right after the door; the right stays in the hug until 8 s)
const BOUNDS = side => [S.evening, S.door, side === 'L' ? S.turn + .35 : S.inside];
const SCENES = ['morning', 'evening', 'door', 'inside'];
const sceneOf = (t, side) => SCENES[BOUNDS(side).filter(b => t >= b).length];
const XF = .45;   // cross-dissolve length (s): the outgoing scene drifts left, the incoming one settles in from the right
function half(ox, t, side) {
  for (const [i, b] of BOUNDS(side).entries()) {
    const u = (t - (b - XF / 2)) / XF;
    if (u > 0 && u < 1) { const e = io(u);
      return `<g>${halfScene(ox, t, side, SCENES[i])}</g>` +
        `<g opacity="${f(e)}">${halfScene(ox, t, side, SCENES[i + 1])}</g>`; }
  }
  return halfScene(ox, t, side, sceneOf(t, side));
}
function halfScene(ox, t, side, sc) {
  const R = side === 'R'; let s = '';
  const x0 = ox + 270;
  if (sc === 'morning') {                                  // MORNING: leave home with the bag
    const u = sw(t, .2, 2.2), x = ox + 230, pose = walk(t * 9, .9, 4);   // tracking shot: he stays put, home slides away behind him
    s += `<g transform="translate(${f(-150 * u)} 0)">` + morning(ox, t) + `</g>` + ground(ox);
    s += shadowK(x) + man(x, FLOOR, pose, { face: 'normal', bag: 1, bagDrop: 0 });
  } else if (sc === 'evening') {                          // EVENING: the way home, shoulders down
    const u = sw(t, S.evening - .3, S.door + .2), x = ox + 230, p = walk(t * 6, .55, 14);
    s += `<g transform="translate(${f(-130 * u)} 0)">` + evening(ox, t) + `</g>` + ground(ox);
    for (const k of ['head', 'neck', 'sh']) { p[k][1] += 16; p[k][0] += 6; }
    s += shadowK(x) + man(x, FLOOR, p, { face: 'tired', bag: 1, bagDrop: 16 });
  } else if (sc === 'inside') {                           // inside
    if (!R) {                                            // LEFT: dark room, alone on the sofa
      s += room(ox, t, true) + ground(ox);
      const x = ox + 290, y = 1500;
      let pose, fc = 'blank', phone = 0;
      if (t < S.inside) { pose = Pz.SITPH; phone = 1; }
      else if (t < S.full + .2) { pose = mixP(Pz.SITPH, Pz.SINK, sw(t, S.inside, S.inside + .7)); phone = 1 - sw(t, S.inside, S.inside + .3); fc = 'tired'; }
      else { pose = mixP(Pz.SINK, LIESOFA, sw(t, S.full + .2, S.full + 1.0)); fc = 'tired'; }
      const p = cp(pose), br = Math.sin(t * 1.8) * 2; for (const k of ['head', 'neck', 'sh']) p[k][1] += br;
      s += man(x, y, p, { face: fc, paint: '#cfc8b6' });
      if (phone > 0) { const hx = x + p.hL[0] * K, hy = y + p.hL[1] * K;
        s += `<ellipse cx="${f(x + p.head[0] * K)}" cy="${f(y + p.head[1] * K)}" rx="130" ry="120" fill="${BLUE}" opacity="${f(.18 * phone)}" filter="url(#bigglow)"/><g transform="translate(${f(hx + 6)} ${f(hy - 10)})" opacity="${f(phone)}"><rect x="-22" y="-38" width="44" height="76" rx="8" fill="#0f1430" stroke="#3a4478" stroke-width="3"/><rect x="-17" y="-32" width="34" height="64" rx="5" fill="${BLUE}" opacity=".85"/></g>`; }
      s += `<rect x="${ox}" y="0" width="540" height="${H}" fill="#05060f" opacity="${f(.35 * sw(t, S.turn + .35, S.inside))}"/>`;
    } else {                                             // RIGHT: side by side on the sofa
      s += room(ox, t, false) + ground(ox);
      const y = 1500, smile = t > S.full + .6 ? 'smile' : 'closed';
      s += man(ox + 380, y + 4, Pz.SITSIDE, { face: 'smile', bun: 1, dir: -1, k: .92 }) + man(ox + 160, y, Pz.SITSIDE, { face: smile, glow: glowOf(t), t });
    }
  } else {                                                // AT THE DOOR (and the hug, right side)
    const open = R ? sw(t, S.turn, S.turn + .15) : sw(t, S.turn, S.turn + .2);
    s += doorScene(ox, t, open, R ? open : 0) + ground(ox);
    const x = ox + 230;
    if (!R || t < S.turn) {
      const p = cp(Pz.SLUMP), br = Math.sin(t * 2.6) * 3; for (const k of ['head', 'neck', 'sh']) p[k][1] += br;
      const step = !R && t > S.turn ? sw(t, S.turn + .1, S.turn + .35) : 0;
      s += `<g opacity="${f(1 - step)}">` + shadowK(x + 60 * step) + man(x + 60 * step, FLOOR, p, { face: 'limit', bag: 1, bagDrop: 30 }) + `</g>`;
    } else {                                              // the partner steps out and holds him
      const k = sw(t, S.turn + .15, S.turn + .3), px = lerp(ox + 430, ox + 352, k);
      const pm = mixP(Pz.SLUMP, Pz.HUG, k), pp = mixP(Pz.STAND, Pz.HUG, k);
      const sway = Math.sin(t * 2) * 2 * k;
      s += shadowK(x + 50, 80) + man(px + sway, FLOOR, pp, { face: k > .5 ? 'closed' : 'smile', bun: 1, dir: -1, k: .92 }) + man(x - 10 + sway, FLOOR, pm, { face: k > .6 ? 'closed' : 'limit', glow: glowOf(t), t });
    }
  }
  return s;
}

// ---------- frame ----------
function sceneSVG(t, opt = {}) {
  let o = DEFS + `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;
  for (let i = 0; i < 26; i++) { const x = (i * 263 + 71) % 1080, y = 560 + ((i * 397) % 140); o += `<circle cx="${x}" cy="${y}" r="${1.4 + (i % 3) * .8}" fill="${BONE}" opacity="${f((.3 + (i % 4) * .12) * (.75 + .25 * Math.sin(t * 1.3 + x)))}"/>`; }
  o += `<clipPath id="Lc"><rect x="0" y="0" width="539" height="${H}"/></clipPath><clipPath id="Rc"><rect x="541" y="0" width="539" height="${H}"/></clipPath>`;
  o += `<g clip-path="url(#Lc)">${half(0, t, 'L')}</g>`;
  // gold light around the two (right only): spreads at full charge, largest on the final hold
  const gl = (.55 * sw(t, EP.battery.right[5][0], EP.battery.right[5][0] + 1.2) + .45 * sw(t, S.final, S.final + .8)) * (1 + .06 * Math.sin(t * 1.7));
  let r = half(540, t, 'R');
  if (gl > 0 && !opt.noGold) r = `<ellipse cx="810" cy="1380" rx="${f(330 * gl + 40)}" ry="${f(300 * gl + 40)}" fill="url(#lamp)" opacity="${f(gl)}"/>` + r +
    `<ellipse cx="810" cy="1380" rx="${f(420 * gl)}" ry="${f(380 * gl)}" fill="${GOLD2}" opacity="${f(.2 * gl)}" filter="url(#bigglow)"/>` +
    Array.from({ length: Math.round(gl * 10) }, (_, i) => { const a = i * 2.3 + t * .6, rr = 210 + 50 * Math.sin(t * 1.5 + i), sx = 810 + Math.cos(a) * rr, sy = 1330 + Math.sin(a) * rr * .8, k = .5 + .5 * Math.sin(t * 4 + i);
      return `<path d="M${f(sx)} ${f(sy - 11 * k)} L${f(sx + 3)} ${f(sy)} L${f(sx)} ${f(sy + 11 * k)} L${f(sx - 3)} ${f(sy)}Z M${f(sx - 11 * k)} ${f(sy)} L${f(sx)} ${f(sy + 3)} L${f(sx + 11 * k)} ${f(sy)} L${f(sx)} ${f(sy - 3)}Z" fill="#fff4c8" opacity="${f(.8 * k * gl)}"/>`; }).join('');
  o += `<g clip-path="url(#Rc)">${r}</g>`;
  return o;
}
function overlay(t, opt = {}) {
  const T = (x, y, str, sz, col, op = 1) => `<text x="${x}" y="${y}" font-family="NS" font-weight="900" font-size="${sz}" fill="${col}" text-anchor="middle" opacity="${f(op)}">${str}</text>`;
  const lab = opt.labels != null ? opt.labels : sw(t, .15, .8);
  let o = `<path d="M540 190 V${FLOOR}" stroke="${RIM}" stroke-width="3" opacity=".6"/>`;
  o += T(270, 290, EP.labels.left, 72, BONE, lab) + T(810, 290, EP.labels.right, 72, BONE, lab);
  if (!opt.noBattery) o += battery(270, 470, batL(t), t, 'L') + battery(810, 470, batR(t), t, 'R');
  return o;
}
const coverSVG = function () {
  const c = EP.cover; let o = sceneSVG(c.time, { noGold: true }) + overlay(c.time, { labels: 1, noBattery: true });
  o += `<rect width="${W}" height="${H}" fill="#0c0f24" opacity=".2"/>`;
  o += `<text x="540" y="1060" font-family="NS" font-weight="900" font-size="190" fill="${BONE}" text-anchor="middle" stroke="#12152C" stroke-width="14" paint-order="stroke">${c.title}</text>`;
  o += battery(270, 470, 100, c.time, 'L') + battery(810, 470, 100, c.time, 'R');
  return o + `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".05"/>`;
};

  const frameSVG = (t) => { GID = 0; return sceneSVG(t) + overlay(t) + `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".05"/>`; };
  return { frameSVG, coverSVG, batL, batR, W, H };
}
