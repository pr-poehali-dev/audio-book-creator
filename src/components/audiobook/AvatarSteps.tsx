import Icon from "@/components/ui/icon";
import { AB_COLOR } from "@/components/audiobook/avatar-types";

type StepId = "look" | "scripts" | "chat";

interface Props {
  step: StepId;
  setStep: (s: StepId) => void;
}

export function AvatarSteps({ step, setStep }: Props) {
  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
      {(["look", "scripts", "chat"] as const).map((s, i) => {
        const labels = ["Внешность и голос", "Скрипты продаж", "Чат-симулятор"];
        const order = ["look", "scripts", "chat"];
        const active = s === step;
        const done = order.indexOf(s) < order.indexOf(step);
        return (
          <button key={s} onClick={() => setStep(s)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            style={active
              ? { background: "rgba(6,182,212,0.15)", color: AB_COLOR, border: "1px solid rgba(6,182,212,0.4)" }
              : done
                ? { background: "rgba(6,182,212,0.07)", color: AB_COLOR, border: "1px solid rgba(6,182,212,0.15)" }
                : { background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
            {done ? <Icon name="Check" size={13} /> : <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
              style={{ background: active ? AB_COLOR : "var(--ab-border)", color: active ? "#fff" : "var(--ab-text-secondary)" }}>{i + 1}</span>}
            {labels[i]}
          </button>
        );
      })}
    </div>
  );
}
