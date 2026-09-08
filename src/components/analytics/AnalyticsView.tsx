import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Clock,
  Calendar,
  AlertCircle,
  Award,
  Layers
} from "lucide-react";
import { useWork } from "../../context/WorkContext";
import { formatMinutesToHours } from "../../utils/productivity";

export const AnalyticsView: React.FC = () => {
  const { tasks, scoreBreakdown, checkIns, todayDate } = useWork();

  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  // 1. Productivity Trend Data (Last 7 days mock + actual check-ins)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(new Date(todayDate).getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const dStr = d.toISOString().split("T")[0];
    const dayTasks = tasks.filter((t) => t.date === dStr || t.deadline === dStr);
    const completed = dayTasks.filter((t) => t.status === "Selesai").length;
    const total = dayTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const dayName = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][d.getDay()];
    return { date: dStr, label: dayName, rate, tasksCount: total };
  });

  // 2. Task Status Count
  const statusCounts = {
    Completed: tasks.filter((t) => t.status === "Selesai").length,
    InProgress: tasks.filter((t) => t.status === "In Progress").length,
    Pending: tasks.filter((t) => t.status === "Belum dimulai").length,
    Overdue: tasks.filter(
      (t) =>
        t.status !== "Selesai" &&
        t.deadline &&
        new Date(t.deadline).getTime() < new Date(todayDate).getTime()
    ).length
  };
  const totalStatusTasks = Math.max(
    1,
    statusCounts.Completed + statusCounts.InProgress + statusCounts.Pending + statusCounts.Overdue
  );

  // 3. Category Distribution
  const categoryCounts = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryEntries = (Object.entries(categoryCounts) as [string, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  // 4. Priority Distribution
  const priorityCounts = {
    Critical: tasks.filter((t) => t.priority === "Critical").length,
    Urgent: tasks.filter((t) => t.priority === "Urgent").length,
    High: tasks.filter((t) => t.priority === "High").length,
    Medium: tasks.filter((t) => t.priority === "Medium").length,
    Low: tasks.filter((t) => t.priority === "Low").length
  };

  // 5. Working Hours Chart (hours per day calculated from logged tasks)
  const dailyWorkHours = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(new Date(todayDate).getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const dStr = d.toISOString().split("T")[0];
    const dayTasks = tasks.filter((t) => t.date === dStr);
    const totalMinutes = dayTasks.reduce((acc, t) => acc + (t.actualDuration || 0), 0);
    const dayName = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][d.getDay()];
    return { day: dayName, hours: Math.round((totalMinutes / 60) * 10) / 10 };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
            <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
            <span>Productivity Analytics & Workload</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-0.5">
            Statistik & Diagram Produktivitas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis metrik performa kerja, tren produktivitas, alokasi jam, dan evaluasi beban tugas.
          </p>
        </div>

        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
          <button
            onClick={() => setTimeRange("7d")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
              timeRange === "7d" ? "bg-slate-800 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
              timeRange === "30d" ? "bg-slate-800 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            30 Hari
          </button>
        </div>
      </div>

      {/* Top Evaluation Card: Score Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-950 text-indigo-400 shadow-inner">
              <span className="text-3xl font-black">{scoreBreakdown.totalScore}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">Evaluasi Produktivitas Harian</h3>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    scoreBreakdown.statusColor === "emerald"
                      ? "bg-emerald-100 text-emerald-800"
                      : scoreBreakdown.statusColor === "blue"
                      ? "bg-indigo-100 text-indigo-800"
                      : scoreBreakdown.statusColor === "amber"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {scoreBreakdown.statusLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Formula pembobotan: Task Completion (55%) + Deadline Adherence (25%) + Hours (20%) - Penalti Overdue
              </p>
            </div>
          </div>

          {/* Classification criteria legend */}
          <div className="flex items-center gap-2 text-[10px] font-bold flex-wrap">
            <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-1 border border-emerald-200">
              90–100: Sangat Produktif
            </span>
            <span className="rounded bg-indigo-50 text-indigo-700 px-2 py-1 border border-indigo-200">
              75–89: Produktif
            </span>
            <span className="rounded bg-amber-50 text-amber-700 px-2 py-1 border border-amber-200">
              50–74: Cukup Produktif
            </span>
            <span className="rounded bg-rose-50 text-rose-700 px-2 py-1 border border-rose-200">
              &lt;50: Perlu Evaluasi
            </span>
          </div>
        </div>

        {/* Detailed Points Gauge */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-tight">Weighted Tasks</span>
            <span className="text-lg font-black text-slate-800">{scoreBreakdown.weightedScore}</span>
            <span className="text-slate-400 text-[10px]"> / 55 poin</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-tight">Deadline Adherence</span>
            <span className="text-lg font-black text-slate-800">{scoreBreakdown.deadlineAdherence}</span>
            <span className="text-slate-400 text-[10px]"> / 25 poin</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-tight">Hours Consistency</span>
            <span className="text-lg font-black text-slate-800">{scoreBreakdown.workHoursContribution}</span>
            <span className="text-slate-400 text-[10px]"> / 20 poin</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-tight">Penalti Overdue</span>
            <span className="text-lg font-black text-rose-600">-{scoreBreakdown.overduePenalty}</span>
            <span className="text-slate-400 text-[10px]"> poin</span>
          </div>
        </div>
      </div>

      {/* Grid of Charts (6 Diagrams requested in Section 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* DIAGRAM 1: Productivity Trend (Line Chart SVG) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">1. Productivity Trend (Line Chart)</h3>
              <p className="text-[11px] text-slate-500">Persentase produktivitas harian selama 7 hari terakhir</p>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>

          {/* SVG Line Chart */}
          <div className="h-48 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              {/* Horizontal grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#e2e8f0" strokeWidth="1" />

              {/* Y Axis labels */}
              <text x="15" y="24" fontSize="10" fill="#94a3b8">100%</text>
              <text x="20" y="64" fontSize="10" fill="#94a3b8">65%</text>
              <text x="20" y="104" fontSize="10" fill="#94a3b8">30%</text>

              {/* Path calculation */}
              {(() => {
                const points = last7Days.map((d, idx) => {
                  const x = 50 + idx * 70;
                  const y = 140 - (d.rate / 100) * 115;
                  return `${x},${y}`;
                });
                const dPath = "M " + points.join(" L ");
                return (
                  <>
                    <path
                      d={dPath}
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {last7Days.map((d, idx) => {
                      const x = 50 + idx * 70;
                      const y = 140 - (d.rate / 100) * 115;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="4.5" fill="#6366f1" stroke="#1e1b4b" strokeWidth="2" />
                          <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">
                            {d.rate}%
                          </text>
                          <text x={x} y="152" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
                            {d.label}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* DIAGRAM 2: Task Status (Donut Chart SVG) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">2. Task Status Distribution (Donut Chart)</h3>
              <p className="text-[11px] text-slate-500">Rasio status penyelesaian semua pekerjaan</p>
            </div>
            <PieChart className="h-4 w-4 text-slate-500" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-48">
            {/* SVG Donut */}
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  const compPct = (statusCounts.Completed / totalStatusTasks) * 100;
                  const inProgPct = (statusCounts.InProgress / totalStatusTasks) * 100;
                  const pendPct = (statusCounts.Pending / totalStatusTasks) * 100;
                  const overPct = (statusCounts.Overdue / totalStatusTasks) * 100;

                  const cCirc = 2 * Math.PI * 38;
                  const cComp = (compPct / 100) * cCirc;
                  const cInProg = (inProgPct / 100) * cCirc;
                  const cPend = (pendPct / 100) * cCirc;
                  const cOver = (overPct / 100) * cCirc;

                  return (
                    <>
                      {/* Completed: Emerald */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="16"
                        strokeDasharray={`${cComp} ${cCirc}`}
                        strokeDashoffset="0"
                      />
                      {/* In Progress: Indigo */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#6366f1"
                        strokeWidth="16"
                        strokeDasharray={`${cInProg} ${cCirc}`}
                        strokeDashoffset={-cComp}
                      />
                      {/* Pending: Slate */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#cbd5e1"
                        strokeWidth="16"
                        strokeDasharray={`${cPend} ${cCirc}`}
                        strokeDashoffset={-(cComp + cInProg)}
                      />
                      {/* Overdue: Rose */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#e11d48"
                        strokeWidth="16"
                        strokeDasharray={`${cOver} ${cCirc}`}
                        strokeDashoffset={-(cComp + cInProg + cPend)}
                      />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-800">{tasks.length}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total Task</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-emerald-500" />
                <span className="text-slate-600 font-medium">Completed:</span>
                <span className="font-bold text-slate-800">{statusCounts.Completed}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-indigo-500" />
                <span className="text-slate-600 font-medium">In Progress:</span>
                <span className="font-bold text-slate-800">{statusCounts.InProgress}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-slate-300" />
                <span className="text-slate-600 font-medium">Pending:</span>
                <span className="font-bold text-slate-800">{statusCounts.Pending}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-rose-500" />
                <span className="text-slate-600 font-medium">Overdue:</span>
                <span className="font-bold text-rose-600">{statusCounts.Overdue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DIAGRAM 3: Work Category Distribution (Bar Chart) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">3. Work Category Distribution</h3>
              <p className="text-[11px] text-slate-500">Proporsi volume pekerjaan berdasarkan bidang/kategori</p>
            </div>
            <Layers className="h-4 w-4 text-slate-500" />
          </div>

          <div className="space-y-2.5 h-48 overflow-y-auto pr-1">
            {categoryEntries.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-xs text-slate-400">
                <span>Belum ada data kategori pekerjaan.</span>
              </div>
            ) : (
              categoryEntries.map(([category, count]) => {
                const pct = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
                return (
                  <div key={category}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>{category}</span>
                      <span className="text-slate-500 font-bold">{count} task ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* DIAGRAM 4: Weekly Comparison (Bar Chart) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">4. Weekly Comparison</h3>
              <p className="text-[11px] text-slate-500">Perbandingan output: Minggu Ini vs Minggu Lalu</p>
            </div>
            <Calendar className="h-4 w-4 text-slate-500" />
          </div>

          <div className="flex items-center justify-around h-48 pt-2">
            {/* Minggu Lalu */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Minggu Lalu</span>
              <div className="w-16 bg-slate-200 rounded-t-lg h-24 flex items-end justify-center pb-2">
                <span className="text-xs font-black text-slate-700">0 Task</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Completion 0%</span>
            </div>

            {/* Minggu Ini */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-indigo-700">Minggu Ini</span>
              <div
                className="w-16 bg-indigo-600 rounded-t-lg flex items-end justify-center pb-2 shadow-sm transition-all duration-300"
                style={{ height: `${Math.max(28, Math.min(160, tasks.length * 20))}px` }}
              >
                <span className="text-xs font-black text-white">{tasks.length} Task</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-bold">
                {tasks.length === 0 ? "Belum ada task" : `${statusCounts.Completed} Selesai`}
              </span>
            </div>
          </div>
        </div>

        {/* DIAGRAM 5: Working Hours Chart (Total jam kerja per hari) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">5. Working Hours per Day</h3>
              <p className="text-[11px] text-slate-500">Total jam kerja aktual tercatat per hari</p>
            </div>
            <Clock className="h-4 w-4 text-slate-500" />
          </div>

          <div className="flex items-end justify-between gap-2 h-48 pt-6 px-4 border-b border-slate-200">
            {dailyWorkHours.map((item, i) => {
              const barHeight = Math.min(100, Math.round((item.hours / 10) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-600">{item.hours}h</span>
                  <div className="w-full bg-slate-100 rounded-t-md h-28 flex items-end">
                    <div
                      className="w-full bg-slate-800 rounded-t-md transition-all duration-300 group-hover:bg-indigo-600"
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DIAGRAM 6: Priority Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">6. Priority Distribution</h3>
              <p className="text-[11px] text-slate-500">Distribusi beban kerja berdasarkan tingkat urgensi</p>
            </div>
            <AlertCircle className="h-4 w-4 text-slate-500" />
          </div>

          <div className="space-y-3 h-48 pt-2">
            {Object.entries(priorityCounts).map(([priority, count]) => {
              const pct = Math.round((count / tasks.length) * 100);
              const colorMap: any = {
                Critical: "bg-rose-600",
                Urgent: "bg-orange-500",
                High: "bg-amber-500",
                Medium: "bg-indigo-500",
                Low: "bg-slate-400"
              };
              return (
                <div key={priority}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800 font-bold">{priority}</span>
                    <span className="text-slate-500">{count} task ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorMap[priority] || "bg-slate-500"} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
