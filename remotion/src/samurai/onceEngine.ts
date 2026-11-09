// @ts-nocheck
// Samurai Stillness episode engine (SVG strings) for ep06, used by the Remotion compositions.
export function makeOnceEpisode(EP) {
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

// ===== Samurai Stillness #6 "ONLY ONCE" — one place: the road home at sunset, split screen. Driven by the episode data =====
// Gold only for the right's sun, afterglow and the small light in his chest. The left's sky is muted, its only light the phone.

const PHONE = '#96BEFF';
const HZ = 1240, FLOOR = 1640, K = 1.75;
const sw = (t, a, b) => io(ramp(t, a, b));
const keyY = (K_, t) => keys(t, K_.map(([a, v]) => [a, v]));
const face0 = face;
face = function (x, y, dir, ex, col = FACE) {
  const ox = 10 * dir, e1 = [x + ox - 15, y - 4], e2 = [x + ox + 15, y - 4], m = [x + ox, y + 18];
  if (ex === 'normal') return face0(x, y, dir, 'serious', col);
  if (ex === 'down') return `<circle cx="${e1[0] + 3 * dir}" cy="${e1[1] + 6}" r="5" fill="${col}"/><circle cx="${e2[0] + 3 * dir}" cy="${e2[1] + 6}" r="5" fill="${col}"/><path d="M${m[0] - 5} ${m[1] + 4} h10" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`;
  if (ex === 'up') return `<circle cx="${e1[0] + 4 * dir}" cy="${e1[1] - 7}" r="6" fill="${col}"/><circle cx="${e2[0] + 4 * dir}" cy="${e2[1] - 7}" r="6" fill="${col}"/><ellipse cx="${m[0]}" cy="${m[1] + 2}" rx="5" ry="6" fill="${col}"/>`;
  if (ex === 'calm') return `<path d="M${e1[0] - 8} ${e1[1]} q8 4 16 0 M${e2[0] - 8} ${e2[1]} q8 4 16 0" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${m[0] - 8} ${m[1] - 2} q8 7 16 0" stroke="${col}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  if (ex === 'lost') return `<circle cx="${e1[0]}" cy="${e1[1]}" r="5" fill="${col}"/><circle cx="${e2[0]}" cy="${e2[1]}" r="5" fill="${col}"/><path d="M${m[0] - 7} ${m[1] + 4} q7 -5 14 0" stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return face0(x, y, dir, ex, col);
};
// ---------- poses (feet at [0,0]) ----------
const withPhone = (p, up) => { const o = cp(p); // left hand brings the phone to the face
  o.eL = [lerp(o.eL[0], 22, up), lerp(o.eL[1], -104, up)]; o.hL = [lerp(o.hL[0], 34, up), lerp(o.hL[1], -140, up)];
  o.head = [o.head[0] + 6 * up, o.head[1] + 8 * up]; return o; };
const lookUp = (p, k) => { const o = cp(p); o.head = [o.head[0] + 6 * k, o.head[1] - 6 * k]; return o; };
const pocket = (p, k) => { const o = cp(p); o.eR = [lerp(o.eR[0], 22, k), lerp(o.eR[1], -96, k)]; o.hR = [lerp(o.hR[0], 14, k), lerp(o.hR[1], -70, k)]; return o; };
function man(x, y, pose, o = {}) {
  const s = o.k || K, paint = o.paint || BONE, dir = o.dir || 1;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)}) translate(${f(-x)} ${f(-y)})"><g filter="url(#wob)">` + figure(x, y, pose, { dir, face: o.face, paint }) + `</g></g>`;
}
const handAt = (x, y, pose, k = K, dir = 1, which = 'hL') => [x + pose[which][0] * k * dir, y + pose[which][1] * k];
const headAt = (x, y, pose, k = K, dir = 1) => [x + pose.head[0] * k * dir, y + pose.head[1] * k];
function phone(x, y, on, k = 1) {
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(k)})"><rect x="-20" y="-34" width="40" height="68" rx="8" fill="#0f1430" stroke="#3a4478" stroke-width="3"/>` +
    (on > 0 ? `<rect x="-15" y="-28" width="30" height="56" rx="5" fill="${PHONE}" opacity="${f(.9 * on)}"/>` : '') + `</g>`;
}

