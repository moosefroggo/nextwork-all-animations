import '../style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import gsap from 'gsap';

// ----------------------------------------------------
// Step Database (Isolated Git Workflow commands - 7 Steps)
// ----------------------------------------------------
const STEPS = [
  {
    title: "1. git init",
    desc: "Initializes a new local Git repository. This creates the hidden `.git/` database directory, signalling Git to start watching your project workspace.",
    task: "Run init to prepare the workspace for version tracking.",
    prompt: "mustafa@macbook git-learning-log %",
    command: "git init",
    output: "<span class=\"term-success\">Initialized empty Git repository in /Users/mustafa/Desktop/git-learning-log/.git/</span>",
    branch: "main",
    sync: "",
    files: [
      { name: ".git", type: "folder", badge: "" }
    ],
    editorLines: []
  },
  {
    title: "2. git add",
    desc: "Stages modifications in `learning-log.md`. Staging acts as a holding zone, telling Git which changes should be included in the next commit snapshot.",
    task: "Stage your newly created markdown files to prepare them for commit.",
    prompt: "mustafa@macbook git-learning-log %",
    command: "git add learning-log.md",
    output: "",
    branch: "main",
    sync: "",
    files: [
      { name: ".git", type: "folder", badge: "" },
      { name: "learning-log.md", type: "file", badge: "A" }
    ],
    editorLines: [
      { type: "header", text: "# My Learning Log" },
      { type: "text", text: "" },
      { type: "subheader", text: "## Goals" },
      { type: "bullet", text: "- Understand commits" }
    ]
  },
  {
    title: "3. git commit",
    desc: "Saves the staged snapshot permanently in your `.git/` history database. The workspace changes are cleared and register as clean.",
    task: "Save a commit snapshot to lock in your initial log.",
    prompt: "mustafa@macbook git-learning-log %",
    command: "git commit -m \"Save initial log\"",
    output: "[main (root-commit) 4a2b9e1] Save initial log\n 1 file changed, 4 insertions(+)\n create mode 100644 learning-log.md",
    branch: "main",
    sync: "",
    files: [
      { name: ".git", type: "folder", badge: "" },
      { name: "learning-log.md", type: "file", badge: "" }
    ],
    editorLines: [
      { type: "header", text: "# My Learning Log" },
      { type: "text", text: "" },
      { type: "subheader", text: "## Goals" },
      { type: "bullet", text: "- Understand commits" }
    ]
  },
  {
    title: "4. git checkout",
    desc: "Creates and switches to a new branch called `feature`. The status bar updates branch pointer. Any edits here are isolated from the `main` branch.",
    task: "Branch off from main to start parallel work safely.",
    prompt: "mustafa@macbook git-learning-log %",
    command: "git checkout -b feature",
    output: "<span class=\"term-success\">Switched to a new branch 'feature'</span>",
    branch: "feature",
    sync: "",
    files: [
      { name: ".git", type: "folder", badge: "" },
      { name: "learning-log.md", type: "file", badge: "" }
    ],
    editorLines: [
      { type: "header", text: "# My Learning Log" },
      { type: "text", text: "" },
      { type: "subheader", text: "## Goals" },
      { type: "bullet", text: "- Understand commits" },
      { type: "bullet", text: "- Work on branch feature" }
    ]
  },
  {
    title: "5. git merge",
    desc: "Switches back to `main` and merges the changes from `feature` back into the stable timeline, combining the branched lines of code.",
    task: "Merge the feature branch back into main.",
    prompt: "mustafa@macbook git-learning-log %",
    command: "git checkout main\ngit merge feature",
    output: "Updating 4a2b9e1..d2f4a1c\nFast-forward\n learning-log.md | 1 +",
    branch: "main",
    sync: "",
    files: [
      { name: ".git", type: "folder", badge: "" },
      { name: "learning-log.md", type: "file", badge: "" }
    ],
    editorLines: [
      { type: "header", text: "# My Learning Log" },
      { type: "text", text: "" },
      { type: "subheader", text: "## Goals" },
      { type: "bullet", text: "- Understand commits" },
      { type: "bullet", text: "- Work on branch feature" }
    ]
  },
  {
    title: "6. git push",
    desc: "Uploads your local branch commit history to the remote repository on GitHub (origin), backing up your code and sharing it with collaborators.",
    task: "Push main branch history online to GitHub.",
    prompt: "mustafa@macbook git-learning-log %",
    command: "git push origin main",
    output: "Writing objects: 100% (6/6), 524 bytes, done.\nTo github.com:mustafa/git-learning-log.git\n * [new branch]      main -> main",
    branch: "main",
    sync: "✓ Synced with GitHub",
    files: [
      { name: ".git", type: "folder", badge: "" },
      { name: "learning-log.md", type: "file", badge: "" }
    ],
    editorLines: [
      { type: "header", text: "# My Learning Log" },
      { type: "text", text: "" },
      { type: "subheader", text: "## Goals" },
      { type: "bullet", text: "- Understand commits" },
      { type: "bullet", text: "- Work on branch feature" }
    ]
  },
  {
    title: "7. git pull",
    desc: "Fetches and merges remote changes from GitHub into your local workspace. A new document `remote-notes.md` is fetched, syncing directories.",
    task: "Pull remote updates to synchronize your local workspace.",
    prompt: "mustafa@macbook git-learning-log %",
    command: "git pull",
    output: "remote: Enumerating objects: 3, done.\nUnpacking objects: 100% (2/2), 412 bytes, done.\nUpdating d2f4a1c..e4f5g6h\nFast-forward\n remote-notes.md | 1 +",
    branch: "main",
    sync: "✓ Synced with GitHub",
    files: [
      { name: ".git", type: "folder", badge: "" },
      { name: "learning-log.md", type: "file", badge: "" },
      { name: "remote-notes.md", type: "file", badge: "" }
    ],
    editorLines: [
      { type: "header", text: "# My Learning Log" },
      { type: "text", text: "" },
      { type: "subheader", text: "## Goals" },
      { type: "bullet", text: "- Understand commits" },
      { type: "bullet", text: "- Work on branch feature" }
    ]
  }
];

