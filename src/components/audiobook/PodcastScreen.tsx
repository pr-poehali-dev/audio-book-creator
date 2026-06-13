import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Screen } from "@/components/audiobook/audiobook-data";

interface Props { setScreen: (s: Screen) => void; }

interface Segment { id: string; type: string; title: string; duration: string; notes: string; }
interface Question { id: string; text: string; followUp: string; }

const SEGMENT_TYPES = [
  { id: "intro", label: "Интро", color: "#3b82f6", icon: "Play" },
  { id: "topic", label: "Тема", color: "#10b981", icon: "MessageSquare" },
  { id: "interview", label: "Интервью", color: "#8b5cf6", icon: "Mic" },
  { id: "story", label: "История", color: "#f59e0b", icon: "BookOpen" },
  { id: "tips", label: "Советы", color: "#ec4899", icon: "Lightbulb" },
  { id: "outro", label: "Аутро", color: "#64748b", icon: "StopCircle" },
];

const FORMATS = [
  { id: "solo", label: "Соло", desc: "Один ведущий, монолог" },
  { id: "duo", label: "Диалог", desc: "Два ведущих" },
  { id: "interview", label: "Интервью", desc: "Ведущий + гость" },
  { id: "panel", label: "Панель", desc: "Несколько участников" },
];

