import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Screen } from "@/components/audiobook/audiobook-data";

interface Props { setScreen: (s: Screen) => void; }

const GENRES = ["Роман", "Фантастика", "Детектив", "Сказка", "Исторический", "Приключения", "Ужасы", "Романтика"];

const TEMPLATES = [
  {
    id: "hero",
    title: "Путь героя",
    desc: "Классическая структура: герой, вызов, испытания, победа",
    chapters: ["Обычный мир", "Зов приключений", "Пересечение порога", "Испытания и союзники", "Главное испытание", "Награда", "Возвращение домой"],
  },
  {
    id: "mystery",
    title: "Детектив",
    desc: "Тайна, расследование, разгадка",
    chapters: ["Преступление", "Первые улики", "Подозреваемые", "Ложный след", "Поворот", "Разоблачение", "Развязка"],
  },
  {
    id: "romance",
    title: "Любовный роман",
    desc: "Встреча, чувства, конфликт, воссоединение",
    chapters: ["Встреча", "Притяжение", "Первые чувства", "Препятствие", "Разлука", "Осознание", "Счастливый финал"],
  },
  {
    id: "custom",
    title: "Своя структура",
    desc: "Создай главы самостоятельно",
    chapters: [],
  },
];

interface Character { id: string; name: string; role: string; trait: string; }
interface Chapter { id: string; title: string; summary: string; wordCount: number; }

