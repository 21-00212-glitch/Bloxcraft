const FIXED_OWNER_PIN = '';
const SECRET_CMD = '/admintameem';

// --- AUDIO ---
const AC = window.AudioContext || window.webkitAudioContext, ac = AC ? new AC() : null;
const unlockAudio = () => { if (ac && ac.state === 'suspended') ac.resume(); };
function tone(f, t, d, v = .09, s = null) {
  if (!ac) return; unlockAudio();
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = t; o.frequency.setValueAtTime(f, ac.currentTime);
  if (s) o.frequency.exponentialRampToValueAtTime(s, ac.currentTime + d);
  g.gain.setValueAtTime(v, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + d);
  o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d);
}
const sfx = {
  place: () => tone(280, 'square', .07, .07, 420), break: () => tone(180, 'triangle', .09, .08, 90),
  hit: () => tone(140, 'sawtooth', .1, .11, 70), jump: () => tone(220, 'sine', .13, .08, 440),
  roll: () => tone(320, 'sine', .14, .09, 180), pad: () => tone(260, 'sine', .3, .12, 880),
  oof: () => tone(220, 'sawtooth', .24, .12, 100),
  coin: () => { tone(660, 'sine', .09, .1); setTimeout(() => tone(990, 'sine', .15, .1), 65); },
  buy: () => { tone(523, 'sine', .08, .11); setTimeout(() => tone(1046, 'sine', .16, .11), 65); },
  win: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 'triangle', .2, .13), i * 100))
};

// --- BEVELED PIXEL TEXTURES ---
function mkTex(fn) { const c = document.createElement('canvas'); c.width = c.height = 16; fn(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; return t; }
function bevelBorder(c) { c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(0, 0, 16, 1); c.fillRect(0, 0, 1, 16); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 15, 16, 1); c.fillRect(15, 0, 1, 16); }
const mkMat = fn => new THREE.MeshLambertMaterial({ map: mkTex(c => { fn(c); bevelBorder(c); }) });
function pxGrid(c, pal) { for (let x = 0; x < 16; x++)for (let y = 0; y < 16; y++) { const r = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1; c.fillStyle = pal[Math.floor(Math.abs(r) * pal.length)]; c.fillRect(x, y, 1, 1); } }

const grassTop = mkMat(c => pxGrid(c, ['#55b038', '#4ea332', '#63c142', '#44942b']));
const dirtMat = mkMat(c => { pxGrid(c, ['#7c5434', '#6e482b', '#8a5f3c']); c.fillStyle = '#5c3a21'; c.fillRect(3, 4, 2, 1); c.fillRect(11, 10, 2, 1); });
const grassSide = mkMat(c => { pxGrid(c, ['#7c5434', '#6e482b', '#8a5f3c']); c.fillStyle = '#55b038'; c.fillRect(0, 0, 16, 4); });
const snowTop = mkMat(c => pxGrid(c, ['#f8fafc', '#e2e8f0', '#ffffff']));
const snowSide = mkMat(c => { pxGrid(c, ['#7c5434', '#6e482b']); c.fillStyle = '#f8fafc'; c.fillRect(0, 0, 16, 5); });
const woodSide = mkMat(c => { pxGrid(c, ['#6b4728', '#5c3c21', '#78512f']); c.fillStyle = '#4a2f18'; for (let x = 2; x < 16; x += 4)c.fillRect(x, 0, 1, 16); });
const woodTop = mkMat(c => { c.fillStyle = '#b88b58'; c.fillRect(0, 0, 16, 16); c.strokeStyle = '#8c6239'; c.strokeRect(2.5, 2.5, 11, 11); });
const stoneMat = mkMat(c => pxGrid(c, ['#7f858d', '#727880', '#8c929a', '#686e75']));
const sandMat = mkMat(c => pxGrid(c, ['#ebd894', '#e3cd82', '#f2e2a5', '#d8c072']));
const leafMat = mkMat(c => pxGrid(c, ['#2e7d24', '#25691d', '#39912d']));
const oreMat = new THREE.MeshLambertMaterial({ map: mkTex(c => { pxGrid(c, ['#7f858d', '#727880']); c.fillStyle = '#22c55e'; c.fillRect(3, 3, 3, 3); c.fillRect(10, 4, 3, 3); c.fillRect(5, 10, 4, 3); bevelBorder(c); }), emissive: 0x052e16 });
const bedrockMat = mkMat(c => pxGrid(c, ['#141414', '#2e2e32', '#45454a', '#0a0a0a']));
const studMat = mkMat(c => { c.fillStyle = '#3b82f6'; c.fillRect(0, 0, 16, 16); [[2, 2], [10, 2], [2, 10], [10, 10]].forEach(([x, y]) => { c.fillStyle = '#60a5fa'; c.fillRect(x, y, 4, 4); }); });
const cyberMat = new THREE.MeshLambertMaterial({ map: mkTex(c => { c.fillStyle = '#090d24'; c.fillRect(0, 0, 16, 16); c.strokeStyle = '#06b6d4'; c.strokeRect(.5, .5, 15, 15); c.fillStyle = '#a855f7'; c.fillRect(6, 6, 4, 4); }), emissive: 0x083344 });
const lavaMat = new THREE.MeshLambertMaterial({ map: mkTex(c => pxGrid(c, ['#ea580c', '#f97316', '#facc15', '#dc2626'])), emissive: 0x9a3412 });
const basaltMat = mkMat(c => pxGrid(c, ['#27272a', '#1f1f23', '#34343a']));
const obsidMat = mkMat(c => { pxGrid(c, ['#1e1b4b', '#312e81', '#0f0d26']); c.fillStyle = '#7c3aed'; c.fillRect(4, 4, 2, 2); });
const benchMat = mkMat(c => { c.fillStyle = '#a47148'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#4a2f18'; c.fillRect(2, 2, 12, 12); c.fillStyle = '#facc15'; c.fillRect(4, 4, 3, 3); c.fillRect(9, 4, 3, 3); });
const miniMat = mkMat(c => pxGrid(c, ['#38bdf8', '#0284c7', '#7dd3fc']));

const boxGeo = new THREE.BoxGeometry(1, 1, 1), miniGeo = new THREE.BoxGeometry(.5, .5, .5);
const slopeShape = new THREE.Shape(); slopeShape.moveTo(0, 0); slopeShape.lineTo(1, 0); slopeShape.lineTo(0, 1); slopeShape.closePath();
const slopeGeo = new THREE.ExtrudeGeometry(slopeShape, { depth: 1, bevelEnabled: false }); slopeGeo.translate(-.5, -.5, -.5);

const ITEMS = {
  1: { name: 'Grass', type: 'block', color: '#55b038', mat: [grassSide, grassSide, grassTop, dirtMat, grassSide, grassSide] },
  2: { name: 'Stone', type: 'block', color: '#7f858d', mat: stoneMat },
  3: { name: 'Wood', type: 'block', color: '#6b4728', mat: [woodSide, woodSide, woodTop, woodTop, woodSide, woodSide] },
  4: { name: 'Stud', type: 'block', color: '#3b82f6', mat: studMat },
  5: { name: 'Sand', type: 'block', color: '#ebd894', mat: sandMat },
  6: { name: 'Snow', type: 'block', color: '#f8fafc', mat: [snowSide, snowSide, snowTop, dirtMat, snowSide, snowSide] },
  7: { name: 'BuxOre', type: 'block', color: '#22c55e', mat: oreMat },
  9: { name: 'Dirt', type: 'block', color: '#7c5434', mat: dirtMat },
  10: { name: 'Leaf', type: 'block', color: '#2e7d24', mat: leafMat },
  11: { name: 'Lava', type: 'block', color: '#f97316', mat: lavaMat },
  12: { name: 'Bedrock', type: 'block', color: '#141414', mat: bedrockMat },
  14: { name: 'Basalt', type: 'block', color: '#27272a', mat: basaltMat },
  15: { name: 'Cyber', type: 'block', color: '#06b6d4', mat: cyberMat },
  16: { name: 'Obsidian', type: 'block', color: '#312e81', mat: obsidMat },
  20: { name: 'Slope', type: 'block', color: '#94a3b8', mat: stoneMat, geo: slopeGeo },
  21: { name: 'MiniBlock', type: 'block', color: '#38bdf8', mat: miniMat, geo: miniGeo },
  22: { name: 'Workbench', type: 'block', color: '#a47148', mat: benchMat, icon: '🛠️' },
  23: { name: 'Lantern', type: 'block', color: '#facc15', mat: lavaMat, geo: miniGeo, icon: '🏮' },
  101: { name: 'Wood Sword', type: 'sword', dmg: 30, icon: '🗡️', col: 0xa47148 },
  102: { name: 'Wood Pick', type: 'pick', bonus: 1, icon: '⛏️', col: 0xa47148 },
  103: { name: 'Crystal Sword', type: 'sword', dmg: 48, icon: '⚔️', col: 0x38bdf8 },
  104: { name: 'Iron Pick', type: 'pick', bonus: 2, icon: '⛏️', col: 0xd1d5db },
  105: { name: 'Cyber Blade', type: 'sword', dmg: 75, icon: '⚡', col: 0x22d3ee },
  106: { name: 'Cyber Pick', type: 'pick', bonus: 3, icon: '⛏️', col: 0xa855f7 },
  201: { name: 'Iron Helm', type: 'armor', slot: 0, tier: 1, icon: '🪖' }, 202: { name: 'Iron Chest', type: 'armor', slot: 1, tier: 1, icon: '🦺' },
  203: { name: 'Iron Legs', type: 'armor', slot: 2, tier: 1, icon: '👖' }, 204: { name: 'Iron Boots', type: 'armor', slot: 3, tier: 1, icon: '🥾' },
  211: { name: 'Lava Helm', type: 'armor', slot: 0, tier: 2, icon: '🔥' }, 212: { name: 'Lava Plate', type: 'armor', slot: 1, tier: 2, icon: '🌋' },
  213: { name: 'Lava Legs', type: 'armor', slot: 2, tier: 2, icon: '🩳' }, 214: { name: 'Lava Boots', type: 'armor', slot: 3, tier: 2, icon: '👢' },
  221: { name: 'Cyber Visor', type: 'armor', slot: 0, tier: 3, icon: '🥽' }, 222: { name: 'Cyber Suit', type: 'armor', slot: 1, tier: 3, icon: '🤖' },
  223: { name: 'Cyber Legs', type: 'armor', slot: 2, tier: 3, icon: '🦿' }, 224: { name: 'AntiGrav Boots', type: 'armor', slot: 3, tier: 3, icon: '🚀' },
  301: { name: 'Flame Gem', type: 'key', icon: '🔶' }, 302: { name: 'Energy Core', type: 'key', icon: '💠' },
  303: { name: 'Quantum Anchor', type: 'key', icon: '🌀' }, 310: { name: 'Cooked Meat', type: 'food', icon: '🍖' }
};

let hotbar = Array(9).fill(null), backpack = Array(27).fill(null), armor = Array(4).fill(null), offhand = null, craft = Array(4).fill(null), craftOut = null;
let selSlot = 0, picked = null;

function itemHtml(slot) { if (!slot) return ''; const it = ITEMS[slot.id], vis = it.icon ? `<span>${it.icon}</span>` : `<div class="sw" style="background:${it.color}"></div>`; return `${vis}${slot.qty > 1 ? `<span class="cnt">${slot.qty}</span>` : ''}`; }
function hasItem(id, qty = 1) { let t = 0; hotbar.forEach(s => { if (s && s.id === id) t += s.qty; }); backpack.forEach(s => { if (s && s.id === id) t += s.qty; }); return t >= qty; }
function takeItem(id, qty = 1) {
  let rem = qty;
  for (let i = 0; i < 9 && rem > 0; i++)if (hotbar[i] && hotbar[i].id === id) { const t = Math.min(rem, hotbar[i].qty); hotbar[i].qty -= t; rem -= t; if (hotbar[i].qty <= 0) hotbar[i] = null; }
  for (let i = 0; i < 27 && rem > 0; i++)if (backpack[i] && backpack[i].id === id) { const t = Math.min(rem, backpack[i].qty); backpack[i].qty -= t; rem -= t; if (backpack[i].qty <= 0) backpack[i] = null; }
  renderHotbar(); saveAll();
}
function giveItem(id, qty = 1) {
  for (let i = 0; i < 9; i++)if (hotbar[i] && hotbar[i].id === id) { hotbar[i].qty += qty; renderHotbar(); saveAll(); return true; }
  for (let i = 0; i < 27; i++)if (backpack[i] && backpack[i].id === id) { backpack[i].qty += qty; renderHotbar(); saveAll(); return true; }
  for (let i = 0; i < 9; i++)if (!hotbar[i]) { hotbar[i] = { id, qty }; renderHotbar(); saveAll(); return true; }
  for (let i = 0; i < 27; i++)if (!backpack[i]) { backpack[i] = { id, qty }; renderHotbar(); saveAll(); return true; }
  showToast('Inventory Full!'); return false;
}
function renderHotbar() {
  const hb = document.getElementById('hotbar'); hb.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const d = document.createElement('div'); d.className = 'slot' + (i === selSlot ? ' active' : ''); d.innerHTML = itemHtml(hotbar[i]);
    d.addEventListener('pointerdown', e => {
      e.stopPropagation(); selSlot = i; renderHotbar(); updHeldTool();
      const s = hotbar[i];
      if (s && ITEMS[s.id].type === 'food' && (player.hunger < 100 || player.hp < 10)) {
        takeItem(s.id, 1); player.hunger = Math.min(100, player.hunger + 35); player.hp = Math.min(10, player.hp + 2);
        sfx.coin(); updBars(); showToast('Ate Meat (+HP & Hunger)');
      }
    });
    hb.appendChild(d);
  }
  const more = document.createElement('div'); more.className = 'slot invbtn'; more.textContent = '•••';
  more.addEventListener('pointerdown', e => { e.stopPropagation(); toggleModal('inv-modal', true); });
  hb.appendChild(more); updHeldTool();
}
function checkCraft() {
  const c = {}; craft.forEach(s => { if (s) c[s.id] = (c[s.id] || 0) + 1; });
  const k = Object.keys(c).map(Number); craftOut = null;
  if (k.length === 1) {
    const id = k[0], n = c[id];
    if (id === 3 && n === 1) craftOut = { id: 4, qty: 4 }; else if (id === 3 && n === 2) craftOut = { id: 101, qty: 1 };
    else if (id === 3 && n === 3) craftOut = { id: 102, qty: 1 }; else if (id === 3 && n === 4) craftOut = { id: 22, qty: 1 };
    else if (id === 2 && n === 2) craftOut = { id: 20, qty: 4 }; else if (id === 2 && n === 3) craftOut = { id: 104, qty: 1 };
    else if (id === 2 && n === 4) craftOut = { id: 201, qty: 1 }; else if (id === 7 && n === 2) craftOut = { id: 103, qty: 1 };
    else if (id === 14 && n === 4) craftOut = { id: 7, qty: 1 }; else if (id === 15 && n === 3) craftOut = { id: 106, qty: 1 };
  }
}
window.clearCraft = () => { craft.forEach(s => { if (s) giveItem(s.id, s.qty); }); craft = Array(4).fill(null); craftOut = null; picked = null; };
function clickInvSlot(group, idx) {
  const getRef = () => group === 'hot' ? { arr: hotbar, i: idx } : (group === 'back' ? { arr: backpack, i: idx } : (group === 'armor' ? { arr: armor, i: idx } : (group === 'off' ? { arr: [offhand], i: 0 } : { arr: craft, i: idx })));
  if (group === 'out') { if (!craftOut) return; if (giveItem(craftOut.id, craftOut.qty)) { craft = Array(4).fill(null); craftOut = null; sfx.buy(); renderInv(); renderHotbar(); } return; }
  const cur = getRef(), curItem = group === 'off' ? offhand : cur.arr[cur.i];
  if (!picked) { if (!curItem) return; picked = { group, idx }; sfx.place(); renderInv(); return; }
  if (picked.group === group && picked.idx === idx) { picked = null; renderInv(); return; }
  const src = (() => {
    if (picked.group === 'hot') return { get: () => hotbar[picked.idx], set: v => hotbar[picked.idx] = v };
    if (picked.group === 'back') return { get: () => backpack[picked.idx], set: v => backpack[picked.idx] = v };
    if (picked.group === 'armor') return { get: () => armor[picked.idx], set: v => armor[picked.idx] = v };
    if (picked.group === 'off') return { get: () => offhand, set: v => offhand = v };
    return { get: () => craft[picked.idx], set: v => craft[picked.idx] = v };
  })();
  const dst = { get: () => curItem, set: v => { if (group === 'off') offhand = v; else cur.arr[cur.i] = v; } }, sItem = src.get();
  if (group === 'armor' && sItem && (ITEMS[sItem.id].type !== 'armor' || ITEMS[sItem.id].slot !== idx)) { sfx.oof(); showToast('Wrong armor slot!'); picked = null; renderInv(); return; }
  if (group === 'craft') { if (!dst.get() && sItem) { dst.set({ id: sItem.id, qty: 1 }); if (sItem.qty > 1) sItem.qty--; else src.set(null); } }
  else { const dItem = dst.get(); if (dItem && sItem && dItem.id === sItem.id && ITEMS[sItem.id].type === 'block') { dItem.qty += sItem.qty; src.set(null); } else { dst.set(sItem); src.set(dItem); } }
  picked = null; checkCraft(); sfx.place(); saveAll(); renderInv(); renderHotbar(); updArmor3D();
}
function renderInv() {
  const mk = (slot, grp, i, hint = '') => { const d = document.createElement('div'); d.className = 'ms' + (picked && picked.group === grp && picked.idx === i ? ' sel' : ''); d.innerHTML = (!slot && hint ? `<span class="ms-hint">${hint}</span>` : '') + itemHtml(slot); d.onclick = () => clickInvSlot(grp, i); return d; };
  const arEl = document.getElementById('inv-armor'); arEl.innerHTML = '';['🪖', '🦺', '👖', '🥾'].forEach((h, i) => arEl.appendChild(mk(armor[i], 'armor', i, h)));
  const ofEl = document.getElementById('inv-off'); ofEl.innerHTML = ''; ofEl.appendChild(mk(offhand, 'off', 0, '🛡️'));
  const crEl = document.getElementById('inv-craft'); crEl.innerHTML = ''; for (let i = 0; i < 4; i++)crEl.appendChild(mk(craft[i], 'craft', i));
  const outEl = document.getElementById('inv-out'); outEl.innerHTML = ''; outEl.appendChild(mk(craftOut, 'out', 0));
  const bkEl = document.getElementById('inv-back'); bkEl.innerHTML = ''; for (let i = 0; i < 27; i++)bkEl.appendChild(mk(backpack[i], 'back', i));
  const htEl = document.getElementById('inv-hot'); htEl.innerHTML = ''; for (let i = 0; i < 9; i++)htEl.appendChild(mk(hotbar[i], 'hot', i));
  document.getElementById('inv-tool-lbl').textContent = hotbar[selSlot] ? ITEMS[hotbar[selSlot].id].name : 'Hand';
}

const BLUEPRINTS = [
  { id: 22, qty: 1, req: [[3, 4]], desc: 'Workbench' }, { id: 20, qty: 4, req: [[2, 2]], desc: 'Diagonal Slopes' },
  { id: 21, qty: 4, req: [[2, 1]], desc: 'Mini-Blocks' }, { id: 23, qty: 2, req: [[3, 1], [7, 1]], desc: 'Lantern' },
  { id: 103, qty: 1, req: [[7, 2], [3, 1]], desc: 'Crystal Sword (48 dmg)' }, { id: 105, qty: 1, req: [[15, 3], [302, 1]], desc: 'Cyber Blade (75 dmg)' },
  { id: 201, qty: 1, req: [[2, 3]], desc: 'Overworld Helm' }, { id: 202, qty: 1, req: [[2, 4]], desc: 'Overworld Chest' },
  { id: 211, qty: 1, req: [[14, 3], [301, 1]], desc: 'Lava Helm (Heat Immune)' }, { id: 212, qty: 1, req: [[16, 4], [301, 1]], desc: 'Lava Plate (Burn Reflect)' },
  { id: 221, qty: 1, req: [[15, 3], [302, 1]], desc: 'Cyber Visor (Scanner)' }, { id: 222, qty: 1, req: [[15, 4], [302, 1]], desc: 'Cyber Suit (Shield)' },
  { id: 224, qty: 1, req: [[15, 2], [302, 1]], desc: 'AntiGrav Boots (Fast)' }
];
function renderBench() {
  document.getElementById('gem-lbl').textContent = player.gem ? player.gem.toUpperCase() : 'None';
  const g = document.getElementById('bench-grid'); g.innerHTML = '';
  BLUEPRINTS.forEach(bp => {
    const it = ITEMS[bp.id], ok = bp.req.every(([rid, rq]) => hasItem(rid, rq));
    const box = document.createElement('div'); box.className = 'box' + (ok ? ' own' : '');
    box.innerHTML = `<div><b>${it.icon || ''} ${it.name} x${bp.qty}</b><div style="color:#94a3b8;font-size:10px">${bp.desc}<br/>Need: ${bp.req.map(([r, q]) => `${q} ${ITEMS[r].name}`).join('+')}</div></div>`;
    const b = document.createElement('button'); b.className = 'ab ' + (ok ? 'g' : ''); b.disabled = !ok; b.textContent = ok ? 'Craft' : 'Locked';
    b.onclick = () => { if (!bp.req.every(([r, q]) => hasItem(r, q))) return; bp.req.forEach(([r, q]) => takeItem(r, q)); giveItem(bp.id, bp.qty); sfx.buy(); renderBench(); showToast(`Crafted ${it.name}!`); };
    box.appendChild(b); g.appendChild(box);
  });
}
window.socketGem = g => { if (player.mineBux < 25) { sfx.oof(); showToast('Need 25 M$!'); return; } addBux(-25); player.gem = g; saveAll(); sfx.win(); renderBench(); showToast(`Socketed ${g.toUpperCase()} GEM!`); };

// --- 3D SCENE ---
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, .1, 160);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, .95));
const sun = new THREE.DirectionalLight(0xfffbeb, .75); sun.position.set(25, 55, 20); scene.add(sun);
const sunMesh = new THREE.Mesh(new THREE.BoxGeometry(9, 9, 1), new THREE.MeshBasicMaterial({ color: 0xfef08a })); sunMesh.position.set(25, 65, -75); scene.add(sunMesh);
const clouds = [], cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .82 });
for (let i = 0; i < 10; i++) { const cm = new THREE.Mesh(new THREE.BoxGeometry(8 + Math.random() * 9, 1.2, 5 + Math.random() * 5), cloudMat); cm.position.set((Math.random() - .5) * 115, 44 + Math.random() * 6, (Math.random() - .5) * 115); scene.add(cm); clouds.push(cm); }

