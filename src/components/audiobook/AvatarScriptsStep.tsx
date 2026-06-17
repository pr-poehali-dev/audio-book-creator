import Icon from "@/components/ui/icon";
import { AIButton, MiniPlayer } from "@/components/audiobook/EngineUI";
import { Persona, FaqItem } from "@/components/audiobook/AvatarScreen";

type Step = "look" | "scripts" | "chat";

interface Props {
  persona: Persona | null;
  pitch: string;
  setPitch: (v: string) => void;
  faq: FaqItem[];
  loading: boolean;
  loadingTask: string | null;
  voicing: boolean;
  audioUrl: string;
  setAudioUrl: (v: string) => void;
  genPersona: () => void;
  genPitch: (length: string) => void;
  genFaq: () => void;
  voiceText: (txt: string, label: string) => void;
  product: string;
  color: string;
  setStep: (s: Step) => void;
}

export function AvatarScriptsStep({
  persona, pitch, setPitch, faq, loading, loadingTask, voicing, audioUrl, setAudioUrl,
  genPersona, genPitch, genFaq, voiceText, product, color, setStep,
}: Props) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Личность */}
      <div className="rounded-2xl p-6" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: "var(--ab-text-primary)" }}>
            <Icon name="IdCard" fallback="User" size={16} style={{ color } as React.CSSProperties} />
            Личность продавца
          </div>
          <AIButton size="sm" color={color} loading={loading && loadingTask === "avatar-persona"}
            label={persona ? "Пересоздать" : "Создать личность ИИ"} onClick={genPersona} disabled={!product.trim()} />
        </div>
        {persona ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                style={{ background: `${color}12`, color }}>{persona.name}</div>
              <div className="px-3 py-1.5 rounded-lg text-sm"
                style={{ background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)" }}>{persona.role}</div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ab-text-secondary)" }}>{persona.personality}</p>
            <div className="text-sm italic px-4 py-3 rounded-xl border-l-2"
              style={{ borderColor: color, background: `${color}08`, color: "var(--ab-text-primary)" }}>
              💬 {persona.greeting}
            </div>
            {persona.strengths?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {persona.strengths.map((s, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                    style={{ background: `${color}10`, color }}>
                    <Icon name="Check" size={11} />{s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-center py-6" style={{ color: "var(--ab-text-secondary)" }}>
            Сначала заполни «Что продаём» на прошлом шаге, затем создай личность
          </div>
        )}
      </div>

      {/* Продающий питч */}
      <div className="rounded-2xl p-6" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: "var(--ab-text-primary)" }}>
            <Icon name="Megaphone" fallback="Volume2" size={16} style={{ color } as React.CSSProperties} />
            Продающий монолог
          </div>
          <div className="flex items-center gap-2">
            {["короткая", "средняя", "длинная"].map(l => (
              <AIButton key={l} size="sm" variant="ghost" color={color}
                loading={loading && loadingTask === "avatar-pitch"}
                label={l.charAt(0).toUpperCase() + l.slice(1)} onClick={() => genPitch(l)} />
            ))}
          </div>
        </div>
        <textarea value={pitch} onChange={e => setPitch(e.target.value)}
          placeholder="Здесь появится продающий монолог. Нажми «Короткая / Средняя / Длинная»…"
          rows={5}
          className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed focus:outline-none resize-none"
          style={{ background: "var(--ab-page-bg)", border: "1px solid var(--ab-border)", color: "var(--ab-text-primary)" }} />
        {pitch && (
          <div className="flex items-center gap-2 mt-3">
            <AIButton size="sm" variant="ghost" color={color} loading={voicing}
              label="Озвучить питч" onClick={() => voiceText(pitch, "питч")} />
          </div>
        )}
        {audioUrl && (
          <div className="mt-3">
            <MiniPlayer url={audioUrl} title="Продающий монолог" color={color} onClose={() => setAudioUrl("")} />
          </div>
        )}
      </div>

      {/* FAQ и возражения */}
      <div className="rounded-2xl p-6" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: "var(--ab-text-primary)" }}>
            <Icon name="MessagesSquare" fallback="MessageCircle" size={16} style={{ color } as React.CSSProperties} />
            Ответы на вопросы и возражения
          </div>
          <AIButton size="sm" color={color} loading={loading && loadingTask === "avatar-faq"}
            label={faq.length ? "Обновить" : "Создать ответы ИИ"} onClick={genFaq} disabled={!product.trim()} />
        </div>
        {faq.length > 0 ? (
          <div className="flex flex-col gap-3">
            {faq.map((f, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: "var(--ab-page-bg)", border: "1px solid var(--ab-border)" }}>
                <div className="font-medium text-sm mb-1.5 flex items-start gap-2" style={{ color: "var(--ab-text-primary)" }}>
                  <Icon name="HelpCircle" size={14} className="mt-0.5 shrink-0" style={{ color } as React.CSSProperties} />
                  {f.question}
                </div>
                <div className="text-sm pl-6" style={{ color: "var(--ab-text-secondary)" }}>{f.answer}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-center py-6" style={{ color: "var(--ab-text-secondary)" }}>
            ИИ подготовит ответы на частые вопросы и проработает возражения
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep("look")} className="flex-1 py-3 rounded-xl font-medium"
          style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
          ← Назад
        </button>
        <button onClick={() => setStep("chat")} className="flex-2 px-8 py-3 rounded-xl text-white font-bold hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}>
          Проверить в чате →
        </button>
      </div>
    </div>
  );
}