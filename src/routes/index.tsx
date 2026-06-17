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
  // 4 bushes per row visually
  const bushCount = 4;
  const lightColors = ["#ffcc66", "#ff66aa", "#66ddff", "#aaff66", "#ff9966"];
  const tone = lightColors[index % lightColors.length];

  return (
    <section className={`relative rounded-2xl overflow-hidden border border-border ${unlocked ? "row-active" : ""}`}>
      {/* Sky/back wall */}
      <div className="relative h-[260px]" style={{ background: "linear-gradient(180deg, oklch(0.18 0.08 290) 0%, oklch(0.22 0.10 295) 60%, oklch(0.16 0.06 145) 100%)" }}>
        {/* String lights */}
        <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="absolute inset-x-0 top-0 w-full h-12 pointer-events-none">
          <path d="M0 10 Q 250 50 500 20 T 1000 15" stroke="oklch(0.4 0.05 60)" strokeWidth="1.5" fill="none" />
          {Array.from({ length: 14 }).map((_, i) => {
            const x = (i + 0.5) * (1000 / 14);
            // approximate y on the curve
            const t = x / 1000;
            const y = 10 + Math.sin(t * Math.PI * 2) * 18 + 8;
            return (
              <g key={i} className="bulb" style={{ color: tone, animationDelay: `${i * 0.13}s` }}>
                <line x1={x} y1={y - 4} x2={x} y2={y} stroke="oklch(0.4 0.05 60)" strokeWidth="1" />
                <circle cx={x} cy={y + 4} r="4.5" fill={tone} />
              </g>
            );
          })}
        </svg>

        {/* Row label */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
          <div className="bg-background/70 backdrop-blur px-3 py-1 rounded-md border border-border font-mono text-xs">
            ROW {String(bush.id).padStart(2, "0")} · <span className="text-accent">{bush.rarity}</span>
          </div>
          <div className="text-sm font-bold text-glow">{bush.name}</div>
        </div>

        {/* Farmer(s) on the left */}
        <div className="absolute left-6 bottom-12 z-10 flex items-end gap-2">
          {bush.portraits.map((src, i) => (
            <div
              key={i}
              className={`farmer-wrap ${picking ? "farmer-pick" : ""}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="relative">
                <img
                  src={src}
                  alt={bush.farmer}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-primary bush-glow"
                  draggable={false}
                />
                {/* Name plate */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono bg-background/80 border border-border px-2 py-0.5 rounded">
                  {bush.farmer.split(" × ")[i] ?? bush.farmer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bushes */}
        <div className={`absolute right-6 bottom-6 z-10 flex items-end gap-4 ${!unlocked ? "row-locked" : ""}`}>
          {Array.from({ length: bushCount }).map((_, i) => (
            <div key={i} className="relative" onClick={(e) => onHarvest(bush, e)}>
              <div className="bush-shape">
                {/* berries */}
                <span className="berry" style={{ top: 18, left: 30 }} />
                <span className="berry" style={{ top: 28, right: 24 }} />
                <span className="berry" style={{ top: 48, left: 56 }} />
              </div>
              {/* floaters */}
              {floaters.filter((f) => i === 0).map((f) => (
                <div key={f.id} className="floater absolute pointer-events-none font-bold text-accent text-glow-gold text-sm" style={{ left: f.x, top: f.y }}>
                  {f.text}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Ground/dirt */}
        <div className="absolute inset-x-0 bottom-0 h-12" style={{
          background: "linear-gradient(180deg, oklch(0.28 0.08 60) 0%, oklch(0.18 0.05 55) 100%)",
          boxShadow: "inset 0 6px 12px oklch(0 0 0 / 0.5)",
        }}>
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: "radial-gradient(circle at 10% 50%, oklch(0 0 0 / 0.4) 2px, transparent 3px), radial-gradient(circle at 30% 70%, oklch(0 0 0 / 0.3) 2px, transparent 3px), radial-gradient(circle at 60% 40%, oklch(0 0 0 / 0.4) 2px, transparent 3px), radial-gradient(circle at 85% 60%, oklch(0 0 0 / 0.3) 2px, transparent 3px)",
          }} />
        </div>

        {/* Lock overlay CTA */}
        {!unlocked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/40 backdrop-blur-sm">
            <button
              onClick={() => onUnlock(bush)}
              disabled={!affordable}
              className={`px-6 py-3 rounded-xl font-bold font-mono ${affordable ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-secondary text-muted-foreground cursor-not-allowed"} border border-border`}
            >
              🔓 Hire {bush.farmer} · {fmtSol(bush.cost)} SOL
            </button>
          </div>
        )}
      </div>

      {/* Row footer info */}
      <div className="px-4 py-2 bg-background/60 border-t border-border flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground italic">"{bush.tagline}"</span>
        <span className="text-accent">{fmtSol(bush.perClick)} SOL / click</span>
      </div>
    </section>
  );
}
