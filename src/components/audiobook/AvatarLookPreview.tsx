import Icon from "@/components/ui/icon";
import { AIButton } from "@/components/audiobook/EngineUI";

interface Props {
  gender: "Женский" | "Мужской";
  setGender: (v: "Женский" | "Мужской") => void;
  appearance: string;
  setAppearance: (v: string) => void;
  avatarUrl: string;
  setAvatarUrl: (v: string) => void;
  avatarVariants: string[];
  generating: boolean;
  genAvatar: () => void;
  genAvatarOne: () => void;
  color: string;
}

export function AvatarLookPreview({
  gender, setGender, appearance, setAppearance,
  avatarUrl, setAvatarUrl, avatarVariants, generating, genAvatar, genAvatarOne, color,
}: Props) {
  return (
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
        {/* Галерея вариантов лиц */}
        {avatarVariants.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {avatarVariants.map((url, i) => (
              <button key={i} onClick={() => setAvatarUrl(url)}
                className="w-14 h-14 rounded-xl overflow-hidden transition-all"
                style={{ border: avatarUrl === url ? `3px solid ${color}` : "2px solid var(--ab-border)" }}>
                <img src={url} alt={`Вариант ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <AIButton color={color} loading={generating}
            label={avatarVariants.length ? "3 новых варианта" : "Создать 3 лица ИИ"}
            onClick={genAvatar} disabled={!appearance.trim()} />
          {avatarVariants.length > 0 && (
            <AIButton color={color} variant="ghost" size="sm" loading={generating}
              label="+1" onClick={genAvatarOne} disabled={!appearance.trim()} />
          )}
        </div>
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
  );
}