export function BookWriterScreen({ setScreen }: Props) {
  const [step, setStep] = useState<"setup" | "characters" | "chapters" | "write">("setup");
  const [bookTitle, setBookTitle] = useState("");
  const [genre, setGenre] = useState("Роман");
  const [premise, setPremise] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("hero");
  const [characters, setCharacters] = useState<Character[]>([
    { id: "1", name: "Главный герой", role: "Протагонист", trait: "Смелый, но сомневающийся" },
  ]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [chapterText, setChapterText] = useState<Record<string, string>>({});
  const [newCharName, setNewCharName] = useState("");

  const template = TEMPLATES.find(t => t.id === selectedTemplate)!;

  const initChapters = () => {
    const src = selectedTemplate === "custom"
      ? [{ id: "1", title: "Глава 1", summary: "", wordCount: 0 }]
      : template.chapters.map((t, i) => ({ id: String(i + 1), title: t, summary: "", wordCount: 0 }));
    setChapters(src);
    setStep("chapters");
  };

  const addChapter = () => {
    const id = String(Date.now());
    setChapters(c => [...c, { id, title: `Глава ${c.length + 1}`, summary: "", wordCount: 0 }]);
  };

  const addCharacter = () => {
    if (!newCharName.trim()) return;
    setCharacters(c => [...c, { id: String(Date.now()), name: newCharName, role: "Персонаж", trait: "" }]);
    setNewCharName("");
  };

  const updateChapterSummary = (id: string, summary: string) => {
    setChapters(c => c.map(ch => ch.id === id ? { ...ch, summary } : ch));
  };

  const updateChapterText = (id: string, text: string) => {
    setChapterText(prev => ({ ...prev, [id]: text }));
    const wc = text.trim().split(/\s+/).filter(Boolean).length;
    setChapters(c => c.map(ch => ch.id === id ? { ...ch, wordCount: wc } : ch));
  };

  const totalWords = Object.values(chapterText).reduce((acc, t) => acc + t.trim().split(/\s+/).filter(Boolean).length, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setScreen("home")}
          className="p-2 rounded-xl transition-all hover:bg-violet-50 dark:hover:bg-violet-950/30"
          style={{ color: "var(--ab-text-secondary)" }}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>
          <Icon name="BookOpen" size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--ab-text-primary)" }}>
            {bookTitle || "Новая книга"}
          </h1>
          <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>
            {totalWords > 0 ? `${totalWords.toLocaleString("ru")} слов · ` : ""}{chapters.length} глав
          </div>
        </div>
        {totalWords > 0 && (
          <div className="ml-auto flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
            style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
            <Icon name="TrendingUp" size={12} />
            {totalWords >= 1000 ? `${(totalWords / 1000).toFixed(1)}к` : totalWords} слов
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {(["setup", "characters", "chapters", "write"] as const).map((s, i) => {
          const labels = ["Настройка", "Персонажи", "Главы", "Написание"];
          const active = s === step;
          const done = ["setup", "characters", "chapters", "write"].indexOf(s) < ["setup", "characters", "chapters", "write"].indexOf(step);
          return (
            <button key={s} onClick={() => step !== "setup" && setStep(s)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={active
                ? { background: "rgba(139,92,246,0.15)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.4)" }
                : done
                  ? { background: "rgba(139,92,246,0.07)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.15)" }
                  : { background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
              {done ? <Icon name="Check" size={13} /> : <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                style={{ background: active ? "#8b5cf6" : "var(--ab-border)", color: active ? "#fff" : "var(--ab-text-secondary)" }}>{i + 1}</span>}
              {labels[i]}
            </button>
          );
        })}
      </div>

      {/* STEP 1: Setup */}
      {step === "setup" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Название книги</label>
              <input value={bookTitle} onChange={e => setBookTitle(e.target.value)}
                placeholder="Введите название…"
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#8b5cf6")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Жанр</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button key={g} onClick={() => setGenre(g)}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all"
                    style={genre === g
                      ? { background: "rgba(139,92,246,0.15)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.4)" }
                      : { background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>О чём книга? (идея в 1-2 предложениях)</label>
              <textarea value={premise} onChange={e => setPremise(e.target.value)}
                placeholder="Молодой детектив расследует исчезновение картины из закрытого музея и обнаруживает заговор…"
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all resize-none"
                style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#8b5cf6")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-3" style={{ color: "var(--ab-text-secondary)" }}>Выбери шаблон структуры</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                  className="rounded-2xl p-5 text-left transition-all hover:shadow-md"
                  style={selectedTemplate === t.id
                    ? { background: "rgba(139,92,246,0.1)", border: "2px solid rgba(139,92,246,0.5)" }
                    : { background: "var(--ab-card)", border: "2px solid var(--ab-border)" }}>
                  <div className="font-semibold text-sm mb-1" style={{ color: "var(--ab-text-primary)" }}>{t.title}</div>
                  <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>{t.desc}</div>
                  {t.chapters.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.chapters.slice(0, 3).map(ch => (
                        <span key={ch} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(139,92,246,0.08)", color: "#8b5cf6" }}>{ch}</span>
                      ))}
                      {t.chapters.length > 3 && <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(139,92,246,0.08)", color: "#8b5cf6" }}>+{t.chapters.length - 3}</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep("characters")}
            disabled={!bookTitle.trim()}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>
            Далее — Персонажи →
          </button>
        </div>
      )}

      {/* STEP 2: Characters */}
      {step === "characters" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <div className="flex flex-col gap-3">
            {characters.map(char => (
              <div key={char.id} className="rounded-2xl p-5 flex items-start gap-4"
                style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shrink-0 text-white"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}>
                  {char.name[0]}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <input value={char.name}
                    onChange={e => setCharacters(c => c.map(x => x.id === char.id ? { ...x, name: e.target.value } : x))}
                    className="font-semibold text-sm bg-transparent focus:outline-none border-b transition-colors"
                    style={{ color: "var(--ab-text-primary)", borderColor: "var(--ab-border)" }} />
                  <div className="flex gap-2 flex-wrap">
                    {["Протагонист", "Антагонист", "Наставник", "Друг", "Любовный интерес", "Злодей"].map(r => (
                      <button key={r} onClick={() => setCharacters(c => c.map(x => x.id === char.id ? { ...x, role: r } : x))}
                        className="text-[11px] px-2 py-1 rounded-full transition-all"
                        style={char.role === r
                          ? { background: "rgba(139,92,246,0.15)", color: "#8b5cf6" }
                          : { background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <input value={char.trait}
                    onChange={e => setCharacters(c => c.map(x => x.id === char.id ? { ...x, trait: e.target.value } : x))}
                    placeholder="Черты характера…"
                    className="text-xs bg-transparent focus:outline-none"
                    style={{ color: "var(--ab-text-secondary)" }} />
                </div>
                <button onClick={() => setCharacters(c => c.filter(x => x.id !== char.id))}
                  className="opacity-40 hover:opacity-100 transition-opacity mt-1"
                  style={{ color: "var(--ab-text-secondary)" }}>
                  <Icon name="X" size={15} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newCharName} onChange={e => setNewCharName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCharacter()}
              placeholder="Имя нового персонажа…"
              className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none"
              style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)", color: "var(--ab-text-primary)" }} />
            <button onClick={addCharacter}
              className="px-5 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>
              <Icon name="Plus" size={16} />
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("setup")} className="flex-1 py-3 rounded-xl font-medium transition-all"
              style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
              ← Назад
            </button>
            <button onClick={initChapters} className="flex-2 px-8 py-3 rounded-xl text-white font-bold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>
              Далее — Главы →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Chapters */}
      {step === "chapters" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {chapters.map((ch, i) => (
            <div key={ch.id} className="rounded-2xl p-5" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>{i + 1}</span>
                <input value={ch.title}
                  onChange={e => setChapters(c => c.map(x => x.id === ch.id ? { ...x, title: e.target.value } : x))}
                  className="flex-1 font-semibold text-sm bg-transparent focus:outline-none"
                  style={{ color: "var(--ab-text-primary)" }} />
                <button onClick={() => setChapters(c => c.filter(x => x.id !== ch.id))}
                  className="opacity-40 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--ab-text-secondary)" }}>
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
              <textarea value={ch.summary}
                onChange={e => updateChapterSummary(ch.id, e.target.value)}
                placeholder="Краткое содержание главы — что происходит, какие события…"
                rows={2}
                className="w-full text-xs bg-transparent focus:outline-none resize-none"
                style={{ color: "var(--ab-text-secondary)" }} />
            </div>
          ))}
          <button onClick={addChapter}
            className="py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "2px dashed var(--ab-border)" }}>
            <Icon name="Plus" size={15} />Добавить главу
          </button>
          <div className="flex gap-3">
            <button onClick={() => setStep("characters")} className="flex-1 py-3 rounded-xl font-medium"
              style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
              ← Назад
            </button>
            <button onClick={() => setStep("write")} className="flex-2 px-8 py-3 rounded-xl text-white font-bold hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>
              Начать писать →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Write */}
      {step === "write" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Chapter list */}
            <div className="flex flex-col gap-2">
              {chapters.map((ch, i) => (
                <button key={ch.id} onClick={() => setActiveChapter(ch.id)}
                  className="p-4 rounded-xl text-left transition-all"
                  style={activeChapter === ch.id
                    ? { background: "rgba(139,92,246,0.12)", border: "2px solid rgba(139,92,246,0.4)" }
                    : { background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "#8b5cf6" }}>{i + 1}</span>
                    <span className="text-sm font-medium truncate" style={{ color: "var(--ab-text-primary)" }}>{ch.title}</span>
                  </div>
                  {ch.wordCount > 0 && (
                    <div className="text-[11px] mt-1" style={{ color: "var(--ab-text-secondary)" }}>{ch.wordCount} слов</div>
                  )}
                </button>
              ))}
            </div>

            {/* Editor */}
            <div className="lg:col-span-2">
              {activeChapter ? (() => {
                const ch = chapters.find(x => x.id === activeChapter)!;
                return (
                  <div className="rounded-2xl overflow-hidden" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
                    <div className="px-5 py-4 flex items-center justify-between"
                      style={{ borderBottom: "1px solid var(--ab-border)" }}>
                      <div className="font-semibold text-sm" style={{ color: "var(--ab-text-primary)" }}>{ch.title}</div>
                      <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>
                        {ch.wordCount} слов
                      </div>
                    </div>
                    {ch.summary && (
                      <div className="px-5 py-3 text-xs italic border-l-2 mx-5 mt-4 rounded"
                        style={{ borderColor: "#8b5cf6", background: "rgba(139,92,246,0.05)", color: "var(--ab-text-secondary)" }}>
                        📝 {ch.summary}
                      </div>
                    )}
                    <textarea
                      value={chapterText[activeChapter] || ""}
                      onChange={e => updateChapterText(activeChapter, e.target.value)}
                      placeholder={`Начни писать «${ch.title}»…\n\nЭто твоё пространство. Пиши свободно.`}
                      className="w-full px-5 py-4 min-h-[400px] bg-transparent focus:outline-none text-sm leading-relaxed resize-none"
                      style={{ color: "var(--ab-text-primary)" }} />
                  </div>
                );
              })() : (
                <div className="h-64 rounded-2xl flex flex-col items-center justify-center gap-3"
                  style={{ background: "var(--ab-card)", border: "2px dashed var(--ab-border)" }}>
                  <Icon name="BookOpen" size={32} className="opacity-30" style={{ color: "var(--ab-text-secondary)" } as React.CSSProperties} />
                  <div className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>Выбери главу слева, чтобы начать писать</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
