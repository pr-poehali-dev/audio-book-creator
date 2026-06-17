import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Persona, ChatMsg, LeadAnalysis } from "@/components/audiobook/AvatarScreen";
import { useSpeechInput } from "@/components/audiobook/engine";

interface Props {
  persona: Persona | null;
  chat: ChatMsg[];
  setChat: React.Dispatch<React.SetStateAction<ChatMsg[]>>;
  loading: boolean;
  loadingTask: string | null;
  voicing: boolean;
  audioUrl: string;
  setAudioUrl: (v: string) => void;
  sendMessage: (message: string) => void;
  voiceText: (txt: string, label: string) => void;
  avatarUrl: string;
  autoVoice: boolean;
  setAutoVoice: (v: boolean) => void;
  speakingIdx: number | null;
  setSpeakingIdx: (v: number | null) => void;
  lead: LeadAnalysis | null;
  analyzeLead: () => void;
  hasKnowledge: boolean;
  color: string;
}

const SUGGESTIONS = [
  "Сколько это стоит?",
  "Чем вы лучше конкурентов?",
  "Я подумаю, спасибо",
  "Это слишком дорого для меня",
];

const tempColor = (t: string) =>
  t === "горячий" ? "#ef4444" : t === "тёплый" ? "#f59e0b" : "#3b82f6";

