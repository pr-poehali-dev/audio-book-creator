import { useRef, useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

/* ─── Кнопка ИИ-генерации ──────────────────────────────────────────────────── */

interface AIButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  color: string;
  size?: "sm" | "md";
  disabled?: boolean;
  variant?: "solid" | "ghost";
}

export function AIButton({ onClick, loading, label = "Сгенерировать ИИ", color, size = "md", disabled, variant = "solid" }: AIButtonProps) {
  const pad = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex items-center justify-center gap-2 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${pad}`}
      style={variant === "solid"
        ? { background: `linear-gradient(135deg, ${color}dd, ${color})`, color: "#fff" }
        : { background: `${color}12`, color, border: `1px solid ${color}30` }}
    >
      {loading
        ? <><Icon name="Loader2" size={size === "sm" ? 13 : 15} className="animate-spin" />Генерирую…</>
        : <><Icon name="Sparkles" fallback="Star" size={size === "sm" ? 13 : 15} />{label}</>}
    </button>
  );
}

/* ─── Индикатор сохранения ─────────────────────────────────────────────────── */

interface SaveStatusProps {
  saving: boolean;
  savedAt: Date | null;
  onSave: () => void;
  color: string;
}

export function SaveStatus({ saving, savedAt, onSave, color }: SaveStatusProps) {
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => {
    if (savedAt) {
      setJustSaved(true);
      const t = setTimeout(() => setJustSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [savedAt]);

  return (
    <button onClick={onSave} disabled={saving}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-60"
      style={{ background: `${color}12`, color, border: `1px solid ${color}30` }}>
      {saving
        ? <><Icon name="Loader2" size={13} className="animate-spin" />Сохраняю…</>
        : justSaved
          ? <><Icon name="Check" size={13} />Сохранено</>
          : <><Icon name="Save" size={13} />Сохранить</>}
    </button>
  );
}

/* ─── Мини-плеер MP3 ───────────────────────────────────────────────────────── */

interface MiniPlayerProps {
  url: string;
  title: string;
  color: string;
  onClose?: () => void;
}

export function MiniPlayer({ url, title, color, onClose }: MiniPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <div className="rounded-2xl p-4 flex items-center gap-3 animate-fade-in"
      style={{ background: `${color}0d`, border: `1px solid ${color}30` }}>
      <button onClick={toggle}
        className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 transition-all hover:scale-105"
        style={{ background: color }}>
        <Icon name={playing ? "Pause" : "Play"} size={18} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: "var(--ab-text-primary)" }}>🎧 {title}</div>
        <div className="h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: `${color}20` }}>
          <div className="h-full rounded-full transition-all" style={{ background: color, width: `${progress}%` }} />
        </div>
      </div>
      <a href={url} download={`${title}.mp3`}
        className="p-2 rounded-lg transition-all shrink-0"
        style={{ color }} title="Скачать MP3">
        <Icon name="Download" size={16} />
      </a>
      {onClose && (
        <button onClick={onClose} className="p-1 opacity-50 hover:opacity-100 shrink-0" style={{ color: "var(--ab-text-secondary)" }}>
          <Icon name="X" size={14} />
        </button>
      )}
      <audio ref={audioRef} src={url}
        onTimeUpdate={e => {
          const a = e.currentTarget;
          setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
        }}
        onEnded={() => { setPlaying(false); setProgress(0); }} />
    </div>
  );
}

/* ─── Тост-ошибка ──────────────────────────────────────────────────────────── */

export function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl animate-fade-in max-w-md"
      style={{ background: "#ef4444", color: "#fff" }}>
      <Icon name="AlertCircle" size={18} />
      <span className="text-sm flex-1">{message}</span>
      <button onClick={onClose} className="opacity-80 hover:opacity-100"><Icon name="X" size={15} /></button>
    </div>
  );
}

/* ─── Панель загрузки сохранённых проектов ─────────────────────────────────── */

interface SavedProject {
  id: string;
  title: string;
  preview?: string;
  updated_at: string;
  is_example?: boolean;
}

interface ProjectsDrawerProps {
  open: boolean;
  onClose: () => void;
  projects: SavedProject[];
  loading: boolean;
  color: string;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectsDrawer({ open, onClose, projects, loading, color, onLoad, onDelete }: ProjectsDrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm h-full overflow-y-auto p-5 animate-slide-in-right"
        style={{ background: "var(--ab-card)", borderLeft: "1px solid var(--ab-border)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg" style={{ color: "var(--ab-text-primary)" }}>Мои черновики</h3>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: "var(--ab-text-secondary)" }}>
            <Icon name="X" size={18} />
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12" style={{ color: "var(--ab-text-secondary)" }}>
            <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />Загружаю…
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: "var(--ab-text-secondary)" }}>
            Пока нет сохранённых проектов
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {projects.map(p => (
              <div key={p.id}
                className="rounded-xl p-4 transition-all hover:shadow-sm cursor-pointer group"
                style={p.is_example
                  ? { background: `${color}0d`, border: `1px solid ${color}40` }
                  : { background: "var(--ab-page-bg)", border: "1px solid var(--ab-border)" }}
                onClick={() => { onLoad(p.id); onClose(); }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {p.is_example && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                          style={{ background: color, color: "#fff" }}>
                          <Icon name="Sparkles" fallback="Star" size={10} />ПРИМЕР
                        </span>
                      )}
                      <div className="font-medium text-sm truncate" style={{ color: "var(--ab-text-primary)" }}>{p.title}</div>
                    </div>
                    {p.preview && <div className="text-xs mt-1 line-clamp-2" style={{ color: "var(--ab-text-secondary)" }}>{p.preview}</div>}
                    <div className="text-[10px] mt-1.5" style={{ color: "var(--ab-text-muted)" }}>
                      {p.is_example
                        ? "Образец — откройте, чтобы изучить"
                        : new Date(p.updated_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {!p.is_example && (
                    <button onClick={e => { e.stopPropagation(); onDelete(p.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      style={{ color: "var(--ab-text-secondary)" }}>
                      <Icon name="Trash2" size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-xs text-center" style={{ color: color }}>
          Автосохранение включено
        </div>
      </div>
    </div>
  );
}