// ----------------------------------------------------
// Setup Three.js Scene, Camera, Renderers & Controls
// ----------------------------------------------------
const container = document.getElementById('canvas-container');
const width = container.clientWidth;
const height = container.clientHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#080b11');

// Setup Perspective Camera at a beautiful high-tech angled isometric viewpoint
const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 1000);
camera.position.set(0, 2, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
container.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(width, height);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
container.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go under floor
controls.minDistance = 6;
controls.maxDistance = 30;
controls.target.set(0, 0, 0);

// ----------------------------------------------------
// Lighting System
// ----------------------------------------------------
const ambientLight = new THREE.AmbientLight('#1e293b', 1.0);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight('#00f2fe', 1.5);
keyLight.position.set(-10, 20, 15);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 1024;
keyLight.shadow.mapSize.height = 1024;
keyLight.shadow.bias = -0.0001;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight('#8a2be2', 0.8);
fillLight.position.set(10, 15, -10);
scene.add(fillLight);

// Header status light for Git commits
const statusLight = new THREE.PointLight('#00f2fe', 0.5, 5);
statusLight.position.set(0, 3.6, 0.2);
scene.add(statusLight);

// ----------------------------------------------------
// Environment: Grid, Ambient particles
// ----------------------------------------------------
const grid = new THREE.GridHelper(50, 50, '#1e293b', '#0f172a');
grid.position.y = -3.8;
scene.add(grid);

const particleCount = 80;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i += 3) {
  particlePositions[i] = (Math.random() - 0.5) * 40;
  particlePositions[i + 1] = (Math.random() - 0.5) * 20;
  particlePositions[i + 2] = (Math.random() - 0.5) * 40;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMat = new THREE.PointsMaterial({
  color: '#8a2be2',
  size: 0.1,
  transparent: true,
  opacity: 0.4
});
const stars = new THREE.Points(particleGeo, particleMat);
scene.add(stars);

// ----------------------------------------------------
// 3D Editor Workspace Chassis Meshes
// ----------------------------------------------------
const editorGroup = new THREE.Group();
// Rotate group slightly to create the floating 3D isometric perspective mockup
editorGroup.rotation.x = -0.15;
editorGroup.rotation.y = -0.38;
editorGroup.rotation.z = 0.03;
scene.add(editorGroup);

// Materials
const windowMetalMat = new THREE.MeshStandardMaterial({ color: '#161e2e', roughness: 0.3, metalness: 0.8 });
const bezelMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.5 });
const statusLampGreen = new THREE.MeshBasicMaterial({ color: '#10b981' });