const particles = [], pGeo = new THREE.BoxGeometry(.18, .18, .18);
function spawnBurst(x, y, z, col, count = 10, force = 4) {
  const m = new THREE.MeshBasicMaterial({ color: col });
  for (let i = 0; i < count; i++) { const mesh = new THREE.Mesh(pGeo, m); mesh.position.set(x, y, z); scene.add(mesh); particles.push({ mesh, vx: (Math.random() - .5) * force * 2, vy: Math.random() * force + 1.5, vz: (Math.random() - .5) * force * 2, life: .55 + Math.random() * .35 }); }
}
const wireBox = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.01, 1.01, 1.01)), new THREE.LineBasicMaterial({ color: 0 })); wireBox.visible = false; scene.add(wireBox);
const lavaWaveGeo = new THREE.PlaneGeometry(80, 80); lavaWaveGeo.rotateX(-Math.PI / 2);
const lavaWaveMesh = new THREE.Mesh(lavaWaveGeo, new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: .68, side: THREE.DoubleSide })); lavaWaveMesh.visible = false; scene.add(lavaWaveMesh);
let lavaWaveT = 0, lavaWaveY = 0, shakeT = 0, swingT = 0;

// --- 3 DIMENSIONS CHUNKS ---
const CHUNK = 8, LOAD_R = 2, world = new Map(), loadedChunks = new Set(), keyOf = (x, y, z) => `${x},${y},${z}`, dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const getBlock = (x, y, z) => world.get(keyOf(x, y, z)) || null;
const hash2 = (x, z) => { const h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return h - Math.floor(h); };
const hash3 = (x, y, z) => { const h = Math.sin(x * 127.1 + y * 269.5 + z * 311.7) * 43758.5453; return h - Math.floor(h); };

function biomeAt(x, z) {
  if (curWorld === 'lava_realm') return 'lava'; if (curWorld === 'cyber_realm') return 'cyber';
  const t = Math.sin(x * .042) + Math.sin(z * .042); return t > .85 ? 'desert' : (t < -.85 ? 'snow' : 'plains');
}
function mcHeight(x, z, bio) {
  const b = Math.sin(x * .13) * 2.2 + Math.cos(z * .13) * 2.2 + Math.sin((x + z) * .05) * 1.8;
  if (bio === 'cyber') return Math.max(19, Math.round(21 + Math.sin(x * .2) * 1.2));
  if (bio === 'lava') return Math.max(19, Math.round(21 + b * 1.3));
  if (bio === 'snow') return Math.max(19, Math.round(23 + b * 1.2));
  return Math.max(19, Math.round(22 + b));
}
function updMesh(x, y, z) {
  const c = getBlock(x, y, z); if (!c) return;
  const exp = dirs.some(([dx, dy, dz]) => !world.has(keyOf(x + dx, y + dy, z + dz)));
  if (exp && !c.mesh) { const it = ITEMS[c.id]; c.mesh = new THREE.Mesh(it.geo || boxGeo, it.mat); c.mesh.position.set(x + .5, y + (it.geo === miniGeo ? .25 : .5), z + .5); scene.add(c.mesh); }
  else if (!exp && c.mesh) { scene.remove(c.mesh); c.mesh = null; }
}
function setRaw(x, y, z, id) { const k = keyOf(x, y, z), old = world.get(k); if (old && old.mesh) scene.remove(old.mesh); if (id === 0) world.delete(k); else world.set(k, { x, y, z, id, mesh: null }); }
function setBlock(x, y, z, id, rec = false) {
  setRaw(x, y, z, id); updMesh(x, y, z); dirs.forEach(([dx, dy, dz]) => updMesh(x + dx, y + dy, z + dz));
  if (rec && isInfiniteWorld()) { worldEdits[curWorld] = worldEdits[curWorld] || {}; worldEdits[curWorld][keyOf(x, y, z)] = id; saveAll(); }
}
const isInfiniteWorld = () => ['overworld', 'lava_realm', 'cyber_realm'].includes(curWorld) || curWorld.startsWith('custom_');

function genChunk(cx, cz) {
  const ck = `${cx},${cz}`; if (loadedChunks.has(ck)) return; loadedChunks.add(ck);
  const x0 = cx * CHUNK, z0 = cz * CHUNK, custom = curWorld.startsWith('custom_') ? customGames.find(g => g.id === curWorld) : null, isFlat = custom && custom.type === 'flat';
  for (let lx = 0; lx < CHUNK; lx++)for (let lz = 0; lz < CHUNK; lz++) {
    const x = x0 + lx, z = z0 + lz, bio = isFlat ? 'plains' : biomeAt(x, z);
    setRaw(x, 0, z, 12); if (hash2(x * 3, z * 3) > .55) setRaw(x, 1, z, 12);
    const h = isFlat ? 18 : mcHeight(x, z, bio);
    for (let y = 1; y < h - 2; y++) {
      if (getBlock(x, y, z)) continue;
      if (!isFlat && y >= 4 && y <= h - 5 && Math.sin(x * .28 + y * .4) * Math.cos(z * .28 - y * .35) > .62) continue;
      setRaw(x, y, z, (!isFlat && hash3(x, y, z) > .94) ? 7 : (bio === 'lava' ? 14 : (bio === 'cyber' ? 16 : 2)));
    }
    if (bio === 'lava') { setRaw(x, h - 2, z, 14); setRaw(x, h - 1, z, 14); setRaw(x, h, z, h <= 20 ? 11 : 14); if (hash2(x, z) > .97 && Math.abs(x) > 3) for (let s = 1; s <= 4; s++)setRaw(x, h + s, z, 16); }
    else if (bio === 'cyber') { setRaw(x, h - 2, z, 16); setRaw(x, h - 1, z, 16); setRaw(x, h, z, 15); if (hash2(x, z) > .97 && Math.abs(x) > 3) for (let s = 1; s <= 4; s++)setRaw(x, h + s, z, s === 4 ? 23 : 15); }
    else if (bio === 'desert') { setRaw(x, h - 2, z, 5); setRaw(x, h - 1, z, 5); setRaw(x, h, z, 5); }
    else if (bio === 'snow') { setRaw(x, h - 2, z, 9); setRaw(x, h - 1, z, 9); setRaw(x, h, z, 6); }
    else {
      setRaw(x, h - 2, z, 9); setRaw(x, h - 1, z, 9); setRaw(x, h, z, 1);
      if (!isFlat && lx >= 1 && lx <= CHUNK - 2 && lz >= 1 && lz <= CHUNK - 2 && (Math.abs(x) > 3 || Math.abs(z) > 3) && hash2(x, z) > .978) {
        for (let ty = 1; ty <= 4; ty++)setRaw(x, h + ty, z, 3);
        for (let dx = -1; dx <= 1; dx++)for (let dz = -1; dz <= 1; dz++) { setRaw(x + dx, h + 4, z + dz, 10); setRaw(x + dx, h + 5, z + dz, 10); }
        setRaw(x, h + 6, z, 10);
      }
    }
  }
  const ed = worldEdits[curWorld]; if (ed) for (const [k, bid] of Object.entries(ed)) { const [ex, ey, ez] = k.split(',').map(Number); if (ex >= x0 && ex < x0 + CHUNK && ez >= z0 && ez < z0 + CHUNK) setRaw(ex, ey, ez, bid); }
  for (let lx = -1; lx <= CHUNK; lx++)for (let lz = -1; lz <= CHUNK; lz++) { const x = x0 + lx, z = z0 + lz; for (let y = 0; y <= 34; y++)if (getBlock(x, y, z)) updMesh(x, y, z); }
}
function unloadChunk(cx, cz) { const ck = `${cx},${cz}`; if (!loadedChunks.has(ck)) return; loadedChunks.delete(ck); const x0 = cx * CHUNK, z0 = cz * CHUNK; for (let lx = 0; lx < CHUNK; lx++)for (let lz = 0; lz < CHUNK; lz++)for (let y = 0; y <= 38; y++)setRaw(x0 + lx, y, z0 + lz, 0); }
let lastCx = 9999, lastCz = 9999;
function streamChunks() {
  if (!isInfiniteWorld()) return; const pcx = Math.floor(player.x / CHUNK), pcz = Math.floor(player.z / CHUNK);
  if (pcx === lastCx && pcz === lastCz) return; lastCx = pcx; lastCz = pcz;
  for (let cx = pcx - LOAD_R; cx <= pcx + LOAD_R; cx++)for (let cz = pcz - LOAD_R; cz <= pcz + LOAD_R; cz++)genChunk(cx, cz);
  for (const ck of [...loadedChunks]) { const [cx, cz] = ck.split(',').map(Number); if (Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz)) > LOAD_R + 1) unloadChunk(cx, cz); }
}
function groundY(x, z) { const bx = Math.floor(x), bz = Math.floor(z); for (let y = 36; y >= 0; y--)if (getBlock(bx, y, bz)) return y + 1; return isInfiniteWorld() ? mcHeight(bx, bz, biomeAt(bx, bz)) + 1 : 3; }

