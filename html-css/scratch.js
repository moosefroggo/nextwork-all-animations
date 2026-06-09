// ── Timeline layout ─────────────────────────────────────
const LY = lane => 65 + lane * 80;
const CX = idx  => 55 + idx  * 100;
const CR = 11;
const COLORS = ['#FF7F30','#9B5BDB','#0090FF','#00CC96','#FFD000','#ff3860'];

const BLOCK_COLOR = {
  'git-status':     '#2E5A88',
  'git-add':        '#1B6B4A',
  'git-commit':     '#1B6B4A',
  'git-branch-new': '#5C2D91',
  'git-checkout':   '#5C2D91',
  'git-merge':      '#5C2D91',
  'git-push':       '#8C3F00',
  'git-pull':       '#8C3F00',
};

// ── Git graph state ─────────────────────────────────────
let g = freshGraph();
function freshGraph() {
  return {
    branches: { main: { color:'#FF7F30', lane:0, tip:null, commits:[], startX:CX(1) } },
    commits: [],
    HEAD: 'main',
    dirty: false,
    staged: false,
    lanes: 1,
    ci: 0,
  };
}

// ── Program state ───────────────────────────────────────
let program = [];   // [{id, cmd, paramEl}]  — paramEl is the live DOM input/select
let pidSeq  = 0;
let running = false;

// ── DOM helpers ─────────────────────────────────────────
const progList  = document.getElementById('prog-list');
const progEmpty = document.getElementById('prog-empty');
const labelsEl  = document.getElementById('branch-labels');
const scrollEl  = document.getElementById('svg-scroll');
const runBtn    = document.getElementById('run-btn');

function getSVG() { return document.getElementById('timeline-svg'); }
function mkSVG(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rsha()    { return Math.random().toString(16).slice(2,9); }

// ── Boot ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSVG();
  bindPalette();
  bindProgram();
  runBtn.addEventListener('click', runProgram);
  const clearBtn = document.getElementById('clear-btn');
  clearBtn.addEventListener('click', clearProgram);
  clearBtn.addEventListener('dblclick', resetAll);
});

// ══════════════════════════════════════════════════════
//  DRAG & DROP
// ══════════════════════════════════════════════════════

let drag = null;  // active drag session

function bindPalette() {
  document.querySelectorAll('.pal-block').forEach(el => {
    el.addEventListener('pointerdown', e => startDragFromPalette(e, el));
  });
}

function bindProgram() {
  // Delegate pointerdown for program blocks (handles newly added ones too)
  progList.addEventListener('pointerdown', e => {
    const block = e.target.closest('.prog-block');
    if (block && !e.target.closest('.block-remove') &&
        !e.target.closest('.block-input') &&
        !e.target.closest('.block-select')) {
      startDragFromProgram(e, block);
    }
  });

  // Remove buttons
  progList.addEventListener('click', e => {
    const btn = e.target.closest('.block-remove');
    if (btn) removeBlock(btn.dataset.pid);
  });

  // Stop inputs from triggering drag
  progList.addEventListener('mousedown', e => {
    if (e.target.closest('.block-input') || e.target.closest('.block-select')) {
      e.stopPropagation();
    }
  });
}

// ── Start drag from palette (creates new block) ─────────
function startDragFromPalette(e, palEl) {
  e.preventDefault();
  const cmd   = palEl.dataset.cmd;
  const color = BLOCK_COLOR[cmd] || '#444';
  const rect  = palEl.getBoundingClientRect();

  const ghost = makeGhostEl(cmd, color, rect.width);
  attachGhost(ghost);

  palEl.classList.add('dragging-origin');

  drag = {
    type: 'new',
    cmd,
    color,
    ghost,
    ghostW: rect.width,
    ghostH: rect.height,
    ox: e.clientX - rect.left,
    oy: e.clientY - rect.top,
    palEl,
    dropIdx: -1,
  };
  moveGhost(e.clientX, e.clientY);
  bindDragEvents();
}