// Main editor backing plate
const backingPlate = new THREE.Mesh(new THREE.BoxGeometry(11.4, 6.2, 0.2), windowMetalMat);
backingPlate.castShadow = true;
backingPlate.receiveShadow = true;
editorGroup.add(backingPlate);

// Header bar
const headerBar = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.5, 0.22), bezelMat);
headerBar.position.y = 2.85;
editorGroup.add(headerBar);

// Window control dots (Mac window mockup)
const redDot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
redDot.position.set(-5.3, 2.85, 0.13);
editorGroup.add(redDot);

const yellowDot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: '#f59e0b' }));
yellowDot.position.set(-5.0, 2.85, 0.13);
editorGroup.add(yellowDot);

const greenDot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: '#10b981' }));
greenDot.position.set(-4.7, 2.85, 0.13);
editorGroup.add(greenDot);

// Header status light sphere
const statusSphere = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), statusLampGreen);
statusSphere.position.set(5.2, 2.85, 0.13);
editorGroup.add(statusSphere);

// ----------------------------------------------------
// CSS2D Panel Layouts
// ----------------------------------------------------

// File Explorer Sidebar Panel
const explorerContainer = document.createElement('div');
explorerContainer.className = 'explorer-tree';
const explorerLabel = new CSS2DObject(explorerContainer);
// Positioned on the left side of the editor
explorerLabel.position.set(-3.7, 0, 0.13);
editorGroup.add(explorerLabel);

// Editor Code Panel
const editorCodeContainer = document.createElement('div');
editorCodeContainer.className = 'editor-code-panel';
const editorCodeLabel = new CSS2DObject(editorCodeContainer);
// Positioned on the right side of the editor
editorCodeLabel.position.set(1.7, 0.28, 0.13);
editorGroup.add(editorCodeLabel);

// IDE Status Bar Panel
const statusBarContainer = document.createElement('div');
statusBarContainer.className = 'ide-status-bar';
const statusBarLabel = new CSS2DObject(statusBarContainer);
// Positioned at the bottom of the editor
statusBarLabel.position.set(-1.0, -2.7, 0.13);
editorGroup.add(statusBarLabel);

// ----------------------------------------------------
// Dashboard States and Play Controls
// ----------------------------------------------------
let activeStepIndex = 0;
let isAutoplay = true;
let activeTypingTween = null;
let autoplayTimeout = null;

const stepSelect = document.getElementById('step-select');
const terminalHistory = document.getElementById('terminal-history');
const terminalCommandInput = document.getElementById('terminal-command-input');
const stepCounter = document.getElementById('step-counter');
const stepPercentage = document.getElementById('step-percentage');
const progressBarFill = document.getElementById('progress-bar-fill');
const stepTitle = document.getElementById('step-title');
const stepDescription = document.getElementById('step-description');
const stepTaskText = document.getElementById('step-task-text');

