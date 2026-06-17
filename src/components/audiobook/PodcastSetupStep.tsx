import { AIButton } from "@/components/audiobook/EngineUI";
import { FORMATS, AB_COLOR } from "@/components/audiobook/podcast-data";

interface Props {
  podcastName: string;
  setPodcastName: (v: string) => void;
  episodeTitle: string;
  setEpisodeTitle: (v: string) => void;
  mainIdea: string;
  setMainIdea: (v: string) => void;
  format: string;
  setFormat: (v: string) => void;
  guestName: string;
  setGuestName: (v: string) => void;
  setStep: (s: "setup" | "structure" | "questions") => void;
  generateStructure: () => void;
  aiLoading: boolean;
  loadingTask: string | null;
}

export function PodcastSetupStep({
  podcastName, setPodcastName, episodeTitle, setEpisodeTitle,
  mainIdea, setMainIdea, format, setFormat, guestName, setGuestName,
  setStep, generateStructure, aiLoading, loadingTask,
}: Props) {
  return (
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

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => setStep("structure")} disabled={!episodeTitle.trim()}
          className="flex-1 py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#10b981,#0d9488)" }}>
          Составить структуру →
        </button>
        <AIButton
          onClick={generateStructure}
          loading={aiLoading && loadingTask === "podcast-structure"}
          disabled={!episodeTitle.trim()}
          label="Сгенерировать структуру ИИ"
          color={AB_COLOR}
        />
      </div>
    </div>
  );
}
