import Icon from "@/components/ui/icon";
import { NAV, Page } from "@/components/types-data";

interface HeaderProps {
  page: Page;
  setSidebarOpen: (v: boolean) => void;
}

export default function Header({ page, setSidebarOpen }: HeaderProps) {
  return (
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
  );
}
