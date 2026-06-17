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
import farmer9a from "@/assets/farmers/farmer-10.png.asset.json";
import farmer9b from "@/assets/farmers/farmer-11.png.asset.json";
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
  { id: 1,  name: "Surface Vein",      farmer: "Advyth",                portraits: [farmer1.url], cost: 0,      perClick: 0.0001, rarity: "Common",    tagline: "Pure conviction mining." },
  { id: 2,  name: "Headphone Tunnel",  farmer: "Ethan Prosper",         portraits: [farmer2.url], cost: 0.01,   perClick: 0.0008, rarity: "Common",    tagline: "Locked in, headphones on." },
  { id: 3,  name: "Duval Drift",       farmer: "Jackduval",             portraits: [farmer3.url], cost: 0.08,   perClick: 0.004,  rarity: "Common",    tagline: "Stache-powered ore." },
  { id: 4,  name: "Killua Shaft",      farmer: "Decu",                  portraits: [farmer4.url], cost: 0.5,    perClick: 0.018,  rarity: "Uncommon",  tagline: "Godspeed pickaxe swings." },
  { id: 5,  name: "Krabby Cavern",     farmer: "Sponge Miner",          portraits: [farmer5.url], cost: 3,      perClick: 0.07,   rarity: "Uncommon",  tagline: "Spatula in one hand, SOL in the other." },
  { id: 6,  name: "Cented Lode",       farmer: "Cented",                portraits: [farmer6.url], cost: 15,     perClick: 0.28,   rarity: "Rare",      tagline: "Cented sniffs out the alpha vein." },
  { id: 7,  name: "Kimchi Quarry",     farmer: "Kimchi",                portraits: [farmer7.url], cost: 90,     perClick: 1.1,    rarity: "Rare",      tagline: "Jet-set mining, no jet lag." },
  { id: 8,  name: "Cupsey Pit",        farmer: "Cupsey",                portraits: [farmer8.url], cost: 500,    perClick: 5,      rarity: "Epic",      tagline: "Salutes every bag he mines." },
  { id: 9,  name: "Twin Towers Vein",  farmer: "Ansem × Fazebanks",     portraits: [farmer9a.url, farmer9b.url], cost: 3000, perClick: 22,  rarity: "Legendary", tagline: "Two whales, one shaft." },
  { id: 10, name: "MAGA Mother Lode",  farmer: "DONALD TRUMP",          portraits: [trumpImg],    cost: 20000,  perClick: 120,    rarity: "FINAL BOSS", tagline: "The biggest, most tremendous SOL mine." },
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
  pendingSol: number;
  totalEarned: number;
  totalClicks: number;
  unlocked: number[];
  managers: number[];
  elevatorOp: boolean;
};
const defaultState = (): SaveState => ({ sol: 0, pendingSol: 0, totalEarned: 0, totalClicks: 0, unlocked: [1], managers: [], elevatorOp: false });

function loadState(wallet: string): SaveState {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + wallet);
    if (!raw) return defaultState();
    const p = JSON.parse(raw) as Partial<SaveState>;
    return {
      ...defaultState(),
      ...p,
      unlocked: p.unlocked && p.unlocked.length ? p.unlocked : [1],
      managers: p.managers ?? [],
    };
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
  return <Mine wallet={wallet} onLogout={() => { localStorage.removeItem("solfarm:active"); setWallet(null); }} />;
}

function Landing({ onLogin }: { onLogin: (w: string) => void }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden farm-sky">
      <div className="relative max-w-xl w-full neon-border rounded-2xl p-8 bg-card/70 backdrop-blur">
        <div className="text-xs font-mono text-accent uppercase tracking-widest mb-2">$SOLFARM · mineconomy v2</div>
        <h1 className="text-5xl font-black text-glow mb-3">Sol<span className="text-accent">Mine</span> ⛏</h1>
        <p className="text-muted-foreground mb-6">Plug in your wallet. Sink shafts. Swing pickaxes. Stack SOL ore. Beat Trump.</p>
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
          ENTER THE MINE →
        </button>
        <div className="grid grid-cols-3 gap-3 mt-6 text-center text-xs">
          <div className="bg-secondary/50 rounded-lg p-3"><div className="text-lg">⛏</div>10 miners</div>
          <div className="bg-secondary/50 rounded-lg p-3"><div className="text-lg">⚡</div>Click to chip ore</div>
          <div className="bg-secondary/50 rounded-lg p-3"><div className="text-lg">👑</div>Beat Trump</div>
        </div>
      </div>
    </div>
  );
}

type Floater = { id: number; x: number; y: number; text: string };

