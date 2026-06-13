import Icon from "@/components/ui/icon";
import { AIButton, MiniPlayer } from "@/components/audiobook/EngineUI";
import { AB_COLOR, Chapter } from "@/components/audiobook/bookwriter-data";

interface WriteStepProps {
  chapters: Chapter[];
  activeChapter: string | null;
  setActiveChapter: (id: string) => void;
  chapterText: Record<string, string>;
  updateChapterText: (id: string, text: string) => void;
  genChapter: (chapterId: string) => void;
  voiceChapter: (chapterId: string) => void;
  loading: boolean;
  loadingTask: string | null;
  voicing: boolean;
  audioUrl: string;
  setAudioUrl: (v: string) => void;
  bookTitle: string;
}

export function BookWriterWriteStep({
  chapters, activeChapter, setActiveChapter, chapterText, updateChapterText,
  genChapter, voiceChapter, loading, loadingTask, voicing, audioUrl, setAudioUrl, bookTitle,
}: WriteStepProps) {
  return (
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
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl overflow-hidden" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
                  <div className="px-5 py-4 flex items-center justify-between gap-2 flex-wrap"
                    style={{ borderBottom: "1px solid var(--ab-border)" }}>
                    <div className="font-semibold text-sm" style={{ color: "var(--ab-text-primary)" }}>{ch.title}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>{ch.wordCount} слов</span>
                      <AIButton size="sm" color={AB_COLOR}
                        loading={loading && loadingTask === "book-chapter"}
                        label={chapterText[activeChapter] ? "Переписать ИИ" : "Написать главу ИИ"}
                        onClick={() => genChapter(activeChapter)} />
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
                    placeholder={`Начни писать «${ch.title}»…\n\nИли нажми «Написать главу ИИ» — нейросеть создаст текст по твоей задумке.`}
                    className="w-full px-5 py-4 min-h-[400px] bg-transparent focus:outline-none text-sm leading-relaxed resize-none"
                    style={{ color: "var(--ab-text-primary)" }} />
                </div>
                {chapterText[activeChapter] && (
                  <div className="flex items-center gap-2">
                    <AIButton size="sm" variant="ghost" color={AB_COLOR}
                      loading={voicing} label="Озвучить главу"
                      onClick={() => voiceChapter(activeChapter)} />
                  </div>
                )}
                {audioUrl && (
                  <MiniPlayer url={audioUrl} title={`${bookTitle} — ${ch.title}`} color={AB_COLOR} onClose={() => setAudioUrl("")} />
                )}
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
  );
}
