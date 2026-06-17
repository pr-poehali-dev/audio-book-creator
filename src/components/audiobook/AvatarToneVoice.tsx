interface Tone { id: string; label: string; emoji: string; desc: string; }
interface VoiceItem { id: string; name: string; gender: string; style: string; emoji: string; }

interface Props {
  tone: string;
  setTone: (v: string) => void;
  voiceId: string;
  setVoiceId: (v: string) => void;
  gender: "Женский" | "Мужской";
  tones: Tone[];
  voices: VoiceItem[];
  color: string;
}

export function AvatarToneVoice({
  tone, setTone, voiceId, setVoiceId, gender, tones, voices, color,
}: Props) {
  const filteredVoices = voices.filter(v => v.gender === gender);

  return (
    <>
      {/* Тон общения */}
      <div>
        <div className="text-sm font-medium mb-3" style={{ color: "var(--ab-text-secondary)" }}>Характер и тон общения</div>
        <div className="grid sm:grid-cols-3 gap-3">
          {tones.map(t => (
            <button key={t.id} onClick={() => setTone(t.id)}
              className="rounded-2xl p-4 text-left transition-all hover:shadow-md"
              style={tone === t.id
                ? { background: `${color}10`, border: `2px solid ${color}80` }
                : { background: "var(--ab-card)", border: "2px solid var(--ab-border)" }}>
              <div className="text-2xl mb-1">{t.emoji}</div>
              <div className="font-semibold text-sm" style={{ color: "var(--ab-text-primary)" }}>{t.label}</div>
              <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Голос */}
      <div>
        <div className="text-sm font-medium mb-3" style={{ color: "var(--ab-text-secondary)" }}>Голос аватара</div>
        <div className="grid sm:grid-cols-3 gap-3">
          {filteredVoices.map(v => (
            <button key={v.id} onClick={() => setVoiceId(v.id)}
              className="rounded-xl p-4 flex items-center gap-3 transition-all"
              style={voiceId === v.id
                ? { background: `${color}10`, border: `2px solid ${color}80` }
                : { background: "var(--ab-card)", border: "2px solid var(--ab-border)" }}>
              <span className="text-2xl">{v.emoji}</span>
              <div className="text-left">
                <div className="font-semibold text-sm" style={{ color: "var(--ab-text-primary)" }}>{v.name}</div>
                <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>{v.style}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
