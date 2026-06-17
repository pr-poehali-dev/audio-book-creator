import Icon from "@/components/ui/icon";
import { ChatMsg } from "@/components/audiobook/AvatarScreen";

const SUGGESTIONS = [
  "Сколько это стоит?",
  "Чем вы лучше конкурентов?",
  "Я подумаю, спасибо",
  "Это слишком дорого для меня",
];

interface Props {
  chat: ChatMsg[];
  setChat: React.Dispatch<React.SetStateAction<ChatMsg[]>>;
  setSpeakingIdx: (v: number | null) => void;
  loading: boolean;
  loadingTask: string | null;
  voicing: boolean;
  sendMessage: (message: string) => void;
  voiceText: (txt: string, label: string) => void;
  input: string;
  setInput: (v: string) => void;
  send: () => void;
  micSupported: boolean;
  listening: boolean;
  toggleMic: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  color: string;
}

export function AvatarChatWindow({
  chat, setChat, setSpeakingIdx, loading, loadingTask, voicing,
  sendMessage, voiceText, input, setInput, send,
  micSupported, listening, toggleMic, scrollRef, color,
}: Props) {
  return (
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
  );
}
