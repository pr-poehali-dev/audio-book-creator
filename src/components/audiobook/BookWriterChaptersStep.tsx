import Icon from "@/components/ui/icon";
import { AIButton } from "@/components/audiobook/EngineUI";
import { AB_COLOR, Chapter } from "@/components/audiobook/bookwriter-data";

type Step = "setup" | "characters" | "chapters" | "write";

interface ChaptersStepProps {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  updateChapterSummary: (id: string, summary: string) => void;
  addChapter: () => void;
  genOutline: () => void;
  loading: boolean;
  loadingTask: string | null;
  bookTitle: string;
  setStep: (s: Step) => void;
}

export function BookWriterChaptersStep({
  chapters, setChapters, updateChapterSummary, addChapter,
  genOutline, loading, loadingTask, bookTitle, setStep,
}: ChaptersStepProps) {
  return (
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
      <div className="flex gap-2">
        <button onClick={addChapter}
          className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "2px dashed var(--ab-border)" }}>
          <Icon name="Plus" size={15} />Добавить главу
        </button>
        <AIButton color={AB_COLOR} loading={loading && loadingTask === "book-outline"}
          label="Структура от ИИ" onClick={genOutline} disabled={!bookTitle.trim()} />
      </div>
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
  );
}
