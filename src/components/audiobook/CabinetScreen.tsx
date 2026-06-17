import Icon from "@/components/ui/icon";
import { Screen, Project } from "@/components/audiobook/audiobook-data";

interface CabinetScreenProps {
  projects: Project[];
  loadingCabinet: boolean;
  setScreen: (s: Screen) => void;
  onDeleteProject: (id: string) => void;
  onNewBook: () => void;
}

export function CabinetScreen({
  projects, loadingCabinet, setScreen, onDeleteProject, onNewBook,
}: CabinetScreenProps) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8" aria-label="Мои аудиокниги">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setScreen("home")}
          className="transition-colors"
          style={{ color: "var(--ab-text-secondary)" }}
          aria-label="Вернуться на главную"
        >
          <Icon name="ArrowLeft" size={20} aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: "var(--ab-text-primary)" }}>Мои аудиокниги</h1>
      </div>

      {loadingCabinet ? (
        <div className="text-center py-20" style={{ color: "var(--ab-text-muted)" }} role="status" aria-live="polite" aria-label="Загружаю проекты">
          <Icon name="Loader2" size={32} className="mx-auto mb-4 animate-spin" aria-hidden="true" />
          Загружаю проекты...
        </div>
      ) : projects.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}
          role="status"
        >
          <div className="text-5xl mb-4" aria-hidden="true">📚</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--ab-text-primary)" }}>Пока нет аудиокниг</h2>
          <p className="mb-6" style={{ color: "var(--ab-text-secondary)" }}>Создайте первую — это займёт меньше минуты</p>
          <button
            onClick={onNewBook}
            className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl transition-all hover:shadow-md"
            style={{ background: "var(--ab-accent)" }}
            aria-label="Создать первую аудиокнигу"
          >
            <Icon name="Plus" size={16} aria-hidden="true" />
            Создать первую книгу
          </button>
        </div>
      ) : (
        <ul className="space-y-3" aria-label={`Список аудиокниг, всего ${projects.length}`}>
          {projects.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl p-5 flex items-center gap-4 transition-all"
              style={{ background: "var(--ab-card)", border: "1px solid var(--ab-border)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.08)" }}
                aria-hidden="true"
              >
                <Icon name="BookOpen" size={20} className="text-[#3b82f6]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {p.is_example && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                      style={{ background: "#3b82f6", color: "#fff" }}>
                      <Icon name="Sparkles" fallback="Star" size={10} aria-hidden="true" />ПРИМЕР
                    </span>
                  )}
                  <div className="font-semibold truncate" style={{ color: "var(--ab-text-primary)" }}>{p.title}</div>
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ab-text-muted)" }}>
                  {p.is_example ? (
                    "Образец — послушайте, как звучит озвучка"
                  ) : (
                    <time dateTime={p.created_at}>
                      {new Date(p.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                    </time>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.audio_url && (
                  <a
                    href={p.audio_url}
                    download={`${p.title}.mp3`}
                    className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg transition-all"
                    style={{ color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)" }}
                    aria-label={`Скачать "${p.title}" в формате MP3`}
                  >
                    <Icon name="Download" size={14} aria-hidden="true" />
                    MP3
                  </a>
                )}
                {!p.is_example && (
                  <button
                    onClick={() => onDeleteProject(p.id)}
                    className="p-2 rounded-lg transition-all hover:bg-red-50"
                    style={{ color: "var(--ab-text-muted)" }}
                    aria-label={`Удалить аудиокнигу "${p.title}"`}
                  >
                    <Icon name="Trash2" size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}