// --- CHARACTERS, ORIGINAL MONSTERS & ANIMALS ---
const steveFace = mkMat(c => { pxGrid(c, ['#d6a374', '#c89465']); c.fillStyle = '#4a2f18'; c.fillRect(0, 0, 16, 4); c.fillStyle = '#fff'; c.fillRect(2, 6, 2, 2); c.fillRect(12, 6, 2, 2); c.fillStyle = '#3b82f6'; c.fillRect(4, 6, 2, 2); c.fillRect(10, 6, 2, 2); c.fillStyle = '#5c3a21'; c.fillRect(5, 11, 6, 2); });
function makeMcChar(c, scale = 1, useFace = false) {
  const g = new THREE.Group(), eyeM = new THREE.MeshBasicMaterial({ color: c.eye || 0x111827 });
  const torsoMat = new THREE.MeshLambertMaterial({ color: c.torso }), headMat = new THREE.MeshLambertMaterial({ color: c.head }), armMat = new THREE.MeshLambertMaterial({ color: c.arms }), legMat = new THREE.MeshLambertMaterial({ color: c.legs });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(.5, .68, .26), torsoMat); torso.position.y = 1.07; g.add(torso);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.44, .44, .44), useFace ? [headMat, headMat, headMat, headMat, headMat, steveFace] : headMat); head.position.y = 1.63;
  if (!useFace) { const eL = new THREE.Mesh(new THREE.BoxGeometry(.07, .07, .02), eyeM); eL.position.set(-.1, .03, -.225); const eR = eL.clone(); eR.position.x = .1; const m = new THREE.Mesh(new THREE.BoxGeometry(.16, .05, .02), eyeM); m.position.set(0, -.1, -.225); head.add(eL, eR, m); }
  g.add(head);
  function limb(w, h, d, m, px, py) { const p = new THREE.Group(); p.position.set(px, py, 0); const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.y = -h / 2; p.add(b); g.add(p); return p; }
  const lL = limb(.23, .73, .24, legMat, -.13, .73), rL = limb(.23, .73, .24, legMat, .13, .73), lA = limb(.21, .68, .22, armMat, -.36, 1.41), rA = limb(.21, .68, .22, armMat, .36, 1.41);
  g.scale.setScalar(scale); return { g, head, torso, lL, rL, lA, rA, mats: { headMat, torsoMat, armMat, legMat } };
}
function makeOriginalMob(kind) {
  const g = new THREE.Group(), legs = [];
  if (kind === 'spider') {
    const cMat = new THREE.MeshLambertMaterial({ color: 0xa855f7, emissive: 0x3b0764 }), eyeM = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const body = new THREE.Mesh(new THREE.BoxGeometry(.6, .35, .75), cMat); body.position.y = .42; g.add(body);
    const e1 = new THREE.Mesh(new THREE.BoxGeometry(.1, .08, .02), eyeM); e1.position.set(-.15, .45, -.38); const e2 = e1.clone(); e2.position.x = .15; g.add(e1, e2);
    [-.35, .35].forEach(lx => [-.25, 0, .25].forEach(lz => { const p = new THREE.Group(); p.position.set(lx, .3, lz); const m = new THREE.Mesh(new THREE.BoxGeometry(.35, .08, .08), cMat); m.position.x = lx > 0 ? .16 : -.16; p.add(m); g.add(p); legs.push(p); }));
  } else {
    const cfg = kind === 'golem' ? { head: 0x7f858d, arms: 0x686e75, torso: 0x5e646b, legs: 0x4b5563, eye: 0x4ade80, sc: 1.25 }
      : (kind === 'stalker' ? { head: 0x09090b, arms: 0x18181b, torso: 0x09090b, legs: 0x18181b, eye: 0xf43f5e, sc: 1.05 }
        : (kind === 'magma' ? { head: 0xf97316, arms: 0xea580c, torso: 0x9a3412, legs: 0x7f1d1d, eye: 0xfacc15, sc: 1.1 }
          : { head: 0x06b6d4, arms: 0x0284c7, torso: 0x1e293b, legs: 0x0f172a, eye: 0xf472b6, sc: 1 }));
    const r = makeMcChar(cfg, cfg.sc); return { g: r.g, legs: [r.lL, r.rL], kind };
  }
  return { g, legs, kind };
}
const ANIMAL_STYLES = { pig: { body: 0xf472b6, head: 0xf9a8d4, leg: 0xdb2777, sc: .75 }, sheep: { body: 0xf8fafc, head: 0xe2e8f0, leg: 0x94a3b8, sc: .85 }, camel: { body: 0xeab308, head: 0xfacc15, leg: 0xca8a04, sc: 1.05 }, bear: { body: 0xf1f5f9, head: 0xffffff, leg: 0xcbd5e1, sc: 1.2 } };
function makeAnimal(kind) {
  const st = ANIMAL_STYLES[kind] || ANIMAL_STYLES.pig, g = new THREE.Group();
  const bMat = new THREE.MeshLambertMaterial({ color: st.body }), hMat = new THREE.MeshLambertMaterial({ color: st.head }), lMat = new THREE.MeshLambertMaterial({ color: st.leg }), eMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(.55, .45, .85), bMat); body.position.set(0, .52, 0); g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.38, .36, .38), hMat); head.position.set(0, .74, -.52);
  const e1 = new THREE.Mesh(new THREE.BoxGeometry(.05, .06, .02), eMat); e1.position.set(-.09, .04, -.195); const e2 = e1.clone(); e2.position.x = .09; head.add(e1, e2); g.add(head);
  const legs = [];[[-.17, -.28], [.17, -.28], [-.17, .28], [.17, .28]].forEach(([lx, lz]) => { const p = new THREE.Group(); p.position.set(lx, .32, lz); const m = new THREE.Mesh(new THREE.BoxGeometry(.15, .32, .15), lMat); m.position.y = -.16; p.add(m); g.add(p); legs.push(p); });
  g.scale.setScalar(st.sc); return { g, legs };
}
function makeTag(txt, col = '#fff') {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(15,23,42,.82)'; ctx.fillRect(6, 12, 244, 40); ctx.fillStyle = col;
  ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 128, 32);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c) })); sp.scale.set(2, .48, 1); sp.position.y = 2.35; return sp;
}

const SKINS = [
  { id: 'steve', name: 'Overworld Miner', cost: 0, head: 0xd6a374, arms: 0xd6a374, torso: 0x06b6d4, legs: 0x1e3a8a },
  { id: 'noob', name: 'Classic Noob', cost: 0, head: 0xfacc15, arms: 0xfacc15, torso: 0x2563eb, legs: 0x22c55e },
  { id: 'magma', name: 'Lava Forged', cost: 35, head: 0xf97316, arms: 0x7f1d1d, torso: 0x991b1b, legs: 0x450a0a },
  { id: 'cyber', name: 'Cyber Nano', cost: 55, head: 0x06b6d4, arms: 0x0f172a, torso: 0x1e1b4b, legs: 0x0891b2 },
  { id: 'gold', name: 'Golden Titan', cost: 100, head: 0xfacc15, arms: 0xf59e0b, torso: 0xeab308, legs: 0xb45309 }
];
const GEAR = [
  { id: 'shades', name: 'Blox Shades', cost: 15, desc: 'Cool shades', on: () => shades.visible = true },
  { id: 'crown', name: 'Gold Crown', cost: 30, desc: 'Royal crown', on: () => crown.visible = true },
  { id: 'speed', name: 'Speed Coil', cost: 40, desc: '+45% speed', on: () => { player.speedMult = 1.45; speedCoil.visible = true; } }
];

const pRig = makeMcChar(SKINS[0], 1, true);
let pNameTag = makeTag('👑owner👑', '#facc15'); pRig.g.add(pNameTag);
const shades = new THREE.Mesh(new THREE.BoxGeometry(.38, .1, .05), new THREE.MeshBasicMaterial({ color: 0x09090b })); shades.position.set(0, .04, -.23); shades.visible = false; pRig.head.add(shades);
const crown = new THREE.Mesh(new THREE.CylinderGeometry(.18, .22, .16, 6), new THREE.MeshLambertMaterial({ color: 0xfacc15, emissive: 0x664d00 })); crown.position.set(0, .29, 0); crown.visible = false; pRig.head.add(crown);
const speedCoil = new THREE.Mesh(new THREE.TorusGeometry(.15, .035, 8, 16), new THREE.MeshLambertMaterial({ color: 0x38bdf8, emissive: 0x0284c7 })); speedCoil.rotation.x = Math.PI / 2; speedCoil.position.y = -.45; speedCoil.visible = false; pRig.rA.add(speedCoil);

const armMat3D = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
const armHelm = new THREE.Mesh(new THREE.BoxGeometry(.48, .22, .48), armMat3D); armHelm.position.y = .15; armHelm.visible = false; pRig.head.add(armHelm);
const armChest = new THREE.Mesh(new THREE.BoxGeometry(.55, .6, .31), armMat3D); armChest.position.y = 1.1; armChest.visible = false; pRig.g.add(armChest);
const armLegs = new THREE.Mesh(new THREE.BoxGeometry(.52, .35, .29), armMat3D); armLegs.position.y = .56; armLegs.visible = false; pRig.g.add(armLegs);
const armBootL = new THREE.Mesh(new THREE.BoxGeometry(.26, .2, .28), armMat3D); armBootL.position.y = -.63; armBootL.visible = false; pRig.lL.add(armBootL);
const armBootR = armBootL.clone(); pRig.rL.add(armBootR);

const armorTier = () => armor.reduce((m, s) => Math.max(m, s ? ITEMS[s.id].tier : 0), 0);
const hasFullSet = t => armor.some(s => s && ITEMS[s.id].tier === t);
function updArmor3D() {
  const t = armorTier(); armMat3D.color.setHex(t === 3 ? 0x22d3ee : (t === 2 ? 0xf97316 : 0x94a3b8));
  armHelm.visible = !!armor[0]; armChest.visible = !!armor[1]; armLegs.visible = !!armor[2]; armBootL.visible = armBootR.visible = !!armor[3];
  const cnt = armor.filter(Boolean).length, ab = document.getElementById('armor-bar');
  if (cnt > 0) { ab.style.display = 'inline'; ab.textContent = '🛡️'.repeat(cnt); } else ab.style.display = 'none';
  if (hasFullSet(3)) { if (player.shieldMax === 0) { player.shieldMax = 5; player.shield = 5; } } else { player.shieldMax = 0; player.shield = 0; }
  updBars();
}

const heldGroup = new THREE.Group(); heldGroup.position.set(0, -.62, -.25); heldGroup.rotation.x = Math.PI / 4;
const hHandle = new THREE.Mesh(new THREE.BoxGeometry(.06, .52, .06), new THREE.MeshLambertMaterial({ color: 0x78512f }));
const hHead = new THREE.Mesh(new THREE.BoxGeometry(.42, .1, .08), new THREE.MeshLambertMaterial({ color: 0x22d3ee })); hHead.position.y = .22;
const hGuard = new THREE.Mesh(new THREE.BoxGeometry(.24, .06, .08), new THREE.MeshLambertMaterial({ color: 0x78512f })); hGuard.position.y = .02;
heldGroup.add(hHandle, hHead, hGuard); heldGroup.visible = false; pRig.rA.add(heldGroup);
scene.add(pRig.g);

function updHeldTool() {
  const sl = hotbar[selSlot], it = sl ? ITEMS[sl.id] : null;
  if (it && (it.type === 'pick' || it.type === 'sword')) {
    heldGroup.visible = true; hHead.material.color.setHex(it.col); hGuard.visible = (it.type === 'sword');
    hHead.scale.set(it.type === 'pick' ? 1 : .35, it.type === 'sword' ? 2.6 : 1, 1); hHead.position.y = it.type === 'sword' ? .28 : .22;
  } else heldGroup.visible = false;
}
function applySkin(id) {
  const s = SKINS.find(x => x.id === id) || SKINS[0];
  pRig.mats.headMat.color.setHex(s.head); pRig.mats.armMat.color.setHex(s.arms);
  pRig.mats.torsoMat.color.setHex(s.torso); pRig.mats.legMat.color.setHex(s.legs);
  curSkin = s.id; saveAll();
}

const mobs = [], animals = [], shockwaves = [], bots = [], drops = [], portals = [];
const ringGeo = new THREE.RingGeometry(.6, 1, 28); ringGeo.rotateX(-Math.PI / 2);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: .85 });
const crateGeo = new THREE.BoxGeometry(.95, .95, .95);
const crateMat = new THREE.MeshLambertMaterial({ map: mkTex(c => { c.fillStyle = '#ea580c'; c.fillRect(0, 0, 16, 16); c.strokeStyle = '#facc15'; c.strokeRect(.5, .5, 15, 15); bevelBorder(c); }), emissive: 0x450a0a });

const bossRig = makeMcChar({ head: 0xef4444, arms: 0x7f1d1d, torso: 0x3b0764, legs: 0x1e1b4b, eye: 0xfacc15 }, 2.2, false);
bossRig.g.visible = false; scene.add(bossRig.g);
const boss = { hp: 140, maxHp: 140, x: 0, y: 3, z: -8, alive: false, slamT: 3, walkT: 0, pay: 35, name: 'OVERWORLD TITAN', dropId: 301 };