export function AvatarChatStep({
  persona, chat, setChat, loading, loadingTask, voicing, audioUrl, setAudioUrl,
  sendMessage, voiceText, avatarUrl, autoVoice, setAutoVoice,
  speakingIdx, setSpeakingIdx, lead, analyzeLead, hasKnowledge, color,
}: Props) {
  const [input, setInput] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { listening, toggle: toggleMic, supported: micSupported } = useSpeechInput((text) => {
    sendMessage(text);
  });

  // Авто-проигрывание озвученного ответа + анимация «говорит»
  useEffect(() => {
    if (speakingIdx === null) return;
    const msg = chat[speakingIdx];
    if (!msg?.audioUrl || !audioRef.current) return;
    audioRef.current.src = msg.audioUrl;
    audioRef.current.play().catch(() => { /* autoplay может блокироваться */ });
  }, [speakingIdx, chat]);

  // Автоскролл вниз
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat, loading]);

  const send = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const isSpeaking = speakingIdx !== null;

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Говорящий аватар */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="relative">
          {isSpeaking && (
            <>
              <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: color }} />
              <span className="absolute -inset-2 rounded-full animate-pulse opacity-20" style={{ background: color }} />
            </>
          )}
          <div className="relative w-28 h-28 rounded-full overflow-hidden flex items-center justify-center transition-all"
            style={{
              background: "linear-gradient(135deg,#06b6d4,#2563eb)",
              border: `3px solid ${isSpeaking ? color : "transparent"}`,
              boxShadow: isSpeaking ? `0 0 24px ${color}80` : "none",
              transform: isSpeaking ? "scale(1.03)" : "scale(1)",
            }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : <Icon name="UserRound" fallback="User" size={44} className="text-white" />}
          </div>
          {isSpeaking && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-4">
              {[0, 1, 2, 3].map(i => (
                <span key={i} className="w-1 rounded-full animate-pulse"
                  style={{ background: color, height: `${6 + (i % 2) * 6}px`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="font-semibold text-sm" style={{ color: "var(--ab-text-primary)" }}>{persona?.name || "Аватар-продавец"}</div>
          <div className="text-xs flex items-center justify-center gap-1" style={{ color: isSpeaking ? color : "#22c55e" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: isSpeaking ? color : "#22c55e" }} />
            {isSpeaking ? "говорит…" : "онлайн"}
          </div>
        </div>
      </div>

      {/* Тумблеры */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button onClick={() => setAutoVoice(!autoVoice)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={autoVoice
            ? { background: `${color}15`, color, border: `1px solid ${color}40` }
            : { background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
          <Icon name={autoVoice ? "Volume2" : "VolumeX"} size={14} />
          Авто-озвучка {autoVoice ? "вкл" : "выкл"}
        </button>
        <div className="flex items-center gap-2">
          {hasKnowledge && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
              style={{ background: `${color}12`, color }}>
              <Icon name="BookText" fallback="FileText" size={12} />База знаний активна
            </span>
          )}
          {chat.length > 1 && (
            <button onClick={analyzeLead} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
              <Icon name={loading && loadingTask === "avatar-analyze" ? "Loader2" : "ChartNoAxesColumn"} fallback="BarChart"
                size={14} className={loading && loadingTask === "avatar-analyze" ? "animate-spin" : ""} />
              Анализ лида
            </button>
          )}
        </div>
      </div>

      {/* Панель аналитики лида */}
      {lead && (
        <div className="rounded-2xl p-5 animate-fade-in" style={{ background: "var(--ab-card)", border: `1px solid ${color}30` }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--ab-border)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={tempColor(lead.temperature)} strokeWidth="3"
                  strokeDasharray={`${lead.score}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                style={{ color: tempColor(lead.temperature) }}>{lead.score}</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                  style={{ background: `${tempColor(lead.temperature)}18`, color: tempColor(lead.temperature) }}>
                  {lead.temperature} лид
                </span>
                {lead.name && <span className="text-sm font-medium" style={{ color: "var(--ab-text-primary)" }}>{lead.name}</span>}
              </div>
              <div className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>{lead.summary}</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {lead.interests?.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: "var(--ab-page-bg)" }}>
                <div className="font-semibold mb-1.5" style={{ color }}>Интересы</div>
                {lead.interests.map((s, i) => <div key={i} style={{ color: "var(--ab-text-secondary)" }}>• {s}</div>)}
              </div>
            )}
            {lead.objections?.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: "var(--ab-page-bg)" }}>
                <div className="font-semibold mb-1.5" style={{ color: "#f59e0b" }}>Возражения</div>
                {lead.objections.map((s, i) => <div key={i} style={{ color: "var(--ab-text-secondary)" }}>• {s}</div>)}
              </div>
            )}
          </div>
          {lead.contact && (
            <div className="mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-xl"
              style={{ background: "#22c55e15", color: "#16a34a" }}>
              <Icon name="Phone" size={14} />Контакт клиента: <span className="font-semibold">{lead.contact}</span>
            </div>
          )}
          {lead.next_step && (
            <div className="mt-3 text-sm px-4 py-3 rounded-xl border-l-2"
              style={{ borderColor: color, background: `${color}08`, color: "var(--ab-text-primary)" }}>
              👉 <span className="font-medium">Следующий шаг:</span> {lead.next_step}
            </div>
          )}
        </div>
      )}

      {/* Окно чата */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--ab-border)" }}>
          <div className="text-xs font-medium" style={{ color: "var(--ab-text-secondary)" }}>Диалог с клиентом</div>
          {chat.length > 0 && (
            <button onClick={() => { setChat([]); setSpeakingIdx(null); }} className="p-1.5 rounded-lg transition-all"
              style={{ color: "var(--ab-text-secondary)" }} title="Очистить чат">
              <Icon name="Trash2" size={15} />
            </button>
          )}
        </div>

        <div ref={scrollRef} className="px-5 py-4 flex flex-col gap-3 min-h-[280px] max-h-[400px] overflow-y-auto">
          {chat.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Icon name="MessageSquare" size={32} className="opacity-30" style={{ color } as React.CSSProperties} />
              <div className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>
                Напиши или скажи в микрофон сообщение клиента — аватар ответит голосом
              </div>
            </div>
          )}
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.from === "client" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={m.from === "client"
                  ? { background: "var(--ab-page-bg)", color: "var(--ab-text-primary)", border: "1px solid var(--ab-border)" }
                  : { background: `${color}12`, color: "var(--ab-text-primary)", border: `1px solid ${color}25` }}>
                {m.text}
                {m.from === "avatar" && (
                  <button
                    onClick={() => m.audioUrl ? setSpeakingIdx(i) : voiceText(m.text, "ответ")}
                    className="ml-2 inline-flex items-center align-middle opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color }} title="Озвучить" disabled={voicing}>
                    <Icon name={voicing ? "Loader2" : "Volume2"} size={13} className={voicing ? "animate-spin" : ""} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && loadingTask === "avatar-reply" && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 rounded-2xl text-sm flex items-center gap-2"
                style={{ background: `${color}12`, color: "var(--ab-text-secondary)" }}>
                <Icon name="Loader2" size={13} className="animate-spin" />печатает…
              </div>
            </div>
          )}
        </div>

        {/* Подсказки */}
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)} disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
              style={{ background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
              {s}
            </button>
          ))}
        </div>

        {/* Ввод */}
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderTop: "1px solid var(--ab-border)" }}>
          {micSupported && (
            <button onClick={toggleMic} disabled={loading}
              className="p-3 rounded-xl transition-all disabled:opacity-40 shrink-0"
              style={listening
                ? { background: "#ef4444", color: "#fff" }
                : { background: `${color}15`, color, border: `1px solid ${color}30` }}
              title={listening ? "Слушаю… нажми чтобы остановить" : "Сказать голосом"}>
              <Icon name={listening ? "MicOff" : "Mic"} size={16} className={listening ? "animate-pulse" : ""} />
            </button>
          )}
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={listening ? "Говорите…" : "Сообщение от лица клиента…"}
            className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none"
            style={{ background: "var(--ab-page-bg)", border: "1px solid var(--ab-border)", color: "var(--ab-text-primary)" }} />
          <button onClick={send} disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-40 shrink-0"
            style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}>
            <Icon name="Send" size={16} />
          </button>
        </div>
      </div>

      {/* Ручной плеер (если авто-озвучка выкл) */}
      {audioUrl && !autoVoice && (
        <MiniPlayerFallback url={audioUrl} color={color} onClose={() => setAudioUrl("")} />
      )}

      <audio ref={audioRef} onEnded={() => setSpeakingIdx(null)} className="hidden" />

      <div className="rounded-2xl p-5 flex items-start gap-3"
        style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
        <Icon name="Sparkles" fallback="Star" size={18} style={{ color } as React.CSSProperties} className="mt-0.5 shrink-0" />
        <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>
          <span className="font-semibold" style={{ color }}>Готово!</span> Аватар отвечает голосом, говорит по базе знаний
          и оценивает клиентов. Сохрани его кнопкой «Сохранить» вверху — всё передастся клиенту.
        </div>
      </div>
    </div>
  );
}

function MiniPlayerFallback({ url, color, onClose }: { url: string; color: string; onClose: () => void }) {
  return (
    <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: `${color}0d`, border: `1px solid ${color}30` }}>
      <Icon name="Music" size={16} style={{ color } as React.CSSProperties} />
      <audio src={url} controls className="flex-1 h-9" />
      <button onClick={onClose} className="p-1 opacity-50 hover:opacity-100" style={{ color: "var(--ab-text-secondary)" }}>
        <Icon name="X" size={14} />
      </button>
    </div>
  );
}
