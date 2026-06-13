import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Screen } from "@/components/audiobook/audiobook-data";

interface Props { setScreen: (s: Screen) => void; }

interface SceneCard {
  id: string;
  number: number;
  location: string;
  time: string;
  action: string;
  dialogue: string;
  mood: string;
  duration: string;
}

const MOODS = ["Радость", "Напряжение", "Грусть", "Страх", "Юмор", "Романтика", "Экшн", "Спокойствие"];
const TIMES = ["День", "Ночь", "Рассвет", "Закат", "Внутри"];
const FORMATS = [
  { id: "cartoon", label: "Мультфильм", icon: "Tv", desc: "Анимированные персонажи, сцены" },
  { id: "film", label: "Игровой фильм", icon: "Film", desc: "Реалистичные сцены, актёры" },
  { id: "short", label: "Короткий метр", icon: "Clock", desc: "До 15 минут, одна идея" },
  { id: "series", label: "Сериал", icon: "Layers", desc: "Несколько эпизодов" },
];

export function AnimationScreen({ setScreen }: Props) {
  const [step, setStep] = useState<"setup" | "scenes" | "export">("setup");
  const [projectTitle, setProjectTitle] = useState("");
  const [format, setFormat] = useState("cartoon");
  const [logline, setLogline] = useState("");
  const [scenes, setScenes] = useState<SceneCard[]>([
    { id: "1", number: 1, location: "Лес", time: "День", action: "", dialogue: "", mood: "Радость", duration: "0:30" },
  ]);
  const [activeScene, setActiveScene] = useState("1");

  const addScene = () => {
    const id = String(Date.now());
    setScenes(s => [...s, { id, number: s.length + 1, location: "", time: "День", action: "", dialogue: "", mood: "Спокойствие", duration: "0:30" }]);
    setActiveScene(id);
  };

  const updateScene = (id: string, field: keyof SceneCard, value: string) => {
    setScenes(s => s.map(sc => sc.id === id ? { ...sc, [field]: value } : sc));
  };

  const currentScene = scenes.find(s => s.id === activeScene);

  const exportScript = () => {
    let script = `${projectTitle.toUpperCase()}\n${"=".repeat(40)}\n\n`;
    script += `Логлайн: ${logline}\n\n`;
    scenes.forEach(sc => {
      script += `СЦЕНА ${sc.number}. ${sc.location.toUpperCase()} — ${sc.time.toUpperCase()}\n`;
      script += `[Настроение: ${sc.mood} · Длительность: ${sc.duration}]\n\n`;
      if (sc.action) script += `${sc.action}\n\n`;
      if (sc.dialogue) script += `ДИАЛОГ:\n${sc.dialogue}\n\n`;
      script += `${"─".repeat(40)}\n\n`;
    });
    const blob = new Blob([script], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${projectTitle || "scenario"}.txt`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setScreen("home")}
          className="p-2 rounded-xl transition-all"
          style={{ color: "var(--ab-text-secondary)" }}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#f59e0b,#ea580c)" }}>
          <Icon name="Clapperboard" size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--ab-text-primary)" }}>
            {projectTitle || "Новый сценарий"}
          </h1>
          <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>{scenes.length} сцен · {FORMATS.find(f => f.id === format)?.label}</div>
        </div>
        {step === "scenes" && (
          <button onClick={exportScript} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
            <Icon name="Download" size={14} />Скачать сценарий
          </button>
        )}
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {(["setup", "scenes", "export"] as const).map((s, i) => {
          const labels = ["Проект", "Раскадровка", "Экспорт"];
          const active = s === step;
          const done = ["setup", "scenes", "export"].indexOf(s) < ["setup", "scenes", "export"].indexOf(step);
          return (
            <button key={s} onClick={() => step === "export" && setStep(s)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={active
                ? { background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.4)" }
                : done ? { background: "rgba(245,158,11,0.07)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.15)" }
                  : { background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
              {done ? <Icon name="Check" size={13} /> : <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                style={{ background: active ? "#f59e0b" : "var(--ab-border)", color: active ? "#fff" : "var(--ab-text-secondary)" }}>{i + 1}</span>}
              {labels[i]}
            </button>
          );
        })}
      </div>

      {/* STEP 1: Setup */}
      {step === "setup" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Название проекта</label>
              <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)}
                placeholder="«Приключения кота Шрёдингера»…"
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#f59e0b")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ab-text-secondary)" }}>Логлайн (суть в одном предложении)</label>
              <textarea value={logline} onChange={e => setLogline(e.target.value)}
                placeholder="Кот-детектив расследует кражу рыбы в квантовой лаборатории…"
                rows={2} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none"
                style={{ background: "var(--ab-page-bg)", border: "2px solid var(--ab-border)", color: "var(--ab-text-primary)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#f59e0b")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")} />
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-3" style={{ color: "var(--ab-text-secondary)" }}>Формат проекта</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className="rounded-2xl p-5 text-left transition-all flex items-start gap-3"
                  style={format === f.id
                    ? { background: "rgba(245,158,11,0.1)", border: "2px solid rgba(245,158,11,0.5)" }
                    : { background: "var(--ab-card)", border: "2px solid var(--ab-border)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: format === f.id ? "rgba(245,158,11,0.15)" : "var(--ab-page-bg)" }}>
                    <Icon name={f.icon as Parameters<typeof Icon>[0]["name"]} fallback="Film" size={18}
                      style={{ color: format === f.id ? "#f59e0b" : "var(--ab-text-secondary)" } as React.CSSProperties} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "var(--ab-text-primary)" }}>{f.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--ab-text-secondary)" }}>{f.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep("scenes")} disabled={!projectTitle.trim()}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#f59e0b,#ea580c)" }}>
            Создать раскадровку →
          </button>
        </div>
      )}

      {/* STEP 2: Scenes */}
      {step === "scenes" && (
        <div className="grid lg:grid-cols-3 gap-4 animate-fade-in">
          {/* Scene list */}
          <div className="flex flex-col gap-2">
            {scenes.map(sc => (
              <button key={sc.id} onClick={() => setActiveScene(sc.id)}
                className="p-4 rounded-xl text-left transition-all"
                style={activeScene === sc.id
                  ? { background: "rgba(245,158,11,0.12)", border: "2px solid rgba(245,158,11,0.4)" }
                  : { background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>С{sc.number}</span>
                  <span className="text-sm truncate" style={{ color: "var(--ab-text-primary)" }}>
                    {sc.location || "Место…"} · {sc.time}
                  </span>
                </div>
                <div className="text-[11px] mt-1 truncate" style={{ color: "var(--ab-text-secondary)" }}>
                  {sc.mood} · {sc.duration}
                </div>
              </button>
            ))}
            <button onClick={addScene}
              className="py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
              style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "2px dashed var(--ab-border)" }}>
              <Icon name="Plus" size={14} />Добавить сцену
            </button>
          </div>

          {/* Scene editor */}
          {currentScene && (
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}>
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--ab-border)" }}>
                <div className="font-bold text-sm" style={{ color: "#f59e0b" }}>Сцена {currentScene.number}</div>
                <button onClick={() => setScenes(s => s.filter(x => x.id !== currentScene.id))}
                  disabled={scenes.length <= 1}
                  className="opacity-40 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                  style={{ color: "var(--ab-text-secondary)" }}>
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ab-text-secondary)" }}>Место действия</label>
                    <input value={currentScene.location} onChange={e => updateScene(currentScene.id, "location", e.target.value)}
                      placeholder="Лес, квартира, улица…"
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                      style={{ background: "var(--ab-page-bg)", border: "1px solid var(--ab-border)", color: "var(--ab-text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ab-text-secondary)" }}>Время суток</label>
                    <div className="flex gap-1 flex-wrap">
                      {TIMES.map(t => (
                        <button key={t} onClick={() => updateScene(currentScene.id, "time", t)}
                          className="px-2 py-1 rounded text-[11px] transition-all"
                          style={currentScene.time === t
                            ? { background: "rgba(245,158,11,0.15)", color: "#f59e0b" }
                            : { background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ab-text-secondary)" }}>Действие / описание</label>
                  <textarea value={currentScene.action} onChange={e => updateScene(currentScene.id, "action", e.target.value)}
                    placeholder="Что происходит в кадре? Какие движения, события…"
                    rows={3} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
                    style={{ background: "var(--ab-page-bg)", border: "1px solid var(--ab-border)", color: "var(--ab-text-primary)" }} />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ab-text-secondary)" }}>Диалоги</label>
                  <textarea value={currentScene.dialogue} onChange={e => updateScene(currentScene.id, "dialogue", e.target.value)}
                    placeholder="ГГ: Кто ты такой?&#10;НЕЗНАКОМЕЦ: Тот, кого ты так долго ждал…"
                    rows={3} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none font-mono"
                    style={{ background: "var(--ab-page-bg)", border: "1px solid var(--ab-border)", color: "var(--ab-text-primary)" }} />
                </div>

                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1">
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ab-text-secondary)" }}>Настроение</label>
                    <div className="flex flex-wrap gap-1">
                      {MOODS.map(m => (
                        <button key={m} onClick={() => updateScene(currentScene.id, "mood", m)}
                          className="px-2 py-1 rounded text-[11px] transition-all"
                          style={currentScene.mood === m
                            ? { background: "rgba(245,158,11,0.15)", color: "#f59e0b" }
                            : { background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--ab-text-secondary)" }}>Длит.</label>
                    <input value={currentScene.duration} onChange={e => updateScene(currentScene.id, "duration", e.target.value)}
                      className="w-20 px-3 py-2 rounded-lg text-sm text-center focus:outline-none"
                      style={{ background: "var(--ab-page-bg)", border: "1px solid var(--ab-border)", color: "var(--ab-text-primary)" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
