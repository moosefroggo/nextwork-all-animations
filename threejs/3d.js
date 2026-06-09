// 3D Git Showcase Script using Three.js

const container = document.getElementById('canvas-container');
const labelsContainer = document.getElementById('labels-container');
const terminalPopup = document.getElementById('terminal-popup');
const terminalText = document.getElementById('terminal-text');
const btnReplay = document.getElementById('btn-replay');
const btnToggleStyle = document.getElementById('btn-toggle-style');
const btnResetCam = document.getElementById('btn-reset-cam');

const width = 600;
const height = 450;

// // Three.js Core Variables
let scene, camera, renderer, controls;
let starfield;
let currentStyle = 'neoglow'; // 'neoglow' (Studio Slate & Copper) or 'minimal'
let activeBranch = 'main';

// Object groups and lists
let gridHelper;
let lights = {};
let meshes = {
    workingPlatform: null,
    stagingPlane: null,
    localPathMain: null,
    localPathFeature: null,
    remoteCloud: null,
    headTorus: null
};
let files = [];
let localCommits = [];
let remoteCommits = [];
let projectedLabels = []; // Tracks projected HTML overlays
let pushedHashes = new Set();

// Layout Coordinates
const WORK_POS = new THREE.Vector3(-2.8, -0.6, 0.5);
const STAGE_POS = new THREE.Vector3(0, 1.2, 0);
const LOCAL_Y = -0.8;
const MAIN_Z = 0;
const FEATURE_Z = 1.2;
const CLOUD_POS = new THREE.Vector3(2.6, 1.2, 0);

// Initialize Three.js Scene
function init() {
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 8);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
    controls.minDistance = 3;
    controls.maxDistance = 15;

    // Grid Helper (Subtle slate color)
    gridHelper = new THREE.GridHelper(20, 20, 0x3f3f46, 0x18181b);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // Initialize Lights (Studio rig)
    lights.ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(lights.ambient);

    // Warm Key Light (casts soft shadows)
    lights.dirWarm = new THREE.DirectionalLight(0xfff7ed, 1.3);
    lights.dirWarm.position.set(-5, 8, 3);
    lights.dirWarm.castShadow = true;
    lights.dirWarm.shadow.mapSize.width = 1024;
    lights.dirWarm.shadow.mapSize.height = 1024;
    lights.dirWarm.shadow.bias = -0.001;
    scene.add(lights.dirWarm);

    // Cool Fill Light
    lights.dirCool = new THREE.DirectionalLight(0xf0f9ff, 0.7);
    lights.dirCool.position.set(5, -2, -3);
    scene.add(lights.dirCool);

    // Backlight (Rim highlight)
    lights.pointRim = new THREE.PointLight(0xfffbeb, 1.0, 10);
    lights.pointRim.position.set(0, 3, -4);
    scene.add(lights.pointRim);

    // Starfield Particle System (Warm Dust Motes)
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 400;
    const starCoords = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
        starCoords[i] = (Math.random() - 0.5) * 16;
        starCoords[i+1] = (Math.random() - 0.5) * 12;
        starCoords[i+2] = (Math.random() - 0.5) * 12;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
    const starsMat = new THREE.PointsMaterial({
        color: 0xd97706, // Amber dust
        size: 0.08,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true
    });
    starfield = new THREE.Points(starsGeo, starsMat);
    // scene.add(starfield); // Debris disabled per user request

    // Build Static Geometries
    buildStaticScene();

    // Style Toggler Event Listener
    btnToggleStyle.addEventListener('click', toggleStyle);
    btnResetCam.addEventListener('click', resetCamera);
    btnReplay.addEventListener('click', runSequence);

    // Mouse Parallax Effect
    document.addEventListener('mousemove', (e) => {
        if (!camera || !scene) return;
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Subtle shift of scene position to create parallax without fighting controls
        scene.position.x = mouseX * 0.2;
        scene.position.y = mouseY * 0.2;
    });

    // Start Animation Loop
    animate();
}

// ----------------------------------------------------
// Material definitions for both styles
// ----------------------------------------------------
const materials = {
    neoglow: {
        working: () => new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9, metalness: 0.1 }),
        staging: () => new THREE.MeshPhysicalMaterial({
            color: 0xffffff, transparent: true, opacity: 0.15, transmission: 0.98, roughness: 0.1, metalness: 0.1, clearcoat: 1.0, side: THREE.DoubleSide
        }),
        timelineMain: () => new THREE.MeshStandardMaterial({ color: 0xd9f99d, roughness: 0.5, metalness: 0.1 }),
        timelineFeature: () => new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5, metalness: 0.1 }),
        fileCard: () => new THREE.MeshPhysicalMaterial({
            color: 0x0ea5e9, transparent: true, opacity: 0.8, roughness: 0.1, metalness: 0.1, transmission: 0.8, clearcoat: 1.0
        }),
        commitMain: () => new THREE.MeshStandardMaterial({ color: 0xd9f99d, roughness: 0.1, metalness: 0.1 }),
        commitFeature: () => new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.1, metalness: 0.1 }),
        cloud: () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, opacity: 1, transparent: true, roughness: 0.1, metalness: 0.1, clearcoat: 1.0 }),
        headTorus: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.1 }),
        lines: 0xd9f99d,
        cloudSyncLine: 0xd9f99d
    },
    minimal: {
        working: () => new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9, metalness: 0.1 }),
        staging: () => new THREE.MeshStandardMaterial({ color: 0x1f1f23, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
        timelineMain: () => new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 }),
        timelineFeature: () => new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 }),
        fileCard: () => new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9, metalness: 0.1 }),
        commitMain: () => new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.9 }),
        commitFeature: () => new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.9 }),
        cloud: () => new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.9 }),
        headTorus: () => new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 }),
        lines: 0x52525b,
        cloudSyncLine: 0x52525b
    }
};