// ── Start drag from program (reorder) ──────────────────
function startDragFromProgram(e, blockEl) {
  e.preventDefault();
  const pid   = blockEl.dataset.pid;
  const cmd   = blockEl.dataset.cmd;
  const color = BLOCK_COLOR[cmd] || '#444';
  const rect  = blockEl.getBoundingClientRect();

  // Build ghost matching block content
  const ghost = blockEl.cloneNode(true);
  ghost.id    = 'drag-ghost';
  ghost.style.width = `${rect.width}px`;
  // Remove interactive elements from ghost
  ghost.querySelectorAll('.block-remove').forEach(b => b.remove());
  applyGhostStyles(ghost);
  document.body.appendChild(ghost);

  blockEl.classList.add('drag-ghost-src');

  drag = {
    type: 'reorder',
    pid,
    cmd,
    color,
    ghost,
    ghostW: rect.width,
    ghostH: rect.height,
    ox: e.clientX - rect.left,
    oy: e.clientY - rect.top,
    blockEl,
    dropIdx: -1,
  };
  moveGhost(e.clientX, e.clientY);
  bindDragEvents();
}

// ── Ghost element helpers ───────────────────────────────
function makeGhostEl(cmd, color, width) {
  const g = document.createElement('div');
  g.id = 'drag-ghost';
  g.style.width = `${width}px`;
  g.style.setProperty('--bc', color);
  // Basic block-shaped ghost
  g.style.background    = color;
  g.style.color         = '#fff';
  g.style.fontSize      = '11px';
  g.style.fontFamily    = "'Space Mono', monospace";
  g.style.padding       = '8px 12px';
  g.style.borderRadius  = '5px';
  g.textContent = CMD_LABEL[cmd] || cmd;
  applyGhostStyles(g);
  return g;
}

function applyGhostStyles(el) {
  el.style.position      = 'fixed';
  el.style.pointerEvents = 'none';
  el.style.zIndex        = '9999';
  el.style.opacity       = '0.82';
  el.style.transform     = 'rotate(2deg)';
  el.style.boxShadow     = '0 8px 24px rgba(0,0,0,.5)';
}

function attachGhost(ghost) { document.body.appendChild(ghost); }

function moveGhost(cx, cy) {
  if (!drag?.ghost) return;
  drag.ghost.style.left = `${cx - drag.ox}px`;
  drag.ghost.style.top  = `${cy - drag.oy}px`;
}

// ── Drag event listeners ────────────────────────────────
function bindDragEvents() {
  document.addEventListener('pointermove', onDragMove);
  document.addEventListener('pointerup',   onDragEnd);
  document.addEventListener('pointercancel', cancelDrag);
}

function unbindDragEvents() {
  document.removeEventListener('pointermove', onDragMove);
  document.removeEventListener('pointerup',   onDragEnd);
  document.removeEventListener('pointercancel', cancelDrag);
}

function onDragMove(e) {
  if (!drag) return;
  moveGhost(e.clientX, e.clientY);

  // Is cursor over the program list?
  const listRect = progList.getBoundingClientRect();
  const over = e.clientX >= listRect.left && e.clientX <= listRect.right &&
               e.clientY >= listRect.top  && e.clientY <= listRect.bottom;

  if (over) {
    drag.dropIdx = findDropIndex(e.clientY);
    showDropLine(drag.dropIdx);
  } else {
    drag.dropIdx = -1;
    removeDropLine();
  }
}

function onDragEnd(e) {
  if (!drag) return;
  const idx = drag.dropIdx;

  // Clean up ghost & source styling
  drag.ghost.remove();
  drag.palEl?.classList.remove('dragging-origin');
  drag.blockEl?.classList.remove('drag-ghost-src');
  removeDropLine();
  unbindDragEvents();

  if (idx !== -1) {
    if (drag.type === 'new') {
      insertBlock(drag.cmd, idx);
    } else if (drag.type === 'reorder') {
      reorderBlock(drag.pid, idx);
    }
  }

  drag = null;
}

function cancelDrag() {
  drag?.ghost?.remove();
  drag?.palEl?.classList.remove('dragging-origin');
  drag?.blockEl?.classList.remove('drag-ghost-src');
  removeDropLine();
  unbindDragEvents();
  drag = null;
}

// ── Drop position ───────────────────────────────────────
function findDropIndex(clientY) {
  const blocks = [...progList.querySelectorAll('.prog-block')];
  for (let i = 0; i < blocks.length; i++) {
    const r   = blocks[i].getBoundingClientRect();
    const mid = r.top + r.height / 2;
    if (clientY < mid) return i;
  }
  return blocks.length;
}

function showDropLine(idx) {
  removeDropLine();
  const line = document.createElement('div');
  line.className = 'drop-line';
  line.id = 'drop-line';
  const blocks = [...progList.querySelectorAll('.prog-block')];
  if (idx < blocks.length) {
    progList.insertBefore(line, blocks[idx]);
  } else {
    progList.appendChild(line);
  }
}

