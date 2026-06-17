import Icon from "@/components/ui/icon";
import { Screen } from "@/components/audiobook/audiobook-data";
import { SaveStatus } from "@/components/audiobook/EngineUI";
import { Persona, AB_COLOR } from "@/components/audiobook/avatar-types";

interface Props {
  setScreen: (s: Screen) => void;
  avatarUrl: string;
  persona: Persona | null;
  industry: string;
  openDrawer: () => void;
  canExport: boolean;
  handleExport: () => void;
  saving: boolean;
  savedAt: Date | null;
  handleSave: () => void;
}

export function AvatarHeader({
  setScreen, avatarUrl, persona, industry, openDrawer,
  canExport, handleExport, saving, savedAt, handleSave,
}: Props) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <button onClick={() => setScreen("home")}
        className="p-2 rounded-xl transition-all hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
        style={{ color: "var(--ab-text-secondary)" }}>
        <Icon name="ArrowLeft" size={20} />
      </button>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}>
        {avatarUrl
          ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          : <Icon name="UserRound" fallback="User" size={18} className="text-white" />}
      </div>
      <div>
        <h1 className="font-bold text-xl" style={{ color: "var(--ab-text-primary)" }}>
          {persona?.name || "Новый аватар-продавец"}
        </h1>
        <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>
          {persona?.role || industry}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={openDrawer}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={{ color: "var(--ab-text-secondary)" }}>
          <Icon name="FolderOpen" size={14} /><span className="hidden sm:inline">Мои аватары</span>
        </button>
        {canExport && (
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ background: `${AB_COLOR}12`, color: AB_COLOR, border: `1px solid ${AB_COLOR}30` }}>
            <Icon name="Download" size={14} /><span className="hidden sm:inline">Скачать карточку</span>
          </button>
        )}
        <SaveStatus saving={saving} savedAt={savedAt} onSave={handleSave} color={AB_COLOR} />
      </div>
    </div>
  );
}