const DUEL_TIERS = { duel_easy: { name: 'Rival_Knight', hp: 100, dmg: 1, pay: 15, col: 0xef4444, spd: 3.2 }, duel_pro: { name: 'Shadow_Samurai', hp: 160, dmg: 2, pay: 25, col: 0x7c3aed, spd: 3.8 } };
const duelRig = makeMcChar({ head: 0xd6a374, arms: 0xd6a374, torso: 0xef4444, legs: 0x1e293b }, 1, true);
duelRig.g.add(makeTag('Rival', '#f87171'));
const dSw = new THREE.Mesh(new THREE.BoxGeometry(.08, .75, .08), new THREE.MeshLambertMaterial({ color: 0x22d3ee })); dSw.position.set(0, -.62, -.35); dSw.rotation.x = Math.PI / 3; duelRig.rA.add(dSw);
duelRig.g.visible = false; scene.add(duelRig.g);
const duel = { active: false, hp: 100, maxHp: 100, dmg: 1, pay: 15, spd: 3.2, x: 0, y: 3, z: -5, hitCd: 0, walkT: 0 };

const player = {
  x: .5, y: 4, z: 6, vx: 0, vy: 0, vz: 0, yaw: 0, pitch: -.15, onGround: false, halfW: .28, height: 1.8,
  thirdPerson: true, hp: 10, maxHp: 10, hunger: 100, stamina: 100, shield: 0, shieldMax: 0,
  invuln: 0, rollT: 0, walkTime: 0, flying: false, speedMult: 1, mineBux: 25, xp: 0, bpLvl: 1,
  strMult: 1, spdMult: 1, jmpMult: 1, godMode: false, frozen: false, gem: null
};

const BOT_NAMES = ['SteakFan', 'CaylusFan'], botStats = { SteakFan: { bux: 45 }, CaylusFan: { bux: 60 } };
const ownedSkins = new Set(['steve', 'noob']), ownedGear = new Set(), bannedSet = new Set(), claimedBP = new Set();
let customGames = [], worldEdits = {}, curWorld = 'lobby', curSkin = 'steve', vipPass = false, ownerPin = FIXED_OWNER_PIN || null, adminUnlocked = false, botsFrozen = false, discoMode = false, luckT = 0;

// --- MULTIPLAYER ---
const myId = 'p_' + Math.random().toString(36).slice(2, 9);
let myName = '👑owner👑', mpRoom = 'GLOBAL', mqttClient = null, mpConnected = false;
const remotePlayers = new Map();
function updMpStat() { const el = document.getElementById('mp-stat'); el.textContent = mpConnected ? `🟢 Online: ${1 + remotePlayers.size}` : '🟡 Offline'; el.style.color = mpConnected ? '#4ade80' : '#fbbf24'; }
function addChatLine(sender, txt, col = '#e2e8f0') {
  const log = document.getElementById('chat-log'), d = document.createElement('div'); d.style.marginBottom = '4px';
  d.innerHTML = `<b style="color:${col}">${sender}:</b> <span></span>`; d.querySelector('span').textContent = txt;
  log.appendChild(d); log.scrollTop = log.scrollHeight; showToast(`${sender}: ${txt}`);
}
function setOwnerName(newName) {
  myName = newName.slice(0, 16);
  document.getElementById('hud-pname').textContent = myName;
  document.getElementById('inv-pname').textContent = myName;
  document.getElementById('mp-name').value = myName;
  pRig.g.remove(pNameTag); pNameTag = makeTag(myName, '#facc15'); pRig.g.add(pNameTag);
  saveAll();
}
window.sendChat = () => {
  const inp = document.getElementById('chat-in'), t = inp.value.trim(); if (!t) return; inp.value = '';
  if (t.toLowerCase() === SECRET_CMD) {
    toggleModal('chat-modal', false); document.getElementById('btn-admin').style.display = 'inline-block';
    showToast('Owner Access Unlocked!'); openAdminGate(); return;
  }
  if (t.toLowerCase().startsWith('/ownername')) {
    const newN = t.slice(10).trim() || '👑owner👑';
    setOwnerName(newN); toggleModal('chat-modal', false); sfx.win(); showToast(`Name changed to ${myName}!`); return;
  }
  addChatLine(myName, t, '#facc15'); mpPub({ t: 'chat', id: myId, name: myName, txt: t });
};
function mpPub(obj) { if (!mqttClient || !mpConnected) return; try { mqttClient.publish(`craftblox_mp_v2/${mpRoom}`, JSON.stringify(obj)); } catch (e) { } }
function createRemoteAvatar(id, name) {
  const rig = makeMcChar(SKINS[0], 1, true); rig.g.add(makeTag(name, '#38bdf8'));
  const rHelm = new THREE.Mesh(new THREE.BoxGeometry(.48, .22, .48), armMat3D); rHelm.position.y = .15; rHelm.visible = false; rig.head.add(rHelm);
  const rChest = new THREE.Mesh(new THREE.BoxGeometry(.55, .6, .31), armMat3D); rChest.position.y = 1.1; rChest.visible = false; rig.g.add(rChest);
  const rSw = new THREE.Mesh(new THREE.BoxGeometry(.08, .7, .08), new THREE.MeshLambertMaterial({ color: 0x22d3ee })); rSw.position.set(0, -.62, -.3); rSw.rotation.x = Math.PI / 3; rSw.visible = false; rig.rA.add(rSw);
  scene.add(rig.g);
  return { id, name, rig, rHelm, rChest, rSw, x: 0, y: 3, z: 0, tx: 0, ty: 3, tz: 0, yaw: 0, tyaw: 0, world: 'lobby', bux: 0, walkT: 0, lastSeen: performance.now(), swing: 0 };
}
function connectMultiplayer(name, room) {
  setOwnerName(name || 'Player'); mpRoom = (room || 'GLOBAL').toUpperCase().replace(/[^A-Z0-9_-]/g, '') || 'GLOBAL';
  if (typeof mqtt === 'undefined') { updMpStat(); return; }
  const brokers = ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt'];
  let bIdx = 0, tries = 0;
  function tryConn() {
    if (mqttClient) try { mqttClient.end(true); } catch (e) { }
    mqttClient = mqtt.connect(brokers[bIdx], { clientId: myId + '_' + Date.now(), keepalive: 25, reconnectPeriod: 4000 });
    mqttClient.on('connect', () => { mpConnected = true; updMpStat(); mqttClient.subscribe(`craftblox_mp_v2/${mpRoom}`); addChatLine('SYSTEM', `Joined "${mpRoom}"!`, '#4ade80'); });
    mqttClient.on('error', () => { tries++; if (tries > 2 && bIdx === 0) { bIdx = 1; tries = 0; tryConn(); } });
    mqttClient.on('close', () => { mpConnected = false; updMpStat(); });
    mqttClient.on('message', (topic, payload) => {
      let msg; try { msg = JSON.parse(payload.toString()); } catch (e) { return; }
      if (!msg || msg.id === myId) return;
      if (msg.t === 'pos') {
        let rp = remotePlayers.get(msg.id);
        if (!rp) { rp = createRemoteAvatar(msg.id, msg.name); remotePlayers.set(msg.id, rp); updMpStat(); showToast(`${msg.name} joined!`); }
        rp.tx = msg.x; rp.ty = msg.y; rp.tz = msg.z; rp.tyaw = msg.yaw; rp.world = msg.w; rp.bux = msg.bux || 0; rp.lastSeen = performance.now();
        if (msg.sw) rp.swing = .25;
        const sk = SKINS.find(s => s.id === msg.sk); if (sk) { rp.rig.mats.torsoMat.color.setHex(sk.torso); rp.rig.mats.headMat.color.setHex(sk.head); rp.rig.mats.legMat.color.setHex(sk.legs); }
        rp.rHelm.visible = !!msg.ah; rp.rChest.visible = !!msg.ac; rp.rSw.visible = !!msg.tl; rp.rig.g.visible = (rp.world === curWorld);
      } else if (msg.t === 'blk' && msg.w === curWorld) setBlock(msg.x, msg.y, msg.z, msg.bid, true);
      else if (msg.t === 'chat') addChatLine(msg.name, msg.txt, '#38bdf8');
      else if (msg.t === 'hit' && msg.target === myId) hurtPlayer(msg.dmg || 1);
      else if (msg.t === 'bye') { const rp = remotePlayers.get(msg.id); if (rp) { scene.remove(rp.rig.g); remotePlayers.delete(msg.id); updMpStat(); } }
      else if (msg.t === 'adm' && msg.sec === 'tameem') {
        if (msg.act === 'lava') triggerLavaWave(false); else if (msg.act === 'rain') spawnDrop(8, false);
        else if (msg.act === 'luck') activateLuck(false); else if (msg.act === 'disco') toggleDisco(false, msg.val);
        else if (msg.act === 'ann') { const a = document.getElementById('announce'); a.textContent = msg.val; a.style.display = 'block'; setTimeout(() => a.style.display = 'none', 3600); }
        else if (msg.target === myId) {
          if (msg.act === 'kick') { document.getElementById('kick-t').textContent = 'KICKED'; document.getElementById('kick-m').textContent = 'Kicked by Admin.'; toggleModal('kick-modal', true); }
          if (msg.act === 'ban') { bannedSet.add(myName); saveAll(); document.getElementById('kick-t').textContent = 'BANNED'; document.getElementById('kick-m').textContent = 'Banned by Admin!'; toggleModal('kick-modal', true); }
          if (msg.act === 'frz') { player.frozen = !player.frozen; showToast(player.frozen ? 'Frozen!' : 'Unfrozen!'); }
          if (msg.act === 'give') addBux(msg.val, 'Admin Gift');
          if (msg.act === 'take') { player.mineBux = Math.max(0, fmtBux(player.mineBux - msg.val)); addBux(0); }
          if (msg.act === 'zero') { player.mineBux = 0; addBux(0); }
        }
      }
    });
  }
  tryConn();
}
addEventListener('beforeunload', () => mpPub({ t: 'bye', id: myId }));

const SAVE_KEY = 'craftblox_3dim_v6';
function saveAll() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      myName, mineBux: player.mineBux, xp: player.xp, bpLvl: player.bpLvl, vipPass, claimedBP: [...claimedBP],
      ownedSkins: [...ownedSkins], ownedGear: [...ownedGear], curSkin, gem: player.gem,
      customGames, worldEdits, hotbar, backpack, armor, offhand, banned: [...bannedSet], botStats, ownerPin,
      strMult: player.strMult, spdMult: player.spdMult, jmpMult: player.jmpMult, godMode: player.godMode
    }));
  } catch (e) { }
}
function loadAll() {
  try {
    const raw = localStorage.getItem(SAVE_KEY); if (!raw) return; const d = JSON.parse(raw);
    if (d.myName) setOwnerName(d.myName);
    if (typeof d.mineBux === 'number') player.mineBux = d.mineBux; if (typeof d.xp === 'number') player.xp = d.xp; if (typeof d.bpLvl === 'number') player.bpLvl = d.bpLvl;
    if (d.vipPass) vipPass = true; if (Array.isArray(d.claimedBP)) d.claimedBP.forEach(x => claimedBP.add(x));
    if (Array.isArray(d.ownedSkins)) d.ownedSkins.forEach(x => ownedSkins.add(x));
    if (Array.isArray(d.ownedGear)) d.ownedGear.forEach(id => { ownedGear.add(id); const g = GEAR.find(x => x.id === id); if (g) g.on(); });
    if (d.curSkin) curSkin = d.curSkin; if (d.gem) player.gem = d.gem;
    if (Array.isArray(d.customGames)) customGames = d.customGames; if (d.worldEdits) worldEdits = d.worldEdits;
    if (Array.isArray(d.hotbar)) hotbar = d.hotbar; if (Array.isArray(d.backpack)) backpack = d.backpack;
    if (Array.isArray(d.armor)) armor = d.armor; if (d.offhand !== undefined) offhand = d.offhand;
    if (Array.isArray(d.banned)) d.banned.forEach(x => bannedSet.add(x)); if (d.botStats) Object.assign(botStats, d.botStats);
    if (d.ownerPin && !FIXED_OWNER_PIN) ownerPin = d.ownerPin;
    if (d.strMult) player.strMult = d.strMult; if (d.spdMult) player.spdMult = d.spdMult; if (d.jmpMult) player.jmpMult = d.jmpMult; if (d.godMode) player.godMode = true;
  } catch (e) { }
}

const fmtBux = n => Number(n.toFixed(1));
function addBux(amt, reason) {
  const mult = (luckT > 0 && amt > 0) ? 10 : 1, finalAmt = fmtBux(amt * mult);
  player.mineBux = fmtBux(player.mineBux + finalAmt);
  document.getElementById('minebux').textContent = player.mineBux; document.getElementById('sk-bux').textContent = player.mineBux; document.getElementById('adm-bux').textContent = player.mineBux;
  if (finalAmt !== 0) saveAll();
  if (reason) showToast(`${finalAmt > 0 ? '+' : ''}${finalAmt} M$ (${reason}${mult > 1 ? ' 10x!' : ''})`);
}
function addXP(amt) {
  player.xp += amt; while (player.xp >= 100 && player.bpLvl < 6) { player.xp -= 100; player.bpLvl++; sfx.win(); showToast(`Level ${player.bpLvl}!`); }
  document.getElementById('xp-fill').style.width = `${Math.min(100, player.xp)}%`; document.getElementById('xp-num').textContent = player.bpLvl; saveAll();
}
function updBars() {
  document.getElementById('hearts-bar').textContent = player.godMode ? '🛡️'.repeat(10) : ('❤️'.repeat(Math.max(0, player.hp)) + '🖤'.repeat(Math.max(0, 10 - player.hp)));
  document.getElementById('hunger-bar').textContent = `🍗${Math.round(player.hunger)}%`;
  document.getElementById('stam-bar').textContent = `⚡${Math.round(player.stamina)}%`;
  const sh = document.getElementById('shield-bar');
  if (player.shieldMax > 0) { sh.style.display = 'inline'; sh.textContent = `🔷${Math.round(player.shield)}`; } else sh.style.display = 'none';
}
let toastT;
function showToast(msg) { const el = document.getElementById('toast'); el.textContent = msg; el.style.opacity = '1'; clearTimeout(toastT); toastT = setTimeout(() => el.style.opacity = '0', 1900); }

