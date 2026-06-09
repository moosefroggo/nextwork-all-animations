// Git Topological Graph — Animation Logic

const svg          = document.getElementById('svg-overlay');
const nodeContainer= document.getElementById('node-container');
const remoteContainer = document.getElementById('remote-node-container');
const headTag      = document.getElementById('head-tag');
const labelFeature = document.getElementById('label-feature');

const btnAdd      = document.getElementById('btn-add');
const btnCommit   = document.getElementById('btn-commit');
const btnBranch   = document.getElementById('btn-branch');
const btnCheckout = document.getElementById('btn-checkout');
const btnMerge    = document.getElementById('btn-merge');
const btnPush     = document.getElementById('btn-push');
const btnPull     = document.getElementById('btn-pull');

const MAIN_Y    = 100;
const FEATURE_Y = 250;
const STEP_X    = 110;
const START_X   = 90;
const CLOUD_X   = 640; // left edge of cloud zone

let mainX       = START_X;
let featureX    = 0;
let currentBranch = 'main';
let featureCreated = false;
let stagedNode  = null;
let stagedHash  = null;
let commits     = []; // { x, y, hash, branch, pushed }

// ── helpers ──────────────────────────────────────────────

function rand6() { return Math.random().toString(16).substr(2, 6); }

function moveHead(x, y) {
    headTag.style.display = 'block';
    headTag.style.left = x + 'px';
    headTag.style.top  = y + 'px';
}

function drawPath(x1, y1, x2, y2, cls) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'branch-line ' + cls);
    const cx = (x1 + x2) / 2;
    path.setAttribute('d', `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`);
    svg.appendChild(path);
}

function spawnNode(x, y, hash, branch, staged = false) {
    const el = document.createElement('div');
    el.className = 'node' + (staged ? ' staged' : branch === 'main' ? ' solid' : ' feature');
    el.style.cssText = `left:${x}px;top:${y}px;opacity:0;transform:translate(-50%,-50%) scale(0.4)`;
    el.innerHTML = `<span class="node-icon">${branch === 'feature' ? '🌿' : '📦'}</span>
                    <span class="node-label">${hash}</span>`;
    nodeContainer.appendChild(el);
    requestAnimationFrame(() => {
        el.style.transition = 'all 0.4s cubic-bezier(0.2,0.8,0.2,1)';
        el.style.opacity = '1';
        el.style.transform = 'translate(-50%,-50%) scale(1)';
    });
    return el;
}

function addBranchTag(node, label, isFeature) {
    const t = document.createElement('div');
    t.className = 'branch-tag' + (isFeature ? ' feature-tag' : '');
    t.textContent = label;
    node.appendChild(t);
}

function lastCommit(branch) {
    return [...commits].reverse().find(c => c.branch === branch);
}

function nextX(branch) {
    return branch === 'main' ? mainX + STEP_X : featureX + STEP_X;
}

// ── initial state ─────────────────────────────────────────

headTag.style.display = 'none';

// ── git add ───────────────────────────────────────────────

btnAdd.addEventListener('click', () => {
    stagedHash = rand6();
    const y = currentBranch === 'main' ? MAIN_Y : FEATURE_Y;
    const x = nextX(currentBranch);
    stagedNode = spawnNode(x, y, stagedHash, currentBranch, true);

    btnAdd.disabled    = true;
    btnCommit.disabled = false;
});

// ── git commit ────────────────────────────────────────────

btnCommit.addEventListener('click', () => {
    const branch = currentBranch;
    const y = branch === 'main' ? MAIN_Y : FEATURE_Y;

    if (branch === 'main') mainX += STEP_X;
    else                   featureX += STEP_X;

    const x = branch === 'main' ? mainX : featureX;

    stagedNode.remove();
    stagedNode = null;

    const node = spawnNode(x, y, stagedHash, branch);

    // line from previous commit on same branch (or branch point)
    const prev = lastCommit(branch);
    if (prev) {
        drawPath(prev.x, prev.y, x, y, branch === 'feature' ? 'feature' : '');
    } else if (branch === 'feature') {
        // first feature commit: line from branch point (last main)
        const lm = lastCommit('main');
        if (lm) drawPath(lm.x, lm.y, x, y, 'feature');
    }

    addBranchTag(node, branch === 'main' ? 'main' : 'feature', branch === 'feature');
    commits.push({ x, y, hash: stagedHash, branch, node, pushed: false });
    moveHead(x, y);

    btnCommit.disabled = true;
    btnAdd.disabled    = false;

    const mainCount = commits.filter(c => c.branch === 'main').length;
    if (!featureCreated && mainCount >= 1) btnBranch.disabled = false;
    if (!featureCreated) btnPush.disabled = false;
    if (branch === 'feature')              btnMerge.disabled = false;
});

// ── git branch feature ────────────────────────────────────

btnBranch.addEventListener('click', () => {
    featureCreated = true;
    featureX = mainX;

    labelFeature.style.opacity = '1';
    labelFeature.textContent = '🌿 Feature Timeline';

    btnBranch.disabled   = true;
    btnCheckout.disabled = false;
});

// ── git checkout feature ──────────────────────────────────

btnCheckout.addEventListener('click', () => {
    currentBranch = 'feature';
    const lm = lastCommit('main');
    if (lm) moveHead(lm.x, FEATURE_Y);

    btnCheckout.disabled = true;
    btnAdd.disabled      = false;
    btnCommit.disabled   = true;
});

// ── git merge ─────────────────────────────────────────────

btnMerge.addEventListener('click', () => {
    currentBranch = 'main';
    mainX += STEP_X;

    const mergeHash = rand6();
    const node = spawnNode(mainX, MAIN_Y, mergeHash, 'main');

    const lm = lastCommit('main');
    const lf = lastCommit('feature');
    if (lm) drawPath(lm.x, lm.y, mainX, MAIN_Y, '');
    if (lf) drawPath(lf.x, lf.y, mainX, MAIN_Y, 'feature');

    addBranchTag(node, 'merged ✓', false);
    commits.push({ x: mainX, y: MAIN_Y, hash: mergeHash, branch: 'main', node, pushed: false });
    moveHead(mainX, MAIN_Y);

    btnMerge.disabled  = true;
    btnPush.disabled   = false;
    btnAdd.disabled    = false;
    btnCommit.disabled = true;
});

// ── git push ──────────────────────────────────────────────

btnPush.addEventListener('click', () => {
    const unpushed = commits.filter(c => !c.pushed);
    unpushed.forEach((c, i) => {
        setTimeout(() => {
            drawPath(c.x, c.y, CLOUD_X, c.y, 'cloud-sync');

            const rc = document.createElement('div');
            rc.className = 'remote-commit' + (c.branch === 'feature' ? ' feature-commit' : '');
            rc.innerHTML = `<span class="dot"></span>
                            <span class="hash">${c.hash}</span>
                            <span class="branch-label">${c.branch}</span>`;
            remoteContainer.prepend(rc);
            c.pushed = true;
        }, i * 220);
    });

    btnPush.disabled = true;
    btnPull.disabled = false;
});

// ── git pull ──────────────────────────────────────────────

btnPull.addEventListener('click', () => {
    headTag.style.boxShadow = '0 0 24px rgba(250,204,21,0.9)';
    setTimeout(() => { headTag.style.boxShadow = ''; }, 700);
    btnPull.disabled = true;
});
