import { useRef, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Page, NAV } from "@/components/app-data";

interface AppLayoutProps {
  page: Page;
  setPage: (p: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  children: React.ReactNode;
}

const NOTIFICATIONS = [
  { id: "1", text: "Синтез «Реклама кофейни» завершён", time: "2 мин назад", read: false },
  { id: "2", text: "Yandex SpeechKit требует ключ API",  time: "1 час назад",  read: false },
  { id: "3", text: "Аудиокнига гл. 3 готова к скачиванию", time: "вчера",    read: true },
];

export function AppLayout({ page, setPage, sidebarOpen, setSidebarOpen, children }: AppLayoutProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [page]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

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
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors relative"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                <Icon name="Bell" size={17} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[9px] font-bold text-white">{unread}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl z-50 shadow-2xl overflow-hidden"
                  style={{ background: "rgba(12,15,28,0.98)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <span className="font-syne font-semibold text-sm">Уведомления</span>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-[11px] font-ibm text-purple-400 hover:text-purple-300 transition-colors">
                        Прочитать все
                      </button>
                    )}
                  </div>
                  {notifications.map(n => (
                    <div key={n.id}
                      onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      style={{ background: n.read ? "transparent" : "rgba(124,58,237,0.06)" }}>
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-transparent" : "bg-purple-400"}`} />
                      <div>
                        <div className="text-xs font-ibm text-foreground/90">{n.text}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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