import Icon from "@/components/ui/icon";
import { NAV, Page } from "@/components/types-data";

interface SidebarProps {
  page: Page;
  setPage: (p: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export default function Sidebar({ page, setPage, sidebarOpen, setSidebarOpen }: SidebarProps) {
  return (
    <aside
      className={`fixed md:static z-30 flex flex-col h-full transition-transform duration-300 shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      style={{ width: 224, background: "rgba(6,8,18,0.97)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center animate-pulse-glow"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
          <Icon name="Waves" size={16} className="text-white" />
        </div>
        <div>
          <div className="font-syne font-bold text-sm">VoiceForge</div>
          <div className="text-[10px] text-muted-foreground font-ibm tracking-wider">STUDIO</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(item => (
          <button key={item.id}
            onClick={() => { setPage(item.id); setSidebarOpen(false); }}
            className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all font-ibm text-sm ${
              page === item.id
                ? "active text-purple-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={page === item.id ? { background: "rgba(124,58,237,0.15)" } : {}}>
            <Icon name={item.icon} size={17} className={page === item.id ? "text-purple-400" : ""} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Usage widget */}
      <div className="px-4 py-4">
        <div className="rounded-xl p-3 text-center"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div className="text-[10px] text-muted-foreground font-ibm mb-1">Сегодня</div>
          <div className="font-syne font-bold text-sm text-gradient">12 480 симв.</div>
        </div>
      </div>
    </aside>
  );
}