function buildStaticScene() {
    const styleMats = materials[currentStyle];

    // Working Directory Platform (Left Box)
    const workGeo = new THREE.BoxGeometry(2, 0.1, 1.8);
    meshes.workingPlatform = new THREE.Mesh(workGeo, styleMats.working());
    meshes.workingPlatform.position.set(WORK_POS.x, WORK_POS.y - 0.1, WORK_POS.z);
    meshes.workingPlatform.receiveShadow = true;
    scene.add(meshes.workingPlatform);

    // Staging Plane (Center)
    const stageGeo = new THREE.PlaneGeometry(2.2, 1.6);
    meshes.stagingPlane = new THREE.Mesh(stageGeo, styleMats.staging());
    meshes.stagingPlane.position.copy(STAGE_POS);
    meshes.stagingPlane.rotation.x = -Math.PI / 12; // tilt slightly
    meshes.stagingPlane.receiveShadow = true;
    scene.add(meshes.stagingPlane);

    // Local Repository Main Branch Timeline Pipe
    const pathMain = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.2, LOCAL_Y, MAIN_Z),
        new THREE.Vector3(1.2, LOCAL_Y, MAIN_Z)
    ]);
    const timelineGeoMain = new THREE.TubeGeometry(pathMain, 20, 0.05, 8, false);
    meshes.localPathMain = new THREE.Mesh(timelineGeoMain, styleMats.timelineMain());
    meshes.localPathMain.castShadow = true;
    meshes.localPathMain.receiveShadow = true;
    scene.add(meshes.localPathMain);

    // Feature Timeline Pipe (Initially hidden/scaled to 0 in Y direction or added on branch action)
    const pathFeature = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.8, LOCAL_Y, MAIN_Z),
        new THREE.Vector3(-1.5, LOCAL_Y, FEATURE_Z / 2),
        new THREE.Vector3(-1.2, LOCAL_Y, FEATURE_Z),
        new THREE.Vector3(1.2, LOCAL_Y, FEATURE_Z)
    ]);
    const timelineGeoFeature = new THREE.TubeGeometry(pathFeature, 20, 0.05, 8, false);
    meshes.localPathFeature = new THREE.Mesh(timelineGeoFeature, styleMats.timelineFeature());
    meshes.localPathFeature.visible = false;
    meshes.localPathFeature.castShadow = true;
    meshes.localPathFeature.receiveShadow = true;
    scene.add(meshes.localPathFeature);

    // Remote Server Cloud Group (Right Side Cloud shape)
    meshes.remoteCloud = new THREE.Group();
    const sphereMat = styleMats.cloud();
    const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), sphereMat);
    sphere1.castShadow = true;
    sphere1.receiveShadow = true;
    const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), sphereMat);
    sphere2.position.set(0.4, -0.1, 0);
    sphere2.castShadow = true;
    sphere2.receiveShadow = true;
    const sphere3 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), sphereMat);
    sphere3.position.set(-0.4, -0.1, 0);
    sphere3.castShadow = true;
    sphere3.receiveShadow = true;
    meshes.remoteCloud.add(sphere1, sphere2, sphere3);
    meshes.remoteCloud.position.copy(CLOUD_POS);
    scene.add(meshes.remoteCloud);

    // HEAD Torus ring
    const torusGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 24);
    meshes.headTorus = new THREE.Mesh(torusGeo, styleMats.headTorus());
    meshes.headTorus.rotation.x = Math.PI / 2;
    meshes.headTorus.position.set(-3.2, LOCAL_Y + 0.3, MAIN_Z);
    meshes.headTorus.visible = false;
    meshes.headTorus.castShadow = true;
    scene.add(meshes.headTorus);

    // Add outline wireframes for Neo-Glow
    updateWireframeVisibility();
}

