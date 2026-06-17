import { useState } from "react";
import Icon from "@/components/ui/icon";
import { AIButton, MiniPlayer } from "@/components/audiobook/EngineUI";
import { Persona, ChatMsg } from "@/components/audiobook/AvatarScreen";

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
  color: string;
}

const SUGGESTIONS = [
  "Сколько это стоит?",
  "Чем вы лучше конкурентов?",
  "У меня нет времени, перезвоните позже",
  "Это слишком дорого для меня",
];

export function AvatarChatStep({
  persona, chat, setChat, loading, loadingTask, voicing, audioUrl, setAudioUrl,
  sendMessage, voiceText, avatarUrl, color,
}: Props) {
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
        {/* Шапка чата */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--ab-border)" }}>
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : <Icon name="UserRound" fallback="User" size={18} className="text-white" />}
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: "var(--ab-text-primary)" }}>{persona?.name || "Аватар-продавец"}</div>
            <div className="text-xs flex items-center gap-1" style={{ color: "#22c55e" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />онлайн
            </div>
          </div>
          {chat.length > 0 && (
            <button onClick={() => setChat([])} className="ml-auto p-2 rounded-lg transition-all"
              style={{ color: "var(--ab-text-secondary)" }} title="Очистить чат">
              <Icon name="Trash2" size={15} />
            </button>
          )}
        </div>

        {/* Сообщения */}
        <div className="px-5 py-4 flex flex-col gap-3 min-h-[300px] max-h-[420px] overflow-y-auto">
          {chat.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Icon name="MessageSquare" size={32} className="opacity-30" style={{ color } as React.CSSProperties} />
              <div className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>
                Напиши сообщение клиента — аватар ответит как живой продавец
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
                  <button onClick={() => voiceText(m.text, "ответ")}
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
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Сообщение от лица клиента…"
            className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none"
            style={{ background: "var(--ab-page-bg)", border: "1px solid var(--ab-border)", color: "var(--ab-text-primary)" }} />
          <button onClick={send} disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}>
            <Icon name="Send" size={16} />
          </button>
        </div>
      </div>

      {audioUrl && (
        <MiniPlayer url={audioUrl} title="Ответ аватара" color={color} onClose={() => setAudioUrl("")} />
      )}

      <div className="rounded-2xl p-5 flex items-start gap-3"
        style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
        <AIButton color={color} size="sm" label="" onClick={() => { /* визуальный акцент */ }} variant="ghost" disabled />
        <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>
          <span className="font-semibold" style={{ color }}>Готово!</span> Твой виртуальный продавец обучен.
          Сохрани его кнопкой «Сохранить» вверху — внешность, голос и все скрипты передадутся клиенту.
        </div>
      </div>
    </div>
  );
}
