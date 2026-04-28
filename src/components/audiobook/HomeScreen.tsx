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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#eef2ff] via-[#f4f6f9] to-[#eff6ff] px-6 py-24 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-60 bg-indigo-200/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Синтез речи нейросетью
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a2033] leading-tight mb-6">
            Превратите любой текст<br />
            <span className="bg-gradient-to-r from-[#3b82f6] to-[#6366f1] bg-clip-text text-transparent">в аудиокнигу</span>
          </h1>
          <p className="text-[#64748b] text-xl mb-10 max-w-xl mx-auto">
            Загрузите файл или вставьте текст — через минуту получите готовый MP3 с голосом профессионального диктора.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setScreen("editor")}
              className="flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
            >
              <Icon name="Mic" size={20} />
              Создать аудиокнигу
            </button>
            <button
              onClick={onLoadCabinet}
              className="flex items-center justify-center gap-2 bg-white text-[#64748b] hover:text-[#3b82f6] border border-[#e2e8f0] font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <Icon name="FolderOpen" size={20} />
              Мои проекты
            </button>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#1a2033] mb-12">Для кого это приложение?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {USE_CASES.map((u, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[#e5e9f0] hover:border-blue-200 hover:shadow-md transition-all text-center animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                <Icon name={u.icon as Parameters<typeof Icon>[0]["name"]} fallback="Star" size={22} className="text-[#3b82f6]" />
              </div>
              <h3 className="font-semibold text-[#1a2033] mb-2">{u.title}</h3>
              <p className="text-sm text-[#64748b]">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1a2033] mb-12">Как это работает</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: "Upload",            title: "Загрузите файл",   desc: "Поддерживаются PDF, EPUB, DOCX и TXT — или вставьте текст вручную" },
              { step: "2", icon: "SlidersHorizontal", title: "Настройте голос",  desc: "Выберите диктора, скорость и интонацию" },
              { step: "3", icon: "Download",          title: "Скачайте MP3",     desc: "Получите готовый аудиофайл за 30–60 секунд" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                  <Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} fallback="Star" size={24} className="text-white" />
                </div>
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Шаг {s.step}</div>
                <h3 className="font-bold text-lg text-[#1a2033] mb-2">{s.title}</h3>
                <p className="text-[#64748b] text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voices preview */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#1a2033] mb-4">6 профессиональных голосов</h2>
        <p className="text-center text-[#64748b] mb-12">Нейросетевые дикторы Yandex SpeechKit</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {VOICES.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl p-5 border border-[#e5e9f0] flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="text-3xl">{v.emoji}</div>
              <div>
                <div className="font-semibold text-[#1a2033]">{v.name}</div>
                <div className="text-xs text-[#64748b]">{v.gender} · {v.style}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
