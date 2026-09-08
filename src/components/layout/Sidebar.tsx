import React from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  CheckSquare,
  Calendar,
  FolderKanban,
  BarChart3,
  Sparkles,
  FileText,
  Settings,
  Flame,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { useWork } from "../../context/WorkContext";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { todayStats, settings, scoreBreakdown } = useWork();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: todayStats.pending > 0 ? `${todayStats.pending}` : undefined
    },
    {
      id: "today",
      label: "Today",
      icon: CalendarCheck,
      badge: todayStats.urgent > 0 ? `${todayStats.urgent}` : undefined,
      badgeColor: "bg-rose-900/60 text-rose-300 border border-rose-800"
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      badge: `${todayStats.total}`
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderKanban
    },
    {
      id: "ai",
      label: "AI Assistant",
      icon: Sparkles,
      highlight: true
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings
    }
  ];

  const handleNav = (id: string) => {
    setCurrentTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-white shrink-0 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-black text-xl italic text-white shadow-xs">
              P
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white leading-none block">
                PROD.AI
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-tight">
                Work & Productivity
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white font-semibold shadow-xs"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? "text-indigo-400"
                        : item.highlight
                        ? "text-indigo-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${
                      item.badgeColor || (isActive ? "bg-indigo-500/30 text-indigo-300" : "bg-slate-800 text-slate-400")
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Productivity Score Footer Card (matching Design HTML) */}
        <div className="p-6 mt-auto border-t border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
              Productivity Score
            </span>
            <button
              onClick={() => handleNav("reports")}
              className="text-[10px] text-indigo-400 hover:underline font-bold"
            >
              Check-in &rarr;
            </button>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-3xl font-black leading-none text-indigo-400">
              {scoreBreakdown.totalScore}
            </span>
            <span className="text-sm text-slate-500 pb-0.5 font-semibold">/ 100</span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 mt-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, scoreBreakdown.totalScore)}%` }}
            />
          </div>

          {/* User mini status */}
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">
                {settings.userName ? settings.userName.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="truncate font-medium text-slate-300">{settings.userName || "User"}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold font-mono shrink-0">
              {todayStats.completed}/{todayStats.total} done
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
