import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { Screen, VOICES, SUPPORTED_EXTS } from "@/components/audiobook/audiobook-data";

// ─── EditorScreen ─────────────────────────────────────────────────────────────
interface EditorScreenProps {
  text: string;
  setText: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  voice: string;
  setVoice: (v: string) => void;
  speed: number;
  setSpeed: (v: number) => void;
  dragging: boolean;
  setDragging: (v: boolean) => void;
  parsing: boolean;
  error: string;
  onGenerate: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (file: File) => void;
  setScreen: (s: Screen) => void;
}

export function EditorScreen({
  text, setText, title, setTitle, voice, setVoice, speed, setSpeed,
  dragging, setDragging, parsing, error, onGenerate, onDrop, onFileChange, setScreen,
}: EditorScreenProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8" aria-label="Редактор аудиокниги">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setScreen("home")}
          className="transition-colors"
          style={{ color: "var(--ab-text-secondary)" }}
          aria-label="Вернуться на главную"
        >
          <Icon name="ArrowLeft" size={20} aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: "var(--ab-text-primary)" }}>Новая аудиокнига</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: text */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl p-6" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
            <label htmlFor="book-title" className="block text-sm font-semibold mb-3" style={{ color: "var(--ab-text-primary)" }}>
              Название
            </label>
            <input
              id="book-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all"
              style={{ border: "1px solid var(--ab-border)", background: "var(--ab-page-bg)", color: "var(--ab-text-primary)" }}
              placeholder="Название аудиокниги"
            />
          </div>

          <div className="rounded-2xl p-6" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
            <label htmlFor="book-text" className="block text-sm font-semibold mb-3" style={{ color: "var(--ab-text-primary)" }}>
              Текст для озвучки
            </label>

            {/* Drop zone */}
            {!text && !parsing && (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
                aria-label="Загрузить файл для озвучки — нажмите или перетащите"
                className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-4"
                style={{
                  borderColor: dragging ? "#3b82f6" : "var(--ab-border)",
                  background: dragging ? "rgba(59,130,246,0.05)" : "transparent",
                }}
              >
                <Icon name="Upload" size={32} className="mx-auto mb-3" style={{ color: "var(--ab-text-muted)" } as React.CSSProperties} aria-hidden="true" />
                <p className="font-semibold" style={{ color: "var(--ab-text-secondary)" }}>Перетащите файл или нажмите для выбора</p>
                <div className="flex justify-center gap-2 mt-2 flex-wrap" aria-label="Поддерживаемые форматы">
                  {["TXT", "PDF", "EPUB", "DOCX"].map(f => (
                    <span key={f} className="text-xs bg-blue-50 text-blue-500 border border-blue-100 px-2 py-0.5 rounded-full font-medium">{f}</span>
                  ))}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept={SUPPORTED_EXTS.map(e => `.${e}`).join(",")}
                  className="hidden"
                  aria-hidden="true"
                  onChange={e => e.target.files?.[0] && onFileChange(e.target.files[0])}
                />
              </div>
            )}

            {/* Parsing indicator */}
            {parsing && (
              <div
                className="border-2 rounded-xl p-10 text-center mb-4"
                style={{ borderColor: "#93c5fd", background: "rgba(59,130,246,0.05)" }}
                role="status"
                aria-live="polite"
                aria-label="Читаю файл, извлекаю текст"
              >
                <Icon name="Loader2" size={32} className="mx-auto mb-3 animate-spin text-blue-400" aria-hidden="true" />
                <p className="font-semibold" style={{ color: "var(--ab-text-secondary)" }}>Читаю файл...</p>
                <p className="text-sm mt-1" style={{ color: "var(--ab-text-muted)" }}>Извлекаю текст из документа</p>
              </div>
            )}

            <textarea
              id="book-text"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={text ? 14 : 5}
              className="w-full rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-400/30 resize-none transition-all"
              style={{ border: "1px solid var(--ab-border)", background: "var(--ab-page-bg)", color: "var(--ab-text-primary)" }}
              placeholder="Или вставьте текст сюда..."
              aria-label="Текст для озвучки"
            />
            <div className="flex justify-between items-center mt-2 text-xs" style={{ color: "var(--ab-text-muted)" }}>
              <span>{text.length} символов</span>
              {text.length > 5000 && (
                <span className="text-amber-500" role="alert">⚠ Будут озвучены первые 5 000 символов</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: settings */}
        <div className="space-y-4" role="complementary" aria-label="Настройки озвучки">
          <div className="rounded-2xl p-6" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--ab-text-primary)" }}>
              <Icon name="User" size={16} className="text-[#3b82f6]" aria-hidden="true" />
              Голос диктора
            </h2>
            <div className="space-y-2" role="radiogroup" aria-label="Выбор голоса диктора">
              {VOICES.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVoice(v.id)}
                  role="radio"
                  aria-checked={voice === v.id}
                  aria-label={`${v.name}, ${v.gender}, стиль: ${v.style}`}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                  style={voice === v.id
                    ? { background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)", color: "#3b82f6" }
                    : { border: "1px solid transparent", color: "var(--ab-text-secondary)" }}
                >
                  <span className="text-xl" aria-hidden="true">{v.emoji}</span>
                  <div>
                    <div className="font-medium text-sm" style={{ color: "var(--ab-text-primary)" }}>{v.name}</div>
                    <div className="text-xs" style={{ color: "var(--ab-text-muted)" }}>{v.style}</div>
                  </div>
                  {voice === v.id && <Icon name="Check" size={14} className="ml-auto text-[#3b82f6]" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--ab-text-primary)" }}>
              <Icon name="Gauge" size={16} className="text-[#3b82f6]" aria-hidden="true" />
              Скорость речи: <span className="text-[#3b82f6]">{speed.toFixed(1)}x</span>
            </h2>
            <input
              type="range" min={0.8} max={2.0} step={0.1}
              value={speed}
              onChange={e => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
              aria-label={`Скорость речи: ${speed.toFixed(1)}x`}
              aria-valuemin={0.8}
              aria-valuemax={2.0}
              aria-valuenow={speed}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: "var(--ab-text-muted)" }}>
              <span>Медленно 0.8x</span>
              <span>Быстро 2.0x</span>
            </div>
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm flex items-start gap-2"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626" }}
              role="alert"
              aria-live="assertive"
            >
              <Icon name="AlertCircle" size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
              {error}
            </div>
          )}

          <button
            onClick={onGenerate}
            disabled={!text.trim()}
            className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
            aria-label="Создать аудиокнигу из введённого текста"
            aria-disabled={!text.trim()}
          >
            <Icon name="Wand2" size={18} aria-hidden="true" />
            Создать аудиокнигу
          </button>
          <p className="text-center text-xs" style={{ color: "var(--ab-text-muted)" }}>~30–60 секунд для короткого текста</p>
        </div>
      </div>
    </main>
  );
}