function removeDropLine() {
  document.getElementById('drop-line')?.remove();
}

// ══════════════════════════════════════════════════════
//  BLOCK MANAGEMENT
// ══════════════════════════════════════════════════════

const CMD_LABEL = {
  'git-status':     'Start editing',
  'git-add':        'Pick up changes',
  'git-commit':     'Save to track',
  'git-branch-new': 'Start side track',
  'git-checkout':   'Switch track',
  'git-merge':      'Combine tracks',
  'git-push':       'Send to cloud',
  'git-pull':       'Bring from cloud',
};

function insertBlock(cmd, idx) {
  const id    = ++pidSeq;
  const color = BLOCK_COLOR[cmd] || '#444';

  const el = document.createElement('div');
  el.className = 'prog-block';
  el.dataset.pid = id;
  el.dataset.cmd = cmd;
  el.style.setProperty('--bc', color);

  const body = document.createElement('div');
  body.className = 'block-body';

  const cmdSpan = document.createElement('span');
  cmdSpan.className = 'block-cmd';
  cmdSpan.textContent = CMD_LABEL[cmd];
  body.appendChild(cmdSpan);

  let paramEl = null;
  if (cmd === 'git-commit') {
    paramEl = document.createElement('input');
    paramEl.className   = 'block-input';
    paramEl.type        = 'text';
    paramEl.value       = 'update';
    paramEl.placeholder = 'save note';
    paramEl.maxLength   = 24;
    body.appendChild(paramEl);
  } else if (cmd === 'git-branch-new') {
    paramEl = document.createElement('input');
    paramEl.className   = 'block-input';
    paramEl.type        = 'text';
    paramEl.value       = 'feature';
    paramEl.placeholder = 'track name';
    paramEl.maxLength   = 20;
    body.appendChild(paramEl);
  } else if (cmd === 'git-checkout' || cmd === 'git-merge') {
    paramEl = document.createElement('select');
    paramEl.className = 'block-select';
    populateSelect(paramEl);
    body.appendChild(paramEl);
  }

  const removeBtn = document.createElement('button');
  removeBtn.className    = 'block-remove';
  removeBtn.dataset.pid  = id;
  removeBtn.textContent  = '×';

  el.appendChild(body);
  el.appendChild(removeBtn);

  // Insert at index in prog-list (skipping drop-line & empty indicator)
  const blocks = [...progList.querySelectorAll('.prog-block')];
  if (idx < blocks.length) {
    progList.insertBefore(el, blocks[idx]);
  } else {
    progList.appendChild(el);
  }

  program.splice(idx, 0, { id, cmd, paramEl });
  refreshUI();
}

function reorderBlock(pid, newIdx) {
  const srcIdx = program.findIndex(b => b.id === parseInt(pid));
  if (srcIdx === -1) return;

  // Adjust index if moving down (removing source shifts indices)
  let adjustedIdx = newIdx;
  if (srcIdx < newIdx) adjustedIdx--;

  // Move in data
  const [entry] = program.splice(srcIdx, 1);
  program.splice(adjustedIdx, 0, entry);

  // Move DOM element
  const blockEl = progList.querySelector(`[data-pid="${pid}"]`);
  blockEl.classList.remove('drag-ghost-src');
  const blocks = [...progList.querySelectorAll('.prog-block')];
  // Remove the dragged element first (still in DOM, just visible hidden)
  blockEl.remove();

  // Re-get blocks after removal
  const remaining = [...progList.querySelectorAll('.prog-block')];
  if (adjustedIdx < remaining.length) {
    progList.insertBefore(blockEl, remaining[adjustedIdx]);
  } else {
    progList.appendChild(blockEl);
  }

  refreshUI();
}

function removeBlock(pid) {
  program = program.filter(b => b.id !== parseInt(pid));
  progList.querySelector(`[data-pid="${pid}"]`)?.remove();
  refreshUI();
}

function clearProgram() {
  program = [];
  progList.querySelectorAll('.prog-block').forEach(b => b.remove());
  refreshUI();
}

function populateSelect(sel) {
  sel.innerHTML = '';
  Object.keys(g.branches).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
}

function refreshSelects() {
  progList.querySelectorAll('.block-select').forEach(sel => {
    const cur = sel.value;
    populateSelect(sel);
    if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
  });
}

function refreshUI() {
  progEmpty.classList.toggle('hidden', program.length > 0);
}

// ══════════════════════════════════════════════════════
//  RUNNER
// ══════════════════════════════════════════════════════