// ---------- sky, sun, cloud, road (one place for the whole film) ----------
function sky(ox, t, side) {
  const R = side === 'R';
  // right: gold -> deep orange (4-6) -> dulled under the cloud -> last light -> violet-indigo afterglow
  const kR = [[0, 0], [4, .35], [6, .6], [7, .75], [8.2, .7], [9.4, .85], [11, 1.05], [14, 1.2]];
  const u = keys(t, kR);
  let top, mid, low;
  if (R) {
    const dull = sw(t, 6.0, 6.6) * (1 - sw(t, 7.8, 8.4)) * .5;
    top = mixC('#2a2f5c', '#20264A', cl(u)); mid = mixC(mixC('#c9763f', '#a0503a', cl(u / .7)), '#4a3f72', sw(t, 9.6, 12)); low = mixC(mixC('#E8C766', '#e08a3c', cl(u / .6)), '#8a5a78', sw(t, 9.8, 12.5));
    mid = mixC(mid, '#5a5466', dull); low = mixC(low, '#7a6a6a', dull);
  } else {   // left: the same evening, muted (he isn't looking): grey peach -> grey -> dark
    top = mixC('#2a2f5c', '#151935', sw(t, 7, 11)); mid = mixC('#6e6478', '#3a3c52', sw(t, 5, 9)); low = mixC('#9a8a8e', '#4a4c5e', sw(t, 5, 9.2));
    low = mixC(low, '#1e2238', sw(t, 9.5, 12)); mid = mixC(mid, '#1a1e36', sw(t, 9.5, 12));
  }
  const id = 'sky' + side;
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".4" stop-color="${top}"/><stop offset=".76" stop-color="${mid}"/><stop offset="1" stop-color="${low}"/></linearGradient><rect x="${ox}" y="0" width="540" height="${HZ}" fill="url(#${id})"/>`;
}
function sun(ox, t, side) {
  const R = side === 'R', y = keyY(EP.sun[R ? 'right' : 'left'], t), x = ox + 400, r = 120;
  if (y - r > HZ) return '';
  if (!R) return `<circle cx="${x}" cy="${f(y)}" r="${r}" fill="#b9a8a6" opacity="${f(.55 * (1 - sw(t, 5, 7.5)))}"/>`;   // muted, never gold
  const cover = sw(t, 6.0, 6.3) * (1 - sw(t, 7.8, 8.3));
  let s = `<circle cx="${x}" cy="${f(y)}" r="${r * 1.9}" fill="${GOLD2}" opacity="${f((.22 + .05 * Math.sin(t * 1.6)) * (1 - .8 * cover) * (t > 8.2 && t < 9.6 ? 1.6 : 1))}" filter="url(#bigglow)"/>`;
  s += `<circle cx="${x}" cy="${f(y)}" r="${r}" fill="url(#gold)"/><circle cx="${x - 30}" cy="${f(y - 34)}" r="${r * .45}" fill="#fff4c8" opacity=".35"/>`;
  return s;
}
function cloud(ox, t) {   // a long cloud that drifts across the sun and away
  const c = EP.cloud, x = ox + (t < c.out[0] ? lerp(900, 400, sw(t, c.in[0], c.in[1])) : lerp(400, -380, sw(t, c.out[0], c.out[1]))), y = 1168;
  const d = `M${x - 190} ${y + 40} Q${x - 200} ${y} ${x - 150} ${y - 6} Q${x - 120} ${y - 60} ${x - 50} ${y - 50} Q${x - 10} ${y - 96} ${x + 60} ${y - 70} Q${x + 130} ${y - 84} ${x + 150} ${y - 30} Q${x + 220} ${y - 24} ${x + 210} ${y + 40}Z`;
  return `<g transform="translate(${f(x)} ${y}) scale(1.75) translate(${f(-x)} ${-y})"><g filter="url(#wob)"><path d="${d}" fill="#3d3f63"/><path d="${d}" fill="none" stroke="#5a5c86" stroke-width="4"/></g></g>`;
}
function wisps(ox, t) { let s = ''; for (let i = 0; i < 3; i++) { const x = ox + ((i * 210 + t * (10 + i * 4)) % 700) - 80, y = 700 + i * 90;
  s += `<g filter="url(#wob)" stroke="#4a4f80" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"><path d="M${f(x)} ${y} q50 -26 100 -6 q56 -18 92 10"/></g>`; } return s; }
function road(ox, t, side) {
  const R = side === 'R', dark = R ? sw(t, 10, 13) * .4 : sw(t, 8.5, 11) * .75;
  let s = `<rect x="${ox}" y="${HZ}" width="540" height="${H - HZ}" fill="${mixC('#1d2347', '#0b0d1c', dark)}"/>`;
  // the road recedes toward the horizon (ahead, under the sun)
  s += `<path d="M${ox} ${FLOOR + 40} L${ox} ${FLOOR - 70} L${ox + 380} ${HZ + 6} L${ox + 440} ${HZ + 6} L${ox + 540} ${FLOOR - 160} L${ox + 540} ${FLOOR + 40}Z" fill="${mixC('#2a3262', '#10132a', dark)}"/>`;
  s += `<path d="M${ox} ${FLOOR - 70} L${ox + 380} ${HZ + 6}" stroke="${RIM}" stroke-width="3" opacity="${f(.5 * (1 - dark))}"/>`;
  // grass tufts swaying
  for (let i = 0; i < 9; i++) { const gx = ox + 20 + i * 60, gy = FLOOR + 26 + (i % 3) * 30, sw2 = Math.sin(t * 1.8 + i) * 6;
    s += `<path d="M${gx} ${gy} q${f(-4 + sw2)} -26 ${f(-10 + sw2)} -40 M${gx + 8} ${gy} q${f(2 + sw2)} -30 ${f(4 + sw2)} -48 M${gx + 16} ${gy} q${f(6 + sw2)} -22 ${f(14 + sw2)} -34" stroke="${mixC('#3d4a7a', '#151a33', dark)}" stroke-width="6" fill="none" stroke-linecap="round"/>`; }
  s += `<path d="M${ox} ${HZ} h540" stroke="${R ? mixC(GOLD2, '#6a5a80', sw(t, 9.8, 13)) : '#4a4c64'}" stroke-width="3" opacity=".7"/>`;
  return s;
}

// ---------- people ----------
function rightMan(ox, t) {
  const R = EP.right; let x = ox + 150, pose, fc = 'normal', tilt = 0;
  // walk, slow down (2-4), stop (4), pocket the phone (4.4-5.2), watch, walk on slowly (10.2-)
  const xs = [[0, 0], [2, 60], [4, 90], [10.2, 90], [14, 150]];
  x = ox + 150 + keys(t, xs);
  if (t < R.stop) { const amp = lerp(.9, .3, sw(t, R.slow[0], R.slow[1])); pose = walk(t * lerp(9, 6, sw(t, 2, 4)), amp, 4); }
  else if (t < R.walkOn) pose = cp(P.STAND);
  else pose = walk(t * 5, .45, 2);
  tilt = sw(t, 2.2, 3.4);
  pose = lookUp(pose, tilt * (t < R.walkOn ? 1 : .4));
  const pk = sw(t, R.pocket[0], R.pocket[1]); if (t > R.pocket[0] && t < R.walkOn) pose = pocket(pose, pk);
  pose = cp(pose); const br = Math.sin(t * 1.6) * 2; for (const k of ['head', 'neck', 'sh']) pose[k][1] += br;
  fc = t < 2.2 ? 'normal' : t < 8.2 ? 'up' : t < 10.2 ? 'calm' : 'smile';
  let s = `<ellipse cx="${f(x)}" cy="${FLOOR + 6}" rx="${f(46 * K)}" ry="16" fill="#000" opacity=".35" filter="url(#soft)"/>`;
  // afterglow on him (8-14): warm face/body tint
  const warm = sw(t, 8.2, 9.2) * (1 - .35 * sw(t, 11, 13.5));
  const paint = mixC(BONE, '#f4dca0', warm * .6);
  s += man(x, FLOOR, pose, { face: fc, paint });
  if (t < R.pocket[1]) { const h = handAt(x, FLOOR, pose, K, 1, 'hR'); s += `<g opacity="${f(1 - pk)}">` + phone(h[0], h[1] + 10, 0, .9) + `</g>`; }
  // the small light that stays in his chest
  const cl_ = sw(t, R.chestLight, R.chestLight + .8), ch = [x + 4 * K, FLOOR - 104 * K];
  if (cl_ > 0) s += `<circle cx="${f(ch[0])}" cy="${f(ch[1])}" r="${f(46 + 6 * Math.sin(t * 2.4))}" fill="${GOLD2}" opacity="${f(.45 * cl_)}" filter="url(#glow)"/><circle cx="${f(ch[0])}" cy="${f(ch[1])}" r="${f(18 * cl_)}" fill="url(#gold)"/><circle cx="${f(ch[0] - 3)}" cy="${f(ch[1] - 3)}" r="${f(4 * cl_)}" fill="#fff8dc"/>`;
  // afterglow light on the face
  if (warm > 0) { const hd = headAt(x, FLOOR, pose); s += `<circle cx="${f(hd[0] + 20)}" cy="${f(hd[1])}" r="90" fill="${GOLD2}" opacity="${f(.22 * warm)}" filter="url(#glow)"/>`; }
  return s;
}
function leftMan(ox, t) {
  const L = EP.left; let pose, fc = 'normal';
  // same walk at first; phone up at 2 and faster; from 6 he walks away into the distance (smaller, toward the horizon)
  const along = keys(t, [[0, 0], [2, 60], [6, 210], [8, 300], [14, 330]]);
  const far = sw(t, L.away[0], L.away[1]);
  const x = ox + 150 + along * lerp(1, .9, far), y = lerp(FLOOR, HZ + 70, far), k = K * lerp(1, .42, far);
  const up = sw(t, L.phoneUp, L.phoneUp + .4);
  const speed = t < 2 ? 9 : 11.5, walking = t < 8.2;
  pose = walking ? walk(t * speed, t < 2 ? .9 : 1.05, t < 2 ? 4 : 10) : cp(P.STAND);
  const lookUpK = sw(t, L.lookUp, L.lookUp + .3) * (1 - sw(t, L.lookUp + 1.2, L.lookUp + 1.6));
  pose = withPhone(pose, up * (1 - lookUpK * .8));
  if (lookUpK > 0) pose = lookUp(pose, lookUpK);
  const dir = t > L.turn && t < L.turn + 1.0 ? -1 : 1;   // turns back once: nothing there
  fc = t < 2 ? 'normal' : lookUpK > .3 ? 'up' : t > L.turn && t < L.turn + 1.0 ? 'lost' : 'down';
  let s = `<ellipse cx="${f(x)}" cy="${f(y + 4)}" rx="${f(46 * k)}" ry="${f(16 * k / K)}" fill="#000" opacity=".35" filter="url(#soft)"/>`;
  s += man(x, y, pose, { face: fc, k, dir, paint: mixC('#e6dfcf', '#a8a4a0', sw(t, 9.5, 11.5)) });
  if (up > 0) { const h = handAt(x, y, pose, k, dir, 'hL'), hd = headAt(x, y, pose, k, dir), on = up * (1 - lookUpK);
    s += `<circle cx="${f(hd[0])}" cy="${f(hd[1])}" r="${f(80 * k / K)}" fill="${PHONE}" opacity="${f(.28 * on)}" filter="url(#glow)"/>` + phone(h[0] + 6 * dir, h[1] - 8 * k / K, on, k / K * .95);
    s += `<circle cx="${f(hd[0])}" cy="${f(hd[1])}" r="${f(44 * k)}" fill="${PHONE}" opacity="${f(.16 * on)}"/>`; }
  return s;
}

// ---------- frame ----------
function sceneSVG(t, opt = {}) {
  let o = DEFS + `<rect width="${W}" height="${H}" fill="#12152C"/>`;
  o += `<clipPath id="Lc"><rect x="0" y="0" width="539" height="${H}"/></clipPath><clipPath id="Rc"><rect x="541" y="0" width="539" height="${H}"/></clipPath>`;
  for (const [ox, side] of [[0, 'L'], [540, 'R']]) {
    let s = sky(ox, t, side);
    for (let i = 0; i < 14; i++) { const x = ox + (i * 97 + 41) % 540, y = 220 + ((i * 61) % 360); s += `<circle cx="${x}" cy="${y}" r="${1.4 + (i % 3) * .7}" fill="${BONE}" opacity="${f((.25 + .2 * Math.sin(t + i)) * (side === 'R' ? .6 : .8))}"/>`; }
    s += wisps(ox, t) + sun(ox, t, side) + cloud(ox, t) + road(ox, t, side);
    if (side === 'L') s += `<rect x="0" y="0" width="540" height="${H}" fill="#05060f" opacity="${f(.4 * sw(t, 9.6, 12))}"/>`;   // night falls on the left; only the phone lights him
    s += side === 'R' ? rightMan(ox, t) : leftMan(ox, t);
    o += `<g clip-path="url(#${side === 'L' ? 'Lc' : 'Rc'})">${s}</g>`;
  }
  return o;
}
function overlay(t, opt = {}) {
  const T = (x, y, str, sz, col, op = 1) => `<text x="${x}" y="${y}" font-family="NS" font-weight="900" font-size="${sz}" fill="${col}" text-anchor="middle" opacity="${f(op)}">${str}</text>`;
  const lab = opt.labels != null ? opt.labels : sw(t, .15, .8);
  let o = `<path d="M540 190 V${FLOOR + 120}" stroke="${RIM}" stroke-width="3" opacity=".6"/>`;
  o += T(270, 280, EP.labels.left[0], 64, BONE, lab) + T(270, 350, EP.labels.left[1], 64, BONE, lab) + T(810, 280, EP.labels.right[0], 64, BONE, lab) + T(810, 350, EP.labels.right[1], 64, BONE, lab);
  return o;
}
const coverSVG = function () {
  const c = EP.cover; let o = sceneSVG(c.time) + overlay(c.time, { labels: 1 });
  o += `<text x="540" y="860" font-family="NS" font-weight="900" font-size="170" fill="${BONE}" text-anchor="middle" stroke="#12152C" stroke-width="14" paint-order="stroke">${c.title}</text>`;
  return o + `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".05"/>`;
};

  const frameSVG = (t) => { return sceneSVG(t) + overlay(t) + `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".05"/>`; };
  return { frameSVG, coverSVG, W, H };
}
