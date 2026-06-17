import Icon from "@/components/ui/icon";
import { AIButton } from "@/components/audiobook/EngineUI";
import { Question, AB_COLOR } from "@/components/audiobook/podcast-data";

interface Props {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  guestName: string;
  generateQuestions: () => void;
  exportNotes: () => void;
  aiLoading: boolean;
  loadingTask: string | null;
}

export function PodcastQuestionsStep({
  questions, setQuestions, guestName, generateQuestions, exportNotes,
  aiLoading, loadingTask,
}: Props) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="rounded-2xl p-5 mb-2 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
        <div className="text-sm font-medium" style={{ color: "#10b981" }}>
          {guestName ? `Вопросы для ${guestName}` : "Вопросы и план беседы"}
        </div>
        <AIButton
          onClick={generateQuestions}
          loading={aiLoading && loadingTask === "podcast-questions"}
          label="Сгенерировать вопросы ИИ"
          color={AB_COLOR}
          size="sm"
        />
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
  );
}
