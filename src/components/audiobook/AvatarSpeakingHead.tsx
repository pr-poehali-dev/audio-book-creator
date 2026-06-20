import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Persona, Emotion, ExpressionMap, EMOTIONS } from "@/components/audiobook/avatar-types";

interface Props {
  persona: Persona | null;
  avatarUrl: string;
  isSpeaking: boolean;
  color: string;
  emotion?: Emotion;
  expressions?: ExpressionMap;
}

export function AvatarSpeakingHead({ persona, avatarUrl, isSpeaking, color, emotion = "neutral", expressions = {} }: Props) {
  const [blink, setBlink] = useState(false);

  // Лёгкое «моргание» для живости — раз в 3–6 секунд
  useEffect(() => {
    let timer: number;
    const loop = () => {
      const delay = 3000 + Math.random() * 3000;
      timer = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 140);
        loop();
      }, delay);
    };
    loop();
    return () => window.clearTimeout(timer);
  }, []);

  // Когда аватар говорит — показываем приветливое/радостное лицо, если есть
  const activeEmotion: Emotion = isSpeaking && emotion === "neutral" ? "smile" : emotion;
  const face = expressions[activeEmotion] || avatarUrl;
  const meta = EMOTIONS.find(e => e.id === activeEmotion);

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative">
        {isSpeaking && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: color }} />
            <span className="absolute -inset-2 rounded-full animate-pulse opacity-20" style={{ background: color }} />
          </>
        )}
        <div className="relative w-28 h-28 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300"
          style={{
            background: "linear-gradient(135deg,#06b6d4,#2563eb)",
            border: `3px solid ${isSpeaking ? color : "transparent"}`,
            boxShadow: isSpeaking ? `0 0 24px ${color}80` : "none",
            transform: isSpeaking ? "scale(1.04)" : "scale(1)",
          }}>
          {face
            ? <img src={face} alt={meta?.label || "avatar"}
                className="w-full h-full object-cover transition-all duration-300"
                style={{ transform: blink ? "scaleY(0.94)" : "scaleY(1)", filter: blink ? "brightness(0.9)" : "none" }} />
            : <Icon name="UserRound" fallback="User" size={44} className="text-white" />}
        </div>

        {/* Бейдж текущей эмоции */}
        {meta && face && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full text-base shadow-md transition-all"
            style={{ background: "var(--ab-card)", border: `2px solid ${color}` }}
            title={meta.label}>
            {meta.emoji}
          </div>
        )}

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
          {isSpeaking ? `говорит · ${meta?.label || ""}` : "онлайн"}
        </div>
      </div>
    </div>
  );
}