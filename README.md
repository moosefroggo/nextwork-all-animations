# Nextwork Animation Gallery

A collection of interactive git workflow animations built for Nextwork. Browse all animations at once via the split-pane gallery (`index.html`), or open any file directly.

---

## Three.js Animations

Located in the `/threejs/` folder. These are WebGL-powered 3D scenes built with [Three.js](https://threejs.org).

### 3D Git Visualizer
**File:** `threejs/3d.html`
A 3D spatial representation of a git repository. Commits, branches, and merges are rendered as nodes and edges floating in 3D space. Orbit controls let you rotate and zoom the entire graph.

### The Git City
**File:** `threejs/city.html`
Git history visualized as a city landscape. Each commit becomes a building; branches form different city districts. A flyover camera pans through the scene automatically.

### Git Timeline
**File:** `threejs/git-timeline-beats (1).html`
A beat-driven timeline that sequences git commits along a horizontal track. Nodes pulse in rhythm as the timeline plays forward, illustrating how a project evolves over time.

### Fly-Through Timeline
**File:** `threejs/git-timeline-spine.html`
A first-person fly-through of a git commit spine. The camera travels along the commit history as a continuous path through 3D space, giving a cinematic sense of project progression.

### The Package Room
**File:** `threejs/git-visualizer (4).html`
Git objects (blobs, trees, commits) visualized as physical packages in a 3D room. Shows how git stores data internally — staged files, commits, and the object store rendered as tangible items.

### Interactive Command Experience
**File:** `threejs/index-2.html`
A full 3D tutorial simulator. A sidebar steps through 11 git commands (from `git config` to `git merge`) with a live terminal and animated 3D scene reacting to each command. Includes Prev/Next/Play controls and a jump-to dropdown.

### Local vs Remote
**File:** `threejs/remote.html`
A side-by-side 3D comparison of a local repository and its remote (GitHub) counterpart. Push and pull operations are visualized as animated data transfers between the two environments.

---

## HTML/CSS Animations

Located in the `/html-css/` folder. These are CSS-driven animations and interactive React/Vite apps.

### Journey of Code ★
**File:** `html-css/journey.html`
An animated storytelling piece tracing the path of code from a developer's local machine to a remote repository. Uses CSS keyframe animations to walk through the full local → staging → commit → push → remote flow.

### Automated Git Showcase
**File:** `html-css/auto.html`
A self-running showcase that automatically cycles through git operations. No interaction needed — it plays through add, commit, push, and pull sequences on a loop, designed for display or presentation contexts.

### Topological Graph
**File:** `html-css/graph.html`
A CSS-rendered directed acyclic graph (DAG) showing git's internal commit topology. Branches, merges, and HEAD position are drawn as a connected node graph, updating as the simulated history grows.

### Nodes
**File:** `html-css/index-2.html`
An interactive git workflow dashboard (FluxFlow). Five git environment nodes — Working Directory, Staging Area, Local Repo (main), Local Repo (feature), and Remote — are connected by animated packet flows. Click buttons to run `git add`, `commit`, `push`, `pull`, `branch`, and `merge`. Built with Vite and Three.js CSS2D labels.

### Minimal Git Visualizer
**File:** `html-css/index-3.html`
A stripped-back, text-focused visualizer. Shows git state changes in a clean, minimal layout — no 3D, no heavy animation — optimized for clarity and quick comprehension of what each command does.

### Project Scaffold View
**File:** `html-css/index-5.html`
A React/Vite app that visualizes a Nextwork project's file and directory scaffold as an interactive SVG diagram. Shows how a repository's structure maps to git concepts like the working directory, staging area, and commit history.

### Magic of Branching
**File:** `html-css/magic.html`
A CSS animation that demonstrates git branching as a visual metaphor — a main timeline splits into parallel tracks, diverges, and merges back, making the concept of feature branches intuitive at a glance.

### Git Scratch Pad
**File:** `html-css/scratch.html`
A FluxFlow-themed free-form scratch canvas. Intended for exploratory prototyping of git UI concepts — less polished than the other animations but useful for seeing early-stage ideas.

### The Delivery
**File:** `html-css/truck.html`
A Nextwork-branded animation depicting code delivery. A truck (representing a push or deployment) travels from a local machine to a remote destination, with CSS animations driving the motion and storytelling.

### Git Yard Workflow
**File:** `html-css/workflow.html`
A yard/logistics metaphor for git workflows. Files move through a series of stations (working directory → staging → local repo → remote) styled as packages moving through a distribution yard.

---

## Running Locally

Requires Node.js. From the project root:

```bash
node -e "const h=require('http'),fs=require('fs'),p=require('path');h.createServer((q,r)=>{let f=p.join('.',q.url==='/'?'/index.html':q.url),e=p.extname(f),m={'':' text/html','.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'};fs.readFile(f,(err,d)=>{r.writeHead(err?404:200,{'Content-Type':m[e]||'text/plain'});r.end(err?'404':d)})}).listen(3333,()=>console.log('http://localhost:3333'))"
```

Then open [http://localhost:3333](http://localhost:3333).