function spawnBot(name) { if (bannedSet.has(name)) return; const rig = makeMcChar({ head: 0xd6a374, arms: 0xd6a374, torso: 0x3b82f6, legs: 0x334155 }, 1, true); rig.g.add(makeTag(name)); const bx = (Math.random() - .5) * 10, bz = (Math.random() - .5) * 10; rig.g.position.set(bx, 3, bz); scene.add(rig.g); bots.push({ name, rig, x: bx, y: 3, z: bz, dir: Math.random() * 6.28, walkT: 0 }); }
function spawnMob(sx, sy, sz) {
  const bio = isInfiniteWorld() ? biomeAt(sx, sz) : 'plains';
  const kind = bio === 'lava' ? 'magma' : (bio === 'cyber' ? 'drone' : (Math.random() < .35 ? 'spider' : (Math.random() < .5 ? 'golem' : 'stalker')));
  const pay = bio === 'cyber' ? 2 : (bio === 'lava' ? 1.5 : 0.5);
  const rig = makeOriginalMob(kind); rig.g.position.set(sx + .5, sy, sz + .5); scene.add(rig.g);
  mobs.push({ rig, x: sx + .5, y: sy, z: sz + .5, hp: kind === 'golem' ? 50 : 30, pay, name: kind.toUpperCase(), alive: true, respawnT: 0, walkT: Math.random() * 6, dir: Math.random() * 6.28, slowT: 0, burnT: 0 });
}
function spawnAnimal(sx, sy, sz) {
  const bio = isInfiniteWorld() ? biomeAt(sx, sz) : 'plains', an = bio === 'desert' ? 'camel' : (bio === 'snow' ? 'bear' : (Math.random() < .5 ? 'pig' : 'sheep'));
  const rig = makeAnimal(an); rig.g.position.set(sx + .5, sy, sz + .5); scene.add(rig.g);
  animals.push({ rig, x: sx + .5, y: sy, z: sz + .5, hp: 20, alive: true, respawnT: 0, walkT: Math.random() * 6, dir: Math.random() * 6.28 });
}
function addPortal(x, z, label, col, target, yBase = 3) {
  const sp = makeTag(label, '#fde047'); sp.position.set(x + .5, yBase + 2.1, z + .5); scene.add(sp);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(2.3, .22, 2.3), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .85 })); pad.position.set(x + .5, yBase + .1, z + .5); scene.add(pad);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(.35, 14, .35), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .26 })); beam.position.set(x + .5, yBase + 7, z + .5); scene.add(beam);
  portals.push({ x: x + .5, y: yBase, z: z + .5, m1: sp, m2: pad, m3: beam, target });
}

function loadWorld(id) {
  curWorld = id; lastCx = 9999; lastCz = 9999; loadedChunks.clear();
  world.forEach(c => { if (c.mesh) scene.remove(c.mesh); }); world.clear();
  mobs.forEach(m => scene.remove(m.rig.g)); mobs.length = 0; animals.forEach(a => scene.remove(a.rig.g)); animals.length = 0;
  shockwaves.forEach(s => scene.remove(s.mesh)); shockwaves.length = 0; bots.forEach(b => scene.remove(b.rig.g)); bots.length = 0;
  drops.forEach(d => scene.remove(d.mesh)); drops.length = 0; portals.forEach(p => { scene.remove(p.m1); scene.remove(p.m2); scene.remove(p.m3); }); portals.length = 0;
  boss.alive = false; bossRig.g.visible = false; duel.active = false; duelRig.g.visible = false; document.getElementById('boss-wrap').style.display = 'none';
  remotePlayers.forEach(rp => rp.rig.g.visible = (rp.world === curWorld));

  if (id === 'lobby') {
    document.getElementById('wname').textContent = 'Lobby'; scene.background = new THREE.Color(0x7dd3fc); scene.fog = new THREE.Fog(0x7dd3fc, 34, 92);
    for (let x = -12; x <= 12; x++)for (let z = -12; z <= 12; z++) { setRaw(x, 1, z, 12); setRaw(x, 2, z, (Math.abs(x) === 12 || Math.abs(z) === 12) ? 15 : ((x + z) % 2 === 0 ? 4 : 2)); if (Math.abs(x) < 3 && Math.abs(z) < 3) setRaw(x, 2, z, 1); }
    for (let x = -12; x <= 12; x++)for (let z = -12; z <= 12; z++) { updMesh(x, 1, z); updMesh(x, 2, z); }
    addPortal(-4, -9, '⚔️ 1v1 KNIGHT', 0xef4444, 'duel_easy', 3);
    addPortal(2, -9, '⚔️ 1v1 SAMURAI', 0xa855f7, 'duel_pro', 3);
    addPortal(-9, -2, '1: OVERWORLD', 0x22c55e, 'overworld', 3);
    addPortal(9, -2, '2: LAVA REALM', 0xf97316, 'lava_realm', 3);
    addPortal(9, 4, '3: CYBER DIM', 0x06b6d4, 'cyber_realm', 3);
    addPortal(-9, 4, 'WORLDS / MAPS', 0x38bdf8, '_hub', 3);
    BOT_NAMES.forEach(n => spawnBot(n)); player.x = .5; player.y = 3.5; player.z = 7;
  } else if (DUEL_TIERS[id]) {
    const dt = DUEL_TIERS[id]; document.getElementById('wname').textContent = '1v1 Duel'; scene.background = new THREE.Color(0x7dd3fc); scene.fog = new THREE.Fog(0x7dd3fc, 34, 92);
    for (let x = -7; x <= 7; x++)for (let z = -7; z <= 7; z++) { setRaw(x, 0, z, 12); setRaw(x, 1, z, 2); setRaw(x, 2, z, (Math.abs(x) === 7 || Math.abs(z) === 7) ? 15 : 4); updMesh(x, 0, z); updMesh(x, 1, z); updMesh(x, 2, z); }
    duel.active = true; duel.hp = duel.maxHp = dt.hp; duel.dmg = dt.dmg; duel.pay = dt.pay; duel.spd = dt.spd; duel.x = .5; duel.y = 3; duel.z = -4.5; duel.hitCd = 1.2;
    duelRig.mats.torsoMat.color.setHex(dt.col); duelRig.g.position.set(duel.x, duel.y, duel.z); duelRig.g.visible = true;
    document.getElementById('boss-title').textContent = `1v1: ${dt.name} (+${dt.pay} M$)`; document.getElementById('boss-wrap').style.display = 'block'; document.getElementById('boss-fill').style.width = '100%';
    player.x = .5; player.y = 3.5; player.z = 4.5;
  } else {
    const sky = id === 'lava_realm' ? 0x450a0a : (id === 'cyber_realm' ? 0x090d24 : 0x7dd3fc);
    scene.background = new THREE.Color(sky); scene.fog = new THREE.Fog(sky, 34, 92);
    player.x = .5; player.z = 4; streamChunks(); player.y = groundY(.5, 4) + 1;
    // Return Portal & Gateway Portals + Dimension Boss!
    if (id === 'overworld') {
      document.getElementById('wname').textContent = 'Overworld';
      addPortal(-5, 0, 'TO LAVA REALM', 0xf97316, 'lava_realm', groundY(-5, 0));
      addPortal(5, 0, 'TO CYBER DIM', 0x06b6d4, 'cyber_realm', groundY(5, 0));
      spawnBoss(0, groundY(0, -14), -14, 140, 'OVERWORLD TITAN', 35, 301, 0x22c55e, 0x15803d);
    } else if (id === 'lava_realm') {
      document.getElementById('wname').textContent = 'Lava Realm';
      addPortal(-4, 4, 'RETURN OVERWORLD', 0x22c55e, 'overworld', groundY(-4, 4));
      addPortal(4, 4, 'TO CYBER DIM', 0x06b6d4, 'cyber_realm', groundY(4, 4));
      spawnBoss(0, groundY(0, -14), -14, 210, 'INFERNO OVERLORD', 65, 302, 0xf97316, 0x7f1d1d);
    } else if (id === 'cyber_realm') {
      document.getElementById('wname').textContent = 'Cyber Dim';
      addPortal(0, 6, 'CYBER RETURN PAD', 0x22c55e, 'overworld', groundY(0, 6));
      spawnBoss(0, groundY(0, -14), -14, 280, 'CYBER CORE MECH', 120, 303, 0x06b6d4, 0x312e81);
    }
    [[10, 10], [-11, -9]].forEach(([x, z]) => spawnMob(x, groundY(x, z), z));
    if (id === 'overworld' || id.startsWith('custom_')) [[4, 5], [-4, 3]].forEach(([x, z]) => spawnAnimal(x, groundY(x, z), z));
  }
  player.hp = 10; player.hunger = 100; player.stamina = 100; updBars(); player.vx = player.vy = player.vz = 0;
}

function spawnBoss(x, y, z, hp = 140, title = 'DIMENSION BOSS', pay = 35, dropId = 301, bh = 0xef4444, bt = 0x3b0764) {
  boss.hp = boss.maxHp = hp; boss.x = x; boss.y = y; boss.z = z; boss.alive = true; boss.slamT = 3; boss.pay = pay; boss.name = title; boss.dropId = dropId;
  bossRig.mats.headMat.color.setHex(bh); bossRig.mats.torsoMat.color.setHex(bt);
  bossRig.g.position.set(x, y, z); bossRig.g.visible = true;
  document.getElementById('boss-title').textContent = `${title} (+${pay} M$)`;
  document.getElementById('boss-wrap').style.display = 'block'; document.getElementById('boss-fill').style.width = '100%';
}

function renderGames() {
  const list = [
    { id: 'lobby', name: 'Fancy Lobby', desc: '1v1 Pads & Dimension Gateways.' },
    { id: 'overworld', name: '1: Overworld', desc: 'Boss: Overworld Titan (+35 M$).' },
    { id: 'lava_realm', name: '2: Lava Realm', desc: 'Boss: Inferno Overlord (+65 M$).' },
    { id: 'cyber_realm', name: '3: Cyber Dim', desc: 'Boss: Cyber Core Mech (+120 M$).' },
    { id: 'duel_easy', name: '1v1: Knight', desc: 'Win +15 M$ (PvP / Rival).' },
    { id: 'duel_pro', name: '1v1: Samurai', desc: 'Win +25 M$ & +70 XP.' }
  ];
  const g = document.getElementById('games-grid'); g.innerHTML = '';
  list.forEach(gm => {
    const box = document.createElement('div'); box.className = 'box own';
    box.innerHTML = `<div><b>${gm.name}</b><div style="font-size:10px;color:#94a3b8">${gm.desc}</div></div>`;
    const b = document.createElement('button'); b.className = 'ab g'; b.textContent = curWorld === gm.id ? 'PLAYING' : 'Play';
    b.onclick = () => { toggleModal('games-modal', false); loadWorld(gm.id); }; box.appendChild(b); g.appendChild(box);
  });
  customGames.forEach(cg => {
    const box = document.createElement('div'); box.className = 'box own';
    box.innerHTML = `<div><b>★ ${cg.name}</b><div style="font-size:10px;color:#38bdf8">Infinite ${cg.type} map</div></div>`;
    const b = document.createElement('button'); b.className = 'ab'; b.textContent = 'Play / Edit';
    b.onclick = () => { toggleModal('games-modal', false); loadWorld(cg.id); }; box.appendChild(b); g.appendChild(box);
  });
}
window.createCustomGame = type => {
  if (player.mineBux < 100) { sfx.oof(); showToast('Need 100 M$!'); return; }
  addBux(-100); const nEl = document.getElementById('new-g-name'), name = (nEl.value.trim() || 'My Map #' + (customGames.length + 1));
  const id = 'custom_' + Date.now(); customGames.push({ id, name, type }); saveAll(); nEl.value = '';
  sfx.win(); toggleModal('games-modal', false); loadWorld(id); showToast(`Created "${name}"!`);
};

const BP_TIERS = [
  { lvl: 1, free: { txt: '+15 M$', fn: () => addBux(15) }, vip: { txt: '+40 M$', fn: () => addBux(40) } },
  { lvl: 2, free: { txt: '+25 M$', fn: () => addBux(25) }, vip: { txt: 'Lava Skin', fn: () => { ownedSkins.add('magma'); applySkin('magma'); } } },
  { lvl: 3, free: { txt: 'Flame Gem', fn: () => giveItem(301, 1) }, vip: { txt: '+75 M$', fn: () => addBux(75) } },
  { lvl: 4, free: { txt: '+40 M$', fn: () => addBux(40) }, vip: { txt: 'Speed Coil', fn: () => { ownedGear.add('speed'); GEAR[2].on(); } } },
  { lvl: 5, free: { txt: '+60 M$', fn: () => addBux(60) }, vip: { txt: 'Cyber Skin', fn: () => { ownedSkins.add('cyber'); applySkin('cyber'); } } },
  { lvl: 6, free: { txt: '+100 M$', fn: () => addBux(100) }, vip: { txt: '+400 M$ Mega', fn: () => addBux(400) } }
];
window.buyVipPass = () => { if (vipPass) return; if (player.mineBux < 60) { showToast('Need 60 M$!'); return; } addBux(-60); vipPass = true; sfx.buy(); saveAll(); renderPass(); };
function renderPass() {
  document.getElementById('bp-lvl').textContent = player.bpLvl; document.getElementById('bp-xp').textContent = player.xp;
  document.getElementById('bp-vip-tag').textContent = vipPass ? 'VIP PASS ACTIVE' : 'FREE TRACK';
  document.getElementById('buy-vip-btn').style.display = vipPass ? 'none' : 'inline-block';
  const g = document.getElementById('bp-grid'); g.innerHTML = '';
  BP_TIERS.forEach(t => ['free', 'vip'].forEach(tr => {
    const key = `${t.lvl}_${tr}`, cl = claimedBP.has(key), can = player.bpLvl >= t.lvl && (tr === 'free' || vipPass) && !cl;
    const box = document.createElement('div'); box.className = 'box' + (cl ? ' own' : '');
    box.innerHTML = `<div><b>Tier ${t.lvl} (${tr.toUpperCase()})</b><div style="color:${tr === 'vip' ? '#facc15' : '#94a3b8'}">${t[tr].txt}</div></div>`;
    const b = document.createElement('button'); b.className = 'ab ' + (can ? 'g' : ''); b.disabled = !can; b.textContent = cl ? 'Claimed' : (can ? 'Claim' : 'Locked');
    b.onclick = () => { claimedBP.add(key); t[tr].fn(); sfx.win(); saveAll(); renderPass(); }; box.appendChild(b); g.appendChild(box);
  }));
}

function renderSkins() {
  document.getElementById('sk-bux').textContent = player.mineBux;
  const sg = document.getElementById('skins-grid'); sg.innerHTML = '';
  SKINS.forEach(s => {
    const own = ownedSkins.has(s.id), eq = curSkin === s.id, box = document.createElement('div'); box.className = 'box' + (own ? ' own' : '');
    box.innerHTML = `<div><b>${s.name}</b><div style="width:24px;height:12px;margin-top:3px;background:#${s.torso.toString(16).padStart(6, '0')}"></div></div>`;
    const b = document.createElement('button'); b.className = 'ab ' + (eq ? '' : 'g'); b.textContent = eq ? 'EQUIPPED' : (own ? 'Equip' : `Buy ${s.cost} M$`);
    b.onclick = () => { if (!own) { if (player.mineBux < s.cost) { showToast('Need more M$!'); return; } addBux(-s.cost); ownedSkins.add(s.id); sfx.buy(); } applySkin(s.id); renderSkins(); };
    box.appendChild(b); sg.appendChild(box);
  });
  const gg = document.getElementById('gear-grid'); gg.innerHTML = '';
  GEAR.forEach(gr => {
    const own = ownedGear.has(gr.id), box = document.createElement('div'); box.className = 'box' + (own ? ' own' : '');
    box.innerHTML = `<div><b>${gr.name}</b><div style="font-size:10px;color:#94a3b8">${gr.desc}</div></div>`;
    const b = document.createElement('button'); b.className = 'ab ' + (own ? '' : 'g'); b.disabled = own; b.textContent = own ? 'OWNED' : `Buy ${gr.cost} M$`;
    b.onclick = () => { if (player.mineBux < gr.cost) { showToast('Need more M$!'); return; } addBux(-gr.cost); ownedGear.add(gr.id); gr.on(); sfx.buy(); saveAll(); renderSkins(); };
    box.appendChild(b); gg.appendChild(box);
  });
}
window.simBuyBux = amt => { sfx.buy(); addBux(amt, 'Demo Top-Up'); toggleModal('buybux-modal', false); };