async function runProgram() {
  if (running || program.length === 0) return;
  running = true;
  runBtn.disabled = true;

  // Clear done state
  progList.querySelectorAll('.prog-block').forEach(b => b.classList.remove('done','executing'));

  for (const block of program) {
    const el = progList.querySelector(`[data-pid="${block.id}"]`);
    el?.classList.add('executing');

    const param = block.paramEl?.value || block.paramEl?.options?.[block.paramEl.selectedIndex]?.value || '';
    await execute(block.cmd, param);

    el?.classList.remove('executing');
    el?.classList.add('done');
    await sleep(180);
  }

  running = false;
  runBtn.disabled = false;
}

async function execute(cmd, param) {
  switch (cmd) {
    case 'git-status':     await cmdStatus();           break;
    case 'git-add':        await cmdAdd();              break;
    case 'git-commit':     await cmdCommit(param);      break;
    case 'git-branch-new': await cmdBranchNew(param);   break;
    case 'git-checkout':   await cmdCheckout(param);    break;
    case 'git-merge':      await cmdMerge(param);       break;
    case 'git-push':       await cmdPush();             break;
    case 'git-pull':       await cmdPull();             break;
  }
}

// ── Commands ────────────────────────────────────────────
async function cmdStatus() {
  g.dirty = true;
  showPending();
  await sleep(300);
}

async function cmdAdd() {
  if (!g.dirty) { await sleep(150); return; }
  g.staged = true;
  g.dirty  = false;
  showPending();
  await sleep(300);
}

async function cmdCommit(msg) {
  if (!g.staged) { await sleep(150); return; }
  clearPending();
  const id = addCommit(g.HEAD, (msg || 'update').trim());
  g.staged = false;
  await animCommit(id);
}

async function cmdBranchNew(name) {
  const safe = (name || 'feature').replace(/[^a-zA-Z0-9\-_/]/g, '-').replace(/^-+/, '') || 'feature';
  if (g.branches[safe]) { await sleep(150); return; }

  const parentB    = g.branches[g.HEAD];
  const parentTipX = parentB.tip ? commitX(parentB.tip) : CX(0);
  const parentY    = LY(parentB.lane);
  const lane       = g.lanes++;
  const color      = COLORS[lane % COLORS.length];
  const childY     = LY(lane);
  const forkEndX   = parentTipX + 60;

  g.branches[safe] = { color, lane, tip:null, commits:[], startX:forkEndX };
  g.HEAD = safe;

  resizeSVG();
  renderLabels();
  refreshSelects();

  await drawAnimPath(parentTipX, parentY, forkEndX, childY, color);

  const line = mkSVG('line');
  line.id = `lane-${safe}`;
  line.setAttribute('class','lane-line');
  line.setAttribute('stroke', color);
  setLineAttrs(line, forkEndX, childY, forkEndX, childY);
  getSVG().insertBefore(line, getSVG().firstChild);
}

async function cmdCheckout(name) {
  if (!name || !g.branches[name]) { await sleep(150); return; }
  g.HEAD = name;
  updateHEAD();
  await sleep(250);
}

async function cmdMerge(srcName) {
  if (!srcName || !g.branches[srcName] || srcName === g.HEAD) { await sleep(150); return; }
  const src = g.branches[srcName];
  if (!src.tip || src.commits.length === 0) { await sleep(150); return; }

  g.staged = true;
  const mergeId = addCommit(g.HEAD, `combined`);
  g.staged = false;
  await animMerge(srcName, mergeId);
}

async function cmdPush() {
  const b = g.branches[g.HEAD];
  if (b?.tip) flashLabel(commitX(b.tip), LY(b.lane), b.color, '↑ sent to cloud');
  await sleep(500);
}

async function cmdPull() {
  g.staged = true;
  const id = addCommit('main', 'from cloud');
  g.staged = false;
  await animCommit(id);
}

// ── Pending state indicator ──────────────────────────────
function pendingX() {
  const b = g.branches[g.HEAD];
  return Math.max(CX(g.ci + 1), (b.tip ? commitX(b.tip) : b.startX) + 95);
}

