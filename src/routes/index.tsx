import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import farmer1 from "@/assets/farmers/farmer-2.png.asset.json";
import farmer2 from "@/assets/farmers/farmer-3.png.asset.json";
import farmer3 from "@/assets/farmers/farmer-4.png.asset.json";
import farmer4 from "@/assets/farmers/farmer-5.png.asset.json";
import farmer5 from "@/assets/farmers/farmer-6.png.asset.json";
import farmer6 from "@/assets/farmers/farmer-7.png.asset.json";
import farmer7 from "@/assets/farmers/farmer-8.png.asset.json";
import farmer8 from "@/assets/farmers/farmer-9.png.asset.json";
import farmer9a from "@/assets/farmers/farmer-10.png.asset.json"; // Ansem
import farmer9b from "@/assets/farmers/farmer-11.png.asset.json"; // Fazebanks
import trumpImg from "@/assets/farmers/farmer-trump.jpg";

export const Route = createFileRoute("/")({
  component: SolFarm,
});

type Bush = {
  id: number;
  name: string;
  farmer: string;
  portraits: string[];
  cost: number;
  perClick: number;
  rarity: string;
  tagline: string;
};

const BUSHES: Bush[] = [
  { id: 1,  name: "Sprout Row",      farmer: "Advyth",                portraits: [farmer1.url], cost: 0,      perClick: 0.0001, rarity: "Common",    tagline: "Pure conviction farming." },
  { id: 2,  name: "Headphone Hedge", farmer: "Ethan Prosper",         portraits: [farmer2.url], cost: 0.01,   perClick: 0.0008, rarity: "Common",    tagline: "Locked in, headphones on." },
  { id: 3,  name: "Duval Vines",     farmer: "Jackduval",             portraits: [farmer3.url], cost: 0.08,   perClick: 0.004,  rarity: "Common",    tagline: "Stache-powered yields." },
  { id: 4,  name: "Killua Crop",     farmer: "Decu",                  portraits: [farmer4.url], cost: 0.5,    perClick: 0.018,  rarity: "Uncommon",  tagline: "Godspeed harvests." },
  { id: 5,  name: "Krabby Patch",    farmer: "Sponge Farmer",         portraits: [farmer5.url], cost: 3,      perClick: 0.07,   rarity: "Uncommon",  tagline: "Spatula in one hand, SOL in the other." },
  { id: 6,  name: "Cented Garden",   farmer: "Cented",                portraits: [farmer6.url], cost: 15,     perClick: 0.28,   rarity: "Rare",      tagline: "Cented sniffs out the alpha bush." },
  { id: 7,  name: "Kimchi Field",    farmer: "Kimchi",                portraits: [farmer7.url], cost: 90,     perClick: 1.1,    rarity: "Rare",      tagline: "Jet-set farming, no jet lag." },
  { id: 8,  name: "Cupsey Grove",    farmer: "Cupsey",                portraits: [farmer8.url], cost: 500,    perClick: 5,      rarity: "Epic",      tagline: "Salutes every bag he makes." },
  { id: 9,  name: "Twin Towers",     farmer: "Ansem × Fazebanks",     portraits: [farmer9a.url, farmer9b.url], cost: 3000, perClick: 22,  rarity: "Legendary", tagline: "Two whales, one bush." },
  { id: 10, name: "MAGA Plantation", farmer: "DONALD TRUMP",          portraits: [trumpImg],    cost: 20000,  perClick: 120,    rarity: "FINAL BOSS", tagline: "The biggest, most tremendous SOL farm." },
];

const STORAGE_PREFIX = "solfarm:v1:";

function isValidSolAddress(addr: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim());
}
function fmtSol(n: number) {
  if (n >= 1000) return n.toFixed(0);
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
}

type SaveState = {
  sol: number;
  totalEarned: number;
  totalClicks: number;
  unlocked: number[];
};
const defaultState = (): SaveState => ({ sol: 0, totalEarned: 0, totalClicks: 0, unlocked: [1] });

