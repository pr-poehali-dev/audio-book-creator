import { useState, useRef, useCallback, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  TTS_URL, PARSE_URL, SUPPORTED_EXTS,
  Screen, Project, USER_ID, CREATIVE_MODULES,
} from "@/components/audiobook/audiobook-data";
import { HomeScreen }      from "@/components/audiobook/HomeScreen";
import { EditorScreen, GeneratingScreen, ResultScreen } from "@/components/audiobook/EditorScreens";
import { CabinetScreen }   from "@/components/audiobook/CabinetScreen";
import { BookWriterScreen } from "@/components/audiobook/BookWriterScreen";
import { AnimationScreen }  from "@/components/audiobook/AnimationScreen";
import { PodcastScreen }    from "@/components/audiobook/PodcastScreen";
import { PoemScreen }       from "@/components/audiobook/PoemScreen";

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
  return { theme, toggle: () => setTheme(t => t === "light" ? "dark" : "light") };
}

const NAV_MODULES: Screen[] = ["editor", "book-writer", "animation", "podcast", "poem"];

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();

  const [screen, setScreen]       = useState<Screen>("home");
  const [menuOpen, setMenuOpen]   = useState(false);
  const [text, setText]           = useState("");
  const [title, setTitle]         = useState("Моя аудиокнига");
  const [voice, setVoice]         = useState("alena");
  const [speed, setSpeed]         = useState(1.0);
  const [dragging, setDragging]   = useState(false);
  const [parsing, setParsing]     = useState(false);
  const [progress, setProgress]   = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultId, setResultId]   = useState("");
  const [error, setError]         = useState("");
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loadingCabinet, setLoadingCabinet] = useState(false);
  const [playing, setPlaying]     = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const goScreen = (s: Screen) => { setScreen(s); setMenuOpen(false); };

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
      const res = await fetch(PARSE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_b64: btoa(binary), filename: file.name }),
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

  const goNewBook = () => { setText(""); setTitle("Моя аудиокнига"); goScreen("editor"); };

  const isCreativeScreen = NAV_MODULES.includes(screen) || screen === "home";

  return (
    <div className="min-h-screen font-ibm transition-colors duration-300"
      style={{ background: "var(--ab-page-bg)", color: "var(--ab-text-primary)" }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-colors duration-300"
        style={{ background: "var(--ab-card)", borderBottom: "1px solid var(--ab-border)" }}>
        <div className="px-5 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <button onClick={() => goScreen("home")} className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)" }}>
              <Icon name="Sparkles" fallback="Star" size={15} className="text-white" />
            </div>
            <span className="font-bold text-sm hidden sm:block" style={{ color: "var(--ab-text-primary)" }}>
              Творческая Мастерская
            </span>
          </button>

          {/* Desktop nav — модули */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_MODULES.map(id => {
              const m = CREATIVE_MODULES.find(x => x.id === id)!;
              const active = screen === id;
              return (
                <button key={id} onClick={() => goScreen(id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={active
                    ? { background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}35` }
                    : { color: "var(--ab-text-secondary)" }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = `${m.color}0a`; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  <Icon name={m.icon as Parameters<typeof Icon>[0]["name"]} fallback="Star" size={14} />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={loadCabinet}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all"
              style={{ color: "var(--ab-text-secondary)" }}>
              <Icon name="FolderOpen" size={15} />
              <span className="hidden lg:inline">Мои проекты</span>
            </button>
            <button onClick={toggleTheme}
              className="p-2 rounded-xl transition-all"
              style={{ color: "var(--ab-text-secondary)" }}>
              <Icon name={theme === "light" ? "Moon" : "Sun"} size={16} />
            </button>
            <button onClick={goNewBook}
              className="flex items-center gap-1.5 text-xs text-white font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-90 hidden sm:flex"
              style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)" }}>
              <Icon name="Plus" size={14} />
              Аудиокнига
            </button>
            {/* Mobile burger */}
            <button onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-xl transition-all"
              style={{ color: "var(--ab-text-secondary)" }}>
              <Icon name={menuOpen ? "X" : "Menu"} size={18} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-1 animate-fade-in"
            style={{ borderTop: "1px solid var(--ab-border)" }}>
            {NAV_MODULES.map(id => {
              const m = CREATIVE_MODULES.find(x => x.id === id)!;
              return (
                <button key={id} onClick={() => goScreen(id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                  style={screen === id
                    ? { background: `${m.color}15`, color: m.color }
                    : { color: "var(--ab-text-secondary)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${m.color}18` }}>
                    <Icon name={m.icon as Parameters<typeof Icon>[0]["name"]} fallback="Star" size={14} style={{ color: m.color } as React.CSSProperties} />
                  </div>
                  <div>
                    <div>{m.label}</div>
                    <div className="text-xs opacity-60">{m.tagline}</div>
                  </div>
                </button>
              );
            })}
            <button onClick={goNewBook}
              className="flex items-center justify-center gap-2 mt-2 py-3 rounded-xl text-sm text-white font-semibold"
              style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)" }}>
              <Icon name="Headphones" size={16} />Создать аудиокнигу
            </button>
          </div>
        )}
      </nav>

      {/* ── Screens ────────────────────────────────────────────────────────── */}
      <div className={isCreativeScreen ? "pt-16" : "pt-14"}>

        {screen === "home" && (
          <HomeScreen
            setScreen={setScreen}
            onLoadCabinet={loadCabinet}
            onSelectBook={(bookText, bookTitle) => { setText(bookText); setTitle(bookTitle); }}
          />
        )}

        {screen === "editor" && (
          <EditorScreen
            text={text} setText={setText}
            title={title} setTitle={setTitle}
            voice={voice} setVoice={setVoice}
            speed={speed} setSpeed={setSpeed}
            dragging={dragging} setDragging={setDragging}
            parsing={parsing}
            error={error} setError={setError}
            onDrop={onDrop}
            handleFile={handleFile}
            onGenerate={generate}
          />
        )}

        {screen === "generating" && <GeneratingScreen progress={progress} />}

        {screen === "result" && (
          <ResultScreen
            resultUrl={resultUrl}
            resultId={resultId}
            title={title}
            playing={playing}
            onTogglePlay={togglePlay}
            audioRef={audioRef}
            onNewBook={goNewBook}
            onDeleteProject={deleteProject}
          />
        )}

        {screen === "cabinet" && (
          <CabinetScreen
            projects={projects}
            loadingCabinet={loadingCabinet}
            onDeleteProject={deleteProject}
            onNewBook={goNewBook}
            setScreen={setScreen}
          />
        )}

        {screen === "book-writer"  && <BookWriterScreen setScreen={setScreen} />}
        {screen === "animation"    && <AnimationScreen  setScreen={setScreen} />}
        {screen === "podcast"      && <PodcastScreen    setScreen={setScreen} />}
        {screen === "poem"         && <PoemScreen       setScreen={setScreen} />}
      </div>
    </div>
  );
}