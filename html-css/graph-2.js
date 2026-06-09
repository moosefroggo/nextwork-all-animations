const nodeContainer = document.getElementById('node-container');
const svgOverlay = document.getElementById('svg-overlay');
const headTag = document.getElementById('head-tag');
const remoteNodeContainer = document.getElementById('remote-node-container');

const btnAdd = document.getElementById('btn-add');
const btnCommit = document.getElementById('btn-commit');
const btnBranch = document.getElementById('btn-branch');
const btnCheckout = document.getElementById('btn-checkout');
const btnMerge = document.getElementById('btn-merge');
const btnPush = document.getElementById('btn-push');
const btnPull = document.getElementById('btn-pull');

const branches = {
    'main': { y: 100 },
    'feature': { y: 250, parentNode: null }
};

let activeBranch = 'main';
let currentX = 180;
const X_STEP = 120;

let commitHistory = [];
let stagedNode = null;
let mainTagEl = null;
let featureTagEl = null;
let pushedHashes = new Set();

function genHash() {
    return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// Helper to draw an SVG path
function drawPath(x1, y1, x2, y2, colorClass) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const cp1x = x1 + (x2 - x1) / 2;
    const d = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp1x} ${y2}, ${x2} ${y2}`;
    path.setAttribute('d', d);
    path.setAttribute('class', `branch-line ${colorClass}`);
    
    const length = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2)) * 1.5;
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    
    svgOverlay.appendChild(path);
    path.getBoundingClientRect();
    path.style.strokeDashoffset = 0;
    return path;
}

function updateHead(x, y) {
    headTag.style.left = `${x}px`;
    headTag.style.top = `${y - 45}px`;
    headTag.style.opacity = '1';
}

function createNodeEl(x, y, typeClass, hash) {
    const el = document.createElement('div');
    el.className = `node ${typeClass}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.innerHTML = `<div class="node-icon">📄</div><div class="node-label">${hash}</div>`;
    nodeContainer.appendChild(el);
    return el;
}

function getLastCommit(branch) {
    for (let i = commitHistory.length - 1; i >= 0; i--) {
        if (commitHistory[i].branch === branch) return commitHistory[i];
    }
    return null;
}

// Initial commit
const rootHash = genHash();
const rootCommit = { id: 0, x: 180, y: 100, branch: 'main', hash: rootHash, el: createNodeEl(180, 100, 'solid main', rootHash) };
commitHistory.push(rootCommit);
updateHead(180, 100);

// Initialize main branch tag
mainTagEl = document.createElement('div');
mainTagEl.className = 'branch-tag';
mainTagEl.textContent = 'main';
rootCommit.el.appendChild(mainTagEl);

// ----------------------------------------------------
// Button State Management
// ----------------------------------------------------
function updateButtonStates() {
    if (stagedNode) {
        // User must commit the staged change first
        btnAdd.disabled = true;
        btnCommit.disabled = false;
        btnBranch.disabled = true;
        btnCheckout.disabled = true;
        btnMerge.disabled = true;
        btnPush.disabled = true;
        btnPull.disabled = true;
    } else {
        btnAdd.disabled = false;
        btnCommit.disabled = true;
        
        const mainCommits = commitHistory.filter(c => c.branch === 'main');
        const featureCommits = commitHistory.filter(c => c.branch === 'feature');
        
        // Push & Pull are active if there are commits
        btnPush.disabled = commitHistory.length === 0;
        btnPull.disabled = false;
        
        if (activeBranch === 'main') {
            // Can branch if feature branch has not been initialized yet
            btnBranch.disabled = (branches['feature'].parentNode !== null);
            
            // Can checkout feature if it has been created
            btnCheckout.disabled = (branches['feature'].parentNode === null);
            if (btnCheckout.disabled) {
                btnCheckout.querySelector('.cmd').textContent = 'git checkout feature';
                btnCheckout.querySelector('.sub').textContent = 'Switch to the feature timeline';
            }
            
            // Can merge if there are feature commits and the last main commit is not already a merge
            const lastMain = getLastCommit('main');
            const hasFeature = featureCommits.length > 0;
            // Simple lock: check if already merged
            const isAlreadyMerged = lastMain && commitHistory.length > 2 && lastMain.id === commitHistory.length - 1 && commitHistory[commitHistory.length - 1].hash && getLastCommit('feature') && (lastMain.x > getLastCommit('feature').x) && btnCheckout.disabled;
            btnMerge.disabled = !hasFeature || isAlreadyMerged;
        } else {
            // On feature branch
            btnBranch.disabled = true;
            btnCheckout.disabled = false;
            btnMerge.disabled = true;
        }
    }
}

// Initial update
updateButtonStates();

// ----------------------------------------------------
// Button Actions
// ----------------------------------------------------

btnAdd.addEventListener('click', () => {
    let maxX = 100;
    commitHistory.forEach(c => { if(c.x > maxX) maxX = c.x; });
    currentX = maxX + X_STEP;
    
    const y = branches[activeBranch].y;
    const nodeEl = createNodeEl(currentX, y, 'staged', '...');
    
    stagedNode = {
        x: currentX,
        y: y,
        branch: activeBranch,
        el: nodeEl
    };
    
    updateButtonStates();
});

