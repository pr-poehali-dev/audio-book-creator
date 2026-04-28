import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const TTS_URL = "https://functions.poehali.dev/ce35a220-1add-443c-976f-1406e37ffb0e";

const VOICES = [
  { id: "alena", name: "Алёна", gender: "Женский", style: "Нейтральный", emoji: "👩" },
  { id: "jane",  name: "Джейн",  gender: "Женский", style: "Эмоциональный", emoji: "👩‍🦰" },
  { id: "madirus", name: "Мадирус", gender: "Женский", style: "Спокойный", emoji: "👩‍🦱" },
  { id: "filipp", name: "Филипп", gender: "Мужской", style: "Нейтральный", emoji: "👨" },
  { id: "ermil", name: "Ермил", gender: "Мужской", style: "Тёплый", emoji: "👨‍🦳" },
  { id: "zahar",  name: "Захар",  gender: "Мужской", style: "Серьёзный", emoji: "👨‍💼" },
];

const USE_CASES = [
  { icon: "GraduationCap", title: "Для студентов", desc: "Слушайте учебники и статьи на ходу" },
  { icon: "Car", title: "За рулём", desc: "Превращайте документы в подкасты для дороги" },
  { icon: "Eye", title: "Для зрения", desc: "Комфортное восприятие без нагрузки на глаза" },
  { icon: "PenLine", title: "Для писателей", desc: "Услышьте свой текст со стороны" },
];

type Screen = "home" | "editor" | "generating" | "result" | "cabinet";

interface Project {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
  status: string;
  duration_sec?: number;
}

