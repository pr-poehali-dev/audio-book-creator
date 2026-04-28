import { useState, useRef, useCallback, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  TTS_URL, PARSE_URL, SUPPORTED_EXTS,
  Screen, Project, USER_ID,
} from "@/components/audiobook/audiobook-data";
import { HomeScreen }      from "@/components/audiobook/HomeScreen";
import { EditorScreen, GeneratingScreen, ResultScreen } from "@/components/audiobook/EditorScreens";
import { CabinetScreen }   from "@/components/audiobook/CabinetScreen";

type Theme = "light" | "dark";

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === "light" ? "dark" : "light");
  return { theme, toggle };
}

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();

  const [screen, setScreen]               = useState<Screen>("home");
  const [text, setText]                   = useState("");
  const [title, setTitle]                 = useState("Моя аудиокнига");
  const [voice, setVoice]                 = useState("alena");
  const [speed, setSpeed]                 = useState(1.0);
  const [dragging, setDragging]           = useState(false);
  const [parsing, setParsing]             = useState(false);
  const [progress, setProgress]           = useState(0);
  const [resultUrl, setResultUrl]         = useState("");
  const [resultId, setResultId]           = useState("");
  const [error, setError]                 = useState("");
  const [projects, setProjects]           = useState<Project[]>([]);
  const [loadingCabinet, setLoadingCabinet] = useState(false);
  const [playing, setPlaying]             = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    setTitle(baseName);
    setError("");

    if (!SUPPORTED_EXTS.includes(ext)) {
      setError(`Формат .${ext} не поддерживается. Используйте: ${SUPPORTED_EXTS.join(", ")}`);
      return;
    }

    if (ext === "txt") {
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target?.result as string);
      reader.readAsText(file, "UTF-8");
      return;
    }

    setParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
      const file_b64 = btoa(binary);

      const res = await fetch(PARSE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_b64, filename: file.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка при чтении файла");
      setText(data.text);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Не удалось прочитать файл");
    } finally {
      setParsing(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const generate = async () => {
    if (!text.trim()) { setError("Добавьте текст для озвучки"); return; }
    setError("");
    setScreen("generating");
    setProgress(0);

    const tick = setInterval(() => setProgress(p => Math.min(p + Math.random() * 8, 88)), 600);

    try {
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 5000), voice_id: voice, speed, user_id: USER_ID, title }),
      });
      clearInterval(tick);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Ошибка генерации");
      setProgress(100);
      setResultUrl(data.audio_url);
      setResultId(data.project_id);
      setTimeout(() => setScreen("result"), 400);
    } catch (e: unknown) {
      clearInterval(tick);
      setError(e instanceof Error ? e.message : "Произошла ошибка");
      setScreen("editor");
    }
  };

  const loadCabinet = async () => {
    setLoadingCabinet(true);
    setScreen("cabinet");
    try {
      const res = await fetch(`${TTS_URL}?user_id=${USER_ID}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      setProjects([]);
    }
    setLoadingCabinet(false);
  };

  const deleteProject = async (id: string) => {
    await fetch(`${TTS_URL}?project_id=${id}`, { method: "DELETE" });
    setProjects(p => p.filter(x => x.id !== id));
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const goNewBook = () => { setText(""); setTitle("Моя аудиокнига"); setScreen("editor"); };

  return (
    <div
      className="min-h-screen font-ibm transition-colors duration-300"
      style={{ background: "var(--ab-page-bg)", color: "var(--ab-text-primary)" }}
    >
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md px-6 py-3 flex items-center justify-between shadow-sm transition-colors duration-300"
        style={{ background: "var(--ab-card)", borderBottom: "1px solid var(--ab-border)" }}
        role="navigation"
        aria-label="Основная навигация"
      >
        <button
          onClick={() => setScreen("home")}
          className="flex items-center gap-2"
          aria-label="На главную — АудиоКнига Мастер"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center">
            <Icon name="BookAudio" fallback="BookOpen" size={16} className="text-white" />
          </div>
          <span className="font-bold" style={{ color: "var(--ab-text-primary)" }}>АудиоКнига Мастер</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCabinet}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all hover:bg-blue-50 dark:hover:bg-blue-950/30"
            style={{ color: "var(--ab-text-secondary)" }}
            aria-label="Открыть мои книги"
          >
            <Icon name="FolderOpen" size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Мои книги</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all hover:bg-blue-50 dark:hover:bg-blue-950/30"
            style={{ color: "var(--ab-text-secondary)" }}
            aria-label={theme === "light" ? "Переключить на тёмную тему" : "Переключить на светлую тему"}
          >
            <Icon name={theme === "light" ? "Moon" : "Sun"} size={17} aria-hidden="true" />
          </button>

          <button
            onClick={goNewBook}
            className="flex items-center gap-2 text-sm text-white font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-md"
            style={{ background: "var(--ab-accent)" }}
            aria-label="Создать новую аудиокнигу"
            onMouseEnter={e => (e.currentTarget.style.background = "var(--ab-accent-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--ab-accent)")}
          >
            <Icon name="Plus" size={16} aria-hidden="true" />
            Создать
          </button>
        </div>
      </nav>

      <div className="pt-16">
        {screen === "home" && (
          <HomeScreen setScreen={setScreen} onLoadCabinet={loadCabinet} />
        )}

        {screen === "editor" && (
          <EditorScreen
            text={text} setText={setText}
            title={title} setTitle={setTitle}
            voice={voice} setVoice={setVoice}
            speed={speed} setSpeed={setSpeed}
            dragging={dragging} setDragging={setDragging}
            parsing={parsing}
            error={error}
            onGenerate={generate}
            onDrop={onDrop}
            onFileChange={handleFile}
            setScreen={setScreen}
          />
        )}

        {screen === "generating" && (
          <GeneratingScreen progress={progress} voice={voice} />
        )}

        {screen === "result" && (
          <ResultScreen
            title={title}
            voice={voice}
            speed={speed}
            resultUrl={resultUrl}
            playing={playing}
            audioRef={audioRef}
            onTogglePlay={togglePlay}
            onSetPlaying={setPlaying}
            onNewBook={goNewBook}
            onLoadCabinet={loadCabinet}
          />
        )}

        {screen === "cabinet" && (
          <CabinetScreen
            projects={projects}
            loadingCabinet={loadingCabinet}
            setScreen={setScreen}
            onDeleteProject={deleteProject}
            onNewBook={goNewBook}
          />
        )}
      </div>

      {/* Footer */}
      <footer
        className="px-6 py-8 mt-20 transition-colors duration-300"
        style={{ borderTop: "1px solid var(--ab-border)", background: "var(--ab-card)" }}
        role="contentinfo"
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: "var(--ab-text-muted)" }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center" aria-hidden="true">
              <Icon name="BookOpen" size={12} className="text-white" />
            </div>
            <span className="font-semibold" style={{ color: "var(--ab-text-secondary)" }}>АудиоКнига Мастер</span>
          </div>
          <span>Синтез речи: Yandex SpeechKit</span>
          <span>© 2024 Все права защищены</span>
        </div>
      </footer>
    </div>
  );
}