export function PodcastScreen({ setScreen }: Props) {
  const [step, setStep] = useState<"setup" | "structure" | "questions">("setup");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [podcastName, setPodcastName] = useState("");
  const [format, setFormat] = useState("solo");
  const [targetAudience, setTargetAudience] = useState("");
  const [mainIdea, setMainIdea] = useState("");
  const [guestName, setGuestName] = useState("");
  const [segments, setSegments] = useState<Segment[]>([
    { id: "1", type: "intro", title: "Приветствие", duration: "1:00", notes: "" },
    { id: "2", type: "topic", title: "Основная тема", duration: "15:00", notes: "" },
    { id: "3", type: "outro", title: "Заключение", duration: "2:00", notes: "" },
  ]);
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", text: "", followUp: "" },
  ]);
  const [activeSegment, setActiveSegment] = useState("1");

  const addSegment = (type: string) => {
    const segType = SEGMENT_TYPES.find(s => s.id === type)!;
    const id = String(Date.now());
    setSegments(s => [...s, { id, type, title: segType.label, duration: "5:00", notes: "" }]);
    setActiveSegment(id);
  };

  const totalDuration = segments.reduce((acc, s) => {
    const [m, sec] = s.duration.split(":").map(Number);
    return acc + (m || 0) * 60 + (sec || 0);
  }, 0);
  const totalMin = Math.floor(totalDuration / 60);
  const totalSec = totalDuration % 60;

  const exportNotes = () => {
    let notes = `ПОДКАСТ: ${podcastName}\n`;
    notes += `ЭПИЗОД: ${episodeTitle}\n`;
    notes += `Формат: ${FORMATS.find(f => f.id === format)?.label}\n`;
    notes += `Длительность: ${totalMin}:${String(totalSec).padStart(2, "0")}\n\n`;
    if (mainIdea) notes += `ОСНОВНАЯ ИДЕЯ:\n${mainIdea}\n\n`;
    notes += `СТРУКТУРА:\n${"─".repeat(40)}\n`;
    segments.forEach((s, i) => {
      const t = SEGMENT_TYPES.find(x => x.id === s.type)!;
      notes += `${i + 1}. [${t.label.toUpperCase()}] ${s.title} — ${s.duration}\n`;
      if (s.notes) notes += `   → ${s.notes}\n`;
    });
    if (questions.some(q => q.text)) {
      notes += `\nВОПРОСЫ ГОСТЮ:\n${"─".repeat(40)}\n`;
      questions.filter(q => q.text).forEach((q, i) => {
        notes += `${i + 1}. ${q.text}\n`;
        if (q.followUp) notes += `   Уточнение: ${q.followUp}\n`;
      });
    }
    const blob = new Blob([notes], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${episodeTitle || "podcast"}_notes.txt`;
    a.click();
  };

  const currentSeg = segments.find(s => s.id === activeSegment);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setScreen("home")}
          className="p-2 rounded-xl transition-all" style={{ color: "var(--ab-text-secondary)" }}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#10b981,#0d9488)" }}>
          <Icon name="Mic2" size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--ab-text-primary)" }}>
            {episodeTitle || "Новый эпизод"}
          </h1>
          <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>
            {podcastName || "Подкаст"} · {segments.length} блоков · ~{totalMin}:{String(totalSec).padStart(2, "0")} мин
          </div>
        </div>
        {step !== "setup" && (
          <button onClick={exportNotes}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
            <Icon name="Download" size={14} />Заметки
          </button>
        )}
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {(["setup", "structure", "questions"] as const).map((s, i) => {
          const labels = ["Эпизод", "Структура", "Вопросы"];
          const active = s === step;
          const done = ["setup", "structure", "questions"].indexOf(s) < ["setup", "structure", "questions"].indexOf(step);
          return (
            <button key={s} onClick={() => done && setStep(s)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={active
                ? { background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.4)" }
                : done ? { background: "rgba(16,185,129,0.07)", color: "#10b981", border: "1px solid rgba(16,185,129,0.15)" }
                  : { background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
              {done ? <Icon name="Check" size={13} /> : <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                style={{ background: active ? "#10b981" : "var(--ab-border)", color: active ? "#fff" : "var(--ab-text-secondary)" }}>{i + 1}</span>}
              {labels[i]}
            </button>
          );
        })}
      </div>

      {/* STEP 1: Setup */}
      {step === "setup" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Название подкаста</label>
                <input value={podcastName} onChange={e => setPodcastName(e.target.value)}
                  placeholder="«Разговоры о главном»…"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#10b981")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Тема эпизода</label>
                <input value={episodeTitle} onChange={e => setEpisodeTitle(e.target.value)}
                  placeholder="«Как перестать бояться провала»…"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#10b981")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Главная мысль эпизода</label>
              <textarea value={mainIdea} onChange={e => setMainIdea(e.target.value)}
                placeholder="Что слушатель должен вынести из этого эпизода?"
                rows={2} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none"
                style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#10b981")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
            </div>
            {(format === "interview" || format === "panel") && (
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Имя гостя / экспертиза</label>
                <input value={guestName} onChange={e => setGuestName(e.target.value)}
                  placeholder="Иван Петров — психолог, коуч…"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#10b981")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium mb-3" style={{ color: "var(--ab-text-secondary)" }}>Формат записи</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className="rounded-xl p-4 text-center transition-all"
                  style={format === f.id
                    ? { background: "rgba(16,185,129,0.12)", border: "2px solid rgba(16,185,129,0.5)" }
                    : { background: "var(--ab-card)", border: "2px solid var(--ab-border)" }}>
                  <div className="font-semibold text-sm mb-1" style={{ color: "var(--ab-text-primary)" }}>{f.label}</div>
                  <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep("structure")} disabled={!episodeTitle.trim()}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#10b981,#0d9488)" }}>
            Составить структуру →
          </button>
        </div>
      )}

      {/* STEP 2: Structure */}
      {step === "structure" && (
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
                  <div className="p-5">
                    <label className="text-xs font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Заметки и тезисы</label>
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
      )}

      {/* STEP 3: Questions */}
      {step === "questions" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="rounded-2xl p-5 mb-2"
            style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div className="text-sm font-medium" style={{ color: "#10b981" }}>
              {guestName ? `Вопросы для ${guestName}` : "Вопросы и план беседы"}
            </div>
          </div>
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1"
                  style={{ background: "#10b981" }}>{i + 1}</span>
                <textarea value={q.text}
                  onChange={e => setQuestions(qs => qs.map(x => x.id === q.id ? { ...x, text: e.target.value } : x))}
                  placeholder="Основной вопрос…"
                  rows={2} className="flex-1 bg-transparent text-sm focus:outline-none resize-none"
                  style={{ color: "var(--ab-text-primary)" }} />
                <button onClick={() => setQuestions(qs => qs.filter(x => x.id !== q.id))}
                  disabled={questions.length <= 1} className="opacity-40 hover:opacity-100 transition-opacity mt-1"
                  style={{ color: "var(--ab-text-secondary)" }}>
                  <Icon name="X" size={14} />
                </button>
              </div>
              <input value={q.followUp}
                onChange={e => setQuestions(qs => qs.map(x => x.id === q.id ? { ...x, followUp: e.target.value } : x))}
                placeholder="Уточняющий вопрос…"
                className="w-full ml-9 text-xs bg-transparent focus:outline-none border-l-2 pl-3"
                style={{ borderColor: "rgba(16,185,129,0.3)", color: "var(--ab-text-secondary)" }} />
            </div>
          ))}
          <button onClick={() => setQuestions(qs => [...qs, { id: String(Date.now()), text: "", followUp: "" }])}
            className="py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "2px dashed var(--ab-border)" }}>
            <Icon name="Plus" size={14} />Добавить вопрос
          </button>
          <button onClick={exportNotes}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#10b981,#0d9488)" }}>
            <span className="flex items-center justify-center gap-2"><Icon name="Download" size={18} />Скачать подготовку к эпизоду</span>
          </button>
        </div>
      )}
    </div>
  );
}