// --- PIN & ADMIN ---
let pinBuf = '', pinChanging = false;
function updPinDots(msg = null, ok = false) {
  document.getElementById('pin-dots').textContent = msg || (pinBuf ? '*'.repeat(pinBuf.length) : '----');
  const st = document.getElementById('pin-stat'); st.textContent = ok ? 'PIN ACCEPTED' : (pinChanging || !ownerPin ? 'NEW PIN' : 'ACCESS PIN');
  st.className = 'holo-stat' + (ok ? ' ok' : '');
}
function openAdminGate() {
  if (adminUnlocked && !pinChanging) { toggleModal('admin-modal', true); return; }
  pinBuf = ''; document.getElementById('pin-t').textContent = (pinChanging || !ownerPin) ? 'MAKE NEW PIN' : 'OWNER PIN';
  document.getElementById('pin-d').textContent = (pinChanging || !ownerPin) ? 'Tap 4+ digits' : 'Enter Owner PIN';
  updPinDots(); toggleModal('pin-modal', true);
}
window.startNewPin = () => { pinChanging = true; toggleModal('admin-modal', false); openAdminGate(); };
window.pinKey = k => {
  if (k === 'CLR') { pinBuf = ''; tone(300, 'sine', .05, .06); updPinDots(); return; }
  if (k === 'OK') {
    if (pinBuf.length < 4) { sfx.oof(); showToast('Enter 4+ digits!'); return; }
    if (!ownerPin || pinChanging) { ownerPin = pinBuf; pinChanging = false; adminUnlocked = true; saveAll(); document.getElementById('btn-fly').style.display = 'inline-block'; updPinDots('SAVED!', true); sfx.win(); setTimeout(() => { toggleModal('pin-modal', false); toggleModal('admin-modal', true); }, 450); }
    else if (pinBuf === ownerPin) { adminUnlocked = true; document.getElementById('btn-fly').style.display = 'inline-block'; updPinDots('GRANTED', true); sfx.win(); setTimeout(() => { toggleModal('pin-modal', false); toggleModal('admin-modal', true); }, 450); }
    else { sfx.oof(); pinBuf = ''; updPinDots('DENIED'); setTimeout(() => updPinDots(), 600); }
    return;
  }
  if (pinBuf.length < 8) { pinBuf += k; tone(520 + Number(k) * 45, 'sine', .06, .08); updPinDots(); }
};
window.lockAdmin = () => { adminUnlocked = false; player.flying = false; const b = document.getElementById('btn-fly'); b.style.display = 'none'; b.textContent = 'Fly'; b.className = 'hb'; document.getElementById('btn-admin').style.display = 'none'; toggleModal('admin-modal', false); showToast('Admin Locked & Hidden'); };
window.triggerLavaWave = (bcast = false) => {
  lavaWaveT = 12; lavaWaveY = groundY(player.x, player.z) - 2; lavaWaveMesh.position.set(player.x, lavaWaveY, player.z); lavaWaveMesh.visible = true;
  if (bcast) { mpPub({ t: 'adm', id: myId, sec: 'tameem', act: 'lava' }); toggleModal('admin-modal', false); }
  const a = document.getElementById('announce'); a.textContent = '[LAVA ADMIN]: LAVA WAVE RISING!'; a.style.display = 'block'; setTimeout(() => a.style.display = 'none', 3200); sfx.pad();
};
window.cycleStr = () => { player.strMult = player.strMult === 1 ? 10 : (player.strMult === 10 ? 100 : 1); saveAll(); renderAdmin(); };
window.cycleSpd = () => { player.spdMult = player.spdMult === 1 ? 3 : (player.spdMult === 3 ? 6 : 1); saveAll(); renderAdmin(); };
window.toggleSuperJump = () => { player.jmpMult = player.jmpMult === 1 ? 2.5 : 1; saveAll(); renderAdmin(); };
window.toggleGod = () => { player.godMode = !player.godMode; updBars(); saveAll(); renderAdmin(); };
window.toggleAdminFly = () => { if (!adminUnlocked) return; player.flying = !player.flying; player.vy = 0; const b = document.getElementById('btn-fly'); b.style.display = 'inline-block'; b.textContent = player.flying ? 'Fly:ON' : 'Fly'; b.className = 'hb' + (player.flying ? ' b' : ''); renderAdmin(); };
window.activateLuck = (bcast = false) => { luckT = 20; document.getElementById('luck-hud').style.display = 'inline'; sfx.win(); showToast('SERVER 10x LUCK!'); if (bcast) mpPub({ t: 'adm', id: myId, sec: 'tameem', act: 'luck' }); };
window.toggleDisco = (bcast = false, val = null) => { discoMode = (val !== null) ? val : !discoMode; if (!discoMode) { scene.background = new THREE.Color(0x7dd3fc); scene.fog = new THREE.Fog(0x7dd3fc, 34, 92); } if (bcast) mpPub({ t: 'adm', id: myId, sec: 'tameem', act: 'disco', val: discoMode }); };
window.giveAdminKit = () => { [1, 2, 3, 5, 15, 20, 21, 22].forEach(id => giveItem(id, 64));[105, 106, 221, 222, 223, 224, 301, 302, 303].forEach(id => giveItem(id, 1)); sfx.win(); showToast('Admin Gear & Blocks!'); };
window.spawnLuckyOre = () => { if (curWorld === 'lobby') { showToast('Plaza protected!'); return; } const bx = Math.floor(player.x), by = Math.floor(player.y), bz = Math.floor(player.z - 2); setBlock(bx, by, bz, 7, true); mpPub({ t: 'blk', id: myId, w: curWorld, x: bx, y: by, z: bz, bid: 7 }); sfx.place(); };
window.adminUnlockAll = () => { SKINS.forEach(s => ownedSkins.add(s.id)); GEAR.forEach(g => { ownedGear.add(g.id); g.on(); }); vipPass = true; saveAll(); sfx.win(); showToast('Unlocked All!'); };
window.takeBotBux = (n, amt) => { if (!botStats[n]) return; botStats[n].bux = amt >= 999999 ? 0 : Math.max(0, fmtBux(botStats[n].bux - amt)); saveAll(); sfx.oof(); renderAdmin(); };
window.giveBotBux = (n, amt) => { if (!botStats[n]) return; botStats[n].bux = fmtBux(botStats[n].bux + amt); saveAll(); sfx.buy(); renderAdmin(); };
window.admRemote = (targetId, act, val = 0) => { mpPub({ t: 'adm', id: myId, sec: 'tameem', target: targetId, act, val }); sfx.buy(); showToast(`Sent ${act.toUpperCase()}!`); };
window.spawnDrop = (n = 1, bcast = false) => { for (let i = 0; i < n; i++) { const dx = player.x + (Math.random() - .5) * (n > 1 ? 10 : 3), dz = player.z + (Math.random() - .5) * (n > 1 ? 10 : 3) - 1.5; const m = new THREE.Mesh(crateGeo, crateMat), sy = player.y + 12 + i * 2; m.position.set(dx, sy, dz); scene.add(m); drops.push({ x: dx, y: sy, z: dz, ty: groundY(dx, dz) + .48, mesh: m }); } sfx.pad(); showToast('MAGMA CRATE RAIN!'); if (bcast) mpPub({ t: 'adm', id: myId, sec: 'tameem', act: 'rain' }); };
window.spawnBossHere = () => { spawnBoss(player.x, player.y, player.z - 4, 200, 'ADMIN TITAN', 50, 302); toggleModal('admin-modal', false); };
window.nukeMobs = () => { mobs.forEach(m => { if (m.alive) { m.alive = false; m.rig.g.visible = false; m.respawnT = 22; addBux(m.pay); } }); sfx.win(); showToast('NUKED MOBS!'); };
window.killBossNow = () => { if (boss.alive) hitBoss(9999); if (duel.active) hitDuel(9999); toggleModal('admin-modal', false); };
window.spawnMobNear = () => spawnMob(Math.floor(player.x), Math.floor(player.y), Math.floor(player.z - 3));
window.spawnAnimalNear = () => spawnAnimal(Math.floor(player.x), Math.floor(player.y), Math.floor(player.z - 3));
window.sendAnnounce = () => { const t = document.getElementById('ann-in').value.trim(); if (!t) return; const msg = `[${myName}]: ${t}`; const a = document.getElementById('announce'); a.textContent = msg; a.style.display = 'block'; setTimeout(() => a.style.display = 'none', 3600); mpPub({ t: 'adm', id: myId, sec: 'tameem', act: 'ann', val: msg }); toggleModal('admin-modal', false); };
window.kickBot = n => { const i = bots.findIndex(b => b.name === n); if (i > -1) { scene.remove(bots[i].rig.g); bots.splice(i, 1); sfx.oof(); renderAdmin(); } };
window.banBot = n => { bannedSet.add(n); saveAll(); kickBot(n); };
window.unbanBot = n => { bannedSet.delete(n); saveAll(); if (curWorld === 'lobby') spawnBot(n); renderAdmin(); };
window.resetSave = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } location.reload(); };

function renderAdmin() {
  document.getElementById('adm-bux').textContent = player.mineBux;
  document.getElementById('ab-str').textContent = `STR:${player.strMult}x`; document.getElementById('ab-spd').textContent = `SPD:${player.spdMult}x`;
  document.getElementById('ab-jmp').textContent = `JMP:${player.jmpMult}x`; document.getElementById('ab-god').textContent = player.godMode ? 'GOD:ON' : 'GOD:OFF'; document.getElementById('ab-fly').textContent = player.flying ? 'FLY:ON' : 'FLY:OFF';
  const pEl = document.getElementById('adm-players'); pEl.innerHTML = `<div class="row"><b>${myName} (${player.mineBux} M$)</b><span><button class="lv-btn lv-red" style="padding:3px 7px" onclick="addBux(-10,'Removed')">-10 M$</button></span></div>`;
  remotePlayers.forEach(rp => pEl.innerHTML += `<div class="row"><span style="color:#4ade80">● ${rp.name} (${rp.bux} M$)</span><span><button class="lv-btn lv-grn" style="padding:3px 6px" onclick="admRemote('${rp.id}','give',25)">+25</button> <button class="lv-btn lv-red" style="padding:3px 6px" onclick="admRemote('${rp.id}','take',10)">-10</button> <button class="lv-btn lv-obs" style="padding:3px 6px" onclick="admRemote('${rp.id}','zero')">Zero</button> <button class="lv-btn lv-cyn" style="padding:3px 6px" onclick="admRemote('${rp.id}','frz')">Freeze</button> <button class="lv-btn lv-gold" style="padding:3px 6px" onclick="admRemote('${rp.id}','kick')">Kick</button> <button class="lv-btn lv-red" style="padding:3px 6px" onclick="admRemote('${rp.id}','ban')">Ban</button></span></div>`);
  BOT_NAMES.forEach(n => { if (!bannedSet.has(n)) pEl.innerHTML += `<div class="row"><span>[Bot] ${n} (${botStats[n].bux} M$)</span><span><button class="lv-btn lv-grn" style="padding:3px 6px" onclick="giveBotBux('${n}',10)">+10</button> <button class="lv-btn lv-red" style="padding:3px 6px" onclick="takeBotBux('${n}',10)">-10</button> <button class="lv-btn lv-gold" style="padding:3px 6px" onclick="kickBot('${n}')">Kick</button> <button class="lv-btn lv-red" style="padding:3px 6px" onclick="banBot('${n}')">Ban</button></span></div>`; });
  document.getElementById('adm-banned').innerHTML = bannedSet.size ? [...bannedSet].map(n => `<div class="row"><span>${n}</span><button class="lv-btn lv-grn" style="padding:3px 7px" onclick="unbanBot('${n}')">Unban</button></div>`).join('') : 'No banned players.';
}

function toggleModal(id, open) {
  const el = document.getElementById(id), show = typeof open === 'boolean' ? open : (el.style.display !== 'flex');
  el.style.display = show ? 'flex' : 'none';
  if (show) {
    if (id === 'inv-modal') { picked = null; renderInv(); }
    if (id === 'bench-modal') renderBench(); if (id === 'games-modal') renderGames();
    if (id === 'pass-modal') renderPass(); if (id === 'skins-modal') renderSkins(); if (id === 'admin-modal') renderAdmin();
    if (document.pointerLockElement) document.exitPointerLock();
  }
}

const getLook = () => ({ dx: -Math.sin(player.yaw) * Math.cos(player.pitch), dy: Math.sin(player.pitch), dz: -Math.cos(player.yaw) * Math.cos(player.pitch) });
function raycastBlock(maxD) {
  const { dx, dy, dz } = getLook(); let ox = camera.position.x, oy = camera.position.y, oz = camera.position.z, bx = Math.floor(ox), by = Math.floor(oy), bz = Math.floor(oz);
  const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1, tdx = dx ? Math.abs(1 / dx) : 1e9, tdy = dy ? Math.abs(1 / dy) : 1e9, tdz = dz ? Math.abs(1 / dz) : 1e9;
  let tmx = dx ? (dx > 0 ? bx + 1 - ox : ox - bx) * tdx : 1e9, tmy = dy ? (dy > 0 ? by + 1 - oy : oy - by) * tdy : 1e9, tmz = dz ? (dz > 0 ? bz + 1 - oz : oz - bz) * tdz : 1e9, nx = 0, ny = 0, nz = 0, dist = 0;
  while (dist <= maxD) {
    const h = getBlock(bx, by, bz); if (h && dist > (player.thirdPerson ? 1.2 : .05)) return { x: bx, y: by, z: bz, nx, ny, nz, id: h.id };
    if (tmx < tmy && tmx < tmz) { dist = tmx; tmx += tdx; bx += sx; nx = -sx; ny = nz = 0; }
    else if (tmy < tmz) { dist = tmy; tmy += tdy; by += sy; nx = nz = 0; ny = -sy; }
    else { dist = tmz; tmz += tdz; bz += sz; nx = ny = 0; nz = -sz; }
  }
  return null;
}

