import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

interface WikiPage {
  pageid: number;
  title: string;
  snippet: string;
  wordcount?: number;
}

interface WikisourceSearchProps {
  onSelectBook: (text: string, title: string) => void;
}

const WIKISOURCE_API = "https://ru.wikisource.org/w/api.php";

const POPULAR = [
  "Пушкин", "Толстой Лев", "Чехов", "Достоевский",
  "Тургенев", "Гоголь", "Бунин", "Лермонтов",
];

function useDebounce<T>(value: T, delay: number): T {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function stripWikitext(wikitext: string): string {
  return wikitext
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1")
    .replace(/={2,}([^=]+)={2,}/g, "\n\n$1\n")
    .replace(/'{2,3}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function WikisourceSearch({ onSelectBook }: WikisourceSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ id: number; text: string } | null>(null);

  const debouncedQuery = useDebounce(query, 500);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setError(""); return; }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError("");
    setPreview(null);
    try {
      const params = new URLSearchParams({
        action: "query",
        list: "search",
        srsearch: q,
        srnamespace: "0",
        srlimit: "12",
        srprop: "snippet|wordcount",
        format: "json",
        origin: "*",
      });
      const res = await fetch(`${WIKISOURCE_API}?${params}`, {
        signal: abortRef.current.signal,
      });
      const data = await res.json();
      setResults(data.query?.search || []);
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") setError("Не удалось выполнить поиск");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const fetchFullText = async (page: WikiPage) => {
    setFetching(page.pageid);
    setPreview(null);
    try {
      const params = new URLSearchParams({
        action: "query",
        pageids: String(page.pageid),
        prop: "revisions",
        rvprop: "content",
        rvslots: "main",
        format: "json",
        origin: "*",
      });
      const res = await fetch(`${WIKISOURCE_API}?${params}`);
      const data = await res.json();
      const pages = data.query?.pages || {};
      const pageData = pages[String(page.pageid)];
      const rawContent: string =
        pageData?.revisions?.[0]?.slots?.main?.["*"] ||
        pageData?.revisions?.[0]?.["*"] ||
        "";

      const cleaned = stripWikitext(rawContent);
      if (!cleaned || cleaned.length < 50) {
        setError(`Текст «${page.title}» недоступен — возможно это оглавление`);
        return;
      }
      setPreview({ id: page.pageid, text: cleaned.slice(0, 300) });
      onSelectBook(cleaned.slice(0, 5000), page.title);
    } catch {
      setError("Не удалось загрузить текст страницы");
    } finally {
      setFetching(null);
    }
  };

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto" aria-labelledby="wikisource-heading">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Полные тексты · Бесплатно
          </div>
          <h2 id="wikisource-heading" className="text-3xl font-bold" style={{ color: "var(--ab-text-primary)" }}>
            Викитека
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--ab-text-secondary)" }}>
            Тысячи русских произведений с полными текстами — нажмите «Озвучить» и читай вслух
          </p>
        </div>
        <a
          href="https://ru.wikisource.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs shrink-0 transition-colors"
          style={{ color: "var(--ab-text-secondary)" }}
        >
          <Icon name="ExternalLink" size={13} />
          ru.wikisource.org
        </a>
      </div>

      {/* Search input */}
      <div className="relative mb-6">
        <Icon name="BookOpen" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Введите автора или название произведения…"
          className="w-full pl-12 pr-12 py-4 rounded-2xl text-base font-ibm focus:outline-none transition-all shadow-sm"
          style={{
            background: "var(--ab-card)",
            border: "2px solid var(--ab-border)",
            color: "var(--ab-text-primary)",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "#10b981")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--ab-border)")}
          aria-label="Поиск по Викитеке"
        />
        {loading && (
          <Icon name="Loader2" size={18} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-400" />
        )}
        {!loading && query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setPreview(null); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "var(--ab-text-secondary)" }}
          >
            <Icon name="X" size={16} />
          </button>
        )}
      </div>

      {/* Quick hints */}
      {!query && (
        <div className="flex flex-wrap gap-2 mb-8">
          {POPULAR.map(hint => (
            <button
              key={hint}
              onClick={() => setQuery(hint)}
              className="px-4 py-2 rounded-full text-sm transition-all hover:shadow-sm"
              style={{
                background: "var(--ab-card)",
                color: "var(--ab-text-secondary)",
                border: "1px solid var(--ab-border)",
              }}
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
          <Icon name="AlertCircle" size={15} />
          {error}
        </div>
      )}

      {/* Preview banner */}
      {preview && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--ab-text-secondary)" }}>
          <div className="flex items-center gap-2 mb-1 font-semibold" style={{ color: "#10b981" }}>
            <Icon name="Check" size={14} /> Текст загружен — открываю редактор…
          </div>
          <div className="text-xs italic line-clamp-2">{preview.text}…</div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {results.map(page => {
            const isFetching = fetching === page.pageid;
            return (
              <div
                key={page.pageid}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-md"
                style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ background: "rgba(16,185,129,0.1)" }}>
                    <Icon name="FileText" size={18} className="text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm leading-snug mb-1" style={{ color: "var(--ab-text-primary)" }}>
                      {page.title}
                    </div>
                    {page.wordcount && (
                      <div className="text-[11px]" style={{ color: "var(--ab-text-secondary)" }}>
                        ~{page.wordcount.toLocaleString("ru")} слов
                      </div>
                    )}
                  </div>
                </div>

                {page.snippet && (
                  <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--ab-text-secondary)" }}>
                    {stripHtml(page.snippet)}…
                  </p>
                )}

                <div className="flex gap-2 mt-auto">
                  <a
                    href={`https://ru.wikisource.org/wiki/${encodeURIComponent(page.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-all hover:opacity-80"
                    style={{ background: "var(--ab-hero-from)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}
                  >
                    <Icon name="ExternalLink" size={12} />
                    Открыть
                  </a>
                  <button
                    onClick={() => fetchFullText(page)}
                    disabled={fetching !== null}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: "#10b981" }}
                    aria-label={`Озвучить ${page.title}`}
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
          <Icon name="BookX" fallback="BookOpen" size={40} className="mx-auto mb-3 opacity-20" style={{ color: "var(--ab-text-secondary)" } as React.CSSProperties} />
          <div className="text-sm" style={{ color: "var(--ab-text-secondary)" }}>Ничего не найдено — попробуйте другой запрос</div>
        </div>
      )}
    </section>
  );
}
