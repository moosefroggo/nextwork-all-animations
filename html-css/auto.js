const fileContainer = document.getElementById('file-container');
const localHistory = document.getElementById('local-history');
const remoteHistory = document.getElementById('remote-history');
const terminalPopup = document.getElementById('terminal-popup');
const terminalText = document.getElementById('terminal-text');
const btnReplay = document.getElementById('btn-replay');

const fileNames = ['index.js', 'style.css', 'api.ts'];
let files = [];

function moveFileTo(fileEl, zoneId, offsetIndex = 0) {
    const zone = document.getElementById(zoneId);
    const rect = zone.getBoundingClientRect();
    const pipelineRect = document.querySelector('.pipeline').getBoundingClientRect();
    
    const offsetX = (offsetIndex - 1) * 20; 
    const offsetY = (offsetIndex - 1) * 20;
    
    const left = rect.left - pipelineRect.left + (rect.width / 2) - 50 + offsetX; 
    const top = rect.top - pipelineRect.top + 50 + offsetY; 
    
    fileEl.style.left = `${left}px`;
    fileEl.style.top = `${top}px`;
}

function showPopup(text, duration = 1500) {
    return new Promise(resolve => {
        terminalText.textContent = text;
        terminalPopup.classList.add('show');
        setTimeout(() => {
            terminalPopup.classList.remove('show');
            setTimeout(resolve, 300); // wait for fade out
        }, duration);
    });
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// Helper to align tags to a commit node
function alignTag(tagEl, nodeEl, xOffset = 0) {
    // nodeEl is relative to localHistory
    const top = nodeEl.offsetTop + 15; // center of node
    tagEl.style.top = `${top}px`;
    if (xOffset > 0) {
        tagEl.style.marginLeft = `${xOffset}px`;
    } else {
        tagEl.style.marginLeft = `0px`;
    }
}

async function runSequence() {
    btnReplay.disabled = true;
    btnReplay.style.opacity = '0.5';
    
    fileContainer.innerHTML = '';
    localHistory.innerHTML = '';
    remoteHistory.innerHTML = '';
    files = [];
    
    // 1. Setup Initial Files
    fileNames.forEach((name, i) => {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            <div class="file-icon">📄</div>
            <div class="file-name">${name}</div>
            <div class="status-dot status-edited"></div>
        `;
        fileContainer.appendChild(card);
        files.push(card);
        moveFileTo(card, 'zone-working', i);
    });
    
    await wait(100);
    files.forEach(f => f.style.opacity = '1');
    await wait(1000);
    
    // 2. git add .
    await showPopup('git add .');
    for (let i = 0; i < files.length; i++) {
        moveFileTo(files[i], 'zone-staging', i);
        files[i].querySelector('.status-dot').className = 'status-dot status-staged';
        await wait(200); 
    }
    await wait(1000);
    
    // 3. git commit
    await showPopup('git commit -m "Initial commit"');
    files.forEach(f => {
        f.style.transform = 'scale(0)';
        f.style.opacity = '0';
    });
    await wait(400); 
    
    let hashMain = Math.random().toString(16).substr(2, 6);
    const nodeMain = document.createElement('div');
    nodeMain.className = 'commit-node';
    nodeMain.textContent = hashMain;
    localHistory.appendChild(nodeMain);
    await wait(100);
    
    // Attach [main] tag
    const tagMain = document.createElement('div');
    tagMain.className = 'branch-tag active show';
    tagMain.textContent = 'main';
    localHistory.appendChild(tagMain);
    alignTag(tagMain, nodeMain);
    
    await wait(1000);
    
    // 4. git push
    await showPopup('git push origin main');
    const nodeRemote = document.createElement('div');
    nodeRemote.className = 'commit-node';
    nodeRemote.textContent = hashMain;
    remoteHistory.appendChild(nodeRemote);
    await wait(1000);
    
    // Reset files for feature work
    files.forEach((f, i) => {
        f.querySelector('.status-dot').className = 'status-dot';
        moveFileTo(f, 'zone-working', i);
        f.style.transition = 'none';
        f.style.transform = 'scale(1)';
        f.style.opacity = '1';
    });
    await wait(100);
    files.forEach(f => f.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)');
    await wait(1000);

    // 5. git branch feature
    await showPopup('git branch feature');
    const tagFeature = document.createElement('div');
    tagFeature.className = 'branch-tag show';
    tagFeature.textContent = 'feature';
    localHistory.appendChild(tagFeature);
    // Align it right next to main (with a small visual xOffset so they don't overlap totally, though flex row inside might be better. We'll use marginLeft via alignTag)
    alignTag(tagFeature, nodeMain, 45); 
    await wait(1000);

    // 6. git checkout feature
    await showPopup('git checkout feature');
    tagMain.classList.remove('active');
    tagFeature.classList.add('active');
    // Bump feature tag to the front visually
    tagFeature.style.zIndex = '10';
    tagMain.style.zIndex = '5';
    await wait(1000);

    // 7. Feature Work (Edit & Add)
    files.forEach(f => f.querySelector('.status-dot').className = 'status-dot status-edited');
    await wait(500);
    await showPopup('git add .');
    for (let i = 0; i < files.length; i++) {
        moveFileTo(files[i], 'zone-staging', i);
        files[i].querySelector('.status-dot').className = 'status-dot status-staged';
        await wait(200); 
    }
    await wait(1000);

    // 8. git commit (feature)
    await showPopup('git commit -m "Add feature"');
    files.forEach(f => {
        f.style.transform = 'scale(0)';
        f.style.opacity = '0';
    });
    await wait(400);
    
    let hashFeature = Math.random().toString(16).substr(2, 6);
    const nodeFeature = document.createElement('div');
    nodeFeature.className = 'commit-node';
    nodeFeature.textContent = hashFeature;
    // Prepend so it sits on TOP of the main commit in the UI list
    localHistory.prepend(nodeFeature);
    
    await wait(100);
    // Recalculate positions!
    // Since nodeMain was pushed down, its offsetTop changed.
    alignTag(tagMain, nodeMain);
    // Move feature tag to the new node
    alignTag(tagFeature, nodeFeature);
    // Remove the horizontal offset from feature since it's alone on this row now
    tagFeature.style.marginLeft = '0px';
    
    await wait(1500);

    // 9. git checkout main
    await showPopup('git checkout main');
    tagFeature.classList.remove('active');
    tagMain.classList.add('active');
    tagFeature.style.zIndex = '5';
    tagMain.style.zIndex = '10';
    await wait(1500);

    // 10. git merge feature (Fast Forward)
    await showPopup('git merge feature');
    // Main tag simply slides up to join Feature tag with offset to prevent overlap
    alignTag(tagMain, nodeFeature, 75); 
    
    await wait(2000);
    
    // 11. Mock Remote Change
    await showPopup('Remote repository gets a new commit from another collaborator...');
    let hashRemoteOnly = Math.random().toString(16).substr(2, 6);
    
    const nodeRemoteOnly = document.createElement('div');
    nodeRemoteOnly.className = 'commit-node';
    nodeRemoteOnly.textContent = hashRemoteOnly;
    remoteHistory.prepend(nodeRemoteOnly);
    
    await wait(2000);
    
    // 12. git pull
    await showPopup('git pull');
    
    // Visually pulse files to show they are synced/updated
    files.forEach(f => {
        f.style.transform = 'scale(1.1)';
        f.style.boxShadow = '0 0 20px #22c55e';
        f.style.borderColor = '#22c55e';
    });
    
    await wait(600);
    
    files.forEach(f => {
        f.style.transform = 'scale(1)';
        f.style.boxShadow = 'none';
        f.style.borderColor = '#333';
    });
    
    const nodePulled = document.createElement('div');
    nodePulled.className = 'commit-node';
    nodePulled.textContent = hashRemoteOnly;
    localHistory.prepend(nodePulled);
    
    await wait(300);
    
    // Align tags to the newly pulled commit
    alignTag(tagMain, nodePulled, 75);
    alignTag(tagFeature, nodePulled);
    
    await wait(2500);
    
    btnReplay.disabled = false;
    btnReplay.style.opacity = '1';
}

btnReplay.addEventListener('click', runSequence);

window.addEventListener('load', () => {
    runSequence();
});