function hitBoss(dmg) {
  boss.hp -= dmg; sfx.hit(); document.getElementById('boss-fill').style.width = `${Math.max(0, boss.hp / boss.maxHp * 100)}%`;
  if (boss.hp <= 0) {
    boss.alive = false; bossRig.g.visible = false; document.getElementById('boss-wrap').style.display = 'none';
    spawnBurst(boss.x, boss.y + 1.5, boss.z, 0xfacc15, 22, 6);
    if (boss.dropId) giveItem(boss.dropId, 1);
    sfx.win(); addBux(boss.pay, `${boss.name} DEFEATED!`); addXP(100);
  }
}
function hitDuel(dmg) {
  duel.hp -= dmg; sfx.hit(); document.getElementById('boss-fill').style.width = `${Math.max(0, duel.hp / duel.maxHp * 100)}%`;
  if (duel.hp <= 0) { duel.active = false; duelRig.g.visible = false; document.getElementById('boss-wrap').style.display = 'none'; spawnBurst(duel.x, duel.y + 1, duel.z, 0xec4899, 18, 5); sfx.win(); addBux(duel.pay, '1v1 VICTORY!'); addXP(60); setTimeout(() => { if (DUEL_TIERS[curWorld]) loadWorld('lobby'); }, 2200); }
}

function doMineOrHit() {
  swingT = .25;
  const { dx, dy, dz } = getLook(), held = hotbar[selSlot] ? ITEMS[hotbar[selSlot].id] : null;
  const gemD = player.gem === 'flame' ? 12 : 0;
  const dmg = ((held && held.type === 'sword' ? held.dmg : 15) + gemD) * player.strMult, pickBonus = (held && held.type === 'pick') ? held.bonus : 0;

  if (curWorld !== 'lobby') {
    for (const rp of remotePlayers.values()) {
      if (rp.world !== curWorld) continue;
      const vx = rp.x - player.x, vy = rp.y + 1 - (player.y + 1), vz = rp.z - player.z, d = Math.hypot(vx, vy, vz);
      if (d < 4.4 && (vx * dx + vy * dy + vz * dz) / d > .6) { sfx.hit(); spawnBurst(rp.x, rp.y + 1, rp.z, 0xef4444, 8, 4); mpPub({ t: 'hit', id: myId, target: rp.id, dmg: held && held.type === 'sword' ? 2 : 1 }); return; }
    }
  }
  if (duel.active) { const vx = duel.x - player.x, vy = duel.y + 1 - (player.y + 1), vz = duel.z - player.z, d = Math.hypot(vx, vy, vz); if (d < 4.5 && (vx * dx + vy * dy + vz * dz) / d > .6) { duel.x += dx * .8; duel.z += dz * .8; hitDuel(dmg); return; } }
  if (boss.alive) { const vx = boss.x - player.x, vy = boss.y + 1.8 - (player.y + 1.1), vz = boss.z - player.z, d = Math.hypot(vx, vy, vz); if (d < 5.8 && (vx * dx + vy * dy + vz * dz) / d > .6) { hitBoss(dmg); return; } }

  for (const m of mobs) {
    if (!m.alive) continue; const vx = m.x - player.x, vy = m.y + .7 - (player.y + 1), vz = m.z - player.z, d = Math.hypot(vx, vy, vz);
    if (d < 4.6 && (vx * dx + vy * dy + vz * dz) / d > .65) {
      m.hp -= dmg; sfx.hit(); m.x += dx * .7; m.z += dz * .7;
      if (player.gem === 'frost') m.slowT = 4; if (player.gem === 'flame') m.burnT = 4;
      if (m.hp <= 0) { m.alive = false; m.rig.g.visible = false; m.respawnT = 22; spawnBurst(m.x, m.y + .8, m.z, 0x22c55e, 10, 4); sfx.coin(); addBux(m.pay, `${m.name} Kill!`); addXP(20); }
      return;
    }
  }
  for (const a of animals) {
    if (!a.alive) continue; const vx = a.x - player.x, vy = a.y + .5 - (player.y + 1), vz = a.z - player.z, d = Math.hypot(vx, vy, vz);
    if (d < 4.2 && (vx * dx + vy * dy + vz * dz) / d > .65) {
      a.hp -= dmg; sfx.hit(); a.x += dx * .7; a.z += dz * .7;
      if (a.hp <= 0) { a.alive = false; a.rig.g.visible = false; a.respawnT = 14; giveItem(310, 1); sfx.coin(); addBux(.5, 'Animal + Meat'); }
      return;
    }
  }
  const hit = raycastBlock(player.thirdPerson ? 8.5 : 5.5); if (!hit) return;
  if (hit.id === 22) { toggleModal('bench-modal', true); return; } // Tap placed Workbench to craft!
  if (curWorld === 'lobby') { showToast('Lobby Plaza is unbreakable!'); sfx.hit(); return; }
  if (hit.id === 12) { sfx.hit(); showToast('Bedrock is unbreakable!'); return; }
  spawnBurst(hit.x + .5, hit.y + .5, hit.z + .5, ITEMS[hit.id].color || '#888', 7, 3.5);
  if (hit.id === 7) { addBux(15 + pickBonus * 3, 'Bux Ore!'); addXP(25); giveItem(7, 1); giveItem(2, 1 + pickBonus); }
  else { addBux(1); addXP(5); giveItem(hit.id, 1 + (hit.id === 2 ? pickBonus : 0)); }
  setBlock(hit.x, hit.y, hit.z, 0, true); mpPub({ t: 'blk', id: myId, w: curWorld, x: hit.x, y: hit.y, z: hit.z, bid: 0 }); sfx.break();
}
function doBuild() {
  if (curWorld === 'lobby') { showToast('Cannot build in the Plaza!'); return; }
  const sl = hotbar[selSlot], it = sl ? ITEMS[sl.id] : null;
  if (!sl || !it || it.type !== 'block') { showToast('Select a block in hotbar!'); return; }
  const hit = raycastBlock(player.thirdPerson ? 8.5 : 5.5); if (!hit) return;
  const px = hit.x + hit.nx, py = hit.y + hit.ny, pz = hit.z + hit.nz;
  if (px + 1 > player.x - player.halfW && px < player.x + player.halfW && py + 1 > player.y && py < player.y + player.height && pz + 1 > player.z - player.halfW && pz < player.z + player.halfW) return;
  swingT = .2; const bid = sl.id; if (sl.qty > 1) sl.qty--; else hotbar[selSlot] = null;
  renderHotbar(); saveAll(); setBlock(px, py, pz, bid, true); mpPub({ t: 'blk', id: myId, w: curWorld, x: px, y: py, z: pz, bid }); sfx.place();
}
function doRoll() {
  if (player.frozen || player.rollT > 0 || player.stamina < 25) return;
  player.stamina -= 25; player.rollT = .28; player.invuln = Math.max(player.invuln, .35);
  sfx.roll(); updBars();
}
function doJump() { if (player.frozen) return; if (player.flying && adminUnlocked) { player.vy = 7; return; } if (player.onGround) { player.vy = 8.6 * player.jmpMult; player.onGround = false; sfx.jump(); } }
function hurtPlayer(a = 1, isFire = false) {
  if (player.invuln > 0 || player.godMode) return;
  if (isFire && hasFullSet(2)) return; // Lava Armor fire/lava immunity!
  if (player.shield > 0) { const abs = Math.min(player.shield, a); player.shield -= abs; a -= abs; updBars(); if (a <= 0) { player.invuln = .5; sfx.hit(); return; } }
  const armCnt = armor.filter(Boolean).length;
  if (armCnt > 0 && Math.random() < armCnt * .18) { showToast('Armor Blocked Hit!'); player.invuln = .6; return; }
  player.hp -= a; player.invuln = 1; updBars(); sfx.oof();
  const f = document.getElementById('flash'); f.style.opacity = '1'; setTimeout(() => f.style.opacity = '0', 180);
  if (player.hp <= 0) { if (DUEL_TIERS[curWorld]) loadWorld('lobby'); else respawn(); }
}
function respawn() { player.hp = 10; player.hunger = 100; player.stamina = 100; updBars(); player.x = .5; player.z = 4; player.y = groundY(.5, 4) + 1; player.vx = player.vy = player.vz = 0; }

const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0; let active = false;
const anyOpen = () => ['chat-modal', 'bench-modal', 'kick-modal', 'inv-modal', 'games-modal', 'pass-modal', 'skins-modal', 'buybux-modal', 'pin-modal', 'admin-modal'].some(id => document.getElementById(id).style.display === 'flex');

document.getElementById('start-btn').onclick = () => {
  unlockAudio();
  const nm = document.getElementById('mp-name').value.trim() || myName, rm = document.getElementById('mp-room').value.trim() || 'GLOBAL';
  if (bannedSet.has(nm)) { alert('You are banned!'); return; }
  connectMultiplayer(nm, rm); document.getElementById('overlay').style.display = 'none'; active = true;
  if (!isTouch && document.body.requestPointerLock) try { document.body.requestPointerLock(); } catch (e) { }
};
document.getElementById('btn-chat').onclick = () => toggleModal('chat-modal', true);
document.getElementById('btn-games').onclick = () => toggleModal('games-modal', true);
document.getElementById('btn-bench').onclick = () => toggleModal('bench-modal', true);
document.getElementById('btn-pass').onclick = () => toggleModal('pass-modal', true);
document.getElementById('btn-skins').onclick = () => toggleModal('skins-modal', true);
document.getElementById('bux-btn').onclick = () => toggleModal('buybux-modal', true);
document.getElementById('btn-admin').onclick = openAdminGate;
document.getElementById('btn-cam').onclick = () => { player.thirdPerson = !player.thirdPerson; pRig.g.visible = player.thirdPerson; document.getElementById('btn-cam').textContent = player.thirdPerson ? '3rd' : '1st'; };
document.getElementById('btn-recall').onclick = () => { loadWorld(curWorld === 'lobby' ? 'overworld' : 'lobby'); sfx.pad(); showToast('Recalled!'); };
document.getElementById('btn-fly').onclick = toggleAdminFly;

const jZ = document.getElementById('joy-z'), jK = document.getElementById('joy-k'); let jId = null, jx = 0, jy = 0;
function updJ(t) { const r = jZ.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, mr = r.width * .38; let dx = t.clientX - cx, dy = t.clientY - cy, d = Math.hypot(dx, dy); if (d > mr) { dx = dx / d * mr; dy = dy / d * mr; } jK.style.transform = `translate(${dx}px,${dy}px)`; jx = dx / mr; jy = dy / mr; }
jZ.addEventListener('touchstart', e => { e.preventDefault(); unlockAudio(); if (jId === null) { jId = e.changedTouches[0].identifier; updJ(e.changedTouches[0]); } }, { passive: false });
jZ.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches)if (t.identifier === jId) updJ(t); }, { passive: false });
const endJ = e => { for (const t of e.changedTouches)if (t.identifier === jId) { jId = null; jx = jy = 0; jK.style.transform = 'translate(0,0)'; } };
jZ.addEventListener('touchend', endJ); jZ.addEventListener('touchcancel', endJ);

let lId = null, lx = 0, ly = 0, jHeld = false;
renderer.domElement.addEventListener('touchstart', e => { e.preventDefault(); unlockAudio(); if (lId === null && e.changedTouches.length) { lId = e.changedTouches[0].identifier; lx = e.changedTouches[0].clientX; ly = e.changedTouches[0].clientY; } }, { passive: false });
renderer.domElement.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches)if (t.identifier === lId) { player.yaw -= (t.clientX - lx) * .0055; player.pitch = Math.max(-1.48, Math.min(1.48, player.pitch - (t.clientY - ly) * .0055)); lx = t.clientX; ly = t.clientY; } }, { passive: false });
const endL = e => { for (const t of e.changedTouches)if (t.identifier === lId) lId = null; };
renderer.domElement.addEventListener('touchend', endL); renderer.domElement.addEventListener('touchcancel', endL);

document.getElementById('btn-mine').addEventListener('touchstart', e => { e.preventDefault(); unlockAudio(); doMineOrHit(); }, { passive: false });
document.getElementById('btn-mine').onclick = () => { if (!isTouch) doMineOrHit(); };
document.getElementById('btn-build').addEventListener('touchstart', e => { e.preventDefault(); unlockAudio(); doBuild(); }, { passive: false });
document.getElementById('btn-build').onclick = () => { if (!isTouch) doBuild(); };
document.getElementById('btn-roll').addEventListener('touchstart', e => { e.preventDefault(); unlockAudio(); doRoll(); }, { passive: false });
document.getElementById('btn-roll').onclick = () => { if (!isTouch) doRoll(); };
document.getElementById('btn-jump').addEventListener('touchstart', e => { e.preventDefault(); unlockAudio(); jHeld = true; doJump(); }, { passive: false });
document.getElementById('btn-jump').addEventListener('touchend', () => jHeld = false);
document.getElementById('btn-jump').onclick = () => { if (!isTouch) doJump(); };

const keys = {};
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (document.getElementById('pin-modal').style.display === 'flex') { if (e.key >= '0' && e.key <= '9') pinKey(e.key); else if (e.code === 'Backspace') pinKey('CLR'); else if (e.code === 'Enter') pinKey('OK'); return; }
  if (e.code === 'KeyE' && !anyOpen()) { toggleModal('inv-modal', true); return; }
  if (anyOpen()) return;
  if (e.code >= 'Digit1' && e.code <= 'Digit9') { selSlot = parseInt(e.code.slice(5), 10) - 1; renderHotbar(); }
  if (e.code === 'KeyV') document.getElementById('btn-cam').click();
  if (e.code === 'KeyC') doRoll();
  if (e.code === 'KeyF' && adminUnlocked) toggleAdminFly();
  if (e.code === 'Space') doJump();
});
addEventListener('keyup', e => keys[e.code] = false);
document.addEventListener('mousemove', e => { if (document.pointerLockElement === document.body && !anyOpen()) { player.yaw -= e.movementX * .0024; player.pitch = Math.max(-1.48, Math.min(1.48, player.pitch - e.movementY * .0024)); } });
renderer.domElement.addEventListener('mousedown', e => {
  if (!active || anyOpen() || isTouch) return;
  if (document.pointerLockElement !== document.body && document.body.requestPointerLock) { try { document.body.requestPointerLock(); } catch (err) { } return; }
  if (e.button === 0) doMineOrHit(); if (e.button === 2) doBuild();
});
addEventListener('contextmenu', e => e.preventDefault());

function collides(x, y, z) {
  for (let bx = Math.floor(x - player.halfW); bx <= Math.floor(x + player.halfW); bx++)
    for (let by = Math.floor(y + .01); by <= Math.floor(y + player.height - .01); by++)
      for (let bz = Math.floor(z - player.halfW); bz <= Math.floor(z + player.halfW); bz++)
        if (getBlock(bx, by, bz)) return true;
  return false;
}

