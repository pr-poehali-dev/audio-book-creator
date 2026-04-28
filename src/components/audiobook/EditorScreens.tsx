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
            {!text && !parsing && (
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
                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                  {["TXT", "PDF", "EPUB", "DOCX"].map(f => (
                    <span key={f} className="text-xs bg-blue-50 text-blue-500 border border-blue-100 px-2 py-0.5 rounded-full font-medium">{f}</span>
                  ))}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept={SUPPORTED_EXTS.map(e => `.${e}`).join(",")}
                  className="hidden"
                  onChange={e => e.target.files?.[0] && onFileChange(e.target.files[0])}
                />
              </div>
            )}

            {/* Parsing indicator */}
            {parsing && (
              <div className="border-2 border-blue-200 bg-blue-50 rounded-xl p-10 text-center mb-4">
                <Icon name="Loader2" size={32} className="text-blue-400 mx-auto mb-3 animate-spin" />
                <p className="font-semibold text-[#475569]">Читаю файл...</p>
                <p className="text-sm text-[#94a3b8] mt-1">Извлекаю текст из документа</p>
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
            onClick={onGenerate}
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
  );
}

// ─── GeneratingScreen ─────────────────────────────────────────────────────────
interface GeneratingScreenProps {
  progress: number;
  voice: string;
}

export function GeneratingScreen({ progress, voice }: GeneratingScreenProps) {
  return (
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
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-[#1a2033] mb-2">Аудиокнига готова!</h2>
          <p className="text-[#64748b]">«{title}»</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e5e9f0] shadow-sm mb-6">
          {resultUrl && <audio ref={audioRef} src={resultUrl} onEnded={() => onSetPlaying(false)} />}

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onTogglePlay}
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
              onClick={onNewBook}
              className="flex items-center justify-center gap-2 border border-[#e2e8f0] text-[#475569] hover:border-blue-300 hover:text-[#3b82f6] font-semibold py-3 rounded-xl transition-all hover:bg-blue-50"
            >
              <Icon name="Plus" size={16} />
              Новая книга
            </button>
            <button
              onClick={onLoadCabinet}
              className="flex items-center justify-center gap-2 border border-[#e2e8f0] text-[#475569] hover:border-blue-300 hover:text-[#3b82f6] font-semibold py-3 rounded-xl transition-all hover:bg-blue-50"
            >
              <Icon name="FolderOpen" size={16} />
              Мои книги
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