const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const playBtnText = document.getElementById('play-btn-text');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Populate selection menu options
stepSelect.innerHTML = "";
STEPS.forEach((step, idx) => {
  const opt = document.createElement('option');
  opt.value = idx;
  opt.textContent = step.title;
  stepSelect.appendChild(opt);
});

// Update Left HUD Text details
function updateHUD(stepIdx) {
  const step = STEPS[stepIdx];
  stepCounter.textContent = `Step ${stepIdx + 1} of ${STEPS.length}`;
  const pct = Math.round(((stepIdx + 1) / STEPS.length) * 100);
  stepPercentage.textContent = `${pct}%`;
  progressBarFill.style.width = `${pct}%`;
  stepTitle.textContent = step.title;
  stepDescription.innerHTML = step.desc;
  stepTaskText.textContent = step.task;
  stepSelect.value = stepIdx;
}

// ----------------------------------------------------
// Populate Explorer Sidebar CSS2D Nodes
// ----------------------------------------------------
function updateExplorer(stepIdx) {
  const step = STEPS[stepIdx];
  let html = `<div class="explorer-title">Files Explorer</div>`;
  
  step.files.forEach(file => {
    let iconClass = file.type === 'folder' ? 'folder' : 'file';
    let iconSymbol = file.type === 'folder' ? '📁' : '📄';
    let badgeHTML = "";

    if (file.badge) {
      badgeHTML = `<span class="git-badge badge-${file.badge.toLowerCase()}">${file.badge}</span>`;
    }

    html += `
      <div class="explorer-item">
        <span class="explorer-icon ${iconClass}">${iconSymbol}</span>
        <span class="explorer-name">${file.name}</span>
        ${badgeHTML}
      </div>
    `;
  });
  
  explorerContainer.innerHTML = html;
}

// ----------------------------------------------------
// Populate Editor Code CSS2D Lines with Typing Animations
// ----------------------------------------------------
function renderEditorLines(stepIdx, activeCharLimit = 9999) {
  const step = STEPS[stepIdx];
  let html = "";
  
  if (step.editorLines.length === 0) {
    html = `<div style="color: #475569; font-style: italic;">No files open in editor</div>`;
    editorCodeContainer.innerHTML = html;
    return;
  }

  // Concatenate lines up to active limit
  let charCounter = 0;
  
  step.editorLines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1;
    let lineCode = line.text;
    
    // Determine class for line coloring
    let syntaxClass = "syntax-md-text";
    if (line.type === "header") syntaxClass = "syntax-md-header";
    else if (line.type === "subheader") syntaxClass = "syntax-md-subheader";
    else if (line.type === "bullet") syntaxClass = "syntax-md-bullet";

    // Slice string based on typing limit
    const lineRemaining = activeCharLimit - charCounter;
    if (lineRemaining <= 0) {
      return; // line isn't typed yet
    }
    
    const sliceLen = Math.min(lineCode.length, lineRemaining);
    const visibleCode = lineCode.slice(0, sliceLen);
    charCounter += lineCode.length;

    html += `
      <div class="editor-line">
        <span class="editor-line-num">${lineNum}</span>
        <span class="editor-line-code ${syntaxClass}">${visibleCode}</span>
      </div>
    `;
  });

  editorCodeContainer.innerHTML = html;
}

// Animate Editor Typing
let activeEditorTypingTween = null;
function animateEditorTyping(stepIdx) {
  if (activeEditorTypingTween) {
    activeEditorTypingTween.kill();
  }

  const step = STEPS[stepIdx];
  if (step.editorLines.length === 0) {
    renderEditorLines(stepIdx);
    return;
  }

  // Compute total characters to type
  let totalChars = 0;
  step.editorLines.forEach(ln => totalChars += ln.text.length);

  const tweenObj = { count: 0 };
  activeEditorTypingTween = gsap.to(tweenObj, {
    count: totalChars,
    duration: Math.max(totalChars * 0.015, 0.4),
    ease: "none",
    onUpdate: () => {
      renderEditorLines(stepIdx, Math.floor(tweenObj.count));
    },
    onComplete: () => {
      renderEditorLines(stepIdx); // ensure final render
    }
  });
}

