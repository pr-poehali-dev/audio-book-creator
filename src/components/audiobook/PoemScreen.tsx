import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Screen } from "@/components/audiobook/audiobook-data";

interface Props { setScreen: (s: Screen) => void; }

const FORMS = [
  { id: "free", label: "Верлибр", desc: "Свободный стих без рифм", example: "Ветер касается листьев\nи уходит\nне прощаясь" },
  { id: "sonnet", label: "Сонет", desc: "14 строк, ABAB CDCD EEE", example: "Я помню чудное мгновенье:\nПередо мной явилась ты…" },
  { id: "haiku", label: "Хайку", desc: "3 строки: 5-7-5 слогов", example: "Старый пруд\nЛягушка прыгает\nЗвук воды" },
  { id: "song", label: "Песня", desc: "Куплеты + припев", example: "Куплет 1:\n…\n\nПрипев:\n…" },
  { id: "ballad", label: "Баллада", desc: "Рассказ в стихах", example: "Жил-был рыцарь у реки\nВ замке каменном один…" },
  { id: "limerick", label: "Лимерик", desc: "5 строк AABBA, юмор", example: "Один старый кот из Москвы\nНе мог оторвать от TV\n  Он смотрел до утра\n  Всё подряд — ерунда!\nИ проспал до последней травы." },
];

const RHYME_SCHEMES = ["ABAB", "AABB", "ABBA", "ABCABC", "Без рифм"];
const MOODS = ["Лирика", "Романтика", "Грусть", "Радость", "Ирония", "Философия", "Протест", "Ностальгия"];
const METERS = ["Ямб", "Хорей", "Дактиль", "Анапест", "Амфибрахий", "Свободный"];

interface Verse { id: string; label: string; text: string; }