// Function to Toggle styles dynamically
function toggleStyle() {
    currentStyle = currentStyle === 'neoglow' ? 'minimal' : 'neoglow';
    btnToggleStyle.textContent = currentStyle === 'neoglow' ? 'Style: Studio Slate' : 'Style: Minimal Dark';
    btnToggleStyle.style.borderColor = currentStyle === 'neoglow' ? '#d97706' : '#444';
    btnToggleStyle.style.color = currentStyle === 'neoglow' ? '#f59e0b' : '#888';

    const styleMats = materials[currentStyle];

    // Update canvas background styling
    const frame = document.querySelector('.canvas-frame');
    if (currentStyle === 'neoglow') {
        frame.style.background = '#000000';
        gridHelper.material.color.setHex(0x333333);
        gridHelper.material.opacity = 0.5;
        lights.ambient.intensity = 0.2;
        lights.dirWarm.intensity = 2.0;
        lights.dirWarm.color.setHex(0xffffff);
        lights.dirCool.intensity = 0.5;
        lights.dirCool.color.setHex(0x0ea5e9);
        lights.pointRim.intensity = 2.0;
        lights.pointRim.color.setHex(0xd9f99d);
        if (starfield) starfield.visible = false;
    } else {
        frame.style.background = '#0d0d0f';
        gridHelper.material.color.setHex(0x222222);
        gridHelper.material.opacity = 0.4;
        lights.ambient.intensity = 0.8;
        lights.dirWarm.intensity = 1.2;
        lights.dirWarm.color.setHex(0xffffff);
        lights.dirCool.intensity = 0.0;
        lights.dirCool.color.setHex(0xffffff);
        lights.pointRim.intensity = 0.0;
        lights.pointRim.color.setHex(0xffffff);
        if (starfield) starfield.visible = false;
    }

    // Update Static Mesh Materials
    meshes.workingPlatform.material = styleMats.working();
    meshes.stagingPlane.material = styleMats.staging();
    meshes.localPathMain.material = styleMats.timelineMain();
    meshes.localPathFeature.material = styleMats.timelineFeature();
    meshes.headTorus.material = styleMats.headTorus();
 
    meshes.remoteCloud.children.forEach(c => {
        c.material = styleMats.cloud();
        c.material.wireframe = false; // Always solid copper/grey
    });
 
    // Update Dynamic Files Materials
    files.forEach(f => {
        f.mesh.material = styleMats.fileCard();
        if (currentStyle === 'neoglow') {
            f.mesh.children[0].visible = true; // show outlines
        } else {
            f.mesh.children[0].visible = false; // hide outlines
        }
    });
 
    // Update Local Commit node Materials
    localCommits.forEach(c => {
        c.mesh.material = c.branch === 'main' ? styleMats.commitMain() : styleMats.commitFeature();
    });
 
    updateWireframeVisibility();
}
 
function updateWireframeVisibility() {
    // Sharp border on staging plane for Brutalism style
    const isStudio = currentStyle === 'neoglow';
    
    if (meshes.stagingPlane) {
        let outline = meshes.stagingPlane.getObjectByName('outline');
        if (outline) meshes.stagingPlane.remove(outline);
        if (isStudio) {
            const borderGeo = new THREE.EdgesGeometry(meshes.stagingPlane.geometry);
            const borderMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 });
            const borderLines = new THREE.LineSegments(borderGeo, borderMat);
            borderLines.name = 'outline';
            meshes.stagingPlane.add(borderLines);
        }
    }
}

// Reset Camera coordinates to default setup
function resetCamera() {
    controls.reset();
    camera.position.set(0, 4, 8);
    controls.target.set(0, 0, 0);
}

// ----------------------------------------------------
// projected HTML Overlay Label Managers
// ----------------------------------------------------
function addLabel(mesh, text, type, yOffset = 25) {
    const el = document.createElement('div');
    const classes = type.split(' ').map(c => {
        if (c.endsWith('-label') || c === 'feature-branch') {
            return c;
        }
        return `${c}-label`;
    });
    el.className = `projected-label ${classes.join(' ')}`;
    if (type.includes('commit') && activeBranch === 'feature') {
        el.className += ' feature-label';
    }
    el.textContent = text;
    labelsContainer.appendChild(el);
    projectedLabels.push({ mesh, el, type, yOffset });
    // Trigger fade in animation frame
    setTimeout(() => el.classList.add('show'), 50);
    return el;
}

function removeLabel(mesh) {
    const index = projectedLabels.findIndex(l => l.mesh === mesh);
    if (index !== -1) {
        projectedLabels[index].el.remove();
        projectedLabels.splice(index, 1);
    }
}

function removeLabelByType(type) {
    for (let i = projectedLabels.length - 1; i >= 0; i--) {
        if (projectedLabels[i].type === type) {
            projectedLabels[i].el.remove();
            projectedLabels.splice(i, 1);
        }
    }
}

function updateLabels() {
    const tempV = new THREE.Vector3();
    projectedLabels.forEach(label => {
        label.mesh.getWorldPosition(tempV);
        tempV.project(camera);

        // check if node is behind camera frustum
        if (tempV.z > 1) {
            label.el.style.display = 'none';
            return;
        }
        label.el.style.display = 'block';

        const x = (tempV.x * .5 + .5) * width;
        const y = (-(tempV.y * .5) + .5) * height;

        label.el.style.left = `${x}px`;
        label.el.style.top = `${y - label.yOffset}px`;
    });
}

// ----------------------------------------------------
// Async Easing Animation / Tween Helper
// ----------------------------------------------------
function animateProperty(obj, start, end, duration, onUpdate) {
    return new Promise(resolve => {
        const startTime = performance.now();
        function tick() {
            const now = performance.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Cubic-out

            onUpdate(progress, ease);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                resolve();
            }
        }
        tick();
    });
}