function loadState(wallet: string): SaveState {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + wallet);
    if (!raw) return defaultState();
    const p = JSON.parse(raw) as Partial<SaveState>;
    return { ...defaultState(), ...p, unlocked: p.unlocked && p.unlocked.length ? p.unlocked : [1] };
  } catch { return defaultState(); }
}
function saveState(wallet: string, s: SaveState) {
  localStorage.setItem(STORAGE_PREFIX + wallet, JSON.stringify(s));
}

function SolFarm() {
  const [wallet, setWallet] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("solfarm:active") || null;
  });
  if (!wallet) return <Landing onLogin={(w) => { localStorage.setItem("solfarm:active", w); setWallet(w); }} />;
  return <Farm wallet={wallet} onLogout={() => { localStorage.removeItem("solfarm:active"); setWallet(null); }} />;
}

function Landing({ onLogin }: { onLogin: (w: string) => void }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden farm-sky">
      <div className="stars absolute inset-0" />
      <div className="relative max-w-xl w-full neon-border rounded-2xl p-8 bg-card/70 backdrop-blur">
        <div className="text-xs font-mono text-accent uppercase tracking-widest mb-2">$SOLFARM · clickeconomy v1</div>
        <h1 className="text-5xl font-black text-glow mb-3">Sol<span className="text-accent">Farm</span> 🌱</h1>
        <p className="text-muted-foreground mb-6">Plug in your wallet. Hire a roster of legendary degen farmers. Click bushes. Stack SOL. Beat Trump.</p>
        <label className="block text-xs font-mono text-muted-foreground mb-2">SOLANA WALLET</label>
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="paste your sol address…"
          className="w-full bg-input border border-border rounded-lg px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        {err && <div className="text-destructive text-sm mt-2">{err}</div>}
        <button
          onClick={() => {
            if (!isValidSolAddress(v)) { setErr("That doesn't look like a valid SOL address."); return; }
            onLogin(v.trim());
          }}
          className="w-full mt-4 bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition"
        >
          ENTER THE FARM →
        </button>
        <div className="grid grid-cols-3 gap-3 mt-6 text-center text-xs">
          <div className="bg-secondary/50 rounded-lg p-3"><div className="text-lg">🌾</div>10 farmers</div>
          <div className="bg-secondary/50 rounded-lg p-3"><div className="text-lg">⚡</div>Click to harvest</div>
          <div className="bg-secondary/50 rounded-lg p-3"><div className="text-lg">👑</div>Beat Trump</div>
        </div>
      </div>
    </div>
  );
}

type Floater = { id: number; x: number; y: number; text: string };