let last = performance.now(), lastNet = 0, barTick = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(.05, (now - last) / 1000); last = now;

  clouds.forEach(c => { c.position.x += 1.1 * dt; if (c.position.x > 65) c.position.x = -65; });
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.life -= dt; p.vy -= 18 * dt;
    p.mesh.position.x += p.vx * dt; p.mesh.position.y += p.vy * dt; p.mesh.position.z += p.vz * dt;
    if (p.life <= 0) { scene.remove(p.mesh); particles.splice(i, 1); }
  }

  for (const [id, rp] of remotePlayers) {
    if (now - rp.lastSeen > 7000) { scene.remove(rp.rig.g); remotePlayers.delete(id); updMpStat(); continue; }
    const dx = rp.tx - rp.x, dz = rp.tz - rp.z;
    rp.x += dx * .25; rp.y += (rp.ty - rp.y) * .25; rp.z += dz * .25; rp.yaw += (rp.tyaw - rp.yaw) * .25;
    rp.rig.g.position.set(rp.x, rp.y, rp.z); rp.rig.g.rotation.y = rp.yaw;
    const mv = Math.hypot(dx, dz) > .02; if (mv) rp.walkT += dt * 10; if (rp.swing > 0) rp.swing -= dt;
    const sw = mv ? Math.sin(rp.walkT) * .65 : 0; rp.rig.lL.rotation.x = sw; rp.rig.rL.rotation.x = -sw; rp.rig.lA.rotation.x = -sw * .85;
    rp.rig.rA.rotation.x = rp.swing > 0 ? (-Math.sin(rp.swing * Math.PI * 4) * 1.35) : (sw * .85);
  }

  if (active && !anyOpen()) {
    if (player.invuln > 0) player.invuln -= dt;
    if (shakeT > 0) shakeT -= dt; if (swingT > 0) swingT -= dt;
    if (luckT > 0) { luckT -= dt; if (luckT <= 0) document.getElementById('luck-hud').style.display = 'none'; }
    if (discoMode) { const c = new THREE.Color().setHSL((now * .0004) % 1, .8, .55); scene.background = c; scene.fog = new THREE.Fog(c, 34, 92); }

    // Stamina, Shield, Hunger & Cyber Enemy Scanner
    player.stamina = Math.min(100, player.stamina + 14 * dt);
    if (player.shieldMax > 0 && player.invuln <= 0) player.shield = Math.min(player.shieldMax, player.shield + .5 * dt);
    player.hunger = Math.max(0, player.hunger - .35 * dt);
    barTick += dt; if (barTick > .4) {
      barTick = 0; updBars();
      const scEl = document.getElementById('scanner-hud');
      if (hasFullSet(3)) {
        let near = 999; mobs.forEach(m => { if (m.alive) near = Math.min(near, Math.hypot(player.x - m.x, player.z - m.z)); });
        if (boss.alive) near = Math.min(near, Math.hypot(player.x - boss.x, player.z - boss.z));
        scEl.style.display = 'block'; scEl.textContent = near < 50 ? `📡 SCAN: Threat ${near.toFixed(1)}m` : '📡 SCAN: Clear';
      } else scEl.style.display = 'none';
    }

    if (lavaWaveT > 0) {
      lavaWaveT -= dt; const targetY = groundY(player.x, player.z) + 1.8;
      if (lavaWaveY < targetY) lavaWaveY += 1.3 * dt; lavaWaveMesh.position.set(player.x, lavaWaveY, player.z);
      if (player.y < lavaWaveY - .25) hurtPlayer(1, true);
      if (lavaWaveT <= 0) lavaWaveMesh.visible = false;
    }

    // Lava block foot check (Lava Armor makes immune!)
    const footBlk = getBlock(Math.floor(player.x), Math.floor(player.y - .1), Math.floor(player.z));
    if (footBlk && footBlk.id === 11) hurtPlayer(1, true);

    streamChunks();
    if (isInfiniteWorld()) document.getElementById('wname').textContent = (curWorld === 'lava_realm' ? 'Lava Realm' : (curWorld === 'cyber_realm' ? 'Cyber Dim' : biomeAt(player.x, player.z).toUpperCase())) + ' ∞';

    let fIn = player.frozen ? 0 : ((keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0) - jy), sIn = player.frozen ? 0 : ((keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + jx);
    if (player.rollT > 0) { player.rollT -= dt; fIn = 1; sIn = 0; }
    const mag = Math.hypot(fIn, sIn); if (mag > 1) { fIn /= mag; sIn /= mag; }
    const cyberSpd = hasFullSet(3) ? 1.35 : 1, gemSpd = player.gem === 'speed' ? 1.2 : 1;
    const spd = (player.rollT > 0 ? 12.5 : (keys.ShiftLeft ? 8.2 : 5.6)) * player.speedMult * player.spdMult * cyberSpd * gemSpd;
    player.vx = (-Math.sin(player.yaw) * fIn + Math.cos(player.yaw) * sIn) * spd;
    player.vz = (-Math.cos(player.yaw) * fIn - Math.sin(player.yaw) * sIn) * spd;
    if (player.flying && adminUnlocked) player.vy = (keys.Space || jHeld) ? 7 : (keys.ShiftLeft ? -7 : 0); else { player.flying = false; player.vy -= 24 * dt; }

    player.y += player.vy * dt;
    if (collides(player.x, player.y, player.z)) { if (player.vy < 0) { player.y = Math.floor(player.y) + 1; player.onGround = true; } else player.y = Math.floor(player.y + player.height) - player.height - .001; player.vy = 0; } else player.onGround = false;
    const nx = player.x + player.vx * dt; if (!collides(nx, player.y, player.z)) player.x = nx;
    const nz = player.z + player.vz * dt; if (!collides(player.x, player.y, nz)) player.z = nz;
    if (player.y < -8) respawn();

    if (mpConnected && now - lastNet > 90) {
      lastNet = now; mpPub({ t: 'pos', id: myId, name: myName, w: curWorld, x: +player.x.toFixed(2), y: +player.y.toFixed(2), z: +player.z.toFixed(2), yaw: +player.yaw.toFixed(2), sk: curSkin, ah: !!armor[0], ac: !!armor[1], tl: heldGroup.visible, sw: swingT > .15, bux: player.mineBux });
    }

    for (const p of portals)if (Math.hypot(player.x - p.x, player.z - p.z) < 1.25 && Math.abs(player.y - p.y) < 1.8) {
      if (p.target === '_hub') toggleModal('games-modal', true); else loadWorld(p.target); break;
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i]; if (d.y > d.ty) d.y = Math.max(d.ty, d.y - 6 * dt); d.mesh.position.y = d.y; d.mesh.rotation.y += 1.8 * dt;
      if (Math.hypot(player.x - d.x, player.y + .9 - d.y, player.z - d.z) < 1.2) { scene.remove(d.mesh); drops.splice(i, 1); player.hp = 10; updBars(); sfx.win(); addBux(30, 'Supply Drop!'); }
    }
    for (const b of bots) {
      if (!botsFrozen) { if (Math.random() < .02) b.dir += (Math.random() - .5) * 2; const bx = b.x - Math.sin(b.dir) * 1.4 * dt, bz = b.z - Math.cos(b.dir) * 1.4 * dt; if (Math.hypot(bx, bz) < 10) { b.x = bx; b.z = bz; } else b.dir += Math.PI; b.walkT += dt * 6; }
      b.rig.g.position.set(b.x, b.y, b.z); b.rig.g.rotation.y = b.dir; const sw = botsFrozen ? 0 : Math.sin(b.walkT) * .5; b.rig.lL.rotation.x = sw; b.rig.rL.rotation.x = -sw;
    }
    for (const a of animals) {
      if (isInfiniteWorld() && Math.hypot(player.x - a.x, player.z - a.z) > 26) { const ag = Math.random() * 6.28; a.x = player.x + Math.cos(ag) * 13; a.z = player.z + Math.sin(ag) * 13; a.y = groundY(a.x, a.z); }
      if (!a.alive) { a.respawnT -= dt; if (a.respawnT <= 0) { a.alive = true; a.hp = 20; const ag = Math.random() * 6.28; a.x = player.x + Math.cos(ag) * 10; a.z = player.z + Math.sin(ag) * 10; a.y = groundY(a.x, a.z); a.rig.g.visible = true; } continue; }
      if (Math.random() < .025) a.dir += (Math.random() - .5) * 2; a.x -= Math.sin(a.dir) * 1.2 * dt; a.z -= Math.cos(a.dir) * 1.2 * dt; a.y = groundY(a.x, a.z);
      a.walkT += dt * 5; a.rig.g.position.set(a.x, a.y, a.z); a.rig.g.rotation.y = a.dir; const sw = Math.sin(a.walkT) * .45; a.rig.legs.forEach((l, i) => l.rotation.x = (i % 2 === 0 ? sw : -sw));
    }
    for (const m of mobs) {
      if (isInfiniteWorld() && Math.hypot(player.x - m.x, player.z - m.z) > 30) { const ag = Math.random() * 6.28; m.x = player.x + Math.cos(ag) * 15; m.z = player.z + Math.sin(ag) * 15; m.y = groundY(m.x, m.z); }
      if (!m.alive) { m.respawnT -= dt; if (m.respawnT <= 0) { m.alive = true; m.hp = 30; const ag = Math.random() * 6.28; m.x = player.x + Math.cos(ag) * 14; m.z = player.z + Math.sin(ag) * 14; m.y = groundY(m.x, m.z); m.rig.g.visible = true; } continue; }
      if (m.slowT > 0) m.slowT -= dt; if (m.burnT > 0) { m.burnT -= dt; m.hp -= 4 * dt; if (m.hp <= 0) { m.alive = false; m.rig.g.visible = false; m.respawnT = 22; addBux(m.pay, 'Burn Kill!'); } }
      const d = Math.hypot(player.x - m.x, player.z - m.z), mSpd = (m.slowT > 0 ? 1 : 2.1);
      if (d < 8 && Math.abs(player.y - m.y) < 4) {
        const ang = Math.atan2(-(player.x - m.x), -(player.z - m.z)); m.dir = ang; m.x -= Math.sin(ang) * mSpd * dt; m.z -= Math.cos(ang) * mSpd * dt; m.y = groundY(m.x, m.z);
        if (d < .95 && Math.abs(player.y - m.y) < 1.2) { hurtPlayer(1); if (hasFullSet(2)) m.burnT = 3; } // Lava Armor Burn Reflect!
      } else { if (Math.random() < .02) m.dir += (Math.random() - .5) * 2; m.x -= Math.sin(m.dir) * dt; m.z -= Math.cos(m.dir) * dt; m.y = groundY(m.x, m.z); }
      m.walkT += dt * 7; m.rig.g.position.set(m.x, m.y, m.z); m.rig.g.rotation.y = m.dir;
      const sw = Math.sin(m.walkT) * .55; m.rig.legs.forEach((l, i) => l.rotation.x = (i % 2 === 0 ? sw : -sw));
    }
    if (duel.active) {
      const ang = Math.atan2(-(player.x - duel.x), -(player.z - duel.z)), d = Math.hypot(player.x - duel.x, player.z - duel.z);
      if (d > 1.1) { duel.x = Math.max(-6, Math.min(6, duel.x - Math.sin(ang) * duel.spd * dt)); duel.z = Math.max(-6, Math.min(6, duel.z - Math.cos(ang) * duel.spd * dt)); }
      duel.walkT += dt * 9; duelRig.g.position.set(duel.x, duel.y, duel.z); duelRig.g.rotation.y = ang;
      const sw = Math.sin(duel.walkT) * .7; duelRig.lL.rotation.x = sw; duelRig.rL.rotation.x = -sw; duelRig.lA.rotation.x = -sw; duelRig.rA.rotation.x = sw;
      duel.hitCd -= dt; if (d < 1.5 && duel.hitCd <= 0) { duel.hitCd = 1.05; hurtPlayer(duel.dmg); }
    }
    if (boss.alive) {
      const d = Math.hypot(player.x - boss.x, player.z - boss.z);
      if (d < 22) {
        const ang = Math.atan2(-(player.x - boss.x), -(player.z - boss.z));
        boss.x -= Math.sin(ang) * 2.2 * dt; boss.z -= Math.cos(ang) * 2.2 * dt; boss.y = groundY(boss.x, boss.z);
        boss.walkT += dt * 6; bossRig.g.position.set(boss.x, boss.y, boss.z); bossRig.g.rotation.y = ang;
        const sw = Math.sin(boss.walkT) * .6; bossRig.lL.rotation.x = sw; bossRig.rL.rotation.x = -sw; bossRig.lA.rotation.x = -sw; bossRig.rA.rotation.x = sw;
        if (d < 1.4 && Math.abs(player.y - boss.y) < 2.5) hurtPlayer(1);
        boss.slamT -= dt;
        if (boss.slamT <= 0) { boss.slamT = 3.4; const rm = new THREE.Mesh(ringGeo, ringMat); rm.position.set(boss.x, boss.y + .1, boss.z); scene.add(rm); shockwaves.push({ x: boss.x, z: boss.z, y: boss.y, r: .8, mesh: rm, hit: false }); tone(90, 'sawtooth', .25, .12, 40); }
      }
    }
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const s = shockwaves[i]; s.r += 5.5 * dt; s.mesh.scale.setScalar(s.r);
      if (!s.hit && Math.abs(Math.hypot(player.x - s.x, player.z - s.z) - s.r) < .55 && player.y < s.y + .65) { s.hit = true; hurtPlayer(1); }
      if (s.r > 9.5) { scene.remove(s.mesh); shockwaves.splice(i, 1); }
    }
    pRig.g.position.set(player.x, player.y, player.z); pRig.g.rotation.y = player.yaw;
    pRig.g.rotation.x = player.rollT > 0 ? (-player.rollT * 22) : 0; // 3D Dodge Roll Flip!
    const mv = Math.hypot(player.vx, player.vz) > .3; if (mv) player.walkTime += dt * 10 * player.speedMult * player.spdMult;
    const sw = mv ? Math.sin(player.walkTime) * .65 : 0; pRig.lL.rotation.x = sw; pRig.rL.rotation.x = -sw; pRig.lA.rotation.x = -sw * .85;
    pRig.rA.rotation.x = swingT > 0 ? (-Math.sin(swingT * Math.PI * 4) * 1.35) : (sw * .85);
  }

  const ex = player.x, ey = player.y + 1.48, ez = player.z, { dx, dy, dz } = getLook();
  const sx = shakeT > 0 ? (Math.random() - .5) * .28 : 0, sy = shakeT > 0 ? (Math.random() - .5) * .28 : 0;
  if (player.thirdPerson) {
    let cd = 4.2; for (let d = .4; d <= 4.2; d += .2)if (getBlock(Math.floor(ex - dx * d), Math.floor(ey - dy * d), Math.floor(ez - dz * d))) { cd = Math.max(.5, d - .25); break; }
    camera.position.set(ex - dx * cd + sx, ey - dy * cd + sy, ez - dz * cd);
  } else camera.position.set(ex + sx, ey + sy, ez);
  camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
  const tgt = raycastBlock(player.thirdPerson ? 8.5 : 5.5); wireBox.visible = !!tgt; if (tgt) wireBox.position.set(tgt.x + .5, tgt.y + .5, tgt.z + .5);
  renderer.render(scene, camera);
}

loadAll(); applySkin(curSkin); updArmor3D(); renderHotbar(); addBux(0); addXP(0); updBars(); loadWorld('lobby'); requestAnimationFrame(loop);
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
