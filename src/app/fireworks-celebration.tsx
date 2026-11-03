"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

type Burst = { id: number; x: number; y: number; palette: number };
const palettes = ["#ffd166", "#ff6b6b", "#7bdff2", "#cdb4db", "#95d5b2"];

export function FireworksCelebration({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);
  const launch = useCallback((x: number, y: number) => {
    const burst = { id: nextId.current++, x, y, palette: nextId.current % palettes.length };
    setBursts((current) => [...current, burst]);
    window.setTimeout(() => setBursts((current) => current.filter((item) => item.id !== burst.id)), 1500);
  }, []);

  useEffect(() => {
    if (!open) { setBursts([]); return; }
    const timers = [
      window.setTimeout(() => launch(window.innerWidth * 0.22, window.innerHeight * 0.32), 80),
      window.setTimeout(() => launch(window.innerWidth * 0.76, window.innerHeight * 0.28), 310),
      window.setTimeout(() => launch(window.innerWidth * 0.50, window.innerHeight * 0.22), 540),
      window.setTimeout(() => launch(window.innerWidth * 0.35, window.innerHeight * 0.48), 800),
    ];
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => { timers.forEach(window.clearTimeout); window.removeEventListener("keydown", handleKey); };
  }, [open, launch, onClose]);

  if (!open) return null;

  function fireAtClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    launch(event.clientX, event.clientY);
  }

  return <div className="celebration-overlay" role="dialog" aria-modal="true" aria-labelledby="celebration-title" onClick={fireAtClick}>
    <div className="firework-field" aria-hidden="true">{bursts.map((burst) => <div className="firework-burst" key={burst.id} style={{ left: burst.x, top: burst.y }}>
      {Array.from({ length: 24 }, (_, index) => <span className="firework-spark" key={index} style={{ "--angle": `${index * 15}deg`, "--travel": `${-(68 + (index % 5) * 13)}px`, "--spark-color": palettes[(index + burst.palette) % palettes.length], "--spark-delay": `${(index % 4) * 12}ms` } as CSSProperties} />)}
    </div>)}</div>
    <section className="celebration-card">
      <span className="celebration-kicker">ÚLTIMA PÁGINA</span>
      <h2 id="celebration-title">Livro concluído!</h2>
      <p>Mais uma história guardada com carinho.</p>
      <p className="celebration-hint">Clique em qualquer lugar para soltar mais fogos ✨</p>
      <button type="button" onClick={onClose}>Voltar à estante</button>
    </section>
  </div>;
}
