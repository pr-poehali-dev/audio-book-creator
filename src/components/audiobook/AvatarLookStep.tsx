import Icon from "@/components/ui/icon";
import { AIButton } from "@/components/audiobook/EngineUI";

type Step = "look" | "scripts" | "chat";

interface Tone { id: string; label: string; emoji: string; desc: string; }
interface VoiceItem { id: string; name: string; gender: string; style: string; emoji: string; }

interface Props {
  gender: "Женский" | "Мужской";
  setGender: (v: "Женский" | "Мужской") => void;
  appearance: string;
  setAppearance: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  product: string;
  setProduct: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  voiceId: string;
  setVoiceId: (v: string) => void;
  avatarUrl: string;
  generating: boolean;
  genAvatar: () => void;
  industries: string[];
  tones: Tone[];
  voices: VoiceItem[];
  color: string;
  setStep: (s: Step) => void;
}

export function AvatarLookStep({
  gender, setGender, appearance, setAppearance, industry, setIndustry,
  product, setProduct, tone, setTone, voiceId, setVoiceId, avatarUrl,
  generating, genAvatar, industries, tones, voices, color, setStep,
}: Props) {
  const filteredVoices = voices.filter(v => v.gender === gender);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Левая колонка — превью аватара */}
        <div className="rounded-2xl p-6 flex flex-col items-center justify-center gap-4 min-h-[340px]"
          style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Аватар" className="w-56 h-56 rounded-2xl object-cover shadow-lg" />
          ) : (
            <div className="w-56 h-56 rounded-2xl flex flex-col items-center justify-center gap-3"
              style={{ background: `${color}0d`, border: `2px dashed ${color}40` }}>
              {generating ? (
                <>
                  <Icon name="Loader2" size={36} className="animate-spin" style={{ color } as React.CSSProperties} />
                  <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>Создаю лицо…</div>
                </>
              ) : (
                <>
                  <Icon name="UserRound" fallback="User" size={48} className="opacity-30" style={{ color } as React.CSSProperties} />
                  <div className="text-xs text-center px-4" style={{ color: "var(--ab-text-secondary)" }}>
                    Опиши внешность и нажми «Создать лицо»
                  </div>
                </>
              )}
            </div>
          )}
          <AIButton color={color} loading={generating}
            label={avatarUrl ? "Сгенерировать заново" : "Создать лицо ИИ"}
            onClick={genAvatar} disabled={!appearance.trim()} />
        </div>

        {/* Правая колонка — настройки внешности */}
        <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Пол</label>
            <div className="flex gap-2">
              {(["Женский", "Мужской"] as const).map(g => (
                <button key={g} onClick={() => setGender(g)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={gender === g
                    ? { background: `${color}18`, color, border: `1px solid ${color}40` }
                    : { background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
                  {g === "Женский" ? "👩 Женский" : "👨 Мужской"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Опиши внешность</label>
            <textarea value={appearance} onChange={e => setAppearance(e.target.value)}
              placeholder="Например: женщина 30 лет, тёмные волосы каре, деловой костюм, доброжелательная улыбка…"
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all resize-none"
              style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
              onFocus={e => (e.currentTarget.style.borderColor = color)}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
          </div>
        </div>
      </div>

      {/* Сфера и продукт */}
      <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Сфера бизнеса</label>
          <div className="flex flex-wrap gap-2">
            {industries.map(ind => (
              <button key={ind} onClick={() => setIndustry(ind)}
                className="px-3 py-1.5 rounded-lg text-sm transition-all"
                style={industry === ind
                  ? { background: `${color}18`, color, border: `1px solid ${color}40` }
                  : { background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
                {ind}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Что продаём? (компания / продукт)</label>
          <input value={product} onChange={e => setProduct(e.target.value)}
            placeholder="Например: новостройки ЖК «Солнечный», ипотека от 5%…"
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
            style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
            onFocus={e => (e.currentTarget.style.borderColor = color)}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
        </div>
      </div>

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

      <button onClick={() => setStep("scripts")}
        className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}>
        Далее — Скрипты продаж →
      </button>
    </div>
  );
}
