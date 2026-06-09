import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import gsap from 'gsap';

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
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x90b0d0, 0.5);
fillLight.position.set(-20, 20, 20);
scene.add(fillLight);

// Common Materials
const baseMat = new THREE.MeshStandardMaterial({ color: '#2a2d32', roughness: 0.8, metalness: 0.2 });
const baseAccentMat = new THREE.MeshStandardMaterial({ color: '#1a1d21', roughness: 0.9, metalness: 0.1 });
const copperMat = new THREE.MeshStandardMaterial({ color: '#d18b60', roughness: 0.3, metalness: 0.8 });
const greenGlowMat = new THREE.MeshStandardMaterial({ color: '#8fff9f', emissive: '#1f5a33', emissiveIntensity: 0.8, roughness: 0.2 });
const orangeGlowMat = new THREE.MeshStandardMaterial({ color: '#ffcbaa', emissive: '#aa5522', emissiveIntensity: 0.8, roughness: 0.2 });
const glassMat = new THREE.MeshPhysicalMaterial({ color: '#66cca0', metalness: 0.1, roughness: 0.1, transmission: 0.8, thickness: 0.5, transparent: true });
const fileMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

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

const deskTop = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 2), copperMat);
deskTop.position.set(0, 3.5, 0);
deskTop.castShadow = true;
workGroup.add(deskTop);
const deskLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 2), copperMat);
deskLeg1.position.set(-1.8, 2.75, 0);
workGroup.add(deskLeg1);
const deskLeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 2), copperMat);
deskLeg2.position.set(1.8, 2.75, 0);
workGroup.add(deskLeg2);

const monitorBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.4), copperMat);
monitorBase.position.set(0, 3.65, -0.5);
workGroup.add(monitorBase);
const monitorNeck = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), copperMat);
monitorNeck.position.set(0, 3.8, -0.5);
workGroup.add(monitorNeck);
const monitorScreen = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 0.1), new THREE.MeshStandardMaterial({color: '#111'}));
monitorScreen.position.set(0, 4.2, -0.4);
workGroup.add(monitorScreen);
const codeScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), new THREE.MeshBasicMaterial({color: '#2b2b2b'}));
codeScreen.position.set(0, 4.2, -0.34);
workGroup.add(codeScreen);

// File Icon (file.txt)
const fileObj = new THREE.Group();
const fileMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.2), fileMat);
fileObj.add(fileMesh);
const fileLabel = createLabel('file.txt', 'label file-label', new THREE.Vector3(0, 0.8, 0));
fileObj.add(fileLabel);
fileObj.position.set(-12, 4.2, 7.6); // Slightly above desk in Work area
fileObj.rotation.x = -Math.PI / 4;
fileObj.scale.set(0, 0, 0); // Hidden initially
scene.add(fileObj);

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
const localBase = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 6), baseMat);
localBase.position.y = 1.25;
localBase.castShadow = true;
localBase.receiveShadow = true;
localGroup.add(localBase);
const localGitBase = new THREE.Mesh(new THREE.BoxGeometry(10.2, 1, 6.2), baseAccentMat.clone());
localGitBase.position.y = 1.25;
localGroup.add(localGitBase);
localGroup.add(createLabel('3. LOCAL<br>REPOSITORY<br><span class="title-sub">(HEAD)</span>', 'label title-label', new THREE.Vector3(8, 0.5, 0)));

// Commits Array for Animation
const commits = [];
function createCommitBlock(xOffset, yOffset, zOffset = 0, width = 4, mat = copperMat.clone()) {
  const group = new THREE.Group();
  const commit = new THREE.Mesh(new THREE.BoxGeometry(width, 1.2, 4), mat);
  commit.position.set(0, 0, 0);
  commit.castShadow = true;
  group.add(commit);
  group.position.set(xOffset, yOffset, zOffset);
  group.scale.set(0, 0, 0); // Hidden
  localGroup.add(group);
  return { group, mesh: commit };
}

commits.push(createCommitBlock(0, 3.2, 0, 4)); // 0: C1 (main)
commits.push(createCommitBlock(3, 4.8, -2, 4)); // 1: C2 (feature branch)
commits.push(createCommitBlock(0, 6.4, 0, 6)); // 2: M1 (merge commit)


// 4. Remote Repository
const remoteGroup = new THREE.Group();
remoteGroup.position.set(20, 8, -6);
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


