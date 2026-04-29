import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CLASSICS, ClassicBook } from "@/components/audiobook/audiobook-data";

interface ClassicsSectionProps {
  onSelectBook: (text: string, title: string) => void;
}

const GENRES = ["Все", "Роман", "Пьеса", "Роман в стихах", "Поэма", "Рассказы"];

export function ClassicsSection({ onSelectBook }: ClassicsSectionProps) {
  const [genre, setGenre] = useState("Все");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = genre === "Все" ? CLASSICS : CLASSICS.filter(b => b.genre === genre);
  const visible = showAll ? filtered : filtered.slice(0, 6);

  const handleSelect = (book: ClassicBook) => {
    onSelectBook(book.excerpt, book.title);
  };

  return (
    <section className="px-6 py-20 max-w-6xl mx-auto" aria-labelledby="classics-heading">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 id="classics-heading" className="text-3xl font-bold mb-2" style={{ color: "var(--ab-text-primary)" }}>
            Каталог классики
          </h2>
          <p className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>
            15 произведений — нажмите «Озвучить» и получите аудиокнигу за минуту
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => { setGenre(g); setShowAll(false); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={genre === g
                ? { background: "var(--ab-accent)", color: "#fff" }
                : { background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }
              }
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((book) => (
          <div
            key={book.id}
            className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-md cursor-pointer"
            style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}
            onClick={() => setExpanded(expanded === book.id ? null : book.id)}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                {book.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm leading-tight mb-0.5 truncate" style={{ color: "var(--ab-text-primary)" }}>
                  {book.title}
                </div>
                <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>
                  {book.author} · {book.year}
                </div>
                <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                  {book.genre}
                </span>
              </div>
            </div>

            {expanded === book.id && (
              <div className="text-xs leading-relaxed italic border-l-2 pl-3 border-blue-200"
                style={{ color: "var(--ab-text-secondary)" }}>
                «{book.excerpt}»
              </div>
            )}

            <div className="flex gap-2 mt-auto">
              <button
                onClick={e => { e.stopPropagation(); setExpanded(expanded === book.id ? null : book.id); }}
                className="flex-1 text-xs py-2 rounded-lg transition-all font-medium"
                style={{ background: "var(--ab-hero-from)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}
              >
                {expanded === book.id ? "Скрыть" : "Отрывок"}
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleSelect(book); }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--ab-accent)" }}
              >
                <Icon name="Mic" size={12} />
                Озвучить
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > 6 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(v => !v)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-sm"
            style={{ background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}
          >
            <Icon name={showAll ? "ChevronUp" : "ChevronDown"} size={16} />
            {showAll ? "Свернуть" : `Показать ещё ${filtered.length - 6}`}
          </button>
        </div>
      )}
    </section>
  );
}
