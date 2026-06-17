import Icon from "@/components/ui/icon";

interface Props {
  industry: string;
  setIndustry: (v: string) => void;
  product: string;
  setProduct: (v: string) => void;
  knowledge: string;
  setKnowledge: (v: string) => void;
  industries: string[];
  color: string;
}

export function AvatarBusinessFields({
  industry, setIndustry, product, setProduct, knowledge, setKnowledge, industries, color,
}: Props) {
  return (
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
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--ab-text-secondary)" }}>
            <Icon name="BookText" fallback="FileText" size={14} style={{ color } as React.CSSProperties} />
            База знаний о товаре
          </label>
          {knowledge.trim() && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
              {knowledge.trim().length} симв.
            </span>
          )}
        </div>
        <textarea value={knowledge} onChange={e => setKnowledge(e.target.value)}
          placeholder="Вставь прайс, характеристики, условия, акции, гарантии… Аватар будет отвечать клиентам строго по этим данным — без выдумок."
          rows={5}
          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all resize-none"
          style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
          onFocus={e => (e.currentTarget.style.borderColor = color)}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
        <div className="text-xs mt-1.5" style={{ color: "var(--ab-text-secondary)" }}>
          💡 Чем подробнее — тем точнее аватар отвечает на вопросы клиентов
        </div>
      </div>
    </div>
  );
}
