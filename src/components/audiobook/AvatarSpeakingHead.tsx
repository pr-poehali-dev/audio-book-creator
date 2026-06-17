import Icon from "@/components/ui/icon";
import { Persona } from "@/components/audiobook/AvatarScreen";

interface Props {
  persona: Persona | null;
  avatarUrl: string;
  isSpeaking: boolean;
  color: string;
}

export function AvatarSpeakingHead({ persona, avatarUrl, isSpeaking, color }: Props) {
  return (
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
  );
}