// ----------------------------------------------------
// Simulated typing & popups sequence
// ----------------------------------------------------
function showPopup(text, duration = 1500) {
    return new Promise(resolve => {
        terminalText.textContent = text;
        terminalPopup.classList.add('show');
        setTimeout(() => {
            terminalPopup.classList.remove('show');
            setTimeout(resolve, 300);
        }, duration);
    });
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// ----------------------------------------------------
// File mesh instantiation
// ----------------------------------------------------
function createFileMesh(name, index) {
    const styleMats = materials[currentStyle];
    
    // Extrude a card shape with rounded corners
    const shape = new THREE.Shape();
    const w = 0.5, h = 0.65, r = 0.05;
    shape.moveTo(-w/2 + r, -h/2);
    shape.lineTo(w/2 - r, -h/2);
    shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
    shape.lineTo(w/2, h/2 - r);
    shape.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
    shape.lineTo(-w/2 + r, h/2);
    shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
    shape.lineTo(-w/2, -h/2 + r);
    shape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
    
    const fileMesh = new THREE.Mesh(fileGeo, styleMats.fileCard());
    fileMesh.rotation.x = -Math.PI / 2; // Lie flat
    fileMesh.castShadow = true;
    fileMesh.receiveShadow = true;
    
    // Add copper outlines for neoglow
    const edges = new THREE.EdgesGeometry(fileGeo);
    const borderLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
    borderLines.name = 'outline';
    borderLines.visible = (currentStyle === 'neoglow');
    fileMesh.add(borderLines);
    
    // Position offset index
    const zOffset = (index - 1) * 0.45;
    fileMesh.position.set(WORK_POS.x + (index - 1)*0.1, WORK_POS.y, WORK_POS.z + zOffset);
    scene.add(fileMesh);

    const label = addLabel(fileMesh, name, 'file', 20);

    return { mesh, name, index, label, initialZ: WORK_POS.z + zOffset };
}

// ----------------------------------------------------
// Auto Animation Workflow Runner
// ----------------------------------------------------
async function runSequence() {
    btnReplay.disabled = true;
    btnReplay.style.opacity = '0.5';

    // Clear previous dynamic meshes
    files.forEach(f => {
        scene.remove(f.mesh);
        removeLabel(f.mesh);
    });
    localCommits.forEach(c => {
        scene.remove(c.mesh);
        removeLabel(c.mesh);
        if (c.tagEl) removeLabel(c.mesh);
    });
    remoteCommits.forEach(c => {
        scene.remove(c.mesh);
        removeLabel(c.mesh);
    });
    removeLabelByType('branch-tag');
    removeLabelByType('head');
    
    files = [];
    localCommits = [];
    remoteCommits = [];
    projectedLabels = [];
    pushedHashes.clear();
    labelsContainer.innerHTML = '';
    
    meshes.localPathFeature.visible = false;
    meshes.headTorus.visible = false;
    activeBranch = 'main';
    resetCamera();

    await showPopup('Welcome to 3D Git Showcase!');

    // 1. Instantiate 3 Files in Working Directory
    const fileNames = ['index.js', 'style.css', 'api.ts'];
    fileNames.forEach((name, i) => {
        // Create files procedurally
        const shape = new THREE.Shape();
        const w = 0.4, h = 0.5, r = 0.05;
        shape.moveTo(-w/2 + r, -h/2);
        shape.lineTo(w/2 - r, -h/2);
        shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
        shape.lineTo(w/2, h/2 - r);
        shape.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
        shape.lineTo(-w/2 + r, h/2);
        shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
        shape.lineTo(-w/2, -h/2 + r);
        shape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
        
        const fileGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.002, bevelSegments: 3 });
        const fileMesh = new THREE.Mesh(fileGeo, materials[currentStyle].fileCard());
        fileMesh.rotation.x = -Math.PI / 2; // Lie flat
        fileMesh.castShadow = true;
        fileMesh.receiveShadow = true;
        
        const edges = new THREE.EdgesGeometry(fileGeo);
        const borderLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
        borderLines.name = 'outline';
        borderLines.visible = (currentStyle === 'neoglow');
        fileMesh.add(borderLines);
        
        const zOffset = (i - 1) * 0.45;
        fileMesh.position.set(WORK_POS.x + (i - 1) * 0.1, WORK_POS.y + 0.05, WORK_POS.z + zOffset);
        scene.add(fileMesh);
        
        const label = addLabel(fileMesh, name, 'file', 15);
        files.push({ mesh: fileMesh, name, index: i, zOffset, label });
    });

    await showPopup('Working Directory files modified.', 1500);

    // 2. git add . (Files fly up to Staging glass plane)
    await showPopup('git add .');
    
    // Zoom camera on staging area during staging
    animateProperty(camera.position, camera.position.clone(), new THREE.Vector3(0, 3, 5.5), 1000, (p, ease) => {
        camera.position.lerpVectors(camera.position.clone(), new THREE.Vector3(0, 3, 5.5), ease);
    });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const startPos = file.mesh.position.clone();
        // Target positioning on tilted Staging Plane
        const targetPos = new THREE.Vector3(
            STAGE_POS.x + (i - 1) * 0.55, 
            STAGE_POS.y + (i - 1) * 0.05, 
            STAGE_POS.z + (i - 1) * 0.1
        );
        const startRot = file.mesh.rotation.clone();

        await animateProperty(file.mesh.position, startPos, targetPos, 800, (p, ease) => {
            // Bezier curve height flight path
            file.mesh.position.x = startPos.x + (targetPos.x - startPos.x) * ease;
            file.mesh.position.y = startPos.y + (targetPos.y - startPos.y) * ease + Math.sin(p * Math.PI) * 0.6;
            file.mesh.position.z = startPos.z + (targetPos.z - startPos.z) * ease;
            // Align rotation with staging plane tilt
            file.mesh.rotation.x = startRot.x + (-Math.PI/12 - startRot.x) * ease;
        });
        await showPopup('Staged file: ' + file.name, 400);
    }
    await showPopup('All files staged in Index.', 1000);

    // 3. git commit (Files condense and drop to local timeline as a sphere)
    await showPopup('git commit -m "Initial commit"');

    // Pan camera to show Local timeline
    animateProperty(camera.position, camera.position.clone(), new THREE.Vector3(-1, 2, 5.5), 800, (p, ease) => {
        camera.position.lerpVectors(camera.position.clone(), new THREE.Vector3(-1, 2, 5.5), ease);
    });

    // Animate files shrinking to Staging center
    const shrinkTargets = [];
    files.forEach(f => {
        const startPos = f.mesh.position.clone();
        const targetPos = STAGE_POS.clone();
        shrinkTargets.push({ mesh: f.mesh, startPos, targetPos });
    });

    await animateProperty(null, null, null, 600, (p, ease) => {
        shrinkTargets.forEach(t => {
            t.mesh.position.lerpVectors(t.startPos, t.targetPos, ease);
            t.mesh.scale.set(1 - ease, 1 - ease, 1 - ease);
        });
    });

    // Delete file card meshes and overlays
    files.forEach(f => {
        scene.remove(f.mesh);
        removeLabel(f.mesh);
    });

    // Spawn commit node sphere dropping onto Local Timeline
    const commitHash1 = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    const commitGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const commitMesh1 = new THREE.Mesh(commitGeo, materials[currentStyle].commitMain());
    commitMesh1.position.set(-2.2, 2.0, MAIN_Z); // Drop from staging height
    commitMesh1.castShadow = true;
    scene.add(commitMesh1);
 
    const commitLabel1 = addLabel(commitMesh1, commitHash1, 'commit', 22);
 
    // Drop animation
    await animateProperty(commitMesh1.position, commitMesh1.position.clone(), new THREE.Vector3(-2.2, LOCAL_Y, MAIN_Z), 600, (p, ease) => {
        commitMesh1.position.y = 2.0 + (LOCAL_Y - 2.0) * ease;
    });
 
    // Make HEAD torus visible and slide to commit
    meshes.headTorus.position.set(-2.2, LOCAL_Y + 0.3, MAIN_Z);
    meshes.headTorus.visible = true;
    addLabel(meshes.headTorus, 'HEAD', 'head', 42);
 
    // Create Main Tag label
    const tagMainMesh = new THREE.Object3D();
    tagMainMesh.position.set(-2.2, LOCAL_Y, MAIN_Z);
    scene.add(tagMainMesh);
    const tagMainEl = addLabel(tagMainMesh, 'main', 'branch-tag', -22); // offset below commit node
    
    localCommits.push({ mesh: commitMesh1, hash: commitHash1, branch: 'main', tagMesh: tagMainMesh, tagEl: tagMainEl, x: -2.2, z: MAIN_Z });
 
    await showPopup('Commit saved to Main timeline.', 1500);
 
    // 4. git push origin main (Pulse sync path line to cloud)
    await showPopup('git push origin main');
    
    // Draw cloud syncing particle path line
    const syncCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.2, LOCAL_Y, MAIN_Z),
        new THREE.Vector3(0, 0.5, 0),
        CLOUD_POS
    ]);
    const syncGeo = new THREE.TubeGeometry(syncCurve, 20, 0.02, 8, false);
    const syncMesh = new THREE.Mesh(syncGeo, new THREE.MeshBasicMaterial({
        color: materials[currentStyle].cloudSyncLine,
        transparent: true,
        opacity: 0.8
    }));
    scene.add(syncMesh);

    await animateProperty(syncMesh.scale, new THREE.Vector3(0.01, 1, 1), new THREE.Vector3(1, 1, 1), 800, (p, ease) => {
        syncMesh.scale.x = ease;
    });
    
    await wait(400);
    scene.remove(syncMesh);

    // Spawn node in GitHub remote cloud list
    const remoteMesh1 = new THREE.Mesh(commitGeo, materials[currentStyle].commitMain());
    remoteMesh1.position.set(CLOUD_POS.x + 0.5, CLOUD_POS.y - 0.2, CLOUD_POS.z);
    remoteMesh1.castShadow = true;
    scene.add(remoteMesh1);
    addLabel(remoteMesh1, commitHash1, 'commit', 18);
    remoteCommits.push({ mesh: remoteMesh1, hash: commitHash1, branch: 'main' });
    pushedHashes.add(commitHash1);

    // Cloud sphere pulses glow
    if (currentStyle === 'neoglow') {
        animateProperty(null, null, null, 400, (p, ease) => {
            const pulse = 1 + Math.sin(p * Math.PI) * 0.2;
            meshes.remoteCloud.scale.set(pulse, pulse, pulse);
        });
    }

    await showPopup('Pushed successfully to GitHub.', 1500);

    // Reset files for branch work
    fileNames.forEach((name, i) => {
        const file = files[i];
        // Re-create file cards in working directory
        const zOffset = (i - 1) * 0.45;
        
        const shape = new THREE.Shape();
        const w = 0.4, h = 0.5, r = 0.05;
        shape.moveTo(-w/2 + r, -h/2);
        shape.lineTo(w/2 - r, -h/2);
        shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
        shape.lineTo(w/2, h/2 - r);
        shape.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
        shape.lineTo(-w/2 + r, h/2);
        shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
        shape.lineTo(-w/2, -h/2 + r);
        shape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
        
        const fileGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.002, bevelSegments: 3 });
        const fileMesh = new THREE.Mesh(fileGeo, materials[currentStyle].fileCard());
        fileMesh.rotation.x = -Math.PI / 2;
        fileMesh.castShadow = true;
        fileMesh.receiveShadow = true;
        
        const edges = new THREE.EdgesGeometry(fileGeo);
        const borderLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
        borderLines.name = 'outline';
        borderLines.visible = (currentStyle === 'neoglow');
        fileMesh.add(borderLines);
        
        fileMesh.position.set(WORK_POS.x + (i - 1) * 0.1, WORK_POS.y + 0.05, WORK_POS.z + zOffset);
        scene.add(fileMesh);
        
        const label = addLabel(fileMesh, name, 'file', 15);
        files[i] = { mesh: fileMesh, name, index: i, zOffset, label };
    });

    // 5. git branch feature (Sprout parallel timeline pipe in Z offset)
    await showPopup('git branch feature');
    
    meshes.localPathFeature.visible = true;
    // Animate path sliding out / scaling in Z axis offset direction
    await animateProperty(meshes.localPathFeature.scale, new THREE.Vector3(1, 0.01, 1), new THREE.Vector3(1, 1, 1), 800, (p, ease) => {
        meshes.localPathFeature.scale.z = ease;
    });

    // Spawn Feature Tag label next to main
    const tagFeatureMesh = new THREE.Object3D();
    tagFeatureMesh.position.set(-2.2, LOCAL_Y, MAIN_Z);
    scene.add(tagFeatureMesh);
    const tagFeatureEl = addLabel(tagFeatureMesh, 'feature', 'branch-tag-label feature-branch', -42); // offset below main tag to prevent overlap
    
    await showPopup('Parallel timeline "feature" created.', 1500);

    // 6. git checkout feature (Camera pans to Feature Lane, HEAD torus slides Z-axis)
    await showPopup('git checkout feature');

    // Pan camera to focus on feature branch lane
    animateProperty(camera.position, camera.position.clone(), new THREE.Vector3(-0.5, 2.5, 6.2), 800, (p, ease) => {
        camera.position.lerpVectors(camera.position.clone(), new THREE.Vector3(-0.5, 2.5, 6.2), ease);
    });

    // Shift HEAD torus to FEATURE Z axis coordinate
    await animateProperty(meshes.headTorus.position, meshes.headTorus.position.clone(), new THREE.Vector3(-2.2, LOCAL_Y + 0.3, FEATURE_Z), 600, (p, ease) => {
        meshes.headTorus.position.z = MAIN_Z + (FEATURE_Z - MAIN_Z) * ease;
    });

    // Highlight feature branch label active
    tagFeatureEl.style.borderWidth = '2px';
    tagFeatureEl.style.boxShadow = '0 0 15px #10b981';

    await wait(1000);

    // 7. Feature commit (Stage files -> Commit)
    await showPopup('Modifying files on feature branch...');
    await wait(1000);

    await showPopup('git add .');
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const startPos = file.mesh.position.clone();
        const targetPos = new THREE.Vector3(
            STAGE_POS.x + (i - 1) * 0.55, 
            STAGE_POS.y + (i - 1) * 0.05, 
            STAGE_POS.z + (i - 1) * 0.1
        );
        const startRot = file.mesh.rotation.clone();

        await animateProperty(file.mesh.position, startPos, targetPos, 600, (p, ease) => {
            file.mesh.position.x = startPos.x + (targetPos.x - startPos.x) * ease;
            file.mesh.position.y = startPos.y + (targetPos.y - startPos.y) * ease + Math.sin(p * Math.PI) * 0.6;
            file.mesh.position.z = startPos.z + (targetPos.z - startPos.z) * ease;
            file.mesh.rotation.x = startRot.x + (-Math.PI/12 - startRot.x) * ease;
        });
    }

    await wait(1000);

    await showPopup('git commit -m "Add new feature"');

    // Shrink staged files
    await animateProperty(null, null, null, 500, (p, ease) => {
        files.forEach(f => {
            f.mesh.position.lerp(STAGE_POS, ease);
            f.mesh.scale.set(1 - ease, 1 - ease, 1 - ease);
        });
    });

    files.forEach(f => {
        scene.remove(f.mesh);
        removeLabel(f.mesh);
    });

    // Spawn feature commit sphere dropping to feature timeline
    const commitHash2 = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    const commitMesh2 = new THREE.Mesh(commitGeo, materials[currentStyle].commitFeature());
    commitMesh2.position.set(-0.8, 2.0, FEATURE_Z); // Position offset to represent time progression
    commitMesh2.castShadow = true;
    scene.add(commitMesh2);
 
    const commitLabel2 = addLabel(commitMesh2, commitHash2, 'commit', 22);
 
    await animateProperty(commitMesh2.position, commitMesh2.position.clone(), new THREE.Vector3(-0.8, LOCAL_Y, FEATURE_Z), 600, (p, ease) => {
        commitMesh2.position.y = 2.0 + (LOCAL_Y - 2.0) * ease;
    });
 
    // Move HEAD torus to new feature commit
    removeLabel(meshes.headTorus);
    await animateProperty(meshes.headTorus.position, meshes.headTorus.position.clone(), new THREE.Vector3(-0.8, LOCAL_Y + 0.3, FEATURE_Z), 500, (p, ease) => {
        meshes.headTorus.position.x = -2.2 + (-0.8 - (-2.2)) * ease;
    });
    addLabel(meshes.headTorus, 'HEAD', 'head', 42);
 
    // Move feature branch tag label to the new commit node
    removeLabel(tagFeatureMesh);
    scene.remove(tagFeatureMesh);
    
    const tagFeatureMeshNew = new THREE.Object3D();
    tagFeatureMeshNew.position.set(-0.8, LOCAL_Y, FEATURE_Z);
    scene.add(tagFeatureMeshNew);
    const tagFeatureElNew = addLabel(tagFeatureMeshNew, 'feature', 'branch-tag-label feature-branch', -22);
 
    localCommits.push({ mesh: commitMesh2, hash: commitHash2, branch: 'feature', tagMesh: tagFeatureMeshNew, tagEl: tagFeatureElNew, x: -0.8, z: FEATURE_Z });
 
    await showPopup('Commit added to feature branch.', 1500);
 
    // 8. git checkout main (HEAD slides back Z-axis and X-axis)
    await showPopup('git checkout main');
 
    // Pan camera back to main timeline view
    animateProperty(camera.position, camera.position.clone(), new THREE.Vector3(-1, 2, 5.5), 800, (p, ease) => {
        camera.position.lerpVectors(camera.position.clone(), new THREE.Vector3(-1, 2, 5.5), ease);
    });
 
    // Move HEAD back to main branch tip (-2.2, main branch Y and Z)
    removeLabel(meshes.headTorus);
    await animateProperty(meshes.headTorus.position, meshes.headTorus.position.clone(), new THREE.Vector3(-2.2, LOCAL_Y + 0.3, MAIN_Z), 600, (p, ease) => {
        meshes.headTorus.position.x = -0.8 + (-2.2 - (-0.8)) * ease;
        meshes.headTorus.position.z = FEATURE_Z + (MAIN_Z - FEATURE_Z) * ease;
    });
    addLabel(meshes.headTorus, 'HEAD', 'head', 42);

    // Reset feature tag visual highlight
    tagFeatureElNew.style.borderWidth = '1px';
    tagFeatureElNew.style.boxShadow = 'none';

    await wait(1000);

    // 9. git merge feature (Main tag slides to join feature tag)
    await showPopup('git merge feature');
 
    // Drawing curved merge line in 3D
    const mergeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.8, LOCAL_Y, FEATURE_Z),
        new THREE.Vector3(-0.5, LOCAL_Y, FEATURE_Z / 2),
        new THREE.Vector3(-0.2, LOCAL_Y, MAIN_Z) // merges into main at X: -0.2
    ]);
    const mergeLineGeo = new THREE.TubeGeometry(mergeCurve, 10, 0.04, 8, false);
    const mergeLineMesh = new THREE.Mesh(mergeLineGeo, materials[currentStyle].timelineMain());
    scene.add(mergeLineMesh);
 
    // Spawn a merge commit node on Main branch at -0.2
    const mergeHash = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    const mergeMesh = new THREE.Mesh(commitGeo, materials[currentStyle].commitMain());
    mergeMesh.position.set(-0.2, LOCAL_Y, MAIN_Z);
    mergeMesh.castShadow = true;
    scene.add(mergeMesh);
    addLabel(mergeMesh, mergeHash, 'commit', 22);
 
    // Move HEAD to merge commit
    removeLabel(meshes.headTorus);
    await animateProperty(meshes.headTorus.position, meshes.headTorus.position.clone(), new THREE.Vector3(-0.2, LOCAL_Y + 0.3, MAIN_Z), 500, (p, ease) => {
        meshes.headTorus.position.x = -2.2 + (-0.2 - (-2.2)) * ease;
    });
    addLabel(meshes.headTorus, 'HEAD', 'head', 42);
 
    // Move main branch tag to align with merge commit
    removeLabel(tagMainMesh);
    scene.remove(tagMainMesh);
    
    const tagMainMeshNew = new THREE.Object3D();
    tagMainMeshNew.position.set(-0.2, LOCAL_Y, MAIN_Z);
    scene.add(tagMainMeshNew);
    const tagMainElNew = addLabel(tagMainMeshNew, 'main', 'branch-tag-label', -22);
 
    localCommits.push({ mesh: mergeMesh, hash: mergeHash, branch: 'main', tagMesh: tagMainMeshNew, tagEl: tagMainElNew, x: -0.2, z: MAIN_Z });
 
    await showPopup('Fast-forward merge complete.', 1500);
 
    // 10. Simulate remote change (Collaborator pushes to GitHub remote server)
    await showPopup('Remote repository updated by collaborator...', 1800);
 
    const pushHashCollaborator = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    
    // Spawn collaborator commit in remote cloud container
    const remoteMesh2 = new THREE.Mesh(commitGeo, materials[currentStyle].commitMain());
    // Position it stacked above the previous remote commit
    remoteMesh2.position.set(CLOUD_POS.x + 0.5, CLOUD_POS.y + 0.3, CLOUD_POS.z);
    remoteMesh2.castShadow = true;
    scene.add(remoteMesh2);
    
    const remoteLabel2 = addLabel(remoteMesh2, pushHashCollaborator, 'commit', 18);
    remoteCommits.push({ mesh: remoteMesh2, hash: pushHashCollaborator, branch: 'main' });
 
    // Cloud sphere pulses
    if (currentStyle === 'neoglow') {
        animateProperty(null, null, null, 400, (p, ease) => {
            const scale = 1 + Math.sin(p * Math.PI) * 0.15;
            meshes.remoteCloud.scale.set(scale, scale, scale);
        });
    }
 
    await wait(1500);
 
    // 11. git pull (Sync particle line back, pulse files, local node created)
    await showPopup('git pull');
 
    // Draw pull particle curve path line from Cloud to local main branch
    const pullCurve = new THREE.CatmullRomCurve3([
        CLOUD_POS,
        new THREE.Vector3(0.5, 0.5, 0),
        new THREE.Vector3(0.5, LOCAL_Y, MAIN_Z) // lands at new local position X: 0.5
    ]);
    const pullGeo = new THREE.TubeGeometry(pullCurve, 20, 0.02, 8, false);
    const pullMesh = new THREE.Mesh(pullGeo, new THREE.MeshBasicMaterial({
        color: materials[currentStyle].cloudSyncLine,
        transparent: true,
        opacity: 0.8
    }));
    scene.add(pullMesh);
 
    await animateProperty(pullMesh.scale, new THREE.Vector3(0.01, 1, 1), new THREE.Vector3(1, 1, 1), 800, (p, ease) => {
        pullMesh.scale.x = ease;
    });
 
    await wait(400);
    scene.remove(pullMesh);
 
    // Spawn local commit node for pulled change at X: 0.5
    const localMeshPulled = new THREE.Mesh(commitGeo, materials[currentStyle].commitMain());
    localMeshPulled.position.set(0.5, LOCAL_Y, MAIN_Z);
    localMeshPulled.castShadow = true;
    scene.add(localMeshPulled);
    addLabel(localMeshPulled, pushHashCollaborator, 'commit', 22);
 
    // Move HEAD to the new pulled commit
    removeLabel(meshes.headTorus);
    await animateProperty(meshes.headTorus.position, meshes.headTorus.position.clone(), new THREE.Vector3(0.5, LOCAL_Y + 0.3, MAIN_Z), 500, (p, ease) => {
        meshes.headTorus.position.x = -0.2 + (0.5 - (-0.2)) * ease;
    });
    addLabel(meshes.headTorus, 'HEAD', 'head', 42);
 
    // Move main branch tag to align with pulled commit
    removeLabel(tagMainMeshNew);
    scene.remove(tagMainMeshNew);
    
    const tagMainMeshPulled = new THREE.Object3D();
    tagMainMeshPulled.position.set(0.5, LOCAL_Y, MAIN_Z);
    scene.add(tagMainMeshPulled);
    const tagMainElPulled = addLabel(tagMainMeshPulled, 'main', 'branch-tag-label', -22);

    localCommits.push({ mesh: localMeshPulled, hash: pushHashCollaborator, branch: 'main', tagMesh: tagMainMeshPulled, tagEl: tagMainElPulled, x: 0.5, z: MAIN_Z });

    await showPopup('Local branch updated from remote repository.', 2000);

    await showPopup('Showcase sequence complete! Try orbiting or changing style.');

    btnReplay.disabled = false;
    btnReplay.style.opacity = '1';
}

