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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setScreen("home")} className="text-[#64748b] hover:text-[#3b82f6] transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#1a2033]">Мои аудиокниги</h1>
      </div>

      {loadingCabinet ? (
        <div className="text-center py-20 text-[#94a3b8]">
          <Icon name="Loader2" size={32} className="mx-auto mb-4 animate-spin" />
          Загружаю проекты...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#e5e9f0]">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-[#1a2033] mb-2">Пока нет аудиокниг</h3>
          <p className="text-[#64748b] mb-6">Создайте первую — это займёт меньше минуты</p>
          <button
            onClick={onNewBook}
            className="inline-flex items-center gap-2 bg-[#3b82f6] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#2563eb] transition-all"
          >
            <Icon name="Plus" size={16} />
            Создать первую книгу
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 border border-[#e5e9f0] flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center flex-shrink-0">
                <Icon name="BookOpen" size={20} className="text-[#3b82f6]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#1a2033] truncate">{p.title}</div>
                <div className="text-xs text-[#94a3b8] mt-0.5">
                  {new Date(p.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.audio_url && (
                  <a
                    href={p.audio_url}
                    download={`${p.title}.mp3`}
                    className="flex items-center gap-1 text-sm text-[#3b82f6] hover:text-[#2563eb] border border-blue-200 hover:border-blue-400 px-3 py-2 rounded-lg transition-all"
                  >
                    <Icon name="Download" size={14} />
                    MP3
                  </a>
                )}
                <button
                  onClick={() => onDeleteProject(p.id)}
                  className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
