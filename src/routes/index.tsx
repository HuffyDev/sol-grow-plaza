import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: CrackedScreen,
});

function CrackedScreen() {
  const [blink, setBlink] = useState(true);
  const [glitch, setGlitch] = useState(0);

  useEffect(() => {
    const a = setInterval(() => setBlink((b) => !b), 600);
    const b = setInterval(() => setGlitch((g) => g + 1), 120);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);

  const jitter = (glitch % 5) - 2;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0000aa",
        color: "#ffffff",
        fontFamily: "'Courier New', Courier, monospace",
        padding: "48px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "left",
      }}
    >
      <div style={{ maxWidth: 820, width: "100%", transform: `translateX(${jitter}px)` }}>
        <div
          style={{
            background: "#c0c0c0",
            color: "#0000aa",
            padding: "2px 14px",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 1,
            display: "inline-block",
            marginBottom: 28,
          }}
        >
          SOL FARM TYCOON
        </div>

        <h1 style={{ fontSize: 28, lineHeight: 1.3, margin: "0 0 24px", fontWeight: 700 }}>
          A fatal exception 0xC0FFEE has occurred at 0028:SOL_FARM.EXE in module
          TYCOON.DLL. The current application will be terminated.
        </h1>

        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontSize: 16,
            lineHeight: 1.6,
            margin: "0 0 28px",
            fontFamily: "inherit",
          }}
        >
{`*  SYSTEM HALTED — INTEGRITY CHECK FAILED
*  GAME STATE: CRACKED / UNRECOVERABLE
*  REASON:      unauthorized pickaxe overflow
*  THREAD:      mining-loop @ shaft 0x09
*  HASH:        e7 4f a1 b2  9c 00 de ad   ba 5e ba 11 — MISMATCH

>  Press any key to terminate the application.
>  Press CTRL+ALT+DEL to restart your computer.
>  You will lose any unsaved SOL.`}
        </pre>

        <div style={{ fontSize: 18 }}>
          Press any key to continue _{blink ? "\u2588" : "\u00a0"}
        </div>
      </div>
    </div>
  );
}