function Farm({ wallet, onLogout }: { wallet: string; onLogout: () => void }) {
  const [state, setState] = useState<SaveState>(() => loadState(wallet));
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [pickingRow, setPickingRow] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const flId = useRef(0);

  useEffect(() => { saveState(wallet, state); }, [wallet, state]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  const harvest = (bush: Bush, ev: React.MouseEvent) => {
    if (!state.unlocked.includes(bush.id)) return;
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const id = ++flId.current;
    setFloaters((f) => [...f, { id, x, y, text: `+${fmtSol(bush.perClick)} SOL` }]);
    setTimeout(() => setFloaters((f) => f.filter((p) => p.id !== id)), 1100);
    setPickingRow(bush.id);
    setTimeout(() => setPickingRow((p) => (p === bush.id ? null : p)), 450);
    setState((s) => ({ ...s, sol: s.sol + bush.perClick, totalEarned: s.totalEarned + bush.perClick, totalClicks: s.totalClicks + 1 }));
  };

  const unlock = (bush: Bush) => {
    if (state.unlocked.includes(bush.id)) return;
    const prev = BUSHES.find((b) => b.id === bush.id - 1);
    if (prev && !state.unlocked.includes(prev.id)) { showToast(`Unlock ${prev.name} first.`); return; }
    if (state.sol < bush.cost) { showToast(`Need ${fmtSol(bush.cost - state.sol)} more SOL.`); return; }
    setState((s) => ({ ...s, sol: s.sol - bush.cost, unlocked: [...s.unlocked, bush.id] }));
    showToast(`Hired ${bush.farmer}!`);
  };

  const reset = () => {
    if (!confirm("Burn this farm and start over?")) return;
    setState(defaultState());
  };

  const nextLocked = useMemo(() => BUSHES.find((b) => !state.unlocked.includes(b.id)), [state.unlocked]);

  return (
    <div className="min-h-screen farm-sky relative">
      <div className="stars absolute inset-0 h-[60vh]" />

      {/* HUD */}
      <header className="sticky top-0 z-30 backdrop-blur bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="font-black text-glow text-lg">SolFarm</span>
          </div>
          <div className="flex-1 flex items-center gap-4 flex-wrap text-sm font-mono">
            <Stat label="BALANCE" value={`${fmtSol(state.sol)} SOL`} accent />
            <Stat label="EARNED" value={`${fmtSol(state.totalEarned)} SOL`} />
            <Stat label="CLICKS" value={state.totalClicks.toLocaleString()} />
            <Stat label="FARMERS" value={`${state.unlocked.length}/10`} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground hidden md:inline">{wallet.slice(0,4)}…{wallet.slice(-4)}</span>
            <button onClick={reset} className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary">Reset</button>
            <button onClick={onLogout} className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary">Logout</button>
          </div>
        </div>
        {nextLocked && (
          <div className="max-w-7xl mx-auto px-4 pb-3 text-xs font-mono text-muted-foreground">
            Next farmer: <span className="text-accent">{nextLocked.farmer}</span> — costs {fmtSol(nextLocked.cost)} SOL
          </div>
        )}
      </header>

      {/* Farm */}
      <main className="max-w-7xl mx-auto px-4 py-6 relative">
        <div className="flex flex-col gap-6">
          {BUSHES.map((bush, idx) => (
            <FarmRow
              key={bush.id}
              bush={bush}
              index={idx}
              unlocked={state.unlocked.includes(bush.id)}
              affordable={state.sol >= bush.cost}
              picking={pickingRow === bush.id}
              floaters={floaters}
              onHarvest={harvest}
              onUnlock={unlock}
            />
          ))}
        </div>

        <footer className="mt-10 text-center text-xs text-muted-foreground font-mono">
          Not financial advice. Bushes are not real. SOL is real. Trump is final boss.
        </footer>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-primary px-5 py-3 rounded-lg neon-border font-mono text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={accent ? "text-accent text-glow-gold" : ""}>{value}</span>
    </div>
  );
}

function FarmRow({
  bush, index, unlocked, affordable, picking, floaters, onHarvest, onUnlock,
}: {
  bush: Bush; index: number; unlocked: boolean; affordable: boolean; picking: boolean;
  floaters: Floater[]; onHarvest: (b: Bush, e: React.MouseEvent) => void; onUnlock: (b: Bush) => void;
}) {
  const lightColors = ["#ffd166", "#ff6fb5", "#5cd9ff", "#9bff6a", "#ff8a5b"];
  const tone = lightColors[index % lightColors.length];

  const [hitBush, setHitBush] = useState<number | null>(null);
  const [chips, setChips] = useState<{ id: number; x: number; y: number; cx: string; cy: string; cr: string }[]>([]);
  const chipId = useRef(0);

  const handleClick = (e: React.MouseEvent, i: number) => {
    onHarvest(bush, e);
    setHitBush(i);
    setTimeout(() => setHitBush((h) => (h === i ? null : h)), 380);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const burst = Array.from({ length: 6 }).map(() => {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const dist = 30 + Math.random() * 40;
      return {
        id: ++chipId.current,
        x: cx, y: cy,
        cx: `${Math.cos(ang) * dist}px`,
        cy: `${Math.sin(ang) * dist}px`,
        cr: `${(Math.random() - 0.5) * 540}deg`,
      };
    });
    setChips((c) => [...c, ...burst]);
    setTimeout(() => setChips((c) => c.filter((p) => !burst.some((b) => b.id === p.id))), 650);
  };

  const bushPositions = [22, 50, 78]; // % across floor

  return (
    <section className={`relative rounded-2xl overflow-hidden border-2 border-border ${unlocked ? "row-active" : ""}`}>
      <div className="relative h-[380px] room-stage">
        {/* 3D structural shell */}
        <div className="room-3d">
          <div className="wall-back" />
          <div className="wall-left" />
          <div className="wall-right" />
          <div className="iso-floor" />
        </div>

        {/* Ceiling rig */}
        <div className="ceiling-beam">
          <div className="pipe" style={{ left: "5%",  right: "5%", top: 10 }} />
          <div className="pipe" style={{ left: "5%",  right: "5%", top: 28, opacity: 0.7 }} />
        </div>

        {/* Hanging grow-lamps + light cones */}
        {bushPositions.map((x, i) => (
          <div key={`lamp-${i}`} style={{ position: "absolute", left: `${x}%`, top: 0, zIndex: 6 }}>
            <div className="lamp-rod" style={{ left: -1 }} />
            <div className="lamp-hood" />
            <div className="lamp-glow" style={{ color: tone }} />
            <div className="ceiling-cone" style={{ color: tone }} />
          </div>
        ))}

        {/* Ceiling fan in the center */}
        <div className="fan-wrap" style={{ left: "50%" }}>
          <div className="fan-rod" />
          <div className="fan-hub" />
          <div className="fan-blades" />
        </div>

        {/* Wall props */}
        <div className="ac-unit" style={{ top: 70, right: "6%" }} />
        <div className="ac-unit" style={{ top: 78, left: "6%", width: 70, height: 30 }} />

        {/* Floor crates */}
        <div className="crate" style={{ bottom: 28, left: 28 }} />
        <div className="crate" style={{ bottom: 32, right: 36, transform: "scale(0.85)" }} />
        <div className="crate" style={{ bottom: 70, left: 18, transform: "scale(0.7)" }} />

        {/* Row header chips */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <div className="bg-background/85 backdrop-blur px-3 py-1 rounded-md border border-border font-mono text-xs">
            LV {String(bush.id).padStart(2, "0")} · <span className="text-accent">{bush.rarity}</span>
          </div>
          <div className="text-sm font-bold text-glow">{bush.name}</div>
        </div>
        <div className="absolute top-3 right-3 z-20 text-xs font-mono bg-background/85 border border-border px-3 py-1 rounded-md">
          <span className="text-accent">{fmtSol(bush.perClick)}</span> SOL / hit
        </div>

        {/* Actors on the floor */}
        <div className={`absolute inset-0 ${!unlocked ? "row-locked" : ""}`} style={{ zIndex: 8 }}>
          {bushPositions.map((x, i) => {
            const portrait = bush.portraits[i % bush.portraits.length];
            const farmerName = bush.farmer.split(" × ")[i % bush.portraits.length] ?? bush.farmer;
            const swinging = picking && hitBush === i;
            const hit = hitBush === i;
            const hue = (index * 47 + i * 23) % 360;
            // Scale actors based on depth (center = larger illusion not needed; keep uniform)
            return (
              <div
                key={i}
                className="absolute flex items-end gap-1"
                style={{ left: `${x}%`, bottom: 24, transform: "translateX(-50%)" }}
              >
                {/* Farmer */}
                <div className={`farmer-stage ${swinging ? "farmer-swing" : ""}`} style={{ marginRight: -8 }}>
                  <div className="floor-shadow" />
                  <img src={portrait} alt={farmerName} className="farmer-head" draggable={false} />
                  <svg className="farmer-body" viewBox="0 0 100 130" width="92" height="118">
                    <path d="M50 6 C 22 6 14 38 14 70 L 14 110 L 86 110 L 86 70 C 86 38 78 6 50 6 Z"
                          fill={`hsl(${hue} 58% 38%)`} stroke="rgba(0,0,0,0.45)" strokeWidth="2" />
                    <path d="M30 8 Q 50 22 70 8 L 70 18 Q 50 30 30 18 Z" fill="#f4ecdc" opacity="0.9" />
                    <rect x="14" y="90" width="72" height="8" fill="#2a1d12" />
                    <rect x="46" y="89" width="8" height="10" fill="#e0b94a" />
                    <rect x="6" y="42" width="14" height="60" rx="7" fill={`hsl(${hue} 58% 30%)`} />
                    <rect x="22" y="108" width="22" height="22" fill="#2a3148" />
                    <rect x="56" y="108" width="22" height="22" fill="#2a3148" />
                    <rect x="20" y="126" width="26" height="6" rx="2" fill="#111" />
                    <rect x="54" y="126" width="26" height="6" rx="2" fill="#111" />
                  </svg>
                  <div className="farmer-arm-front" style={{ background: `hsl(${hue} 40% 62%)` }} />
                  <svg className="pickaxe" viewBox="0 0 80 80">
                    <line x1="10" y1="68" x2="62" y2="16" stroke="#6b4226" strokeWidth="6" strokeLinecap="round" />
                    <path d="M50 4 L 78 22 L 70 30 L 60 24 L 56 32 L 44 20 Z" fill="#8a93a8" stroke="#111" strokeWidth="1.5" />
                    <circle cx="36" cy="42" r="3" fill="#e0b94a" />
                  </svg>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono bg-background/90 border border-border px-2 py-0.5 rounded z-10">
                    {farmerName}
                  </div>
                </div>

                {/* Bush */}
                <div className="relative flex flex-col items-center cursor-pointer select-none" onClick={(e) => unlocked && handleClick(e, i)}>
                  <div className="floor-shadow" style={{ bottom: -2 }} />
                  <div className={`bush-shape ${hit ? "hit" : ""}`}>
                    <span className="berry" style={{ top: 22, left: 30 }} />
                    <span className="berry" style={{ top: 34, right: 24 }} />
                    <span className="berry" style={{ top: 62, left: 56 }} />
                    <span className="berry" style={{ top: 18, right: 44 }} />
                  </div>
                  <div className="pot -mt-3" />
                  {chips.map((c) => (
                    <span
                      key={c.id}
                      className="chip"
                      style={{
                        left: c.x, top: c.y,
                        ["--cx" as never]: c.cx,
                        ["--cy" as never]: c.cy,
                        ["--cr" as never]: c.cr,
                      } as React.CSSProperties}
                    />
                  ))}
                  {floaters.map((f) => (
                    <div key={f.id} className="floater absolute pointer-events-none font-extrabold text-accent text-glow-gold text-base" style={{ left: f.x, top: f.y }}>
                      {f.text}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 60%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          zIndex: 9,
        }} />

        {!unlocked && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/55 backdrop-blur-sm">
            <button
              onClick={() => onUnlock(bush)}
              disabled={!affordable}
              className={`px-6 py-3 rounded-xl font-bold font-mono ${affordable ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-secondary text-muted-foreground cursor-not-allowed"} border border-border shadow-2xl`}
            >
              🔓 Hire {bush.farmer} · {fmtSol(bush.cost)} SOL
            </button>
          </div>
        )}
      </div>


      <div className="px-4 py-2 bg-background/70 border-t border-border flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground italic">"{bush.tagline}"</span>
        <span className="text-accent">{fmtSol(bush.perClick)} SOL / click</span>
      </div>
    </section>
  );
}
