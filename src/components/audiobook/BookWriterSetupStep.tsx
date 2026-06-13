import Icon from "@/components/ui/icon";
import { AIButton } from "@/components/audiobook/EngineUI";
import { AB_COLOR, GENRES, TEMPLATES, Character, IdeaItem } from "@/components/audiobook/bookwriter-data";

type Step = "setup" | "characters" | "chapters" | "write";

interface SetupStepProps {
  bookTitle: string;
  setBookTitle: (v: string) => void;
  genre: string;
  setGenre: (v: string) => void;
  premise: string;
  setPremise: (v: string) => void;
  selectedTemplate: string;
  setSelectedTemplate: (v: string) => void;
  ideas: IdeaItem[];
  setIdeas: (v: IdeaItem[]) => void;
  loading: boolean;
  loadingTask: string | null;
  genIdeas: () => void;
  setStep: (s: Step) => void;
}

export function BookWriterSetupStep({
  bookTitle, setBookTitle, genre, setGenre, premise, setPremise,
  selectedTemplate, setSelectedTemplate, ideas, setIdeas,
  loading, loadingTask, genIdeas, setStep,
}: SetupStepProps) {
  return (
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
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium" style={{ color: "var(--ab-text-secondary)" }}>О чём книга? (идея в 1-2 предложениях)</label>
            <AIButton size="sm" variant="ghost" color={AB_COLOR}
              loading={loading && loadingTask === "book-ideas"}
              label="Придумать идею" onClick={genIdeas} />
          </div>
          <textarea value={premise} onChange={e => setPremise(e.target.value)}
            placeholder="Молодой детектив расследует исчезновение картины из закрытого музея и обнаруживает заговор…"
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all resize-none"
            style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#8b5cf6")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
          {ideas.length > 0 && (
            <div className="flex flex-col gap-2 mt-3">
              {ideas.map((idea, i) => (
                <button key={i} onClick={() => { setBookTitle(idea.title); setPremise(idea.premise); setIdeas([]); }}
                  className="text-left p-3 rounded-xl text-xs transition-all hover:shadow-sm"
                  style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <div className="font-semibold mb-0.5" style={{ color: AB_COLOR }}>{idea.title}</div>
                  <div style={{ color: "var(--ab-text-secondary)" }}>{idea.premise}</div>
                </button>
              ))}
            </div>
          )}
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
  );
}

interface CharactersStepProps {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  newCharName: string;
  setNewCharName: (v: string) => void;
  addCharacter: () => void;
  initChapters: () => void;
  setStep: (s: Step) => void;
}

export function BookWriterCharactersStep({
  characters, setCharacters, newCharName, setNewCharName,
  addCharacter, initChapters, setStep,
}: CharactersStepProps) {
  return (
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
  );
}