export function PoemScreen({ setScreen }: Props) {
  const [form, setForm] = useState("free");
  const [mood, setMood] = useState("Лирика");
  const [meter, setMeter] = useState("Ямб");
  const [rhyme, setRhyme] = useState("ABAB");
  const [poemTitle, setPoemTitle] = useState("");
  const [verses, setVerses] = useState<Verse[]>([
    { id: "1", label: "Куплет 1", text: "" },
  ]);
  const [activeVerse, setActiveVerse] = useState("1");
  const [showHelper, setShowHelper] = useState(false);
  const [helperInput, setHelperInput] = useState("");
  const [rhymeWords, setRhymeWords] = useState<string[]>([]);

  const selectedForm = FORMS.find(f => f.id === form)!;

  const addVerse = (label: string) => {
    const id = String(Date.now());
    setVerses(v => [...v, { id, label, text: "" }]);
    setActiveVerse(id);
  };

  const fullText = [
    poemTitle ? `${poemTitle}\n${"─".repeat(poemTitle.length)}\n` : "",
    verses.map(v => `${v.label}:\n${v.text}`).join("\n\n"),
  ].filter(Boolean).join("\n");

  const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;

  const findRhymes = () => {
    const word = helperInput.trim().toLowerCase();
    if (!word) return;
    const endings: Record<string, string[]> = {
      "ать": ["мечтать", "летать", "искать", "дышать", "кричать", "ждать", "молчать"],
      "еть": ["гореть", "болеть", "звенеть", "успеть", "терпеть"],
      "ить": ["любить", "жить", "говорить", "забыть", "открыть", "уйти"],
      "ой": ["родной", "живой", "ночной", "тихой", "другой", "простой"],
      "ой!": ["родной", "живой"],
      "ет": ["идёт", "поёт", "живёт", "цветёт", "ждёт"],
      "ла": ["была", "пришла", "спала", "ждала", "жила"],
      "ен": ["день", "тень", "лень", "сень", "осень"],
    };
    const suffix = word.slice(-2);
    const suffix3 = word.slice(-3);
    setRhymeWords(endings[suffix3] || endings[suffix] || ["ночь", "дочь", "мочь", "рочь"]);
  };

  const exportPoem = () => {
    const blob = new Blob([fullText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${poemTitle || "poem"}.txt`;
    a.click();
  };

  const currentVerse = verses.find(v => v.id === activeVerse);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setScreen("home")}
          className="p-2 rounded-xl transition-all" style={{ color: "var(--ab-text-secondary)" }}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#ec4899,#be185d)" }}>
          <Icon name="Music2" size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--ab-text-primary)" }}>
            {poemTitle || "Новое произведение"}
          </h1>
          <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>
            {selectedForm.label} · {mood} · {wordCount} слов
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowHelper(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={showHelper
              ? { background: "rgba(236,72,153,0.15)", color: "#ec4899", border: "1px solid rgba(236,72,153,0.4)" }
              : { background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
            <Icon name="Sparkles" fallback="Star" size={13} />Рифмовник
          </button>
          <button onClick={exportPoem} disabled={!fullText.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
            style={{ background: "rgba(236,72,153,0.12)", color: "#ec4899", border: "1px solid rgba(236,72,153,0.3)" }}>
            <Icon name="Download" size={13} />Скачать
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Settings panel */}
        <div className="flex flex-col gap-4">
          {/* Form */}
          <div className="rounded-2xl p-4" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
            <div className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--ab-text-secondary)" }}>Форма</div>
            <div className="flex flex-col gap-1.5">
              {FORMS.map(f => (
                <button key={f.id} onClick={() => setForm(f.id)}
                  className="px-3 py-2 rounded-lg text-sm text-left transition-all"
                  style={form === f.id
                    ? { background: "rgba(236,72,153,0.12)", color: "#ec4899", border: "1px solid rgba(236,72,153,0.3)" }
                    : { color: "var(--ab-text-secondary)" }}>
                  <div className="font-medium">{f.label}</div>
                  <div className="text-[10px] opacity-70">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="rounded-2xl p-4" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
            <div className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--ab-text-secondary)" }}>Настроение</div>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map(m => (
                <button key={m} onClick={() => setMood(m)}
                  className="px-2 py-1 rounded-full text-[11px] transition-all"
                  style={mood === m
                    ? { background: "rgba(236,72,153,0.15)", color: "#ec4899" }
                    : { background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Meter & Rhyme */}
          <div className="rounded-2xl p-4" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
            <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--ab-text-secondary)" }}>Размер</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {METERS.map(m => (
                <button key={m} onClick={() => setMeter(m)}
                  className="px-2 py-1 rounded text-[11px] transition-all"
                  style={meter === m
                    ? { background: "rgba(236,72,153,0.15)", color: "#ec4899" }
                    : { background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
                  {m}
                </button>
              ))}
            </div>
            <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--ab-text-secondary)" }}>Схема рифм</div>
            <div className="flex flex-wrap gap-1">
              {RHYME_SCHEMES.map(r => (
                <button key={r} onClick={() => setRhyme(r)}
                  className="px-2 py-1 rounded text-[11px] font-mono transition-all"
                  style={rhyme === r
                    ? { background: "rgba(236,72,153,0.15)", color: "#ec4899" }
                    : { background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main editor */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <input value={poemTitle} onChange={e => setPoemTitle(e.target.value)}
            placeholder="Название произведения…"
            className="w-full px-4 py-3 rounded-2xl text-lg font-bold focus:outline-none text-center"
            style={{ background: "var(--ab-card)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#ec4899")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />

          {/* Verse tabs */}
          <div className="flex flex-wrap gap-2">
            {verses.map(v => (
              <button key={v.id} onClick={() => setActiveVerse(v.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={activeVerse === v.id
                  ? { background: "rgba(236,72,153,0.15)", color: "#ec4899", border: "1px solid rgba(236,72,153,0.4)" }
                  : { background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
                {v.label}
                {verses.length > 1 && (
                  <span onClick={e => { e.stopPropagation(); setVerses(vv => vv.filter(x => x.id !== v.id)); }}
                    className="opacity-50 hover:opacity-100">×</span>
                )}
              </button>
            ))}
            <button onClick={() => addVerse(form === "song" && verses.length % 2 === 1 ? "Припев" : `Куплет ${Math.ceil((verses.length + 1) / 2)}`)}
              className="px-3 py-1.5 rounded-full text-xs transition-all"
              style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px dashed var(--ab-border)" }}>
              + {form === "song" && verses.length % 2 === 1 ? "Припев" : "Куплет"}
            </button>
          </div>

          {/* Verse editor */}
          {currentVerse && (
            <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
              <div className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--ab-border)" }}>
                <span className="text-xs font-semibold" style={{ color: "#ec4899" }}>{currentVerse.label}</span>
                <span className="text-[10px]" style={{ color: "var(--ab-text-secondary)" }}>{currentVerse.text.split("\n").length} строк</span>
              </div>
              <textarea
                value={currentVerse.text}
                onChange={e => setVerses(v => v.map(x => x.id === currentVerse.id ? { ...x, text: e.target.value } : x))}
                placeholder={`${selectedForm.example}\n\n— пиши здесь…`}
                className="w-full px-5 py-4 min-h-[280px] bg-transparent focus:outline-none text-base leading-loose resize-none"
                style={{ color: "var(--ab-text-primary)", fontFamily: "'IBM Plex Mono', monospace" }}
              />
            </div>
          )}
        </div>

        {/* Right panel: Rhyme helper + preview */}
        <div className="flex flex-col gap-4">
          {showHelper && (
            <div className="rounded-2xl p-4 animate-fade-in" style={{ background: "var(--ab-card)", border: "1px solid rgba(236,72,153,0.2)" }}>
              <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#ec4899" }}>
                <Icon name="Star" size={12} />Рифмовник
              </div>
              <div className="flex gap-2 mb-3">
                <input value={helperInput} onChange={e => setHelperInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && findRhymes()}
                  placeholder="Введи слово…"
                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ background: "var(--ab-page-bg)", border: "1px solid var(--ab-border)", color: "var(--ab-text-primary)" }} />
                <button onClick={findRhymes}
                  className="px-3 py-2 rounded-lg text-white text-xs font-medium"
                  style={{ background: "#ec4899" }}>→</button>
              </div>
              {rhymeWords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {rhymeWords.map(w => (
                    <button key={w}
                      onClick={() => {
                        const v = verses.find(x => x.id === activeVerse);
                        if (v) setVerses(vs => vs.map(x => x.id === activeVerse ? { ...x, text: x.text + " " + w } : x));
                      }}
                      className="px-2 py-1 rounded text-xs transition-all hover:opacity-80"
                      style={{ background: "rgba(236,72,153,0.1)", color: "#ec4899" }}>
                      {w}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Full preview */}
          <div className="rounded-2xl p-4 flex-1" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
            <div className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--ab-text-secondary)" }}>Полный текст</div>
            <pre className="text-xs leading-relaxed whitespace-pre-wrap font-ibm"
              style={{ color: "var(--ab-text-secondary)", minHeight: "200px" }}>
              {fullText || "Начни писать…"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