const USER_ID = "user_" + (localStorage.getItem("uid") || (() => {
  const id = Math.random().toString(36).slice(2);
  localStorage.setItem("uid", id);
  return id;
})());

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("Моя аудиокнига");
  const [voice, setVoice] = useState("alena");
  const [speed, setSpeed] = useState(1.0);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultId, setResultId] = useState("");
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingCabinet, setLoadingCabinet] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setTitle(file.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (e) => setText(e.target?.result as string);
    reader.readAsText(file, "UTF-8");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

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

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#1a2033] font-ibm">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e5e9f0] px-6 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => setScreen("home")} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center">
            <Icon name="BookAudio" fallback="BookOpen" size={16} className="text-white" />
          </div>
          <span className="font-bold text-[#1a2033]">АудиоКнига Мастер</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={loadCabinet}
            className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#3b82f6] px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
          >
            <Icon name="FolderOpen" size={16} />
            <span className="hidden sm:inline">Мои книги</span>
          </button>
          <button
            onClick={() => { setText(""); setTitle("Моя аудиокнига"); setScreen("editor"); }}
            className="flex items-center gap-2 text-sm bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-md"
          >
            <Icon name="Plus" size={16} />
            Создать
          </button>
        </div>
      </nav>

      <div className="pt-16">

        {/* HOME */}
        {screen === "home" && (
          <div>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#eef2ff] via-[#f4f6f9] to-[#eff6ff] px-6 py-24 text-center">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-60 bg-indigo-200/30 rounded-full blur-3xl" />
              </div>
              <div className="relative max-w-3xl mx-auto animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Синтез речи нейросетью
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-[#1a2033] leading-tight mb-6">
                  Превратите любой текст<br />
                  <span className="bg-gradient-to-r from-[#3b82f6] to-[#6366f1] bg-clip-text text-transparent">в аудиокнигу</span>
                </h1>
                <p className="text-[#64748b] text-xl mb-10 max-w-xl mx-auto">
                  Загрузите файл или вставьте текст — через минуту получите готовый MP3 с голосом профессионального диктора.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => { setText(""); setTitle("Моя аудиокнига"); setScreen("editor"); }}
                    className="flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
                  >
                    <Icon name="Mic" size={20} />
                    Создать аудиокнигу
                  </button>
                  <button
                    onClick={loadCabinet}
                    className="flex items-center justify-center gap-2 bg-white text-[#64748b] hover:text-[#3b82f6] border border-[#e2e8f0] font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:border-blue-300 hover:shadow-sm"
                  >
                    <Icon name="FolderOpen" size={20} />
                    Мои проекты
                  </button>
                </div>
              </div>
            </section>

            {/* Use cases */}
            <section className="px-6 py-20 max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-[#1a2033] mb-12">Для кого это приложение?</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {USE_CASES.map((u, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-[#e5e9f0] hover:border-blue-200 hover:shadow-md transition-all text-center animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                      <Icon name={u.icon as Parameters<typeof Icon>[0]["name"]} fallback="Star" size={22} className="text-[#3b82f6]" />
                    </div>
                    <h3 className="font-semibold text-[#1a2033] mb-2">{u.title}</h3>
                    <p className="text-sm text-[#64748b]">{u.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* How it works */}
            <section className="bg-white px-6 py-20">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-[#1a2033] mb-12">Как это работает</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { step: "1", icon: "Upload", title: "Загрузите текст", desc: "Вставьте текст вручную или загрузите файл .txt" },
                    { step: "2", icon: "SlidersHorizontal", title: "Настройте голос", desc: "Выберите диктора, скорость и интонацию" },
                    { step: "3", icon: "Download", title: "Скачайте MP3", desc: "Получите готовый аудиофайл за 30–60 секунд" },
                  ].map((s) => (
                    <div key={s.step} className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                        <Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} fallback="Star" size={24} className="text-white" />
                      </div>
                      <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Шаг {s.step}</div>
                      <h3 className="font-bold text-lg text-[#1a2033] mb-2">{s.title}</h3>
                      <p className="text-[#64748b] text-sm">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Voices preview */}
            <section className="px-6 py-20 max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-[#1a2033] mb-4">6 профессиональных голосов</h2>
              <p className="text-center text-[#64748b] mb-12">Нейросетевые дикторы Yandex SpeechKit</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {VOICES.map((v) => (
                  <div key={v.id} className="bg-white rounded-2xl p-5 border border-[#e5e9f0] flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all">
                    <div className="text-3xl">{v.emoji}</div>
                    <div>
                      <div className="font-semibold text-[#1a2033]">{v.name}</div>
                      <div className="text-xs text-[#64748b]">{v.gender} · {v.style}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* EDITOR */}
        {screen === "editor" && (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setScreen("home")} className="text-[#64748b] hover:text-[#3b82f6] transition-colors">
                <Icon name="ArrowLeft" size={20} />
              </button>
              <h1 className="text-2xl font-bold text-[#1a2033]">Новая аудиокнига</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Left: text */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl p-6 border border-[#e5e9f0]">
                  <label className="block text-sm font-semibold text-[#1a2033] mb-3">Название</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full border border-[#e5e9f0] rounded-xl px-4 py-3 text-[#1a2033] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Название аудиокниги"
                  />
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#e5e9f0]">
                  <label className="block text-sm font-semibold text-[#1a2033] mb-3">Текст для озвучки</label>

                  {/* Drop zone */}
                  {!text && (
                    <div
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-4 ${
                        dragging ? "border-blue-400 bg-blue-50" : "border-[#e2e8f0] hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <Icon name="Upload" size={32} className="text-[#94a3b8] mx-auto mb-3" />
                      <p className="font-semibold text-[#475569]">Перетащите файл или нажмите для выбора</p>
                      <p className="text-sm text-[#94a3b8] mt-1">.txt файлы</p>
                      <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    </div>
                  )}

                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={text ? 14 : 5}
                    className="w-full border border-[#e5e9f0] rounded-xl px-4 py-3 text-[#1a2033] text-sm leading-relaxed focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                    placeholder="Или вставьте текст сюда..."
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-[#94a3b8]">
                    <span>{text.length} символов</span>
                    {text.length > 5000 && <span className="text-amber-500">⚠ Будут озвучены первые 5 000 символов</span>}
                  </div>
                </div>
              </div>

              {/* Right: settings */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 border border-[#e5e9f0]">
                  <h3 className="font-semibold text-[#1a2033] mb-4 flex items-center gap-2">
                    <Icon name="User" size={16} className="text-[#3b82f6]" />
                    Голос диктора
                  </h3>
                  <div className="space-y-2">
                    {VOICES.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setVoice(v.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                          voice === v.id
                            ? "bg-blue-50 border border-blue-200 text-[#3b82f6]"
                            : "border border-transparent hover:bg-[#f8fafc] text-[#475569]"
                        }`}
                      >
                        <span className="text-xl">{v.emoji}</span>
                        <div>
                          <div className="font-medium text-sm text-[#1a2033]">{v.name}</div>
                          <div className="text-xs text-[#94a3b8]">{v.style}</div>
                        </div>
                        {voice === v.id && <Icon name="Check" size={14} className="ml-auto text-[#3b82f6]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#e5e9f0]">
                  <h3 className="font-semibold text-[#1a2033] mb-4 flex items-center gap-2">
                    <Icon name="Gauge" size={16} className="text-[#3b82f6]" />
                    Скорость речи: <span className="text-[#3b82f6]">{speed.toFixed(1)}x</span>
                  </h3>
                  <input
                    type="range" min={0.8} max={2.0} step={0.1}
                    value={speed}
                    onChange={e => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-[#94a3b8] mt-1">
                    <span>Медленно 0.8x</span>
                    <span>Быстро 2.0x</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
                    <Icon name="AlertCircle" size={16} className="flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button
                  onClick={generate}
                  disabled={!text.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] hover:from-[#2563eb] hover:to-[#4f46e5] disabled:from-[#94a3b8] disabled:to-[#94a3b8] text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-200 disabled:cursor-not-allowed"
                >
                  <Icon name="Wand2" size={18} />
                  Создать аудиокнигу
                </button>
                <p className="text-center text-xs text-[#94a3b8]">~30–60 секунд для короткого текста</p>
              </div>
            </div>
          </div>
        )}

        {/* GENERATING */}
        {screen === "generating" && (
          <div className="min-h-[80vh] flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center animate-fade-in">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200">
                <Icon name="AudioWaveform" fallback="Mic" size={40} className="text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-[#1a2033] mb-2">Создаю аудиокнигу...</h2>
              <p className="text-[#64748b] mb-8">Нейросеть озвучивает текст голосом {VOICES.find(v => v.id === voice)?.name}</p>

              <div className="bg-white rounded-2xl p-6 border border-[#e5e9f0] shadow-sm">
                <div className="flex justify-between text-sm text-[#64748b] mb-3">
                  <span>Прогресс</span>
                  <span className="font-semibold text-[#3b82f6]">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3b82f6] to-[#6366f1] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-center gap-1 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 rounded-full bg-[#3b82f6] wave-bar"
                      style={{ height: "24px", animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {screen === "result" && (
          <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <div className="max-w-lg w-full animate-fade-in">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-[#1a2033] mb-2">Аудиокнига готова!</h2>
                <p className="text-[#64748b]">«{title}»</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#e5e9f0] shadow-sm mb-6">
                {resultUrl && <audio ref={audioRef} src={resultUrl} onEnded={() => setPlaying(false)} />}

                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center text-white shadow-lg shadow-blue-200 hover:scale-105 transition-transform flex-shrink-0"
                  >
                    <Icon name={playing ? "Pause" : "Play"} size={24} />
                  </button>
                  <div className="flex-1">
                    <div className="font-semibold text-[#1a2033]">{title}</div>
                    <div className="text-sm text-[#94a3b8] flex items-center gap-2">
                      <span>{VOICES.find(v => v.id === voice)?.name}</span>
                      <span>·</span>
                      <span>{speed}x</span>
                    </div>
                  </div>
                </div>

                {playing && (
                  <div className="flex justify-center gap-1 py-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-1 rounded-full bg-[#3b82f6] wave-bar"
                        style={{ height: "20px", animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <a
                  href={resultUrl}
                  download={`${title}.mp3`}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white font-bold py-4 rounded-xl hover:from-[#2563eb] hover:to-[#4f46e5] transition-all hover:shadow-lg hover:shadow-blue-200"
                >
                  <Icon name="Download" size={18} />
                  Скачать MP3
                </a>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setText(""); setTitle("Моя аудиокнига"); setScreen("editor"); }}
                    className="flex items-center justify-center gap-2 border border-[#e2e8f0] text-[#475569] hover:border-blue-300 hover:text-[#3b82f6] font-semibold py-3 rounded-xl transition-all hover:bg-blue-50"
                  >
                    <Icon name="Plus" size={16} />
                    Новая книга
                  </button>
                  <button
                    onClick={loadCabinet}
                    className="flex items-center justify-center gap-2 border border-[#e2e8f0] text-[#475569] hover:border-blue-300 hover:text-[#3b82f6] font-semibold py-3 rounded-xl transition-all hover:bg-blue-50"
                  >
                    <Icon name="FolderOpen" size={16} />
                    Мои книги
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CABINET */}
        {screen === "cabinet" && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setScreen("home")} className="text-[#64748b] hover:text-[#3b82f6] transition-colors">
                <Icon name="ArrowLeft" size={20} />
              </button>
              <h1 className="text-2xl font-bold text-[#1a2033]">Мои аудиокниги</h1>
            </div>

            {loadingCabinet ? (
              <div className="text-center py-20 text-[#94a3b8]">
                <Icon name="Loader2" size={32} className="mx-auto mb-4 animate-spin" />
                Загружаю проекты...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#e5e9f0]">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-[#1a2033] mb-2">Пока нет аудиокниг</h3>
                <p className="text-[#64748b] mb-6">Создайте первую — это займёт меньше минуты</p>
                <button
                  onClick={() => { setText(""); setTitle("Моя аудиокнига"); setScreen("editor"); }}
                  className="inline-flex items-center gap-2 bg-[#3b82f6] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#2563eb] transition-all"
                >
                  <Icon name="Plus" size={16} />
                  Создать первую книгу
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl p-5 border border-[#e5e9f0] flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Icon name="BookOpen" size={20} className="text-[#3b82f6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#1a2033] truncate">{p.title}</div>
                      <div className="text-xs text-[#94a3b8] mt-0.5">
                        {new Date(p.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {p.audio_url && (
                        <a
                          href={p.audio_url}
                          download={`${p.title}.mp3`}
                          className="flex items-center gap-1 text-sm text-[#3b82f6] hover:text-[#2563eb] border border-blue-200 hover:border-blue-400 px-3 py-2 rounded-lg transition-all"
                        >
                          <Icon name="Download" size={14} />
                          MP3
                        </a>
                      )}
                      <button
                        onClick={() => deleteProject(p.id)}
                        className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="border-t border-[#e5e9f0] bg-white px-6 py-8 mt-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#94a3b8]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center">
              <Icon name="BookOpen" size={12} className="text-white" />
            </div>
            <span className="font-semibold text-[#475569]">АудиоКнига Мастер</span>
          </div>
          <span>Синтез речи: Yandex SpeechKit</span>
          <span>© 2024 Все права защищены</span>
        </div>
      </footer>
    </div>
  );
}