btnCommit.addEventListener('click', () => {
    if (!stagedNode) return;
    
    const hash = genHash();
    stagedNode.el.className = `node solid ${stagedNode.branch === 'main' ? 'main' : 'feature'}`;
    stagedNode.el.querySelector('.node-label').textContent = hash;
    
    let parent = getLastCommit(stagedNode.branch);
    if (!parent && stagedNode.branch === 'feature') {
        parent = branches['feature'].parentNode;
    }
    
    if (parent) {
        drawPath(parent.x, parent.y, stagedNode.x, stagedNode.y, stagedNode.branch === 'feature' ? 'feature' : '');
    }
    
    const commit = {
        id: commitHistory.length,
        x: stagedNode.x,
        y: stagedNode.y,
        branch: stagedNode.branch,
        hash: hash,
        el: stagedNode.el
    };
    commitHistory.push(commit);
    updateHead(stagedNode.x, stagedNode.y);
    
    // Move branch pointer tag
    if (stagedNode.branch === 'main') {
        if (mainTagEl) {
            mainTagEl.remove();
            commit.el.appendChild(mainTagEl);
        }
    } else if (stagedNode.branch === 'feature') {
        if (featureTagEl) {
            featureTagEl.remove();
            commit.el.appendChild(featureTagEl);
        }
    }
    
    stagedNode = null;
    updateButtonStates();
});

btnBranch.addEventListener('click', () => {
    const parent = getLastCommit('main');
    if (!parent) return;
    
    branches['feature'].parentNode = parent;
    
    // Visual Feedback: Fade in the Feature lane
    const featureLabel = document.getElementById('label-feature');
    if (featureLabel) {
        featureLabel.style.opacity = '1';
        featureLabel.textContent = 'Feature Timeline';
        featureLabel.style.color = '#10b981'; // light green
    }
    
    // Create feature branch tag at parent commit
    featureTagEl = document.createElement('div');
    featureTagEl.className = 'branch-tag feature-tag';
    featureTagEl.textContent = 'feature';
    parent.el.appendChild(featureTagEl);
    
    updateButtonStates();
});

btnCheckout.addEventListener('click', () => {
    if (activeBranch === 'main') {
        // Checkout feature
        activeBranch = 'feature';
        btnCheckout.querySelector('.cmd').textContent = 'git checkout main';
        btnCheckout.querySelector('.sub').textContent = 'Switch back to main timeline';
        
        let tip = getLastCommit('feature') || branches['feature'].parentNode;
        updateHead(tip.x, tip.y);
    } else {
        // Checkout main
        activeBranch = 'main';
        btnCheckout.querySelector('.cmd').textContent = 'git checkout feature';
        btnCheckout.querySelector('.sub').textContent = 'Switch to the feature timeline';
        
        let tip = getLastCommit('main');
        updateHead(tip.x, tip.y);
    }
    updateButtonStates();
});

btnMerge.addEventListener('click', () => {
    let maxX = 100;
    commitHistory.forEach(c => { if(c.x > maxX) maxX = c.x; });
    currentX = maxX + X_STEP;
    const y = branches['main'].y;
    const hash = genHash();
    
    const mergeNodeEl = createNodeEl(currentX, y, 'solid main', hash);
    const mainParent = getLastCommit('main');
    const featureParent = getLastCommit('feature');
    
    if (mainParent) {
        drawPath(mainParent.x, mainParent.y, currentX, y, '');
    }
    if (featureParent) {
        drawPath(featureParent.x, featureParent.y, currentX, y, '');
    }
    
    const commit = { id: commitHistory.length, x: currentX, y, branch: 'main', hash, el: mergeNodeEl };
    commitHistory.push(commit);
    updateHead(currentX, y);
    
    // Move main branch tag to merge commit
    if (mainTagEl) {
        mainTagEl.remove();
        mergeNodeEl.appendChild(mainTagEl);
    }
    
    updateButtonStates();
    
    // Disable switching branch/checkout after merging for the demo simplicity
    btnCheckout.disabled = true;
});

btnPush.addEventListener('click', () => {
    // Find all commits that are not pushed yet
    const unpushed = commitHistory.filter(c => !pushedHashes.has(c.hash));
    if (unpushed.length === 0) return;
    
    unpushed.forEach((c, index) => {
        // Stagger the animations slightly
        setTimeout(() => {
            const cloudPath = drawPath(c.x, c.y, 650, c.y, 'cloud-sync');
            
            setTimeout(() => {
                cloudPath.remove();
                
                const rNode = document.createElement('div');
                rNode.className = `remote-commit ${c.branch === 'feature' ? 'feature-commit' : ''}`;
                rNode.innerHTML = `<span class="dot"></span><span class="hash">${c.hash}</span><span class="branch-label">${c.branch}</span>`;
                remoteNodeContainer.appendChild(rNode);
                
                pushedHashes.add(c.hash);
            }, 1000);
        }, index * 250);
    });
});

btnPull.addEventListener('click', () => {
    const tip = getLastCommit(activeBranch);
    if (!tip) return;
    const cloudPath = drawPath(650, tip.y, tip.x, tip.y, 'cloud-sync');
    setTimeout(() => {
        cloudPath.remove();
        // Visually animate a glow on HEAD or tip node to indicate pull successful/synchronized
        tip.el.style.transform = 'translate(-50%, -50%) scale(1.1)';
        setTimeout(() => {
            tip.el.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 300);
    }, 1000);
});