// ----------------------------------------------------
// Animation Tick loop
// ----------------------------------------------------
function animate() {
    requestAnimationFrame(animate);
 
    // Update controls
    controls.update();
 
    // Slow autopilot rotation of scene when user is not dragging controls
    if (!controls.state === -1) {
        // user is not interacting, slowly rotate scene base group
    }
 
    const time = performance.now() * 0.0015;
 
    // Gentle floating bobble animation for HEAD torus ring
    if (meshes.headTorus && meshes.headTorus.visible) {
        meshes.headTorus.position.y = LOCAL_Y + 0.3 + Math.sin(time * 2) * 0.05;
        meshes.headTorus.rotation.z = time * 0.4;
    }
 
    // Floating animation for platforms & remote cloud
    if (currentStyle === 'neoglow') {
        if (meshes.workingPlatform) {
            meshes.workingPlatform.position.y = WORK_POS.y - 0.1 + Math.sin(time) * 0.04;
        }
        if (meshes.stagingPlane) {
            meshes.stagingPlane.position.y = STAGE_POS.y + Math.cos(time * 0.8) * 0.03;
        }
        if (meshes.remoteCloud) {
            meshes.remoteCloud.position.y = CLOUD_POS.y + Math.sin(time * 1.2) * 0.05;
            // Move child spheres slightly relative to each other
            meshes.remoteCloud.children.forEach((c, idx) => {
                if (idx > 0) {
                    c.position.y = -0.1 + Math.sin(time + idx * 1.5) * 0.04;
                }
            });
        }
        
        // Slowly drift particles
        if (starfield && starfield.visible) {
            const positions = starfield.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] -= 0.003; // fall slowly
                if (positions[i] < -7) {
                    positions[i] = 8; // loop back to top
                }
            }
            starfield.geometry.attributes.position.needsUpdate = true;
            starfield.rotation.y += 0.0003;
        }
    } else {
        // Reset positions for minimal style
        if (meshes.workingPlatform) meshes.workingPlatform.position.y = WORK_POS.y - 0.1;
        if (meshes.stagingPlane) meshes.stagingPlane.position.y = STAGE_POS.y;
        if (meshes.remoteCloud) {
            meshes.remoteCloud.position.y = CLOUD_POS.y;
            meshes.remoteCloud.children.forEach((c, idx) => {
                if (idx > 0) {
                    c.position.y = -0.1;
                }
            });
        }
    }
 
    // Re-project overlays positions from 3D space to HTML overlay coordinate layer
    updateLabels();
 
    // Render scene
    renderer.render(scene, camera);
}

// Initialize layout on browser load
window.addEventListener('load', () => {
    init();
    runSequence();
});
