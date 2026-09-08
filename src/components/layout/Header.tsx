import React, { useState } from "react";
import {
  Plus,
  Bell,
  Sparkles,
  Calendar,
  Play,
  Pause,
  Square,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  X
} from "lucide-react";
import { useWork } from "../../context/WorkContext";
import { formatMinutesToHours } from "../../utils/productivity";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery
}) => {
  const {
    todayDate,
    setTodayDate,
    openQuickAdd,
    todayStats,
    scoreBreakdown,
    activeTimer,
    pauseTimer,
    startTimer,
    stopTimer,
    tasks,
    notifications,
    clearNotification,
    runAIPrioritization,
    isAIPrioritizing
  } = useWork();

  const [showNotifications, setShowNotifications] = useState(false);
  const activeTask = activeTimer ? tasks.find((t) => t.id === activeTimer.taskId) : null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 shrink-0">
      {/* Left: View Title & Today Date & Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight capitalize">
            {currentTab === "dashboard"
              ? "Work Dashboard"
              : currentTab === "today"
              ? "Today's Work Log"
              : currentTab === "tasks"
              ? "All Tasks"
              : currentTab === "ai"
              ? "AI Work Assistant"
              : currentTab}
          </h1>
          <span className="text-slate-300">/</span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 transition-colors">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <input
            type="date"
            value={todayDate}
            onChange={(e) => e.target.value && setTodayDate(e.target.value)}
            className="bg-transparent border-none p-0 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            title="Ganti Tanggal Acuan"
          />
        </div>

        {/* Global Search Input */}
        <div className="relative flex-1 hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari task, project, tag, atau kategori..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentTab !== "tasks" && e.target.value.trim().length > 0) {
                setCurrentTab("tasks");
              }
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Timer Indicator */}
        {activeTimer && activeTask && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 shadow-xs animate-pulse">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="hidden md:inline max-w-[120px] truncate font-semibold">{activeTask.title}</span>
            <span className="font-mono font-black text-emerald-900">{formatTimer(activeTimer.elapsedSeconds)}</span>
            <div className="flex items-center gap-1 border-l border-emerald-200 pl-1.5 ml-1">
              {activeTimer.isRunning ? (
                <button
                  onClick={pauseTimer}
                  title="Pause Timer"
                  className="rounded p-0.5 hover:bg-emerald-100 text-emerald-700"
                >
                  <Pause className="h-3 w-3" />
                </button>
              ) : (
                <button
                  onClick={() => startTimer(activeTask.id)}
                  title="Lanjutkan Timer"
                  className="rounded p-0.5 hover:bg-emerald-100 text-emerald-700"
                >
                  <Play className="h-3 w-3 fill-current" />
                </button>
              )}
              <button
                onClick={stopTimer}
                title="Selesaikan & Simpan Durasi"
                className="rounded p-0.5 hover:bg-emerald-100 text-emerald-700"
              >
                <Square className="h-3 w-3 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* Productivity Score Quick Badge */}
        <div
          onClick={() => setCurrentTab("analytics")}
          className="hidden xl:flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs cursor-pointer hover:border-slate-300 transition-colors"
          title="Klik untuk melihat detail Skor Produktivitas"
        >
          <span className="text-slate-400 font-bold uppercase tracking-tighter text-[10px]">Skor</span>
          <span className="font-black text-slate-800">{scoreBreakdown.totalScore}</span>
          <span className="text-[10px] text-slate-400">/100</span>
          <span
            className={`h-2 w-2 rounded-full ${
              scoreBreakdown.statusColor === "emerald"
                ? "bg-emerald-500"
                : scoreBreakdown.statusColor === "blue"
                ? "bg-indigo-500"
                : scoreBreakdown.statusColor === "amber"
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
          />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Pemberitahuan & Reminder"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white shadow">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-slate-700" />
                  <span className="text-xs font-bold text-slate-800">Notifikasi & Reminder</span>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-black text-slate-600">
                    {notifications.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
                  Tidak ada reminder aktif. Semua pekerjaan terkendali!
                </div>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start justify-between rounded-lg p-2.5 text-xs border ${
                        n.type === "overdue"
                          ? "bg-rose-50 border-rose-200 text-rose-900"
                          : n.type === "urgent"
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-indigo-50 border-indigo-200 text-indigo-900"
                      }`}
                    >
                      <div className="flex gap-2">
                        {n.type === "overdue" ? (
                          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                        ) : n.type === "urgent" ? (
                          <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                        ) : (
                          <Bell className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold">{n.title}</p>
                          <p className="text-[11px] opacity-90 mt-0.5">{n.message}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => clearNotification(n.id)}
                        className="text-slate-400 hover:text-slate-700 ml-2"
                        title="Tutup notifikasi"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Quick Prioritize Trigger Button */}
        <button
          onClick={async () => {
            setCurrentTab("ai");
            await runAIPrioritization();
          }}
          disabled={isAIPrioritizing}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
          title="Analisis & Urutkan Task dengan AI"
        >
          <Sparkles className={`h-3.5 w-3.5 text-indigo-600 ${isAIPrioritizing ? "animate-spin" : ""}`} />
          <span>{isAIPrioritizing ? "Menganalisis..." : "✨ AI Sorted"}</span>
        </button>

        {/* + Tambah Pekerjaan (Primary Quick Add Button matching Design HTML) */}
        <button
          id="btn-quick-add-task"
          onClick={openQuickAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-xs flex items-center gap-1.5 transition-all active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Task</span>
        </button>
      </div>
    </header>
  );
};
