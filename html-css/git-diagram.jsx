import { useState, useEffect, useRef } from "react";

// ── Layout ─────────────────────────────────────────────────────────────────────
const NW = 150, NH = 100, NRX = 10, NHW = 75, NHH = 50;
const ROW_Y = 235, BR_Y = 430;

const POS = {
  workdir:   [140, ROW_Y],
  staging:   [360, ROW_Y],
  localrepo: [580, ROW_Y],
  github:    [820, ROW_Y],
  branch:    [580, BR_Y],
};

const AX = {
  wR: 215, sL: 285, sR: 435, lrL: 505,
  lrR: 655, ghL: 745,
  lrB: ROW_Y + NHH,
  brT: BR_Y  - NHH,
};
const V_MID = (AX.lrB + AX.brT) / 2;

const ARROWS = [
  { id:"add",    d:`M ${AX.wR} ${ROW_Y} L ${AX.sL} ${ROW_Y}`,   src:"workdir",   lx:250, ly:ROW_Y-18, la:"middle" },
  { id:"commit", d:`M ${AX.sR} ${ROW_Y} L ${AX.lrL} ${ROW_Y}`,  src:"staging",   lx:470, ly:ROW_Y-18, la:"middle" },
  { id:"push",   d:`M ${AX.lrR} ${ROW_Y} L ${AX.ghL} ${ROW_Y}`, src:"localrepo", lx:700, ly:ROW_Y-18, la:"middle" },
  { id:"branch", d:`M 562 ${AX.lrB} L 562 ${AX.brT}`,           src:"localrepo", lx:550, ly:V_MID,    la:"end"    },
  { id:"merge",  d:`M 598 ${AX.brT} L 598 ${AX.lrB}`,           src:"branch",    lx:610, ly:V_MID,    la:"start"  },
];

const CMD_META = {
  add:    { dest:"staging",   ms:560, desc:"Moves your edited files into the staging area, ready to be committed."    },
  commit: { dest:"localrepo", ms:700, desc:"Saves a permanent snapshot of staged changes to your local history."      },
  push:   { dest:"github",    ms:900, desc:"Uploads your local commits to the shared remote repository."              },
  branch: { dest:"branch",    ms:600, desc:"Forks a new branch — an isolated copy to experiment without risk."        },
  merge:  { dest:"localrepo", ms:600, desc:"Folds the branch's accepted changes back into the main history."          },
};

const NODE_META = {
  workdir:   { title:"Working directory", sub:"your edits",    accent:"#6b8fff", cmds:["add"]           },
  staging:   { title:"Staging area",      sub:"ready to save", accent:"#a78bfa", cmds:["commit"]        },
  localrepo: { title:"Local repository",  sub:"git history",   accent:"#fb923c", cmds:["push","branch"] },
  github:    { title:"GitHub",            sub:"remote",        accent:"#34d399", cmds:[]                },
  branch:    { title:"Feature branch",    sub:"safe copy",     accent:"#fbbf24", cmds:["merge"]         },
};

const UNLOCK_MAP = {
  add:    { activates:"staging",   unlocks:["commit"]        },
  commit: { activates:"localrepo", unlocks:["push","branch"] },
  push:   { activates:"github",    unlocks:[]                },
  branch: { activates:"branch",    unlocks:["merge"]         },
  merge:  { activates:null,        unlocks:[]                },
};

