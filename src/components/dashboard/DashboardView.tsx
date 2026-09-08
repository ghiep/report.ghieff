import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Plus,
  Play,
  Calendar,
  Layers,
  BarChart2,
  RefreshCw
} from "lucide-react";
import { useWork } from "../../context/WorkContext";
import { formatMinutesToHours } from "../../utils/productivity";
import { TaskCard } from "../tasks/TaskCard";

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentTab }) => {
  const {
    todayDate,
    todayStats,
    scoreBreakdown,
    tasks,
    aiInsights,
    fetchAIInsights,
    isAIInsightsLoading,
    runAIPrioritization,
    isAIPrioritizing,
    openQuickAdd
  } = useWork();

  const todayTasks = tasks.filter((t) => t.date === todayDate);
  const activeTodayTasks = todayTasks.filter((t) => t.status !== "Selesai");
  const completedTodayTasks = todayTasks.filter((t) => t.status === "Selesai");

  // Top priorities to highlight (DO NOW or High/Critical/Urgent)
  const topPriorities = [...activeTodayTasks].sort((a, b) => {
    const pRank: any = { Critical: 5, Urgent: 4, High: 3, Medium: 2, Low: 1 };
    return (pRank[b.priority] || 2) - (pRank[a.priority] || 2);
  }).slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Date Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Hari Ini: {todayDate}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-1">
            Daily Work Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {tasks.length === 0
              ? "Belum ada pekerjaan terdaftar. Mulai catat aktivitas pekerjaan hari ini."
              : `${todayStats.pending} pekerjaan tersisa hari ini. Pantau prioritas dan jaga ritme fokusmu.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setCurrentTab("ai");
              await runAIPrioritization();
            }}
            disabled={isAIPrioritizing}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-xs hover:bg-indigo-100 transition-all"
          >
            <Sparkles className={`h-4 w-4 text-indigo-600 ${isAIPrioritizing ? "animate-spin" : ""}`} />
            <span>{isAIPrioritizing ? "Menganalisis..." : "✨ AI Prioritize & Sort"}</span>
          </button>

          <button
            onClick={openQuickAdd}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Hari Ini Metric Cards Grid (matching Design HTML stats) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {/* TOTAL TASK */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
            Total Task
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-800">{todayStats.total}</span>
            <span className="text-xs text-slate-400 font-semibold">item</span>
          </div>
        </div>

        {/* SELESAI */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-tighter text-emerald-700">
            Completed
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700">{todayStats.completed}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
        </div>

        {/* BELUM SELESAI */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
            Remaining
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-800">{todayStats.pending}</span>
            <span className="text-xs text-slate-400 font-semibold">tasks</span>
          </div>
        </div>

        {/* URGENT */}
        <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-tighter text-orange-700">
            Urgent
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-orange-800">{todayStats.urgent}</span>
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          </div>
        </div>

        {/* OVERDUE */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-tighter text-rose-700">
            Overdue
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-700">{todayStats.overdue}</span>
            {todayStats.overdue > 0 && <AlertTriangle className="h-4 w-4 text-rose-600" />}
          </div>
        </div>

        {/* COMPLETION RATE */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-tighter text-slate-400">
            Completion
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600">{todayStats.completionRate}%</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Second Row: Productivity Score Card & Work Time Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Productivity Score Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Performance Evaluation
              </span>
              <h3 className="text-sm font-bold text-slate-800 mt-0.5">Productivity Score</h3>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                scoreBreakdown.statusColor === "emerald"
                  ? "bg-emerald-100 text-emerald-800"
                  : scoreBreakdown.statusColor === "blue"
                  ? "bg-indigo-100 text-indigo-800"
                  : scoreBreakdown.statusColor === "amber"
                  ? "bg-amber-100 text-amber-800"
                  : scoreBreakdown.statusColor === "slate"
                  ? "bg-slate-100 text-slate-700"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {scoreBreakdown.statusLabel}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-950 text-indigo-400 shadow-inner">
              <span className="text-3xl font-black">{scoreBreakdown.totalScore}</span>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span className="font-medium">Weighted Progress</span>
                <span className="font-bold text-slate-800">{scoreBreakdown.weightedScore}/55 pts</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span className="font-medium">Deadline Adherence</span>
                <span className="font-bold text-slate-800">{scoreBreakdown.deadlineAdherence}/25 pts</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span className="font-medium">Work Hours Consistency</span>
                <span className="font-bold text-slate-800">{scoreBreakdown.workHoursContribution}/20 pts</span>
              </div>
              {scoreBreakdown.overduePenalty > 0 && (
                <div className="flex justify-between text-xs text-rose-600 font-bold">
                  <span>Overdue Penalty</span>
                  <span>-{scoreBreakdown.overduePenalty} pts</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <button
              onClick={() => setCurrentTab("reports")}
              className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1"
            >
              <span>Isi End-of-Day Check-in & Evaluasi</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Working Hours & Remaining Estimations */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Time Management
              </span>
              <h3 className="text-sm font-bold text-slate-800 mt-0.5">Alokasi Waktu Kerja Hari Ini</h3>
            </div>
            <button
              onClick={() => setCurrentTab("today")}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Buka Daily Planner <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-tight">Total Waktu Kerja (Logged)</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-600">
                  {formatMinutesToHours(todayStats.totalWorkMinutes)}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 7.0 jam target</span>
              </div>
              {/* Progress Bar towards 7h goal */}
              <div className="mt-3 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((todayStats.totalWorkMinutes / (7 * 60)) * 100))}%`
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-tight">Estimasi Waktu Tersisa</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800">
                  {formatMinutesToHours(todayStats.remainingWorkMinutes)}
                </span>
                <span className="text-xs text-slate-400 font-medium">estimasi</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {activeTodayTasks.length} pekerjaan aktif tersisa untuk diselesaikan hari ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: AI Work Insights Panel (matching Design HTML's Dark Card) */}
      <div className="bg-indigo-950 text-white p-5 rounded-2xl flex flex-col gap-4 border border-indigo-900 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <h3 className="font-black tracking-wide text-xs uppercase text-indigo-200">
              AI Strategic Recommendations & Work Insights
            </h3>
          </div>

          <button
            onClick={fetchAIInsights}
            disabled={isAIInsightsLoading}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-800 bg-indigo-900/60 px-3 py-1 text-xs font-bold text-indigo-300 hover:bg-indigo-900 shadow-xs"
            title="Muat ulang insight terbaru"
          >
            <RefreshCw className={`h-3 w-3 text-indigo-400 ${isAIInsightsLoading ? "animate-spin" : ""}`} />
            <span>{isAIInsightsLoading ? "Memperbarui..." : "Update Insight"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.slice(0, 3).map((insight, idx) => (
            <div
              key={idx}
              className="relative pl-4 border-l-2 border-indigo-500 text-xs"
            >
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                {idx === 0 ? "DO FIRST" : idx === 1 ? "PRIORITAS STRATEGIS" : "OPTIMASI EFISIENSI"}
              </span>
              <p className="font-medium text-xs text-slate-100 mt-1 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-indigo-900/80">
          <button
            onClick={async () => {
              setCurrentTab("ai");
              await runAIPrioritization();
            }}
            disabled={isAIPrioritizing}
            className="w-full sm:w-auto flex-1 py-2.5 bg-indigo-500 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-indigo-400 text-white shadow transition-colors text-center"
          >
            {isAIPrioritizing ? "Sedang Mengurutkan..." : "Apply Suggested Priority Order"}
          </button>
          <button
            onClick={() => setCurrentTab("ai")}
            className="text-xs font-bold text-indigo-300 hover:text-white px-3 py-1"
          >
            Buka AI Work Assistant &rarr;
          </button>
        </div>
      </div>

      {/* Fourth Row: Top Priority Focus & Today's Active Tasks */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">Prioritas Utama Hari Ini</h3>
            <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
              {activeTodayTasks.length} aktif
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab("tasks")}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Lihat Semua ({tasks.length})
            </button>
            <button
              onClick={() => setCurrentTab("today")}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Buka Daily Planner &rarr;
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-xs">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Plus className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Sistem Siap Digunakan — Belum Ada Pekerjaan</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Workspace telah dikosongkan. Mulai catat pekerjaan yang sedang Anda kerjakan hari ini untuk melacak waktu, tingkat prioritas, dan evaluasi produktivitas dengan AI.
            </p>
            <button
              onClick={openQuickAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>+ Catat Pekerjaan Pertama</span>
            </button>
          </div>
        ) : activeTodayTasks.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-800">Semua Pekerjaan Hari Ini Selesai!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Luar biasa! Kamu telah menuntaskan semua target pekerjaan untuk hari ini. Luangkan waktu untuk mengisi evaluasi harian atau rencanakan target besok.
            </p>
            <button
              onClick={() => setCurrentTab("reports")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
            >
              Isi Daily Review & Check-in
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {topPriorities.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Fifth Row: Completed Tasks Today if any */}
      {completedTodayTasks.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800">
                Pekerjaan yang Berhasil Diselesaikan Hari Ini ({completedTodayTasks.length})
              </h4>
            </div>
            <button
              onClick={() => setCurrentTab("reports")}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Lihat Rekap Harian
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedTodayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
