import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────
type Page = "home" | "editor" | "projects" | "library" | "export" | "settings" | "profile" | "help";

interface NavItem { id: Page; label: string; icon: string; }
interface Voice { id: string; name: string; lang: string; gender: "M" | "F"; provider: string; }
interface Project { id: string; name: string; duration: string; date: string; provider: string; status: "done" | "processing" | "draft"; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV: NavItem[] = [
  { id: "home",     label: "Главная",    icon: "LayoutDashboard" },
  { id: "editor",   label: "Редактор",   icon: "Mic2" },
  { id: "projects", label: "Проекты",    icon: "FolderOpen" },
  { id: "library",  label: "Библиотека", icon: "Library" },
  { id: "export",   label: "Экспорт",    icon: "Download" },
  { id: "settings", label: "Настройки",  icon: "Settings2" },
  { id: "profile",  label: "Профиль",    icon: "UserCircle" },
  { id: "help",     label: "Справка",    icon: "LifeBuoy" },
];

const PROVIDERS = [
  { id: "google",  label: "Google TTS",   color: "#4285f4", online: true },
  { id: "amazon",  label: "Amazon Polly", color: "#ff9900", online: true },
  { id: "yandex",  label: "Yandex TTS",   color: "#fc3f1d", online: true },
  { id: "qwen3",   label: "QWEN3",        color: "#a855f7", online: false },
  { id: "xtts",    label: "XTTS v2",      color: "#22d3ee", online: false },
];

const VOICES: Voice[] = [
  { id: "wavenet-a", name: "Wavenet-A",    lang: "ru-RU", gender: "F", provider: "google" },
  { id: "wavenet-b", name: "Wavenet-B",    lang: "ru-RU", gender: "M", provider: "google" },
  { id: "tatyana",   name: "Tatyana",      lang: "ru-RU", gender: "F", provider: "amazon" },
  { id: "maxim",     name: "Maxim",        lang: "ru-RU", gender: "M", provider: "amazon" },
  { id: "alena",     name: "Алёна",        lang: "ru-RU", gender: "F", provider: "yandex" },
  { id: "ermil",     name: "Ермил",        lang: "ru-RU", gender: "M", provider: "yandex" },
  { id: "qwen-ru-f", name: "QWEN Лина",    lang: "ru-RU", gender: "F", provider: "qwen3" },
  { id: "xtts-m1",   name: "XTTS Голос 1", lang: "ru-RU", gender: "M", provider: "xtts" },
  { id: "xtts-f1",   name: "XTTS Голос 2", lang: "ru-RU", gender: "F", provider: "xtts" },
];

const PROJECTS: Project[] = [
  { id: "1", name: "Реклама кофейни",   duration: "0:42",  date: "25 апр", provider: "yandex", status: "done" },
  { id: "2", name: "Аудиокнига гл. 3",  duration: "18:30", date: "24 апр", provider: "xtts",   status: "done" },
  { id: "3", name: "Подкаст введение",  duration: "3:15",  date: "24 апр", provider: "google", status: "processing" },
  { id: "4", name: "Обучающий ролик",   duration: "5:00",  date: "23 апр", provider: "amazon", status: "draft" },
  { id: "5", name: "IVR-меню",          duration: "1:20",  date: "22 апр", provider: "google", status: "done" },
];

const STATS = [
  { label: "Символов сегодня", value: "12 480", icon: "Type",   color: "purple" },
  { label: "Синтезировано",    value: "47 мин",  icon: "Clock",  color: "cyan" },
  { label: "Проектов",         value: "23",      icon: "Layers", color: "purple" },
  { label: "Голосов",          value: "9",       icon: "Mic2",   color: "cyan" },
];

// ─── Wave Visualizer ──────────────────────────────────────────────────────────
function WaveVisualizer({ active }: { active: boolean }) {
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

// ─── Provider Badge ───────────────────────────────────────────────────────────
function ProviderBadge({ providerId }: { providerId: string }) {
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

function StatusBadge({ status }: { status: Project["status"] }) {
  const map = {
    done:       { label: "Готово",   cls: "bg-green-500/15 text-green-400 border-green-500/25" },
    processing: { label: "Синтез…",  cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
    draft:      { label: "Черновик", cls: "bg-muted text-muted-foreground border-border" },
  };
  const s = map[status];
  return <span className={`provider-badge border ${s.cls}`}>{s.label}</span>;
}

// ─── Page: HOME ───────────────────────────────────────────────────────────────
function HomePage({ setPage }: { setPage: (p: Page) => void }) {
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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-syne font-bold text-sm"
                style={{ background: p.color + "22", color: p.color }}>
                {p.label[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-ibm text-sm font-medium truncate">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.online ? "Облачный API" : "Локальная модель"}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${p.online ? "bg-green-400" : "bg-purple-400"}`} />
                <span className="text-[10px] text-muted-foreground">{p.online ? "Online" : "Offline"}</span>
              </div>
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
              className={`rounded-xl p-4 flex items-center gap-4 hover:bg-white/4 transition-colors cursor-pointer animate-fade-in stagger-${i + 1}`}
              style={{ opacity: 0, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
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
function EditorPage() {
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
            {["Пауза 1с", "Ударение", "Радость", "Грусть", "Нейтрально"].map(tag => (
              <button key={tag}
                className="text-[11px] font-ibm px-3 py-1 rounded-full hover:bg-purple-500/10 hover:text-purple-400 transition-colors text-muted-foreground"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                + {tag}
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
            <button className="px-4 py-2 rounded-lg text-sm font-ibm flex items-center gap-2 hover:bg-white/5 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <Icon name="Download" size={14} />Скачать
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page: PROJECTS ───────────────────────────────────────────────────────────
function ProjectsPage() {
  const [filter, setFilter] = useState<"all"|"done"|"processing"|"draft">("all");
  const filtered = filter === "all" ? PROJECTS : PROJECTS.filter(p => p.status === filter);

  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <div className="flex items-center justify-between">
        <h2 className="font-syne text-2xl font-bold">Проекты</h2>
        <button className="text-white text-sm font-ibm px-4 py-2 rounded-xl flex items-center gap-2"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
          <Icon name="Plus" size={16} />Новый
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(["all","done","processing","draft"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-xs font-ibm transition-all"
            style={filter === f
              ? { background: "rgba(124,58,237,0.2)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.35)" }
              : { background: "rgba(255,255,255,0.04)", color: "hsl(215 15% 55%)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {f === "all" ? "Все" : f === "done" ? "Готово" : f === "processing" ? "В процессе" : "Черновики"}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((proj, i) => (
          <div key={proj.id}
            className={`rounded-xl p-5 flex items-center gap-4 hover:bg-white/3 transition-all cursor-pointer group animate-fade-in stagger-${i+1}`}
            style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
              <Icon name="FileAudio" size={18} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-syne font-semibold truncate">{proj.name}</div>
              <div className="text-xs text-muted-foreground font-ibm mt-0.5">{proj.duration} · {proj.date}</div>
            </div>
            <ProviderBadge providerId={proj.provider} />
            <StatusBadge status={proj.status} />
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 rounded-lg hover:bg-white/5"><Icon name="Play" size={14} className="text-purple-400"/></button>
              <button className="p-2 rounded-lg hover:bg-white/5"><Icon name="Download" size={14} className="text-cyan-400"/></button>
              <button className="p-2 rounded-lg hover:bg-white/5"><Icon name="Trash2" size={14} className="text-red-400"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page: LIBRARY ────────────────────────────────────────────────────────────
function LibraryPage() {
  const [search, setSearch] = useState("");
  const filtered = VOICES.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.provider.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <div className="flex items-center justify-between">
        <h2 className="font-syne text-2xl font-bold">Библиотека голосов</h2>
        <span className="text-xs text-muted-foreground font-ibm">{VOICES.length} голосов</span>
      </div>
      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по имени или провайдеру…"
          className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-ibm bg-transparent focus:outline-none transition-all"
          style={{ border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)" }} />
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((v, i) => (
          <div key={v.id}
            className={`rounded-xl p-5 flex flex-col gap-3 hover:bg-white/3 cursor-pointer transition-all animate-fade-in stagger-${(i%8)+1}`}
            style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-syne font-bold text-base ${v.gender === "F" ? "bg-pink-500/20 text-pink-400" : "bg-blue-500/20 text-blue-400"}`}>
                {v.name[0]}
              </div>
              <div>
                <div className="font-syne font-semibold text-sm">{v.name}</div>
                <div className="text-[11px] text-muted-foreground font-ibm">{v.lang} · {v.gender === "F" ? "Женский" : "Мужской"}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <ProviderBadge providerId={v.provider} />
              <button className="text-[11px] font-ibm text-purple-400 hover:text-purple-300 transition-colors">
                Использовать →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page: EXPORT ─────────────────────────────────────────────────────────────
function ExportPage() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <h2 className="font-syne text-2xl font-bold">Экспорт</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: "Пакетный экспорт",     desc: "Выгрузите несколько файлов в ZIP-архиве", icon: "Package", color: "purple" },
          { title: "Облачное хранилище",   desc: "Google Drive, Yandex Disk, S3", icon: "Cloud", color: "cyan" },
          { title: "API-интеграция",       desc: "Подключите к своему приложению через REST API", icon: "Code2", color: "purple" },
          { title: "Вебхук",              desc: "Автодоставка готовых файлов на ваш сервер", icon: "Webhook", color: "cyan" },
        ].map((item, i) => (
          <div key={item.title}
            className={`rounded-xl p-6 flex gap-4 cursor-pointer hover:bg-white/3 transition-all animate-fade-in stagger-${i+1}`}
            style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${item.color === "purple" ? "bg-purple-500/15" : "bg-cyan-400/15"}`}>
              <Icon name={item.icon} size={22} className={item.color === "purple" ? "text-purple-400" : "text-cyan-400"} />
            </div>
            <div>
              <div className="font-syne font-semibold mb-1">{item.title}</div>
              <div className="text-sm text-muted-foreground font-ibm">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="font-syne font-semibold mb-4">История экспортов</div>
        {["project_cafe_ad.mp3","audiobook_ch3.wav","podcast_intro.mp3"].map((f, i) => (
          <div key={f} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
            <Icon name="FileAudio" size={15} className="text-purple-400" />
            <span className="font-ibm text-sm flex-1">{f}</span>
            <span className="text-xs text-muted-foreground">{["сегодня 14:32","вчера 18:20","вчера 09:15"][i]}</span>
            <button className="px-3 py-1 rounded-lg text-xs font-ibm flex items-center gap-1 hover:bg-white/5 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <Icon name="Download" size={12} />Скачать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page: SETTINGS ───────────────────────────────────────────────────────────
function SettingsPage() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <h2 className="font-syne text-2xl font-bold">Настройки</h2>
      {[
        {
          title: "API-ключи", icon: "Key",
          items: [
            { label: "Google Cloud TTS",        placeholder: "AIzaSy…",  connected: true },
            { label: "Amazon Polly (AWS Key ID)",placeholder: "AKIA…",    connected: true },
            { label: "Yandex SpeechKit",         placeholder: "y0_Ag…",   connected: false },
          ]
        },
        {
          title: "Офлайн-модели", icon: "HardDrive",
          items: [
            { label: "QWEN3 — путь к модели",  placeholder: "/models/qwen3/…",   connected: false },
            { label: "XTTS v2 — путь к модели", placeholder: "/models/xtts_v2/…", connected: false },
          ]
        }
      ].map((section, si) => (
        <div key={section.title}
          className={`rounded-xl p-6 animate-fade-in stagger-${si+1}`}
          style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Icon name={section.icon} size={18} className="text-purple-400" />
            <div className="font-syne font-semibold">{section.title}</div>
          </div>
          <div className="flex flex-col gap-4">
            {section.items.map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-ibm text-muted-foreground">{item.label}</label>
                  {item.connected && (
                    <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/25 rounded px-2 py-0.5 font-ibm">Подключено</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="password" placeholder={item.placeholder}
                    className="flex-1 rounded-lg px-3 py-2.5 text-sm font-ibm bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
                    style={{ border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)" }} />
                  <button className="px-4 py-2.5 rounded-lg text-sm font-ibm text-purple-400 hover:bg-white/5 transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.09)" }}>
                    {item.connected ? "Обновить" : "Сохранить"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-xl p-6 animate-fade-in stagger-3"
        style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Sliders" size={18} className="text-cyan-400" />
          <div className="font-syne font-semibold">Общие</div>
        </div>
        <div className="flex flex-col gap-4">
          {[
            { label: "Автосохранение проектов",             on: true },
            { label: "Уведомления о завершении синтеза",    on: true },
            { label: "Офлайн-режим по умолчанию",           on: false },
            { label: "Сжатие аудио при экспорте",           on: false },
          ].map(opt => (
            <label key={opt.label} className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-ibm text-foreground/80 group-hover:text-foreground transition-colors">{opt.label}</span>
              <div className="w-10 h-5 rounded-full relative transition-colors"
                style={{ background: opt.on ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)" }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ transform: opt.on ? "translateX(20px)" : "translateX(2px)" }} />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page: PROFILE ────────────────────────────────────────────────────────────
function ProfilePage() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <h2 className="font-syne text-2xl font-bold">Профиль</h2>
      <div className="rounded-xl p-8 flex items-center gap-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-syne font-bold text-3xl text-white animate-pulse-glow shrink-0"
          style={{ background: "linear-gradient(135deg,#7c3aed,#22d3ee)" }}>
          A
        </div>
        <div>
          <div className="font-syne text-xl font-bold">Алекс Голосов</div>
          <div className="text-muted-foreground font-ibm text-sm mt-0.5">alex@voiceforge.studio</div>
          <div className="flex gap-2 mt-3">
            <span className="provider-badge bg-purple-500/15 text-purple-400 border border-purple-500/25">Pro план</span>
            <span className="provider-badge bg-green-500/15 text-green-400 border border-green-500/25">Активен</span>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Использовано символов", value: "1.2М / 5М",    icon: "Type" },
          { label: "Хранилище",             value: "2.4 ГБ / 10 ГБ", icon: "Database" },
          { label: "API-запросов",          value: "847 / 10 000", icon: "Activity" },
        ].map((s, i) => (
          <div key={s.label}
            className={`rounded-xl p-5 animate-fade-in stagger-${i+1}`}
            style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Icon name={s.icon} size={18} className="text-purple-400 mb-3" />
            <div className="font-syne font-bold text-lg">{s.value}</div>
            <div className="text-xs text-muted-foreground font-ibm mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page: HELP ───────────────────────────────────────────────────────────────
function HelpPage() {
  const articles = [
    { title: "Быстрый старт: первый синтез",      icon: "Rocket",    cat: "Начало работы" },
    { title: "Подключение Google Cloud TTS",       icon: "Globe",     cat: "Интеграции" },
    { title: "Настройка Amazon Polly",             icon: "Cloud",     cat: "Интеграции" },
    { title: "Установка XTTS v2 локально",         icon: "HardDrive", cat: "Офлайн" },
    { title: "SSML-разметка пауз и эмоций",        icon: "Code2",     cat: "Продвинуто" },
    { title: "Пакетная обработка текстов",         icon: "Layers",    cat: "Продвинуто" },
  ];
  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <h2 className="font-syne text-2xl font-bold">Справка</h2>
      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input placeholder="Поиск по статьям…"
          className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-ibm bg-transparent focus:outline-none transition-all"
          style={{ border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)" }} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {articles.map((a, i) => (
          <div key={a.title}
            className={`rounded-xl p-5 flex gap-4 cursor-pointer hover:bg-white/3 transition-all animate-fade-in stagger-${(i%6)+1}`}
            style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
              <Icon name={a.icon} size={18} className="text-purple-400" />
            </div>
            <div>
              <div className="font-ibm text-sm font-medium">{a.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{a.cat}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-6 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.07))", border: "1px solid rgba(124,58,237,0.2)" }}>
        <Icon name="MessageCircle" size={24} className="text-purple-400 shrink-0" />
        <div>
          <div className="font-syne font-semibold">Нужна помощь?</div>
          <div className="text-sm text-muted-foreground font-ibm mt-0.5">Напишите в поддержку — ответим в течение часа</div>
        </div>
        <button className="ml-auto text-white text-sm font-ibm px-5 py-2.5 rounded-xl whitespace-nowrap"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
          Написать
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [page]);

  const pageMap: Record<Page, React.ReactNode> = {
    home:     <HomePage setPage={setPage} />,
    editor:   <EditorPage />,
    projects: <ProjectsPage />,
    library:  <LibraryPage />,
    export:   <ExportPage />,
    settings: <SettingsPage />,
    profile:  <ProfilePage />,
    help:     <HelpPage />,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#080c14" }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-16 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)" }} />
        <div className="absolute -bottom-20 -right-10 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.09), transparent 70%)" }} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-30 flex flex-col h-full transition-transform duration-300 shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ width: 224, background: "rgba(6,8,18,0.97)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center animate-pulse-glow"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            <Icon name="Waves" size={16} className="text-white" />
          </div>
          <div>
            <div className="font-syne font-bold text-sm">VoiceForge</div>
            <div className="text-[10px] text-muted-foreground font-ibm tracking-wider">STUDIO</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all font-ibm text-sm ${
                page === item.id
                  ? "active text-purple-300"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={page === item.id ? { background: "rgba(124,58,237,0.15)" } : {}}>
              <Icon name={item.icon} size={17} className={page === item.id ? "text-purple-400" : ""} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Usage widget */}
        <div className="px-4 py-4">
          <div className="rounded-xl p-3 text-center"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <div className="text-[10px] text-muted-foreground font-ibm mb-1">Сегодня</div>
            <div className="font-syne font-bold text-sm text-gradient">12 480 симв.</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="flex items-center gap-3 px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(8,10,20,0.6)", backdropFilter: "blur(12px)" }}>
          <button className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={() => setSidebarOpen(true)}>
            <Icon name="Menu" size={18} />
          </button>
          <h1 className="font-syne font-semibold text-base flex-1 truncate">
            {NAV.find(n => n.id === page)?.label}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-ibm text-muted-foreground hidden sm:block">Все API онлайн</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <Icon name="Bell" size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-syne font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#22d3ee)" }}>
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-5 md:p-8">
          <div key={page}>
            {pageMap[page]}
          </div>
        </main>
      </div>
    </div>
  );
}