// Pipes
function createPipe(points, material) {
  const path = new THREE.CurvePath();
  for(let i=0; i<points.length-1; i++) {
    path.add(new THREE.LineCurve3(points[i], points[i+1]));
  }
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
  const geometry = new THREE.TubeGeometry(curve, 64, 0.4, 16, false);
  const pipe = new THREE.Mesh(geometry, material);
  pipe.castShadow = true;
  return pipe;
}

const pipes = new THREE.Group();
scene.add(pipes);

// 1. git init label
const initLabel = createLabel('git init', 'label action-label', new THREE.Vector3(-12, 2.5, 8));
initLabel.element.style.opacity = '0';
scene.add(initLabel);

// 2. git add (Working Directory -> Staging Area)
const addPipeMat = greenGlowMat.clone();
addPipeMat.emissiveIntensity = 0.15;
const addPipePoints = [new THREE.Vector3(-8, 1, 4), new THREE.Vector3(-4, 1, 4), new THREE.Vector3(-4, 1, -3)];
pipes.add(createPipe(addPipePoints, addPipeMat));
const addLabel = createLabel('git add', 'label action-label', new THREE.Vector3(-6, 2, 0));
addLabel.element.style.opacity = '0';
scene.add(addLabel);

// 3. git commit (Staging Area -> Local Repository)
const commitPipeMat = greenGlowMat.clone();
commitPipeMat.emissiveIntensity = 0.15;
const commitPipePoints = [new THREE.Vector3(-1, 1, -6), new THREE.Vector3(6, 1, -6), new THREE.Vector3(6, 1, 3)];
pipes.add(createPipe(commitPipePoints, commitPipeMat));
const commitLabel = createLabel('git commit', 'label action-label', new THREE.Vector3(2.5, 2, -6));
commitLabel.element.style.opacity = '0';
scene.add(commitLabel);

// 4. git checkout -b feature / branching pipe (Staging Area -> Local Repository Feature branch offset)
const branchPipeMat = greenGlowMat.clone();
branchPipeMat.emissiveIntensity = 0.15;
const branchPipePoints = [new THREE.Vector3(-1, 1, -6), new THREE.Vector3(9, 1, -6), new THREE.Vector3(9, 1, 3)];
pipes.add(createPipe(branchPipePoints, branchPipeMat));
const checkoutLabel = createLabel('git checkout -b feature', 'label action-label', new THREE.Vector3(6, 2.5, 10));
checkoutLabel.element.style.opacity = '0';
scene.add(checkoutLabel);

// 5. git merge feature label
const mergeLabel = createLabel('git merge feature', 'label action-label', new THREE.Vector3(6, 4.5, 10));
mergeLabel.element.style.opacity = '0';
scene.add(mergeLabel);

// 6. git push (Local Repository -> Remote Repository)
const pushPipeMat = orangeGlowMat.clone();
pushPipeMat.emissiveIntensity = 0.15;
const pushPipePoints = [new THREE.Vector3(11, 1, 6), new THREE.Vector3(16, 1, 6), new THREE.Vector3(18, 8, 2), new THREE.Vector3(18, 8, -2)];
pipes.add(createPipe(pushPipePoints, pushPipeMat));
const pushLabel = createLabel('git push', 'label action-label', new THREE.Vector3(15, 4.5, 4));
pushLabel.element.style.opacity = '0';
scene.add(pushLabel);

// 7. git pull (Remote Repository -> Local Repository / Working Directory)
const pullPipeMat = orangeGlowMat.clone();
pullPipeMat.emissiveIntensity = 0.15;
const pullPipePoints = [
  new THREE.Vector3(18, 8, -2),
  new THREE.Vector3(18, 8, 2),
  new THREE.Vector3(16, 1, 8),
  new THREE.Vector3(9, 1, 8)
];
pipes.add(createPipe(pullPipePoints, pullPipeMat));
const pullLabel = createLabel('git pull', 'label action-label', new THREE.Vector3(17, 4.5, 5));
pullLabel.element.style.opacity = '0';
scene.add(pullLabel);


// GSAP Animation Timeline
const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

