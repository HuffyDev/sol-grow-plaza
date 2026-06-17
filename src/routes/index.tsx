import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

export const Route = createFileRoute("/")({
  component: SolFarm,
});

type Bush = {
  id: number;
  name: string;
  farmer: string;
  handle: string;
  emoji: string; // bush emoji
  avatar: string; // farmer emoji
  cost: number; // SOL to unlock
  perClick: number; // SOL per click
  tagline: string;
  rarity: string;
};

const BUSHES: Bush[] = [
  { id: 1, name: "Sad Sapling",        farmer: "Bob the Bagholder", handle: "@bob_bags",     emoji: "🌱", avatar: "🧓", cost: 0,       perClick: 0.0001, rarity: "Common",    tagline: "Down 90% and still farming." },
  { id: 2, name: "Pump Patch",         farmer: "Ansem",              handle: "@blknoiz06",    emoji: "🌿", avatar: "🐺", cost: 0.01,    perClick: 0.001,  rarity: "Common",    tagline: "Wif knife." },
  { id: 3, name: "Murad Meadow",       farmer: "Murad",              handle: "@MustStopMurad",emoji: "☘️", avatar: "🧿", cost: 0.1,     perClick: 0.005,  rarity: "Uncommon",  tagline: "The supercycle bush." },
  { id: 4, name: "Hsaka Hedge",        farmer: "Hsaka",              handle: "@HsakaTrades",  emoji: "🍀", avatar: "🥷", cost: 0.75,    perClick: 0.02,   rarity: "Uncommon",  tagline: "Vibes-based farming." },
  { id: 5, name: "Cobie Crop",         farmer: "Cobie",              handle: "@cobie",        emoji: "🌳", avatar: "🧔", cost: 4,       perClick: 0.08,   rarity: "Rare",      tagline: "Tweets while farming." },
  { id: 6, name: "Inverse Inverter",   farmer: "Inversebrah",        handle: "@inversebrah",  emoji: "🌴", avatar: "🤡", cost: 20,      perClick: 0.3,    rarity: "Rare",      tagline: "Fade me, harvest more." },
  { id: 7, name: "GCR Greenhouse",     farmer: "GCR",                handle: "@GiganticRebirth", emoji: "🎋", avatar: "🐋", cost: 120,   perClick: 1.2,    rarity: "Epic",      tagline: "Whale-sized harvests." },
  { id: 8, name: "Toly's Validator",   farmer: "Toly",               handle: "@aeyakovenko",  emoji: "🪴", avatar: "👑", cost: 800,     perClick: 6,      rarity: "Legendary", tagline: "Validates SOL straight from source." },
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
  unlocked: number[]; // bush ids
};

function defaultState(): SaveState {
  return { sol: 0, totalEarned: 0, totalClicks: 0, unlocked: [1] };
}

function SolFarm() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const w = localStorage.getItem("solfarm:wallet");
    if (w) setWallet(w);
  }, []);

  function connect(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    if (!isValidSolAddress(v)) {
      setErr("That doesn't look like a Solana address (32-44 base58 chars).");
      return;
    }
    localStorage.setItem("solfarm:wallet", v);
    setWallet(v);
  }

  function disconnect() {
    localStorage.removeItem("solfarm:wallet");
    setWallet(null);
    setInput("");
  }

  if (!wallet) return <Landing input={input} setInput={setInput} err={err} onSubmit={connect} />;
  return <Farm wallet={wallet} onDisconnect={disconnect} />;
}

/* ---------------------------- LANDING ---------------------------- */

