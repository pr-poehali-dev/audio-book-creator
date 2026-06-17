import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Screen } from "@/components/audiobook/audiobook-data";
import { useAI, useSave, useTTS, SavedProject } from "@/components/audiobook/engine";
import { SaveStatus, ErrorToast, ProjectsDrawer } from "@/components/audiobook/EngineUI";
import {
  AB_COLOR, Segment, Question, StructureItem, QuestionItem,
  SEGMENT_TYPES, FORMATS,
} from "@/components/audiobook/podcast-data";
import { PodcastSetupStep } from "@/components/audiobook/PodcastSetupStep";
import { PodcastStructureStep } from "@/components/audiobook/PodcastStructureStep";
import { PodcastQuestionsStep } from "@/components/audiobook/PodcastQuestionsStep";

interface Props { setScreen: (s: Screen) => void; }

export function PodcastScreen({ setScreen }: Props) {
  const [step, setStep] = useState<"setup" | "structure" | "questions">("setup");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [podcastName, setPodcastName] = useState("");
  const [format, setFormat] = useState("solo");
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

  // ─── ИИ-движок: генерация, сохранение, озвучка ───
  const { generate, loading: aiLoading, loadingTask, error: aiError, setError: setAiError } = useAI("openai/gpt-4o-mini");
  const { save, list, load, remove, saving, savedAt } = useSave("podcast");
  const { voice, voicing, audioUrl, setAudioUrl, error: ttsError, setError: setTtsError } = useTTS();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const handleSave = async () => {
    const id = await save(
      projectId,
      episodeTitle || "Без названия",
      { podcastName, episodeTitle, format, mainIdea, guestName, segments, questions },
      mainIdea,
    );
    if (id) setProjectId(id);
  };

  const openDrawer = async () => {
    setDrawerOpen(true);
    setLoadingProjects(true);
    setSavedProjects(await list());
    setLoadingProjects(false);
  };

  const handleLoadProject = async (id: string) => {
    const proj = await load(id);
    if (proj?.data) {
      const d = proj.data as {
        podcastName?: string; episodeTitle?: string; format?: string; mainIdea?: string;
        guestName?: string; segments?: Segment[]; questions?: Question[];
      };
      setPodcastName(d.podcastName || "");
      setEpisodeTitle(d.episodeTitle || "");
      setFormat(d.format || "solo");
      setMainIdea(d.mainIdea || "");
      setGuestName(d.guestName || "");
      if (d.segments && d.segments.length) {
        setSegments(d.segments);
        setActiveSegment(d.segments[0].id);
      }
      if (d.questions && d.questions.length) setQuestions(d.questions);
      setProjectId(proj.id);
      setStep("structure");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (await remove(id)) {
      setSavedProjects(p => p.filter(x => x.id !== id));
      if (id === projectId) setProjectId(null);
    }
  };

  const generateStructure = async () => {
    const result = await generate("podcast-structure", { episodeTitle, mainIdea, format });
    if (result?.json && result.json.length) {
      const items = result.json as StructureItem[];
      const newSegments: Segment[] = items.map((it, i) => ({
        id: `${Date.now()}-${i}`,
        type: it.type && SEGMENT_TYPES.some(s => s.id === it.type) ? it.type : "topic",
        title: it.title || "Блок",
        duration: it.duration || "5:00",
        notes: it.notes || "",
      }));
      setSegments(newSegments);
      setActiveSegment(newSegments[0].id);
      setStep("structure");
    }
  };

  const generateSegmentScript = async (seg: Segment) => {
    const result = await generate("podcast-script", {
      podcastName, episodeTitle, format, mainIdea,
      segmentTitle: seg.title, segmentType: seg.type,
    });
    if (result?.text) {
      setSegments(s => s.map(x => x.id === seg.id ? { ...x, notes: result.text } : x));
    }
  };

  const generateQuestions = async () => {
    const result = await generate("podcast-questions", { episodeTitle, guestName, mainIdea });
    if (result?.json && result.json.length) {
      const items = result.json as QuestionItem[];
      const newQuestions: Question[] = items.map((it, i) => ({
        id: `${Date.now()}-${i}`,
        text: it.text || "",
        followUp: it.followUp || "",
      }));
      setQuestions(newQuestions);
    }
  };

  const voiceSegment = async (seg: Segment) => {
    await voice(seg.notes, `${episodeTitle} — ${seg.title}`, "alena", 1.0);
  };

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
        <div className="ml-auto flex items-center gap-2">
          {step !== "setup" && (
            <button onClick={exportNotes}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
              <Icon name="Download" size={14} />Заметки
            </button>
          )}
          <SaveStatus saving={saving} savedAt={savedAt} onSave={handleSave} color={AB_COLOR} />
          <button onClick={openDrawer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
            <Icon name="FolderOpen" size={13} />Мои черновики
          </button>
        </div>
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
        <PodcastSetupStep
          podcastName={podcastName} setPodcastName={setPodcastName}
          episodeTitle={episodeTitle} setEpisodeTitle={setEpisodeTitle}
          mainIdea={mainIdea} setMainIdea={setMainIdea}
          format={format} setFormat={setFormat}
          guestName={guestName} setGuestName={setGuestName}
          setStep={setStep}
          generateStructure={generateStructure}
          aiLoading={aiLoading} loadingTask={loadingTask}
        />
      )}

      {/* STEP 2: Structure */}
      {step === "structure" && (
        <PodcastStructureStep
          segments={segments} setSegments={setSegments}
          activeSegment={activeSegment} setActiveSegment={setActiveSegment}
          addSegment={addSegment}
          totalMin={totalMin} totalSec={totalSec}
          currentSeg={currentSeg}
          episodeTitle={episodeTitle} format={format}
          setStep={setStep}
          generateSegmentScript={generateSegmentScript}
          voiceSegment={voiceSegment}
          aiLoading={aiLoading} loadingTask={loadingTask} voicing={voicing}
          audioUrl={audioUrl} setAudioUrl={setAudioUrl}
        />
      )}

      {/* STEP 3: Questions */}
      {step === "questions" && (
        <PodcastQuestionsStep
          questions={questions} setQuestions={setQuestions}
          guestName={guestName}
          generateQuestions={generateQuestions}
          exportNotes={exportNotes}
          aiLoading={aiLoading} loadingTask={loadingTask}
        />
      )}

      <ErrorToast
        message={aiError || ttsError}
        onClose={() => { setAiError(""); setTtsError(""); }}
      />
      <ProjectsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        projects={savedProjects}
        loading={loadingProjects}
        color={AB_COLOR}
        onLoad={handleLoadProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
}