// Step 1: git init
tl.to(initLabel.element, { opacity: 1, duration: 0.3 })
  .to(workBaseAccent.material.color, { r: 0, g: 0.95, b: 1.0, duration: 0.5, yoyo: true, repeat: 1 })
  .to(localGitBase.material.color, { r: 0, g: 0.95, b: 1.0, duration: 0.5, yoyo: true, repeat: 1 }, "<")
  .to(initLabel.element, { opacity: 0, duration: 0.3 }, "+=0.6")
  .to(workBaseAccent.material.color, { r: 0.1, g: 0.11, b: 0.13, duration: 0.1 }, "<")
  .to(localGitBase.material.color, { r: 0.1, g: 0.11, b: 0.13, duration: 0.1 }, "<")

// Step 2: git add (moves file from Work to Stage)
  .to(fileObj.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(1.7)" })
  .to(addLabel.element, { opacity: 1, duration: 0.3 })
  .to(addPipeMat, { emissiveIntensity: 2.2, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" }, "<")
  .to(fileObj.position, { x: -4, y: 3.5, z: -6, duration: 1.2, ease: "power1.inOut" }, "<")
  .to(addLabel.element, { opacity: 0, duration: 0.3 }, "+=0.2")

// Step 3: git commit (creates C1 on main)
  .to(commitLabel.element, { opacity: 1, duration: 0.3 })
  .to(commitPipeMat, { emissiveIntensity: 2.2, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" }, "<")
  .to(fileObj.scale, { x: 0, y: 0, z: 0, duration: 0.4 }, "<")
  .to(commits[0].group.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "bounce.out" }, "<+=0.4")
  .to(commitLabel.element, { opacity: 0, duration: 0.3 }, "+=0.2")
  .to(fileObj.position, { x: -12, y: 4.2, z: 7.6, duration: 0 }, "<")

// Step 4: git checkout -b feature & commit C2
  .to(checkoutLabel.element, { opacity: 1, duration: 0.3 })
  .to(fileObj.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(1.7)" }, "<")
  .to(branchPipeMat, { emissiveIntensity: 2.2, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" })
  .to(fileObj.position, { x: -4, y: 3.5, z: -6, duration: 1.2, ease: "power1.inOut" }, "<")
  .to(commits[1].group.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "bounce.out" }, "+=0.2")
  .to(fileObj.scale, { x: 0, y: 0, z: 0, duration: 0.4 }, "<")
  .to(checkoutLabel.element, { opacity: 0, duration: 0.3 }, "<")
  .to(fileObj.position, { x: -12, y: 4.2, z: 7.6, duration: 0 }, "<")

// Step 5: git merge feature
  .to(mergeLabel.element, { opacity: 1, duration: 0.3 })
  .to([commitPipeMat, branchPipeMat], { emissiveIntensity: 2.2, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" }, "<")
  .to(commits[2].group.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "bounce.out" }, "+=0.3")
  .to(mergeLabel.element, { opacity: 0, duration: 0.3 }, "+=0.2")

// Step 6: git push
  .to(pushLabel.element, { opacity: 1, duration: 0.3 })
  .to(pushPipeMat, { emissiveIntensity: 2.2, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" }, "<")
  .to(remoteCommits.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: "power2.out" }, "<+=0.4")
  .to(pushLabel.element, { opacity: 0, duration: 0.3 }, "+=0.4")

// Step 7: git pull
  .to(pullLabel.element, { opacity: 1, duration: 0.3 })
  .to(pullPipeMat, { emissiveIntensity: 2.2, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" }, "<")
  .to(pullLabel.element, { opacity: 0, duration: 0.3 }, "+=1.5")

  // Reset loop state
  .to(remoteCommits.scale, { x: 0, y: 0, z: 0, duration: 0.5 })
  .to(commits[0].group.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, "<")
  .to(commits[1].group.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, "<")
  .to(commits[2].group.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, "<");

// Remote Commits Group
const remoteCommits = new THREE.Group();
remoteCommits.position.set(20, 8.75, -6);
remoteCommits.scale.set(0, 0, 0);
platforms.add(remoteCommits);

// Simplified remote commits matching Local layout
const c1R = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 4), copperMat);
c1R.position.set(0, 0, 0);
c1R.castShadow = true;
remoteCommits.add(c1R);

const c2R = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 4), copperMat);
c2R.position.set(3, 1.6, -2);
c2R.castShadow = true;
remoteCommits.add(c2R);

const m1R = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 4), copperMat);
m1R.position.set(0, 3.2, 0);
m1R.castShadow = true;
remoteCommits.add(m1R);


// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  // Ambient floating
  const time = Date.now() * 0.001;
  cloudGroup.position.y = 3 + Math.sin(time * 2) * 0.2;

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
