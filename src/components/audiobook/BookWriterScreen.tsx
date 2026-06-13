import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Screen } from "@/components/audiobook/audiobook-data";
import { useAI, useSave, useTTS, SavedProject } from "@/components/audiobook/engine";
import { SaveStatus, ErrorToast, ProjectsDrawer } from "@/components/audiobook/EngineUI";
import { AB_COLOR, TEMPLATES, Character, Chapter, OutlineItem, IdeaItem } from "@/components/audiobook/bookwriter-data";
import { BookWriterSetupStep, BookWriterCharactersStep } from "@/components/audiobook/BookWriterSetupStep";
import { BookWriterChaptersStep } from "@/components/audiobook/BookWriterChaptersStep";
import { BookWriterWriteStep } from "@/components/audiobook/BookWriterWriteStep";

interface Props { setScreen: (s: Screen) => void; }

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

  // ── Движок: ИИ, сохранение, озвучка ──────────────────────────────────────
  const { generate, loading, loadingTask, error: aiError, setError: setAiError } = useAI("openai/gpt-4o-mini");
  const { save, list, load, remove, saving, savedAt } = useSave("book");
  const { voice, voicing, audioUrl, setAudioUrl, error: ttsError, setError: setTtsError } = useTTS();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);

  const template = TEMPLATES.find(t => t.id === selectedTemplate)!;

  // ── Генерация идей книги ──────────────────────────────────────────────────
  const genIdeas = async () => {
    const r = await generate("book-ideas", { genre });
    if (r?.json) setIdeas(r.json as IdeaItem[]);
  };

  // ── Генерация структуры глав ИИ ───────────────────────────────────────────
  const genOutline = async () => {
    const r = await generate("book-outline", { bookTitle, genre, premise, chapterCount: 7 });
    if (r?.json && r.json.length) {
      const outline = r.json as OutlineItem[];
      setChapters(outline.map((o, i) => ({ id: String(i + 1), title: o.title, summary: o.summary, wordCount: 0 })));
      setStep("chapters");
    }
  };

  // ── Генерация текста главы ИИ ──────────────────────────────────────────────
  const genChapter = async (chapterId: string) => {
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) return;
    const r = await generate("book-chapter", {
      bookTitle, genre, premise,
      chapterTitle: ch.title, summary: ch.summary,
      characters, length: "средняя",
    });
    if (r?.text) updateChapterText(chapterId, r.text);
  };

  // ── Сохранение / загрузка ─────────────────────────────────────────────────
  const handleSave = async () => {
    const data = { bookTitle, genre, premise, selectedTemplate, characters, chapters, chapterText };
    const preview = (premise || chapters.map(c => c.title).join(", ")).slice(0, 200);
    const id = await save(projectId, bookTitle || "Без названия", data, preview);
    if (id) setProjectId(id);
  };

  const openDrawer = async () => {
    setDrawerOpen(true);
    setLoadingProjects(true);
    setSavedProjects(await list());
    setLoadingProjects(false);
  };

  const handleLoad = async (id: string) => {
    const p = await load(id);
    if (p?.data) {
      const d = p.data as {
        bookTitle: string; genre: string; premise: string; selectedTemplate: string;
        characters: Character[]; chapters: Chapter[]; chapterText: Record<string, string>;
      };
      setBookTitle(d.bookTitle || "");
      setGenre(d.genre || "Роман");
      setPremise(d.premise || "");
      setSelectedTemplate(d.selectedTemplate || "hero");
      setCharacters(d.characters || []);
      setChapters(d.chapters || []);
      setChapterText(d.chapterText || {});
      setProjectId(id);
      setStep(d.chapters?.length ? "write" : "setup");
    }
  };

  const handleDelete = async (id: string) => {
    if (await remove(id)) setSavedProjects(p => p.filter(x => x.id !== id));
  };

  // ── Озвучка главы ─────────────────────────────────────────────────────────
  const voiceChapter = async (chapterId: string) => {
    const txt = chapterText[chapterId];
    const ch = chapters.find(c => c.id === chapterId);
    if (txt) await voice(txt, `${bookTitle} — ${ch?.title || "глава"}`, "filipp", 1.0);
  };

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
        <div className="ml-auto flex items-center gap-2">
          {totalWords > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.1)", color: AB_COLOR }}>
              <Icon name="TrendingUp" size={12} />
              {totalWords >= 1000 ? `${(totalWords / 1000).toFixed(1)}к` : totalWords} слов
            </div>
          )}
          <button onClick={openDrawer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ color: "var(--ab-text-secondary)" }}>
            <Icon name="FolderOpen" size={14} /><span className="hidden sm:inline">Черновики</span>
          </button>
          <SaveStatus saving={saving} savedAt={savedAt} onSave={handleSave} color={AB_COLOR} />
        </div>
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
        <BookWriterSetupStep
          bookTitle={bookTitle} setBookTitle={setBookTitle}
          genre={genre} setGenre={setGenre}
          premise={premise} setPremise={setPremise}
          selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate}
          ideas={ideas} setIdeas={setIdeas}
          loading={loading} loadingTask={loadingTask}
          genIdeas={genIdeas} setStep={setStep}
        />
      )}

      {/* STEP 2: Characters */}
      {step === "characters" && (
        <BookWriterCharactersStep
          characters={characters} setCharacters={setCharacters}
          newCharName={newCharName} setNewCharName={setNewCharName}
          addCharacter={addCharacter} initChapters={initChapters} setStep={setStep}
        />
      )}

      {/* STEP 3: Chapters */}
      {step === "chapters" && (
        <BookWriterChaptersStep
          chapters={chapters} setChapters={setChapters}
          updateChapterSummary={updateChapterSummary} addChapter={addChapter}
          genOutline={genOutline} loading={loading} loadingTask={loadingTask}
          bookTitle={bookTitle} setStep={setStep}
        />
      )}

      {/* STEP 4: Write */}
      {step === "write" && (
        <BookWriterWriteStep
          chapters={chapters} activeChapter={activeChapter} setActiveChapter={setActiveChapter}
          chapterText={chapterText} updateChapterText={updateChapterText}
          genChapter={genChapter} voiceChapter={voiceChapter}
          loading={loading} loadingTask={loadingTask} voicing={voicing}
          audioUrl={audioUrl} setAudioUrl={setAudioUrl} bookTitle={bookTitle}
        />
      )}

      <ErrorToast message={aiError || ttsError} onClose={() => { setAiError(""); setTtsError(""); }} />
      <ProjectsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        projects={savedProjects}
        loading={loadingProjects}
        color={AB_COLOR}
        onLoad={handleLoad}
        onDelete={handleDelete}
      />
    </div>
  );
}