// ----------------------------------------------------
// Populate IDE Status Bar CSS2D Information
// ----------------------------------------------------
function updateStatusBar(stepIdx) {
  const step = STEPS[stepIdx];
  
  let syncHTML = "";
  if (step.sync) {
    syncHTML = `<span class="status-sync">${step.sync}</span>`;
  }

  statusBarContainer.innerHTML = `
    <div class="status-left">
      <span class="status-branch">${step.branch}</span>
    </div>
    <div class="status-right">
      ${syncHTML}
      <span class="status-encoding">UTF-8</span>
      <span class="status-lang">Markdown</span>
    </div>
  `;
}

// ----------------------------------------------------
// Terminal Console Typing Simulation
// ----------------------------------------------------
function typeTerminalCommand(stepIdx, onComplete) {
  const step = STEPS[stepIdx];
  terminalCommandInput.textContent = "";

  if (activeTypingTween) {
    activeTypingTween.kill();
  }

  const cmdText = step.command;
  const promptEl = document.querySelector('.terminal-prompt');
  promptEl.textContent = step.prompt;

  const typingObject = { charVal: 0 };
  activeTypingTween = gsap.to(typingObject, {
    charVal: cmdText.length,
    duration: Math.max(cmdText.length * 0.02, 0.4),
    ease: "none",
    onUpdate: () => {
      const idx = Math.floor(typingObject.charVal);
      terminalCommandInput.textContent = cmdText.slice(0, idx);
      document.getElementById('terminal-body').scrollTop = document.getElementById('terminal-body').scrollHeight;
    },
    onComplete: () => {
      // Append command history log
      const historyEntry = document.createElement('div');
      historyEntry.className = 'terminal-history-entry';

      let lines = cmdText.split('\n');
      let commandDisplayHTML = "";
      lines.forEach((ln, lidx) => {
        const promptSymbol = lidx === 0 ? step.prompt : " > ";
        commandDisplayHTML += `<div><span class="terminal-prompt">${promptSymbol}</span><span class="term-cmd">${ln}</span></div>`;
      });

      historyEntry.innerHTML = `
        ${commandDisplayHTML}
        <div class="term-out">${step.output}</div>
      `;
      terminalHistory.appendChild(historyEntry);
      terminalCommandInput.textContent = "";

      document.getElementById('terminal-body').scrollTop = document.getElementById('terminal-body').scrollHeight;

      if (onComplete) onComplete();
    }
  });
}

function clearTerminalHistory() {
  terminalHistory.innerHTML = "";
  terminalCommandInput.textContent = "";
}

// ----------------------------------------------------
// 3D Scene Animations Toggles
// ----------------------------------------------------
function animate3DScene(stepIdx) {
  const step = STEPS[stepIdx];

  // Adjust header status lamp color depending on step state
  gsap.to(statusLight.color, { r: 0, g: 0.95, b: 1, duration: 0.3 });
  gsap.to(statusLight, { intensity: 0.8, duration: 0.3 });

  // Trigger brief flash on header status lamps for Git commands (commit, add, push)
  if (step.command.includes("commit") || step.command.includes("push") || step.command.includes("init")) {
    gsap.timeline()
      .to(statusLight, { intensity: 3, duration: 0.15 })
      .to(statusLight, { intensity: 0.8, duration: 0.4 });
  }

  // Visual layout rotations: rotate code editor slightly towards camera based on step focus
  let targetRotY = -0.38;
  gsap.to(editorGroup.rotation, { y: targetRotY, duration: 1.2, ease: "power2.out" });
}

