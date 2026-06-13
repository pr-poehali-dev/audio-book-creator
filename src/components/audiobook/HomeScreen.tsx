import Icon from "@/components/ui/icon";
import { Screen, CREATIVE_MODULES } from "@/components/audiobook/audiobook-data";
import { ClassicsSection } from "@/components/audiobook/ClassicsSection";
import { LiveSearch } from "@/components/audiobook/LiveSearch";
import { WikisourceSearch } from "@/components/audiobook/WikisourceSearch";

interface HomeScreenProps {
  setScreen: (s: Screen) => void;
  onLoadCabinet: () => void;
  onSelectBook: (text: string, title: string) => void;
}

export function HomeScreen({ setScreen, onLoadCabinet, onSelectBook }: HomeScreenProps) {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-6 py-24 text-center"
        style={{ background: "linear-gradient(135deg, var(--ab-hero-from), var(--ab-hero-via), var(--ab-hero-to))" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-56 rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }} />
          <div className="absolute top-1/2 left-10 w-48 h-48 rounded-full blur-2xl opacity-20"
            style={{ background: "radial-gradient(circle, #10b981, transparent 70%)" }} />
        </div>
        <div className="relative max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-8"
            style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.25)" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#6366f1" }} />
            5 творческих инструментов в одном месте
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ color: "var(--ab-text-primary)" }}>
            Твоя творческая<br />
            <span className="bg-gradient-to-r from-[#6366f1] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent">
              мастерская
            </span>
          </h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: "var(--ab-text-secondary)" }}>
            Аудиокниги, романы, сценарии, подкасты, стихи — создавай с удобными инструментами
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setScreen("editor")}
              className="flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
            >
              <Icon name="Headphones" size={20} />
              Создать аудиокнигу
            </button>
            <button
              onClick={onLoadCabinet}
              className="flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-sm"
              style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}
            >
              <Icon name="FolderOpen" size={20} />
              Мои проекты
            </button>
          </div>
        </div>
      </section>

      {/* ── 5 модулей ────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--ab-text-primary)" }}>
            Выбери свой проект
          </h2>
          <p className="text-base" style={{ color: "var(--ab-text-secondary)" }}>
            Каждый инструмент заточен под конкретную творческую задачу
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CREATIVE_MODULES.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setScreen(m.id)}
              className="rounded-2xl p-6 text-left transition-all hover:shadow-xl hover:-translate-y-1 group animate-fade-in"
              style={{
                background: "var(--ab-card)",
                border: "1px solid var(--ab-border)",
                animationDelay: `${i * 0.07}s`,
                opacity: 0,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${m.color}cc, ${m.color})` }}
                >
                  <Icon
                    name={m.icon as Parameters<typeof Icon>[0]["name"]}
                    fallback="Star"
                    size={26}
                    className="text-white"
                  />
                </div>
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full mt-1"
                  style={{ background: `${m.color}15`, color: m.color }}
                >
                  {m.tagline}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "var(--ab-text-primary)" }}>
                {m.label}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--ab-text-secondary)" }}>
                {m.desc}
              </p>
              <div
                className="mt-4 flex items-center gap-1.5 text-xs font-semibold transition-all group-hover:gap-2.5"
                style={{ color: m.color }}
              >
                Начать <Icon name="ArrowRight" size={13} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Каталог классики ─────────────────────────────────────────────────── */}
      <ClassicsSection onSelectBook={(text, title) => { onSelectBook(text, title); setScreen("editor"); }} />

      {/* ── Викитека ─────────────────────────────────────────────────────────── */}
      <WikisourceSearch onSelectBook={(text, title) => { onSelectBook(text, title); setScreen("editor"); }} />

      {/* ── Open Library ─────────────────────────────────────────────────────── */}
      <LiveSearch onSelectBook={(text, title) => { onSelectBook(text, title); setScreen("editor"); }} />

      {/* ── Как это работает ─────────────────────────────────────────────────── */}
      <section
        className="px-6 py-20 transition-colors duration-300"
        style={{ background: "var(--ab-card)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--ab-text-primary)" }}>
            Аудиокнига за 3 шага
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: "Upload",            title: "Загрузите файл",   desc: "PDF, EPUB, DOCX, TXT — или вставьте текст вручную" },
              { step: "2", icon: "SlidersHorizontal", title: "Выберите голос",   desc: "6 нейросетевых дикторов Yandex SpeechKit" },
              { step: "3", icon: "Download",          title: "Скачайте MP3",     desc: "Готовый аудиофайл через 30–60 секунд" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} fallback="Star" size={24} className="text-white" />
                </div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Шаг {s.step}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "var(--ab-text-primary)" }}>{s.title}</h3>
                <p className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