const TERM_DATA = {
  add:    { input:"git add .",                    output:["Changes staged for commit:","  modified:   index.js","  modified:   styles.css"]                                                    },
  commit: { input:'git commit -m "Fix the bug"',  output:['[main a3f2c1d] Fix the bug',' 2 files changed, 14 insertions(+), 3 deletions(-)']                                                  },
  push:   { input:"git push origin main",         output:["Enumerating objects: 5, done.","Writing objects: 100% (3/3), done.","To github.com/you/project.git","   f1a2b3c..a3f2c1d  main → main"] },
  branch: { input:"git branch feature",           output:["Switched to a new branch 'feature'"]                                                                                               },
  merge:  { input:"git merge feature",            output:["Updating a3f2c1d..d4e5f6a","Fast-forward"," index.js | 10 +++++++++++"," 1 file changed, 10 insertions(+)"]                        },
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconLines() {
  return <g stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <line x1={-8} y1={-5} x2={8}  y2={-5}/><line x1={-8} y1={0} x2={8} y2={0}/><line x1={-8} y1={5} x2={3} y2={5}/>
  </g>;
}
function IconTray() {
  return <g stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none">
    <path d="M -8 2 L -8 8 L 8 8 L 8 2 L 4 2 L 2 -2 L -2 -2 L -4 2 Z" strokeLinejoin="round"/>
    <line x1={0} y1={-8} x2={0} y2={-2}/><polyline points="-4,-5 0,-2 4,-5" strokeLinejoin="round"/>
  </g>;
}
function IconDiamond() {
  return <g>
    <path d="M 0,-10 L 10,0 L 0,10 L -10,0 Z" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round"/>
    <line x1={-6} y1={0} x2={6} y2={0} stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    <line x1={0} y1={-6} x2={0} y2={6} stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
  </g>;
}
function IconCloud() {
  return <g stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none">
    <path d="M -8 2 C -8 -2 -4 -6 1 -6 C 3 -9 7 -9 9 -6 C 12 -5 12 -1 9 1 L -5 1 C -7 1 -8 0 -8 2 Z"/>
    <line x1={0} y1={2} x2={0} y2={8}/><line x1={-3} y1={5} x2={0} y2={9}/><line x1={3} y1={5} x2={0} y2={9}/>
  </g>;
}
function IconFork() {
  return <g fill="currentColor" stroke="currentColor" strokeLinecap="round">
    <line x1={0} y1={8} x2={0} y2={1} strokeWidth={2}/>
    <line x1={0} y1={1} x2={-7} y2={-7} strokeWidth={2}/>
    <line x1={0} y1={1} x2={7}  y2={-7} strokeWidth={2}/>
    <circle cx={0}  cy={8}  r={2.5} stroke="none"/><circle cx={-7} cy={-7} r={2.5} stroke="none"/><circle cx={7} cy={-7} r={2.5} stroke="none"/>
  </g>;
}

const ICON_MAP = { workdir:IconLines, staging:IconTray, localrepo:IconDiamond, github:IconCloud, branch:IconFork };

// ── NodeCard ──────────────────────────────────────────────────────────────────

function CmdButton({ cmd, bx, by, bw, bh, accent, active, disabled, onRun }) {
  const [hov, setHov] = useState(false);
  return (
    <g style={{ cursor: disabled ? "default" : "pointer" }}
      onClick={!disabled ? onRun : undefined}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <rect x={bx} y={by} width={bw} height={bh} rx={bh/2}
        fill={active || hov ? `${accent}22` : `${accent}0c`}
        stroke={active ? accent : hov ? `${accent}80` : `${accent}38`} strokeWidth={1}/>
      <text x={bx+bw/2} y={by+bh/2+4.5} textAnchor="middle" fontSize={11}
        fontFamily="JetBrains Mono, monospace" fill={accent}
        fillOpacity={disabled && !active ? 0.3 : 0.9}
        style={{ pointerEvents:"none" }}>{active ? "running…" : `▶ ${cmd}`}</text>
    </g>
  );
}

function NodeCard({ type, active: nodeActive, unlockedCmds, playing, mode, onRun }) {
  const [cx, cy] = POS[type];
  const { title, sub, accent, cmds } = NODE_META[type];
  const x = cx - NHW, y = cy - NHH;
  const Icon = ICON_MAP[type];

  const visibleCmds = mode === "buttons" ? cmds.filter(c => unlockedCmds.has(c)) : [];
  const showBtnZone = visibleCmds.length > 0;
  const divY = y + 62;
  const btnCY = divY + (NH - 62) / 2;

  return (
    <g opacity={nodeActive ? 1 : 0.28} style={{ transition:"opacity 0.4s" }}>
      <rect x={x+1} y={y+2} width={NW} height={NH} rx={NRX} fill="#000" fillOpacity={0.4}/>
      <rect x={x} y={y} width={NW} height={NH} rx={NRX}
        fill="url(#card-fill)"
        stroke={nodeActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"} strokeWidth={1}/>
      <rect x={x} y={y+12} width={3} height={NH-24} rx={1.5} fill={accent} opacity={nodeActive ? 0.65 : 0.2}/>
      <g transform={`translate(${x+20},${y+28})`} color={accent} opacity={0.85}><Icon/></g>
      <text x={x+36} y={y+24} fontSize={14} fontWeight="600"
        fontFamily="Hanken Grotesk, system-ui, sans-serif" fill="rgba(255,255,255,.88)">{title}</text>
      <text x={x+36} y={y+41} fontSize={11} fontFamily="JetBrains Mono, monospace"
        fill={accent} opacity={0.55}>{sub}</text>

      {showBtnZone && (
        <>
          <line x1={x+10} y1={divY} x2={x+NW-10} y2={divY} stroke="rgba(255,255,255,.07)" strokeWidth={1}/>
          {visibleCmds.map((cmd, i) => {
            const count = visibleCmds.length;
            const bw = count === 1 ? NW-24 : (NW-28)/2;
            const bh = 22;
            const bx = count === 1 ? x+12 : x+12+i*(bw+4);
            return <CmdButton key={cmd} cmd={cmd} bx={bx} by={btnCY-bh/2} bw={bw} bh={bh}
              accent={accent} active={playing===cmd} disabled={!!playing} onRun={() => onRun(cmd)}/>;
          })}
        </>
      )}
    </g>
  );
}

// ── Arrow ─────────────────────────────────────────────────────────────────────

function ArrowLine({ a, activeNodes, playing }) {
  const srcActive = activeNodes.has(a.src);
  const isPlaying = playing === a.id;
  return (
    <g opacity={srcActive ? 1 : 0.15} style={{ transition:"opacity 0.4s" }}>
      <path d={a.d} stroke="white" fill="none"
        strokeWidth={isPlaying ? 2 : 1.4}
        opacity={isPlaying ? 0.85 : 0.22}
        strokeLinecap="round" markerEnd="url(#ah)"/>
      {isPlaying && <path d={a.d} stroke="white" strokeWidth={1.5} fill="none"
        opacity={0.4} strokeDasharray="6 5" strokeLinecap="round" className="git-flow"/>}
      <text
        x={a.la==="end" ? a.lx-4 : a.la==="start" ? a.lx+4 : a.lx}
        y={a.ly+4}
        textAnchor={a.la==="middle" ? "middle" : a.la==="end" ? "end" : "start"}
        fontSize={12} fontFamily="JetBrains Mono, monospace"
        fill="rgba(255,255,255,.3)">{a.id==="add"?"git add":a.id==="commit"?"git commit":a.id==="push"?"git push":a.id==="branch"?"git branch":"git merge"}</text>
    </g>
  );
}

// ── Particle ──────────────────────────────────────────────────────────────────

function Particle({ d, ms }) {
  const dur = `${(ms/1000).toFixed(2)}s`, sp = "0.4 0 0.6 1";
  return <>
    <circle r={9} fill="white" opacity={0.1}>
      <animateMotion dur={dur} fill="freeze" path={d} calcMode="spline" keyTimes="0;1" keySplines={sp}/>
    </circle>
    <circle r={3.5} fill="white" opacity={0.9}>
      <animateMotion dur={dur} fill="freeze" path={d} calcMode="spline" keyTimes="0;1" keySplines={sp}/>
    </circle>
  </>;
}

// ── Terminal ──────────────────────────────────────────────────────────────────

function Terminal({ unlockedCmds, playing, onRun, lines }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  return (
    <div style={{
      background:"#080910", border:"1px solid rgba(255,255,255,.08)",
      borderRadius:10, marginTop:10, overflow:"hidden",
      fontFamily:"JetBrains Mono, monospace", fontSize:13,
    }}>
      {/* Output */}
      <div ref={scrollRef} style={{
        height:140, overflowY:"auto", padding:"12px 14px 8px",
        display:"flex", flexDirection:"column", gap:2,
      }}>
        {lines.length === 0
          ? <span style={{ color:"rgba(255,255,255,.18)" }}># run a command below to see output</span>
          : lines.map((l, i) => (
            <div key={i} style={{ lineHeight:1.6 }}>
              {l.type === "cmd"
                ? <><span style={{ color:"#6b8fff" }}>$ </span><span style={{ color:"rgba(255,255,255,.85)" }}>{l.text}</span></>
                : <span style={{ color:"rgba(255,255,255,.4)" }}>{l.text}</span>
              }
            </div>
          ))
        }
        {playing && (
          <div style={{ color:"rgba(255,255,255,.25)", marginTop:2 }}>▌</div>
        )}
      </div>

      {/* Prompt bar */}
      <div style={{
        borderTop:"1px solid rgba(255,255,255,.06)",
        padding:"8px 14px",
        display:"flex", gap:8, flexWrap:"wrap", alignItems:"center",
      }}>
        <span style={{ color:"#6b8fff", fontSize:13 }}>$</span>
        {[...unlockedCmds].map(cmd => (
          <button key={cmd} disabled={!!playing} onClick={() => onRun(cmd)} style={{
            cursor: playing ? "default" : "pointer",
            background:"rgba(255,255,255,.04)",
            border:"1px solid rgba(255,255,255,.14)",
            borderRadius:6, padding:"3px 10px",
            fontFamily:"JetBrains Mono, monospace", fontSize:13,
            color: playing ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.75)",
            transition:"background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => { if (!playing) { e.target.style.background="rgba(255,255,255,.09)"; e.target.style.borderColor="rgba(255,255,255,.3)"; }}}
          onMouseLeave={e => { e.target.style.background="rgba(255,255,255,.04)"; e.target.style.borderColor="rgba(255,255,255,.14)"; }}
          >{TERM_DATA[cmd].input}</button>
        ))}
        {unlockedCmds.size === 0 && !playing && (
          <span style={{ color:"rgba(255,255,255,.2)", fontSize:11 }}>all commands complete · reset to replay</span>
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function GitDiagram() {
  const [mode,         setMode]         = useState("buttons");
  const [playing,      setPlaying]      = useState(null);
  const [activeNodes,  setActiveNodes]  = useState(new Set(["workdir"]));
  const [unlockedCmds, setUnlockedCmds] = useState(new Set(["add"]));
  const [termLines,    setTermLines]    = useState([]);

  useEffect(() => {
    const id = "gd-fonts";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700..800&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap";
    document.head.appendChild(l);
  }, []);

  function reset() {
    setPlaying(null);
    setActiveNodes(new Set(["workdir"]));
    setUnlockedCmds(new Set(["add"]));
    setTermLines([]);
  }

  function run(id) {
    if (playing || !unlockedCmds.has(id)) return;
    const { ms } = CMD_META[id];
    const key = Date.now();

    if (mode === "terminal") {
      setTermLines(l => [...l, { type:"cmd", text:TERM_DATA[id].input }]);
    }

    setPlaying({ id, key, phase:"travel" });
    setTimeout(() => setPlaying(p => p?.key===key ? {...p, phase:"arrive"} : p), ms);
    setTimeout(() => {
      const { activates, unlocks } = UNLOCK_MAP[id];
      if (activates) setActiveNodes(s => new Set([...s, activates]));
      setUnlockedCmds(s => {
        const next = new Set(s);
        next.delete(id);
        unlocks.forEach(u => next.add(u));
        return next;
      });
      if (mode === "terminal") {
        setTermLines(l => [...l, ...TERM_DATA[id].output.map(t => ({ type:"output", text:t }))]);
      }
      setPlaying(p => p?.key===key ? null : p);
    }, ms + 900);
  }

  const pId    = playing?.id;
  const pMeta  = pId ? CMD_META[pId] : null;
  const pArrow = pId ? ARROWS.find(a => a.id===pId) : null;
  const arriving = playing?.phase === "arrive";

  return (
    <div style={{
      background:"linear-gradient(150deg,#070810 0%,#06070d 100%)",
      borderRadius:16, padding:"20px 18px 16px",
      fontFamily:"Hanken Grotesk, system-ui, sans-serif",
      maxWidth:960,
    }}>
      <style>{`
        @keyframes git-flow { to { stroke-dashoffset:-11; } }
        .git-flow { animation: git-flow 0.6s linear infinite; }
        @keyframes info-in { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .info-in { animation: info-in 0.2s ease-out both; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{
            fontFamily:"Bricolage Grotesque, Hanken Grotesk, sans-serif",
            fontWeight:800, fontSize:17, letterSpacing:"-.025em", color:"rgba(255,255,255,.85)",
          }}>How Git works</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.25)", marginTop:2 }}>
            {mode === "buttons" ? "click ▶ inside a node to simulate" : "click a command in the terminal to simulate"}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Mode toggle */}
          <div style={{
            display:"flex", background:"rgba(255,255,255,.05)",
            border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:3, gap:2,
          }}>
            {["buttons","terminal"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                cursor:"pointer", border:"none", borderRadius:6,
                padding:"4px 12px", fontSize:11.5,
                fontFamily:"Hanken Grotesk, system-ui, sans-serif",
                fontWeight: mode===m ? 600 : 400,
                background: mode===m ? "rgba(255,255,255,.12)" : "transparent",
                color: mode===m ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.35)",
                transition:"all 0.15s",
              }}>{m==="buttons" ? "Buttons" : "Terminal"}</button>
            ))}
          </div>
          {/* Reset */}
          <button onClick={reset} style={{
            cursor:"pointer", border:"1px solid rgba(255,255,255,.1)",
            borderRadius:7, padding:"4px 10px", fontSize:11,
            fontFamily:"Hanken Grotesk, system-ui, sans-serif",
            background:"transparent", color:"rgba(255,255,255,.35)",
          }}>↺ Reset</button>
        </div>
      </div>

      {/* Diagram */}
      <svg viewBox="0 0 960 510" width="100%" style={{ display:"block", overflow:"visible" }}>
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="rgba(255,255,255,.4)"/>
          </marker>
          <linearGradient id="card-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#12131f"/>
            <stop offset="100%" stopColor="#0d0e1a"/>
          </linearGradient>
        </defs>
        <rect width={960} height={490} fill="transparent"/>

        {/* Zone labels */}
        <text x={380} y={52} textAnchor="middle" fontSize={12} fontWeight="600" letterSpacing=".1em"
          fontFamily="Hanken Grotesk, system-ui" fill="rgba(255,255,255,.18)">LOCAL MACHINE</text>
        <text x={820} y={52} textAnchor="middle" fontSize={12} fontWeight="600" letterSpacing=".1em"
          fontFamily="Hanken Grotesk, system-ui" fill="rgba(255,255,255,.18)">REMOTE</text>
        <line x1={710} y1={65} x2={710} y2={400} stroke="rgba(255,255,255,.05)" strokeWidth={1} strokeDasharray="4 6"/>

        {/* Connector dots */}
        {[[AX.wR,ROW_Y],[AX.sL,ROW_Y],[AX.sR,ROW_Y],[AX.lrL,ROW_Y],[AX.lrR,ROW_Y],[AX.ghL,ROW_Y],
          [562,AX.lrB],[562,AX.brT],[598,AX.brT],[598,AX.lrB]
        ].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={2} fill="rgba(255,255,255,.15)"/>)}

        {/* Arrival pulse */}
        {arriving && pMeta && (
          <rect className="info-in"
            x={POS[pMeta.dest][0]-NHW-6} y={POS[pMeta.dest][1]-NHH-6}
            width={NW+12} height={NH+12} rx={NRX+6}
            fill="none"
            stroke={NODE_META[pMeta.dest].accent}
            strokeOpacity={0.5} strokeWidth={1.5}
            style={{ animation:"info-in 0.2s ease-out both, nd-fade 0.9s ease-out 0.2s both" }}
          />
        )}

        <style>{`@keyframes nd-fade { 0%{opacity:1} 100%{opacity:0} }`}</style>

        {/* Arrows */}
        {ARROWS.map(a => <ArrowLine key={a.id} a={a} activeNodes={activeNodes} playing={pId}/>)}

        {/* Nodes */}
        {Object.keys(POS).map(type => (
          <NodeCard key={type} type={type}
            active={activeNodes.has(type)}
            unlockedCmds={unlockedCmds}
            playing={pId}
            mode={mode}
            onRun={run}/>
        ))}

        {/* Particle */}
        {playing?.phase==="travel" && pArrow && (
          <Particle key={playing.key} d={pArrow.d} ms={pMeta.ms}/>
        )}
      </svg>

      {/* Terminal panel */}
      {mode === "terminal" && (
        <Terminal unlockedCmds={unlockedCmds} playing={pId} onRun={run} lines={termLines}/>
      )}

      {/* Info strip — fixed height so page never jumps */}
      <div style={{
        marginTop:10, borderTop:"1px solid rgba(255,255,255,.06)",
        paddingTop:10, height:36, overflow:"hidden",
        display:"flex", alignItems:"center", gap:12,
      }}>
        <div key={pId ?? "idle"} className="info-in" style={{ display:"flex", alignItems:"center", gap:10, width:"100%" }}>
          {pId ? (
            <>
              <span style={{
                fontFamily:"JetBrains Mono, monospace", fontSize:12,
                color:NODE_META[CMD_META[pId].dest].accent,
                background:`${NODE_META[CMD_META[pId].dest].accent}14`,
                border:`1px solid ${NODE_META[CMD_META[pId].dest].accent}30`,
                borderRadius:6, padding:"2px 10px", whiteSpace:"nowrap", flexShrink:0,
              }}>{TERM_DATA[pId].input.split(" ").slice(0,2).join(" ")}</span>
              <span style={{ fontSize:13, color:"rgba(255,255,255,.45)", lineHeight:1.3 }}>{pMeta.desc}</span>
            </>
          ) : (
            <span style={{ fontSize:12, color:"rgba(255,255,255,.2)" }}>
              {[...unlockedCmds].length > 0
                ? `Next: ${[...unlockedCmds].map(c => TERM_DATA[c].input.split(" ").slice(0,2).join(" ")).join(" or ")}`
                : "All commands complete — ↺ reset to replay"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
