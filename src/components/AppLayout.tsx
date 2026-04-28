import { useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Page, NAV } from "@/components/app-data";

interface AppLayoutProps {
  page: Page;
  setPage: (p: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  children: React.ReactNode;
}

export function AppLayout({ page, setPage, sidebarOpen, setSidebarOpen, children }: AppLayoutProps) {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [page]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#080c14" }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-16 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)" }} />
        <div className="absolute -bottom-20 -right-10 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.09), transparent 70%)" }} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
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

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="flex items-center gap-3 px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(8,10,20,0.6)", backdropFilter: "blur(12px)" }}>
          <button className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={() => setSidebarOpen(true)}>
            <Icon name="Menu" size={18} />
          </button>
          <h1 className="font-syne font-semibold text-base flex-1 truncate">
            {NAV.find(n => n.id === page)?.label}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-ibm text-muted-foreground hidden sm:block">Все API онлайн</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <Icon name="Bell" size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-syne font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#22d3ee)" }}>
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-5 md:p-8">
          <div key={page}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
