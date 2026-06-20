import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Persona, ChatMsg, LeadAnalysis, ExpressionMap, Emotion } from "@/components/audiobook/AvatarScreen";
import { useSpeechInput } from "@/components/audiobook/engine";
import { AvatarSpeakingHead } from "@/components/audiobook/AvatarSpeakingHead";
import { AvatarLeadPanel } from "@/components/audiobook/AvatarLeadPanel";
import { AvatarChatWindow } from "@/components/audiobook/AvatarChatWindow";

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
  expressions?: ExpressionMap;
  autoVoice: boolean;
  setAutoVoice: (v: boolean) => void;
  speakingIdx: number | null;
  setSpeakingIdx: (v: number | null) => void;
  lead: LeadAnalysis | null;
  analyzeLead: () => void;
  hasKnowledge: boolean;
  color: string;
}

export function AvatarChatStep({
  persona, chat, setChat, loading, loadingTask, voicing, audioUrl, setAudioUrl,
  sendMessage, voiceText, avatarUrl, expressions, autoVoice, setAutoVoice,
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

  // Текущая эмоция: у говорящего сообщения, иначе у последнего ответа аватара
  const currentEmotion: Emotion =
    (speakingIdx !== null ? chat[speakingIdx]?.emotion : undefined) ||
    [...chat].reverse().find(m => m.from === "avatar")?.emotion ||
    "neutral";

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Говорящий аватар */}
      <AvatarSpeakingHead persona={persona} avatarUrl={avatarUrl} isSpeaking={isSpeaking}
        color={color} emotion={currentEmotion} expressions={expressions} />

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
      {lead && <AvatarLeadPanel lead={lead} color={color} />}

      {/* Окно чата */}
      <AvatarChatWindow
        chat={chat} setChat={setChat} setSpeakingIdx={setSpeakingIdx}
        loading={loading} loadingTask={loadingTask} voicing={voicing}
        sendMessage={sendMessage} voiceText={voiceText}
        input={input} setInput={setInput} send={send}
        micSupported={micSupported} listening={listening} toggleMic={toggleMic}
        scrollRef={scrollRef} color={color}
      />

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