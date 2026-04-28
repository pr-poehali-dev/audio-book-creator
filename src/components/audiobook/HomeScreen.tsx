import Icon from "@/components/ui/icon";
import { Screen, VOICES, USE_CASES } from "@/components/audiobook/audiobook-data";

interface HomeScreenProps {
  setScreen: (s: Screen) => void;
  onLoadCabinet: () => void;
}

export function HomeScreen({ setScreen, onLoadCabinet }: HomeScreenProps) {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 py-24 text-center"
        style={{ background: "linear-gradient(135deg, var(--ab-hero-from), var(--ab-hero-via), var(--ab-hero-to))" }}
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-60 bg-indigo-200/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
            Синтез речи нейросетью
          </div>
          <h1 id="hero-heading" className="text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ color: "var(--ab-text-primary)" }}>
            Превратите любой текст<br />
            <span className="bg-gradient-to-r from-[#3b82f6] to-[#6366f1] bg-clip-text text-transparent">в аудиокнигу</span>
          </h1>
          <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: "var(--ab-text-secondary)" }}>
            Загрузите файл или вставьте текст — через минуту получите готовый MP3 с голосом профессионального диктора.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setScreen("editor")}
              className="flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
              style={{ background: "var(--ab-accent)" }}
              aria-label="Создать новую аудиокнигу"
            >
              <Icon name="Mic" size={20} aria-hidden="true" />
              Создать аудиокнигу
            </button>
            <button
              onClick={onLoadCabinet}
              className="flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-sm"
              style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}
              aria-label="Открыть мои проекты"
            >
              <Icon name="FolderOpen" size={20} aria-hidden="true" />
              Мои проекты
            </button>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-20 max-w-5xl mx-auto" aria-labelledby="use-cases-heading">
        <h2 id="use-cases-heading" className="text-3xl font-bold text-center mb-12" style={{ color: "var(--ab-text-primary)" }}>
          Для кого это приложение?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list">
          {USE_CASES.map((u, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 hover:shadow-md transition-all text-center animate-fade-in"
              style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)", animationDelay: `${i * 0.08}s` }}
              role="listitem"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <Icon name={u.icon as Parameters<typeof Icon>[0]["name"]} fallback="Star" size={22} className="text-[#3b82f6]" />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--ab-text-primary)" }}>{u.title}</h3>
              <p className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        className="px-6 py-20 transition-colors duration-300"
        style={{ background: "var(--ab-card)" }}
        aria-labelledby="how-it-works-heading"
      >
        <div className="max-w-4xl mx-auto">
          <h2 id="how-it-works-heading" className="text-3xl font-bold text-center mb-12" style={{ color: "var(--ab-text-primary)" }}>
            Как это работает
          </h2>
          <div className="grid md:grid-cols-3 gap-8" role="list">
            {[
              { step: "1", icon: "Upload",            title: "Загрузите файл",   desc: "Поддерживаются PDF, EPUB, DOCX и TXT — или вставьте текст вручную" },
              { step: "2", icon: "SlidersHorizontal", title: "Настройте голос",  desc: "Выберите диктора, скорость и интонацию" },
              { step: "3", icon: "Download",          title: "Скачайте MP3",     desc: "Получите готовый аудиофайл за 30–60 секунд" },
            ].map((s) => (
              <div key={s.step} className="text-center" role="listitem">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200" aria-hidden="true">
                  <Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} fallback="Star" size={24} className="text-white" />
                </div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2" aria-hidden="true">Шаг {s.step}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "var(--ab-text-primary)" }}>{s.title}</h3>
                <p className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voices preview */}
      <section className="px-6 py-20 max-w-5xl mx-auto" aria-labelledby="voices-heading">
        <h2 id="voices-heading" className="text-3xl font-bold text-center mb-4" style={{ color: "var(--ab-text-primary)" }}>
          6 профессиональных голосов
        </h2>
        <p className="text-center mb-12" style={{ color: "var(--ab-text-secondary)" }}>Нейросетевые дикторы Yandex SpeechKit</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" role="list">
          {VOICES.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-all"
              style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}
              role="listitem"
              aria-label={`Голос ${v.name}, ${v.gender}, стиль: ${v.style}`}
            >
              <div className="text-3xl" aria-hidden="true">{v.emoji}</div>
              <div>
                <div className="font-semibold" style={{ color: "var(--ab-text-primary)" }}>{v.name}</div>
                <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>{v.gender} · {v.style}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
