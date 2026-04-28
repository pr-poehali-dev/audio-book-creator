import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Page, PROVIDERS, VOICES, PROJECTS, STATS } from "@/components/app-data";
import { WaveVisualizer, ProviderBadge, StatusBadge } from "@/components/AppShared";

// ─── Page: HOME ───────────────────────────────────────────────────────────────
export function HomePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden p-8 md:p-12 animate-fade-in"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.07) 100%)", border: "1px solid rgba(255,255,255,0.07)", opacity: 0 }}>
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.25), transparent 70%)" }} />
        <div className="absolute top-4 right-4 w-40 h-40 rounded-full border border-purple-500/10 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-muted-foreground font-ibm tracking-widest uppercase">Studio Online</span>
          </div>
          <h1 className="font-syne text-4xl md:text-5xl font-bold leading-tight mb-4">
            <span className="text-gradient">VoiceForge</span>{" "}
            <span className="text-foreground/90">Studio</span>
          </h1>
          <p className="text-muted-foreground text-lg font-ibm font-light mb-8 max-w-lg leading-relaxed">
            Синтез речи с Google, Amazon, Yandex и локальными офлайн-моделями QWEN3 и XTTS v2 в одном рабочем пространстве.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="btn-glow text-white font-syne font-semibold px-6 py-3 rounded-xl flex items-center gap-2"
              onClick={() => setPage("editor")}>
              <Icon name="Mic2" size={18} />Открыть редактор
            </button>
            <button className="px-6 py-3 rounded-xl font-ibm text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={() => setPage("projects")}>
              <Icon name="FolderOpen" size={16} />Мои проекты
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <div key={s.label}
            className={`rounded-xl p-5 animate-fade-in stagger-${i + 1}`}
            style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className={`w-9 h-9 rounded-lg mb-3 flex items-center justify-center ${s.color === "purple" ? "bg-purple-500/15" : "bg-cyan-400/15"}`}>
              <Icon name={s.icon} size={18} className={s.color === "purple" ? "text-purple-400" : "text-cyan-400"} />
            </div>
            <div className="font-syne text-2xl font-bold mb-1">{s.value}</div>
            <div className="text-xs text-muted-foreground font-ibm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Providers */}
      <div>
        <h2 className="font-syne text-lg font-semibold mb-4 text-foreground/80">Провайдеры</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {PROVIDERS.map((p, i) => (
            <div key={p.id}
              className={`rounded-xl p-4 flex items-center gap-3 animate-fade-in stagger-${i + 1}`}
              style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-3 h-3 rounded-full shrink-0"
                style={{ background: p.online ? "#4ade80" : p.color, boxShadow: `0 0 8px ${p.online ? "#4ade8066" : p.color + "55"}` }} />
              <span className="font-ibm text-sm flex-1">{p.label}</span>
              <span className={`text-[10px] font-ibm px-2 py-0.5 rounded ${p.online ? "bg-green-500/10 text-green-400" : "bg-purple-500/10 text-purple-400"}`}>
                {p.online ? "Online" : "Local"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne text-lg font-semibold text-foreground/80">Последние проекты</h2>
          <button className="text-xs text-purple-400 hover:text-purple-300 font-ibm transition-colors"
            onClick={() => setPage("projects")}>Все проекты →</button>
        </div>
        <div className="flex flex-col gap-2">
          {PROJECTS.slice(0, 3).map((proj, i) => (
            <div key={proj.id}
              className={`rounded-xl p-4 flex items-center gap-3 hover:bg-white/3 transition-all cursor-pointer animate-fade-in stagger-${i + 1}`}
              style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                <Icon name="FileAudio" size={15} className="text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-ibm text-sm font-medium truncate">{proj.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{proj.duration} · {proj.date}</div>
              </div>
              <ProviderBadge providerId={proj.provider} />
              <StatusBadge status={proj.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page: EDITOR ─────────────────────────────────────────────────────────────
export function EditorPage() {
  const [text, setText] = useState("Привет! Это VoiceForge Studio — мощный инструмент для синтеза речи с поддержкой облачных и локальных моделей.");
  const [provider, setProvider] = useState("yandex");
  const [voice, setVoice] = useState("alena");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [format, setFormat] = useState("MP3");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const filteredVoices = VOICES.filter(v => v.provider === provider);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => { setIsGenerating(false); setGenerated(true); }, 2000);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <div className="flex items-center justify-between">
        <h2 className="font-syne text-2xl font-bold">Редактор синтеза</h2>
        <span className="text-xs text-muted-foreground font-ibm">{text.length} символов</span>
      </div>

      {/* Provider selector */}
      <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-xs text-muted-foreground font-ibm uppercase tracking-wider mb-3">Провайдер</div>
        <div className="flex flex-wrap gap-2">
          {PROVIDERS.map(p => (
            <button key={p.id}
              onClick={() => { setProvider(p.id); const fv = VOICES.find(v => v.provider === p.id); if (fv) setVoice(fv.id); }}
              className="px-4 py-2 rounded-lg text-sm font-ibm transition-all flex items-center gap-1.5"
              style={provider === p.id
                ? { background: p.color + "28", color: p.color, border: `1px solid ${p.color}55` }
                : { background: "rgba(255,255,255,0.03)", color: "hsl(215 15% 55%)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className={`w-1.5 h-1.5 rounded-full ${p.online ? "bg-green-400" : "bg-purple-400"}`} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Text area */}
        <div className="rounded-xl p-5 flex flex-col gap-3 md:col-span-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-xs text-muted-foreground font-ibm uppercase tracking-wider">Текст для синтеза</div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            className="bg-transparent resize-none font-ibm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[120px] leading-relaxed w-full"
            placeholder="Введите текст..." />
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Пауза 1с",    insert: "<break time=\"1s\"/>" },
              { label: "Ударение",    insert: "<emphasis>" },
              { label: "Радость",     insert: "<prosody pitch=\"+2st\">" },
              { label: "Грусть",      insert: "<prosody pitch=\"-2st\">" },
              { label: "Нейтрально",  insert: "<prosody rate=\"medium\">" },
            ].map(tag => (
              <button key={tag.label}
                onClick={() => setText(t => t + tag.insert)}
                className="text-[11px] font-ibm px-3 py-1 rounded-full hover:bg-purple-500/10 hover:text-purple-400 transition-colors text-muted-foreground"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                + {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voices */}
        <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-xs text-muted-foreground font-ibm uppercase tracking-wider mb-3">Голос</div>
          <div className="flex flex-col gap-2">
            {filteredVoices.map(v => (
              <button key={v.id} onClick={() => setVoice(v.id)}
                className="flex items-center gap-3 p-3 rounded-lg transition-all text-left w-full"
                style={voice === v.id ? { background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" } : {}}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-syne font-bold ${v.gender === "F" ? "bg-pink-500/20 text-pink-400" : "bg-blue-500/20 text-blue-400"}`}>
                  {v.gender}
                </div>
                <div>
                  <div className="text-sm font-ibm">{v.name}</div>
                  <div className="text-[11px] text-muted-foreground">{v.lang}</div>
                </div>
                {voice === v.id && <Icon name="Check" size={14} className="ml-auto text-purple-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Params */}
        <div className="rounded-xl p-5 flex flex-col gap-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-xs text-muted-foreground font-ibm uppercase tracking-wider">Параметры</div>
          <div>
            <div className="flex justify-between text-sm font-ibm mb-2">
              <span>Скорость</span>
              <span className="text-purple-400">{speed.toFixed(1)}×</span>
            </div>
            <input type="range" min="0.5" max="2" step="0.1" value={speed}
              onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-ibm">
              <span>0.5×</span><span>1.0×</span><span>2.0×</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm font-ibm mb-2">
              <span>Тональность</span>
              <span className="text-cyan-400">{pitch > 0 ? `+${pitch}` : pitch} ст</span>
            </div>
            <input type="range" min="-6" max="6" step="1" value={pitch}
              onChange={e => setPitch(parseInt(e.target.value))} className="w-full" />
          </div>
          <div>
            <div className="text-sm font-ibm mb-2">Формат</div>
            <div className="flex gap-2">
              {["MP3","WAV","OGG","FLAC"].map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-ibm transition-all"
                  style={format === f
                    ? { background: "rgba(124,58,237,0.2)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.4)" }
                    : { background: "rgba(255,255,255,0.04)", color: "hsl(215 15% 55%)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Player */}
      <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <WaveVisualizer active={isPlaying} />
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => !isGenerating && (generated ? setIsPlaying(p => !p) : handleGenerate())}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0"
            style={isGenerating
              ? { background: "rgba(124,58,237,0.25)", cursor: "wait" }
              : { background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 24px rgba(124,58,237,0.5)" }}>
            {isGenerating
              ? <Icon name="Loader2" size={20} className="animate-spin text-white" />
              : generated
              ? <Icon name={isPlaying ? "Pause" : "Play"} size={20} className="text-white" />
              : <Icon name="Zap" size={20} className="text-white" />}
          </button>
          <div className="flex-1">
            <div className="font-ibm text-sm">
              {isGenerating ? "Синтезируется…" : generated ? "Готово к воспроизведению" : "Нажмите ⚡ для синтеза"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {text.length} симв. · {PROVIDERS.find(p => p.id === provider)?.label}
            </div>
          </div>
          {generated && (
            <button
              onClick={() => {
                const a = document.createElement("a");
                a.href = "#";
                a.download = `voiceforge_output.${format.toLowerCase()}`;
                a.click();
              }}
              className="px-4 py-2 rounded-lg text-sm font-ibm flex items-center gap-2 transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <Icon name="Download" size={14} className="text-cyan-400" />
              {format}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}