const SURFACE_H = 200;
const SHAFT_H = 240;
const CART_H = 64;

function Mine({ wallet, onLogout }: { wallet: string; onLogout: () => void }) {
  const [state, setState] = useState<SaveState>(() => loadState(wallet));
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [pickingRow, setPickingRow] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [autoTick, setAutoTick] = useState(0);
  const flId = useRef(0);

  useEffect(() => { saveState(wallet, state); }, [wallet, state]);

  // Auto-harvest from hired managers (1 swing/sec each)
  useEffect(() => {
    if (state.managers.length === 0) return;
    const t = setInterval(() => {
      setState((s) => {
        let gained = 0;
        for (const id of s.managers) {
          const b = BUSHES.find((x) => x.id === id);
          if (b && s.unlocked.includes(id)) gained += b.perClick;
        }
        if (gained === 0) return s;
        return { ...s, sol: s.sol + gained, totalEarned: s.totalEarned + gained };
      });
      setAutoTick((n) => n + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [state.managers]);

  // Elevator cart: ping-pong through stops. -1 = surface, 0..unlocked.length-1 = each shaft.
  const stops = useMemo(() => {
    const arr: number[] = [-1];
    for (let i = 0; i < BUSHES.length; i++) arr.push(i);
    return arr;
  }, []);
  const [cartIdx, setCartIdx] = useState(0); // index into stops
  const [cartDir, setCartDir] = useState(1);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [pickupFloor, setPickupFloor] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setCartIdx((idx) => {
        let next = idx + cartDir;
        let dir = cartDir;
        if (next >= stops.length) { next = stops.length - 2; dir = -1; }
        if (next < 0) { next = 1; dir = 1; }
        if (dir !== cartDir) setCartDir(dir);
        const stop = stops[next];
        if (stop === -1) {
          // arrived at surface — dump
          setCartLoaded(false);
        } else {
          // arrived at a floor — pick up
          setPickupFloor(stop);
          setCartLoaded(true);
          setTimeout(() => setPickupFloor((p) => (p === stop ? null : p)), 500);
        }
        return next;
      });
    }, 1300);
    return () => clearInterval(t);
  }, [cartDir, stops]);

  const cartStop = stops[cartIdx];
  // Position cart inside elevator-shaft (which starts at top: SURFACE_H, fills below)
  const cartTop = cartStop === -1
    ? -CART_H - 8 // hidden above into surface
    : cartStop * SHAFT_H + SHAFT_H / 2 - CART_H / 2;

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

  const managerCost = (b: Bush) => Math.max(0.001, Math.max(b.cost, b.perClick * 60) * 8);

  const hireManager = (bush: Bush) => {
    if (state.managers.includes(bush.id)) return;
    if (!state.unlocked.includes(bush.id)) { showToast("Unlock this shaft first."); return; }
    const cost = managerCost(bush);
    if (state.sol < cost) { showToast(`Need ${fmtSol(cost - state.sol)} more SOL for manager.`); return; }
    setState((s) => ({ ...s, sol: s.sol - cost, managers: [...s.managers, bush.id] }));
    showToast(`Foreman hired for ${bush.name}! Auto-mining…`);
  };

  const reset = () => {
    if (!confirm("Burn this mine and start over?")) return;
    setState(defaultState());
  };

  const nextLocked = useMemo(() => BUSHES.find((b) => !state.unlocked.includes(b.id)), [state.unlocked]);

  const autoPerSec = state.managers.reduce((acc, id) => {
    const b = BUSHES.find((x) => x.id === id);
    return acc + (b ? b.perClick : 0);
  }, 0);

  const totalH = SURFACE_H + BUSHES.length * SHAFT_H + 60;

  return (
    <div className="min-h-screen relative">
      {/* HUD */}
      <header className="sticky top-0 z-40" style={{ background: "rgba(10,8,14,0.55)", backdropFilter: "blur(10px) saturate(140%)", borderBottom: "1px solid oklch(0.7 0.18 175 / 0.35)", boxShadow: "0 0 24px oklch(0.6 0.2 175 / 0.25)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-2xl">⛏</span>
            <span className="font-black text-glow text-lg tracking-widest">SOL<span className="text-accent">MINE</span></span>
            <span className="hud-pill">CAVE SYSTEM</span>
          </div>
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            <span className="bal-frame"><span className="live-dot" /><span className="lbl">BAL</span><span className="val">{fmtSol(state.sol)}</span><span className="unit">SOL</span></span>
            <span className="hud-pill"><span className="lbl">EARNED</span><span className="val">{fmtSol(state.totalEarned)}</span></span>
            <span className="hud-pill"><span className="lbl">SWINGS</span><span className="val">{state.totalClicks.toLocaleString()}</span></span>
            <span className="hud-pill magenta"><span className="lbl">MINERS</span><span className="val">{state.unlocked.length}/10</span></span>
            <span className="hud-pill"><span className="live-dot" /><span className="lbl">AUTO</span><span className="val">{fmtSol(autoPerSec)}</span>SOL/s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hud-pill"><span className="lbl">WALLET</span><span className="val">{wallet.slice(0,4)}…{wallet.slice(-4)}</span></span>
            <button onClick={reset} className="hud-btn">Reset</button>
            <button onClick={onLogout} className="hud-btn">Logout</button>
          </div>
        </div>
        {nextLocked && (
          <div className="max-w-7xl mx-auto px-4 pb-3">
            <span className="hud-pill magenta"><span className="lbl">NEXT SHAFT</span>{nextLocked.farmer} · <span className="val">{fmtSol(nextLocked.cost)}</span> SOL</span>
          </div>
        )}
      </header>

      {/* Cave canvas */}
      <main className="cave-bg relative w-full" style={{ minHeight: totalH }}>
        {/* SURFACE */}
        <SurfaceLayer atSurface={cartStop === -1} carrying={cartLoaded && cartStop === -1} />

        {/* ELEVATOR SHAFT — spans from below surface to bottom */}
        <div className="elevator-shaft" style={{ height: BUSHES.length * SHAFT_H }}>
          <div className={`elevator-cart ${cartLoaded ? "loaded" : ""}`} style={{ top: cartTop }}>
            <div className="cable" />
            <div className="car-box">
              <div className="car-window" />
              <div className="car-coins" />
            </div>
          </div>
        </div>

        {/* MINE SHAFTS stacked vertically */}
        <div style={{ position: "relative", paddingTop: SURFACE_H }}>
          {BUSHES.map((bush, idx) => (
            <MineShaft
              key={bush.id}
              bush={bush}
              index={idx}
              unlocked={state.unlocked.includes(bush.id)}
              affordable={state.sol >= bush.cost}
              picking={pickingRow === bush.id}
              floaters={floaters}
              onHarvest={harvest}
              onUnlock={unlock}
              hasManager={state.managers.includes(bush.id)}
              managerCost={managerCost(bush)}
              canAffordManager={state.sol >= managerCost(bush)}
              onHireManager={hireManager}
              autoTick={autoTick}
              pickup={pickupFloor === idx}
            />
          ))}
        </div>

        <footer className="relative text-center text-xs font-mono py-6" style={{ color: "oklch(0.65 0.05 50)" }}>
          Not financial advice. Ore is not real. SOL is real. Trump is final boss.
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

function SurfaceLayer({ atSurface, carrying }: { atSurface: boolean; carrying: boolean }) {
  const transporterLeft = atSurface && carrying ? "calc(100% - 240px)" : "130px";
  return (
    <div className="surface-strip">
      {/* Pulley/headframe over the elevator opening */}
      <div className="pulley-frame">
        <svg viewBox="0 0 106 174">
          {/* legs */}
          <polygon points="12,170 46,30 60,30 24,170" fill="#5a3a22" stroke="#1a0e06" strokeWidth="2" />
          <polygon points="94,170 60,30 46,30 82,170" fill="#6b4528" stroke="#1a0e06" strokeWidth="2" />
          {/* cross braces */}
          <line x1="20" y1="120" x2="86" y2="120" stroke="#3a2614" strokeWidth="4" />
          <line x1="24" y1="80"  x2="82" y2="80"  stroke="#3a2614" strokeWidth="4" />
          {/* top platform */}
          <rect x="38" y="22" width="30" height="8" fill="#3a2614" stroke="#1a0e06" strokeWidth="1.5" />
          {/* pulley wheel */}
          <g className="pulley-wheel">
            <circle cx="53" cy="24" r="14" fill="#2d2d35" stroke="#0a0a0e" strokeWidth="2" />
            <circle cx="53" cy="24" r="9"  fill="none" stroke="#6a6a78" strokeWidth="1.5" />
            <line x1="53" y1="10" x2="53" y2="38" stroke="#6a6a78" strokeWidth="1.5" />
            <line x1="39" y1="24" x2="67" y2="24" stroke="#6a6a78" strokeWidth="1.5" />
            <circle cx="53" cy="24" r="3"  fill="#e0b94a" />
          </g>
          {/* cable to shaft */}
          <line x1="53" y1="38" x2="53" y2="174" stroke="#1a0e06" strokeWidth="2.5" />
          {/* warning placard */}
          <rect x="32" y="44" width="42" height="14" rx="2" fill="#0a0a0e" stroke="#e0b94a" strokeWidth="1" />
          <text x="53" y="54" textAnchor="middle" fontFamily="ui-monospace,monospace" fontSize="8" fontWeight="800" fill="#e0b94a">⚠ LIFT</text>
        </svg>
      </div>

      {/* Surface Transporter (wheels SOL from elevator → depot) */}
      <div className={`transporter ${carrying ? "carrying walking" : "empty"}`} style={{ left: transporterLeft }}>
        <div className="cart" />
        <div className="body" />
        <div className="head" />
      </div>

      {/* Cyberpunk Exchange Depot */}
      <div className="exchange-depot">
        <div className="ed-antenna" />
        <div className="ed-roof" />
        <div className="ed-base">
          <div className="ed-screen">SOL ⇄ $</div>
          <div className="ed-door" />
          <div className="ed-panel" />
        </div>
        <div className="ed-tag">EXCHANGE</div>
      </div>

      {/* Surface label */}
      <div style={{
        position: "absolute", top: 12, left: 180,
        fontFamily: "ui-monospace, JetBrains Mono, monospace",
        fontSize: 11, letterSpacing: "0.2em",
        color: "oklch(0.20 0.05 220)",
        fontWeight: 800,
      }}>SURFACE · DEPOT</div>
    </div>
  );
}


function MineShaft({
  bush, index, unlocked, affordable, picking, floaters, onHarvest, onUnlock,
  hasManager, managerCost, canAffordManager, onHireManager, autoTick, pickup,
}: {
  bush: Bush; index: number; unlocked: boolean; affordable: boolean; picking: boolean;
  floaters: Floater[]; onHarvest: (b: Bush, e: React.MouseEvent) => void; onUnlock: (b: Bush) => void;
  hasManager: boolean; managerCost: number; canAffordManager: boolean;
  onHireManager: (b: Bush) => void; autoTick: number; pickup: boolean;
}) {
  const [chips, setChips] = useState<{ id: number; x: number; y: number; cx: string; cy: string; cr: string }[]>([]);
  const [autoPops, setAutoPops] = useState<{ id: number; text: string }[]>([]);
  const [autoSwing, setAutoSwing] = useState(false);
  const [shattering, setShattering] = useState(false);
  const [pileLevel, setPileLevel] = useState(0); // 0..1+, scales the crystal pile
  const [loaderWalking, setLoaderWalking] = useState(false);

  const chipId = useRef(0);
  const popId = useRef(0);
  const portrait = bush.portraits[0];

  const bumpPile = () => setPileLevel((p) => Math.min(1.3, p + 0.18));

  // Auto-mine visual tick — pickaxe swing + popup + pile grows
  useEffect(() => {
    if (!hasManager || !unlocked || autoTick === 0) return;
    const id = ++popId.current;
    setAutoPops((p) => [...p, { id, text: `+${fmtSol(bush.perClick)}` }]);
    setAutoSwing(true);
    bumpPile();
    setTimeout(() => setAutoPops((p) => p.filter((x) => x.id !== id)), 850);
    setTimeout(() => setAutoSwing(false), 450);
  }, [autoTick, hasManager, unlocked, bush.perClick]);

  // Elevator arrives → loader runs the pile to the cart, pile resets
  useEffect(() => {
    if (!pickup || pileLevel === 0) return;
    setLoaderWalking(true);
    const t1 = setTimeout(() => setPileLevel(0), 280);
    const t2 = setTimeout(() => setLoaderWalking(false), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [pickup, pileLevel]);

  const handleClick = (e: React.MouseEvent) => {
    if (!unlocked) return;
    onHarvest(bush, e);
    bumpPile();
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

  const swinging = (picking || autoSwing) && unlocked;
  const hue = (index * 47) % 360;

  // Layout anchors (px from left edge of shaft cavity)
  const pileLeft = 28;       // SOL crystal pile
  const loaderRest = 90;     // loader stands next to pile
  const loaderToCart = 6;    // loader pushes cart to elevator entry
  const cartRest = 130;      // mini cart sits next to pile
  const cartToElevator = 8;  // cart docks at left edge for pickup

  return (
    <div className="mine-shaft" style={{ height: SHAFT_H }}>
      <div className="tunnel-link" />
      <div className="shaft-cavity">

        {/* SOL crystal pile (purple, scales with --pile) */}
        <div
          className={`sol-pile ${pickup ? "pickup" : ""}`}
          style={{ left: pileLeft, ["--pile" as never]: pileLevel } as React.CSSProperties}
        >
          <span className="coin" style={{ left: 8,  bottom: 0 }} />
          <span className="coin" style={{ left: 32, bottom: 0 }} />
          <span className="coin" style={{ left: 56, bottom: 0 }} />
          <span className="coin" style={{ left: 20, bottom: 18 }} />
          <span className="coin" style={{ left: 44, bottom: 18 }} />
          <span className="coin" style={{ left: 32, bottom: 34 }} />
        </div>

        {/* Loader miner (walks pile→elevator on pickup) */}
        <div
          className={`loader-mini ${loaderWalking ? "walking" : ""}`}
          style={{ left: loaderWalking ? loaderToCart : loaderRest }}
        >
          <div className="lm-body" />
          <div className="lm-head" />
        </div>

        {/* Mini hauler cart next to pile */}
        <div
          className={`loader-cart ${pickup && loaderWalking ? "" : pileLevel < 0.05 ? "hidden" : ""}`}
          style={{ left: loaderWalking ? cartToElevator : cartRest }}
        >
          <div className="lc-box" />
          <div className="lc-load" />
          <div className="lc-wheel l" />
          <div className="lc-wheel r" />
        </div>

        {/* Ore wall (right) — click target */}
        <div className="ore-wall" onClick={handleClick} style={{ cursor: unlocked ? "pointer" : "default" }}>
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
            <div key={f.id} className="floater absolute text-base" style={{ left: f.x, top: f.y }}>
              {f.text}
            </div>
          ))}
          {autoPops.map((p) => (
            <div key={p.id} className="floater auto absolute text-sm" style={{ left: "50%", top: 30 }}>
              {p.text}
            </div>
          ))}
        </div>

        {/* Miner sprite — pressed up against the ore wall */}
        <div className="absolute flex flex-col items-center" style={{ right: "57%", bottom: 18, zIndex: 5 }}>
          <div className={`farmer-stage char-sprite ${swinging ? "farmer-swing" : ""}`}>
            <div className="floor-shadow" />
            <img src={portrait} alt={bush.farmer} className="farmer-head" draggable={false} />
            <svg className="farmer-body" viewBox="0 0 100 130" width="76" height="98">
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
          </div>
          <span className="name-tag">{bush.farmer}{hasManager ? " · 👔" : ""}</span>
        </div>


        {/* Control panel (right edge) */}
        <div className="shaft-panel">
          <span className="hud-pill gold">
            <span className="lbl">LV</span><span className="val">{String(bush.id).padStart(2, "0")}</span>
          </span>
          <span className="hud-pill magenta">{bush.rarity}</span>
          <span className="hud-pill"><span className="lbl">RATE</span><span className="val">{fmtSol(bush.perClick)}</span>/hit</span>
          {unlocked && (
            hasManager ? (
              <span className="hud-pill" style={{ borderColor: "oklch(0.8 0.22 145 / 0.7)", boxShadow: "0 0 14px oklch(0.7 0.22 145 / 0.5)" }}>
                👔 <span className="val" style={{ color: "oklch(0.92 0.22 145)" }}>AUTO +{fmtSol(bush.perClick)}/s</span>
              </span>
            ) : (
              <button
                onClick={() => onHireManager(bush)}
                disabled={!canAffordManager}
                className={`hud-btn ${canAffordManager ? "success" : ""}`}
                title="Hires a foreman who auto-mines once per second."
              >
                👔 Hire Foreman · {fmtSol(managerCost)} SOL
              </button>
            )
          )}
        </div>

        {/* Locked overlay */}
        {!unlocked && (
          <div className={`locked-gate ${shattering ? "shattering" : ""}`}>
            <div className="holo-terminal">
              <div className="lock-icon">🔒</div>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", opacity: 0.75, marginBottom: 4 }}>
                SHAFT {String(bush.id).padStart(2, "0")} · {bush.rarity}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, textShadow: "0 0 8px oklch(0.78 0.22 175 / 0.8)" }}>
                {bush.name}
              </div>
              <button
                onClick={() => {
                  if (!affordable) { onUnlock(bush); return; }
                  setShattering(true);
                  setTimeout(() => { onUnlock(bush); setShattering(false); }, 550);
                }}
                disabled={!affordable}
                className={`hud-btn ${affordable ? "gold" : ""}`}
                style={{ padding: "0.6rem 1.1rem", fontSize: 12 }}
              >
                🔓 NEW SHAFT · {fmtSol(bush.cost)} SOL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
