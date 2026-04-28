import { useState } from "react";
import Icon from "@/components/ui/icon";

const GENRES = ["Все", "Детские сказки", "Приключения", "Классика", "Фантастика", "Поэзия", "Самиздат"];

const BOOKS = [
  {
    id: 1,
    title: "Колобок",
    author: "Русская народная сказка",
    genre: "Детские сказки",
    duration: "12 мин",
    age: "3+",
    cover: "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/5adeb18c-6d01-4d58-a0b9-7f70ee953953.jpg",
    color: "from-amber-400 to-orange-500",
    rating: 4.9,
  },
  {
    id: 2,
    title: "Маленький принц",
    author: "Антуан де Сент-Экзюпери",
    genre: "Классика",
    duration: "2 ч 40 мин",
    age: "8+",
    cover: "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/8209df6c-1446-45d3-82d0-136bdaa4a0f4.jpg",
    color: "from-indigo-400 to-violet-600",
    rating: 5.0,
  },
  {
    id: 3,
    title: "Три медведя",
    author: "Лев Толстой",
    genre: "Детские сказки",
    duration: "18 мин",
    age: "3+",
    cover: "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/5adeb18c-6d01-4d58-a0b9-7f70ee953953.jpg",
    color: "from-emerald-400 to-teal-600",
    rating: 4.8,
  },
  {
    id: 4,
    title: "Мастер и Маргарита",
    author: "Михаил Булгаков",
    genre: "Классика",
    duration: "14 ч 20 мин",
    age: "16+",
    cover: "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/8209df6c-1446-45d3-82d0-136bdaa4a0f4.jpg",
    color: "from-rose-500 to-red-700",
    rating: 4.9,
  },
  {
    id: 5,
    title: "Приключения Буратино",
    author: "Алексей Толстой",
    genre: "Приключения",
    duration: "3 ч 15 мин",
    age: "5+",
    cover: "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/5adeb18c-6d01-4d58-a0b9-7f70ee953953.jpg",
    color: "from-yellow-400 to-amber-600",
    rating: 4.7,
  },
  {
    id: 6,
    title: "Моя первая сказка",
    author: "Анна Петрова",
    genre: "Самиздат",
    duration: "25 мин",
    age: "4+",
    cover: "https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/91881a82-f1ec-47c3-a4e6-9b872669e27c.jpg",
    color: "from-pink-400 to-fuchsia-600",
    rating: 4.6,
  },
];

const STATS = [
  { value: "1 200+", label: "Аудиокниг" },
  { value: "340+", label: "Авторов" },
  { value: "58 000", label: "Слушателей" },
  { value: "12", label: "Жанров" },
];

