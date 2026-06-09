const btnEdit = document.getElementById('btn-edit');
const btnAdd = document.getElementById('btn-add');
const btnCommit = document.getElementById('btn-commit');
const btnPush = document.getElementById('btn-push');
const btnCheckout = document.getElementById('btn-checkout');
const btnPull = document.getElementById('btn-pull');
const btnMockRemote = document.getElementById('btn-mock-remote');
const btnReset = document.getElementById('btn-reset');

const fileCard = document.getElementById('file-card');
const fileStatus = document.getElementById('file-status');
const localHistory = document.getElementById('local-history');
const remoteHistory = document.getElementById('remote-history');

// Calculate absolute left positions based on the UI flow
const posWorking = '40px';
const posStaging = '275px';
const posLocal = '515px';

// Helper to move file to a specific zone dynamically
function moveFileTo(zoneId) {
    const zone = document.getElementById(zoneId);
    const rect = zone.getBoundingClientRect();
    const pipelineRect = document.querySelector('.pipeline').getBoundingClientRect();
    
    const left = rect.left - pipelineRect.left + (rect.width / 2) - 50; 
    const top = rect.top - pipelineRect.top + 50; 
    
    fileCard.style.left = `${left}px`;
    fileCard.style.top = `${top}px`;
}

// Initialize position
window.addEventListener('load', () => {
    moveFileTo('zone-working');
    setTimeout(() => {
        fileCard.style.opacity = '1';
    }, 100);
});

window.addEventListener('resize', () => {
    if(fileCard.style.opacity === '1') {
        moveFileTo('zone-working');
    }
});

let isEdited = false;

// Helper for stepper UI
function setActiveStep(activeBtn) {
    [btnEdit, btnAdd, btnCommit, btnPush, btnCheckout, btnPull].forEach(btn => btn.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
}

// 1. Edit
btnEdit.addEventListener('click', () => {
    isEdited = true;
    fileStatus.className = 'status-dot status-edited';
    
    fileCard.style.transform = 'scale(1.05)';
    setTimeout(() => fileCard.style.transform = 'scale(1)', 150);
    
    btnEdit.disabled = true;
    btnAdd.disabled = false;
    btnCheckout.disabled = false; // allow discarding edits
    setActiveStep(btnAdd);
});

// 2. Add
btnAdd.addEventListener('click', () => {
    moveFileTo('zone-staging');
    fileStatus.className = 'status-dot status-staged';
    
    btnAdd.disabled = true;
    btnCommit.disabled = false;
    btnCheckout.disabled = false; // allow checking out from staging
    setActiveStep(btnCommit);
});

// 3. Commit
btnCommit.addEventListener('click', () => {
    moveFileTo('zone-local');
    
    setTimeout(() => {
        fileCard.style.opacity = '0';
        fileCard.style.transform = 'scale(0)';
        
        const hash = Math.random().toString(16).substr(2, 6);
        const node = document.createElement('div');
        node.className = 'commit-node';
        node.textContent = hash;
        localHistory.prepend(node);
        
        setTimeout(() => {
            fileCard.style.transition = 'none'; 
            moveFileTo('zone-working');
            fileStatus.className = 'status-dot'; 
            
            setTimeout(() => {
                fileCard.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
                fileCard.style.opacity = '1';
                fileCard.style.transform = 'scale(1)';
                
                btnEdit.disabled = false;
                btnPush.disabled = false;
                btnCheckout.disabled = true; // reset
                setActiveStep(btnPush);
            }, 50);
        }, 500);
        
    }, 600);
    
    btnCommit.disabled = true;
});

// 4. Push
btnPush.addEventListener('click', () => {
    const localNodes = localHistory.children;
    remoteHistory.innerHTML = ''; 
    
    Array.from(localNodes).reverse().forEach((node, i) => {
        setTimeout(() => {
            const copy = document.createElement('div');
            copy.className = 'commit-node';
            copy.textContent = node.textContent;
            remoteHistory.prepend(copy);
        }, i * 200); 
    });
    
    btnPush.disabled = true;
    setActiveStep(btnEdit); 
});

// MOCK REMOTE (Trigger Pull)
btnMockRemote.addEventListener('click', () => {
    const hash = Math.random().toString(16).substr(2, 6);
    const node = document.createElement('div');
    node.className = 'commit-node';
    node.textContent = hash;
    remoteHistory.prepend(node);
    
    btnPull.disabled = false;
    setActiveStep(btnPull);
});

// 5. Pull
btnPull.addEventListener('click', () => {
    const remoteNodes = remoteHistory.children;
    if (remoteNodes.length === 0) return;
    
    const topNodeText = remoteNodes[0].textContent;
    const node = document.createElement('div');
    node.className = 'commit-node';
    node.textContent = topNodeText;
    
    localHistory.prepend(node);
    
    // Visually show the file got updated by the pull
    fileCard.style.transform = 'scale(1.1)';
    fileCard.style.boxShadow = '0 0 20px #4ade80';
    setTimeout(() => {
        fileCard.style.transform = 'scale(1)';
        fileCard.style.boxShadow = 'none';
    }, 400);
    
    btnPull.disabled = true;
    
    // Pull updates working dir, so they can edit again
    btnEdit.disabled = false;
    setActiveStep(btnEdit);
});

// 6. Checkout
btnCheckout.addEventListener('click', () => {
    // Yank card back to working dir instantly
    fileCard.style.transition = 'none';
    moveFileTo('zone-working');
    
    // Clear status dot
    fileStatus.className = 'status-dot';
    isEdited = false;
    
    // Visually shake the file to show it was reverted
    fileCard.style.transform = 'translate(-10px, 0)';
    setTimeout(() => fileCard.style.transform = 'translate(10px, 0)', 50);
    setTimeout(() => fileCard.style.transform = 'translate(-10px, 0)', 100);
    setTimeout(() => fileCard.style.transform = 'translate(10px, 0)', 150);
    setTimeout(() => fileCard.style.transform = 'translate(0, 0)', 200);
    
    // Re-enable edit track
    btnEdit.disabled = false;
    btnAdd.disabled = true;
    btnCommit.disabled = true;
    btnCheckout.disabled = true;
    
    setTimeout(() => {
        fileCard.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        setActiveStep(btnEdit);
    }, 250);
});

btnReset.addEventListener('click', () => location.reload());
