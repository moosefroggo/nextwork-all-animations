import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Setup Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#14161a');

// Setup Camera
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 35;
const camera = new THREE.OrthographicCamera(
  frustumSize * aspect / -2, frustumSize * aspect / 2, 
  frustumSize / 2, frustumSize / -2, 
  1, 1000
);
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

// Setup Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.querySelector('#app').appendChild(renderer.domElement);

// CSS2D Renderer for Labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.querySelector('#app').appendChild(labelRenderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(20, 40, -10);
dirLight.castShadow = true;
dirLight.shadow.camera.left = -30;
dirLight.shadow.camera.right = 30;
dirLight.shadow.camera.top = 30;
dirLight.shadow.camera.bottom = -30;
dirLight.shadow.bias = -0.001;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x90b0d0, 0.5);
fillLight.position.set(-20, 20, 20);
scene.add(fillLight);

// Common Materials
const baseMat = new THREE.MeshStandardMaterial({ 
  color: '#2a2d32', roughness: 0.8, metalness: 0.2 
});
const baseAccentMat = new THREE.MeshStandardMaterial({ 
  color: '#1a1d21', roughness: 0.9, metalness: 0.1 
});
const copperMat = new THREE.MeshStandardMaterial({ 
  color: '#d18b60', roughness: 0.3, metalness: 0.8 
});
const greenGlowMat = new THREE.MeshStandardMaterial({ 
  color: '#8fff9f', emissive: '#1f5a33', emissiveIntensity: 0.8, roughness: 0.2 
});
const orangeGlowMat = new THREE.MeshStandardMaterial({ 
  color: '#ffcbaa', emissive: '#aa5522', emissiveIntensity: 0.8, roughness: 0.2 
});
const glassMat = new THREE.MeshPhysicalMaterial({ 
  color: '#66cca0', metalness: 0.1, roughness: 0.1, 
  transmission: 0.8, thickness: 0.5, transparent: true 
});

// Helper Function: Create Label
function createLabel(text, className, position) {
  const div = document.createElement('div');
  div.className = className;
  div.innerHTML = text;
  const label = new CSS2DObject(div);
  label.position.copy(position);
  return label;
}

// Background Grid Lines
const gridHelper = new THREE.GridHelper(100, 50, 0x334455, 0x223344);
gridHelper.position.y = -1;
scene.add(gridHelper);

// --- Platforms Setup ---
const platforms = new THREE.Group();
scene.add(platforms);

// 1. Working Directory
const workGroup = new THREE.Group();
workGroup.position.set(-12, 0, 8);
platforms.add(workGroup);

const workBase = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 8), baseMat);
workBase.position.y = 1;
workBase.castShadow = true;
workBase.receiveShadow = true;
workGroup.add(workBase);

const workBaseAccent = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.5, 8.2), baseAccentMat);
workBaseAccent.position.y = 0.5;
workGroup.add(workBaseAccent);

workGroup.add(createLabel('1. WORKING<br>REPOSITORY<br><span class="title-sub">(PC Icon)</span>', 'label title-label', new THREE.Vector3(-7, 0.5, 0)));

// Create a small desk
const deskMat = copperMat;
const deskTop = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 2), deskMat);
deskTop.position.set(0, 3.5, 0);
deskTop.castShadow = true;
workGroup.add(deskTop);
const deskLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 2), deskMat);
deskLeg1.position.set(-1.8, 2.75, 0);
workGroup.add(deskLeg1);
const deskLeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 2), deskMat);
deskLeg2.position.set(1.8, 2.75, 0);
workGroup.add(deskLeg2);

// PC Monitor
const monitorMat = new THREE.MeshStandardMaterial({color: '#111'});
const monitorBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.4), deskMat);
monitorBase.position.set(0, 3.65, -0.5);
workGroup.add(monitorBase);
const monitorNeck = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), deskMat);
monitorNeck.position.set(0, 3.8, -0.5);
workGroup.add(monitorNeck);
const monitorScreen = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 0.1), monitorMat);
monitorScreen.position.set(0, 4.2, -0.4);
workGroup.add(monitorScreen);
const codeScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), new THREE.MeshBasicMaterial({color: '#4fba73'}));
codeScreen.position.set(0, 4.2, -0.34);
workGroup.add(codeScreen);

// 2. Staging Area
const stageGroup = new THREE.Group();
stageGroup.position.set(-4, 0, -6);
platforms.add(stageGroup);

const stageBase = new THREE.Mesh(new THREE.BoxGeometry(6, 1.5, 6), baseMat);
stageBase.position.y = 0.75;
stageBase.receiveShadow = true;
stageGroup.add(stageBase);

const glassBox = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), glassMat);
glassBox.position.y = 3.5;
glassBox.castShadow = true;
stageGroup.add(glassBox);

stageGroup.add(createLabel('2. STAGING AREA<br><span class="title-sub">(Index)</span>', 'label title-label', new THREE.Vector3(-6, 0.5, 0)));

// 3. Local Repository
const localGroup = new THREE.Group();
localGroup.position.set(6, 0, 6);
platforms.add(localGroup);