function showPending() {
  clearPending();
  const b    = g.branches[g.HEAD];
  const x    = pendingX();
  const y    = LY(b.lane);
  const s    = getSVG();

  const grp = mkSVG('g');
  grp.id = 'pending-g';

  // Dashed extension of lane
  const dash = mkSVG('line');
  dash.setAttribute('x1', b.tip ? commitX(b.tip) : b.startX);
  dash.setAttribute('y1', y);
  dash.setAttribute('x2', x);
  dash.setAttribute('y2', y);
  dash.setAttribute('stroke', b.color);
  dash.setAttribute('stroke-width', '2');
  dash.setAttribute('stroke-dasharray', '5 3');
  dash.setAttribute('opacity', '0.35');
  grp.appendChild(dash);

  // Ghost circle — dashed outline = dirty, solid green outline = staged
  const circle = mkSVG('circle');
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y);
  circle.setAttribute('r', CR);
  if (g.staged) {
    circle.setAttribute('fill', 'rgba(0,204,150,0.12)');
    circle.setAttribute('stroke', '#00CC96');
    circle.setAttribute('stroke-width', '2');
  } else {
    circle.setAttribute('fill', 'rgba(255,255,255,0.04)');
    circle.setAttribute('stroke', 'rgba(255,255,255,0.3)');
    circle.setAttribute('stroke-width', '1.5');
    circle.setAttribute('stroke-dasharray', '3 2');
  }
  grp.appendChild(circle);

  // Label
  const lbl = mkSVG('text');
  lbl.setAttribute('x', x);
  lbl.setAttribute('y', y + CR + 12);
  lbl.setAttribute('text-anchor', 'middle');
  lbl.setAttribute('class', 'c-msg');
  lbl.setAttribute('fill', g.staged ? '#00CC96' : 'rgba(255,255,255,0.35)');
  lbl.textContent = g.staged ? 'ready to save' : 'editing...';
  grp.appendChild(lbl);

  s.appendChild(grp);
  resizeSVG();
}

function clearPending() {
  document.getElementById('pending-g')?.remove();
}

// ── Graph data ───────────────────────────────────────────
function addCommit(branch, msg) {
  const b = g.branches[branch];
  if (!b) return null;
  const id = `c${++g.ci}`;
  const x  = Math.max(CX(g.ci), (b.tip ? commitX(b.tip) : b.startX) + 95);
  const y  = LY(b.lane);
  g.commits.push({ id, branch, msg, sha:rsha(), x, y, parent:b.tip });
  b.commits.push(id);
  b.tip = id;
  return id;
}

function commitX(id) { return g.commits.find(c => c.id === id)?.x ?? null; }

// ── SVG ─────────────────────────────────────────────────
function initSVG() {
  resizeSVG();
  renderLabels();

  const line = mkSVG('line');
  line.id = 'lane-main';
  line.setAttribute('class','lane-line');
  line.setAttribute('stroke','#FF7F30');
  setLineAttrs(line, CX(1), LY(0), CX(1), LY(0));
  getSVG().appendChild(line);
}

function setLineAttrs(el, x1, y1, x2, y2) {
  el.setAttribute('x1',x1); el.setAttribute('y1',y1);
  el.setAttribute('x2',x2); el.setAttribute('y2',y2);
}

function resizeSVG() {
  const s = getSVG();
  const w = Math.max(scrollEl.clientWidth  || 600, CX(g.ci + 6));
  const h = Math.max(scrollEl.clientHeight || 200, LY(g.lanes) + 60);
  s.setAttribute('width',   w);
  s.setAttribute('height',  h);
  s.setAttribute('viewBox', `0 0 ${w} ${h}`);
  labelsEl.style.height = `${h}px`;
}

async function animCommit(id) {
  if (!id) return;
  const c = g.commits.find(o => o.id === id);
  if (!c) return;
  const b = g.branches[c.branch];

  const lane = document.getElementById(`lane-${c.branch}`);
  if (lane) lane.setAttribute('x2', c.x);
  resizeSVG();

  const circle = mkSVG('circle');
  circle.setAttribute('cx', c.x);  circle.setAttribute('cy', c.y);
  circle.setAttribute('r',  CR);
  circle.setAttribute('fill', b.color);
  circle.setAttribute('stroke','rgba(255,255,255,.2)');
  circle.setAttribute('stroke-width','2');
  circle.setAttribute('filter','url(#glow)');
  circle.setAttribute('class','c-dot');
  circle.style.transform       = 'scale(0)';
  circle.style.transformOrigin = `${c.x}px ${c.y}px`;
  getSVG().appendChild(circle);

  const mLabel = mkSVG('text');
  mLabel.setAttribute('class','c-msg');
  mLabel.setAttribute('x', c.x);
  mLabel.setAttribute('y', c.y + CR + 12);
  mLabel.setAttribute('text-anchor','middle');
  mLabel.textContent = c.msg.length > 10 ? c.msg.slice(0,9)+'…' : c.msg;
  getSVG().appendChild(mLabel);

  await sleep(20);
  circle.style.transition = 'transform .32s cubic-bezier(.34,1.56,.64,1)';
  circle.style.transform  = 'scale(1)';

  updateHEAD();
  scrollToX(c.x);
  await sleep(380);
}

