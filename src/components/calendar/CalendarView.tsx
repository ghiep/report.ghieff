import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderKanban,
  CheckCircle2,
  Plus
} from "lucide-react";
import { useWork } from "../../context/WorkContext";
import { Task } from "../../types";
import { getPriorityBadge } from "../common/Badge";
import { TaskCard } from "../tasks/TaskCard";

export const CalendarView: React.FC = () => {
  const { tasks, todayDate, openQuickAdd, setSelectedTaskForDetail } = useWork();

  const [currentView, setCurrentView] = useState<"month" | "week" | "day">("month");
  const [activeDate, setActiveDate] = useState<string>(todayDate);

  // Parse active year and month
  const activeDateObj = new Date(activeDate);
  const currentYear = activeDateObj.getFullYear();
  const currentMonth = activeDateObj.getMonth(); // 0-indexed

  // Navigation handlers
  const prevMonth = () => {
    const d = new Date(currentYear, currentMonth - 1, 1);
    setActiveDate(d.toISOString().split("T")[0]);
  };

  const nextMonth = () => {
    const d = new Date(currentYear, currentMonth + 1, 1);
    setActiveDate(d.toISOString().split("T")[0]);
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Generate Month Matrix
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Tasks mapped by date
  const tasksByDate = tasks.reduce((acc, t) => {
    const d = t.deadline || t.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-5 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
            <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
            <span>Schedule & Deadlines</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-0.5">
            {monthNames[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs">
            <button
              onClick={() => setCurrentView("month")}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                currentView === "month" ? "bg-slate-800 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCurrentView("week")}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                currentView === "week" ? "bg-slate-800 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCurrentView("day")}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                currentView === "day" ? "bg-slate-800 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Day
            </button>
          </div>

          {/* Month Stepper */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-xs">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-l-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveDate(todayDate)}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 border-x border-slate-200"
            >
              Hari Ini
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-r-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={openQuickAdd}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Task</span>
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {currentView === "month" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[11px] font-bold text-slate-600 py-2.5 uppercase tracking-wider">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
            {/* Empty slots for month start padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/40 p-2 min-h-[90px]" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
                dayNum
              ).padStart(2, "0")}`;
              const isToday = dateStr === todayDate;
              const dayTasks = tasksByDate[dateStr] || [];

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setActiveDate(dateStr);
                    setCurrentView("day");
                  }}
                  className={`p-2 min-h-[95px] flex flex-col justify-between hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    isToday ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isToday ? "bg-indigo-600 text-white font-black shadow-xs" : "text-slate-800"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayTasks.length} task
                      </span>
                    )}
                  </div>

                  {/* Task Chips in cell */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-16">
                    {dayTasks.slice(0, 3).map((task) => {
                      const badge = getPriorityBadge(task.priority);
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTaskForDetail(task);
                          }}
                          className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] truncate border ${badge.bg}`}
                          title={`${task.title} (${task.priority})`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${badge.dot}`} />
                          <span className="truncate">{task.title}</span>
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] text-slate-400 block text-right font-medium">
                        +{dayTasks.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {currentView === "day" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Jadwal Harian</span>
              <h3 className="text-lg font-bold text-slate-800">{activeDate}</h3>
            </div>
            <button
              onClick={() => setCurrentView("month")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
            >
              &larr; Kembali ke Kalender Bulanan
            </button>
          </div>

          {(tasksByDate[activeDate] || []).length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ada deadline atau task terjadwal untuk tanggal ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(tasksByDate[activeDate] || []).map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* WEEK VIEW */}
      {currentView === "week" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Weekly Timeline View</h3>
            <button
              onClick={() => setCurrentView("month")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
            >
              &larr; Kembali ke Kalender Bulanan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => {
              // Calculate days of current week
              const curr = new Date(activeDate);
              const firstDay = curr.getDate() - curr.getDay() + i;
              const dayObj = new Date(curr.setDate(firstDay));
              const dStr = dayObj.toISOString().split("T")[0];
              const dTasks = tasksByDate[dStr] || [];

              return (
                <div
                  key={dStr}
                  className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 min-h-[220px]"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-tight">
                        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][i]}
                      </span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {dayObj.getDate()} {monthNames[dayObj.getMonth()].slice(0, 3)}
                      </span>
                    </div>
                    {dTasks.length > 0 && (
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-700">
                        {dTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {dTasks.map((t) => {
                      const badge = getPriorityBadge(t.priority);
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTaskForDetail(t)}
                          className={`rounded-lg p-2 text-xs border cursor-pointer ${badge.bg}`}
                        >
                          <p className="font-bold text-[11px] truncate">{t.title}</p>
                          <span className="text-[9px] text-slate-500 block mt-0.5">{t.project}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