const localBase = new THREE.Mesh(new THREE.BoxGeometry(6, 2.5, 6), baseMat);
localBase.position.y = 1.25;
localBase.castShadow = true;
localBase.receiveShadow = true;
localGroup.add(localBase);

const localGitBase = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1, 6.2), baseAccentMat);
localGitBase.position.y = 1.25;
localGroup.add(localGitBase);

// Add commits
const commitMat = copperMat;
for(let i=0; i<4; i++) {
  const commit = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 4), commitMat);
  commit.position.y = 3.5 + (i * 1.3);
  commit.castShadow = true;
  localGroup.add(commit);
  
  const commitLabels = ["C1 (init)", "C2 (fix)<br><span class='commit-subtext'>some description</span>", "C3 (feat)<br><span class='commit-subtext'>sort description</span>", "A (feat)<br><span class='commit-subtext'>new description</span>"];
  localGroup.add(createLabel(`<div class="commit-text">${commitLabels[i]}</div>`, 'label', new THREE.Vector3(2.1, 3.5 + (i * 1.3), 0)));
}

localGroup.add(createLabel('3. LOCAL<br>REPOSITORY<br><span class="title-sub">(HEAD)</span>', 'label title-label', new THREE.Vector3(6, 0.5, 0)));

// 4. Remote Repository
const remoteGroup = new THREE.Group();
remoteGroup.position.set(16, 8, -6);
platforms.add(remoteGroup);

const remoteBase = new THREE.Mesh(new THREE.BoxGeometry(10, 1.5, 8), baseMat);
remoteBase.position.y = 0.75;
remoteBase.castShadow = true;
remoteBase.receiveShadow = true;
remoteGroup.add(remoteBase);

const cloudGroup = new THREE.Group();
cloudGroup.position.set(0, 3, 0);
remoteGroup.add(cloudGroup);

const c1 = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 4), copperMat);
c1.castShadow = true;
cloudGroup.add(c1);
const c2 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 4, 16), copperMat);
c2.rotation.x = Math.PI/2;
c2.position.set(-3, 0, 0);
cloudGroup.add(c2);
const c3 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 4, 16), copperMat);
c3.rotation.x = Math.PI/2;
c3.position.set(3, 0, 0);
cloudGroup.add(c3);
const c4 = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 4, 16), copperMat);
c4.rotation.x = Math.PI/2;
c4.position.set(0, 1.5, 0);
cloudGroup.add(c4);

remoteGroup.add(createLabel('4. REMOTE<br>REPOSITORY<br><span class="title-sub">(origin)</span>', 'label title-label', new THREE.Vector3(8, 0.5, 0)));


// --- PIPES ---
function createPipe(points, material) {
  const path = new THREE.CurvePath();
  // Use quadratic bezier curves for softer corners
  for(let i=0; i<points.length-1; i++) {
    path.add(new THREE.LineCurve3(points[i], points[i+1]));
  }
  // CatmullRomCurve3 is better for smooth glowing tubes
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
  const geometry = new THREE.TubeGeometry(curve, 64, 0.4, 16, false);
  const pipe = new THREE.Mesh(geometry, material);
  pipe.castShadow = true;
  return pipe;
}

const pipes = new THREE.Group();
scene.add(pipes);

// git add (Work -> Stage)
pipes.add(createPipe([
  new THREE.Vector3(-8, 1, 4),
  new THREE.Vector3(-4, 1, 4),
  new THREE.Vector3(-4, 1, -3)
], greenGlowMat));
scene.add(createLabel('git add', 'label action-label', new THREE.Vector3(-6, 2, 0)));

// git commit (Stage -> Local)
pipes.add(createPipe([
  new THREE.Vector3(-1, 1, -6),
  new THREE.Vector3(6, 1, -6),
  new THREE.Vector3(6, 1, 3)
], greenGlowMat));
scene.add(createLabel('git commit', 'label action-label', new THREE.Vector3(2.5, 2, -6)));

// git commit -a (Work -> Local)
pipes.add(createPipe([
  new THREE.Vector3(-8, 1, 8),
  new THREE.Vector3(-4, 1, 8),
  new THREE.Vector3(-4, 1, 12),
  new THREE.Vector3(2, 1, 12),
  new THREE.Vector3(2, 1, 6)
], greenGlowMat));
scene.add(createLabel('git commit -a', 'label action-label', new THREE.Vector3(-1, 2, 12)));

// git push (Local -> Remote)
pipes.add(createPipe([
  new THREE.Vector3(9, 1, 6),
  new THREE.Vector3(12, 1, 6),
  new THREE.Vector3(14, 8, 2),
  new THREE.Vector3(14, 8, -2)
], orangeGlowMat));
scene.add(createLabel('git push', 'label action-label', new THREE.Vector3(11, 4.5, 4)));

// git pull/fetch (Remote -> Work/Local)
pipes.add(createPipe([
  new THREE.Vector3(18, 8, -2),
  new THREE.Vector3(18, 8, 2),
  new THREE.Vector3(16, 1, 8),
  new THREE.Vector3(9, 1, 8)
], orangeGlowMat));
scene.add(createLabel('git pull / git fetch', 'label action-label', new THREE.Vector3(17, 4.5, 5)));


// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = -frustumSize * aspect / 2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
