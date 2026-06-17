import Icon from "@/components/ui/icon";
import { LeadAnalysis } from "@/components/audiobook/AvatarScreen";

interface Props {
  lead: LeadAnalysis;
  color: string;
}

export const tempColor = (t: string) =>
  t === "горячий" ? "#ef4444" : t === "тёплый" ? "#f59e0b" : "#3b82f6";

export function AvatarLeadPanel({ lead, color }: Props) {
  return (
    <div className="rounded-2xl p-5 animate-fade-in" style={{ background: "var(--ab-card)", border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--ab-border)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={tempColor(lead.temperature)} strokeWidth="3"
              strokeDasharray={`${lead.score}, 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold"
            style={{ color: tempColor(lead.temperature) }}>{lead.score}</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
              style={{ background: `${tempColor(lead.temperature)}18`, color: tempColor(lead.temperature) }}>
              {lead.temperature} лид
            </span>
            {lead.name && <span className="text-sm font-medium" style={{ color: "var(--ab-text-primary)" }}>{lead.name}</span>}
          </div>
          <div className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>{lead.summary}</div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        {lead.interests?.length > 0 && (
          <div className="rounded-xl p-3" style={{ background: "var(--ab-page-bg)" }}>
            <div className="font-semibold mb-1.5" style={{ color }}>Интересы</div>
            {lead.interests.map((s, i) => <div key={i} style={{ color: "var(--ab-text-secondary)" }}>• {s}</div>)}
          </div>
        )}
        {lead.objections?.length > 0 && (
          <div className="rounded-xl p-3" style={{ background: "var(--ab-page-bg)" }}>
            <div className="font-semibold mb-1.5" style={{ color: "#f59e0b" }}>Возражения</div>
            {lead.objections.map((s, i) => <div key={i} style={{ color: "var(--ab-text-secondary)" }}>• {s}</div>)}
          </div>
        )}
      </div>
      {lead.contact && (
        <div className="mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-xl"
          style={{ background: "#22c55e15", color: "#16a34a" }}>
          <Icon name="Phone" size={14} />Контакт клиента: <span className="font-semibold">{lead.contact}</span>
        </div>
      )}
      {lead.next_step && (
        <div className="mt-3 text-sm px-4 py-3 rounded-xl border-l-2"
          style={{ borderColor: color, background: `${color}08`, color: "var(--ab-text-primary)" }}>
          👉 <span className="font-medium">Следующий шаг:</span> {lead.next_step}
        </div>
      )}
    </div>
  );
}