export default function Index() {
  const [activeGenre, setActiveGenre] = useState("Все");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"library" | "studio">("library");

  const filtered = activeGenre === "Все" ? BOOKS : BOOKS.filter((b) => b.genre === activeGenre);

  return (
    <div className="min-h-screen bg-[#0d0a06] text-[#f0e8d8] font-golos overflow-x-hidden">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: "linear-gradient(to bottom, rgba(13,10,6,0.97) 0%, transparent 100%)" }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <span className="font-bold text-xl tracking-tight text-[#f0e8d8]">СказкоФон</span>
        </div>
        <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/10">
          {["library", "studio"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "library" | "studio")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-[#c8913a] text-[#0d0a06]"
                  : "text-[#a89878] hover:text-[#f0e8d8]"
              }`}
            >
              {tab === "library" ? "Библиотека" : "Студия"}
            </button>
          ))}
        </nav>
        <button className="bg-[#c8913a] hover:bg-[#e0a846] text-[#0d0a06] font-semibold px-5 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105">
          Войти
        </button>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#c8913a]/10 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-amber-800/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-[#c8913a]/15 border border-[#c8913a]/30 rounded-full px-4 py-1.5 text-sm text-[#c8913a] mb-6">
                <span className="w-2 h-2 rounded-full bg-[#c8913a] animate-pulse" />
                Для детей и взрослых
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-[#f0e8d8] mb-6">
                Сказки и книги
                <br />
                <span style={{
                  background: "linear-gradient(135deg, #c8913a, #f0c060)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}>голосом и сердцем</span>
              </h1>
              <p className="text-[#a89878] text-lg leading-relaxed mb-8 max-w-lg">
                Тысячи аудиокниг для детей и взрослых. Слушайте любимые сказки,
                создавайте собственные произведения и озвучивайте истории своим голосом.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 bg-[#c8913a] hover:bg-[#e0a846] text-[#0d0a06] font-bold px-7 py-3.5 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(200,145,58,0.4)]">
                  <Icon name="Play" size={18} />
                  Слушать сейчас
                </button>
                <button className="flex items-center gap-2 border border-white/20 hover:border-[#c8913a]/50 text-[#f0e8d8] px-7 py-3.5 rounded-full transition-all duration-200 hover:bg-white/5">
                  <Icon name="Mic" size={18} />
                  Создать книгу
                </button>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative flex-shrink-0 animate-fade-in stagger-3">
              <div className="w-72 h-72 rounded-3xl overflow-hidden shadow-2xl shadow-amber-900/30 border border-white/10">
                <img
                  src="https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/5adeb18c-6d01-4d58-a0b9-7f70ee953953.jpg"
                  alt="Детская аудиокнига"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-6 bg-[#1a1408] border border-[#c8913a]/30 rounded-2xl px-4 py-3 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg">🎧</div>
                  <div>
                    <div className="text-xs text-[#a89878]">Сейчас слушают</div>
                    <div className="text-sm font-semibold text-[#f0e8d8]">1 247 человек</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 animate-fade-in stagger-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl p-5 text-center hover:border-[#c8913a]/30 transition-colors">
                <div className="text-3xl font-bold text-[#c8913a] mb-1">{s.value}</div>
                <div className="text-sm text-[#a89878]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Library */}
      {activeTab === "library" && (
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#f0e8d8]">Каталог книг</h2>
              <button className="text-sm text-[#c8913a] hover:text-[#e0a846] flex items-center gap-1 transition-colors">
                Все книги <Icon name="ChevronRight" size={16} />
              </button>
            </div>

            {/* Genre filter */}
            <div className="flex gap-2 flex-wrap mb-8">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeGenre === g
                      ? "bg-[#c8913a] text-[#0d0a06]"
                      : "bg-white/5 border border-white/10 text-[#a89878] hover:text-[#f0e8d8] hover:border-white/20"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Books grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((book, i) => (
                <div
                  key={book.id}
                  className="group bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-[#c8913a]/40 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(200,145,58,0.15)] cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/50 backdrop-blur-sm text-[#f0e8d8] text-xs px-2 py-1 rounded-full border border-white/10">
                        {book.age}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPlayingId(playingId === book.id ? null : book.id); }}
                      className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        playingId === book.id
                          ? "bg-[#c8913a] text-[#0d0a06]"
                          : "bg-black/60 text-white hover:bg-[#c8913a] hover:text-[#0d0a06]"
                      } backdrop-blur-sm border border-white/20`}
                    >
                      <Icon name={playingId === book.id ? "Pause" : "Play"} size={16} />
                    </button>
                    {playingId === book.id && (
                      <div className="absolute bottom-3 left-3 flex items-end gap-0.5 h-5">
                        {[1,2,3,4].map((n) => (
                          <div key={n} className={`w-1 bg-[#c8913a] rounded-full wave-bar`}
                            style={{ height: `${50 + n * 12}%`, animationDelay: `${n * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#f0e8d8] mb-1 truncate">{book.title}</h3>
                    <p className="text-xs text-[#a89878] mb-3 truncate">{book.author}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-[#a89878]">
                        <Icon name="Clock" size={12} />
                        {book.duration}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-400">
                        ★ {book.rating}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Studio */}
      {activeTab === "studio" && (
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-[#f0e8d8] mb-4">
                  Студия записи
                </h2>
                <p className="text-[#a89878] leading-relaxed mb-6">
                  Создайте свою аудиокнигу: загрузите текст, выберите голос или запишите сами.
                  Озвучьте любимую сказку для своего ребёнка — это займёт не больше часа.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: "FileText", text: "Загрузите текст или введите вручную" },
                    { icon: "Mic", text: "Запишите голос или выберите ИИ-диктора" },
                    { icon: "Music", text: "Добавьте фоновую музыку и звуки" },
                    { icon: "Share2", text: "Опубликуйте в библиотеке или скачайте" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3 hover:border-[#c8913a]/30 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-[#c8913a]/20 flex items-center justify-center text-[#c8913a] flex-shrink-0">
                        <Icon name={step.icon} fallback="Star" size={16} />
                      </div>
                      <span className="text-sm text-[#d4c4a8]">{step.text}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-8 flex items-center gap-2 bg-[#c8913a] hover:bg-[#e0a846] text-[#0d0a06] font-bold px-8 py-4 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(200,145,58,0.4)]">
                  <Icon name="Mic" size={18} />
                  Начать запись
                </button>
              </div>
              <div className="relative animate-fade-in stagger-3">
                <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-amber-900/20">
                  <img
                    src="https://cdn.poehali.dev/projects/84e163f9-9661-409a-9ae9-a67ebf795811/files/91881a82-f1ec-47c3-a4e6-9b872669e27c.jpg"
                    alt="Студия записи"
                    className="w-full h-72 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Popular creators */}
            <div>
              <h3 className="text-xl font-bold text-[#f0e8d8] mb-6">Популярные авторы самиздата</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Анна Петрова", books: 12, emoji: "👩‍🎤" },
                  { name: "Иван Смирнов", books: 8, emoji: "👨‍🎨" },
                  { name: "Мария Козлова", books: 21, emoji: "👩‍💼" },
                  { name: "Алексей Новиков", books: 5, emoji: "🧑‍🎭" },
                ].map((author) => (
                  <div key={author.name} className="bg-white/3 border border-white/8 rounded-2xl p-4 text-center hover:border-[#c8913a]/30 transition-all duration-200 cursor-pointer group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-700/40 to-orange-800/40 border border-[#c8913a]/20 flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform">
                      {author.emoji}
                    </div>
                    <div className="font-medium text-sm text-[#f0e8d8] mb-1">{author.name}</div>
                    <div className="text-xs text-[#a89878]">{author.books} книг</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-[#c8913a]/20 p-8 md:p-12 text-center"
            style={{ background: "linear-gradient(135deg, rgba(200,145,58,0.12) 0%, rgba(13,10,6,0.8) 50%, rgba(200,100,30,0.08) 100%)" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#c8913a]/10 rounded-full blur-[60px]" />
            </div>
            <div className="relative">
              <div className="text-4xl mb-4">🌙</div>
              <h2 className="text-3xl font-bold text-[#f0e8d8] mb-3">Сказка на ночь — каждый вечер</h2>
              <p className="text-[#a89878] mb-8 max-w-md mx-auto">
                Подпишитесь и получите доступ ко всем аудиокнигам. Первые 7 дней бесплатно.
              </p>
              <button className="bg-[#c8913a] hover:bg-[#e0a846] text-[#0d0a06] font-bold px-10 py-4 rounded-full text-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(200,145,58,0.5)]">
                Попробовать бесплатно
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <span className="font-bold text-[#f0e8d8]">СказкоФон</span>
          </div>
          <div className="text-sm text-[#a89878]">Для тех, кто любит слушать и творить</div>
          <div className="flex gap-4 text-sm text-[#a89878]">
            <button className="hover:text-[#c8913a] transition-colors">О нас</button>
            <button className="hover:text-[#c8913a] transition-colors">Контакты</button>
            <button className="hover:text-[#c8913a] transition-colors">Помощь</button>
          </div>
        </div>
      </footer>

      {/* Mobile tab nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0a06]/95 backdrop-blur-xl border-t border-white/10 flex">
        {["library", "studio"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "library" | "studio")}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeTab === tab ? "text-[#c8913a]" : "text-[#a89878]"
            }`}
          >
            <Icon name={tab === "library" ? "BookOpen" : "Mic"} size={20} />
            {tab === "library" ? "Библиотека" : "Студия"}
          </button>
        ))}
      </div>
    </div>
  );
}