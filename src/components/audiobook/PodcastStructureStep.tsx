import Icon from "@/components/ui/icon";
import { AIButton, MiniPlayer } from "@/components/audiobook/EngineUI";
import { Segment, SEGMENT_TYPES, AB_COLOR } from "@/components/audiobook/podcast-data";

interface Props {
  segments: Segment[];
  setSegments: React.Dispatch<React.SetStateAction<Segment[]>>;
  activeSegment: string;
  setActiveSegment: (id: string) => void;
  addSegment: (type: string) => void;
  totalMin: number;
  totalSec: number;
  currentSeg: Segment | undefined;
  episodeTitle: string;
  format: string;
  setStep: (s: "setup" | "structure" | "questions") => void;
  generateSegmentScript: (seg: Segment) => void;
  voiceSegment: (seg: Segment) => void;
  aiLoading: boolean;
  loadingTask: string | null;
  voicing: boolean;
  audioUrl: string;
  setAudioUrl: (v: string) => void;
}

export function PodcastStructureStep({
  segments, setSegments, activeSegment, setActiveSegment, addSegment,
  totalMin, totalSec, currentSeg, episodeTitle, format, setStep,
  generateSegmentScript, voiceSegment, aiLoading, loadingTask, voicing,
  audioUrl, setAudioUrl,
}: Props) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-wrap gap-2 mb-2">
        {SEGMENT_TYPES.map(t => (
          <button key={t.id} onClick={() => addSegment(t.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
            style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}>
            <Icon name={t.icon as Parameters<typeof Icon>[0]["name"]} fallback="Plus" size={12} />
            + {t.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Timeline */}
        <div className="flex flex-col gap-2">
          {segments.map((seg, i) => {
            const t = SEGMENT_TYPES.find(x => x.id === seg.type)!;
            return (
              <button key={seg.id} onClick={() => setActiveSegment(seg.id)}
                className="p-3 rounded-xl text-left transition-all flex items-center gap-3"
                style={activeSegment === seg.id
                  ? { background: `${t.color}15`, border: `2px solid ${t.color}50` }
                  : { background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
                <span className="text-xs font-bold w-5 text-center" style={{ color: t.color }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: "var(--ab-text-primary)" }}>{seg.title}</div>
                  <div className="text-[10px]" style={{ color: "var(--ab-text-secondary)" }}>{t.label} · {seg.duration}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); setSegments(s => s.filter(x => x.id !== seg.id)); }}
                  disabled={segments.length <= 1}
                  className="opacity-30 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--ab-text-secondary)" }}>
                  <Icon name="X" size={12} />
                </button>
              </button>
            );
          })}
          <div className="px-3 py-2 rounded-xl text-xs font-medium text-center"
            style={{ background: "rgba(16,185,129,0.08)", color: "#10b981" }}>
            Итого: ~{totalMin}:{String(totalSec).padStart(2, "0")} мин
          </div>
        </div>

        {/* Segment editor */}
        {currentSeg && (() => {
          const t = SEGMENT_TYPES.find(x => x.id === currentSeg.type)!;
          return (
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
              <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--ab-border)" }}>
                <span className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: `${t.color}15`, color: t.color }}>{t.label}</span>
                <input value={currentSeg.title}
                  onChange={e => setSegments(s => s.map(x => x.id === currentSeg.id ? { ...x, title: e.target.value } : x))}
                  className="flex-1 font-semibold text-sm bg-transparent focus:outline-none"
                  style={{ color: "var(--ab-text-primary)" }} />
                <input value={currentSeg.duration}
                  onChange={e => setSegments(s => s.map(x => x.id === currentSeg.id ? { ...x, duration: e.target.value } : x))}
                  className="w-16 text-center text-sm bg-transparent focus:outline-none rounded px-2 py-1"
                  style={{ color: t.color, border: `1px solid ${t.color}30`, background: `${t.color}08` }} />
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium block" style={{ color: "var(--ab-text-secondary)" }}>Заметки и тезисы</label>
                  <AIButton
                    onClick={() => generateSegmentScript(currentSeg)}
                    loading={aiLoading && loadingTask === "podcast-script"}
                    label="Написать блок ИИ"
                    color={AB_COLOR}
                    size="sm"
                    variant="ghost"
                  />
                </div>
                <textarea value={currentSeg.notes}
                  onChange={e => setSegments(s => s.map(x => x.id === currentSeg.id ? { ...x, notes: e.target.value } : x))}
                  placeholder={
                    currentSeg.type === "intro" ? "Приветствие, о чём будем говорить сегодня…" :
                    currentSeg.type === "outro" ? "Призыв к действию, анонс следующего эпизода…" :
                    "Ключевые тезисы, факты, цифры, примеры…"
                  }
                  rows={8}
                  className="w-full bg-transparent focus:outline-none text-sm leading-relaxed resize-none"
                  style={{ color: "var(--ab-text-primary)" }} />
                <div className="flex justify-start">
                  <AIButton
                    onClick={() => voiceSegment(currentSeg)}
                    loading={voicing}
                    label="Озвучить блок"
                    color={AB_COLOR}
                    size="sm"
                    variant="ghost"
                  />
                </div>
                {audioUrl && (
                  <MiniPlayer
                    url={audioUrl}
                    title={`${episodeTitle || "Эпизод"} — ${currentSeg.title}`}
                    color={AB_COLOR}
                    onClose={() => setAudioUrl("")}
                  />
                )}
              </div>
            </div>
          );
        })()}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep("setup")} className="flex-1 py-3 rounded-xl font-medium"
          style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>← Назад</button>
        <button onClick={() => setStep("questions")} className="flex-2 px-8 py-3 rounded-xl text-white font-bold hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#10b981,#0d9488)" }}>
          {format === "interview" ? "Вопросы гостю →" : "Готово →"}
        </button>
      </div>
    </div>
  );
}