async function drawAnimPath(x1, y1, x2, y2, color) {
  const p = mkSVG('path');
  p.setAttribute('class','fork-path');
  p.setAttribute('stroke', color);
  p.setAttribute('d', `M ${x1} ${y1} C ${x1+30} ${y1}, ${x2-30} ${y2}, ${x2} ${y2}`);
  getSVG().appendChild(p);

  const len = p.getTotalLength();
  p.style.strokeDasharray  = len;
  p.style.strokeDashoffset = len;
  await sleep(20);
  p.style.transition = 'stroke-dashoffset .4s ease';
  p.style.strokeDashoffset = '0';
  await sleep(440);
}

async function animMerge(srcBranch, mergeId) {
  const src = g.branches[srcBranch];
  const mc  = g.commits.find(c => c.id === mergeId);
  if (!src?.tip || !mc) return;

  const lane = document.getElementById(`lane-${mc.branch}`);
  if (lane) lane.setAttribute('x2', mc.x);
  resizeSVG();

  const arc = mkSVG('path');
  arc.setAttribute('class','merge-path');
  arc.setAttribute('stroke', src.color);
  const sx = commitX(src.tip) ?? 0, sy = LY(src.lane);
  arc.setAttribute('d', `M ${sx} ${sy} C ${sx+30} ${sy}, ${mc.x-30} ${mc.y}, ${mc.x} ${mc.y}`);
  getSVG().appendChild(arc);

  const len = arc.getTotalLength();
  arc.style.strokeDasharray  = len;
  arc.style.strokeDashoffset = len;
  await sleep(20);
  arc.style.transition = 'stroke-dashoffset .4s ease';
  arc.style.strokeDashoffset = '0';
  await sleep(440);

  await animCommit(mergeId);
}

function flashLabel(x, y, color, text) {
  const t = mkSVG('text');
  t.setAttribute('x', x);
  t.setAttribute('y', y - CR - 14);
  t.setAttribute('text-anchor','middle');
  t.setAttribute('class','push-lbl');
  t.style.fill    = color;
  t.style.opacity = '1';
  t.textContent   = text;
  getSVG().appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity .4s';
    t.style.opacity    = '0';
    setTimeout(() => t.remove(), 450);
  }, 600);
}

function updateHEAD() {
  document.getElementById('head-g')?.remove();
  const b = g.branches[g.HEAD];
  if (!b?.tip) return;
  const c = g.commits.find(o => o.id === b.tip);
  if (!c) return;

  const grp = mkSVG('g');
  grp.id = 'head-g';

  const ring = mkSVG('circle');
  ring.setAttribute('cx', c.x); ring.setAttribute('cy', c.y);
  ring.setAttribute('r', CR + 5);
  ring.setAttribute('class','head-ring');

  const lbl = mkSVG('text');
  lbl.setAttribute('x', c.x);
  lbl.setAttribute('y', c.y - CR - 14);
  lbl.setAttribute('text-anchor','middle');
  lbl.setAttribute('class','head-lbl');
  lbl.textContent = '▶ now';

  grp.appendChild(ring);
  grp.appendChild(lbl);
  getSVG().appendChild(grp);
}

function renderLabels() {
  labelsEl.innerHTML = '';
  Object.entries(g.branches).forEach(([name, b], i) => {
    const d = document.createElement('div');
    d.className   = 'b-label';
    d.style.top   = `${LY(b.lane)}px`;
    d.style.color = b.color;
    d.textContent = i === 0 ? 'main track' : `${name} track`;
    labelsEl.appendChild(d);
  });
}

function scrollToX(x) {
  if (x > scrollEl.scrollLeft + scrollEl.clientWidth - 120) {
    scrollEl.scrollLeft = x - scrollEl.clientWidth / 2;
  }
}

function resetAll() {
  g = freshGraph();
  const s = getSVG();
  Array.from(s.children).forEach(ch => { if (ch.tagName !== 'defs') ch.remove(); });
  initSVG();
  refreshSelects();
  clearPending();
}