// ----------------------------------------------------
// Step Control Flow & Autoplay Manager
// ----------------------------------------------------
function goToStep(stepIdx) {
  if (stepIdx < 0 || stepIdx >= STEPS.length) return;
  activeStepIndex = stepIdx;
  
  if (autoplayTimeout) {
    clearTimeout(autoplayTimeout);
  }

  updateHUD(activeStepIndex);
  updateExplorer(activeStepIndex);
  updateStatusBar(activeStepIndex);
  animate3DScene(activeStepIndex);
  animateEditorTyping(activeStepIndex);

  typeTerminalCommand(activeStepIndex, () => {
    // Schedule autoplay transitions
    if (isAutoplay && activeStepIndex < STEPS.length - 1) {
      autoplayTimeout = setTimeout(() => {
        goToStep(activeStepIndex + 1);
      }, 5500);
    } else if (activeStepIndex === STEPS.length - 1) {
      if (isAutoplay) {
        autoplayTimeout = setTimeout(() => {
          clearTerminalHistory();
          goToStep(0);
        }, 8500);
      }
    }
  });
}

function togglePlay() {
  isAutoplay = !isAutoplay;
  if (isAutoplay) {
    playBtn.classList.add('active');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    playBtnText.textContent = "Pause";
    goToStep(activeStepIndex);
  } else {
    playBtn.classList.remove('active');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    playBtnText.textContent = "Play";
    if (autoplayTimeout) {
      clearTimeout(autoplayTimeout);
    }
    if (activeTypingTween) {
      activeTypingTween.kill();
    }
    if (activeEditorTypingTween) {
      activeEditorTypingTween.kill();
    }
  }
}

// Bind navigation selectors
prevBtn.addEventListener('click', () => {
  if (activeStepIndex > 0) {
    if (isAutoplay) togglePlay();
    goToStep(activeStepIndex - 1);
  }
});

nextBtn.addEventListener('click', () => {
  if (activeStepIndex < STEPS.length - 1) {
    if (isAutoplay) togglePlay();
    goToStep(activeStepIndex + 1);
  }
});

playBtn.addEventListener('click', togglePlay);

stepSelect.addEventListener('change', (e) => {
  if (isAutoplay) togglePlay();
  clearTerminalHistory();
  goToStep(parseInt(e.target.value));
});

// ----------------------------------------------------
// Presentation / Non-interactive Mode Handler
// ----------------------------------------------------
const dashboard = document.getElementById('dashboard-container');
const modeToggleBtn = document.getElementById('mode-toggle-btn');
const modeToggleText = document.getElementById('mode-toggle-text');

function resizeCanvas() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
}

function toggleMode() {
  const isNowNonInteractive = dashboard.classList.toggle('non-interactive');
  if (isNowNonInteractive) {
    modeToggleText.textContent = "Interactive Mode";
    if (!isAutoplay) {
      togglePlay();
    }
  } else {
    modeToggleText.textContent = "Presentation Mode";
  }
  setTimeout(resizeCanvas, 50);
}

if (modeToggleBtn) {
  modeToggleBtn.addEventListener('click', toggleMode);
}

// ----------------------------------------------------
// Render and Resize Loop
// ----------------------------------------------------
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  const time = Date.now() * 0.001;
  
  // Floating editor ambient motion
  editorGroup.position.y = Math.sin(time * 1.2) * 0.15;
  
  // Wave stars slightly
  const positions = stars.geometry.attributes.position.array;
  for (let i = 1; i < positions.length; i += 3) {
    positions[i] += Math.sin(time + i) * 0.0015;
  }
  stars.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

window.addEventListener('resize', resizeCanvas);

// Initialize configuration & check presentation startup modes
const urlParams = new URLSearchParams(window.location.search);
const startNonInteractive = urlParams.get('mode') === 'presentation' || 
                            urlParams.get('mode') === 'non-interactive' || 
                            urlParams.get('interactive') === 'false';

if (startNonInteractive && dashboard) {
  dashboard.classList.add('non-interactive');
  if (modeToggleText) modeToggleText.textContent = "Interactive Mode";
  isAutoplay = true;
}

clearTerminalHistory();
goToStep(0);
animate();
