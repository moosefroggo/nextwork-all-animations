let state = {
  activeBranch: 'main',
  unstaged: 3,
  staged: 0,
  saved: 0,
  feature: 0,
  cloud: 0,
  branchCreated: false
};

const speed = 1.2;
let busy = false;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms / speed));

const $ = (id) => document.getElementById(id);
const caption = (msg) => { $('caption').textContent = msg; };

const STOPS = {
  unsaved: { x: '8%',  y: 122 },
  tracked: { x: '25%', y: 122 },
  saved:   { x: '44%', y: 122 },
  cloud:   { x: '87%', y: 122 },
  side:    { x: '44%', y: 210 }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();
  render();
  bind();
});

// ---------- RENDER ----------
function render() {
  lit('stop-unsaved', state.unstaged > 0);
  lit('stop-tracked', state.staged > 0);
  lit('stop-saved',   state.saved > 0);
  lit('stop-cloud',   state.cloud > 0);
  lit('stop-side',    state.feature > 0);

  count('count-saved', state.saved);
  count('count-cloud', state.cloud);
  count('count-side',  state.feature);

  $('stop-side').classList.toggle('visible', state.branchCreated);
  $('tl-branch').classList.toggle('on', state.branchCreated);

  $('stop-saved').classList.toggle('current', state.activeBranch === 'main');
  $('stop-side').classList.toggle('current',  state.activeBranch === 'feature');
}

function lit(id, on) { $(id).classList.toggle('lit', on); }
function count(id, n) {
  const el = $(id);
  el.textContent = n;
  el.classList.toggle('show', n > 0);
}

function lockAll(locked) {
  busy = locked;
  document.querySelectorAll('.cmd').forEach((b) => { b.disabled = locked; });
}

// ---------- MOVING ICONS ----------
function moveIcon(icon, from, to, variant = '') {
  const layer = $('mover-layer');
  const el = document.createElement('div');
  el.className = `mover ${variant}`;
  el.innerHTML = `<i data-lucide="${icon}"></i>`;
  layer.appendChild(el);
  if (window.lucide) window.lucide.createIcons();

  const anim = el.animate(
    [
      { left: from.x, top: `${from.y}px`, opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { opacity: 1, offset: 0.85 },
      { left: to.x, top: `${to.y}px`, opacity: 0 }
    ],
    { duration: 950 / speed, easing: 'ease-in-out' }
  );
  return anim.finished.catch(() => {}).then(() => el.remove());
}

// ---------- COMMANDS ----------
async function cmdAdd() {
  if (busy) return;
  lockAll(true);
  if (state.unstaged === 0) { state.unstaged = 3; render(); await sleep(200); }
  caption('Telling git to track these files — still right here on your computer.');
  await moveIcon('file', STOPS.unsaved, STOPS.tracked, 'cyan');
  state.staged += state.unstaged;
  state.unstaged = 0;
  render();
  lockAll(false);
}

async function cmdCommit() {
  if (busy) return;
  if (state.staged === 0) { caption('Nothing tracked yet — run "git add ." first.'); return; }
  lockAll(true);
  caption('Saving a snapshot — your computer remembers it, nothing is online yet.');
  const dest = state.activeBranch === 'feature' ? STOPS.side : STOPS.saved;
  await moveIcon('save', STOPS.tracked, dest, 'green');
  if (state.activeBranch === 'feature') state.feature += 1; else state.saved += 1;
  state.staged = 0;
  render();
  lockAll(false);
}

async function cmdPush() {
  if (busy) return;
  if (state.activeBranch !== 'main') { caption('Switch back to main before pushing.'); return; }
  if (state.saved <= state.cloud) { caption('Nothing new to upload — the cloud is already up to date.'); return; }
  lockAll(true);
  caption('Now it leaves your computer — uploading your saved snapshots to the cloud.');
  await moveIcon('upload', STOPS.saved, STOPS.cloud, 'yellow');
  state.cloud = state.saved;
  render();
  lockAll(false);
}

async function cmdPull() {
  if (busy) return;
  if (state.activeBranch !== 'main') { caption('Switch back to main before pulling.'); return; }
  if (state.saved === 0 && state.cloud === 0) { caption('Nothing on the cloud yet.'); return; }
  lockAll(true);
  caption('Downloading the latest from the cloud back onto your computer.');
  if (state.cloud <= state.saved) { state.cloud = state.saved + 1; render(); await sleep(250); }
  await moveIcon('download', STOPS.cloud, STOPS.saved, 'yellow');
  state.saved = state.cloud;
  render();
  lockAll(false);
}

async function cmdBranch() {
  if (busy) return;
  if (state.branchCreated) { caption("You're already on a branch — commit there or merge back first."); return; }
  if (state.saved === 0) { caption('Save at least one commit before branching off it.'); return; }
  lockAll(true);
  caption('Branching off a parallel line — still all on your computer.');
  state.branchCreated = true;
  state.activeBranch = 'feature';
  state.unstaged = 2;
  render();
  await sleep(450);
  lockAll(false);
}

async function cmdCheckout() {
  if (busy) return;
  if (state.activeBranch !== 'feature') { caption("You're already on your main line."); return; }
  lockAll(true);
  caption('Switching back to your main line.');
  state.activeBranch = 'main';
  render();
  await sleep(400);
  lockAll(false);
}

async function cmdMerge() {
  if (busy) return;
  if (!state.branchCreated || state.feature === 0) { caption('Nothing on the branch to merge yet — commit there first.'); return; }
  if (state.activeBranch !== 'main') { caption('Switch back to main ("git checkout main"), then merge.'); return; }
  lockAll(true);
  caption('Folding the branch back into your main line.');
  await moveIcon('git-merge', STOPS.side, STOPS.saved, 'purple');
  state.saved += state.feature;
  state.feature = 0;
  state.branchCreated = false;
  render();
  lockAll(false);
}

function reset() {
  state = { activeBranch: 'main', unstaged: 3, staged: 0, saved: 0, feature: 0, cloud: 0, branchCreated: false };
  busy = false;
  render();
  caption('Click a command below to see what it does on the timeline.');
}

// ---------- BIND ----------
function bind() {
  $('cmd-reset').addEventListener('click', reset);

  const handlers = {
    add:      cmdAdd,
    commit:   cmdCommit,
    branch:   cmdBranch,
    checkout: cmdCheckout,
    merge:    cmdMerge,
    push:     cmdPush,
    pull:     cmdPull,
  };

  document.querySelectorAll('.cmd[data-cmd]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!btn.disabled) handlers[btn.dataset.cmd]?.();
    });
  });
}
