import { useState, useEffect } from "react";
import { PROVIDERS, Project } from "@/components/app-data";

export function WaveVisualizer({ active }: { active: boolean }) {
  const [heights, setHeights] = useState<number[]>(() => Array.from({ length: 32 }, () => 20));
  useEffect(() => {
    if (!active) { setHeights(Array.from({ length: 32 }, () => 20)); return; }
    const id = setInterval(() => {
      setHeights(Array.from({ length: 32 }, () => Math.random() * 70 + 20));
    }, 120);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="flex items-center gap-[2px] h-10">
      {heights.map((h, i) => (
        <div key={i} className="rounded-full transition-all duration-150"
          style={{
            width: 3,
            height: `${h}%`,
            background: i % 3 === 0
              ? "linear-gradient(180deg,#a855f7,#7c3aed)"
              : i % 3 === 1
              ? "linear-gradient(180deg,#22d3ee,#06b6d4)"
              : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </div>
  );
}

export function ProviderBadge({ providerId }: { providerId: string }) {
  const p = PROVIDERS.find(x => x.id === providerId);
  if (!p) return null;
  const label = p.id === "xtts" ? "XTTS v2" : p.label.split(" ")[0];
  return (
    <span className="provider-badge"
      style={{ background: p.color + "22", color: p.color, border: `1px solid ${p.color}44` }}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: Project["status"] }) {
  const map = {
    done:       { label: "Готово",   cls: "bg-green-500/15 text-green-400 border-green-500/25" },
    processing: { label: "Синтез…",  cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
    draft:      { label: "Черновик", cls: "bg-muted text-muted-foreground border-border" },
  };
  const s = map[status];
  return <span className={`provider-badge border ${s.cls}`}>{s.label}</span>;
}
