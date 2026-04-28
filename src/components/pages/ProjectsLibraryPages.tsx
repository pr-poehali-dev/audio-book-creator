import { useState } from "react";
import Icon from "@/components/ui/icon";
import { VOICES, PROJECTS, Project } from "@/components/app-data";
import { ProviderBadge, StatusBadge } from "@/components/AppShared";

// ─── Page: PROJECTS ───────────────────────────────────────────────────────────
export function ProjectsPage() {
  const [filter, setFilter] = useState<"all" | "done" | "processing" | "draft">("all");
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);

  const handleNew = () => {
    const newProject: Project = {
      id: String(Date.now()),
      name: "Новый проект",
      duration: "0:00",
      date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
      provider: "yandex",
      status: "draft",
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const handlePlay = (id: string) => {
    setPlayingId(prev => (prev === id ? null : id));
  };

  const handleDownload = (name: string) => {
    const a = document.createElement("a");
    a.href = "#";
    a.download = `${name.replace(/\s+/g, "_").toLowerCase()}.mp3`;
    a.click();
  };

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (playingId === id) setPlayingId(null);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <div className="flex items-center justify-between">
        <h2 className="font-syne text-2xl font-bold">Проекты</h2>
        <button onClick={handleNew} className="btn-glow text-white font-ibm text-sm px-4 py-2 rounded-xl flex items-center gap-2">
          <Icon name="Plus" size={15} />Новый
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(["all","done","processing","draft"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-lg text-xs font-ibm transition-all"
            style={filter === f
              ? { background: "rgba(124,58,237,0.2)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.4)" }
              : { background: "rgba(255,255,255,0.04)", color: "hsl(215 15% 55%)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {{ all: "Все", done: "Готовые", processing: "В синтезе", draft: "Черновики" }[f]}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-ibm text-sm">
          Нет проектов в этой категории
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((proj, i) => (
            <div key={proj.id}
              className={`rounded-xl p-5 flex items-center gap-4 hover:bg-white/3 transition-all cursor-pointer group animate-fade-in stagger-${i+1}`}
              style={{ opacity: 0, background: playingId === proj.id ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)", border: playingId === proj.id ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                <Icon name={playingId === proj.id ? "Volume2" : "FileAudio"} size={18} className="text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-syne font-semibold truncate">{proj.name}</div>
                <div className="text-xs text-muted-foreground font-ibm mt-0.5">{proj.duration} · {proj.date}</div>
              </div>
              <ProviderBadge providerId={proj.provider} />
              <StatusBadge status={proj.status} />
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); handlePlay(proj.id); }}
                  className="p-2 rounded-lg hover:bg-white/5"
                  title={playingId === proj.id ? "Пауза" : "Воспроизвести"}>
                  <Icon name={playingId === proj.id ? "Pause" : "Play"} size={14} className="text-purple-400"/>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleDownload(proj.name); }}
                  className="p-2 rounded-lg hover:bg-white/5"
                  title="Скачать">
                  <Icon name="Download" size={14} className="text-cyan-400"/>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(proj.id); }}
                  className="p-2 rounded-lg hover:bg-white/5"
                  title="Удалить">
                  <Icon name="Trash2" size={14} className="text-red-400"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page: LIBRARY ────────────────────────────────────────────────────────────
export function LibraryPage({ setPage }: { setPage?: (p: string) => void }) {
  const [search, setSearch] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  const filtered = VOICES.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.provider.toLowerCase().includes(search.toLowerCase())
  );

  const handleUse = (voiceId: string) => {
    setSelectedVoice(voiceId);
    if (setPage) setPage("editor");
  };

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
      {selectedVoice && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-ibm"
          style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)" }}>
          <Icon name="Check" size={14} className="text-purple-400" />
          <span className="text-purple-300">Голос выбран — откройте Редактор для синтеза</span>
        </div>
      )}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((v, i) => (
          <div key={v.id}
            className={`rounded-xl p-5 flex flex-col gap-3 hover:bg-white/3 cursor-pointer transition-all animate-fade-in stagger-${(i%8)+1}`}
            style={{ opacity: 0, background: selectedVoice === v.id ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)", border: selectedVoice === v.id ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
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
              <button
                onClick={() => handleUse(v.id)}
                className="text-[11px] font-ibm text-purple-400 hover:text-purple-300 transition-colors">
                {selectedVoice === v.id ? "Выбран ✓" : "Использовать →"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
