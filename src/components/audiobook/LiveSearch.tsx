import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

interface OLDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  subject?: string[];
  cover_i?: number;
  ia?: string[];
  has_fulltext?: boolean;
}

interface LiveSearchProps {
  onSelectBook: (text: string, title: string) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function LiveSearch({ onSelectBook }: LiveSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OLDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 500);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError("");
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&lang=rus&limit=12&fields=key,title,author_name,first_publish_year,subject,cover_i,ia,has_fulltext`;
      const res = await fetch(url, { signal: abortRef.current.signal });
      const data = await res.json();
      setResults(data.docs || []);
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") setError("Не удалось загрузить результаты");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const fetchAndUse = async (doc: OLDoc) => {
    setFetching(doc.key);
    try {
      const workKey = doc.key.replace("/works/", "");
      const res = await fetch(`https://openlibrary.org/works/${workKey}.json`);
      const data = await res.json();

      let text = "";
      if (data.description) {
        text = typeof data.description === "string" ? data.description : data.description.value || "";
      }
      if (!text) {
        text = `«${doc.title}»\n${doc.author_name?.join(", ") || ""}\n${doc.first_publish_year ? "Год: " + doc.first_publish_year : ""}\n\nАннотация недоступна. Вставьте текст книги вручную в редакторе.`;
      }

      onSelectBook(text, doc.title);
    } catch {
      const fallback = `«${doc.title}»\nАвтор: ${doc.author_name?.join(", ") || "неизвестен"}\nГод: ${doc.first_publish_year || "—"}\n\nВставьте текст книги в редакторе.`;
      onSelectBook(fallback, doc.title);
    } finally {
      setFetching(null);
    }
  };

  const coverUrl = (coverId?: number) =>
    coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;

  return (
    <section
      className="px-6 py-20 transition-colors duration-300"
      style={{ background: "var(--ab-card)" }}
      aria-labelledby="live-search-heading"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 id="live-search-heading" className="text-3xl font-bold mb-3" style={{ color: "var(--ab-text-primary)" }}>
            Поиск по миллионам книг
          </h2>
          <p className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>
            Живой поиск по базе Open Library — более 20 миллионов произведений
          </p>
        </div>

        <div className="relative mb-8">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Введите название книги или автора…"
            className="w-full pl-12 pr-12 py-4 rounded-2xl text-base font-ibm focus:outline-none transition-all shadow-sm"
            style={{
              background: "var(--ab-page-bg)",
              border: "2px solid var(--ab-border)",
              color: "var(--ab-text-primary)",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "#3b82f6")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")}
            aria-label="Поиск книг в Open Library"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: "var(--ab-text-secondary)" }}
              aria-label="Очистить поиск"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-12" aria-live="polite">
            <Icon name="Loader2" size={22} className="animate-spin text-blue-400" />
            <span className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>Ищем книги…</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-400 text-sm">{error}</div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(doc => {
              const cover = coverUrl(doc.cover_i);
              const isFetching = fetching === doc.key;
              return (
                <div
                  key={doc.key}
                  className="rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-md"
                  style={{ background: "var(--ab-page-bg)", border: "1px solid var(--ab-border)" }}
                >
                  {cover && (
                    <div className="h-32 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <img
                        src={cover}
                        alt={`Обложка — ${doc.title}`}
                        className="h-full w-full object-cover"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                  {!cover && (
                    <div className="h-20 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.08))" }}>
                      <Icon name="BookOpen" size={28} className="text-blue-300" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="font-bold text-sm leading-snug" style={{ color: "var(--ab-text-primary)" }}>
                      {doc.title}
                    </div>
                    {doc.author_name && (
                      <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>
                        {doc.author_name.slice(0, 2).join(", ")}
                        {doc.first_publish_year ? ` · ${doc.first_publish_year}` : ""}
                      </div>
                    )}
                    {doc.has_fulltext && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full w-fit font-medium"
                        style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Полный текст
                      </span>
                    )}
                    <button
                      onClick={() => fetchAndUse(doc)}
                      disabled={!!fetching}
                      className="mt-auto flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                      style={{ background: "var(--ab-accent)" }}
                      aria-label={`Озвучить книгу ${doc.title}`}
                    >
                      {isFetching
                        ? <><Icon name="Loader2" size={12} className="animate-spin" />Загружаю…</>
                        : <><Icon name="Mic" size={12} />Озвучить</>
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="text-center py-12">
            <Icon name="BookX" fallback="BookOpen" size={40} className="mx-auto mb-3 opacity-30" style={{ color: "var(--ab-text-secondary)" } as React.CSSProperties} />
            <div className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>Книги не найдены — попробуйте другой запрос</div>
          </div>
        )}

        {!query && (
          <div className="flex flex-wrap gap-2 justify-center">
            {["Достоевский", "Толстой", "Булгаков", "Чехов", "Пушкин", "Тургенев"].map(hint => (
              <button
                key={hint}
                onClick={() => setQuery(hint)}
                className="px-4 py-2 rounded-full text-sm transition-all hover:shadow-sm"
                style={{ background: "var(--ab-page-bg)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}
              >
                {hint}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