function Landing({
  input, setInput, err, onSubmit,
}: { input: string; setInput: (s: string) => void; err: string; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <main className="relative min-h-screen grid-bg">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-24">
        <header className="flex items-center justify-between">
          <Logo />
          <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition">How it works</a>
        </header>

        <section className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
            <span className="size-1.5 rounded-full bg-accent animate-pulse" /> Season 1 · Live
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold leading-[1.05] text-glow">
            Farm <span className="text-primary">SOL</span> with the<br/>most degen traders alive.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Plant your wallet. Click the bush. Stack imaginary SOL. Unlock 8 legendary farmers — from Bob the Bagholder all the way up to Toly himself.
          </p>

          <form onSubmit={onSubmit} className="mt-10 mx-auto max-w-xl">
            <div className="relative rounded-2xl neon-border bg-card/60 backdrop-blur p-2 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your Solana wallet address…"
                className="flex-1 bg-transparent px-4 py-3 font-mono text-sm outline-none placeholder:text-muted-foreground"
                spellCheck={false}
              />
              <button
                type="submit"
                className="rounded-xl bg-primary text-primary-foreground font-semibold px-5 py-3 hover:brightness-110 active:scale-[0.98] transition shadow-[0_0_30px_oklch(0.65_0.28_305/0.5)]"
              >
                Enter Farm →
              </button>
            </div>
            {err ? <p className="mt-3 text-sm text-destructive">{err}</p> : (
              <p className="mt-3 text-xs text-muted-foreground">
                Read-only. We never touch your funds. Progress is saved locally to your address.
              </p>
            )}
          </form>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            {[
              { k: "8", v: "Trader Bushes" },
              { k: "0%", v: "Real Money Risk" },
              { k: "∞", v: "Click Stamina" },
              { k: "1", v: "Toly per Farm" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl border border-border/60 bg-card/40 p-4">
                <div className="text-2xl font-bold text-glow-gold">{s.k}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="mt-28">
          <h2 className="text-center text-sm uppercase tracking-[0.3em] text-muted-foreground">How the farm works</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              { t: "1. Connect", d: "Paste any Solana address. Your farm state is tied to it." },
              { t: "2. Click", d: "Tap the glowing SOL bush. Each click harvests SOL. Famously simple." },
              { t: "3. Upgrade", d: "Spend SOL to unlock the next farmer. Faster bushes, fatter clicks." },
            ].map((s) => (
              <div key={s.t} className="rounded-2xl border border-border bg-card/50 p-6">
                <div className="font-semibold text-lg">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="size-9 rounded-lg bg-gradient-to-br from-primary via-neon to-accent grid place-items-center font-bold text-primary-foreground shadow-[0_0_25px_oklch(0.65_0.28_305/0.55)]">
        ◎
      </div>
      <div className="leading-tight">
        <div className="font-bold tracking-wide">SolFarm</div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">click to harvest</div>
      </div>
    </div>
  );
}

/* ------------------------------ FARM ------------------------------ */

type Floater = { id: number; x: number; y: number; amount: number };

function Farm({ wallet, onDisconnect }: { wallet: string; onDisconnect: () => void }) {
  const key = STORAGE_PREFIX + wallet;
  const [state, setState] = useState<SaveState>(() => {
    if (typeof window === "undefined") return defaultState();
    try {
      const raw = localStorage.getItem(key);
      if (raw) return { ...defaultState(), ...JSON.parse(raw) };
    } catch {}
    return defaultState();
  });
  const [activeBushId, setActiveBushId] = useState<number>(() => {
    const last = Math.max(...(state.unlocked.length ? state.unlocked : [1]));
    return last;
  });
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const floaterId = useRef(0);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const activeBush = useMemo(
    () => BUSHES.find((b) => b.id === activeBushId) ?? BUSHES[0],
    [activeBushId]
  );

  function harvest(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const amount = activeBush.perClick;
    setState((s) => ({
      ...s,
      sol: s.sol + amount,
      totalEarned: s.totalEarned + amount,
      totalClicks: s.totalClicks + 1,
    }));
    const id = ++floaterId.current;
    setFloaters((f) => [...f, { id, x, y, amount }]);
    setTimeout(() => setFloaters((f) => f.filter((fl) => fl.id !== id)), 1100);
    setShake(true);
    setTimeout(() => setShake(false), 250);
  }

  function unlock(b: Bush) {
    if (state.unlocked.includes(b.id)) {
      setActiveBushId(b.id);
      return;
    }
    if (state.sol < b.cost) {
      setToast(`Need ${fmtSol(b.cost - state.sol)} more SOL to hire ${b.farmer}.`);
      return;
    }
    setState((s) => ({
      ...s,
      sol: s.sol - b.cost,
      unlocked: [...s.unlocked, b.id],
    }));
    setActiveBushId(b.id);
    setToast(`Hired ${b.farmer}. New bush unlocked!`);
  }

  function reset() {
    if (!confirm("Burn this farm and start over?")) return;
    setState(defaultState());
    setActiveBushId(1);
  }

  const short = wallet.slice(0, 4) + "…" + wallet.slice(-4);
  const progress = state.unlocked.length / BUSHES.length;

  return (
    <main className="relative min-h-screen grid-bg">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="font-mono text-muted-foreground">{short}</span>
            </div>
            <button onClick={reset} className="text-xs text-muted-foreground hover:text-destructive transition px-2 py-1.5">Reset</button>
            <button onClick={onDisconnect} className="text-xs rounded-md border border-border bg-card/60 px-3 py-1.5 hover:border-primary/60 transition">Disconnect</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Main bush stage */}
        <section className="relative rounded-3xl neon-border bg-gradient-to-b from-card/80 to-card/30 overflow-hidden">
          <div className="absolute inset-0 scanlines" />
          {/* Stage */}
          <div className="relative p-6 md:p-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Now Farming</div>
                <h2 className="text-2xl md:text-3xl font-bold mt-1">{activeBush.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 italic">"{activeBush.tagline}"</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3">
                <div className="text-3xl drift">{activeBush.avatar}</div>
                <div>
                  <div className="text-sm font-semibold">{activeBush.farmer}</div>
                  <div className="text-xs font-mono text-muted-foreground">{activeBush.handle}</div>
                </div>
              </div>
            </div>

            {/* Big balance */}
            <div className="mt-8 flex items-baseline gap-3 justify-center">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Balance</span>
            </div>
            <div className="mt-1 text-center">
              <div className="text-6xl md:text-7xl font-bold text-glow-gold font-mono tabular-nums">
                {fmtSol(state.sol)}
              </div>
              <div className="mt-1 text-sm text-primary font-semibold tracking-widest">SOL</div>
            </div>

            {/* Bush click area */}
            <div className="relative mt-10 grid place-items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full pulse-ring border-2 border-primary/40" />
                <button
                  onClick={harvest}
                  className={`relative size-56 md:size-72 rounded-full grid place-items-center bush-glow
                              bg-gradient-to-br from-primary/30 via-neon/20 to-accent/20
                              border border-primary/40 active:scale-95 transition-transform select-none ${shake ? "shake" : ""}`}
                  aria-label={`Harvest from ${activeBush.name}`}
                >
                  <span className="text-[7rem] md:text-[9rem] drop-shadow-[0_0_30px_oklch(0.78_0.22_320/0.6)] leading-none">
                    {activeBush.emoji}
                  </span>
                  {floaters.map((f) => (
                    <span
                      key={f.id}
                      className="floater absolute pointer-events-none text-gold font-bold font-mono text-glow-gold text-lg"
                      style={{ left: f.x, top: f.y } as CSSProperties}
                    >
                      +{fmtSol(f.amount)}
                    </span>
                  ))}
                </button>
              </div>
              <div className="mt-6 text-sm text-muted-foreground">
                Click to harvest <span className="text-foreground font-mono">+{fmtSol(activeBush.perClick)} SOL</span> per tap
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-10 grid grid-cols-3 gap-3">
              <Stat label="Total Clicks" value={state.totalClicks.toLocaleString()} />
              <Stat label="Lifetime SOL" value={fmtSol(state.totalEarned)} />
              <Stat label="Farmers Hired" value={`${state.unlocked.length}/${BUSHES.length}`} />
            </div>
          </div>
        </section>

        {/* Sidebar: bushes */}
        <aside className="space-y-3">
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
              <span>Farm Progress</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-background overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-neon to-accent transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          <h3 className="text-xs uppercase tracking-[0.25em] text-muted-foreground px-1">The Roster</h3>
          <div className="space-y-2">
            {BUSHES.map((b) => {
              const owned = state.unlocked.includes(b.id);
              const active = b.id === activeBushId;
              const affordable = state.sol >= b.cost;
              const prevOwned = b.id === 1 || state.unlocked.includes(b.id - 1);
              const canBuy = !owned && prevOwned && affordable;
              const locked = !owned && !prevOwned;

              return (
                <button
                  key={b.id}
                  onClick={() => unlock(b)}
                  disabled={locked}
                  className={[
                    "w-full text-left rounded-xl border p-3 flex items-center gap-3 transition group",
                    active ? "border-primary bg-primary/10 neon-border" :
                    owned ? "border-border bg-card/60 hover:border-primary/60" :
                    canBuy ? "border-accent/50 bg-accent/5 hover:border-accent" :
                    "border-border/40 bg-card/30 opacity-60 cursor-not-allowed",
                  ].join(" ")}
                >
                  <div className={`size-12 shrink-0 rounded-lg grid place-items-center text-2xl
                                  ${owned ? "bg-gradient-to-br from-primary/30 to-accent/20" : "bg-background"}`}>
                    {locked ? "🔒" : b.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold truncate">{b.name}</div>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{b.rarity}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {b.avatar} {b.farmer} · <span className="font-mono">+{fmtSol(b.perClick)}/click</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {owned ? (
                      <span className={`text-[10px] uppercase tracking-widest ${active ? "text-primary" : "text-accent"}`}>
                        {active ? "Active" : "Owned"}
                      </span>
                    ) : (
                      <div>
                        <div className={`text-xs font-mono ${affordable ? "text-gold text-glow-gold" : "text-muted-foreground"}`}>
                          {fmtSol(b.cost)} ◎
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                          {locked ? "Locked" : canBuy ? "Hire" : "Save up"}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-full border border-primary/50 bg-card/90 backdrop-blur px-4 py-2 text-sm shadow-[0_0_30px_oklch(0.65_0.28_305/0.4)]">
          {toast}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 px-3 py-3 text-center">
      <div className="font-mono text-lg font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