// ─── GeneratingScreen ─────────────────────────────────────────────────────────
interface GeneratingScreenProps {
  progress: number;
  voice: string;
}

export function GeneratingScreen({ progress, voice }: GeneratingScreenProps) {
  const voiceName = VOICES.find(v => v.id === voice)?.name ?? voice;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6" role="status" aria-live="polite" aria-label={`Создаю аудиокнигу, прогресс ${Math.round(progress)}%`}>
      <div className="max-w-md w-full text-center animate-fade-in">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200"
          style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          aria-hidden="true"
        >
          <Icon name="AudioWaveform" fallback="Mic" size={40} className="text-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--ab-text-primary)" }}>Создаю аудиокнигу...</h2>
        <p className="mb-8" style={{ color: "var(--ab-text-secondary)" }}>
          Нейросеть озвучивает текст голосом {voiceName}
        </p>

        <div className="rounded-2xl p-6 shadow-sm" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
          <div className="flex justify-between text-sm mb-3" style={{ color: "var(--ab-text-secondary)" }}>
            <span>Прогресс</span>
            <span className="font-semibold text-[#3b82f6]">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--ab-border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #3b82f6, #6366f1)" }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="flex justify-center gap-1 mt-6" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 rounded-full bg-[#3b82f6] wave-bar"
                style={{ height: "24px", animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ResultScreen ─────────────────────────────────────────────────────────────
interface ResultScreenProps {
  title: string;
  voice: string;
  speed: number;
  resultUrl: string;
  playing: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  onTogglePlay: () => void;
  onSetPlaying: (v: boolean) => void;
  onNewBook: () => void;
  onLoadCabinet: () => void;
}

export function ResultScreen({
  title, voice, speed, resultUrl, playing, audioRef,
  onTogglePlay, onSetPlaying, onNewBook, onLoadCabinet,
}: ResultScreenProps) {
  const voiceName = VOICES.find(v => v.id === voice)?.name ?? voice;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" aria-hidden="true">🎉</div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--ab-text-primary)" }}>Аудиокнига готова!</h1>
          <p style={{ color: "var(--ab-text-secondary)" }}>«{title}»</p>
        </div>

        <div className="rounded-2xl p-6 shadow-sm mb-6" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
          {resultUrl && (
            <audio
              ref={audioRef}
              src={resultUrl}
              onEnded={() => onSetPlaying(false)}
              aria-label={`Аудиокнига: ${title}`}
            />
          )}

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onTogglePlay}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 hover:scale-105 transition-transform flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
              aria-label={playing ? "Поставить на паузу" : "Воспроизвести аудиокнигу"}
            >
              <Icon name={playing ? "Pause" : "Play"} size={24} aria-hidden="true" />
            </button>
            <div className="flex-1">
              <div className="font-semibold" style={{ color: "var(--ab-text-primary)" }}>{title}</div>
              <div className="text-sm flex items-center gap-2" style={{ color: "var(--ab-text-muted)" }}>
                <span>{voiceName}</span>
                <span aria-hidden="true">·</span>
                <span>{speed}x</span>
              </div>
            </div>
          </div>

          {playing && (
            <div className="flex justify-center gap-1 py-2" aria-hidden="true">
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
            className="flex items-center justify-center gap-2 w-full text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-200"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
            aria-label={`Скачать аудиокнигу "${title}" в формате MP3`}
          >
            <Icon name="Download" size={18} aria-hidden="true" />
            Скачать MP3
          </a>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onNewBook}
              className="flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all hover:shadow-sm"
              style={{ border: "1px solid var(--ab-border)", color: "var(--ab-text-secondary)", background: "var(--ab-card)" }}
              aria-label="Создать новую аудиокнигу"
            >
              <Icon name="Plus" size={16} aria-hidden="true" />
              Новая книга
            </button>
            <button
              onClick={onLoadCabinet}
              className="flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all hover:shadow-sm"
              style={{ border: "1px solid var(--ab-border)", color: "var(--ab-text-secondary)", background: "var(--ab-card)" }}
              aria-label="Открыть мои книги"
            >
              <Icon name="FolderOpen" size={16} aria-hidden="true" />
              Мои книги
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
